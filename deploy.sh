#!/bin/bash
set -e

echo "🚀 Starting Production Deployment for Shadamon..."

# 1. Pull latest code from main branch
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# 2. Check for .env.production file or prompt instructions
if [ ! -f .env.production ]; then
  echo "⚠️ .env.production not found. Creating default production configuration..."
  cat <<EOT > .env.production
LIVE_DOMAIN_URL=http://147.93.28.110:3000
LIVE_API_URL=http://147.93.28.110:8000
JWT_SECRET=shadamon_prod_secret_key_2026
EOT
fi

# 3. Export production environment variables
export $(cat .env.production | xargs)

# 4. Build and start containers using docker-compose.prod.yml
echo "🏗️ Building and deploying containers..."
docker compose -f docker-compose.prod.yml up -d --build

# 5. Run database seed if MongoDB is empty
echo "🌱 Verifying live database data..."
docker exec -i shadamon_prod_backend node seed.js || true

echo "✅ Production Deployment Complete!"
echo "🌐 Frontend: $LIVE_DOMAIN_URL"
echo "⚙️ Backend API: $LIVE_API_URL"
