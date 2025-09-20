"use client";

import type React from "react"
import { Bullet } from "@/components/ui/bullet"
import { HamburgerMenu } from "@/components/ui/hamburger-menu"
import { useSidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

interface DashboardPageLayoutProps {
  header: {
    title: string
    description: string
    icon?: React.ElementType
  }
  children: React.ReactNode
}

function DashboardPageLayoutInner({ header, children }: DashboardPageLayoutProps) {
  const { toggleSidebar, openMobile, setOpenMobile } = useSidebar()

  return (
    <>
      {/* Sidebar Component */}
      <DashboardSidebar />
      
      {/* Main Content Area */}
      <SidebarInset>
        <div className="space-y-gap py-sides bg-background text-foreground">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu */}
              <div>
                <button
                  onClick={() => {
                    console.log('🍔 Menu button clicked, current openMobile:', openMobile);
                    setOpenMobile(!openMobile);
                  }}
                  className="mr-2 p-2 hover:bg-gray-100 rounded-md bg-red-500 text-white lg:hidden"
                >
                  MENU
                </button>
              </div>
              
              <div className="flex items-center gap-2.5">
                <Bullet variant="default" />
                {header.icon && <header.icon className="size-6 text-muted-foreground" />}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display text-foreground">{header.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">{header.description}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6 bg-background">{children}</div>
        </div>
      </SidebarInset>
    </>
  )
}

export default function DashboardPageLayout(props: DashboardPageLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardPageLayoutInner {...props} />
    </SidebarProvider>
  )
}
