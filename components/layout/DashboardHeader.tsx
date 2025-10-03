"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Bell, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

export function DashboardHeader({
  title,
  subtitle,
  actions,
  className,
}: DashboardHeaderProps) {
  const t = useTranslations('dashboard')

  const [notifications] = React.useState([
    {
      id: "1",
      title: "Daily Check-in Reminder",
      message: "Don't forget to complete your daily check-in!",
      time: "5m ago",
      unread: true,
    },
    {
      id: "2",
      title: "New Task Available",
      message: "Complete 3 tasks to earn bonus points",
      time: "1h ago",
      unread: true,
    },
  ])

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6",
        className
      )}
    >
      {/* Sidebar Toggle */}
      <SidebarTrigger className="text-gray-700 hover:text-[#3D0B5B]" />

      {/* Title Section */}
      <div className="flex flex-1 flex-col">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder={t('header.search')}
            className="w-64 pl-9 pr-4 h-9 border-gray-300 focus-visible:ring-[#3D0B5B]"
          />
        </div>
      </div>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-700 hover:text-[#3D0B5B] hover:bg-gray-100"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-[#FBCB0A] p-0 text-xs font-semibold text-[#3D0B5B]"
              >
                {unreadCount}
              </Badge>
            )}
            <span className="sr-only">{t('header.notifications')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h3 className="font-semibold text-gray-900">{t('header.notifications')}</h3>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-[#FBCB0A] text-[#3D0B5B]"
              >
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-4 cursor-pointer"
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {notification.time}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{notification.message}</p>
                {notification.unread && (
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#FBCB0A]" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom Actions */}
      {actions}
    </header>
  )
}
