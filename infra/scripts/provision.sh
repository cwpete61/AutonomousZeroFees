#!/bin/bash

# Orbis Outreach - BPS — Production Provisioning Script
# This script installs Docker, Docker Compose, and basic security on Ubuntu 22.04+

set -e

echo "--- Starting Provisioning for Orbis Outreach - BPS ---"

# 1. Update system
sudo apt-get update
sudo apt-get upgrade -y

# 2. Install prerequisites
sudo apt-get install -y ca-certificates curl gnupg lsb-release ufw fail2ban

# 3. Setup Docker Repo
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Install Docker & Compose
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5. Security - UFW Firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
echo "y" | sudo ufw enable

# 6. Final Steps
echo "--- Provisioning Complete ---"
echo "Next steps:"
echo "1. Clone the repository to /app/orbis-outreach"
echo "2. Setup your .env.prod and secrets/*.txt files"
echo "3. Run: docker compose -f docker-compose.prod.yml up -d"
