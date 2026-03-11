#===============================================================================
# TERRAFORM OUTPUTS (outputs.tf)
#===============================================================================
# Outputs display important information after Terraform runs.
# They're shown at the end of "terraform apply" and can be queried with
# "terraform output" command.
#
# USES FOR OUTPUTS:
# 1. Display important info (IP addresses, URLs, etc.)
# 2. Pass values to other Terraform modules
# 3. Store values for scripts to read (terraform output -json)
# 4. Show connection instructions to the user
#
# QUERYING OUTPUTS:
#   terraform output                    # Show all outputs
#   terraform output elastic_ip         # Show specific output
#   terraform output -raw elastic_ip    # Show without quotes (for scripts)
#   terraform output -json              # Show as JSON
#===============================================================================

#===============================================================================
# EC2 INSTANCE OUTPUTS
#===============================================================================

#-------------------------------------------------------------------------------
# ELASTIC IP ADDRESS
#-------------------------------------------------------------------------------
output "elastic_ip" {
  description = "The Elastic IP address (static public IP) of the EC2 instance"
  value       = aws_eip.app_eip.public_ip
}

#-------------------------------------------------------------------------------
# INSTANCE PUBLIC DNS
#-------------------------------------------------------------------------------
output "instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.app_server.public_dns
}

#-------------------------------------------------------------------------------
# INSTANCE ID
#-------------------------------------------------------------------------------
output "instance_id" {
  description = "The ID of the EC2 instance"
  value       = aws_instance.app_server.id
}

#-------------------------------------------------------------------------------
# SSH CONNECTION COMMAND
#-------------------------------------------------------------------------------
output "ssh_connection" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i YOUR_KEY.pem ubuntu@${aws_eip.app_eip.public_ip}"
}

#-------------------------------------------------------------------------------
# APPLICATION URLS
#-------------------------------------------------------------------------------
output "app_url_direct" {
  description = "Direct URL to the Next.js app (port 3000)"
  value       = "http://${aws_eip.app_eip.public_ip}:3000"
}

output "app_url_nginx" {
  description = "URL through Nginx reverse proxy (port 80)"
  value       = "http://${aws_eip.app_eip.public_ip}"
}

#-------------------------------------------------------------------------------
# SECURITY GROUP ID
#-------------------------------------------------------------------------------
output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.app_sg.id
}

#-------------------------------------------------------------------------------
# AWS REGION & ACCOUNT
#-------------------------------------------------------------------------------
output "aws_region" {
  description = "AWS region where resources are deployed"
  value       = var.aws_region
}

output "aws_account_id" {
  description = "AWS account ID"
  value       = data.aws_caller_identity.current.account_id
}

#===============================================================================
# ECR (ELASTIC CONTAINER REGISTRY) OUTPUTS
#===============================================================================
# These outputs are used by the push-to-ecr.sh script to push images.
#===============================================================================

#-------------------------------------------------------------------------------
# ECR REPOSITORY URL
#-------------------------------------------------------------------------------
# The full URL of the ECR repository.
# Format: {account_id}.dkr.ecr.{region}.amazonaws.com/{repo_name}
#
# Use this URL when tagging and pushing Docker images:
#   docker tag myapp:latest {ecr_repository_url}:latest
#   docker push {ecr_repository_url}:latest
#-------------------------------------------------------------------------------
output "ecr_repository_url" {
  description = "ECR repository URL for Docker images"
  value       = aws_ecr_repository.app.repository_url
}

#-------------------------------------------------------------------------------
# ECR REPOSITORY NAME
#-------------------------------------------------------------------------------
# Just the repository name (without the registry URL).
# Used for AWS CLI commands like:
#   aws ecr list-images --repository-name {name}
#-------------------------------------------------------------------------------
output "ecr_repository_name" {
  description = "ECR repository name"
  value       = aws_ecr_repository.app.name
}

#-------------------------------------------------------------------------------
# ECR REPOSITORY ARN
#-------------------------------------------------------------------------------
# Amazon Resource Name - unique identifier for the repository.
# Used in IAM policies and for programmatic access.
#-------------------------------------------------------------------------------
output "ecr_repository_arn" {
  description = "ECR repository ARN"
  value       = aws_ecr_repository.app.arn
}

#-------------------------------------------------------------------------------
# ECR REGISTRY ID
#-------------------------------------------------------------------------------
# The AWS account ID that owns the registry.
# This is the same as your AWS account ID.
#-------------------------------------------------------------------------------
output "ecr_registry_id" {
  description = "ECR registry ID (AWS account ID)"
  value       = aws_ecr_repository.app.registry_id
}

#===============================================================================
# DOCKER COMMANDS
#===============================================================================
# Ready-to-use commands for common Docker operations with ECR.
#===============================================================================

#-------------------------------------------------------------------------------
# ECR LOGIN COMMAND
#-------------------------------------------------------------------------------
output "ecr_login_command" {
  description = "Command to authenticate Docker with ECR"
  value       = "aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
}

#-------------------------------------------------------------------------------
# DOCKER BUILD COMMAND
#-------------------------------------------------------------------------------
output "docker_build_command" {
  description = "Command to build and tag Docker image for ECR"
  value       = "docker build -t ${aws_ecr_repository.app.repository_url}:latest ."
}

#-------------------------------------------------------------------------------
# DOCKER PUSH COMMAND
#-------------------------------------------------------------------------------
output "docker_push_command" {
  description = "Command to push Docker image to ECR"
  value       = "docker push ${aws_ecr_repository.app.repository_url}:latest"
}

#===============================================================================
# DEPLOYMENT INSTRUCTIONS
#===============================================================================

output "next_steps" {
  description = "Instructions for after deployment"
  value       = <<-EOT

    ============================================================
    INFRASTRUCTURE DEPLOYED SUCCESSFULLY!
    ============================================================

    ECR Repository: ${aws_ecr_repository.app.repository_url}
    EC2 Instance:   ${aws_eip.app_eip.public_ip}

    ============================================================
    STEP 1: PUSH YOUR DOCKER IMAGE TO ECR
    ============================================================

    Option A - Use the helper script (recommended):

      # Windows PowerShell:
      .\scripts\push-to-ecr.ps1 v1.0.0

      # Mac/Linux:
      ./scripts/push-to-ecr.sh v1.0.0

    Option B - Manual commands:

      # 1. Login to ECR
      aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com

      # 2. Build image
      docker build -t ${aws_ecr_repository.app.repository_url}:v1.0.0 .

      # 3. Push image
      docker push ${aws_ecr_repository.app.repository_url}:v1.0.0

    ============================================================
    STEP 2: DEPLOY ON EC2
    ============================================================

    # SSH into your instance (wait 3-5 min for setup to complete)
    ssh -i YOUR_KEY.pem ubuntu@${aws_eip.app_eip.public_ip}

    # Check setup progress
    sudo tail -f /var/log/user-data.log

    # Deploy the container
    cd /opt/app
    ./deploy.sh v1.0.0

    ============================================================
    STEP 3: VERIFY
    ============================================================

    # On EC2:
    ./status.sh                    # Check container status
    ./logs.sh                      # View logs

    # Access your app:
    http://${aws_eip.app_eip.public_ip}

    ============================================================
    USEFUL COMMANDS ON EC2
    ============================================================

    ./deploy.sh v1.0.0            # Deploy specific version
    ./deploy.sh latest            # Deploy latest
    ./deploy.sh --list            # List available versions
    ./rollback.sh v1.0.0          # Rollback to previous version
    ./status.sh                   # Check container status
    ./logs.sh                     # View container logs

    ============================================================
  EOT
}
