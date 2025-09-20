"use client"

import { useState, useEffect } from "react"
import { User, Github, LogOut, RefreshCw, Calendar, MapPin, Building } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface GitHubProfile {
  login: string
  name: string
  email: string
  avatar_url: string
  bio: string
  company: string
  location: string
  public_repos: number
  followers: number
  following: number
  created_at: string
}

export default function UserProfile() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<GitHubProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const handleSync = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    try {
      // For now, just simulate sync - we'll implement GitHub API calls later
      setLastSync(new Date())
      console.log('GitHub sync triggered for user:', user.id)
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut()
  }

  if (!user) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {user.image ? (
              <img 
                src={user.image} 
                alt={user.name || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user.name || 'GitHub User'}
            </h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            {profile && profile.login && (
              <div className="flex items-center gap-1 mt-1">
                <Github className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">@{profile.login}</span>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {profile && (
        <div className="space-y-4 mb-6">
          {profile.bio && (
            <p className="text-sm text-gray-600">{profile.bio}</p>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            {profile.company && (
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="h-4 w-4" />
                <span>{profile.company}</span>
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.created_at && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="flex gap-6 text-sm">
            <div>
              <span className="font-semibold text-gray-900">{profile.public_repos || 0}</span>
              <span className="text-gray-600 ml-1">repositories</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{profile.followers || 0}</span>
              <span className="text-gray-600 ml-1">followers</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{profile.following || 0}</span>
              <span className="text-gray-600 ml-1">following</span>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">GitHub Data Sync</p>
            {lastSync ? (
              <p className="text-xs text-gray-500">
                Last synced: {lastSync.toLocaleString()}
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Click sync to update your data
              </p>
            )}
          </div>
          
          <button
            onClick={handleSync}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
