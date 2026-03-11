#===============================================================================
# PUSH TO ECR SCRIPT (push-to-ecr.ps1) - Windows PowerShell Version
#===============================================================================
# This script builds your Docker image and pushes it to AWS ECR.
# Run this from your local Windows development machine.
#
# PREREQUISITES:
# 1. AWS CLI installed and configured (aws configure)
# 2. Docker Desktop installed and running
# 3. Terraform outputs available (run terraform apply first)
#
# USAGE:
#   .\scripts\push-to-ecr.ps1              # Push as :latest
#   .\scripts\push-to-ecr.ps1 v1.0.0       # Push with specific tag
#   .\scripts\push-to-ecr.ps1 -Info        # Show ECR info without pushing
#
# WHAT THIS SCRIPT DOES:
# 1. Gets ECR repository URL from Terraform output
# 2. Authenticates Docker with ECR
# 3. Builds the Docker image
# 4. Tags the image for ECR
# 5. Pushes the image to ECR
#===============================================================================

param(
    [Parameter(Position=0)]
    [string]$ImageTag = "latest",

    [switch]$Info,

    [string]$Profile = "saas-dashboard"  # AWS CLI profile to use
)

# Stop on first error
$ErrorActionPreference = "Stop"

#-------------------------------------------------------------------------------
# CONFIGURATION
#-------------------------------------------------------------------------------

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$TerraformDir = Join-Path $ProjectRoot "terraform"

#-------------------------------------------------------------------------------
# HELPER FUNCTIONS
#-------------------------------------------------------------------------------

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host ">>> $Message" -ForegroundColor Yellow
}

function Test-Prerequisites {
    Write-Step "Checking prerequisites..."

    # Check AWS CLI
    try {
        $null = Get-Command aws -ErrorAction Stop
    } catch {
        Write-Host "ERROR: AWS CLI is not installed" -ForegroundColor Red
        Write-Host "Install it from: https://aws.amazon.com/cli/"
        exit 1
    }

    # Check Docker
    try {
        $null = Get-Command docker -ErrorAction Stop
    } catch {
        Write-Host "ERROR: Docker is not installed" -ForegroundColor Red
        Write-Host "Install it from: https://www.docker.com/products/docker-desktop/"
        exit 1
    }

    # Check Docker is running
    try {
        $null = docker info 2>&1
    } catch {
        Write-Host "ERROR: Docker is not running" -ForegroundColor Red
        Write-Host "Please start Docker Desktop"
        exit 1
    }

    # Check AWS credentials
    try {
        $null = aws sts get-caller-identity --profile $Profile 2>&1
    } catch {
        Write-Host "ERROR: AWS credentials not configured for profile '$Profile'" -ForegroundColor Red
        Write-Host "Run: aws configure --profile $Profile"
        exit 1
    }

    Write-Host "All prerequisites satisfied!" -ForegroundColor Green
}

function Get-TerraformOutputs {
    Write-Step "Getting ECR info from Terraform..."

    if (-not (Test-Path $TerraformDir)) {
        Write-Host "ERROR: Terraform directory not found at $TerraformDir" -ForegroundColor Red
        exit 1
    }

    Push-Location $TerraformDir

    # Check if Terraform has been applied
    if (-not (Test-Path "terraform.tfstate")) {
        Write-Host "ERROR: Terraform state not found" -ForegroundColor Red
        Write-Host "Run 'terraform apply' first to create the ECR repository"
        Pop-Location
        exit 1
    }

    # Get outputs
    $script:AwsRegion = (terraform output -raw aws_region 2>$null)
    $script:AwsAccountId = (terraform output -raw aws_account_id 2>$null)
    $script:EcrRepositoryUrl = (terraform output -raw ecr_repository_url 2>$null)
    $script:EcrRepositoryName = (terraform output -raw ecr_repository_name 2>$null)

    Pop-Location

    if ([string]::IsNullOrEmpty($script:EcrRepositoryUrl)) {
        Write-Host "ERROR: Could not get ECR repository URL from Terraform" -ForegroundColor Red
        Write-Host "Make sure you've run 'terraform apply' successfully"
        exit 1
    }

    Write-Host "AWS Region: $script:AwsRegion"
    Write-Host "AWS Account: $script:AwsAccountId"
    Write-Host "ECR Repository: $script:EcrRepositoryUrl"
}

