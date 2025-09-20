import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bullet } from "@/components/ui/bullet"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"

interface DeveloperHealthScoreProps {
  score?: number
}

interface HealthScoreData {
  score: number
  factors: Array<{
    name: string
    score: number
    status: 'excellent' | 'good' | 'needs_improvement'
  }>
  recommendations: string[]
}

export default function DeveloperHealthScore({ score: propScore }: DeveloperHealthScoreProps) {
  const [healthData, setHealthData] = useState<HealthScoreData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHealthScore = async () => {
      // Check if user is authenticated by checking session
      try {
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        
        if (!sessionData.user || sessionData.user.id === 'demo-user') {
          console.log('Demo mode: skipping health score API call, using mock data');
          setLoading(false);
          return;
        }
        
        console.log('Authenticated user detected, fetching real health score data');
      } catch (error) {
        console.error('Error checking session:', error);
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.getAIHealthScore('1') // Using default user ID
        if (response.success) {
          setHealthData(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch health score:', error)
        // Use prop score or default
        setHealthData({
          score: propScore || 87,
          factors: [],
          recommendations: []
        })
      } finally {
        setLoading(false)
      }
    }

    fetchHealthScore()
  }, [propScore])

  const score = healthData?.score || propScore || 87
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { status: "Excellent", color: "text-success", variant: "success" as const }
    if (score >= 60) return { status: "Good", color: "text-warning", variant: "warning" as const }
    return { status: "Needs Attention", color: "text-destructive", variant: "destructive" as const }
  }

  const { status, color, variant } = getHealthStatus(score)

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2.5">
          <Bullet variant={variant} />
          Developer Health Score
        </CardTitle>
        <Badge variant={`outline-${variant}`}>{status}</Badge>
      </CardHeader>

      <CardContent className="bg-accent flex-1 pt-2 md:pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={cn("text-6xl md:text-7xl font-display", color)}>{score}</span>
            <span className="text-2xl md:text-3xl font-display text-muted-foreground ml-1">/100</span>
          </div>

          {/* Circular progress indicator */}
          <div className="relative size-20 md:size-24">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="stroke-muted"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={cn("stroke-current transition-all duration-1000", color)}
                strokeWidth="3"
                strokeDasharray={`${score}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          {loading ? (
            <>
              <div className="animate-pulse">
                <div className="h-3 bg-muted/50 rounded w-16 mb-1"></div>
                <div className="h-4 bg-muted/30 rounded w-12"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-3 bg-muted/50 rounded w-20 mb-1"></div>
                <div className="h-4 bg-muted/30 rounded w-8"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-3 bg-muted/50 rounded w-18 mb-1"></div>
                <div className="h-4 bg-muted/30 rounded w-16"></div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-muted-foreground">AI Score</div>
                <div className="font-medium">{score}/100</div>
              </div>
              <div>
                <div className="text-muted-foreground">Status</div>
                <div className={cn("font-medium", color)}>{status}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Factors</div>
                <div className="font-medium">{healthData?.factors.length || 0} analyzed</div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
