"use client"

// No longer needed with custom auth system
export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
