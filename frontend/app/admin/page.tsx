'use client'

import DashboardPageLayout from "@/components/dashboard/layout"
import { SidebarProvider } from "@/components/ui/sidebar"
import GearIcon from "@/components/icons/gear"
import DashboardStat from "@/components/dashboard/stat"
import LockIcon from "@/components/icons/lock"
import BoomIcon from "@/components/icons/boom"
import MonkeyIcon from "@/components/icons/monkey"
import { useAuth } from '@/hooks/useAuth'
import { adminApi } from '@/lib/api'
import { useState, useEffect } from 'react'

// Mock data for admin settings
const adminStats = [
  {
    label: "Total Users",
    value: "156",
    description: "Registered platform users",
    icon: "monkey",
    tag: "ACTIVE",
    intent: "positive" as const,
    direction: "up" as const
  },
  {
    label: "System Health",
    value: "98%",
    description: "Overall system uptime",
    icon: "boom", 
    tag: "EXCELLENT",
    intent: "positive" as const,
    direction: undefined
  },
  {
    label: "Storage Used",
    value: "2.4TB",
    description: "Of 10TB total capacity",
    icon: "gear",
    tag: "24%",
    intent: "neutral" as const,
    direction: "up" as const
  }
]

const systemSettings = [
  {
    category: "Authentication",
    settings: [
      { name: "GitHub OAuth", enabled: true, description: "Enable GitHub authentication" },
      { name: "Two-Factor Auth", enabled: true, description: "Require 2FA for admin accounts" },
      { name: "Session Timeout", enabled: false, description: "Auto-logout after inactivity" }
    ]
  },
  {
    category: "Security",
    settings: [
      { name: "Rate Limiting", enabled: true, description: "API request rate limiting" },
      { name: "IP Whitelist", enabled: false, description: "Restrict access by IP address" },
      { name: "Audit Logging", enabled: true, description: "Log all admin actions" }
    ]
  },
  {
    category: "Performance",
    settings: [
      { name: "Caching", enabled: true, description: "Enable Redis caching" },
      { name: "CDN", enabled: true, description: "Content delivery network" },
      { name: "Compression", enabled: true, description: "Gzip response compression" }
    ]
  }
]

const recentActions = [
  {
    id: "act-001",
    user: "Admin User",
    action: "Updated system configuration",
    target: "Authentication Settings",
    timestamp: "2024-07-10 15:30:22",
    status: "success"
  },
  {
    id: "act-002",
    user: "System",
    action: "Automated backup completed",
    target: "Database Backup",
    timestamp: "2024-07-10 12:00:00",
    status: "success"
  },
  {
    id: "act-003",
    user: "Admin User",
    action: "Added new user role",
    target: "User Management",
    timestamp: "2024-07-10 09:15:45",
    status: "success"
  },
  {
    id: "act-004",
    user: "System",
    action: "Security scan initiated",
    target: "Security Audit",
    timestamp: "2024-07-10 08:00:00",
    status: "in_progress"
  }
]

const userRoles = [
  { name: "Super Admin", users: 2, permissions: "Full system access" },
  { name: "Admin", users: 5, permissions: "User and content management" },
  { name: "Developer", users: 24, permissions: "Code repository access" },
  { name: "Viewer", users: 125, permissions: "Read-only dashboard access" }
]

