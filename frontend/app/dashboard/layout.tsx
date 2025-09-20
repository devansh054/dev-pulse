import { Roboto_Mono } from "next/font/google";
import { Metadata } from "next";
import { V0Provider } from "@/lib/v0-context";
import localFont from "next/font/local";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import mockDataJson from "@/mock.json";
import type { MockData } from "@/types/dashboard";
import Widget from "@/components/dashboard/widget";
import Notifications from "@/components/dashboard/notifications";
import { MobileChat } from "@/components/chat/mobile-chat";
import Chat from "@/components/chat";
import ProtectedRoute from "@/components/auth/protected-route";

const mockData = mockDataJson as MockData;

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

const rebelGrotesk = localFont({
  src: "../../public/fonts/Rebels-Fett.woff2",
  variable: "--font-rebels",
  display: "swap",
});

const isV0 = process.env["VERCEL_URL"]?.includes("vusercontent.net") ?? false;

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <V0Provider isV0={isV0}>
        <SidebarProvider>
          <div className="min-h-screen bg-background text-foreground">
            {/* Mobile Header - only visible on mobile */}
            <MobileHeader />

            {/* Mobile Sidebar */}
            <MobileSidebar />

            {/* Desktop Layout */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:px-4">
              <div className="hidden lg:block col-span-2 top-0 relative">
                <DashboardSidebar />
              </div>
              <div className="col-span-1 lg:col-span-7">{children}</div>
              <div className="col-span-3 hidden lg:block">
                <div className="space-y-4 py-4 min-h-screen max-h-screen sticky top-0 overflow-clip">
                  <Widget />
                  <Notifications />
                  <Chat />
                </div>
              </div>
            </div>

            {/* Mobile Chat - floating CTA with drawer */}
            <MobileChat />
          </div>
        </SidebarProvider>
      </V0Provider>
    </ProtectedRoute>
  );
}
