# Deployment Guide

This guide covers deploying the DigiStore Backend API to various platforms.

## Prerequisites

Before deploying, ensure you have:

1. A MongoDB database (MongoDB Atlas recommended)
2. Vercel Blob Storage account
3. Flutterwave account (test or production)
4. SMTP server for emails
5. All environment variables ready

## Vercel Deployment

### Step 1: Install Vercel CLI

\`\`\`bash
npm install -g vercel
\`\`\`

### Step 2: Login to Vercel

\`\`\`bash
vercel login
\`\`\`

### Step 3: Configure Project

Create a `vercel.json` file in the root:

\`\`\`json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ]
}
\`\`\`

### Step 4: Build the Project

\`\`\`bash
npm run build
\`\`\`

### Step 5: Deploy

\`\`\`bash
vercel --prod
\`\`\`

### Step 6: Set Environment Variables

In the Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all variables from your `.env` file
4. Redeploy the project

## Railway Deployment

### Step 1: Install Railway CLI

\`\`\`bash
npm install -g @railway/cli
\`\`\`

### Step 2: Login

\`\`\`bash
railway login
\`\`\`

### Step 3: Initialize Project

\`\`\`bash
railway init
\`\`\`

### Step 4: Add Environment Variables

\`\`\`bash
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=your_mongodb_uri
# Add all other variables
\`\`\`

### Step 5: Deploy

\`\`\`bash
railway up
\`\`\`

## Render Deployment

### Step 1: Create Account

Sign up at [render.com](https://render.com)

### Step 2: Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: digistore-backend
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

### Step 3: Add Environment Variables

In the Render dashboard, add all environment variables.

### Step 4: Deploy

Render will automatically deploy on push to main branch.

## Heroku Deployment

### Step 1: Install Heroku CLI

\`\`\`bash
npm install -g heroku
\`\`\`

### Step 2: Login

\`\`\`bash
heroku login
\`\`\`

### Step 3: Create App

\`\`\`bash
heroku create digistore-backend
\`\`\`

### Step 4: Add Buildpack

\`\`\`bash
heroku buildpacks:set heroku/nodejs
\`\`\`

### Step 5: Set Environment Variables

\`\`\`bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
# Add all other variables
\`\`\`

### Step 6: Deploy

\`\`\`bash
git push heroku main
\`\`\`

## Docker Deployment

### Step 1: Create Dockerfile

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
\`\`\`

### Step 2: Create .dockerignore

\`\`\`
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
\`\`\`

### Step 3: Build Image

\`\`\`bash
docker build -t digistore-backend .
\`\`\`

### Step 4: Run Container

\`\`\`bash
docker run -p 5000:5000 --env-file .env digistore-backend
\`\`\`

### Step 5: Deploy to Docker Hub

\`\`\`bash
docker tag digistore-backend yourusername/digistore-backend
docker push yourusername/digistore-backend
\`\`\`

## MongoDB Atlas Setup

### Step 1: Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Choose your cloud provider and region

### Step 2: Create Database User

1. Go to "Database Access"
2. Add new database user
3. Save username and password

### Step 3: Whitelist IP

1. Go to "Network Access"
2. Add IP address (0.0.0.0/0 for all IPs in production)

### Step 4: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password

## Vercel Blob Storage Setup

### Step 1: Create Store

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage
3. Create a new Blob store

### Step 2: Get Token

1. Click on your Blob store
2. Go to "Settings"
3. Copy the `BLOB_READ_WRITE_TOKEN`

## Flutterwave Setup

### Step 1: Create Account

Sign up at [Flutterwave](https://flutterwave.com)

### Step 2: Get API Keys

1. Go to Settings → API
2. Copy:
   - Public Key
   - Secret Key
   - Encryption Key

### Step 3: Set Webhook URL

1. Go to Settings → Webhooks
2. Set webhook URL: `https://your-domain.com/api/v1/payments/webhook`
3. Copy the webhook secret hash

### Step 4: Test Mode

Use test keys for development:
- Test cards: https://developer.flutterwave.com/docs/test-cards

## Email Setup (Gmail)

### Step 1: Enable 2FA

Enable two-factor authentication on your Gmail account.

### Step 2: Create App Password

1. Go to Google Account settings
2. Security → 2-Step Verification → App passwords
3. Generate new app password
4. Use this as `SMTP_PASS`

### Step 3: Configure

\`\`\`env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
\`\`\`

## SSL/HTTPS Setup

### For Custom Domain

1. Get SSL certificate from Let's Encrypt
2. Configure reverse proxy (Nginx/Apache)
3. Force HTTPS redirect

### Nginx Configuration

\`\`\`nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

## Environment-Specific Configurations

### Development

\`\`\`env
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
\`\`\`

### Staging

\`\`\`env
NODE_ENV=staging
FRONTEND_URL=https://staging.yourdomain.com
\`\`\`

### Production

\`\`\`env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
\`\`\`

## Post-Deployment Checklist

- [ ] All environment variables set correctly
- [ ] Database connection working
- [ ] File uploads working (Blob storage)
- [ ] Payment integration working (Flutterwave)
- [ ] Email sending working
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Error logging configured
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Documentation updated

## Monitoring and Logging

### Recommended Tools

1. **Application Monitoring**: New Relic, Datadog
2. **Error Tracking**: Sentry
3. **Logging**: Winston + CloudWatch/Papertrail
4. **Uptime Monitoring**: UptimeRobot, Pingdom

### Setup Sentry

\`\`\`bash
npm install @sentry/node
\`\`\`

\`\`\`typescript
import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
\`\`\`

## Scaling Considerations

### Horizontal Scaling

1. Use load balancer (Nginx, AWS ALB)
2. Deploy multiple instances
3. Use Redis for session storage
4. Implement caching strategy

### Database Optimization

1. Add indexes for frequently queried fields
2. Use MongoDB replica sets
3. Implement read replicas
4. Regular database maintenance

### Caching Strategy

1. Implement Redis caching
2. Cache frequently accessed data
3. Set appropriate TTL values
4. Invalidate cache on updates

## Backup Strategy

### Database Backups

\`\`\`bash
# Daily backup script
mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%Y%m%d)
\`\`\`

### Automated Backups

Use MongoDB Atlas automated backups or set up cron jobs.

## Troubleshooting

### Common Issues

1. **Connection Timeout**: Check firewall and IP whitelist
2. **Payment Webhook Not Working**: Verify webhook URL and secret
3. **File Upload Fails**: Check Blob storage token and permissions
4. **Email Not Sending**: Verify SMTP credentials and app password

### Debug Mode

Enable detailed logging:

\`\`\`env
DEBUG=*
LOG_LEVEL=debug
\`\`\`

## Security Hardening

1. Use environment variables for all secrets
2. Enable rate limiting
3. Implement request validation
4. Use HTTPS only
5. Regular security audits
6. Keep dependencies updated
7. Implement proper CORS
8. Use security headers (Helmet)
9. Monitor for suspicious activity
10. Regular backups

## Support

For deployment issues:
- Check logs first
- Review environment variables
- Test API endpoints
- Contact support: support@digistore.com
