#===============================================================================
# TERRAFORM VARIABLES FILE (variables.tf)
#===============================================================================
# This file defines all the input variables for our Terraform configuration.
# Variables make your infrastructure code reusable and configurable.
#
# HOW VARIABLES WORK:
# - You define variables here with optional defaults
# - You provide values in terraform.tfvars or via command line
# - Terraform uses these values when creating resources
#===============================================================================

#-------------------------------------------------------------------------------
# AWS PROFILE CONFIGURATION
#-------------------------------------------------------------------------------
# The AWS profile to use for authentication.
# Profiles are configured with: aws configure --profile <name>
# Credentials are stored in: ~/.aws/credentials
#
# This allows you to have multiple AWS accounts (e.g., different projects)
# and switch between them easily.
#-------------------------------------------------------------------------------
variable "aws_profile" {
  description = "AWS CLI profile name to use for authentication"
  type        = string
  default     = "saas-dashboard"
}

#-------------------------------------------------------------------------------
# AWS REGION CONFIGURATION
#-------------------------------------------------------------------------------
# The AWS region determines the physical location of your infrastructure.
# Choose a region close to your users for better latency.
#
# Common regions:
# - us-east-1      (N. Virginia - cheapest, most services)
# - us-west-2      (Oregon)
# - eu-west-1      (Ireland)
# - ap-southeast-1 (Singapore)
#-------------------------------------------------------------------------------
variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

#-------------------------------------------------------------------------------
# PROJECT NAMING
#-------------------------------------------------------------------------------
# This name is used as a prefix for all resources, making it easy to identify
# which resources belong to this project in the AWS Console.
#-------------------------------------------------------------------------------
variable "project_name" {
  description = "Name of the project - used as prefix for all resources"
  type        = string
  default     = "my-saas-dashboard"
}

#-------------------------------------------------------------------------------
# ENVIRONMENT
#-------------------------------------------------------------------------------
# Helps distinguish between different deployments (dev, staging, production).
# This is added as a tag to all resources for easy filtering.
#-------------------------------------------------------------------------------
variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "production"
}

#-------------------------------------------------------------------------------
# EC2 INSTANCE CONFIGURATION
#-------------------------------------------------------------------------------
# Instance type determines the CPU, memory, and network performance.
#
# Recommended for Next.js apps:
# - t3.micro  : 2 vCPU, 1 GB RAM  (free tier eligible, good for testing)
# - t3.small  : 2 vCPU, 2 GB RAM  (good for small apps)
# - t3.medium : 2 vCPU, 4 GB RAM  (recommended for production)
# - t3.large  : 2 vCPU, 8 GB RAM  (for high-traffic apps)
#
# The "t3" family uses burstable performance - you get a baseline CPU
# with the ability to burst higher when needed.
#-------------------------------------------------------------------------------
variable "instance_type" {
  description = "EC2 instance type - determines CPU, memory, and cost"
  type        = string
  default     = "t3.small" # 2 vCPU, 2 GB RAM - ~$15/month
}

#-------------------------------------------------------------------------------
# SSH KEY PAIR
#-------------------------------------------------------------------------------
# IMPORTANT: You must create this key pair in AWS BEFORE running Terraform!
#
# To create a key pair:
# 1. Go to AWS Console > EC2 > Key Pairs
# 2. Click "Create key pair"
# 3. Name it (e.g., "my-saas-dashboard-key")
# 4. Choose .pem format (for Mac/Linux) or .ppk (for Windows/PuTTY)
# 5. Download and save the private key securely
#
# This key is used to SSH into your EC2 instance:
#   ssh -i "your-key.pem" ubuntu@your-ec2-ip
#-------------------------------------------------------------------------------
variable "key_pair_name" {
  description = "Name of the AWS key pair for SSH access (must exist in AWS)"
  type        = string
  # No default - you MUST provide this value
}

#-------------------------------------------------------------------------------
# APPLICATION ENVIRONMENT VARIABLES
#-------------------------------------------------------------------------------
# These are the secrets your Next.js app needs to run.
# They will be passed to the EC2 instance and set as environment variables.
#
# SECURITY NOTE:
# - Never commit actual values to git!
# - Use terraform.tfvars (add to .gitignore) or environment variables
# - In production, consider using AWS Secrets Manager instead
#-------------------------------------------------------------------------------

variable "clerk_secret_key" {
  description = "Clerk authentication secret key (from Clerk dashboard)"
  type        = string
  sensitive   = true # Marks this as sensitive - won't show in logs
}

variable "clerk_publishable_key" {
  description = "Clerk publishable key (from Clerk dashboard)"
  type        = string
  sensitive   = true
}

variable "database_url" {
  description = "PostgreSQL connection string (e.g., from Neon or Vercel Postgres)"
  type        = string
  sensitive   = true
}

variable "stripe_secret_key" {
  description = "Stripe secret key for payment processing"
  type        = string
  sensitive   = true
}

variable "stripe_publishable_key" {
  description = "Stripe publishable key for client-side"
  type        = string
  sensitive   = true
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook signing secret"
  type        = string
  sensitive   = true
  default     = "" # Optional - only needed if using webhooks
}

variable "openai_api_key" {
  description = "OpenAI API key for AI features"
  type        = string
  sensitive   = true
  default     = "" # Optional
}

variable "google_genai_api_key" {
  description = "Google GenAI API key"
  type        = string
  sensitive   = true
  default     = "" # Optional
}

#-------------------------------------------------------------------------------
# NETWORK CONFIGURATION
#-------------------------------------------------------------------------------
# allowed_ssh_cidr controls which IP addresses can SSH into your instance.
#
# SECURITY BEST PRACTICES:
# - NEVER use "0.0.0.0/0" in production (allows SSH from anywhere!)
# - Restrict to your IP: "YOUR.IP.ADDRESS/32"
# - For a range: "192.168.1.0/24" (allows 192.168.1.0 - 192.168.1.255)
#
# Find your IP: curl ifconfig.me
#-------------------------------------------------------------------------------
variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH (e.g., 'YOUR.IP/32' for just your IP)"
  type        = string
  default     = "0.0.0.0/0" # WARNING: Open to all - restrict in production!
}

#-------------------------------------------------------------------------------
# VOLUME CONFIGURATION
#-------------------------------------------------------------------------------
# EBS (Elastic Block Store) volume is the disk attached to your EC2 instance.
# This is where your OS, application code, and any local files are stored.
#-------------------------------------------------------------------------------
variable "root_volume_size" {
  description = "Size of the root EBS volume in GB"
  type        = number
  default     = 20 # 20 GB is usually enough for a Next.js app
}
