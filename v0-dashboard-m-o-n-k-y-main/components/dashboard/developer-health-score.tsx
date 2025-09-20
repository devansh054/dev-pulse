import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bullet } from "@/components/ui/bullet"
import { cn } from "@/lib/utils"

interface DeveloperHealthScoreProps {
  score: number
}

export default function DeveloperHealthScore({ score }: DeveloperHealthScoreProps) {
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
          <div>
            <div className="text-muted-foreground">Focus Time</div>
            <div className="font-medium">6.2h today</div>
          </div>
          <div>
            <div className="text-muted-foreground">Burnout Risk</div>
            <div className="font-medium text-success">Low</div>
          </div>
          <div>
            <div className="text-muted-foreground">Productivity</div>
            <div className="font-medium">↑ 12% this week</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
