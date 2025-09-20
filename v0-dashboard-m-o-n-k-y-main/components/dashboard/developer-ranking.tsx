import { Badge } from "@/components/ui/badge"
import DashboardCard from "@/components/dashboard/card"
import type { RebelRanking } from "@/types/dashboard"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Trophy, GitCommit, Code, Users } from "lucide-react"

interface DeveloperRankingProps {
  developers: RebelRanking[]
}

export default function DeveloperRanking({ developers }: DeveloperRankingProps) {
  const getActivityIcon = (index: number) => {
    const icons = [GitCommit, Code, Users, Trophy]
    const Icon = icons[index % icons.length]
    return <Icon className="size-3" />
  }

  return (
    <DashboardCard
      title="TEAM CONTRIBUTORS"
      intent="default"
      addon={<Badge variant="outline-success">+2 THIS WEEK</Badge>}
    >
      <div className="space-y-4">
        {developers.map((developer, index) => (
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
                    <Badge variant={developer.featured ? "default" : "secondary"}>{developer.points} COMMITS</Badge>
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
        ))}
      </div>
    </DashboardCard>
  )
}
