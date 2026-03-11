#===============================================================================
# AWS ELASTIC CONTAINER REGISTRY (ecr.tf)
#===============================================================================
# ECR is AWS's managed Docker container registry service.
# Think of it as "Docker Hub, but inside AWS."
#
# WHY ECR OVER DOCKER HUB?
# ─────────────────────────
# 1. INTEGRATION: Native AWS integration with IAM authentication
# 2. SPEED: Same-region pulls are faster (no internet round-trip)
# 3. COST: No data transfer charges within the same region
# 4. SECURITY: Private by default, IAM-based access control
# 5. NO RATE LIMITS: Docker Hub limits pulls (100-200/6hrs free tier)
#
# HOW ECR WORKS:
# ─────────────────────────
# 1. You create a "repository" (like a Docker Hub repo)
# 2. You push images to it from your local machine
# 3. EC2 pulls images from it using IAM authentication
#
# ECR URL FORMAT:
# ─────────────────────────
# {account_id}.dkr.ecr.{region}.amazonaws.com/{repo_name}:{tag}
#
# Example:
# 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-saas-dashboard:v1.0.0
#===============================================================================

#-------------------------------------------------------------------------------
# ECR REPOSITORY
#-------------------------------------------------------------------------------
# This creates the container registry where your Docker images will be stored.
# One repository can hold multiple versions (tags) of the same image.
#-------------------------------------------------------------------------------
resource "aws_ecr_repository" "app" {
  # Repository name - this appears in the ECR URL
  name = var.project_name

  #-----------------------------------------------------------------------------
  # IMAGE TAG MUTABILITY
  #-----------------------------------------------------------------------------
  # Controls whether you can overwrite existing tags.
  #
  # MUTABLE (default):
  #   - You CAN push a new image with an existing tag (e.g., :latest)
  #   - Convenient for development
  #   - Risk: :latest might point to different images over time
  #
  # IMMUTABLE:
  #   - You CANNOT overwrite existing tags
  #   - Once :v1.0.0 is pushed, it's permanent
  #   - Better for production (guarantees what version you're running)
  #   - You can still push :v1.0.1, :v1.0.2, etc.
  #
  # We use MUTABLE to allow :latest updates, but you should use specific
  # version tags (v1.0.0, v1.0.1) for production deployments.
  #-----------------------------------------------------------------------------
  image_tag_mutability = "MUTABLE"

  #-----------------------------------------------------------------------------
  # IMAGE SCANNING
  #-----------------------------------------------------------------------------
  # ECR can automatically scan images for security vulnerabilities
  # when they're pushed. This uses the Clair scanning engine.
  #
  # Scans check for:
  # - Known CVEs (Common Vulnerabilities and Exposures)
  # - Outdated packages with security issues
  # - OS-level vulnerabilities
  #
  # Results appear in the AWS Console under the image details.
  #-----------------------------------------------------------------------------
  image_scanning_configuration {
    scan_on_push = true  # Automatically scan when image is pushed
  }

  #-----------------------------------------------------------------------------
  # ENCRYPTION
  #-----------------------------------------------------------------------------
  # ECR encrypts images at rest using AWS KMS (Key Management Service).
  # Default is AES-256 encryption managed by AWS.
  # You can also use your own KMS key for more control.
  #-----------------------------------------------------------------------------
  encryption_configuration {
    encryption_type = "AES256"  # AWS-managed encryption (free)
    # For custom KMS key:
    # encryption_type = "KMS"
    # kms_key = aws_kms_key.my_key.arn
  }

  #-----------------------------------------------------------------------------
  # FORCE DELETE
  #-----------------------------------------------------------------------------
  # By default, you can't delete a repository that contains images.
  # Setting this to true allows Terraform to delete the repository
  # even if it has images (during terraform destroy).
  #
  # WARNING: This will permanently delete all images!
  #-----------------------------------------------------------------------------
  force_delete = true  # Allow deletion even with images (for easy cleanup)

  tags = {
    Name        = "${var.project_name}-ecr"
    Environment = var.environment
    Project     = var.project_name
  }
}

#-------------------------------------------------------------------------------
# ECR LIFECYCLE POLICY
#-------------------------------------------------------------------------------
# Lifecycle policies automatically clean up old images to save storage costs.
# Without this, old images accumulate forever.
#
# POLICY RULES:
# Rules are evaluated in priority order (lower number = higher priority).
# When an image matches a rule, the specified action is taken.
#-------------------------------------------------------------------------------
resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  #-----------------------------------------------------------------------------
  # LIFECYCLE RULES (JSON format)
  #-----------------------------------------------------------------------------
  # This policy:
  # 1. Keeps the last 10 tagged images (v1.0.0, v1.0.1, etc.)
  # 2. Deletes untagged images older than 1 day
  #
  # Why delete untagged images?
  # When you push a new :latest, the old :latest becomes "untagged"
  # These pile up and waste storage space.
  #-----------------------------------------------------------------------------
  policy = jsonencode({
    rules = [
      {
        # Rule 1: Keep only the last 10 tagged images
        rulePriority = 1
        description  = "Keep last 10 tagged images"
        selection = {
          tagStatus     = "tagged"      # Apply to tagged images
          tagPrefixList = ["v"]         # Only tags starting with "v" (v1.0.0, v2.0.0)
          countType     = "imageCountMoreThan"
          countNumber   = 10            # Keep 10, delete older ones
        }
        action = {
          type = "expire"  # Delete matching images
        }
      },
      {
        # Rule 2: Delete untagged images after 1 day
        rulePriority = 2
        description  = "Delete untagged images older than 1 day"
        selection = {
          tagStatus   = "untagged"      # Apply to untagged images
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1               # Older than 1 day
        }
        action = {
          type = "expire"
        }
      },
      {
        # Rule 3: Keep "latest" tag but clean up old latest images
        rulePriority = 3
        description  = "Keep only 3 latest-tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["latest"]
          countType     = "imageCountMoreThan"
          countNumber   = 3
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

#===============================================================================
# DATA SOURCE: AWS CALLER IDENTITY
#===============================================================================
# This retrieves information about the current AWS account.
# We need the account ID to construct the ECR repository URL.
#===============================================================================
data "aws_caller_identity" "current" {}

#===============================================================================
# ECR CONCEPTS EXPLAINED
#===============================================================================
#
# REPOSITORY vs IMAGE vs TAG:
# ─────────────────────────────
# Repository: my-saas-dashboard (the container that holds images)
# Image:      The actual Docker image (identified by SHA256 digest)
# Tag:        A human-readable label pointing to an image (v1.0.0, latest)
#
# One image can have multiple tags:
#   my-saas-dashboard:v1.0.0  ─┐
#   my-saas-dashboard:latest  ─┴─► Same image (same SHA256)
#
# AUTHENTICATION:
# ─────────────────────────────
# ECR uses temporary tokens (valid for 12 hours).
# Get a token with: aws ecr get-login-password
# This is handled automatically by the scripts we'll create.
#
# PRICING:
# ─────────────────────────────
# Storage:      $0.10 per GB per month
# Data transfer: Free within same region, standard rates otherwise
#
# Example cost for a Next.js app:
#   - Image size: ~150MB
#   - 10 versions: ~1.5GB
#   - Monthly cost: ~$0.15
#
#===============================================================================
