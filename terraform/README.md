# Terraform AWS Deployment (Docker + ECR)

Deploy your Next.js SaaS Dashboard to AWS EC2 using Docker containers and AWS ECR (Elastic Container Registry).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         YOUR LOCAL MACHINE                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌───────────────────────────────┐    │
│  │ Source Code │───▶│ Docker Build│───▶│ Push to AWS ECR               │    │
│  └─────────────┘    └─────────────┘    └───────────────┬───────────────┘    │
└──────────────────────────────────────────────────────────┼──────────────────┘
                                                           │
                              ┌─────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AWS CLOUD                                       │
│                                                                              │
│  ┌──────────────────────┐         ┌────────────────────────────────────┐   │
│  │    AWS ECR           │         │         EC2 INSTANCE               │   │
│  │ (Container Registry) │◀────────│  ┌──────────────────────────────┐  │   │
│  │                      │  Pull   │  │      Docker Container        │  │   │
│  │  your-app:v1.0.0    │  Image  │  │    (your Next.js app)        │  │   │
│  │  your-app:latest    │─────────▶│  │         port 3000            │  │   │
│  └──────────────────────┘         │  └──────────────────────────────┘  │   │
│                                   │                 ▲                   │   │
│  ┌──────────────────────┐         │                 │                   │   │
│  │      IAM Role        │         │  ┌──────────────┴───────────────┐  │   │
│  │  (ECR Pull Access)   │─────────│  │         Nginx                │  │   │
│  └──────────────────────┘         │  │     (Reverse Proxy)          │  │   │
│                                   │  │      ports 80/443            │  │   │
│                                   │  └──────────────────────────────┘  │   │
│                                   └───────────────┬────────────────────┘   │
│                                                   │                         │
│                                          ┌────────┴────────┐                │
│                                          │   Elastic IP    │                │
│                                          │ (Static Public) │                │
│                                          └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Why ECR Instead of Docker Hub?

| Feature | Docker Hub | AWS ECR |
|---------|------------|---------|
| **Authentication** | Username/password | IAM role (no passwords!) |
| **Pull Speed** | Internet round-trip | Same AWS region (faster) |
| **Rate Limits** | 100-200 pulls/6hrs | Unlimited |
| **Data Transfer** | Charged | Free within same region |
| **Security** | Manual credential management | IAM-based, auto-rotating |
| **Integration** | Separate service | Native AWS integration |

## Prerequisites

