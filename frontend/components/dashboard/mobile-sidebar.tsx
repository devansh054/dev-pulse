"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import AtomIcon from "@/components/icons/atom";
import BracketsIcon from "@/components/icons/brackets";
import ProcessorIcon from "@/components/icons/proccesor";
import CuteRobotIcon from "@/components/icons/cute-robot";
import EmailIcon from "@/components/icons/email";
import GearIcon from "@/components/icons/gear";
import MonkeyIcon from "@/components/icons/monkey"
import Logo from "@/components/ui/logo";
import { Bullet } from "@/components/ui/bullet";
import Image from "next/image";
import { Atom } from "lucide-react";

const navigationItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: BracketsIcon,
  },
  {
    title: "Laboratory",
    url: "/laboratory",
    icon: Atom,
  },
  {
    title: "Devices",
    url: "/devices",
    icon: ProcessorIcon,
  },
  {
    title: "Security",
    url: "/security",
    icon: CuteRobotIcon,
  },
  {
    title: "Communication",
    url: "/communication",
    icon: EmailIcon,
  },
  {
    title: "Admin Settings",
    url: "/admin",
    icon: GearIcon,
  },
];

export function MobileSidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { openMobile, setOpenMobile } = useSidebar();

  console.log('🔧 MobileSidebar rendering, openMobile:', openMobile);

  // Use authenticated user data or fallback to mock data
  const userData = isAuthenticated && user ? {
    name: user.name || user.login || "GitHub User",
    email: user.email || `${user.login}@github.com`,
    avatar: (user as any).avatarUrl || user.image || "/avatars/user_krimson.png",
  } : {
    name: "Developer",
    email: "dev@devpulse.io",
    avatar: "/avatars/user_krimson.png",
  };

  const handleNavigation = (url: string) => {
    window.location.href = url;
    setOpenMobile(false);
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
          openMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpenMobile(false)}
      />
      
      {/* Sidebar */}
      <div 
        className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl transition-transform duration-300 ease-in-out"
        style={{
          transform: openMobile ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex overflow-clip size-6 shrink-0 items-center justify-center rounded bg-sidebar-primary-foreground/10 transition-colors group-hover:bg-sidebar-primary text-sidebar-primary-foreground">
              <Logo size="sm" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="text-xl font-display">DevPulse</span>
              <span className="text-xs uppercase text-muted-foreground">Code. Analyze. Thrive.</span>
            </div>
            <button 
              onClick={() => setOpenMobile(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-4">
          <div className="px-2 text-xs uppercase tracking-wider mb-4 flex items-center">
            <Bullet className="mr-2" />
            Tools
          </div>
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.url || 
                (item.url !== "/dashboard" && pathname.startsWith(item.url));
              
              return (
                <button
                  key={item.title}
                  onClick={() => handleNavigation(item.url)}
                  className={`w-full justify-start px-3 py-2.5 text-sm font-medium rounded-md flex items-center transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <item.icon className="mr-3 size-5" />
                  {item.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-4">
          <div className="px-2 text-xs uppercase tracking-wider mb-4 flex items-center">
            <Bullet className="mr-2" />
            User
          </div>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="size-10 shrink-0 overflow-hidden rounded-full">
              <Image
                src={userData.avatar}
                alt={userData.name}
                width={40}
                height={40}
                className="size-full object-cover"
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {userData.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {userData.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
