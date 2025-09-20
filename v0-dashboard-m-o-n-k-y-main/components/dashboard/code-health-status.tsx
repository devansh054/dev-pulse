import { Badge } from "@/components/ui/badge"
import DashboardCard from "@/components/dashboard/card"
import type { SecurityStatus as CodeHealthStatusType } from "@/types/dashboard"
import Image from "next/image"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Bullet } from "@/components/ui/bullet"

const codeHealthItemVariants = cva("border rounded-md ring-4", {
  variants: {
    variant: {
      success: "border-success bg-success/5 text-success ring-success/3",
      warning: "border-warning bg-warning/5 text-warning ring-warning/3",
      destructive: "border-destructive bg-destructive/5 text-destructive ring-destructive/3",
    },
  },
  defaultVariants: {
    variant: "success",
  },
})

interface CodeHealthItemProps extends VariantProps<typeof codeHealthItemVariants> {
  title: string
  value: string
  status: string
  className?: string
}

function CodeHealthItem({ title, value, status, variant, className }: CodeHealthItemProps) {
  return (
    <div className={cn(codeHealthItemVariants({ variant }), className)}>
      <div className="flex items-center gap-2 py-1 px-2 border-b border-current">
        <Bullet size="sm" variant={variant} />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="py-1 px-2.5">
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-xs opacity-50">{status}</div>
      </div>
    </div>
  )
}

interface CodeHealthStatusProps {
  statuses: CodeHealthStatusType[]
}

export default function CodeHealthStatus({ statuses }: CodeHealthStatusProps) {
  return (
    <DashboardCard title="CODE HEALTH" intent="success" addon={<Badge variant="outline-success">ALL SYSTEMS GO</Badge>}>
      <div className="flex flex-col">
        <div className="max-md:order-1 grid grid-cols:3 md:grid-cols-1 gap-4 py-2 px-1 md:max-w-max">
          {statuses.map((item, index) => (
            <CodeHealthItem
              key={index}
              title={item.title}
              value={item.value}
              status={item.status}
              variant={item.variant}
            />
          ))}
        </div>
        <picture className="md:absolute md:top-0 md:right-0 w-full md:w-auto md:h-full aspect-square min-[2160px]:right-[10%]">
          <Image
            src="/assets/pc_blueprint.gif"
            alt="Code Health Status"
            width={1000}
            height={1000}
            quality={90}
            className="size-full object-contain"
          />
        </picture>
      </div>
    </DashboardCard>
  )
}
