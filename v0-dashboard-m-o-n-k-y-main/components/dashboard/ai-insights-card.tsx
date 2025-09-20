import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bullet } from "@/components/ui/bullet"
import { Sparkles } from "lucide-react"

export default function AIInsightsCard() {
  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 to-accent">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2.5">
          <Bullet className="bg-primary" />
          AI Insights
        </CardTitle>
        <Badge variant="outline" className="border-primary/30 text-primary">
          <Sparkles className="size-3 mr-1" />
          Daily Insight
        </Badge>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="space-y-4">
          <div className="bg-background/50 rounded-lg p-4 border border-primary/10">
            <h3 className="font-medium text-primary mb-2">🎯 Optimization Opportunity</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your most productive coding hours are between 10-11 AM. Consider scheduling complex tasks during this
              window to maximize your output by up to 23%.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-background/30 rounded p-3">
              <div className="text-muted-foreground">Peak Performance</div>
              <div className="font-medium">10:00 - 11:00 AM</div>
            </div>
            <div className="bg-background/30 rounded p-3">
              <div className="text-muted-foreground">Suggested Break</div>
              <div className="font-medium">In 45 minutes</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
