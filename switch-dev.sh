#!/bin/bash

# DEV Mode - MailHog
cat > /home/ubuntu/devops-practice/.env << 'EOF'
# Database
DB_USER=postgres
DB_NAME=logindb
DB_PASSWORD=postgres
DB_PORT=5432

# Gmail (not used in DEV)
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password

# Environment
NODE_ENV=development
EOF

echo "📧 Switching to DEV mode (MailHog)..."
cd /home/ubuntu/devops-practice
docker compose down
docker compose up -d --build

echo ""
echo "✅ DEV mode ready!"
echo "📬 MailHog: http://localhost:8025"
echo "🌐 App: http://localhost"
