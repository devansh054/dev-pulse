import { create } from "zustand";
import type { ChatState, ChatMessage, ChatConversation } from "@/types/chat";
import { mockChatData } from "@/data/chat-mock";
import { apiClient } from "@/lib/api";

type ChatComponentState = {
  state: ChatState;
  activeConversation?: string;
};

interface ChatStore {
  // State
  chatState: ChatComponentState;
  conversations: ChatConversation[];
  newMessage: string;
  isAuthenticated: boolean;
  currentUser: any;

  // Actions
  setChatState: (state: ChatComponentState) => void;
  setConversations: (conversations: ChatConversation[]) => void;
  setNewMessage: (message: string) => void;
  setAuthenticated: (isAuth: boolean, user?: any) => void;
  handleSendMessage: () => void;
  openConversation: (conversationId: string) => void;
  goBack: () => void;
  toggleExpanded: () => void;
  loadConversations: () => Promise<void>;
  sendRealMessage: (content: string, receiverId: string) => Promise<void>;
  refreshConversations: () => void;
  addTeamMemberToChat: (member: { id: number; name: string; githubUsername: string; avatar: string; }) => void;
}

const chatStore = create<ChatStore>((set, get) => ({
  // Initial state
  chatState: {
    state: "collapsed",
  },
  conversations: mockChatData.conversations,
  newMessage: "",
  isAuthenticated: false,
  currentUser: null,

  // Actions
  setChatState: (chatState) => set({ chatState }),

  setConversations: (conversations) => set({ conversations }),

  setNewMessage: (newMessage) => set({ newMessage }),

  setAuthenticated: (isAuth, user) => {
    set({ isAuthenticated: isAuth, currentUser: user });
    if (isAuth && user && user.id !== 'demo-user') {
      // Load real conversations only when truly authenticated (not demo mode)
      get().loadConversations();
    } else {
      // Use mock data when not authenticated or in demo mode
      set({ conversations: mockChatData.conversations });
    }
  },

  loadConversations: async () => {
    try {
      const response: any = await apiClient.getChatConversations();
      
      if (response.success && response.data) {
        set({ 
          conversations: response.data.conversations || [],
          currentUser: response.data.currentUser 
        });
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      // Fallback to empty conversations for authenticated users
      set({ conversations: [] });
    }
  },

  sendRealMessage: async (content, receiverId) => {
    try {
      const response: any = await apiClient.sendChatMessage(content, receiverId);
      
      if (response.success) {
        // Reload conversations to get updated messages
        await get().loadConversations();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },

  handleSendMessage: () => {
    const { newMessage, conversations, chatState, isAuthenticated, currentUser } = get();
    const activeConv = conversations.find(
      (conv) => conv.id === chatState.activeConversation
    );

    if (!newMessage.trim() || !activeConv) return;

    if (isAuthenticated && currentUser) {
      // Send real message for authenticated users
      const partnerId = activeConv.participants.find(p => p.id !== currentUser.id)?.id;
      if (partnerId) {
        get().sendRealMessage(newMessage.trim(), partnerId);
        set({ newMessage: "" });
      }
    } else {
      // Mock message handling for demo mode
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        senderId: mockChatData.currentUser.id,
        isFromCurrentUser: true,
      };

      const updatedConversations = conversations.map((conv) =>
        conv.id === activeConv.id
          ? {
              ...conv,
              messages: [...conv.messages, message],
              lastMessage: message,
            }
          : conv
      );

      set({
        conversations: updatedConversations,
        newMessage: "",
      });
    }
  },

  openConversation: (conversationId) => {
    const { conversations } = get();

    // Update chat state
    set({
      chatState: { state: "conversation", activeConversation: conversationId },
    });

    // Mark conversation as read
    const updatedConversations = conversations.map((conv) =>
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    );

    set({ conversations: updatedConversations });
  },

  goBack: () => {
    const { chatState } = get();
    if (chatState.state === "conversation") {
      set({ chatState: { state: "expanded" } });
    } else {
      set({ chatState: { state: "collapsed" } });
    }
  },

  toggleExpanded: () => {
    const { chatState } = get();
    set({
      chatState: {
        state: chatState.state === "collapsed" ? "expanded" : "collapsed",
      },
    });
  },

  refreshConversations: () => {
    // Force refresh conversations from mock data to pick up new team members
    set({ conversations: [...mockChatData.conversations] });
  },

  addTeamMemberToChat: async (member: {
    id: number;
    name: string;
    githubUsername: string;
    avatar: string;
  }) => {
    console.log('💬 addTeamMemberToChat called with:', member);
    const { conversations, isAuthenticated } = get();
    console.log('📋 Current conversations count:', conversations.length);
    console.log('🔐 Is authenticated:', isAuthenticated);
    
    // Check if conversation already exists
    const existingConv = conversations.find(conv => 
      conv.id === `conv-${member.githubUsername}`
    );
    
    if (existingConv) {
      console.log('⚠️ Conversation already exists for:', member.githubUsername);
      return; // Don't add duplicate
    }

    // If authenticated, send a welcome message to backend to create the conversation
    if (isAuthenticated) {
      try {
        console.log('🚀 Sending welcome message to backend for:', member.githubUsername);
        
        // First register the team member user in chat backend
        try {
          await fetch('/api/chat/register-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              userId: member.githubUsername,
              name: member.name,
              avatar: member.avatar
            })
          });
        } catch (error) {
          console.warn('Failed to register user in chat:', error);
        }
        
        await apiClient.sendChatMessage(
          `Hey ${member.name}! Welcome to the team! 🎉`,
          member.githubUsername
        );
        console.log('✅ Welcome message sent to backend');
        
        // Reload conversations to get the new conversation from backend
        await get().loadConversations();
        console.log('🔄 Conversations reloaded from backend');
        return;
      } catch (error) {
        console.error('❌ Failed to create backend conversation:', error);
        // Fall back to local conversation creation
      }
    }
    
    const newUser = {
      id: member.githubUsername,
      name: member.name.toUpperCase(),
      username: `@${member.githubUsername.toUpperCase()}`,
      avatar: member.avatar,
      isOnline: Math.random() > 0.5,
    };

    const newConversation = {
      id: `conv-${member.githubUsername}`,
      participants: [mockChatData.currentUser, newUser],
      unreadCount: 1,
      lastMessage: {
        id: `msg-${member.githubUsername}-welcome`,
        content: `HEY ${mockChatData.currentUser.name}! THANKS FOR ADDING ME TO THE TEAM!`,
        timestamp: new Date().toISOString(),
        senderId: member.githubUsername,
        isFromCurrentUser: false,
      },
      messages: [
        {
          id: `msg-${member.githubUsername}-welcome`,
          content: `HEY ${mockChatData.currentUser.name}! THANKS FOR ADDING ME TO THE TEAM!`,
          timestamp: new Date().toISOString(),
          senderId: member.githubUsername,
          isFromCurrentUser: false,
        },
      ],
    };

    // Add to beginning of conversations list
    console.log('🎉 Creating new conversation:', newConversation);
    const updatedConversations = [newConversation, ...conversations];
    console.log('📊 Updated conversations count:', updatedConversations.length);
    set({ conversations: updatedConversations });
    console.log('✅ Chat state updated successfully');
  },
}));

