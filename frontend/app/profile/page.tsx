"use client"

import UserProfile from "@/components/auth/user-profile"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and GitHub integration</p>
        </div>

        <UserProfile />
      </div>
    </div>
  )
}
