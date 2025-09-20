import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name?: string;
    username?: string;
    avatar?: string;
  };
}

const router = Router();

// In-memory storage for demo (use database in production)
interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  isFromCurrentUser: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isOnline: boolean;
}

const messages: ChatMessage[] = [];
const users: Record<string, ChatUser> = {};

// Get chat conversations for authenticated user
router.get('/conversations', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Get user's conversations (messages where they are sender or receiver)
    const userMessages = messages.filter(
      msg => msg.senderId === userId || msg.receiverId === userId
    );

    // Group by conversation partner
    const conversations: Record<string, any> = {};
    
    userMessages.forEach(msg => {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      
      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          id: `conv-${partnerId}`,
          participants: [
            { id: userId, name: req.user?.name || 'You', avatar: req.user?.avatar },
            users[partnerId] || { id: partnerId, name: `User ${partnerId}`, avatar: '/avatars/default.png' }
          ],
          messages: [],
          unreadCount: 0,
          lastMessage: null
        };
      }
      
      conversations[partnerId].messages.push(msg);
      conversations[partnerId].lastMessage = msg;
    });

    // Sort messages in each conversation by timestamp
    Object.values(conversations).forEach((conv: any) => {
      conv.messages.sort((a: ChatMessage, b: ChatMessage) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    });

    res.json({
      success: true,
      data: {
        currentUser: {
          id: userId,
          name: req.user?.name || 'You',
          username: `@${req.user?.username || 'user'}`,
          avatar: req.user?.avatar || '/avatars/default.png',
          isOnline: true
        },
        conversations: Object.values(conversations)
      }
    });
  } catch (error) {
    logger.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
});

// Send a new message
router.post('/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content, receiverId } = req.body;
    const senderId = req.user?.id;

    if (!senderId || !content || !receiverId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: content, receiverId' 
      });
    }

    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      senderId,
      receiverId,
      timestamp: new Date().toISOString(),
      isFromCurrentUser: true
    };

    messages.push(message);

    // Register users if not exists
    if (!users[senderId]) {
      users[senderId] = {
        id: senderId,
        name: req.user?.name || 'You',
        username: `@${req.user?.username || 'user'}`,
        avatar: req.user?.avatar || '/avatars/default.png',
        isOnline: true
      };
    }

    // Register receiver if not exists (for team members)
    if (!users[receiverId]) {
      users[receiverId] = {
        id: receiverId,
        name: receiverId.toUpperCase(),
        username: `@${receiverId.toUpperCase()}`,
        avatar: '/avatars/default.png',
        isOnline: Math.random() > 0.5
      };
    }

    logger.info(`Message sent from ${senderId} to ${receiverId}: ${content}`);

    res.json({
      success: true,
      data: { message }
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:partnerId/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { partnerId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const conversationMessages = messages.filter(
      msg => 
        (msg.senderId === userId && msg.receiverId === partnerId) ||
        (msg.senderId === partnerId && msg.receiverId === userId)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    res.json({
      success: true,
      data: { messages: conversationMessages }
    });
  } catch (error) {
    logger.error('Error fetching conversation messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// Update user avatar
router.put('/profile/avatar', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { avatar } = req.body;

    if (!userId || !avatar) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: avatar' 
      });
    }

    // Update user avatar in users store
    if (users[userId]) {
      users[userId].avatar = avatar;
    }

    logger.info(`User ${userId} updated avatar to: ${avatar}`);

    res.json({
      success: true,
      data: { avatar }
    });
  } catch (error) {
    logger.error('Error updating avatar:', error);
    res.status(500).json({ success: false, message: 'Failed to update avatar' });
  }
});

// Register a user in chat system
router.post('/register-user', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, name, avatar } = req.body;
    
    if (!userId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, name'
      });
    }

    // Register the user
    users[userId] = {
      id: userId,
      name: name.toUpperCase(),
      username: `@${userId.toUpperCase()}`,
      avatar: avatar || '/avatars/default.png',
      isOnline: Math.random() > 0.5
    };

    logger.info(`User registered in chat: ${userId} (${name})`);

    res.json({
      success: true,
      data: { user: users[userId] }
    });
  } catch (error) {
    logger.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Failed to register user' });
  }
});

// Remove user from chat system
router.delete('/remove-user/:userId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId parameter'
      });
    }

    // Remove user from users registry
    delete users[userId];

    // Remove all messages involving this user
    const messagesToRemove = messages.filter(msg => 
      msg.senderId === userId || msg.receiverId === userId
    );
    
    messagesToRemove.forEach(msg => {
      const index = messages.indexOf(msg);
      if (index > -1) {
        messages.splice(index, 1);
      }
    });

    logger.info(`User removed from chat: ${userId}, removed ${messagesToRemove.length} messages`);

    res.json({
      success: true,
      data: { 
        removedUser: userId,
        removedMessages: messagesToRemove.length
      }
    });
  } catch (error) {
    logger.error('Error removing user from chat:', error);
    res.status(500).json({ success: false, message: 'Failed to remove user from chat' });
  }
});

// Get online users
router.get('/users/online', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const onlineUsers = Object.values(users).filter(user => user.isOnline);
    
    res.json({
      success: true,
      data: { users: onlineUsers }
    });
  } catch (error) {
    logger.error('Error fetching online users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch online users' });
  }
});

export default router;