1. **AWS Account** - [Sign up here](https://aws.amazon.com/)
2. **AWS CLI** - [Installation guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
3. **Terraform** - [Download here](https://developer.hashicorp.com/terraform/downloads)
4. **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)

## File Structure

```
my-saas-dashboard/
├── Dockerfile              # Multi-stage build for Next.js
├── .dockerignore           # Files excluded from Docker build
├── docker-compose.yml      # Local development with Docker
├── scripts/
│   ├── push-to-ecr.sh      # Push script (Mac/Linux)
│   └── push-to-ecr.ps1     # Push script (Windows PowerShell)
│
└── terraform/
    ├── main.tf             # Provider, EC2 instance, Elastic IP
    ├── variables.tf        # Input variable definitions
    ├── outputs.tf          # Output values (IP, ECR URL, commands)
    ├── security-groups.tf  # Firewall rules
    ├── ecr.tf              # ECR repository & lifecycle policy
    ├── iam.tf              # IAM role for EC2 to access ECR
    ├── user-data.sh        # Bootstrap script (Docker, AWS CLI, ECR login)
    └── terraform.tfvars.example
```

## Complete Deployment Guide

### Phase 1: Setup AWS & Terraform

#### Step 1.1: Configure AWS CLI

```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)

#### Step 1.2: Create AWS Key Pair

1. Go to [AWS Console > EC2 > Key Pairs](https://console.aws.amazon.com/ec2/v2/home#KeyPairs:)
2. Click **Create key pair**
3. Name: `my-saas-dashboard-key`
4. Format: `.pem`
5. Download and secure the file:

```powershell
# Windows PowerShell
icacls my-saas-dashboard-key.pem /inheritance:r /grant:r "$($env:USERNAME):R"
```

```bash
# Mac/Linux
chmod 400 my-saas-dashboard-key.pem
```

#### Step 1.3: Configure Terraform Variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
key_pair_name          = "my-saas-dashboard-key"
clerk_secret_key       = "sk_live_..."
clerk_publishable_key  = "pk_live_..."
database_url           = "postgresql://..."
stripe_secret_key      = "sk_live_..."
stripe_publishable_key = "pk_live_..."
allowed_ssh_cidr       = "YOUR.IP.ADDRESS/32"  # curl ifconfig.me
```

#### Step 1.4: Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Create infrastructure (ECR, EC2, IAM, etc.)
terraform apply
```

Wait for completion (~3-5 minutes). Note the outputs - you'll need them.

### Phase 2: Push Docker Image to ECR

#### Option A: Use Helper Script (Recommended)

```powershell
# Windows PowerShell
.\scripts\push-to-ecr.ps1 v1.0.0
```

```bash
# Mac/Linux
chmod +x scripts/push-to-ecr.sh
./scripts/push-to-ecr.sh v1.0.0
```

#### Option B: Manual Commands

```bash
# 1. Get ECR login command from Terraform
terraform output ecr_login_command

# 2. Run the login command (copy from output)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# 3. Build image
docker build \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx \
  --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx \
  -t $(terraform output -raw ecr_repository_url):v1.0.0 \
  .

# 4. Push to ECR
docker push $(terraform output -raw ecr_repository_url):v1.0.0
```

### Phase 3: Deploy on EC2

#### Step 3.1: SSH into EC2

```bash
ssh -i my-saas-dashboard-key.pem ubuntu@$(terraform output -raw elastic_ip)
```

#### Step 3.2: Check Setup Progress

```bash
# Watch the setup log (wait until complete)
sudo tail -f /var/log/user-data.log
```

#### Step 3.3: Deploy the Container

```bash
cd /opt/app

# Deploy your image
./deploy.sh v1.0.0

# Verify
./status.sh
```

#### Step 3.4: Access Your App

```
http://YOUR_EC2_IP
```

## Updating Your Application

When you make code changes:

```powershell
# 1. Build and push new version
.\scripts\push-to-ecr.ps1 v1.1.0

# 2. SSH and deploy
ssh -i key.pem ubuntu@EC2_IP
cd /opt/app
./deploy.sh v1.1.0
```

## Helper Scripts on EC2

| Script | Purpose |
|--------|---------|
| `./deploy.sh v1.0.0` | Deploy specific version |
| `./deploy.sh latest` | Deploy latest tag |
| `./deploy.sh --list` | List available versions in ECR |
| `./rollback.sh v1.0.0` | Rollback to previous version |
| `./status.sh` | Show container status & resource usage |
| `./logs.sh` | Follow container logs |
| `./ecr-login.sh` | Manually refresh ECR login |

## ECR Lifecycle Policy

The ECR repository automatically:
- Keeps the last 10 tagged versions (`v1.0.0`, `v1.1.0`, etc.)
- Deletes untagged images after 1 day
- Keeps only 3 `latest`-tagged images

This prevents storage costs from growing indefinitely.

## Custom Domain & SSL

### 1. Point Domain to EC2

In your DNS provider, add an A record:
```
app.yourdomain.com  →  YOUR_EC2_IP
```

### 2. Install SSL Certificate

```bash
ssh -i key.pem ubuntu@EC2_IP
sudo certbot --nginx -d app.yourdomain.com
```

## Troubleshooting

### Check EC2 Setup Logs
```bash
sudo cat /var/log/user-data.log
sudo cat /var/log/cloud-init-output.log
```

### ECR Login Issues
```bash
# Manually refresh ECR login
./ecr-login.sh

# Check if IAM role is attached
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/
```

### Container Won't Start
```bash
cd /opt/app
docker compose logs
cat .env  # Verify environment variables
```

### List Images in ECR
```bash
./deploy.sh --list
# or
aws ecr list-images --repository-name my-saas-dashboard
```

## Cost Estimate

| Resource | Monthly Cost |
|----------|--------------|
| t3.small EC2 | ~$15 |
| 20 GB EBS | ~$2 |
| ECR storage (~1GB) | ~$0.10 |
| Elastic IP | Free (attached) |
| Data transfer | ~$0-5 |
| **Total** | **~$17-23/month** |

## Security Features

- **IAM Role**: EC2 authenticates with ECR using IAM role (no stored credentials)
- **Private ECR**: Container images are private by default
- **IMDSv2**: Instance metadata requires tokens (prevents SSRF)
- **Security Groups**: Firewall rules limit network access
- **Auto-rotating Credentials**: ECR tokens refresh every 6 hours via cron

## Terraform Resources Created

| Resource | Description |
|----------|-------------|
| `aws_ecr_repository` | Container image storage |
| `aws_ecr_lifecycle_policy` | Auto-cleanup old images |
| `aws_iam_role` | Role for EC2 to access ECR |
| `aws_iam_role_policy` | ECR pull permissions |
| `aws_iam_instance_profile` | Attaches role to EC2 |
| `aws_instance` | EC2 virtual server |
| `aws_eip` | Static public IP |
| `aws_security_group` | Firewall rules |
