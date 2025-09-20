# DevPulse Deployment: Netlify + Render + Supabase

## 🎯 Deployment Stack
- **Frontend**: Netlify
- **Backend**: Render  
- **Database**: Supabase PostgreSQL
- **Domain**: Custom domain with SSL

---

## 📋 Step 1: Supabase Database Setup (5 minutes)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `devpulse-db`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** (takes ~2 minutes)

### 1.2 Get Database Connection String
1. In Supabase dashboard → **Settings** → **Database**
2. Scroll to **Connection string** → **URI**
3. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
4. **Replace `[YOUR-PASSWORD]`** with your actual password
5. **Save this connection string** - you'll need it multiple times

### 1.3 Run Database Migrations
```bash
# In your local DevPulse directory
cd /Users/devansh/Downloads/devpulse

# Set the database URL (replace with your actual connection string)
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"

# Install dependencies if not already done
npm install

# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npx prisma migrate deploy

# Optional: Seed with sample data
npm run db:seed
```

### 1.4 Verify Database Setup
1. In Supabase dashboard → **Table Editor**
2. You should see tables: `User`, `Repository`, `Device`, `Insight`, etc.
3. ✅ Database is ready!

---

## 📋 Step 2: Backend Deployment on Render (10 minutes)

### 2.1 Prepare Backend for Deployment
```bash
# Create a new GitHub repository for backend
cd /Users/devansh/Downloads/devpulse
git init
git add .
git commit -m "DevPulse backend - initial commit"

# Create GitHub repo (replace with your username)
# Go to github.com → New Repository → "devpulse-backend"
git remote add origin https://github.com/YOUR_USERNAME/devpulse-backend.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy on Render
1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select **"devpulse-backend"** repository
5. Configure deployment:

**Basic Settings:**
- **Name**: `devpulse-api`
- **Region**: Same as your Supabase region
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Runtime**: `Node`

**Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 2.3 Add Environment Variables
In Render dashboard → **Environment** tab, add these variables:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
JWT_SECRET=your-super-long-random-secret-key-minimum-32-characters
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
FRONTEND_URL=https://your-app-name.netlify.app
```

**Important Notes:**
- Replace `DATABASE_URL` with your Supabase connection string
- Generate a strong `JWT_SECRET` (32+ characters)
- We'll update `GITHUB_CLIENT_ID/SECRET` and `FRONTEND_URL` later

### 2.4 Deploy Backend
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Once deployed, copy your backend URL (e.g., `https://devpulse-api.onrender.com`)
4. Test health check: `https://devpulse-api.onrender.com/api/health`
5. ✅ Backend is live!

---

## 📋 Step 3: Frontend Deployment on Netlify (5 minutes)

### 3.1 Prepare Frontend for Deployment
```bash
# Create GitHub repository for frontend
cd /Users/devansh/Downloads/devpulse/frontend
git init
git add .
git commit -m "DevPulse frontend - initial commit"

# Create GitHub repo
# Go to github.com → New Repository → "devpulse-frontend"
git remote add origin https://github.com/YOUR_USERNAME/devpulse-frontend.git
git branch -M main
git push -u origin main
```

### 3.2 Deploy on Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Select **"devpulse-frontend"** repository
5. Configure build settings:

**Build Settings:**
- **Base directory**: Leave empty
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Functions directory**: Leave empty

### 3.3 Add Environment Variables
In Netlify dashboard → **Site settings** → **Environment variables**, add:

```env
NEXTAUTH_URL=https://your-app-name.netlify.app
NEXTAUTH_SECRET=same-jwt-secret-as-backend
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_API_URL=https://devpulse-api.onrender.com
```

**Replace:**
- `your-app-name.netlify.app` with your actual Netlify URL
- `devpulse-api.onrender.com` with your actual Render backend URL
- GitHub credentials (we'll set these up next)

### 3.4 Deploy Frontend
1. Click **"Deploy site"**
2. Wait for build (3-5 minutes)
3. Copy your frontend URL (e.g., `https://amazing-app-123456.netlify.app`)
4. ✅ Frontend is live!

---

## 📋 Step 4: GitHub OAuth Configuration (5 minutes)

### 4.1 Create GitHub OAuth App
1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **"OAuth Apps"** → **"New OAuth App"**
3. Fill in details:
   - **Application name**: `DevPulse`
   - **Homepage URL**: `https://your-app-name.netlify.app`
   - **Application description**: `AI-Powered Developer Intelligence Platform`
   - **Authorization callback URL**: `https://your-app-name.netlify.app/api/auth/callback/github`

4. Click **"Register application"**
5. Copy **Client ID**
6. Click **"Generate a new client secret"** → Copy **Client Secret**

### 4.2 Update Environment Variables

**Update Render (Backend):**
1. Go to Render dashboard → Your service → **Environment**
2. Update these variables:
   ```env
   GITHUB_CLIENT_ID=your_actual_client_id
   GITHUB_CLIENT_SECRET=your_actual_client_secret
   FRONTEND_URL=https://your-actual-netlify-url.netlify.app
   ```
3. Click **"Save Changes"** (triggers redeploy)

**Update Netlify (Frontend):**
1. Go to Netlify dashboard → **Site settings** → **Environment variables**
2. Update these variables:
   ```env
   GITHUB_CLIENT_ID=your_actual_client_id
   GITHUB_CLIENT_SECRET=your_actual_client_secret
   NEXTAUTH_URL=https://your-actual-netlify-url.netlify.app
   ```
3. **Trigger redeploy**: **Deploys** → **Trigger deploy** → **Deploy site**

### 4.3 Test OAuth
1. Visit your Netlify URL
2. Click **"Connect GitHub"** or **"Sign In"**
3. Should redirect to GitHub → Authorize → Back to your app
4. ✅ OAuth is working!

---

## 📋 Step 5: Custom Domain Setup (Optional)

### 5.1 Add Custom Domain to Netlify
1. In Netlify dashboard → **Domain settings** → **Custom domains**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `devpulse.com`)
4. Follow DNS configuration instructions