function Invoke-EcrLogin {
    Write-Step "Authenticating with ECR..."

    $EcrRegistry = "$script:AwsAccountId.dkr.ecr.$script:AwsRegion.amazonaws.com"

    # Get ECR login password and pipe to docker login
    # Using --profile to specify which AWS credentials to use
    $password = aws ecr get-login-password --region $script:AwsRegion --profile $Profile
    $password | docker login --username AWS --password-stdin $EcrRegistry

    Write-Host "ECR authentication successful!" -ForegroundColor Green
}

function Build-Image {
    Write-Step "Building Docker image..."

    Push-Location $ProjectRoot

    # Try to load env vars from .env file
    $ClerkKey = $env:NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    $StripeKey = $env:NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    if ([string]::IsNullOrEmpty($ClerkKey) -and (Test-Path ".env")) {
        $envContent = Get-Content ".env"
        foreach ($line in $envContent) {
            if ($line -match "^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=(.+)$") {
                $ClerkKey = $matches[1]
            }
            if ($line -match "^NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=(.+)$") {
                $StripeKey = $matches[1]
            }
        }
    }

    Write-Host "Building with:"
    Write-Host "  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: $($ClerkKey.Substring(0, [Math]::Min(20, $ClerkKey.Length)))..."
    Write-Host "  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: $($StripeKey.Substring(0, [Math]::Min(20, $StripeKey.Length)))..."

    # Build the image
    docker build `
        --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$ClerkKey" `
        --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="$StripeKey" `
        -t "$script:EcrRepositoryUrl`:$ImageTag" `
        -t "$script:EcrRepositoryUrl`:latest" `
        .

    Pop-Location

    Write-Host "Image built successfully!" -ForegroundColor Green
}

function Push-Image {
    Write-Step "Pushing image to ECR..."

    # Push the tagged version
    Write-Host "Pushing $script:EcrRepositoryUrl`:$ImageTag"
    docker push "$script:EcrRepositoryUrl`:$ImageTag"

    # Also push as latest (unless we're already pushing latest)
    if ($ImageTag -ne "latest") {
        Write-Host "Pushing $script:EcrRepositoryUrl`:latest"
        docker push "$script:EcrRepositoryUrl`:latest"
    }

    Write-Host "Image pushed successfully!" -ForegroundColor Green
}

function Show-Info {
    Write-Header "ECR INFORMATION"

    Get-TerraformOutputs

    Write-Host ""
    Write-Host "ECR Repository URL:"
    Write-Host "  $script:EcrRepositoryUrl" -ForegroundColor Green
    Write-Host ""
    Write-Host "To push an image manually:"
    Write-Host "  1. aws ecr get-login-password --region $script:AwsRegion | docker login --username AWS --password-stdin $script:AwsAccountId.dkr.ecr.$script:AwsRegion.amazonaws.com"
    Write-Host "  2. docker build -t $script:EcrRepositoryUrl`:v1.0.0 ."
    Write-Host "  3. docker push $script:EcrRepositoryUrl`:v1.0.0"
    Write-Host ""
    Write-Host "To list images in ECR:"
    Write-Host "  aws ecr list-images --repository-name $script:EcrRepositoryName --region $script:AwsRegion"
}

function Show-NextSteps {
    Write-Header "PUSH COMPLETE!"

    Write-Host ""
    Write-Host "Image pushed to: $script:EcrRepositoryUrl`:$ImageTag" -ForegroundColor Green
    Write-Host ""
    Write-Host "NEXT STEPS:"
    Write-Host ""
    Write-Host "1. SSH into your EC2 instance:"
    Write-Host "   ssh -i your-key.pem ubuntu@YOUR_EC2_IP" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Deploy the new image:"
    Write-Host "   cd /opt/app" -ForegroundColor Cyan
    Write-Host "   ./deploy.sh $ImageTag" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Verify deployment:"
    Write-Host "   ./status.sh" -ForegroundColor Cyan
    Write-Host ""
}

#-------------------------------------------------------------------------------
# MAIN
#-------------------------------------------------------------------------------

Write-Header "PUSH TO AWS ECR"

Write-Host "AWS Profile: $Profile"

if ($Info) {
    Show-Info
    exit 0
}

Write-Host "Image tag: $ImageTag"

Test-Prerequisites
Get-TerraformOutputs
Invoke-EcrLogin
Build-Image
Push-Image
Show-NextSteps
