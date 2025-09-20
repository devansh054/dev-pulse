"use client"

import { useState, useEffect } from 'react'
import DashboardPageLayout from "@/components/dashboard/layout"
import { SidebarProvider } from "@/components/ui/sidebar"
import CuteRobotIcon from "@/components/icons/cute-robot"
import DashboardStat from "@/components/dashboard/stat"
import LockIcon from "@/components/icons/lock"
import GearIcon from "@/components/icons/gear"
import BoomIcon from "@/components/icons/boom"
import { useToast } from '@/components/ui/toast'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import SecuritySettingsModal from '@/components/security/SecuritySettingsModal'

// Mock data for security (fallback)
const mockSecurityStats = [
  {
    label: "Security Score",
    value: "94%",
    description: "Overall security rating",
    icon: "lock",
    tag: "EXCELLENT",
    intent: "positive" as const,
    direction: "up" as const
  },
  {
    label: "Vulnerabilities",
    value: "2",
    description: "Low-risk issues detected",
    icon: "boom", 
    tag: "LOW RISK",
    intent: "negative" as const,
    direction: "down" as const
  },
  {
    label: "Last Scan",
    value: "2h ago",
    description: "Security audit completed",
    icon: "gear",
    tag: "RECENT",
    intent: "neutral" as const,
    direction: undefined
  }
]

const mockSecurityEvents = [
  {
    id: "sec-001",
    type: "authentication",
    severity: "info",
    title: "Successful Login",
    description: "User authenticated from new device",
    timestamp: "2024-07-10 14:30:22",
    location: "San Francisco, CA",
    resolved: true
  },
  {
    id: "sec-002", 
    type: "vulnerability",
    severity: "warning",
    title: "Outdated Dependency",
    description: "lodash@4.17.20 has known security issues",
    timestamp: "2024-07-10 12:15:45",
    location: "GitHub Repository",
    resolved: false
  },
  {
    id: "sec-003",
    type: "access",
    severity: "error",
    title: "Failed Login Attempt",
    description: "Multiple failed authentication attempts detected",
    timestamp: "2024-07-10 09:45:12",
    location: "Unknown IP: 192.168.1.100",
    resolved: true
  },
  {
    id: "sec-004",
    type: "scan",
    severity: "info",
    title: "Security Scan Completed",
    description: "Automated security audit finished successfully",
    timestamp: "2024-07-10 08:00:00",
    location: "CI/CD Pipeline",
    resolved: true
  }
]

const mockKnownVulnerabilities = [
  {
    id: "vuln-001",
    package: "lodash",
    version: "4.17.20",
    severity: "medium",
    cve: "CVE-2021-23337",
    description: "Command injection vulnerability in lodash",
    fixVersion: "4.17.21"
  },
  {
    id: "vuln-002",
    package: "axios",
    version: "0.21.0",
    severity: "low",
    cve: "CVE-2021-3749",
    description: "Regular expression denial of service",
    fixVersion: "0.21.4"
  }
]

// Icon mapping
const iconMap = {
  gear: GearIcon,
  lock: LockIcon,
  boom: BoomIcon,
}

