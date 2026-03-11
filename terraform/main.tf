#===============================================================================
# MAIN TERRAFORM CONFIGURATION (main.tf)
#===============================================================================
# This is the primary Terraform file that defines:
# 1. Terraform settings and required providers
# 2. AWS provider configuration
# 3. Data sources (existing AWS resources we reference)
# 4. EC2 instance and related resources
#
# TERRAFORM WORKFLOW:
# 1. terraform init    - Download providers and initialize
# 2. terraform plan    - Preview what will be created/changed
# 3. terraform apply   - Create/update the infrastructure
# 4. terraform destroy - Delete all resources (be careful!)
#===============================================================================

#-------------------------------------------------------------------------------
# TERRAFORM SETTINGS
#-------------------------------------------------------------------------------
# This block configures Terraform itself, not AWS.
# It specifies which version of Terraform and providers are required.
#-------------------------------------------------------------------------------
terraform {
  # Minimum Terraform version required
  # We use >= to allow newer versions
  required_version = ">= 1.0.0"

  # Required providers and their versions
  required_providers {
    aws = {
      source  = "hashicorp/aws"  # Official AWS provider from HashiCorp
      version = "~> 5.0"         # Use version 5.x (any 5.x version)
    }
  }

  #-----------------------------------------------------------------------------
  # BACKEND CONFIGURATION (State Storage)
  #-----------------------------------------------------------------------------
  # Terraform tracks your infrastructure in a "state file" (terraform.tfstate).
  # By default, this is stored locally, which works for learning.
  #
  # For production/team use, you should use a remote backend like S3:
  #
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "my-saas-dashboard/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-locks"  # For state locking
  # }
  #
  # Benefits of remote backend:
  # - Team members can share state
  # - State is backed up
  # - State locking prevents conflicts
  #-----------------------------------------------------------------------------
}

#-------------------------------------------------------------------------------
# AWS PROVIDER CONFIGURATION
#-------------------------------------------------------------------------------
# The provider is the plugin that lets Terraform talk to AWS.
# It needs credentials to authenticate with your AWS account.
#
# AUTHENTICATION OPTIONS (in order of precedence):
# 1. Environment variables: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
# 2. Shared credentials file: ~/.aws/credentials
# 3. IAM role (if running on EC2 or ECS)
# 4. Hardcoded in provider block (NEVER do this!)
#
# RECOMMENDED: Use AWS CLI to configure credentials:
#   aws configure
# This creates ~/.aws/credentials with your keys.
#-------------------------------------------------------------------------------
provider "aws" {
  region = var.aws_region

  #-----------------------------------------------------------------------------
  # AWS PROFILE
  #-----------------------------------------------------------------------------
  # This tells Terraform which AWS credentials profile to use.
  # Profiles are stored in ~/.aws/credentials
  #
  # If you have multiple AWS accounts (different projects), you can switch
  # between them by changing this profile name.
  #
  # To create a profile: aws configure --profile saas-dashboard
  #-----------------------------------------------------------------------------
  profile = var.aws_profile

  # Default tags applied to ALL resources created by this provider
  # This ensures consistent tagging without repeating in every resource
  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    }
  }
}

#===============================================================================
# DATA SOURCES
#===============================================================================
# Data sources let you fetch information about existing AWS resources.
# Unlike "resource" blocks, they don't create anything - just read data.
# This is useful for referencing things that already exist in AWS.
#===============================================================================

#-------------------------------------------------------------------------------
# DEFAULT VPC
#-------------------------------------------------------------------------------
# A VPC (Virtual Private Cloud) is an isolated network within AWS.
# Every AWS account has a "default VPC" in each region.
# We'll use this default VPC to keep things simple.
#
# In production, you might create a custom VPC with public/private subnets.
#-------------------------------------------------------------------------------
data "aws_vpc" "default" {
  default = true  # Find the default VPC
}

#-------------------------------------------------------------------------------
# DEFAULT SUBNETS
#-------------------------------------------------------------------------------
# Subnets divide your VPC into smaller network segments.
# EC2 instances must be launched in a subnet.
# Default VPC has public subnets in each Availability Zone.
#-------------------------------------------------------------------------------
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

#-------------------------------------------------------------------------------
# UBUNTU AMI (Amazon Machine Image)
#-------------------------------------------------------------------------------
# An AMI is a template that contains the OS and software for your instance.
# We're using Ubuntu 22.04 LTS (Long Term Support) - stable and well-supported.
#
# This data source dynamically finds the latest Ubuntu AMI so you don't
# have to hardcode AMI IDs (which differ by region and change over time).
#-------------------------------------------------------------------------------
data "aws_ami" "ubuntu" {
  most_recent = true  # Get the newest matching AMI

  # Filter by AMI name pattern
  # Ubuntu AMIs follow this naming convention
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  # Filter by virtualization type
  # HVM (Hardware Virtual Machine) is the modern, recommended type
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  # Only use AMIs published by Canonical (Ubuntu's official publisher)
  # This is the official Canonical AWS account ID
  owners = ["099720109477"]
}

