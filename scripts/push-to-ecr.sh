#!/bin/bash
#===============================================================================
# PUSH TO ECR SCRIPT (push-to-ecr.sh)
#===============================================================================
# This script builds your Docker image and pushes it to AWS ECR.
# Run this from your local development machine.
#
# PREREQUISITES:
# 1. AWS CLI installed and configured (aws configure)
# 2. Docker installed and running
# 3. Terraform outputs available (or set variables manually)
#
# USAGE:
#   ./scripts/push-to-ecr.sh              # Push as :latest
#   ./scripts/push-to-ecr.sh v1.0.0       # Push with specific tag
#   ./scripts/push-to-ecr.sh --info       # Show ECR info without pushing
#
# ENVIRONMENT VARIABLES:
#   AWS_PROFILE=saas-dashboard  # Override the default profile
#
# WHAT THIS SCRIPT DOES:
# 1. Gets ECR repository URL from Terraform output
# 2. Authenticates Docker with ECR
# 3. Builds the Docker image
# 4. Tags the image for ECR
# 5. Pushes the image to ECR
#===============================================================================

set -e  # Exit on any error

#-------------------------------------------------------------------------------
# CONFIGURATION
#-------------------------------------------------------------------------------
# These can be overridden by environment variables

# AWS Profile to use (default: saas-dashboard)
export AWS_PROFILE="${AWS_PROFILE:-saas-dashboard}"

# Get the script's directory (works even when called from another directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT"

# Check if we're in the terraform directory or can access it
TERRAFORM_DIR="$PROJECT_ROOT/terraform"

#-------------------------------------------------------------------------------
# HELPER FUNCTIONS
#-------------------------------------------------------------------------------

print_header() {
    echo ""
    echo "=============================================="
    echo "$1"
    echo "=============================================="
}

print_step() {
    echo ""
    echo ">>> $1"
}

check_prerequisites() {
    print_step "Checking prerequisites..."

    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        echo "ERROR: AWS CLI is not installed"
        echo "Install it from: https://aws.amazon.com/cli/"
        exit 1
    fi

    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo "ERROR: Docker is not installed"
        echo "Install it from: https://www.docker.com/products/docker-desktop/"
        exit 1
    fi

    # Check Docker is running
    if ! docker info &> /dev/null; then
        echo "ERROR: Docker is not running"
        echo "Please start Docker Desktop"
        exit 1
    fi

    # Check AWS credentials for the specified profile
    if ! aws sts get-caller-identity &> /dev/null; then
        echo "ERROR: AWS credentials not configured for profile '$AWS_PROFILE'"
        echo "Run: aws configure --profile $AWS_PROFILE"
        exit 1
    fi

    echo "All prerequisites satisfied!"
}

get_terraform_outputs() {
    print_step "Getting ECR info from Terraform..."

    if [ ! -d "$TERRAFORM_DIR" ]; then
        echo "ERROR: Terraform directory not found at $TERRAFORM_DIR"
        exit 1
    fi

    cd "$TERRAFORM_DIR"

    # Check if Terraform has been applied
    if [ ! -f "terraform.tfstate" ]; then
        echo "ERROR: Terraform state not found"
        echo "Run 'terraform apply' first to create the ECR repository"
        exit 1
    fi

    # Get outputs
    AWS_REGION=$(terraform output -raw aws_region 2>/dev/null || echo "")
    AWS_ACCOUNT_ID=$(terraform output -raw aws_account_id 2>/dev/null || echo "")
    ECR_REPOSITORY_URL=$(terraform output -raw ecr_repository_url 2>/dev/null || echo "")
    ECR_REPOSITORY_NAME=$(terraform output -raw ecr_repository_name 2>/dev/null || echo "")

    if [ -z "$ECR_REPOSITORY_URL" ]; then
        echo "ERROR: Could not get ECR repository URL from Terraform"
        echo "Make sure you've run 'terraform apply' successfully"
        exit 1
    fi

    cd "$PROJECT_ROOT"

    echo "AWS Region: $AWS_REGION"
    echo "AWS Account: $AWS_ACCOUNT_ID"
    echo "ECR Repository: $ECR_REPOSITORY_URL"
}

ecr_login() {
    print_step "Authenticating with ECR..."

    # Get ECR login password and pipe to docker login
    aws ecr get-login-password --region "$AWS_REGION" | \
        docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

    echo "ECR authentication successful!"
}

build_image() {
    print_step "Building Docker image..."

    # Get build args from .env file or environment
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:-}"
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:-}"

    # Try to load from .env if not set
    if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ] && [ -f ".env" ]; then
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$(grep NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY .env 2>/dev/null | cut -d '=' -f2 || echo "")
    fi
    if [ -z "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" ] && [ -f ".env" ]; then
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$(grep NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY .env 2>/dev/null | cut -d '=' -f2 || echo "")
    fi

    echo "Building with:"
    echo "  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:0:20}..."
    echo "  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:0:20}..."

    # Build the image
    docker build \
        --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" \
        --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" \
        -t "$ECR_REPOSITORY_URL:$IMAGE_TAG" \
        -t "$ECR_REPOSITORY_URL:latest" \
        .

    echo "Image built successfully!"
}

push_image() {
    print_step "Pushing image to ECR..."

    # Push both tags
    echo "Pushing $ECR_REPOSITORY_URL:$IMAGE_TAG"
    docker push "$ECR_REPOSITORY_URL:$IMAGE_TAG"

    if [ "$IMAGE_TAG" != "latest" ]; then
        echo "Pushing $ECR_REPOSITORY_URL:latest"
        docker push "$ECR_REPOSITORY_URL:latest"
    fi

    echo "Image pushed successfully!"
}

show_info() {
    print_header "ECR INFORMATION"

    get_terraform_outputs

    echo ""
    echo "ECR Repository URL:"
    echo "  $ECR_REPOSITORY_URL"
    echo ""
    echo "To push an image manually:"
    echo "  1. aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
    echo "  2. docker build -t $ECR_REPOSITORY_URL:v1.0.0 ."
    echo "  3. docker push $ECR_REPOSITORY_URL:v1.0.0"
    echo ""
    echo "To list images in ECR:"
    echo "  aws ecr list-images --repository-name $ECR_REPOSITORY_NAME --region $AWS_REGION"
}

show_next_steps() {
    print_header "PUSH COMPLETE!"

    echo ""
    echo "Image pushed to: $ECR_REPOSITORY_URL:$IMAGE_TAG"
    echo ""
    echo "NEXT STEPS:"
    echo ""
    echo "1. SSH into your EC2 instance:"
    echo "   ssh -i your-key.pem ubuntu@YOUR_EC2_IP"
    echo ""
    echo "2. Deploy the new image:"
    echo "   cd /opt/app"
    echo "   ./deploy.sh $IMAGE_TAG"
    echo ""
    echo "3. Verify deployment:"
    echo "   ./status.sh"
    echo ""
}

#-------------------------------------------------------------------------------
# MAIN
#-------------------------------------------------------------------------------

print_header "PUSH TO AWS ECR"

echo "AWS Profile: $AWS_PROFILE"

# Parse arguments
if [ "$1" == "--info" ]; then
    show_info
    exit 0
fi

IMAGE_TAG="${1:-latest}"
echo "Image tag: $IMAGE_TAG"

# Run steps
check_prerequisites
get_terraform_outputs
ecr_login
build_image
push_image
show_next_steps
