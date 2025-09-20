import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    username: string;
    githubId?: number;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check for Authorization header first (JWT token)
    const authHeader = req.headers.authorization;
    const jwtToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // Check for auth_token in cookies (from GitHub OAuth)
    const authToken = req.cookies?.auth_token;
    const githubToken = req.cookies?.github_token;
    const userData = req.cookies?.user_data;

    console.log('🔐 Auth middleware - cookies:', { 
      authToken: !!authToken, 
      githubToken: !!githubToken, 
      userData: !!userData 
    });

    if (authToken) {
      // Handle auth_token from GitHub OAuth
      try {
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as any;
        console.log('🔐 Decoded auth token:', decoded);
        
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            username: true,
            githubId: true,
          },
        });

        if (!user) {
          console.log('🔐 User not found for ID:', decoded.userId);
          res.status(401).json({
            success: false,
            error: 'User not found',
          });
          return;
        }

        console.log('🔐 Authenticated user:', user);
        req.user = {
          id: user.id,
          email: user.email || '',
          username: user.username,
          githubId: user.githubId || undefined,
        };
        next();
        return;
      } catch (tokenError) {
        console.log('🔐 Auth token error:', tokenError);
      }
    }

    if (jwtToken) {
      // Handle JWT authentication (existing backend users)
      const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          githubId: true,
        },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email || '',
        username: user.username,
        githubId: user.githubId || undefined,
      };
      next();
      return;
    }

    if (githubToken && userData) {
      // Handle GitHub OAuth authentication (from frontend)
      try {
        const parsedUserData = JSON.parse(userData);
        
        // Find the user in database by GitHub ID
        const user = await prisma.user.findUnique({
          where: { githubId: parsedUserData.id },
          select: {
            id: true,
            email: true,
            username: true,
            githubId: true,
          },
        });

        if (!user) {
          res.status(401).json({
            success: false,
            error: 'User not found in database',
          });
          return;
        }

        req.user = {
          id: user.id,
          email: user.email || '',
          username: user.username,
          githubId: user.githubId || undefined,
        };
        next();
        return;
      } catch (parseError) {
        logger.error('Error parsing user data from cookies:', parseError);
      }
    }

    // No valid authentication found
    res.status(401).json({
      success: false,
      error: 'Access token required',
    });
    return;

  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next(); // Continue without authentication
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        githubId: true,
      },
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email || '',
        username: user.username,
        githubId: user.githubId || undefined,
      };
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    next();
  }
};