export default function SecurityPage() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const { showToast } = useToast()
  const [securityStats, setSecurityStats] = useState(mockSecurityStats)
  const [securityEvents, setSecurityEvents] = useState(mockSecurityEvents)
  const [knownVulnerabilities, setKnownVulnerabilities] = useState(mockKnownVulnerabilities)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scanInProgress, setScanInProgress] = useState(false)
  const [isUsingMockData, setIsUsingMockData] = useState(true)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  useEffect(() => {
    const fetchSecurityData = async () => {
      console.log('🔍 Security Auth state:', { isAuthenticated, user, isLoading })
      if (!isAuthenticated) {
        console.log('🔒 User not authenticated, using mock security data')
        setSecurityStats(mockSecurityStats)
        setSecurityEvents(mockSecurityEvents)
        setKnownVulnerabilities(mockKnownVulnerabilities)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const [statsResponse, eventsResponse, vulnerabilitiesResponse] = await Promise.all([
          apiClient.getSecurityStats(),
          apiClient.getSecurityEvents(),
          apiClient.getVulnerabilities()
        ])

        console.log('📊 Security API responses:', { statsResponse, eventsResponse, vulnerabilitiesResponse })

        // Process security stats
        if (statsResponse.success && statsResponse.data) {
          setIsUsingMockData(false)
          const stats = statsResponse.data
          const lastScanTime = new Date(stats.lastScanTime)
          const timeDiff = Date.now() - lastScanTime.getTime()
          const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60))
          const timeAgoText = hoursAgo < 1 ? 'Just now' : hoursAgo === 1 ? '1h ago' : `${hoursAgo}h ago`
          
          const securityScoreIntent = stats.securityScore >= 90 ? "positive" : stats.securityScore >= 70 ? "neutral" : "negative"
          const vulnerabilityIntent = stats.vulnerabilityCount === 0 ? "positive" : stats.criticalIssues > 0 ? "negative" : "neutral"
          const scanIntent = hoursAgo < 24 ? "neutral" : "negative"
          
          setSecurityStats([
            {
              label: "Security Score",
              value: `${stats.securityScore}%`,
              description: "Overall security rating",
              icon: "lock",
              tag: stats.securityScore >= 90 ? "EXCELLENT" : stats.securityScore >= 70 ? "GOOD" : "NEEDS WORK",
              intent: securityScoreIntent as any,
              direction: "up" as any
            },
            {
              label: "Vulnerabilities",
              value: stats.vulnerabilityCount.toString(),
              description: `${stats.criticalIssues} critical, ${stats.warningIssues} warnings`,
              icon: "boom",
              tag: stats.vulnerabilityCount === 0 ? "SECURE" : stats.criticalIssues > 0 ? "CRITICAL" : "LOW RISK",
              intent: vulnerabilityIntent as any,
              direction: "down" as any
            },
            {
              label: "Last Scan",
              value: timeAgoText,
              description: "Security audit completed",
              icon: "gear",
              tag: hoursAgo < 24 ? "RECENT" : "OUTDATED",
              intent: scanIntent as any,
              direction: undefined
            }
          ])
        } else {
          setSecurityStats(mockSecurityStats)
          setIsUsingMockData(true)
        }

        // Process security events
        if (eventsResponse.success && eventsResponse.data) {
          setSecurityEvents(eventsResponse.data)
        } else {
          setSecurityEvents(mockSecurityEvents)
        }

        // Process vulnerabilities
        if (vulnerabilitiesResponse.success && vulnerabilitiesResponse.data) {
          setKnownVulnerabilities(vulnerabilitiesResponse.data)
        } else {
          setKnownVulnerabilities(mockKnownVulnerabilities)
        }

      } catch (error: any) {
        console.error('❌ Error fetching security data:', error)
        setError(error.message)
        setSecurityStats(mockSecurityStats)
        setSecurityEvents(mockSecurityEvents)
        setKnownVulnerabilities(mockKnownVulnerabilities)
        setIsUsingMockData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchSecurityData()
  }, [isAuthenticated])

  const handleStartScan = async () => {
    if (!isAuthenticated) {
      showToast({
        title: 'Authentication Required',
        description: 'Please authenticate to start a security scan',
        variant: 'warning'
      })
      return
    }

    try {
      setScanInProgress(true)
      showToast({
        title: 'Starting Security Scan',
        description: 'Initializing comprehensive security audit...',
        variant: 'default'
      })
      
      const response = await apiClient.startSecurityScan()
      
      if (response.success) {
        showToast({
          title: 'Security Scan Started',
          description: `Scan ID: ${response.data.scanId} - Estimated duration: ${response.data.estimatedDuration}`,
          variant: 'success'
        })
        
        // Refresh security data after a delay
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      } else {
        showToast({
          title: 'Scan Failed',
          description: 'Failed to start security scan. Please try again.',
          variant: 'error'
        })
      }
    } catch (error: any) {
      console.error('❌ Error starting security scan:', error)
      showToast({
        title: 'Scan Error',
        description: `Failed to start security scan: ${error.message}`,
        variant: 'error'
      })
    } finally {
      setScanInProgress(false)
    }
  }

  const handleManageSettings = () => {
    setShowSettingsModal(true)
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Security",
        description: "Security monitoring and vulnerability management • 94% security score",
      }}
    >
      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {securityStats.map((stat, index) => (
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

      {/* Security Events */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Security Events</h2>
          <span className={`text-xs px-2 py-1 rounded ${
            isUsingMockData ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {isUsingMockData ? 'DEMO DATA' : 'LIVE DATA'}
          </span>
        </div>
        <div className="space-y-4">
          {securityEvents.map((event) => (
            <div key={event.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    event.severity === 'error' ? 'bg-red-500' :
                    event.severity === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>
                  <h3 className="text-lg font-medium">{event.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    event.severity === 'error' ? 'bg-red-100 text-red-800' :
                    event.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {event.severity.toUpperCase()}
                  </span>
                  {event.resolved && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      RESOLVED
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{event.timestamp}</span>
                <span>{event.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vulnerabilities */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Known Vulnerabilities</h2>
          <span className={`text-xs px-2 py-1 rounded ${
            isUsingMockData ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {isUsingMockData ? 'DEMO DATA' : 'LIVE DATA'}
          </span>
        </div>
        <div className="space-y-4">
          {knownVulnerabilities.map((vuln: any) => (
            <div key={vuln.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-medium">{vuln.package}@{vuln.version}</h3>
                  <p className="text-sm text-muted-foreground">{vuln.cve}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  vuln.severity === 'high' ? 'bg-red-100 text-red-800' :
                  vuln.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {vuln.severity.toUpperCase()}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{vuln.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Fix available: {vuln.fixVersion}</span>
                <button className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium hover:bg-primary/90 transition-colors">
                  Update Package
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Run Security Scan</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Perform a comprehensive security audit of your codebase and dependencies.
          </p>
          <button 
            onClick={handleStartScan}
            disabled={scanInProgress}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scanInProgress ? 'Starting Scan...' : 'Start Scan'}
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Security Settings</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure security policies, authentication settings, and access controls.
          </p>
          <button 
            onClick={handleManageSettings}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/90 transition-colors"
          >
            Manage Settings
          </button>
        </div>
      </div>

      {/* Security Settings Modal */}
      <SecuritySettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        isAuthenticated={isAuthenticated}
      />
    </DashboardPageLayout>
  )
}
