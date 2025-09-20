import type React from "react"
import { Bullet } from "@/components/ui/bullet"

interface DashboardPageLayoutProps {
  header: {
    title: string
    description: string
    icon: React.ElementType
  }
  children: React.ReactNode
}

export default function DashboardPageLayout({ header, children }: DashboardPageLayoutProps) {
  const Icon = header.icon

  return (
    <div className="space-y-gap py-sides">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <Bullet variant="default" />
            <Icon className="size-6 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display text-foreground">{header.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{header.description}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">{children}</div>
    </div>
  )
}
