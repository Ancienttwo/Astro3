"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">切换主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>浅色模式</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>深色模式</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>跟随系统</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// 简化版本的主题切换组件，用于设置页面
export function ThemeSettings() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-base font-semibold text-primary dark:text-amber-400 mb-1">主题偏好</h3>
        <p className="text-xs text-muted-foreground dark:text-slate-300">
          选择您喜欢的界面风格
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        <div 
          className={`group cursor-pointer rounded-lg border-2 p-3 transition-all duration-200 hover:scale-[1.01] hover:shadow-md ${
            theme === "light" 
              ? "border-primary dark:border-amber-400 bg-primary/5 dark:bg-amber-400/10 shadow-sm" 
              : "border-border dark:border-slate-600 bg-background dark:bg-slate-800/60 hover:border-primary/30 dark:hover:border-amber-400/30 hover:bg-primary/5 dark:hover:bg-amber-400/10"
          }`}
          onClick={() => setTheme("light")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                theme === "light" ? "bg-primary dark:bg-amber-500 text-white" : "bg-muted dark:bg-slate-700 text-muted-foreground dark:text-slate-400 group-hover:bg-primary/10 dark:group-hover:bg-amber-500/10 group-hover:text-primary dark:group-hover:text-amber-400"
              }`}>
                <Sun className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground dark:text-slate-100">明亮模式</div>
                <div className="text-xs text-muted-foreground dark:text-slate-300">清新明亮，适合日间使用</div>
              </div>
            </div>
            {theme === "light" && (
              <div className="h-2 w-2 rounded-full bg-primary dark:bg-amber-400"></div>
            )}
          </div>
        </div>

        <div 
          className={`group cursor-pointer rounded-lg border-2 p-3 transition-all duration-200 hover:scale-[1.01] hover:shadow-md ${
            theme === "dark" 
              ? "border-primary dark:border-amber-400 bg-primary/5 dark:bg-amber-400/10 shadow-sm" 
              : "border-border dark:border-slate-600 bg-background dark:bg-slate-800/60 hover:border-primary/30 dark:hover:border-amber-400/30 hover:bg-primary/5 dark:hover:bg-amber-400/10"
          }`}
          onClick={() => setTheme("dark")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                theme === "dark" ? "bg-primary dark:bg-amber-500 text-white" : "bg-muted dark:bg-slate-700 text-muted-foreground dark:text-slate-400 group-hover:bg-primary/10 dark:group-hover:bg-amber-500/10 group-hover:text-primary dark:group-hover:text-amber-400"
              }`}>
                <Moon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground dark:text-slate-100">深色模式</div>
                <div className="text-xs text-muted-foreground dark:text-slate-300">黑金配色，神秘典雅的命理风格</div>
              </div>
            </div>
            {theme === "dark" && (
              <div className="h-2 w-2 rounded-full bg-primary dark:bg-amber-400"></div>
            )}
          </div>
        </div>

        <div 
          className={`group cursor-pointer rounded-lg border-2 p-3 transition-all duration-200 hover:scale-[1.01] hover:shadow-md ${
            theme === "system" 
              ? "border-primary dark:border-amber-400 bg-primary/5 dark:bg-amber-400/10 shadow-sm" 
              : "border-border dark:border-slate-600 bg-background dark:bg-slate-800/60 hover:border-primary/30 dark:hover:border-amber-400/30 hover:bg-primary/5 dark:hover:bg-amber-400/10"
          }`}
          onClick={() => setTheme("system")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                theme === "system" ? "bg-primary dark:bg-amber-500 text-white" : "bg-muted dark:bg-slate-700 text-muted-foreground dark:text-slate-400 group-hover:bg-primary/10 dark:group-hover:bg-amber-500/10 group-hover:text-primary dark:group-hover:text-amber-400"
              }`}>
                <Monitor className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground dark:text-slate-100">跟随系统</div>
                <div className="text-xs text-muted-foreground dark:text-slate-300">根据设备设置自动切换</div>
              </div>
            </div>
            {theme === "system" && (
              <div className="h-2 w-2 rounded-full bg-primary dark:bg-amber-400"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 