#===============================================================================
# EC2 INSTANCE
#===============================================================================
# This is the main compute resource - your virtual server in the cloud.
# It will run your Next.js application.
#===============================================================================
resource "aws_instance" "app_server" {
  #-----------------------------------------------------------------------------
  # BASIC CONFIGURATION
  #-----------------------------------------------------------------------------

  # AMI - The operating system image
  ami           = data.aws_ami.ubuntu.id

  # Instance type - The hardware configuration (CPU, RAM)
  instance_type = var.instance_type

  # SSH key pair - For secure remote access
  key_name      = var.key_pair_name

  # Subnet - Where to launch the instance
  # We use the first available subnet from the default VPC
  subnet_id     = data.aws_subnets.default.ids[0]

  # Security groups - Firewall rules
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  #-----------------------------------------------------------------------------
  # IAM INSTANCE PROFILE (For ECR Access)
  #-----------------------------------------------------------------------------
  # This attaches the IAM role to the EC2 instance.
  # With this, the instance can pull images from ECR without storing
  # any AWS credentials on the server.
  #
  # The instance automatically gets temporary credentials that rotate.
  # Much more secure than storing access keys!
  #-----------------------------------------------------------------------------
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  #-----------------------------------------------------------------------------
  # STORAGE CONFIGURATION (ROOT VOLUME)
  #-----------------------------------------------------------------------------
  # The root volume is the primary disk where the OS is installed.
  # This is EBS (Elastic Block Store) - persistent, network-attached storage.
  #-----------------------------------------------------------------------------
  root_block_device {
    volume_size           = var.root_volume_size  # Size in GB
    volume_type           = "gp3"                  # General Purpose SSD (latest gen)
    delete_on_termination = true                   # Delete disk when instance is terminated
    encrypted             = true                   # Encrypt data at rest

    tags = {
      Name = "${var.project_name}-${var.environment}-root-volume"
    }
  }

  #-----------------------------------------------------------------------------
  # USER DATA (BOOTSTRAP SCRIPT)
  #-----------------------------------------------------------------------------
  # User data is a script that runs automatically when the instance first boots.
  # We use it to:
  # - Install Node.js, PM2, Nginx
  # - Set up the application
  # - Configure environment variables
  #
  # The templatefile() function reads user-data.sh and replaces variables.
  # base64encode() encodes the script for safe transmission.
  #-----------------------------------------------------------------------------
  user_data = base64encode(templatefile("${path.module}/user-data.sh", {
    # These variables are passed to the user-data.sh script
    project_name           = var.project_name
    clerk_secret_key       = var.clerk_secret_key
    clerk_publishable_key  = var.clerk_publishable_key
    database_url           = var.database_url
    stripe_secret_key      = var.stripe_secret_key
    stripe_publishable_key = var.stripe_publishable_key
    stripe_webhook_secret  = var.stripe_webhook_secret
    openai_api_key         = var.openai_api_key
    google_genai_api_key   = var.google_genai_api_key

    # ECR Configuration - passed to user-data.sh for Docker/ECR setup
    aws_region             = var.aws_region
    aws_account_id         = data.aws_caller_identity.current.account_id
    ecr_repository_url     = aws_ecr_repository.app.repository_url
  }))

  # Recreate instance if user data changes
  # This ensures a fresh setup if you modify the bootstrap script
  user_data_replace_on_change = true

  #-----------------------------------------------------------------------------
  # METADATA OPTIONS
  #-----------------------------------------------------------------------------
  # IMDSv2 (Instance Metadata Service v2) is a security best practice.
  # It requires tokens for metadata requests, preventing SSRF attacks.
  #-----------------------------------------------------------------------------
  metadata_options {
    http_tokens   = "required"  # Require IMDSv2 tokens
    http_endpoint = "enabled"   # Enable metadata endpoint
  }

  #-----------------------------------------------------------------------------
  # TAGS
  #-----------------------------------------------------------------------------
  tags = {
    Name = "${var.project_name}-${var.environment}-server"
  }
}

#===============================================================================
# ELASTIC IP
#===============================================================================
# An Elastic IP (EIP) is a static, public IPv4 address.
#
# Why use an Elastic IP?
# - Normal EC2 public IPs change when you stop/start the instance
# - Elastic IPs stay the same - important for DNS records
# - You can reassign an EIP to a different instance if needed
#
# NOTE: Elastic IPs are free when attached to a running instance.
# You're charged if the IP is not attached to anything.
#===============================================================================
resource "aws_eip" "app_eip" {
  # Associate with our EC2 instance
  instance = aws_instance.app_server.id

  # EIP must be in a VPC (not EC2-Classic, which is deprecated)
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-${var.environment}-eip"
  }

  # Ensure the instance exists before creating the EIP
  depends_on = [aws_instance.app_server]
}

#===============================================================================
# RESOURCE DEPENDENCIES
#===============================================================================
# Terraform automatically determines the order to create resources based on
# references between them. For example:
#
# 1. VPC data source is queried first
# 2. Security group is created (needs VPC ID)
# 3. EC2 instance is created (needs security group)
# 4. Elastic IP is created (needs EC2 instance)
#
# You can use "depends_on" for explicit dependencies not inferred from references.
#===============================================================================
