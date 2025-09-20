"use client"

import { useState, useEffect } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { SidebarProvider } from "@/components/ui/sidebar"
import EmailIcon from "@/components/icons/email"
import DashboardStat from "@/components/dashboard/stat"
import GearIcon from "@/components/icons/gear"
import BoomIcon from "@/components/icons/boom"
import MonkeyIcon from "@/components/icons/monkey"
import { useAuth } from "@/hooks/useAuth"
import { communicationsApi } from "@/lib/api"

// Mock data for communication
const communicationStats = [
  {
    label: "Active Channels",
    value: "12",
    description: "Team communication channels",
    icon: "email",
    tag: "ACTIVE",
    intent: "positive" as const,
    direction: "up" as const
  },
  {
    label: "Messages Today",
    value: "247",
    description: "Team messages sent",
    icon: "boom", 
    tag: "HIGH",
    intent: "neutral" as const,
    direction: "up" as const
  },
  {
    label: "Response Time",
    value: "4.2m",
    description: "Average response time",
    icon: "gear",
    tag: "FAST",
    intent: "positive" as const,
    direction: "down" as const
  }
]

const mockChannels = [
  {
    id: "ch-001",
    name: "general",
    type: "public",
    members: 24,
    lastMessage: "Great work on the new feature!",
    lastActivity: "2 minutes ago",
    unread: 3,
    status: "active"
  },
  {
    id: "ch-002", 
    name: "development",
    type: "private",
    members: 8,
    lastMessage: "The API tests are passing now",
    lastActivity: "5 minutes ago",
    unread: 0,
    status: "active"
  },
  {
    id: "ch-003",
    name: "design-review",
    type: "public",
    members: 12,
    lastMessage: "Updated the mockups based on feedback",
    lastActivity: "1 hour ago",
    unread: 7,
    status: "active"
  },
  {
    id: "ch-004",
    name: "random",
    type: "public",
    members: 18,
    lastMessage: "Anyone up for coffee?",
    lastActivity: "3 hours ago",
    unread: 0,
    status: "quiet"
  }
]

const mockMessages = [
  {
    id: "msg-001",
    channel: "development",
    author: "Alice Johnson",
    avatar: "/avatars/alice.png",
    message: "Just pushed the fix for the authentication bug. Can someone review?",
    timestamp: "2 minutes ago",
    reactions: ["👍", "🚀"]
  },
  {
    id: "msg-002",
    channel: "general",
    author: "Bob Smith",
    avatar: "/avatars/bob.png", 
    message: "Great job everyone on hitting our sprint goals! 🎉",
    timestamp: "15 minutes ago",
    reactions: ["🎉", "👏", "💪"]
  },
  {
    id: "msg-003",
    channel: "design-review",
    author: "Carol Davis",
    avatar: "/avatars/carol.png",
    message: "I've updated the user flow diagrams. Please take a look when you have a chance.",
    timestamp: "1 hour ago",
    reactions: ["👀"]
  }
]

// Icon mapping
const iconMap = {
  gear: GearIcon,
  email: EmailIcon,
  boom: BoomIcon,
}

