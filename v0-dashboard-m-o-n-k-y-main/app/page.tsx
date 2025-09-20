import DashboardPageLayout from "@/components/dashboard/layout"
import DashboardStat from "@/components/dashboard/stat"
import DashboardChart from "@/components/dashboard/chart"
import DeveloperRanking from "@/components/dashboard/developer-ranking"
import CodeHealthStatus from "@/components/dashboard/code-health-status"
import BracketsIcon from "@/components/icons/brackets"
import GearIcon from "@/components/icons/gear"
import ProcessorIcon from "@/components/icons/proccesor"
import BoomIcon from "@/components/icons/boom"
import mockDataJson from "@/mock.json"
import type { MockData } from "@/types/dashboard"
import DeveloperHealthScore from "@/components/dashboard/developer-health-score"
import AIInsightsCard from "@/components/dashboard/ai-insights-card"

const mockData = mockDataJson as MockData

// Icon mapping for developer metrics
const iconMap = {
  gear: GearIcon,
  proccesor: ProcessorIcon,
  boom: BoomIcon,
}

export default function DashboardOverview() {
  return (
    <DashboardPageLayout
      header={{
        title: "Developer Intelligence",
        description: "Your productivity insights • Last sync 2 min ago",
        icon: BracketsIcon,
      }}
    >
      {/* Developer Health Score - Featured prominently */}
      <div className="mb-6">
        <DeveloperHealthScore score={87} />
      </div>

      {/* AI Insights Card */}
      <div className="mb-6">
        <AIInsightsCard />
      </div>

      {/* Developer Productivity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {mockData.dashboardStats.map((stat, index) => (
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

      {/* Productivity Analytics Chart */}
      <div className="mb-6">
        <DashboardChart />
      </div>

      {/* Main 2-column grid section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DeveloperRanking developers={mockData.rebelsRanking} />
        <CodeHealthStatus statuses={mockData.securityStatus} />
      </div>
    </DashboardPageLayout>
  )
}
