import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DashboardCard from '@/components/dashboard/card'
import { GitCommit, Code, Users, Trophy, Plus, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { addTeamMemberToChat } from '@/data/chat-mock'
import { apiClient, transformToRebelRanking } from "@/lib/api"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useToast } from '@/components/ui/toast'
import { useChatState } from '@/components/chat/use-chat-state'
import { Trash2 } from 'lucide-react'

interface RebelRanking {
  id: number
  name: string
  handle: string
  points: number
  avatar: string
  featured?: boolean
  subtitle?: string
  streak?: string
}

interface DeveloperRankingProps {
  developers?: RebelRanking[]
}

export default function DeveloperRanking({ developers: propDevelopers }: DeveloperRankingProps) {
  const [developers, setDevelopers] = useState<RebelRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [removingMember, setRemovingMember] = useState<number | null>(null);
  const { showToast } = useToast();
  const { addTeamMemberToChat } = useChatState();

  useEffect(() => {
    const fetchTeamData = async () => {
      // Check if user is authenticated by checking session
      try {
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        
        if (!sessionData.user || sessionData.user.id === 'demo-user') {
          console.log('Demo mode: using mock team data');
          // Set mock team data for demo mode
          const mockTeam: RebelRanking[] = [
            {
              id: 1,
              name: 'ALEX',
              handle: '@ALEX_DEV',
              points: 142,
              avatar: '/avatars/user_alex.png',
              featured: true,
              subtitle: 'Lead Developer',
              streak: '7 day streak'
            },
            {
              id: 2, 
              name: 'SARAH',
              handle: '@SARAH_CODE',
              points: 98,
              avatar: '/avatars/user_sarah.png',
              featured: false,
              streak: '3 day streak'
            },
            {
              id: 3,
              name: 'MIKE',
              handle: '@MIKE_JS',
              points: 76,
              avatar: '/avatars/user_mike.png',
              featured: false,
              streak: '5 day streak'
            }
          ];
          setDevelopers(mockTeam);
          setLoading(false);
          return;
        }
        
        console.log('Authenticated user detected, fetching real team data');
      } catch (error) {
        console.error('Error checking session:', error);
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.getTeamMembers();
        console.log('📊 Team members response:', response);
        if (response.success && response.data.teamMembers) {
          const transformedData = transformToRebelRanking(response.data.teamMembers);
          console.log('🔄 Transformed team data:', transformedData);
          setDevelopers(transformedData);
        }
      } catch (error) {
        console.error('Failed to fetch team data:', error);
        // Use prop data or fallback
        if (propDevelopers) {
          setDevelopers(propDevelopers);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [propDevelopers]);

  const addTeamMember = async () => {
    if (!newMemberUsername.trim()) return;
    
    setAddingMember(true);
    try {
      // Check if user is authenticated
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();
      
      if (!sessionData.user || sessionData.user.id === 'demo-user') {
        // In demo mode, just add to local state
        const githubResponse = await fetch(`https://api.github.com/users/${newMemberUsername.trim()}`);
        if (!githubResponse.ok) {
          throw new Error('GitHub user not found');
        }
        
        const githubUser = await githubResponse.json();
        
        const newMember: RebelRanking = {
          id: developers.length + 1,
          name: githubUser.name?.toUpperCase() || githubUser.login.toUpperCase(),
          handle: `@${githubUser.login}`,
          points: Math.floor(Math.random() * 100),
          avatar: githubUser.avatar_url,
          featured: false,
          streak: 'New member'
        };
        
        setDevelopers(prev => [...prev, newMember]);
        
        // Add to chat system directly
        console.log('🔄 Adding team member to chat:', {
          id: newMember.id,
          name: newMember.name,
          githubUsername: githubUser.login,
          avatar: newMember.avatar
        });
        await addTeamMemberToChat({
          id: newMember.id,
          name: newMember.name,
          githubUsername: githubUser.login,
          avatar: newMember.avatar
        });
        console.log('✅ Team member added to chat state');
        
        showToast({
          title: "Team Member Added",
          description: `${newMember.name} has been successfully added to your team!`,
          variant: "success"
        });
        
        console.log('Added team member to demo mode:', newMember);
      } else {
        // In authenticated mode, use backend API
        const response = await fetch('/api/team/members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            githubUsername: newMemberUsername.trim()
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add team member');
        }
        
        const result = await response.json();
        const backendMember = result.data.member;
        
        // Convert backend member to frontend format
        const newMember: RebelRanking = {
          id: backendMember.id,
          name: backendMember.name.toUpperCase(),
          handle: `@${backendMember.githubUsername}`,
          points: backendMember.commits + backendMember.pullRequests + backendMember.issues,
          avatar: backendMember.avatar,
          featured: false,
          streak: 'New member'
        };
        
        setDevelopers(prev => [...prev, newMember]);
        
        // Add to chat system directly
        await addTeamMemberToChat({
          id: backendMember.id,
          name: backendMember.name,
          githubUsername: backendMember.githubUsername,
          avatar: backendMember.avatar
        });
        
        showToast({
          title: "Team Member Added",
          description: `${backendMember.name} has been successfully added to your team!`,
          variant: "success"
        });
        
        console.log('Added team member via backend:', newMember);
      }
      
      setNewMemberUsername('');
      setShowAddMember(false);
    } catch (error) {
      console.error('Failed to add team member:', error);
      showToast({
        title: "Failed to Add Member",
        description: `Could not add team member: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "error"
      });
    } finally {
      setAddingMember(false);
    }
  };

  const removeTeamMember = async (memberId: number) => {
    const memberToRemove = developers.find(dev => dev.id === memberId);
    const memberName = memberToRemove?.name || 'Unknown';
    const memberHandle = memberToRemove?.handle || '@unknown';
    
    if (!memberToRemove) {
      console.error('Member not found for removal');
      return;
    }
    
    setRemovingMember(memberId);
    try {
      // Check if user is authenticated
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();
      
      if (!sessionData.user || sessionData.user.id === 'demo-user') {
        // In demo mode, just remove from local state
        setDevelopers(prev => prev.filter(dev => dev.id !== memberId));
        
        // Remove from chat system in demo mode
        try {
          await apiClient.removeChatUser(memberHandle.replace('@', ''));
          console.log('🗑️ Removed member from chat system (demo mode)');
        } catch (error) {
          console.error('Failed to remove member from chat:', error);
        }
        
        showToast({
          title: "Team Member Removed",
          description: `${memberName} has been removed from your team.`,
          variant: "success"
        });
      } else {
        // In authenticated mode, use backend API
        const response = await fetch(`/api/team/members/${memberId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to remove team member');
        }
        
        setDevelopers(prev => prev.filter(dev => dev.id !== memberId));
        
        // Remove from chat system
        try {
          await apiClient.removeChatUser(memberHandle.replace('@', ''));
          console.log('🗑️ Removed member from chat system');
        } catch (error) {
          console.error('Failed to remove member from chat:', error);
        }
        
        showToast({
          title: "Team Member Removed",
          description: `${memberName} has been removed from your team.`,
          variant: "success"
        });
      }
      
    } catch (error) {
      console.error('Failed to remove team member:', error);
      showToast({
        title: "Failed to Remove Member",
        description: `Could not remove ${memberName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "error"
      });
    } finally {
      setRemovingMember(null);
    }
  };

  const getActivityIcon = (index: number) => {
    const icons = [GitCommit, Code, Users, Trophy]
    const Icon = icons[index % icons.length]
    return <Icon className="size-3" />
  }

  return (
    <DashboardCard
      title="TEAM CONTRIBUTORS"
      intent="default"
      addon={
        <div className="flex items-center gap-2">
          <Badge variant="outline-success">+2 THIS WEEK</Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddMember(!showAddMember)}
            className="h-6 px-2"
          >
            <Plus className="size-3 mr-1" />
            Add Member
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Add Member Form */}
        {showAddMember && (
          <div className="border rounded-lg p-3 bg-accent/50">
            <div className="flex items-center gap-2">
              <Input
                placeholder="GitHub username"
                value={newMemberUsername}
                onChange={(e) => setNewMemberUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTeamMember()}
                className="flex-1 h-8"
                disabled={addingMember}
              />
              <Button
                size="sm"
                onClick={addTeamMember}
                disabled={addingMember || !newMemberUsername.trim()}
                className="h-8 px-3"
              >
                {addingMember ? 'Adding...' : 'Add'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowAddMember(false);
                  setNewMemberUsername('');
                }}
                className="h-8 px-2"
              >
                <X className="size-3" />
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-1 w-full">
                <div className="h-8 w-8 bg-muted/50 rounded mr-2"></div>
                <div className="size-10 bg-muted/30 rounded-lg"></div>
                <div className="flex flex-1 h-full items-center justify-between py-2 px-2.5">
                  <div className="flex flex-col flex-1 gap-2">
                    <div className="h-4 bg-muted/40 rounded w-24"></div>
                    <div className="h-3 bg-muted/20 rounded w-16"></div>
                  </div>
                  <div className="h-6 bg-muted/30 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))
        ) : developers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="size-8 mx-auto mb-2 opacity-50" />
            <p>No team data available</p>
          </div>
        ) : (
          developers.map((developer, index) => (
            <div key={developer.id} className="flex items-center justify-between">
            <div className="flex items-center gap-1 w-full">
              <div
                className={cn(
                  "flex items-center justify-center rounded text-sm font-bold px-1.5 mr-1 md:mr-2",
                  developer.featured
                    ? "h-10 bg-primary text-primary-foreground"
                    : "h-8 bg-secondary text-secondary-foreground",
                )}
              >
                {developer.id}
              </div>
              <div
                className={cn(
                  "rounded-lg overflow-hidden bg-muted",
                  developer.featured ? "size-14 md:size-16" : "size-10 md:size-12",
                )}
              >
                {developer.avatar ? (
                  <Image
                    src={developer.avatar || "/placeholder.svg"}
                    alt={developer.name}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    {getActivityIcon(index)}
                  </div>
                )}
              </div>
              <div
                className={cn(
                  "flex flex-1 h-full items-center justify-between py-2 px-2.5 rounded",
                  developer.featured && "bg-accent",
                )}
              >
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={cn(
                          "font-display",
                          developer.featured ? "text-xl md:text-2xl" : "text-lg md:text-xl",
                        )}
                      >
                        {developer.name}
                      </span>
                      <span className="text-muted-foreground text-xs md:text-sm">{developer.handle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={developer.featured ? "default" : "secondary"}>{developer.points} COMMITS</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTeamMember(developer.id)}
                        disabled={removingMember === developer.id}
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        title="Remove team member"
                      >
                        {removingMember === developer.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                        ) : (
                          <Trash2 className="size-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {developer.subtitle && (
                    <span className="text-sm text-muted-foreground italic">{developer.subtitle}</span>
                  )}
                  {developer.streak && !developer.featured && (
                    <span className="text-sm text-success italic">{developer.streak}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </DashboardCard>
  )
}
