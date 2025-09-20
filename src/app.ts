import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth';
import simpleAuthRoutes from './routes/simple-auth';
import githubDataRoutes from './routes/github-data';
import dashboardRouter from './routes/dashboard';
import githubRoutes from './routes/github';
import userRoutes from './routes/user';
import aiRoutes from './routes/ai';
import teamRoutes from './routes/team';
import focusRoutes from './routes/focus';
import laboratoryRoutes from './routes/laboratory';
import testRouter from './routes/test';
import chatRoutes from './routes/chat';
import devicesRoutes from './routes/devices';
import securityRoutes from './routes/security';
import communicationsRoutes from './routes/communications';
import adminRoutes from './routes/admin';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Import services
// import { CronService } from './services/cronService'; // Temporarily disabled due to schema issues

// Load environment variables
dotenv.config();

// Initialize Prisma client
export const prisma = new PrismaClient();

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://dev-pulse.netlify.app',
    'https://dev-pulse1.netlify.app',
    'https://pulse-dev.netlify.app',
    'http://localhost:3002',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Rate limiting - increased limits for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // 1000 requests per minute
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Handle preflight requests explicitly
app.options('*', cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'DevPulse API',
    version: process.env.npm_package_version || '1.0.0',
    description: 'AI-powered developer intelligence platform',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      github: '/api/github',
      user: '/api/user',
      team: '/api/team',
      ai: '/api/ai',
      devices: '/api/devices',
      security: '/api/security',
      communications: '/api/communications',
      laboratory: '/api/laboratory',
      admin: '/api/admin'
    },
    documentation: 'See SETUP.md for API documentation'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/simple-auth', simpleAuthRoutes);
app.use('/api/github-data', githubDataRoutes);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/user', userRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/laboratory', laboratoryRoutes);
app.use('/api/test', testRouter);
app.use('/api/chat', chatRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/communications', communicationsRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`🚀 DevPulse API server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  
  // Start scheduled tasks in production
  if (process.env.NODE_ENV === 'production') {
    // const cronService = new CronService(); // Temporarily disabled due to schema issues
    // cronService.startScheduledTasks();
    // logger.info('🕒 Scheduled tasks started');
  }
});

export default app;
