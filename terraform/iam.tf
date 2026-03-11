#===============================================================================
# IAM CONFIGURATION (iam.tf)
#===============================================================================
# IAM (Identity and Access Management) controls WHO can do WHAT in AWS.
#
# For our EC2 instance to pull images from ECR, it needs permission.
# Instead of storing AWS credentials on the server (insecure!), we use
# an "IAM Role" that the EC2 instance can assume.
#
# HOW IAM ROLES WORK WITH EC2:
# ─────────────────────────────
# 1. We create an IAM Role with specific permissions
# 2. We attach the role to the EC2 instance via an "Instance Profile"
# 3. The EC2 instance automatically gets temporary credentials
# 4. Applications on EC2 can use these credentials to access AWS services
#
# This is MUCH more secure than storing access keys because:
# - Credentials rotate automatically
# - No secrets to manage or accidentally leak
# - Permissions can be changed without modifying the instance
#
# KEY IAM CONCEPTS:
# ─────────────────────────────
# - Principal: WHO is taking action (user, service, role)
# - Action: WHAT they can do (ecr:GetImage, s3:GetObject)
# - Resource: WHICH resources they can act on (specific ECR repo, S3 bucket)
# - Policy: A document that defines permissions
# - Role: An identity that can be assumed by services (like EC2)
#===============================================================================

#-------------------------------------------------------------------------------
# IAM ROLE FOR EC2
#-------------------------------------------------------------------------------
# This role will be assumed by our EC2 instance.
# Think of it as a "hat" the EC2 instance wears that grants it permissions.
#-------------------------------------------------------------------------------
resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-${var.environment}-ec2-role"

  #-----------------------------------------------------------------------------
  # ASSUME ROLE POLICY (Trust Policy)
  #-----------------------------------------------------------------------------
  # This defines WHO can assume this role.
  # We allow the EC2 service to assume it.
  #
  # "AssumeRole" is like saying: "EC2 instances are allowed to wear this hat"
  #-----------------------------------------------------------------------------
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        # Sid = Statement ID (optional, for documentation)
        Sid    = "AllowEC2AssumeRole"
        Effect = "Allow"

        # Principal: Who can assume this role
        # "Service" means an AWS service (not a user)
        Principal = {
          Service = "ec2.amazonaws.com"
        }

        # Action: What the principal can do (assume this role)
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-ec2-role"
    Environment = var.environment
    Project     = var.project_name
  }
}

#-------------------------------------------------------------------------------
# IAM POLICY: ECR ACCESS
#-------------------------------------------------------------------------------
# This policy defines WHAT the role can do.
# We grant permission to pull images from our ECR repository.
#
# PRINCIPLE OF LEAST PRIVILEGE:
# Only grant the minimum permissions needed. Our EC2 instance only needs
# to PULL images, not push or delete them.
#-------------------------------------------------------------------------------
resource "aws_iam_role_policy" "ecr_access" {
  name = "${var.project_name}-${var.environment}-ecr-access"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        #-----------------------------------------------------------------------
        # STATEMENT 1: ECR Authentication
        #-----------------------------------------------------------------------
        # GetAuthorizationToken is needed to authenticate with ECR.
        # This is a global action (not specific to a repository).
        #-----------------------------------------------------------------------
        Sid    = "ECRAuthentication"
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        # "*" because this action doesn't apply to a specific resource
        Resource = "*"
      },
      {
        #-----------------------------------------------------------------------
        # STATEMENT 2: Pull Images from ECR
        #-----------------------------------------------------------------------
        # These actions allow pulling (downloading) images.
        # We restrict to our specific repository for security.
        #-----------------------------------------------------------------------
        Sid    = "ECRPullAccess"
        Effect = "Allow"
        Action = [
          # Required to pull images:
          "ecr:GetDownloadUrlForLayer",  # Get the URL to download image layers
          "ecr:BatchGetImage",            # Get image manifests
          "ecr:BatchCheckLayerAvailability", # Check if layers exist

          # Optional but useful:
          "ecr:DescribeRepositories",     # List repositories
          "ecr:DescribeImages",           # List images in repository
          "ecr:ListImages"                # List image tags
        ]
        # Only allow access to our specific repository
        Resource = aws_ecr_repository.app.arn
      }
    ]
  })
}

#-------------------------------------------------------------------------------
# IAM POLICY: CLOUDWATCH LOGS (Optional but recommended)
#-------------------------------------------------------------------------------
# Allows EC2 to send logs to CloudWatch for centralized logging.
# Useful for debugging without SSH access.
#-------------------------------------------------------------------------------
resource "aws_iam_role_policy" "cloudwatch_logs" {
  name = "${var.project_name}-${var.environment}-cloudwatch-logs"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CloudWatchLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"
      }
    ]
  })
}

#-------------------------------------------------------------------------------
# IAM INSTANCE PROFILE
#-------------------------------------------------------------------------------
# An Instance Profile is a "container" for an IAM Role that allows
# EC2 instances to assume the role.
#
# Why do we need this?
# EC2 instances can't directly assume IAM roles. They need an
# Instance Profile as an intermediary.
#
# Think of it like this:
# - IAM Role = The permissions themselves
# - Instance Profile = The way to attach permissions to EC2
#-------------------------------------------------------------------------------
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-${var.environment}-ec2-profile"
  role = aws_iam_role.ec2_role.name

  tags = {
    Name        = "${var.project_name}-${var.environment}-ec2-profile"
    Environment = var.environment
    Project     = var.project_name
  }
}

#===============================================================================
# IAM BEST PRACTICES
#===============================================================================
#
# 1. LEAST PRIVILEGE
#    Only grant permissions that are actually needed.
#    We only grant ECR pull, not push or delete.
#
# 2. USE ROLES, NOT KEYS
#    Never store AWS access keys on EC2 instances.
#    Use IAM roles instead - they're more secure and auto-rotate.
#
# 3. RESOURCE-SPECIFIC PERMISSIONS
#    Limit actions to specific resources when possible.
#    We restrict ECR access to our specific repository.
#
# 4. REVIEW REGULARLY
#    Periodically audit permissions to ensure they're still needed.
#
# 5. USE POLICY CONDITIONS (Advanced)
#    You can add conditions like:
#    - Only allow access from specific IP ranges
#    - Only during certain hours
#    - Only if MFA is used
#
#===============================================================================
#
# DEBUGGING IAM ISSUES:
# ─────────────────────────────
# If EC2 can't pull from ECR, check:
#
# 1. Is the instance profile attached?
#    aws ec2 describe-instances --instance-ids i-xxx
#
# 2. What permissions does the role have?
#    aws iam list-role-policies --role-name YOUR_ROLE_NAME
#
# 3. Test ECR authentication:
#    aws ecr get-login-password --region us-east-1
#
# 4. Check CloudTrail for denied actions:
#    AWS Console > CloudTrail > Event history
#
#===============================================================================
