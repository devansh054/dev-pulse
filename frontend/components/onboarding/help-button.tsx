"use client"

import { useState } from "react"
import { HelpCircle, Play, RotateCcw } from "lucide-react"

interface HelpButtonProps {
  onStartTour: () => void
}

export default function HelpButton({ onStartTour }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-30">
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-64 mb-2">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Take the interactive tour to learn about DevPulse features and get the most out of your dashboard.
          </p>
          <button
            onClick={() => {
              onStartTour()
              setIsOpen(false)
            }}
            className="flex items-center gap-2 w-full px-3 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            <Play className="h-4 w-4" />
            Start Tour
          </button>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all"
        title="Help & Tour"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
    </div>
  )
}
