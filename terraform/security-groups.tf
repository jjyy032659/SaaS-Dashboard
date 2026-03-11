#===============================================================================
# SECURITY GROUPS (security-groups.tf)
#===============================================================================
# Security Groups act as virtual firewalls for your EC2 instance.
# They control what traffic can come IN (ingress) and go OUT (egress).
#
# KEY CONCEPTS:
# - By default, all INBOUND traffic is BLOCKED
# - By default, all OUTBOUND traffic is ALLOWED
# - Rules are STATEFUL: if you allow inbound, the response is auto-allowed
# - You can have multiple security groups attached to one instance
#
# COMMON PORTS:
# - 22   : SSH (remote terminal access)
# - 80   : HTTP (unencrypted web traffic)
# - 443  : HTTPS (encrypted web traffic)
# - 3000 : Default Next.js development port
# - 5432 : PostgreSQL database
#===============================================================================

#-------------------------------------------------------------------------------
# MAIN APPLICATION SECURITY GROUP
#-------------------------------------------------------------------------------
# This security group defines all the firewall rules for our EC2 instance.
# We're creating one security group with multiple rules for simplicity.
#-------------------------------------------------------------------------------
resource "aws_security_group" "app_sg" {
  # Name that appears in AWS Console
  name        = "${var.project_name}-${var.environment}-sg"

  # Description helps you remember what this security group is for
  description = "Security group for ${var.project_name} - allows HTTP, HTTPS, and SSH"

  # VPC where this security group lives
  # Using default VPC (we reference it in main.tf)
  vpc_id      = data.aws_vpc.default.id

  #-----------------------------------------------------------------------------
  # INBOUND RULES (INGRESS)
  #-----------------------------------------------------------------------------
  # These rules control what traffic can reach your EC2 instance.
  #-----------------------------------------------------------------------------

  # RULE 1: SSH Access (Port 22)
  # ---------------------------------------------------------------------------
  # Allows you to connect to your server via SSH for administration.
  # Example: ssh -i key.pem ubuntu@your-ec2-ip
  #
  # SECURITY WARNING:
  # The default "0.0.0.0/0" allows SSH from ANYWHERE on the internet!
  # In production, change this to your specific IP address.
  # ---------------------------------------------------------------------------
  ingress {
    description = "SSH access for server administration"
    from_port   = 22        # Starting port
    to_port     = 22        # Ending port (same = single port)
    protocol    = "tcp"     # SSH uses TCP protocol
    cidr_blocks = [var.allowed_ssh_cidr]  # Who can connect
  }

  # RULE 2: HTTP Access (Port 80)
  # ---------------------------------------------------------------------------
  # Allows unencrypted web traffic.
  # Even if you use HTTPS, you need this for:
  # - HTTP to HTTPS redirects
  # - Let's Encrypt certificate verification
  # - Users who type your domain without "https://"
  # ---------------------------------------------------------------------------
  ingress {
    description = "HTTP traffic from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Allow from anywhere (public website)
  }

  # RULE 3: HTTPS Access (Port 443)
  # ---------------------------------------------------------------------------
  # Allows encrypted web traffic - this is what most users will use.
  # Your Nginx reverse proxy will handle SSL/TLS termination.
  # ---------------------------------------------------------------------------
  ingress {
    description = "HTTPS traffic from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Allow from anywhere (public website)
  }

  # RULE 4: Next.js Direct Access (Port 3000) - OPTIONAL
  # ---------------------------------------------------------------------------
  # Allows direct access to your Next.js app without going through Nginx.
  # Useful for:
  # - Initial testing before Nginx is configured
  # - Debugging
  #
  # In production, you might want to REMOVE this rule and only allow
  # traffic through Nginx (ports 80/443).
  # ---------------------------------------------------------------------------
  ingress {
    description = "Direct Next.js access (for testing)"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  #-----------------------------------------------------------------------------
  # OUTBOUND RULES (EGRESS)
  #-----------------------------------------------------------------------------
  # These rules control what traffic can LEAVE your EC2 instance.
  # Your app needs to make outbound connections for:
  # - npm install (download packages)
  # - API calls (Stripe, Clerk, OpenAI, your database)
  # - DNS resolution
  # - System updates
  #-----------------------------------------------------------------------------

  # Allow ALL outbound traffic
  # ---------------------------------------------------------------------------
  # This is the standard configuration for application servers.
  # Your app needs to connect to many external services.
  #
  # "0.0.0.0/0" means "any IPv4 address"
  # "::/0" means "any IPv6 address"
  # "-1" protocol means "all protocols" (TCP, UDP, ICMP, etc.)
  # ---------------------------------------------------------------------------
  egress {
    description      = "Allow all outbound traffic"
    from_port        = 0     # 0 means "all ports"
    to_port          = 0     # 0 means "all ports"
    protocol         = "-1"  # -1 means "all protocols"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  #-----------------------------------------------------------------------------
  # TAGS
  #-----------------------------------------------------------------------------
  # Tags are key-value pairs that help you organize and identify resources.
  # Good tagging practices help with:
  # - Cost allocation (which project is costing money?)
  # - Resource management (find all production resources)
  # - Automation (scripts can filter by tags)
  #-----------------------------------------------------------------------------
  tags = {
    Name        = "${var.project_name}-${var.environment}-sg"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"  # Indicates this was created by Terraform
  }
}

#===============================================================================
# UNDERSTANDING CIDR NOTATION
#===============================================================================
# CIDR (Classless Inter-Domain Routing) notation specifies IP ranges.
#
# Format: IP_ADDRESS/PREFIX_LENGTH
#
# Examples:
# - 0.0.0.0/0      = All IPv4 addresses (the entire internet)
# - 10.0.0.0/8     = 10.x.x.x (16 million addresses)
# - 192.168.1.0/24 = 192.168.1.x (256 addresses)
# - 203.0.113.5/32 = Just 203.0.113.5 (single address)
#
# The /NUMBER indicates how many bits are fixed:
# - /32 = All 32 bits fixed = 1 IP address
# - /24 = First 24 bits fixed = 256 IP addresses
# - /16 = First 16 bits fixed = 65,536 IP addresses
# - /0  = No bits fixed = All IP addresses
#===============================================================================
