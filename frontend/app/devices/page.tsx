"use client"

import { useState, useEffect } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { SidebarProvider } from "@/components/ui/sidebar"
import ProcessorIcon from "@/components/icons/proccesor"
import DashboardStat from "@/components/dashboard/stat"
import GearIcon from "@/components/icons/gear"
import BoomIcon from "@/components/icons/boom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Cpu, HardDrive, MemoryStick, Wifi, WifiOff, Plus, Activity, Loader2, Github } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { useDeviceRegistration } from "@/hooks/useDeviceRegistration"

// Mock data for fallback
const mockDeviceStats = [
  {
    label: "Connected Devices",
    value: "8",
    description: "Active development machines",
    icon: "proccesor",
    tag: "ONLINE",
    intent: "positive" as const,
    direction: "up" as const
  },
  {
    label: "CPU Usage",
    value: "67%",
    description: "Average across all devices",
    icon: "boom", 
    tag: "NORMAL",
    intent: "neutral" as const,
    direction: undefined
  },
  {
    label: "Memory Usage",
    value: "4.2GB",
    description: "Total RAM consumption",
    icon: "gear",
    tag: "OPTIMAL",
    intent: "positive" as const,
    direction: "down" as const
  }
]

const mockDevices = [
  {
    id: "dev-001",
    name: "MacBook Pro M2",
    type: "laptop",
    status: "online" as const,
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 78,
    lastSeen: "2024-01-15T10:30:00Z",
    location: "San Francisco, CA",
    uptime: 86400
  },
  {
    id: "dev-002", 
    name: "Ubuntu Server",
    type: "server",
    status: "online" as const,
    cpuUsage: 89,
    memoryUsage: 34,
    diskUsage: 45,
    lastSeen: "2024-01-15T10:25:00Z",
    location: "AWS us-west-2",
    uptime: 172800
  },
  {
    id: "dev-003",
    name: "Windows Desktop",
    type: "desktop",
    status: "offline" as const,
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 67,
    lastSeen: "2024-01-15T08:30:00Z",
    location: "New York, NY",
    uptime: 0
  },
  {
    id: "dev-004",
    name: "iPad Pro",
    type: "tablet",
    status: "online" as const,
    cpuUsage: 23,
    memoryUsage: 45,
    diskUsage: 89,
    lastSeen: "2024-01-15T10:31:00Z",
    location: "Los Angeles, CA",
    uptime: 43200
  }
]

// Icon mapping
const iconMap = {
  gear: GearIcon,
  proccesor: ProcessorIcon,
  boom: BoomIcon,
}