### 5.2 Configure DNS Records
In your domain registrar (GoDaddy, Namecheap, etc.):

```dns
Type: CNAME
Name: www
Value: your-app-name.netlify.app

Type: A
Name: @
Value: 75.2.60.5
```

### 5.3 Update Environment Variables for Custom Domain
**Update both Netlify and Render:**
- `NEXTAUTH_URL=https://yourdomain.com`
- `FRONTEND_URL=https://yourdomain.com`

**Update GitHub OAuth:**
- Homepage URL: `https://yourdomain.com`
- Callback URL: `https://yourdomain.com/api/auth/callback/github`

### 5.4 SSL Certificate
- Netlify automatically provides SSL certificates
- Wait 24 hours for DNS propagation
- ✅ Custom domain with SSL is ready!

---

## 📋 Step 6: Final Testing & Verification

### 6.1 Test All Endpoints
```bash
# Backend health check
curl https://devpulse-api.onrender.com/api/health

# Frontend loading
curl -I https://your-app-name.netlify.app

# Database connection
curl https://devpulse-api.onrender.com/api/health/db
```

### 6.2 Test Full Application Flow
1. **Visit your app**: `https://your-app-name.netlify.app`
2. **GitHub OAuth**: Click "Connect GitHub" → Should work
3. **Dashboard**: Should load with real data
4. **API calls**: Check browser network tab for successful API calls
5. **Demo mode**: Visit `https://your-app-name.netlify.app?demo=true`

### 6.3 Performance & Monitoring
1. **Netlify Analytics**: Enable in dashboard
2. **Render Metrics**: Monitor in dashboard
3. **Supabase Monitoring**: Check database performance

---

## 🚨 Troubleshooting Common Issues

### Build Failures
```bash
# If Netlify build fails:
# 1. Check build logs in Netlify dashboard
# 2. Ensure all dependencies are in package.json
# 3. Try local build: npm run build

# If Render deployment fails:
# 1. Check deploy logs in Render dashboard
# 2. Verify Node.js version (should be 18+)
# 3. Check package.json scripts
```

### Database Connection Issues
```bash
# Test connection locally:
export DATABASE_URL="your_supabase_url"
npx prisma db push

# Check Supabase logs:
# Supabase dashboard → Logs → Database
```

### OAuth Issues
```bash
# Common fixes:
# 1. Ensure callback URLs match exactly (no trailing slashes)
# 2. Check GitHub OAuth app is active
# 3. Verify client ID/secret are correct
# 4. Clear browser cookies and try again
```

### CORS Issues
```bash
# If API calls fail:
# 1. Check FRONTEND_URL in Render environment variables
# 2. Verify API URL in Netlify environment variables
# 3. Check browser console for CORS errors
```

---

## 📊 Final URLs & Credentials

After deployment, save these important URLs:

```bash
# Application URLs
Frontend: https://your-app-name.netlify.app
Backend API: https://devpulse-api.onrender.com
Database: Supabase dashboard

# Admin Dashboards
Netlify: https://app.netlify.com
Render: https://dashboard.render.com
Supabase: https://supabase.com/dashboard

# Health Checks
API Health: https://devpulse-api.onrender.com/api/health
DB Health: https://devpulse-api.onrender.com/api/health/db
```

## 🎉 Deployment Complete!

Your DevPulse application is now live with:
- ✅ **Frontend**: Netlify with automatic deployments
- ✅ **Backend**: Render with auto-scaling
- ✅ **Database**: Supabase PostgreSQL with backups
- ✅ **Authentication**: GitHub OAuth
- ✅ **SSL**: Automatic HTTPS certificates
- ✅ **Custom Domain**: Ready for configuration

**Total deployment time**: ~30 minutes
**Monthly cost**: $0 (all platforms have generous free tiers)

Your DevPulse platform is production-ready! 🚀
