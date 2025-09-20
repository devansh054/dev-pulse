"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import MonkeyIcon from "@/components/icons/monkey";
import GearIcon from "@/components/icons/gear";
import Logo from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";
import AtomIcon from "@/components/icons/atom";
import BracketsIcon from "@/components/icons/brackets";
import ProcessorIcon from "@/components/icons/proccesor";
import CuteRobotIcon from "@/components/icons/cute-robot";
import EmailIcon from "@/components/icons/email";
import DotsVerticalIcon from "@/components/icons/dots-vertical";
import { Bullet } from "@/components/ui/bullet";
import LockIcon from "@/components/icons/lock";
import Image from "next/image";
import { useIsV0 } from "@/lib/v0-context";
import { cn } from "@/lib/utils";

// This is sample data for the sidebar
const data = {
  navMain: [
    {
      title: "Tools",
      items: [
        {
          title: "Overview",
          url: "/",
          icon: BracketsIcon,
          isActive: false,
        },
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: BracketsIcon,
          isActive: true,
        },
        {
          title: "Laboratory",
          url: "/laboratory",
          icon: AtomIcon,
          isActive: false,
        },
        {
          title: "Devices",
          url: "/devices",
          icon: ProcessorIcon,
          isActive: false,
        },
        {
          title: "Security",
          url: "/security",
          icon: CuteRobotIcon,
          isActive: false,
        },
        {
          title: "Communication",
          url: "/communication",
          icon: EmailIcon,
          isActive: false,
        },
        {
          title: "Admin Settings",
          url: "/admin",
          icon: GearIcon,
          isActive: false,
          locked: false,
        },
      ],
    },
  ],
  desktop: {
    title: "Desktop (Online)",
    status: "online",
  },
  user: {
    name: "Developer",
    email: "dev@devpulse.io",
    avatar: "/avatars/user_krimson.png",
  },
};

export function DashboardSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const isV0 = useIsV0();
  const { user, isAuthenticated, signOut } = useAuth();

  // Use authenticated user data or fallback to mock data
  const userData = isAuthenticated && user ? {
    name: user.name || user.login || "GitHub User",
    email: user.email || `${user.login}@github.com`,
    avatar: (user as any).avatarUrl || user.image || "/avatars/user_krimson.png",
  } : data.user;

  return (
    <Sidebar {...props} className={cn("py-sides", className)}>
      <SidebarHeader className="rounded-t-lg flex gap-3 flex-row rounded-b-none">
        <div className="flex overflow-clip size-12 shrink-0 items-center justify-center rounded bg-sidebar-primary-foreground/10 transition-colors group-hover:bg-sidebar-primary text-sidebar-primary-foreground">
          <Logo size="lg" className="group-hover:scale-[1.2] origin-center transition-transform" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="text-2xl font-display">DevPulse</span>
          <span className="text-xs uppercase">Code. Analyze. Thrive.</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {data.navMain.map((group, i) => (
          <SidebarGroup
            className={cn(i === 0 && "rounded-t-none")}
            key={group.title}
          >
            <SidebarGroupLabel>
              <Bullet className="mr-2" />
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className={cn(
                      item.locked && "pointer-events-none opacity-50",
                      isV0 && "pointer-events-none"
                    )}
                    data-disabled={item.locked}
                  >
                    <SidebarMenuButton
                      asChild={!item.locked}
                      isActive={item.isActive}
                      disabled={item.locked}
                      className={cn(
                        "disabled:cursor-not-allowed",
                        item.locked && "pointer-events-none"
                      )}
                    >
                      {item.locked ? (
                        <div className="flex items-center gap-3 w-full">
                          <item.icon className="size-5" />
                          <span>{item.title}</span>
                        </div>
                      ) : (
                        <a href={item.url}>
                          <item.icon className="size-5" />
                          <span>{item.title}</span>
                        </a>
                      )}
                    </SidebarMenuButton>
                    {item.locked && (
                      <SidebarMenuBadge>
                        <LockIcon className="size-5 block" />
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-0">
        <SidebarGroup>
          <SidebarGroupLabel>
            <Bullet className="mr-2" />
            User
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Popover>
                  <PopoverTrigger className="flex gap-0.5 w-full group cursor-pointer">
                    <div className="shrink-0 flex size-14 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-clip">
                      <Image
                        src={userData.avatar}
                        alt={userData.name}
                        width={120}
                        height={120}
                      />
                    </div>
                    <div className="group/item pl-3 pr-1.5 pt-2 pb-1.5 flex-1 flex bg-sidebar-accent hover:bg-sidebar-accent-active/75 items-center rounded group-data-[state=open]:bg-sidebar-accent-active group-data-[state=open]:hover:bg-sidebar-accent-active group-data-[state=open]:text-sidebar-accent-foreground">
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate text-xl font-display">
                          {userData.name}
                        </span>
                        <span className="truncate text-xs uppercase opacity-50 group-hover/item:opacity-100">
                          {userData.email}
                        </span>
                      </div>
                      <DotsVerticalIcon className="ml-auto size-4" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-56 p-0"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <div className="flex flex-col">
                      <button 
                        onClick={() => window.location.href = '/profile'}
                        className="flex items-center px-4 py-2 text-sm hover:bg-accent"
                      >
                        <MonkeyIcon className="mr-2 h-4 w-4" />
                        Account
                      </button>
                      <button 
                        onClick={() => window.location.href = '/admin'}
                        className="flex items-center px-4 py-2 text-sm hover:bg-accent"
                      >
                        <GearIcon className="mr-2 h-4 w-4" />
                        Settings
                      </button>
                      {isAuthenticated && (
                        <button 
                          onClick={signOut}
                          className="flex items-center px-4 py-2 text-sm hover:bg-accent text-red-600 hover:text-red-700"
                        >
                          <LockIcon className="mr-2 h-4 w-4" />
                          Sign Out
                        </button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
