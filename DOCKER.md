# Docker Guide for Next.js Application

This guide explains how to containerize and deploy your Next.js SaaS Dashboard using Docker.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Engine and Docker Compose)
- [Docker Hub account](https://hub.docker.com/) (free, for storing images)

## File Overview

```
├── Dockerfile           # Instructions to build the Docker image
├── .dockerignore        # Files to exclude from the image
├── docker-compose.yml   # Local development configuration
├── next.config.ts       # Updated with output: "standalone"
└── terraform/
    └── user-data.sh     # Updated to install Docker on EC2
```

## Understanding the Docker Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DOCKER WORKFLOW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LOCAL DEVELOPMENT                                                           │
│  ─────────────────                                                           │
│  1. Write code                                                               │
│  2. docker compose up --build                                                │
│  3. Test at http://localhost:3000                                            │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  BUILD & PUSH (One-time setup + each deployment)                            │
│  ──────────────────────────────────────────────                              │
│  1. docker build -t username/app:v1.0.0 .                                   │
│  2. docker push username/app:v1.0.0                                         │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  DEPLOY TO EC2                                                               │
│  ─────────────                                                               │
│  1. SSH into EC2                                                             │
│  2. ./deploy.sh username/app:v1.0.0                                          │
│  3. Container runs your app!                                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Step-by-Step Guide

### Step 1: Test Locally with Docker

```bash
# Build and run locally
docker compose up --build

# Access at http://localhost:3000

# Stop with Ctrl+C, or in another terminal:
docker compose down
```

### Step 2: Create Docker Hub Repository

1. Go to [hub.docker.com](https://hub.docker.com/)
2. Sign in or create account
3. Click "Create Repository"
4. Name it `my-saas-dashboard`
5. Keep it Public (or Private if you prefer)

### Step 3: Build the Production Image

```bash
# Log in to Docker Hub
docker login

# Build the image with your username
# Replace YOUR_DOCKERHUB_USERNAME with your actual username
docker build \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx \
  --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx \
  -t YOUR_DOCKERHUB_USERNAME/my-saas-dashboard:latest \
  -t YOUR_DOCKERHUB_USERNAME/my-saas-dashboard:v1.0.0 \
  .

# We create two tags:
# - :latest     - Always points to newest version
# - :v1.0.0     - Specific version (for rollbacks)
```

### Step 4: Push to Docker Hub

```bash
# Push both tags
docker push YOUR_DOCKERHUB_USERNAME/my-saas-dashboard:latest
docker push YOUR_DOCKERHUB_USERNAME/my-saas-dashboard:v1.0.0
```

### Step 5: Deploy to EC2

After running `terraform apply`:

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Deploy the container
cd /opt/app
./deploy.sh YOUR_DOCKERHUB_USERNAME/my-saas-dashboard:latest

# Check status
./status.sh

# View logs
./logs.sh
```

## Common Commands

### Local Development

```bash
# Start in foreground (see logs)
docker compose up

# Start in background
docker compose up -d

# Rebuild after code changes
docker compose up --build

# Stop containers
docker compose down

# View logs
docker compose logs -f

# Shell into running container
docker compose exec app sh
```

### Image Management

```bash
# List local images
docker images

# Remove an image
docker rmi image_name:tag

# Remove all unused images (free up space)
docker image prune -a

# See image layers and sizes
docker history image_name:tag
```

### Container Management

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop a container
docker stop container_name

# Remove a container
docker rm container_name

# View container logs
docker logs container_name
docker logs -f container_name  # Follow/stream

# Shell into running container
docker exec -it container_name sh
```

## Versioning Strategy

Use semantic versioning for your images:

```bash
# Format: major.minor.patch
# - major: Breaking changes
# - minor: New features (backwards compatible)
# - patch: Bug fixes

# Examples:
docker build -t user/app:v1.0.0 .   # Initial release
docker build -t user/app:v1.0.1 .   # Bug fix
docker build -t user/app:v1.1.0 .   # New feature
docker build -t user/app:v2.0.0 .   # Breaking change

# Always also tag as :latest
docker build -t user/app:latest -t user/app:v1.2.0 .
```

## Rollback Procedure

If a deployment has issues:

```bash
# On EC2
cd /opt/app

# Deploy previous version
./deploy.sh YOUR_DOCKERHUB_USERNAME/my-saas-dashboard:v1.0.0

# Or any specific version you need
./deploy.sh YOUR_DOCKERHUB_USERNAME/my-saas-dashboard:v0.9.5
```

## Multi-Stage Build Explained

Our Dockerfile uses multi-stage builds:

```
Stage 1: deps      → Install npm dependencies
         ↓
Stage 2: builder   → Build Next.js application
         ↓
Stage 3: runner    → Minimal production image

Result: ~150MB image instead of ~1GB+
```

Each stage starts fresh. Only the files we explicitly COPY from previous stages are included. This keeps the final image small and secure.

## Environment Variables

**Build-time variables** (embedded in JavaScript):
- `NEXT_PUBLIC_*` variables
- Passed with `--build-arg`
- Cannot be changed without rebuilding

**Runtime variables** (used by server):
- `CLERK_SECRET_KEY`, `DATABASE_URL`, etc.
- Passed via `--env-file` or `-e`
- Can be changed by restarting container

```bash
# Build-time (public, embedded)
docker build --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx .

# Runtime (secret, not in image)
docker run --env-file .env my-app
```

## Troubleshooting

### Build Fails

```bash
# Check for errors in output
docker build . 2>&1 | tee build.log

# Build without cache (fresh start)
docker build --no-cache .

# Check .dockerignore isn't excluding needed files
cat .dockerignore
```

### Container Won't Start

```bash
# Check logs
docker logs container_name

# Run interactively to see errors
docker run -it --env-file .env image_name sh

# Check if port is already in use
lsof -i :3000
```

### Image Too Large

```bash
# Check what's taking space
docker history image_name:tag

# Ensure .dockerignore excludes:
# - node_modules
# - .git
# - .next (local build)
```

### "standalone" Output Not Working

Ensure `next.config.ts` has:
```typescript
const nextConfig = {
  output: "standalone",
};
```

Then rebuild the image.

## Security Best Practices

1. **Never include secrets in images**
   - Use `--env-file` at runtime
   - Check: `docker history image_name` shouldn't show secrets

2. **Use specific version tags**
   - Not just `:latest` in production
   - Allows reliable rollbacks

3. **Run as non-root user**
   - Our Dockerfile creates a `nextjs` user
   - Container runs as this user, not root

4. **Keep images updated**
   - Rebuild periodically to get security patches
   - Update base image (`node:20-alpine`)

5. **Scan for vulnerabilities**
   ```bash
   docker scout cves image_name:tag
   ```
