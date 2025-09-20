import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bullet } from "@/components/ui/bullet"
import { Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"

interface AIInsight {
  id: string
  title: string
  description: string
  type: 'productivity' | 'code_quality' | 'collaboration' | 'performance'
  priority: 'high' | 'medium' | 'low'
  actionable: boolean
  timestamp: string
}

export default function AIInsightsCard() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0)

  useEffect(() => {
    const fetchInsights = async () => {
      // Check if we're in demo mode
      const isDemoMode = document.cookie.includes('demo_mode=true') || 
                        new URLSearchParams(window.location.search).get('demo') === 'true';
      
      if (isDemoMode) {
        console.log('Demo mode: using mock AI insights');
        setLoading(false);
        return;
      }

      // Check if user is authenticated by checking session
      try {
        const sessionResponse = await fetch('http://localhost:3001/api/auth/session', {
          credentials: 'include'
        });
        const sessionData = await sessionResponse.json();
        
        if (!sessionData.user || sessionData.user.id === 'demo-user') {
          console.log('No authenticated user: using mock data');
          setLoading(false);
          return;
        }
        
        console.log('Authenticated user detected, fetching real AI insights data');
      } catch (error) {
        console.error('Error checking session:', error);
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.getAIInsights('1') // Using default user ID
        if (response.success) {
          setInsights(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch AI insights:', error)
        // Keep default mock insight on error
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  const mockInsights = [
    {
      id: 'mock1',
      title: 'Productivity Peak Hours',
      description: 'Your most productive coding hours are between 10-11 AM. Consider scheduling complex tasks during this window to maximize your output by up to 23%.',
      type: 'productivity' as const,
      priority: 'high' as const,
      actionable: true,
      timestamp: new Date().toISOString()
    },
    {
      id: 'mock2',
      title: 'Code Quality Focus',
      description: 'Your recent commits show excellent consistency. Consider adding more unit tests to maintain this quality standard across all repositories.',
      type: 'code_quality' as const,
      priority: 'medium' as const,
      actionable: true,
      timestamp: new Date().toISOString()
    },
    {
      id: 'mock3',
      title: 'Collaboration Opportunity',
      description: 'You have 3 pending pull request reviews. Engaging with team code reviews can improve knowledge sharing by 40%.',
      type: 'collaboration' as const,
      priority: 'medium' as const,
      actionable: true,
      timestamp: new Date().toISOString()
    },
    {
      id: 'mock4',
      title: 'Performance Optimization',
      description: 'Your TypeScript usage has increased 15% this month. Consider exploring advanced TypeScript patterns to further enhance code reliability.',
      type: 'performance' as const,
      priority: 'low' as const,
      actionable: true,
      timestamp: new Date().toISOString()
    },
    {
      id: 'mock5',
      title: 'Weekly Code Review',
      description: 'You completed 8 code reviews this week, improving team velocity by 18%. Keep up the collaborative momentum!',
      type: 'collaboration' as const,
      priority: 'medium' as const,
      actionable: true,
      timestamp: new Date().toISOString()
    }
  ]

  const displayInsights = insights.length > 0 ? insights : mockInsights
  const primaryInsight = displayInsights[currentInsightIndex]

  // Auto-rotate insights every 8 seconds
  useEffect(() => {
    if (displayInsights.length > 1) {
      const interval = setInterval(() => {
        setCurrentInsightIndex((prev) => (prev + 1) % displayInsights.length)
      }, 8000)
      return () => clearInterval(interval)
    }
  }, [displayInsights])

  // Reset index when insights change
  useEffect(() => {
    setCurrentInsightIndex(0)
  }, [displayInsights.length])
  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 to-accent">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2.5">
          <Bullet className="bg-primary" />
          AI Insights
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-primary/30 text-primary">
            <Sparkles className="size-3 mr-1" />
            Daily Insight
          </Badge>
          {displayInsights.length > 1 && (
            <div className="text-xs text-muted-foreground">
              {currentInsightIndex + 1} of {displayInsights.length}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="space-y-4">
          {loading ? (
            <div className="bg-background/50 rounded-lg p-4 border border-primary/10">
              <div className="animate-pulse">
                <div className="h-4 bg-primary/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted/50 rounded w-full mb-1"></div>
                <div className="h-3 bg-muted/50 rounded w-5/6"></div>
              </div>
            </div>
          ) : (
            <div className="bg-background/50 rounded-lg p-4 border border-primary/10">
              <h3 className="font-medium text-primary mb-2">
                {primaryInsight.type === 'productivity' && '🎯'}
                {primaryInsight.type === 'code_quality' && '🔧'}
                {primaryInsight.type === 'collaboration' && '🤝'}
                {primaryInsight.type === 'performance' && '⚡'}
                {' '}{primaryInsight.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {primaryInsight.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-background/30 rounded p-3">
              <div className="text-muted-foreground">Priority Level</div>
              <div className="font-medium capitalize">
                {primaryInsight.priority === 'high' && '🔴 High'}
                {primaryInsight.priority === 'medium' && '🟡 Medium'}
                {primaryInsight.priority === 'low' && '🟢 Low'}
              </div>
            </div>
            <div className="bg-background/30 rounded p-3">
              <div className="text-muted-foreground">Action Required</div>
              <div className="font-medium">
                {primaryInsight.actionable ? '✅ Yes' : '📊 Monitor'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
