output "elastic_ip" {
  description = "Static public IP of the EC2 instance"
  value       = aws_eip.app_eip.public_ip
}

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.app_server.id
}

output "ssh_connection" {
  description = "SSH command to connect"
  value       = "ssh -i YOUR_KEY.pem ubuntu@${aws_eip.app_eip.public_ip}"
}

output "app_url" {
  description = "App URL via Nginx"
  value       = "http://${aws_eip.app_eip.public_ip}"
}

output "ecr_repository_url" {
  description = "ECR repository URL — used in CD pipeline and deploy.sh"
  value       = aws_ecr_repository.app.repository_url
}

output "ecr_repository_name" {
  value = aws_ecr_repository.app.name
}

output "aws_account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "ecr_login_command" {
  description = "Authenticate Docker with ECR"
  value       = "aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
}
