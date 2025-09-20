# DevPulse Backend Setup Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** 
- **PostgreSQL** database
- **GitHub OAuth App** (for authentication)

### 1. Environment Setup

```bash
# Clone and install dependencies
cd devpulse
npm install

# Create environment file
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your settings:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/devpulse"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# GitHub OAuth (create at https://github.com/settings/developers)
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"

# API Configuration
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### 3. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: DevPulse
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/callback`
4. Copy Client ID and Client Secret to your `.env` file

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Optional: Open Prisma Studio to view data
npm run db:studio
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 🐳 Docker Setup (Alternative)

For a complete setup with PostgreSQL and Redis:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api
```

## 📡 API Endpoints

### Health Check
```bash
curl http://localhost:5000/health
```

### Authentication Endpoints
- `POST /api/auth/github/callback` - GitHub OAuth callback
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Dashboard Endpoints
- `GET /api/dashboard` - Get dashboard overview
- `GET /api/dashboard/trends` - Get productivity trends
- `GET /api/dashboard/team` - Get team dashboard

### GitHub Integration
- `GET /api/github/stats` - Get GitHub user stats
- `GET /api/github/repositories` - Get user repositories
- `POST /api/github/sync` - Sync GitHub data

### User Management
- `GET /api/user/goals` - Get user goals
- `POST /api/user/goals` - Create new goal
- `GET /api/user/insights` - Get AI insights
- `GET /api/user/stats` - Get user statistics

### AI Insights
- `POST /api/insights/generate` - Generate AI insights
- `GET /api/insights/burnout-risk` - Get burnout risk assessment
- `GET /api/insights/recommendations` - Get productivity recommendations

## 🔧 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm test            # Run tests
npm run lint        # Run ESLint
npm run db:generate # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:studio   # Open Prisma Studio
```

## 🔒 Authentication Flow

1. **Frontend** redirects user to GitHub OAuth
2. **GitHub** redirects back with authorization code
3. **Frontend** sends code to `POST /api/auth/github/callback`
4. **Backend** exchanges code for GitHub access token
5. **Backend** creates/updates user and returns JWT token
6. **Frontend** uses JWT token for authenticated requests

## 📊 Database Schema

### Core Tables
- **users** - User profiles and GitHub integration
- **daily_metrics** - Daily productivity metrics
- **goals** - User-defined goals and progress
- **insights** - AI-generated insights and recommendations
- **activity_logs** - Detailed activity tracking
- **teams** - Team management (optional)

## 🤖 AI Features

### Burnout Prediction
- Analyzes coding patterns, work hours, weekend activity
- Generates risk scores and recommendations
- Scheduled weekly assessments

### Productivity Insights
- Peak productivity hours analysis
- Commit consistency patterns
- Focus time optimization suggestions

### Learning Recommendations
- Technology exploration detection
- Skill gap analysis
- Personalized learning paths

## 🕒 Scheduled Tasks

The backend includes automated tasks that run in production:

- **Daily 6 AM**: GitHub data sync for all users
- **Daily 8 AM**: Generate AI insights
- **Weekly Monday 9 AM**: Burnout risk assessment
- **Monthly**: Cleanup old data

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env
echo $DATABASE_URL
```

**GitHub OAuth Errors**
- Verify Client ID and Secret in `.env`
- Check callback URL matches GitHub app settings
- Ensure FRONTEND_URL is correct

**Port Already in Use**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process if needed
kill -9 <PID>
```

### Logs
- Application logs: `logs/combined.log`
- Error logs: `logs/error.log`
- Console output in development mode

## 🔐 Security

### Production Checklist
- [ ] Change JWT_SECRET to secure random string
- [ ] Use HTTPS for all URLs
- [ ] Set NODE_ENV=production
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Review GitHub OAuth app settings

## 📈 Monitoring

### Health Checks
- `GET /health` - Application health status
- Database connectivity test included
- Returns uptime and environment info

### Performance
- Built-in request logging with Winston
- Rate limiting (100 requests per 15 minutes)
- Efficient database queries with Prisma

## 🎯 Next Steps

1. **Frontend Integration**: Connect your React/Vue/Angular frontend
2. **Additional Integrations**: Add Slack, Jira, Calendar APIs
3. **Advanced AI**: Implement more sophisticated ML models
4. **Team Features**: Enable team collaboration features
5. **Mobile App**: Create mobile companion app

## 💡 Tips

- Use `npm run db:studio` to visually explore your data
- Check logs in `logs/` directory for debugging
- Use Docker for consistent development environment
- Set up GitHub webhooks for real-time updates
- Consider Redis for caching in production

---

**Need Help?** Check the main README.md or create an issue on GitHub.
