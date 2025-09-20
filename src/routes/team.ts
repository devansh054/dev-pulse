import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = Router();

// Types
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    githubId: string;
    username: string;
    email: string;
  };
}

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

interface TeamMember {
  id: number;
  name: string;
  githubUsername: string;
  avatar: string;
  bio: string | null;
  location: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  joinedAt: string;
  commits: number;
  pullRequests: number;
  issues: number;
}

// Get team members
router.get('/members', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.user?.id || '0');
    
    const members = await (prisma as any).teamMemberProfile.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' }
    });
    
    logger.info('Retrieved team members from database', { 
      userId, 
      memberCount: members.length 
    });
    
    // Convert to expected format
    const formattedMembers = members.map((member: any) => ({
      id: member.id,
      name: member.name,
      githubUsername: member.githubUsername,
      avatar: member.avatar,
      bio: member.bio,
      location: member.location,
      publicRepos: member.publicRepos,
      followers: member.followers,
      following: member.following,
      joinedAt: member.joinedAt.toISOString(),
      commits: member.commits,
      pullRequests: member.pullRequests,
      issues: member.issues
    }));
    
    res.json({
      success: true,
      data: {
        teamMembers: formattedMembers
      }
    });
  } catch (error) {
    logger.error('Failed to get team members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve team members'
    });
  }
});

// Add team member
router.post('/members', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.user?.id || '0');
    const { githubUsername } = req.body;
    
    if (!githubUsername) {
      return res.status(400).json({
        success: false,
        error: 'GitHub username is required'
      });
    }
    
    // Check if member already exists
    const existingMember = await (prisma as any).teamMemberProfile.findUnique({
      where: {
        ownerId_githubUsername: {
          ownerId: userId,
          githubUsername: githubUsername
        }
      }
    });
    
    if (existingMember) {
      return res.status(409).json({
        success: false,
        error: 'Team member already exists'
      });
    }
    
    // Fetch GitHub user data
    const githubResponse = await fetch(`https://api.github.com/users/${githubUsername}`);
    if (!githubResponse.ok) {
      return res.status(404).json({
        success: false,
        error: 'GitHub user not found'
      });
    }
    
    const githubUser = await githubResponse.json() as GitHubUser;
    
    // Create new team member in database
    const newMember = await (prisma as any).teamMemberProfile.create({
      data: {
        ownerId: userId,
        githubUsername: githubUser.login,
        name: githubUser.name || githubUser.login,
        avatar: githubUser.avatar_url,
        bio: githubUser.bio,
        location: githubUser.location,
        publicRepos: githubUser.public_repos,
        followers: githubUser.followers,
        following: githubUser.following,
        commits: 0,
        pullRequests: 0,
        issues: 0
      }
    });
    
    logger.info('Added team member to database', { 
      userId, 
      githubUsername,
      memberName: newMember.name,
      memberId: newMember.id
    });
    
    // Format response
    const formattedMember = {
      id: newMember.id,
      name: newMember.name,
      githubUsername: newMember.githubUsername,
      avatar: newMember.avatar,
      bio: newMember.bio,
      location: newMember.location,
      publicRepos: newMember.publicRepos,
      followers: newMember.followers,
      following: newMember.following,
      joinedAt: newMember.joinedAt.toISOString(),
      commits: newMember.commits,
      pullRequests: newMember.pullRequests,
      issues: newMember.issues
    };
    
    res.json({
      success: true,
      data: {
        member: formattedMember
      }
    });
  } catch (error) {
    logger.error('Failed to add team member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add team member'
    });
  }
});

// Remove team member
router.delete('/members/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.user?.id || '0');
    const memberId = parseInt(req.params.id);
    
    // Delete from database
    const deletedMember = await (prisma as any).teamMemberProfile.delete({
      where: {
        id: memberId,
        ownerId: userId // Ensure user can only delete their own team members
      }
    });
    
    logger.info('Removed team member from database', { 
      userId, 
      memberId,
      memberName: deletedMember.name
    });
    
    res.json({
      success: true,
      data: {
        deletedMember: {
          id: deletedMember.id,
          name: deletedMember.name,
          githubUsername: deletedMember.githubUsername
        }
      }
    });
  } catch (error) {
    logger.error('Failed to remove team member:', error);
    
    if ((error as any).code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to remove team member'
    });
  }
});

export default router;