export default function CommunicationPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [stats, setStats] = useState(communicationStats)
  const [channels, setChannels] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelType, setNewChannelType] = useState<'public' | 'private'>('public')
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  useEffect(() => {
    const fetchCommunicationData = async () => {
      console.log('🔍 Auth state:', { isAuthenticated, isLoading })
      
      // Always try to fetch real data first, fall back to mock if it fails
      try {
        setLoading(true)
        setError(null)
        console.log('🚀 Attempting to fetch real communication data...')
        
        const [statsResponse, channelsResponse, messagesResponse] = await Promise.all([
          communicationsApi.getCommunicationStats(),
          communicationsApi.getCommunicationChannels(),
          communicationsApi.getCommunicationMessages()
        ])

        console.log('📊 API Responses:', { statsResponse, channelsResponse, messagesResponse })

        if (statsResponse.success && statsResponse.data) {
          const apiStats = statsResponse.data
          setStats([
            {
              label: "Active Channels",
              value: apiStats.activeChannels.toString(),
              description: "Team communication channels",
              icon: "email",
              tag: "ACTIVE",
              intent: "positive" as const,
              direction: "up" as const
            },
            {
              label: "Messages Today",
              value: apiStats.messagesToday.toString(),
              description: "Team messages sent",
              icon: "boom",
              tag: apiStats.messagesToday > 200 ? "HIGH" : "NORMAL",
              intent: "neutral" as const,
              direction: "up" as const
            },
            {
              label: "Response Time",
              value: apiStats.avgResponseTime,
              description: "Average response time",
              icon: "gear",
              tag: "FAST",
              intent: "positive" as const,
              direction: "down" as const
            }
          ])
          console.log('✅ Updated stats with real data')
        }

        if (channelsResponse.success && channelsResponse.data.channels) {
          setChannels(channelsResponse.data.channels)
          console.log('✅ Updated channels with real data:', channelsResponse.data.channels.length, 'channels')
        } else {
          console.log('⚠️ Channels API failed, using mock data')
          setChannels(mockChannels)
        }

        if (messagesResponse.success && messagesResponse.data.messages) {
          setMessages(messagesResponse.data.messages)
          console.log('✅ Updated messages with real data:', messagesResponse.data.messages.length, 'messages')
        } else {
          console.log('⚠️ Messages API failed, using mock data')
          setMessages(mockMessages)
        }
      } catch (error: any) {
        console.error('❌ Error fetching communication data:', error)
        console.log('🔒 Falling back to mock data due to error')
        setError(`Authentication required or API error: ${error.message}`)
        setChannels(mockChannels)
        setMessages(mockMessages)
      } finally {
        setLoading(false)
      }
    }

    fetchCommunicationData()
  }, [isAuthenticated])

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return

    try {
      setIsCreatingChannel(true)
      console.log('🚀 Creating channel:', { name: newChannelName, type: newChannelType })
      
      const response = await communicationsApi.createCommunicationChannel({
        name: newChannelName,
        type: newChannelType,
        description: `${newChannelName} channel`
      })
      
      console.log('📡 API Response:', response)

      if (response.success) {
        console.log('✅ Channel created successfully:', response.data.channel)
        
        // Add the new channel to existing channels
        const newChannel = response.data.channel
        setChannels(prevChannels => [...prevChannels, newChannel])
        
        // Clear form
        setNewChannelName('')
        setNewChannelType('public')
        
        console.log('✅ Channel added to UI')
      } else {
        console.error('❌ Channel creation failed:', response)
        setError(response.error || 'Failed to create channel')
      }
    } catch (error: any) {
      console.error('Error creating channel:', error)
      setError(error.message)
    } finally {
      setIsCreatingChannel(false)
    }
  }

  const handleViewAnalytics = async () => {
    try {
      console.log('🚀 Fetching communication analytics...')
      const response = await communicationsApi.getCommunicationAnalytics()
      console.log('📡 Analytics API Response:', response)
      
      if (response.success) {
        console.log('✅ Communication analytics:', response.data)
        setAnalyticsData(response.data)
        setShowAnalyticsModal(true)
      } else {
        console.error('❌ Analytics fetch failed:', response)
        setError('Failed to fetch analytics: ' + (response.error || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('❌ Error fetching analytics:', error)
      setError('Error fetching analytics: ' + error.message)
    }
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Communication",
        description: `Team communication and collaboration • ${channels.length} active channels`,
      }}
    >
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading communication data...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">Error loading data: {error}</p>
        </div>
      )}

      {/* Communication Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <DashboardStat
            key={index}
            label={stat.label}
            value={stat.value}
            description={stat.description}
            icon={iconMap[stat.icon as keyof typeof iconMap]}
            tag={stat.tag}
            intent={stat.intent}
            direction={stat.direction}
          />
        ))}
      </div>

      {/* Channels Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Active Channels</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {channels.map((channel: any) => (
            <div 
              key={channel.id} 
              className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => {
                if (channel.htmlUrl) {
                  window.open(channel.htmlUrl, '_blank');
                } else {
                  console.log(`Clicked channel: ${channel.name}`);
                  // Future: Navigate to channel detail page
                }
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">#</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">#{channel.name}</h3>
                    <p className="text-sm text-muted-foreground">{channel.members} members</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {channel.unread > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {channel.unread}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    channel.type === 'private' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {channel.type.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{channel.lastMessage}</p>
              </div>

              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Last activity: {channel.lastActivity}</span>
                <div className={`w-2 h-2 rounded-full ${
                  channel.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Messages */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
        <div className="space-y-4">
          {messages.map((message: any) => (
            <div key={message.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MonkeyIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{message.author}</span>
                    <span className="text-sm text-muted-foreground">in #{message.channel}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{message.timestamp}</span>
                    {message.isOwn && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">You</span>
                    )}
                  </div>
                  <p className="text-sm mb-3">{message.message}</p>
                  <div className="flex items-center gap-2">
                    {message.reactions.map((reaction: string, index: number) => (
                      <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {reaction}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Create Channel</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start a new communication channel for your team or project.
          </p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Channel name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
            />
            <select
              value={newChannelType}
              onChange={(e) => setNewChannelType(e.target.value as 'public' | 'private')}
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <button 
              onClick={handleCreateChannel}
              disabled={!newChannelName.trim() || isCreatingChannel}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingChannel ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Message Analytics</h3>
          <p className="text-sm text-muted-foreground mb-4">
            View detailed communication metrics and team collaboration insights.
          </p>
          <button 
            onClick={handleViewAnalytics}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/90 transition-colors"
          >
            View Analytics
          </button>
        </div>
      </div>

      {/* Analytics Modal */}
      {showAnalyticsModal && analyticsData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  📊 Communication Analytics
                </h2>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Message Volume */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    📈 Message Volume
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Today:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{analyticsData.messageVolume?.today || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">This Week:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{analyticsData.messageVolume?.thisWeek || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">This Month:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{analyticsData.messageVolume?.thisMonth || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Response Metrics */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    ⏱️ Response Metrics
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Avg Response Time:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{analyticsData.responseMetrics?.avgResponseTime || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Response Rate:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{analyticsData.responseMetrics?.responseRate || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Team Activity */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    👥 Team Activity
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Most Active Channel:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{analyticsData.teamActivity?.mostActiveChannel || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Peak Hours:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{analyticsData.teamActivity?.peakHours || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Active Members:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{analyticsData.teamActivity?.activeMembers || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Engagement */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    🔥 Engagement
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Reactions:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{analyticsData.engagement?.totalReactions || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Messages per Day:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{analyticsData.engagement?.messagesPerDay || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Thread Participation:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{analyticsData.engagement?.threadParticipation || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardPageLayout>
  )
}