export default function DevicesPage() {
  const { user, isLoading: authLoading, isAuthenticated, signIn } = useAuth()
  const { isRegistering, autoRegisterDevice } = useDeviceRegistration()
  const [devices, setDevices] = useState<any[]>([])
  const [deviceStats, setDeviceStats] = useState<any[]>(mockDeviceStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDeviceData = async () => {
      console.log('🔍 Auth state:', { isAuthenticated, user, authLoading })
      
      // Skip API calls if not authenticated
      if (!isAuthenticated) {
        console.log('🔒 User not authenticated, using mock data')
        setDevices(mockDevices)
        setDeviceStats(mockDeviceStats)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Fetch devices and stats in parallel
        console.log('🔍 Fetching device data for authenticated user...')
        const [devicesResponse, statsResponse] = await Promise.all([
          apiClient.getDevices().catch((error) => {
            console.error('❌ Devices API error:', error)
            return { success: false, error: error.message, data: { devices: mockDevices } }
          }),
          apiClient.getDeviceStats().catch((error) => {
            console.error('❌ Device stats API error:', error)
            return { success: false, error: error.message, data: null }
          })
        ])

        console.log('📊 Devices response:', devicesResponse)
        console.log('📈 Stats response:', statsResponse)

        // Always trigger auto-registration for authenticated users
        console.log('📱 Triggering auto-registration for current device...')
        await autoRegisterDevice()
        
        // Fetch devices after registration
        const newDevicesResponse = await apiClient.getDevices()
        if (newDevicesResponse.success) {
          setDevices(newDevicesResponse.data.devices)
          console.log('📱 Loaded devices:', newDevicesResponse.data.devices.length)
        } else {
          setDevices(mockDevices)
        }

        // Transform stats data
        if (statsResponse.success && statsResponse.data) {
          const stats = statsResponse.data
          setDeviceStats([
            {
              label: "Connected Devices",
              value: stats.onlineDevices.toString(),
              description: `${stats.totalDevices} total devices`,
              icon: "proccesor",
              tag: "ONLINE",
              intent: "positive" as const,
              direction: "up" as const
            },
            {
              label: "CPU Usage",
              value: `${Math.round(stats.avgCpuUsage || 0)}%`,
              description: "Average across all devices",
              icon: "boom",
              tag: (stats.avgCpuUsage || 0) > 80 ? "HIGH" : (stats.avgCpuUsage || 0) > 60 ? "NORMAL" : "LOW",
              intent: (stats.avgCpuUsage || 0) > 80 ? "negative" : (stats.avgCpuUsage || 0) > 60 ? "neutral" : "positive",
              direction: undefined
            },
            {
              label: "Memory Usage",
              value: `${Math.round(stats.averageMemoryUsage || 0)}%`,
              description: "Average RAM consumption",
              icon: "gear",
              tag: (stats.averageMemoryUsage || 0) > 80 ? "HIGH" : "OPTIMAL",
              intent: (stats.averageMemoryUsage || 0) > 80 ? "negative" : "positive",
              direction: (stats.averageMemoryUsage || 0) > 80 ? "up" : "down"
            }
          ])
        }
      } catch (err) {
        console.error('Error fetching device data:', err)
        setError('Failed to load device data')
        setDevices(mockDevices)
      } finally {
        setLoading(false)
      }
    }

    fetchDeviceData()
  }, [isAuthenticated])

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const onlineDevices = devices.filter(d => d.status === 'online').length

  return (
    <DashboardPageLayout
      header={{
        title: "Devices",
        description: `Connected development devices • ${onlineDevices} devices online`,
      }}
    >
      {/* Authentication Required */}
      {!authLoading && !isAuthenticated && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-md">
            <Github className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Authentication Required</h3>
            <p className="text-blue-700 mb-6">
              Connect your GitHub account to monitor real device data and performance metrics.
            </p>
            <Button onClick={signIn} className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              Connect with GitHub
            </Button>
            <p className="text-sm text-blue-600 mt-4">
              Currently showing demo data for preview purposes.
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {(loading || authLoading || isRegistering) && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">
            {isRegistering ? "Registering your device..." : "Loading device data..."}
          </span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <p className="text-sm text-red-600 mt-1">Showing mock data for demonstration.</p>
        </div>
      )}

      {/* Device Stats */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {deviceStats.map((stat, index) => (
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
      )}

      {/* Device List */}
      {!loading && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Connected Devices</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {devices.map((device) => (
              <div key={device.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {device.type === 'laptop' && <Cpu className="w-5 h-5 text-primary" />}
                      {device.type === 'server' && <HardDrive className="w-5 h-5 text-primary" />}
                      {device.type === 'desktop' && <ProcessorIcon className="w-5 h-5 text-primary" />}
                      {device.type === 'tablet' && <MemoryStick className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{device.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{device.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      device.status === 'online' ? 'bg-green-500' : 
                      device.status === 'maintenance' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    <Badge className={
                      device.status === 'online' ? 'bg-green-100 text-green-800' : 
                      device.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {device.status === 'online' ? (
                        <><Wifi className="h-3 w-3 mr-1" />{device.status.toUpperCase()}</>
                      ) : (
                        <><WifiOff className="h-3 w-3 mr-1" />{device.status.toUpperCase()}</>
                      )}
                    </Badge>
                  </div>
                </div>
                
                {/* Resource Usage */}
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Usage</span>
                      <span>{device.cpuUsage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          device.cpuUsage > 80 ? 'bg-red-500' : device.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${device.cpuUsage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory</span>
                      <span>{typeof device.memoryUsage === 'number' && device.memoryUsage > 100 
                        ? `${Math.round((device.memoryUsage / 1024) * 100) / 100}GB` 
                        : `${Math.round(device.memoryUsage || 0)}%`}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (device.memoryUsage || 0) > 80 ? 'bg-red-500' : (device.memoryUsage || 0) > 60 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(device.memoryUsage || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage</span>
                      <span>{device.storageUsage || device.diskUsage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (device.storageUsage || device.diskUsage) > 80 ? 'bg-red-500' : (device.storageUsage || device.diskUsage) > 60 ? 'bg-yellow-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${device.storageUsage || device.diskUsage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Last seen: {formatLastSeen(device.lastSeen)}</span>
                  <span>{device.location || 'Unknown location'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Add New Device</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect a new development device to monitor its performance and status.
          </p>
          <Button 
            className="flex items-center gap-2"
            onClick={() => {
              // TODO: Implement device connection modal
              alert('Device connection feature coming soon!')
            }}
          >
            <Plus className="h-4 w-4" />
            Connect Device
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">System Health</h3>
          <p className="text-sm text-muted-foreground mb-4">
            View detailed system health reports and performance analytics.
          </p>
          <Button 
            variant="secondary" 
            className="flex items-center gap-2"
            onClick={() => {
              // TODO: Navigate to reports page or open reports modal
              window.location.href = '/reports'
            }}
          >
            <Activity className="h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>
    </DashboardPageLayout>
  )
}
