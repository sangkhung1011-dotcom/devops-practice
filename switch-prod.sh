#!/bin/bash

# PRODUCTION Mode - Gmail SMTP
cat > /home/ubuntu/devops-practice/.env << 'EOF'
# Database
DB_USER=postgres
DB_NAME=logindb
DB_PASSWORD=postgres
DB_PORT=5432

# Gmail SMTP (for production)
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password-16-chars

# Environment
NODE_ENV=production
EOF

echo "📧 Switching to PRODUCTION mode (Gmail SMTP)..."
echo ""
echo "⚠️  IMPORTANT: Update .env file with your Gmail credentials:"
echo "   1. nano /home/ubuntu/devops-practice/.env"
echo "   2. Replace GMAIL_USER and GMAIL_PASSWORD"
echo "   3. Save and rebuild"
echo ""

cd /home/ubuntu/devops-practice
docker compose down
docker compose up -d --build

echo ""
echo "✅ PRODUCTION mode ready!"
echo "🌐 App: http://localhost"
echo "📧 Emails will be sent via Gmail SMTP"
