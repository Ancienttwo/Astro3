"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  Home,
  Sparkles,
  BookOpen,
  Trophy,
  ListTodo,
  Settings,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Logo from "@/components/Logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/PrivyContext"

interface NavItem {
  titleKey: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

interface DashboardSidebarProps {
  locale: string
  children: React.ReactNode
}

const navigationItems: NavItem[] = [
  {
    titleKey: "sidebar.dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    titleKey: "sidebar.rewards",
    href: "/web3-rewards",
    icon: Sparkles,
  },
  {
    titleKey: "sidebar.wiki",
    href: "/wiki",
    icon: BookOpen,
  },
  {
    titleKey: "sidebar.leaderboard",
    href: "/leaderboard",
    icon: Trophy,
  },
  {
    titleKey: "sidebar.tasks",
    href: "/tasks",
    icon: ListTodo,
  },
  {
    titleKey: "sidebar.settings",
    href: "/settings",
    icon: Settings,
  },
]

function DashboardSidebarContent({ locale }: { locale: string }) {
  const pathname = usePathname()
  const { user, walletAddress } = useAuth()
  const { state } = useSidebar()
  const t = useTranslations('dashboard')

  const isCollapsed = state === "collapsed"

  return (
    <>
      <SidebarHeader className="border-b border-gray-200">
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-3 transition-all"
          >
            <Logo size={32} variant="app" />
            {!isCollapsed && (
              <span className="text-lg font-semibold text-[#3D0B5B]">
                AstroZi
              </span>
            )}
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {navigationItems.map((item) => {
            const isActive = pathname === `/${locale}${item.href}`
            const Icon = item.icon

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={isCollapsed ? t(item.titleKey) : undefined}
                  className={cn(
                    "group relative w-full justify-start transition-colors",
                    isActive
                      ? "bg-[#3D0B5B]/10 text-[#3D0B5B] font-medium hover:bg-[#3D0B5B]/15"
                      : "text-gray-700 hover:bg-gray-100 hover:text-[#3D0B5B]"
                  )}
                >
                  <Link
                    href={`/${locale}${item.href}`}
                    className="flex items-center gap-3 w-full"
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive ? "text-[#3D0B5B]" : "text-gray-600"
                      )}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 truncate">{t(item.titleKey)}</span>
                        {item.badge && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FBCB0A] px-1.5 text-xs font-medium text-[#3D0B5B]">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-4">
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#3D0B5B] to-[#5845DB]">
              <span className="text-sm font-semibold text-white">
                {user.email?.[0]?.toUpperCase() ||
                 walletAddress?.slice(0, 2).toUpperCase() ||
                 "U"}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.email || "Web3 User"}
              </p>
              {walletAddress && (
                <p className="text-xs text-gray-500 truncate">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              )}
            </div>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </>
  )
}

export function DashboardSidebar({ locale, children }: DashboardSidebarProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <Sidebar
          collapsible="icon"
          className="border-r border-gray-200 bg-white"
        >
          <DashboardSidebarContent locale={locale} />
        </Sidebar>

        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}

// Export toggle trigger for use in page headers
export { SidebarTrigger } from "@/components/ui/sidebar"
