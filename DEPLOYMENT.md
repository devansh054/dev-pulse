# DevPulse Deployment Guide

## Overview
DevPulse is a full-stack application with:
- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Node.js/Express with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: GitHub OAuth

## 🚀 Frontend Deployment (Vercel/Netlify)

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/devpulse-frontend.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Framework: **Next.js**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Environment Variables** (Add in Vercel dashboard)
   ```
   NEXTAUTH_URL=https://your-domain.com
   NEXTAUTH_SECRET=your-random-secret-key
   GITHUB_CLIENT_ID=your-github-oauth-client-id
   GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
   NEXT_PUBLIC_API_URL=https://your-backend-api.com
   ```

### Option 2: Netlify

1. **Build Configuration** (netlify.toml already created)
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   ```

2. **Deploy**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your `frontend` folder OR connect GitHub
   - Build command: `npm run build`
   - Publish directory: `.next`

## 🔧 Backend Deployment

### Option 1: Railway (Recommended)

1. **Prepare Backend**
   ```bash
   cd ../  # Go to root directory
   # Create a separate backend package.json if needed
   ```

2. **Add Production Scripts** to root `package.json`
   ```json
   {
     "scripts": {
       "build": "tsc",
       "start": "node dist/app.js",
       "dev": "ts-node src/app.ts"
     }
   }
   ```

3. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Connect GitHub repository
   - Add PostgreSQL database service
   - Set environment variables (see below)

### Option 2: Render

1. **Create render.yaml**
   ```yaml
   services:
     - type: web
       name: devpulse-api
       env: node
       buildCommand: npm install && npm run build
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
   ```

2. **Deploy**
   - Go to [render.com](https://render.com)
   - Connect GitHub repository
   - Service type: **Web Service**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

### Option 3: Heroku

1. **Add Procfile**
   ```
   web: npm start
   ```

2. **Deploy**
   ```bash
   heroku create devpulse-api
   heroku addons:create heroku-postgresql:mini
   git push heroku main
   ```

## 🗄️ Database Setup

### Option 1: Supabase (Recommended)

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Copy connection string

2. **Run Migrations**
   ```bash
   # Set DATABASE_URL in your environment
   export DATABASE_URL="postgresql://user:pass@host:port/db"
   npx prisma migrate deploy
   npx prisma generate
   ```

### Option 2: Neon

1. **Create Database**
   - Go to [neon.tech](https://neon.tech)
   - Create database
   - Copy connection string

### Option 3: Railway PostgreSQL

1. **Add Database Service**
   - In Railway dashboard
   - Add PostgreSQL service
   - Copy connection variables

## 🔐 Environment Variables

### Backend Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# JWT
JWT_SECRET=your-super-secret-jwt-key

# API Keys (Optional)
OPENAI_API_KEY=your_openai_key
HUGGINGFACE_API_KEY=your_huggingface_key

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# Port
PORT=3001
```

### Frontend Environment Variables
```env
# NextAuth
NEXTAUTH_URL=https://your-frontend-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# GitHub OAuth (same as backend)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# API URL
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

## 🌐 Custom Domain Setup

### For Frontend (Vercel)
1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **DNS Records**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.19.61
   ```

### For Backend API
1. **Custom Subdomain**
   - Use `api.yourdomain.com` for backend
   - Point to your hosting provider's IP/CNAME

## 🔄 GitHub OAuth Setup

1. **Create GitHub OAuth App**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - New OAuth App
   - Homepage URL: `https://yourdomain.com`
   - Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`

2. **Get Credentials**
   - Copy Client ID and Client Secret
   - Add to environment variables

## 📦 Build and Deploy Commands

### Frontend Build
```bash
cd frontend
npm install
npm run build
npm start  # For production
```

### Backend Build
```bash
npm install
npm run build  # Compiles TypeScript
npm start      # Runs compiled JavaScript
```

## 🚨 Important Notes

1. **Database Migration**: Always run `npx prisma migrate deploy` after deploying
2. **Environment Variables**: Never commit `.env` files to Git
3. **CORS**: Update CORS settings in backend to allow your frontend domain
4. **SSL**: Most platforms provide SSL automatically
5. **GitHub OAuth**: Update callback URLs when changing domains

## 🔍 Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version (use Node 18+)
2. **Database Connection**: Verify DATABASE_URL format
3. **OAuth Issues**: Check callback URLs match exactly
4. **CORS Errors**: Verify frontend URL in backend CORS config
5. **Environment Variables**: Ensure all required vars are set

### Health Check Endpoints
- Backend: `GET /api/health`
- Database: `GET /api/health/db`

## 📊 Monitoring

### Recommended Tools
- **Uptime**: UptimeRobot, Pingdom
- **Logs**: Vercel Analytics, Railway Logs
- **Database**: Built-in monitoring on Supabase/Neon
- **Performance**: Vercel Analytics, Google Analytics

## 🔄 CI/CD (Optional)

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run deploy
```

This guide covers all aspects of deploying DevPulse manually. Choose the platforms that best fit your needs and budget!
