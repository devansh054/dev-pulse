# DevPulse Production Setup - Quick Start

## 🚀 Quick Deployment Steps

### 1. Database Setup (5 minutes)

**Option A: Supabase (Recommended)**
```bash
# 1. Go to supabase.com → Create project
# 2. Copy connection string from Settings → Database
# 3. Set environment variable:
export DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# 4. Run migrations
cd /Users/devansh/Downloads/devpulse
npx prisma migrate deploy
npx prisma generate
npx prisma db seed  # Optional: seed with sample data
```

**Option B: Railway PostgreSQL**
```bash
# 1. Go to railway.app → New Project → Add PostgreSQL
# 2. Copy DATABASE_URL from Variables tab
# 3. Run migrations (same as above)
```

### 2. Backend Deployment (10 minutes)

**Option A: Railway**
```bash
# 1. Push backend to GitHub
cd /Users/devansh/Downloads/devpulse
git init
git add .
git commit -m "DevPulse backend"
git remote add origin https://github.com/yourusername/devpulse-backend.git
git push -u origin main

# 2. Deploy on Railway:
# - Connect GitHub repo
# - Add environment variables (see below)
# - Deploy automatically
```

**Option B: Render**
```bash
# 1. Create render.yaml in root
# 2. Push to GitHub
# 3. Connect on render.com
# 4. Add environment variables
```

### 3. Frontend Deployment (5 minutes)

**Vercel (Recommended)**
```bash
# 1. Push frontend to GitHub
cd frontend
git init
git add .
git commit -m "DevPulse frontend"
git remote add origin https://github.com/yourusername/devpulse-frontend.git
git push -u origin main

# 2. Deploy on Vercel:
# - Import GitHub repo
# - Framework: Next.js
# - Root: frontend/
# - Add environment variables
```

## 🔧 Required Environment Variables

### Backend (.env)
```env
# Copy these exact variables to your hosting platform

# Database (from Supabase/Railway)
DATABASE_URL=postgresql://user:password@host:port/database

# GitHub OAuth (create at github.com/settings/developers)
GITHUB_CLIENT_ID=Ov23limnrP5Vn3WaO1DL
GITHUB_CLIENT_SECRET=your_new_client_secret

# Security
JWT_SECRET=your-super-long-random-secret-key-here
NODE_ENV=production

# CORS (update with your frontend domain)
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Port
PORT=3001
```

### Frontend (Vercel Environment Variables)
```env
# Add these in Vercel dashboard → Settings → Environment Variables

NEXTAUTH_URL=https://your-frontend-domain.vercel.app
NEXTAUTH_SECRET=same-as-jwt-secret-above
GITHUB_CLIENT_ID=Ov23limnrP5Vn3WaO1DL
GITHUB_CLIENT_SECRET=your_new_client_secret
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
```

## 🔐 GitHub OAuth Setup

```bash
# 1. Go to github.com/settings/developers
# 2. OAuth Apps → New OAuth App
# 3. Fill in:
#    - Application name: DevPulse
#    - Homepage URL: https://your-frontend-domain.vercel.app
#    - Authorization callback: https://your-frontend-domain.vercel.app/api/auth/callback/github
# 4. Copy Client ID and generate new Client Secret
# 5. Add to environment variables above
```

## 🌐 Custom Domain Setup

### Frontend Domain
```bash
# 1. In Vercel dashboard:
#    - Go to Project → Settings → Domains
#    - Add your custom domain (e.g., devpulse.com)
#    
# 2. Update DNS records with your domain provider:
#    Type: CNAME, Name: www, Value: cname.vercel-dns.com
#    Type: A, Name: @, Value: 76.76.19.61
#
# 3. Update environment variables:
#    NEXTAUTH_URL=https://yourdomain.com
#    
# 4. Update GitHub OAuth callback:
#    https://yourdomain.com/api/auth/callback/github
```

### Backend API Domain
```bash
# Option 1: Use Railway/Render subdomain
# https://devpulse-api.railway.app

# Option 2: Custom subdomain
# 1. Add CNAME record: api.yourdomain.com → your-app.railway.app
# 2. Update frontend env: NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## ✅ Deployment Checklist

### Pre-deployment
- [ ] Database created and connection string copied
- [ ] GitHub OAuth app created with correct callback URLs
- [ ] Environment variables prepared
- [ ] Code pushed to GitHub repositories

### Backend Deployment
- [ ] Repository connected to Railway/Render
- [ ] Environment variables added
- [ ] Database migrations run successfully
- [ ] Health check endpoint working: `/api/health`

### Frontend Deployment
- [ ] Repository connected to Vercel
- [ ] Environment variables added
- [ ] Build successful
- [ ] Custom domain configured (if applicable)
- [ ] GitHub OAuth working

### Post-deployment Testing
- [ ] Frontend loads without errors
- [ ] GitHub OAuth login works
- [ ] Dashboard displays data
- [ ] API endpoints responding
- [ ] Database connections working

## 🚨 Common Issues & Fixes

### Build Failures
```bash
# Node.js version issues
# Solution: Use Node 18+ in platform settings

# Missing dependencies
# Solution: Ensure package.json includes all dependencies
npm install --production
```

### Database Connection Issues
```bash
# Check DATABASE_URL format
# Correct: postgresql://user:pass@host:port/db?sslmode=require
# Run: npx prisma db push (if migrations fail)
```

### OAuth Issues
```bash
# Callback URL mismatch
# Solution: Ensure exact match in GitHub OAuth settings
# Frontend: https://yourdomain.com/api/auth/callback/github
# No trailing slashes!
```

### CORS Errors
```bash
# Update backend CORS configuration
# File: src/app.ts
# Add your frontend domain to allowed origins
```

## 📊 Monitoring URLs

After deployment, bookmark these for monitoring:

```bash
# Health checks
https://your-backend.railway.app/api/health
https://your-backend.railway.app/api/health/db

# Application
https://yourdomain.com
https://yourdomain.com/dashboard

# Admin panels
https://supabase.com/dashboard (database)
https://vercel.com/dashboard (frontend)
https://railway.app/dashboard (backend)
```

## 🔄 Updates & Maintenance

```bash
# To update after code changes:
# 1. Push to GitHub (triggers auto-deployment)
# 2. Run database migrations if schema changed:
npx prisma migrate deploy

# To check logs:
# - Vercel: Functions tab in dashboard
# - Railway: Deployments → View Logs
# - Database: Supabase → Logs
```

This setup will give you a fully functional DevPulse deployment with custom domain support!
