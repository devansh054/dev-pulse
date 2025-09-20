'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { apiClient } from '@/lib/api'

interface SecuritySettings {
  scanFrequency: 'daily' | 'weekly' | 'monthly'
  vulnerabilityNotifications: boolean
  criticalAlertsOnly: boolean
  autoUpdateDependencies: boolean
  scanOnCommit: boolean
  emailNotifications: boolean
  slackIntegration: boolean
  excludedPaths: string[]
  scanTypes: {
    dependencies: boolean
    secrets: boolean
    codeQuality: boolean
    licenses: boolean
  }
}

interface SecuritySettingsModalProps {
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
}

export default function SecuritySettingsModal({ isOpen, onClose, isAuthenticated }: SecuritySettingsModalProps) {
  const { showToast } = useToast()
  const [settings, setSettings] = useState<SecuritySettings>({
    scanFrequency: 'weekly',
    vulnerabilityNotifications: true,
    criticalAlertsOnly: false,
    autoUpdateDependencies: false,
    scanOnCommit: true,
    emailNotifications: true,
    slackIntegration: false,
    excludedPaths: ['node_modules', '.git', 'dist', 'build'],
    scanTypes: {
      dependencies: true,
      secrets: true,
      codeQuality: true,
      licenses: true
    }
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newPath, setNewPath] = useState('')

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadSettings()
    }
  }, [isOpen, isAuthenticated])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getSecuritySettings()
      if (response.success) {
        setSettings(response.data)
      }
    } catch (error) {
      console.error('Failed to load security settings:', error)
      showToast({
        title: 'Error',
        description: 'Failed to load security settings',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!isAuthenticated) {
      showToast({
        title: 'Authentication Required',
        description: 'Please authenticate to save security settings',
        variant: 'warning'
      })
      return
    }

    try {
      setSaving(true)
      const response = await apiClient.updateSecuritySettings(settings)
      if (response.success) {
        showToast({
          title: 'Settings Saved',
          description: 'Security settings have been updated successfully',
          variant: 'success'
        })
        onClose()
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save security settings:', error)
      showToast({
        title: 'Save Failed',
        description: 'Failed to save security settings. Please try again.',
        variant: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const addExcludedPath = () => {
    if (newPath.trim() && !settings.excludedPaths.includes(newPath.trim())) {
      setSettings(prev => ({
        ...prev,
        excludedPaths: [...prev.excludedPaths, newPath.trim()]
      }))
      setNewPath('')
    }
  }

  const removeExcludedPath = (path: string) => {
    setSettings(prev => ({
      ...prev,
      excludedPaths: prev.excludedPaths.filter(p => p !== path)
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Security Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading settings...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Scan Frequency */}
            <div>
              <label className="block text-sm font-medium mb-2">Scan Frequency</label>
              <select
                value={settings.scanFrequency}
                onChange={(e) => setSettings(prev => ({ ...prev, scanFrequency: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Notification Settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Notifications</h3>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.vulnerabilityNotifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, vulnerabilityNotifications: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Vulnerability notifications</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.criticalAlertsOnly}
                  onChange={(e) => setSettings(prev => ({ ...prev, criticalAlertsOnly: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Critical alerts only</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Email notifications</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.slackIntegration}
                  onChange={(e) => setSettings(prev => ({ ...prev, slackIntegration: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Slack integration</span>
              </label>
            </div>

            {/* Automation Settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Automation</h3>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.autoUpdateDependencies}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoUpdateDependencies: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Auto-update dependencies</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.scanOnCommit}
                  onChange={(e) => setSettings(prev => ({ ...prev, scanOnCommit: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Scan on commit</span>
              </label>
            </div>

            {/* Scan Types */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Scan Types</h3>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.scanTypes.dependencies}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    scanTypes: { ...prev.scanTypes, dependencies: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Dependencies</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.scanTypes.secrets}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    scanTypes: { ...prev.scanTypes, secrets: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Secrets detection</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.scanTypes.codeQuality}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    scanTypes: { ...prev.scanTypes, codeQuality: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Code quality</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.scanTypes.licenses}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    scanTypes: { ...prev.scanTypes, licenses: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span className="text-sm">License compliance</span>
              </label>
            </div>

            {/* Excluded Paths */}
            <div>
              <h3 className="text-sm font-medium mb-2">Excluded Paths</h3>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newPath}
                    onChange={(e) => setNewPath(e.target.value)}
                    placeholder="Add path to exclude..."
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    onKeyPress={(e) => e.key === 'Enter' && addExcludedPath()}
                  />
                  <button
                    onClick={addExcludedPath}
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {settings.excludedPaths.map((path) => (
                    <span
                      key={path}
                      className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm"
                    >
                      {path}
                      <button
                        onClick={() => removeExcludedPath(path)}
                        className="ml-1 text-gray-500 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveSettings}
            disabled={saving || !isAuthenticated}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