// Hook with computed values using selectors
export const useChatState = () => {
  const chatState = chatStore((state) => state.chatState);
  const conversations = chatStore((state) => state.conversations);
  const newMessage = chatStore((state) => state.newMessage);
  const isAuthenticated = chatStore((state) => state.isAuthenticated);
  const currentUser = chatStore((state) => state.currentUser);
  const setChatState = chatStore((state) => state.setChatState);
  const setConversations = chatStore((state) => state.setConversations);
  const setNewMessage = chatStore((state) => state.setNewMessage);
  const setAuthenticated = chatStore((state) => state.setAuthenticated);
  const handleSendMessage = chatStore((state) => state.handleSendMessage);
  const openConversation = chatStore((state) => state.openConversation);
  const goBack = chatStore((state) => state.goBack);
  const toggleExpanded = chatStore((state) => state.toggleExpanded);
  const loadConversations = chatStore((state) => state.loadConversations);
  const sendRealMessage = chatStore((state) => state.sendRealMessage);
  const refreshConversations = chatStore((state) => state.refreshConversations);
  const addTeamMemberToChat = chatStore((state) => state.addTeamMemberToChat);

  // Computed values
  const totalUnreadCount = conversations.reduce(
    (total, conv) => total + conv.unreadCount,
    0
  );

  const activeConversation = conversations.find(
    (conv) => conv.id === chatState.activeConversation
  );

  return {
    chatState,
    conversations,
    newMessage,
    isAuthenticated,
    currentUser,
    totalUnreadCount,
    activeConversation,
    setChatState,
    setConversations,
    setNewMessage,
    setAuthenticated,
    handleSendMessage,
    openConversation,
    goBack,
    toggleExpanded,
    loadConversations,
    sendRealMessage,
    refreshConversations,
    addTeamMemberToChat,
  };
};
