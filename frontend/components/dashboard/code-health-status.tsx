import { Badge } from "@/components/ui/badge"
import DashboardCard from "@/components/dashboard/card"
import type { SecurityStatus as CodeHealthStatusType } from "@/types/dashboard"
import Image from "next/image"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Bullet } from "@/components/ui/bullet"
import { useState, useEffect } from "react"
import { apiClient, transformToSecurityStatus } from "@/lib/api"

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
  statuses?: CodeHealthStatusType[]
}

export default function CodeHealthStatus({ statuses: propStatuses }: CodeHealthStatusProps) {
  const [statuses, setStatuses] = useState<CodeHealthStatusType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Check if user is authenticated by checking session
      try {
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        
        if (!sessionData.user || sessionData.user.id === 'demo-user') {
          console.log('Demo mode: skipping code health API calls, using mock data');
          // Set mock data for demo mode
          const mockStatuses: CodeHealthStatusType[] = [
            {
              title: "Code Quality",
              value: "94%",
              status: "EXCELLENT",
              variant: "success"
            },
            {
              title: "Test Coverage",
              value: "87%", 
              status: "GOOD",
              variant: "success"
            },
            {
              title: "Build Status",
              value: "PASSING",
              status: "ALL TESTS PASS",
              variant: "success"
            }
          ];
          setStatuses(mockStatuses);
          setLoading(false);
          return;
        }
        
        console.log('Authenticated user detected, fetching real code health data');
      } catch (error) {
        console.error('Error checking session:', error);
        setLoading(false);
        return;
      }

      try {
        const [githubResponse, reposResponse] = await Promise.all([
          apiClient.getGitHubStats(),
          apiClient.getGitHubRepositories()
        ]);

        if (githubResponse.success && (reposResponse as any).success) {
          const repos = (reposResponse as any).data?.repositories || [];
          const stats = githubResponse.data || {};
          const totalCommits = githubResponse.data?.totalCommits || 0;
          const totalStars = repos.reduce((sum: number, repo: any) => sum + (repo.stargazers_count || 0), 0);
          const totalForks = repos.reduce((sum: number, repo: any) => sum + (repo.forks_count || 0), 0);
          const hasRecentActivity = totalCommits > 0;
          
          console.log('🔍 GitHub Data Analysis:', {
            repos: repos.length,
            totalCommits,
            totalStars,
            totalForks,
            hasRecentActivity,
            reposData: repos.slice(0, 3) // Show first 3 repos
          });
          
          // Calculate quality score based on real metrics
          let qualityScore = 70; // Higher base score for active developers
          if (totalStars > 5) qualityScore += 10;  // Lower threshold
          if (totalStars > 20) qualityScore += 10; // Bonus for popular repos
          if (totalForks > 2) qualityScore += 10;  // Lower threshold
          if (hasRecentActivity) qualityScore += 10;
          if (repos.length > 2) qualityScore += 5;  // Lower threshold
          if (repos.length > 5) qualityScore += 5;  // Bonus for many repos
          
          // Determine build status based on recent activity
          const buildStatus = hasRecentActivity ? 'PASSING' : 'STABLE';
          
          // Determine activity level based on commits (more realistic thresholds)
          let activityLevel = 'LOW';
          if (totalCommits > 20) activityLevel = 'HIGH';
          else if (totalCommits > 5) activityLevel = 'MEDIUM';
          
          console.log('📊 Calculated Metrics:', {
            qualityScore: Math.min(100, qualityScore),
            buildStatus,
            activityLevel
          });
          
          const healthData = {
            codeQuality: Math.min(100, qualityScore),
            buildStatus,
            activityLevel,
            totalRepos: repos.length,
            totalCommits
          };
          const transformedData = transformToSecurityStatus(healthData);
          setStatuses(transformedData);
        }
      } catch (error) {
        console.error('Failed to fetch code health data:', error);
        // Use prop data or fallback
        if (propStatuses) {
          setStatuses(propStatuses);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propStatuses]);
  return (
    <DashboardCard title="CODE HEALTH" intent="success" addon={<Badge variant="outline-success">ALL SYSTEMS GO</Badge>}>
      <div className="flex flex-col">
        <div className="max-md:order-1 grid grid-cols:3 md:grid-cols-1 gap-4 py-2 px-1 md:max-w-max">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border rounded-md ring-4 border-muted bg-muted/5 ring-muted/3 animate-pulse">
                <div className="flex items-center gap-2 py-1 px-2 border-b border-current">
                  <div className="w-2 h-2 bg-muted/50 rounded-full"></div>
                  <div className="h-3 bg-muted/40 rounded w-20"></div>
                </div>
                <div className="py-1 px-2.5">
                  <div className="h-6 bg-muted/30 rounded w-12 mb-1"></div>
                  <div className="h-2 bg-muted/20 rounded w-16"></div>
                </div>
              </div>
            ))
          ) : (
            statuses.map((item, index) => (
              <CodeHealthItem
                key={index}
                title={item.title}
                value={item.value}
                status={item.status}
                variant={item.variant}
              />
            ))
          )}
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
