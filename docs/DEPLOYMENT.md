# Production Deployment Runbook

## Provisioning Requirements

- **OS**: Ubuntu 22.04 LTS (recommended)
- **Docker**: v24.0+
- **Docker Compose**: v2.20+
- **Hardware**: 2 vCPU, 4GB RAM (Minimum)

## 1. Initial Server Setup

```bash
# Clone the repository
git clone <repo-url>
cd AutonomousZeroFees

# Setup Production Environment
cp .env.prod.example .env.prod
nano .env.prod # Fill in real keys, secrets, and DB passwords
```

## 2. Docker Secrets Setup

The production stack uses Docker Secrets for sensitive credentials. Create the `secrets/` directory and populate it with literal values (no quotes, no newlines).

```bash
mkdir -p secrets

# Generate and save secrets
openssl rand -base64 48 > secrets/jwt_secret.txt
echo "your_anthropic_key" > secrets/anthropic_api_key.txt
echo "your_stripe_key" > secrets/stripe_secret_key.txt
echo "your_stripe_webhook_secret" > secrets/stripe_webhook_secret.txt
echo "secure_db_password" > secrets/postgres_password.txt

# Construct and save the Database URL
# Format: postgresql://agency_prod:secure_db_password@postgres:5432/agency?schema=core
echo "postgresql://agency_prod:secure_db_password@postgres:5432/agency?schema=core" > secrets/database_url.txt

# Secure the secrets directory
chmod 600 secrets/*.txt
```

## 3. SSL Certificates (Let's Encrypt)

The Nginx configuration expects certificates at `infra/nginx/certs/`.

```bash
# Example using Certbot (on host)
sudo certbot certonly --standalone -d yourdomain.com

# Map certs to the project folder
mkdir -p infra/nginx/certs
sudo ln -s /etc/letsencrypt/live/yourdomain.com/fullchain.pem infra/nginx/certs/fullchain.pem
sudo ln -s /etc/letsencrypt/live/yourdomain.com/privkey.pem infra/nginx/certs/privkey.pem
```

## 3. Deploying the Stack

```bash
# Build and start in detached mode
docker-compose -f docker-compose.prod.yml up -d --build

# Run Database Migrations
docker-compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
```

## 4. Maintenance & Operations

### Viewing Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f workers
```

### Backups
The `backup-runner` service performs daily backups. Backups are stored in `/var/backups/orbis` on the host.

### Rollback
To rollback to a previous version:
1. Revert to the desired commit/tag: `git checkout <tag>`
2. Rebuild and restart: `docker-compose -f docker-compose.prod.yml up -d --build`

## 5. Security Posture
- All services are behind Nginx.
- API and Workers have resource limits (1GB RAM each).
- Rate limits are enforced on Auth and Webhook endpoints.
- DB is NOT exposed to the host/public by default.
