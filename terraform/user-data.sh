#!/bin/bash
# EC2 Bootstrap Script - Docker + ECR
# Full documentation: see terraform/README.md

set -ex
exec > >(tee /var/log/user-data.log) 2>&1

echo "=========================================="
echo "Starting EC2 Bootstrap (ECR)"
echo "=========================================="

# Variables from Terraform
AWS_REGION="${aws_region}"
AWS_ACCOUNT_ID="${aws_account_id}"
ECR_REPOSITORY_URL="${ecr_repository_url}"
PROJECT_NAME="${project_name}"

# System update
apt-get update && apt-get upgrade -y
apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release nginx certbot python3-certbot-nginx unzip jq

# Install AWS CLI v2
curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip && ./aws/install && rm -rf aws awscliv2.zip

# Install Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable docker && systemctl start docker
usermod -aG docker ubuntu

# Create app directory
mkdir -p /opt/app && chown ubuntu:ubuntu /opt/app

# ECR login script
cat > /opt/app/ecr-login.sh << 'EOF'
#!/bin/bash
set -e
ECR_REGISTRY="${aws_account_id}.dkr.ecr.${aws_region}.amazonaws.com"
aws ecr get-login-password --region ${aws_region} | docker login --username AWS --password-stdin $ECR_REGISTRY
EOF
chmod +x /opt/app/ecr-login.sh && chown ubuntu:ubuntu /opt/app/ecr-login.sh

# ECR login cron (refresh every 6 hours)
echo "0 */6 * * * root /opt/app/ecr-login.sh >> /var/log/ecr-login.log 2>&1" > /etc/cron.d/ecr-login
/opt/app/ecr-login.sh

# Environment file
cat > /opt/app/.env << 'EOF'
NODE_ENV=production
CLERK_SECRET_KEY=${clerk_secret_key}
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${clerk_publishable_key}
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
DATABASE_URL=${database_url}
STRIPE_SECRET_KEY=${stripe_secret_key}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${stripe_publishable_key}
STRIPE_WEBHOOK_SECRET=${stripe_webhook_secret}
OPENAI_API_KEY=${openai_api_key}
GOOGLE_GENAI_API_KEY=${google_genai_api_key}
EOF
chown ubuntu:ubuntu /opt/app/.env && chmod 600 /opt/app/.env

# Docker Compose file
cat > /opt/app/docker-compose.yml << 'EOF'
services:
  app:
    image: ${ecr_repository_url}:$${IMAGE_TAG:-latest}
    container_name: ${project_name}
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
EOF
chown ubuntu:ubuntu /opt/app/docker-compose.yml

# Deploy script
cat > /opt/app/deploy.sh << 'EOF'
#!/bin/bash
set -e
cd /opt/app
if [ "$1" == "--list" ]; then
    aws ecr list-images --repository-name ${project_name} --region ${aws_region} --query 'imageIds[*].imageTag' --output table
    exit 0
fi
IMAGE_TAG=$${1:-latest}
echo "Deploying: ${ecr_repository_url}:$IMAGE_TAG"
/opt/app/ecr-login.sh
docker pull "${ecr_repository_url}:$IMAGE_TAG"
docker compose down || true
export IMAGE_TAG=$IMAGE_TAG
docker compose up -d
sleep 5
docker compose ps
EOF
chmod +x /opt/app/deploy.sh && chown ubuntu:ubuntu /opt/app/deploy.sh

# Helper scripts
cat > /opt/app/logs.sh << 'EOF'
#!/bin/bash
cd /opt/app && docker compose logs -f
EOF
chmod +x /opt/app/logs.sh && chown ubuntu:ubuntu /opt/app/logs.sh

cat > /opt/app/status.sh << 'EOF'
#!/bin/bash
cd /opt/app
echo "=== Container Status ===" && docker compose ps
echo "=== Resource Usage ===" && docker stats --no-stream
EOF
chmod +x /opt/app/status.sh && chown ubuntu:ubuntu /opt/app/status.sh

# Nginx config
rm -f /etc/nginx/sites-enabled/default
cat > /etc/nginx/sites-available/${project_name} << 'EOF'
upstream app { server 127.0.0.1:3000; keepalive 64; }
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
ln -sf /etc/nginx/sites-available/${project_name} /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx && systemctl enable nginx

# Firewall
ufw default deny incoming && ufw default allow outgoing
ufw allow ssh && ufw allow http && ufw allow https && ufw allow 3000/tcp
ufw --force enable

# Docker log rotation
cat > /etc/docker/daemon.json << 'EOF'
{"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"}}
EOF
systemctl restart docker

echo "=========================================="
echo "Setup complete! ECR: ${ecr_repository_url}"
echo "=========================================="
