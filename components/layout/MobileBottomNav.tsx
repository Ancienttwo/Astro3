"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, BarChart3, CheckSquare, Trophy, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface NavItem {
  titleKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavItem[] = [
  {
    titleKey: "sidebar.dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    titleKey: "sidebar.wiki",
    href: "/wiki",
    icon: BarChart3,
  },
  {
    titleKey: "sidebar.tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    titleKey: "sidebar.leaderboard",
    href: "/leaderboard",
    icon: Trophy,
  },
  {
    titleKey: "sidebar.settings",
    href: "/settings",
    icon: Settings,
  },
];

/**
 * Mobile bottom navigation bar
 * Displayed on screens <768px
 * All touch targets are ≥44px for WCAG AAA compliance
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("dashboard");

  // Normalize path by removing locale prefix
  const normalizePath = (path: string) => {
    return path.replace(/^\/(en|ja|zh)/, "") || "/";
  };

  const normalizedPathname = normalizePath(pathname);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 shadow-lg"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = normalizedPathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                // Touch target: 44px minimum height/width
                "flex flex-col items-center justify-center gap-1 min-w-[60px] min-h-[44px] rounded-lg transition-colors",
                isActive
                  ? "bg-purple-50 dark:bg-purple-900/20 text-[#3D0B5B] dark:text-purple-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
              )}
              aria-label={t(item.titleKey)}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive
                    ? "text-[#3D0B5B] dark:text-purple-400"
                    : "text-gray-600 dark:text-gray-400"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive
                    ? "text-[#3D0B5B] dark:text-purple-400"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                {t(item.titleKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
