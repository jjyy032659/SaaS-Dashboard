terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # state is local for now — for a team setup you'd move this to S3 + DynamoDB lock
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "my-saas-dashboard/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-locks"
  # }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  # tag every resource automatically so it's easy to track costs by project
  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    }
  }
}

# pull info about the current AWS account (needed for ECR URL construction)
data "aws_caller_identity" "current" {}

# use the default VPC to keep networking simple
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# always grab the latest Ubuntu 22.04 LTS AMI so we don't have to update hardcoded IDs
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  # Canonical's official AWS account
  owners = ["099720109477"]
}

resource "aws_instance" "app_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.key_pair_name
  subnet_id     = data.aws_subnets.default.ids[0]

  vpc_security_group_ids = [aws_security_group.app_sg.id]

  # IAM profile lets the instance pull from ECR using temporary credentials —
  # no AWS keys stored on the server
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name = "${var.project_name}-${var.environment}-root-volume"
    }
  }

  # bootstrap script installs Docker + Nginx, writes docker-compose.yml,
  # and sets up deploy.sh for rolling updates
  user_data = base64encode(templatefile("${path.module}/user-data.sh", {
    project_name           = var.project_name
    clerk_secret_key       = var.clerk_secret_key
    clerk_publishable_key  = var.clerk_publishable_key
    database_url           = var.database_url
    stripe_secret_key      = var.stripe_secret_key
    stripe_publishable_key = var.stripe_publishable_key
    stripe_webhook_secret  = var.stripe_webhook_secret
    openai_api_key         = var.openai_api_key
    google_genai_api_key   = var.google_genai_api_key
    aws_region             = var.aws_region
    aws_account_id         = data.aws_caller_identity.current.account_id
    ecr_repository_url     = aws_ecr_repository.app.repository_url
  }))

  # force instance replacement if the bootstrap script changes
  user_data_replace_on_change = true

  # IMDSv2 — prevents SSRF attacks that could leak instance credentials
  metadata_options {
    http_tokens   = "required"
    http_endpoint = "enabled"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-server"
  }
}

# static IP so DNS records don't break when the instance restarts
resource "aws_eip" "app_eip" {
  instance   = aws_instance.app_server.id
  domain     = "vpc"
  depends_on = [aws_instance.app_server]

  tags = {
    Name = "${var.project_name}-${var.environment}-eip"
  }
}
