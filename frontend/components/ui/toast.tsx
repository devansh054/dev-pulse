"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "warning"
  onClose?: () => void
}

export function Toast({ title, description, variant = "default", onClose }: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible) return null

  const variantStyles = {
    default: "bg-background border-border text-foreground",
    success: "bg-green-950/50 border-green-800 text-green-100",
    error: "bg-red-950/50 border-red-800 text-red-100",
    warning: "bg-yellow-950/50 border-yellow-800 text-yellow-100"
  }

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 w-96 rounded-lg border p-4 shadow-lg backdrop-blur-sm",
        "animate-in slide-in-from-top-2 duration-300",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && (
            <div className="font-semibold text-sm mb-1">{title}</div>
          )}
          {description && (
            <div className="text-xs opacity-90">{description}</div>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
          className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}

// Toast context and provider
interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'onClose'>) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Array<ToastProps & { id: string }>>([])

  const showToast = React.useCallback((toast: Omit<ToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