// Icon mapping
const iconMap = {
  gear: GearIcon,
  lock: LockIcon,
  boom: BoomIcon,
  monkey: MonkeyIcon,
}

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [stats, setStats] = useState(adminStats)
  const [settings, setSettings] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [actions, setActions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [showUserModal, setShowUserModal] = useState(false)
  const [userModalData, setUserModalData] = useState<any>(null)

  useEffect(() => {
    const fetchAdminData = async () => {
      console.log('🔍 Auth state:', { isAuthenticated, isLoading })
      
      if (!isAuthenticated) {
        console.log('🔒 User not authenticated, using mock data')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        console.log('🚀 Fetching admin data...')

        const [statsResponse, settingsResponse, usersResponse, actionsResponse] = await Promise.all([
          adminApi.getAdminStats(),
          adminApi.getAdminSettings(),
          adminApi.getAdminUsers(),
          adminApi.getAdminActions()
        ])

        console.log('📡 Admin API responses:', {
          stats: statsResponse,
          settings: settingsResponse,
          users: usersResponse,
          actions: actionsResponse
        })

        if (statsResponse.success) {
          const data = statsResponse.data
          setStats([
            {
              label: "Total Users",
              value: data.totalUsers.toString(),
              description: "Registered platform users",
              icon: "monkey",
              tag: "ACTIVE",
              intent: "positive" as const,
              direction: "up" as const
            },
            {
              label: "System Health",
              value: `${data.systemHealth}%`,
              description: "Overall system uptime",
              icon: "boom",
              tag: "EXCELLENT",
              intent: "positive" as const,
              direction: undefined
            },
            {
              label: "Storage Used",
              value: `${data.storageUsed}TB`,
              description: `${data.storagePercent}% of total capacity`,
              icon: "gear",
              tag: `${data.storagePercent}%`,
              intent: "neutral" as const,
              direction: "up" as const
            }
          ])
        }

        if (settingsResponse.success) {
          setSettings(settingsResponse.data)
        }

        if (usersResponse.success) {
          setUsers(usersResponse.data.users || [])
        }

        if (actionsResponse.success) {
          setActions(actionsResponse.data.actions || [])
        }

      } catch (error: any) {
        console.error('❌ Error fetching admin data:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [isAuthenticated])

  const handleSettingToggle = async (category: string, setting: string, currentValue: boolean) => {
    try {
      console.log(`🔄 Toggling ${category}.${setting} from ${currentValue} to ${!currentValue}`)
      
      const response = await adminApi.updateAdminSetting({
        category,
        setting,
        enabled: !currentValue
      })

      if (response.success) {
        console.log('✅ Setting updated successfully:', response.data)
        // Update local state
        setSettings((prev: any) => ({
          ...prev,
          [category]: {
            ...prev[category],
            [setting]: !currentValue
          }
        }))
      } else {
        console.error('❌ Failed to update setting:', response)
        setError(response.error || 'Failed to update setting')
      }
    } catch (error: any) {
      console.error('❌ Error updating setting:', error)
      setError(error.message)
    }
  }

  const handleBackup = async () => {
    try {
      console.log('🚀 Initiating system backup...')
      const response = await adminApi.initiateBackup()
      
      if (response.success) {
        console.log('✅ Backup initiated:', response.data)
        const data = response.data
        alert(`✅ Backup completed successfully!

📁 Backup Details:
• Backup ID: ${data.backupId}
• Location: ${data.backupLocation}
• Size: ${data.size}
• Duration: ${data.actualDuration}

📦 Backup includes:
${data.includes?.map((item: string) => `• ${item}`).join('\n')}

💾 File saved to: /Users/devansh/Downloads/devpulse/backups/`)
      } else {
        console.error('❌ Backup failed:', response)
        alert('Failed to initiate backup: ' + (response.error || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('❌ Error initiating backup:', error)
      alert('Error initiating backup: ' + error.message)
    }
  }

  const handleViewLogs = async () => {
    try {
      console.log('🚀 Fetching system logs...')
      const response = await adminApi.getSystemLogs({ limit: 100 })
      
      if (response.success) {
        console.log('✅ Logs fetched:', response.data)
        setLogs(response.data.logs || [])
        setShowLogsModal(true)
      } else {
        console.error('❌ Failed to fetch logs:', response)
        alert('Failed to fetch logs: ' + (response.error || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('❌ Error fetching logs:', error)
      alert('Error fetching logs: ' + error.message)
    }
  }

  const handleUserManagement = async () => {
    try {
      console.log('🚀 Opening user management...')
      const response = await adminApi.getAdminUsers()
      
      if (response.success) {
        console.log('✅ Users fetched for management:', response.data)
        setUserModalData(response.data)
        setShowUserModal(true)
      } else {
        console.error('❌ Failed to fetch users:', response)
        alert('Failed to fetch users: ' + (response.error || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('❌ Error fetching users:', error)
      alert('Error fetching users: ' + error.message)
    }
  }

  if (loading) {
    return (
      <DashboardPageLayout
        header={{
          title: "Admin Settings",
          description: "System administration and configuration",
          }}
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading admin data...</div>
        </div>
      </DashboardPageLayout>
    )
  }

  if (error) {
    return (
      <DashboardPageLayout
        header={{
          title: "Admin Settings",
          description: "System administration and configuration",
          }}
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </DashboardPageLayout>
    )
  }

  // Convert settings to the format expected by the UI
  const systemSettingsData = settings ? [
    {
      category: "Authentication",
      settings: [
        { name: "githubOAuth", displayName: "GitHub OAuth", enabled: settings.authentication?.githubOAuth || false, description: "Enable GitHub authentication" },
        { name: "twoFactorAuth", displayName: "Two-Factor Auth", enabled: settings.authentication?.twoFactorAuth || false, description: "Require 2FA for admin accounts" },
        { name: "sessionTimeout", displayName: "Session Timeout", enabled: settings.authentication?.sessionTimeout || false, description: "Auto-logout after inactivity" }
      ]
    },
    {
      category: "Security",
      settings: [
        { name: "rateLimiting", displayName: "Rate Limiting", enabled: settings.security?.rateLimiting || false, description: "API request rate limiting" },
        { name: "ipWhitelist", displayName: "IP Whitelist", enabled: settings.security?.ipWhitelist || false, description: "Restrict access by IP address" },
        { name: "auditLogging", displayName: "Audit Logging", enabled: settings.security?.auditLogging || false, description: "Log all admin actions" }
      ]
    },
    {
      category: "Performance",
      settings: [
        { name: "caching", displayName: "Caching", enabled: settings.performance?.caching || false, description: "Enable Redis caching" },
        { name: "cdn", displayName: "CDN", enabled: settings.performance?.cdn || false, description: "Content delivery network" },
        { name: "compression", displayName: "Compression", enabled: settings.performance?.compression || false, description: "Gzip response compression" }
      ]
    }
  ] : systemSettings;

  return (
    <DashboardPageLayout
      header={{
        title: "Admin Settings",
        description: "System administration and configuration • 156 total users",
      }}
    >
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {adminStats.map((stat, index) => (
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

      {/* System Settings */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">System Configuration</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {systemSettingsData.map((category) => (
            <div key={category.category} className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">{category.category}</h3>
              <div className="space-y-4">
                {category.settings.map((setting: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{setting.displayName || setting.name}</p>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleSettingToggle(category.category.toLowerCase(), setting.name, setting.enabled)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors ${
                          setting.enabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          setting.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}></div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Roles */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">User Roles & Permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(userModalData?.roles || userRoles).map((role: any, index: number) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">{role.name}</h3>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                  {role.users}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{role.permissions}</p>
              <button 
                onClick={handleUserManagement}
                className="w-full bg-secondary text-secondary-foreground px-3 py-2 rounded text-sm font-medium hover:bg-secondary/90 transition-colors"
              >
                Manage Role
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Admin Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Admin Actions</h2>
        <div className="space-y-4">
          {actions.length > 0 ? actions.map((action) => (
            <div key={action.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <GearIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{action.action}</h3>
                    <p className="text-sm text-muted-foreground">
                      {action.user} • {action.target}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{action.timestamp}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    action.status === 'success' ? 'bg-green-100 text-green-800' :
                    action.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {action.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
              No recent admin actions
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">System Backup</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create a full system backup including database and configuration.
          </p>
          <button 
            onClick={handleBackup}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Start Backup
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">User Management</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Manage user accounts, roles, and permissions across the platform.
          </p>
          <button 
            onClick={handleUserManagement}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/90 transition-colors"
          >
            Manage Users
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">System Logs</h3>
          <p className="text-sm text-muted-foreground mb-4">
            View detailed system logs and audit trails for troubleshooting.
          </p>
          <button 
            onClick={handleViewLogs}
            className="bg-accent text-accent-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            View Logs
          </button>
        </div>
      </div>

      {/* System Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  📋 System Logs
                </h2>
                <button
                  onClick={() => setShowLogsModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.level === 'error' ? 'bg-red-100 text-red-800' :
                        log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                        log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-gray-900 dark:text-white">{log.message}</div>
                    <div className="text-gray-500 text-xs mt-1">Source: {log.source}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowLogsModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {showUserModal && userModalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  👥 User Management
                </h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {userModalData.roles?.map((role: any, index: number) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{role.name}</h3>
                    <p className="text-2xl font-bold text-blue-600">{role.users}</p>
                    <p className="text-xs text-gray-500">{role.permissions}</p>
                  </div>
                ))}
              </div>

              {/* Users Table */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    All Users ({userModalData.totalUsers})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Last Active
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {userModalData.users?.map((user: any) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img 
                                className="h-10 w-10 rounded-full" 
                                src={user.avatarUrl || '/default-avatar.png'} 
                                alt={user.username}
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.username}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(user.lastActive).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardPageLayout>
  )
}
