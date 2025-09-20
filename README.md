<<<<<<< HEAD
# DevPulse - AI-Powered Developer Intelligence Platform

DevPulse is an intelligent developer companion that provides AI-driven insights, burnout prediction, team collaboration analytics, and personalized productivity recommendations. Unlike basic time trackers like WakaTime, DevPulse offers holistic developer intelligence that combines code quality, productivity, learning velocity, and wellbeing metrics.

## 🚀 Features

### Core Intelligence
- **AI Developer Coach**: Burnout prediction, optimal schedule recommendations, skill gap analysis
- **Multi-Source Data Integration**: GitHub, Slack, Jira, Calendar, IDE activity
- **Team Collaboration Health**: Communication efficiency, code review bottlenecks, knowledge silos
- **Predictive Work-Life Balance**: Energy pattern analysis, weekend work alerts
- **Learning Acceleration Engine**: Skill trajectory mapping, personalized learning recommendations
- **Mental Health & Wellbeing**: Stress detection, flow state optimization

### Dashboard Features
- Real-time productivity metrics
- Contribution streak tracking
- Goal setting and progress monitoring
- Activity timeline and insights
- Team performance analytics
- Personalized AI recommendations

## 🛠 Technology Stack

### Backend
- **Node.js + Express.js** with TypeScript
- **PostgreSQL** with Prisma ORM
- **JWT Authentication** with GitHub OAuth
- **GitHub API Integration** for developer metrics
- **Winston Logging** for comprehensive monitoring

### Database
- **PostgreSQL** for reliable data storage
- **Prisma** for type-safe database operations
- Comprehensive schema for users, metrics, goals, insights, and teams

### Security & Performance
- **Helmet.js** for security headers
- **Rate limiting** to prevent abuse
- **CORS** configuration for frontend integration
- **Error handling** with detailed logging

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- GitHub OAuth App (for authentication)

### Setup

1. **Clone and install dependencies:**
```bash
cd devpulse
npm install
```

2. **Environment Configuration:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/devpulse"
JWT_SECRET="your-super-secret-jwt-key"
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

3. **Database Setup:**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Open Prisma Studio
npm run db:studio
```

4. **GitHub OAuth Setup:**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App
   - Set Authorization callback URL to: `http://localhost:3000/auth/callback`
   - Copy Client ID and Client Secret to your `.env` file

5. **Start Development Server:**
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/github/callback` - GitHub OAuth callback
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user

### Dashboard
- `GET /api/dashboard` - Get dashboard overview
- `GET /api/dashboard/trends` - Get productivity trends
- `GET /api/dashboard/team` - Get team dashboard

### GitHub Integration
- `GET /api/github/stats` - Get GitHub user stats
- `GET /api/github/repositories` - Get user repositories
- `POST /api/github/sync` - Sync GitHub data
- `GET /api/github/activity/:owner/:repo` - Get commit activity

### User Management
- `GET /api/user/goals` - Get user goals
- `POST /api/user/goals` - Create new goal
- `PUT /api/user/goals/:id` - Update goal
- `DELETE /api/user/goals/:id` - Delete goal
- `GET /api/user/insights` - Get AI insights
- `GET /api/user/activity` - Get activity log
- `GET /api/user/stats` - Get user statistics

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Rate limiting** (100 requests per 15 minutes)
- **CORS protection** with configurable origins
- **Helmet.js** security headers
- **Input validation** and sanitization
- **Error handling** without sensitive data exposure

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with the following main entities:

- **Users**: Core user profiles with GitHub integration
- **Projects**: User projects and repositories
- **DailyMetrics**: Daily productivity and activity metrics
- **Goals**: User-defined goals and progress tracking
- **Insights**: AI-generated insights and recommendations
- **Teams**: Team management and collaboration
- **ActivityLog**: Detailed activity tracking

## 🚀 Development

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start           # Start production server
npm test            # Run tests
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run db:generate # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:migrate  # Run database migrations
npm run db:studio   # Open Prisma Studio
```

### Project Structure

```
src/
├── app.ts              # Main application setup
├── middleware/         # Express middleware
│   ├── auth.ts        # Authentication middleware
│   └── errorHandler.ts # Global error handling
├── routes/            # API route handlers
│   ├── auth.ts        # Authentication routes
│   ├── dashboard.ts   # Dashboard data routes
│   ├── github.ts      # GitHub integration routes
│   └── user.ts        # User management routes
├── services/          # Business logic services
│   └── githubService.ts # GitHub API integration
└── utils/             # Utility functions
    └── logger.ts      # Winston logging setup
```

## 🔮 Roadmap

### Phase 1: MVP (Current)
- ✅ GitHub integration and commit analysis
- ✅ Basic productivity dashboard
- ✅ User authentication and profiles
- ✅ Goal setting and tracking

### Phase 2: Intelligence Layer
- 🔄 Basic burnout prediction model
- 🔄 Personalized productivity insights
- 🔄 Team collaboration metrics
- 🔄 Learning progress tracking

### Phase 3: Advanced Features
- ⏳ Multi-source data integration (Slack, Jira, Calendar)
- ⏳ Advanced AI recommendations
- ⏳ Team management features
- ⏳ Mobile-responsive frontend

### Phase 4: Production Ready
- ⏳ Performance optimization
- ⏳ Comprehensive testing
- ⏳ Security hardening
- ⏳ Documentation and deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints above

---

**DevPulse** - Transforming developer productivity through intelligent insights and AI-powered recommendations. 🚀
=======
# dev-pulse
>>>>>>> b7ee9a235e33dd98ca33f4f42a6eb9f9b21572a2
