"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { ChevronDown, ChevronUp, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface EducationalCardProps {
  id: string
  title: string
  icon?: LucideIcon
  children: React.ReactNode
  defaultExpanded?: boolean
  className?: string
  previewContent?: React.ReactNode
  expandText?: string
  collapseText?: string
}

export function EducationalCard({
  id,
  title,
  icon: Icon,
  children,
  defaultExpanded = false,
  className,
  previewContent,
  expandText,
  collapseText,
}: EducationalCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)
  const t = useTranslations('dashboard')

  const finalExpandText = expandText || t('educational.expand')
  const finalCollapseText = collapseText || t('educational.collapse')

  return (
    <Card
      id={id}
      className={cn(
        "bg-white dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm",
        className
      )}
    >
      <CardHeader
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors border-b border-gray-200 dark:border-slate-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1">
          {Icon && (
            <Icon className="h-5 w-5 text-[#FBCB0A] flex-shrink-0" />
          )}
          <h2 className="text-xl font-bold text-[#3D0B5B] dark:text-amber-400 font-noto">
            {title}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-600 dark:text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600 dark:text-slate-400" />
          )}
          <span className="sr-only">
            {isExpanded ? finalCollapseText : finalExpandText}
          </span>
        </Button>
      </CardHeader>

      {/* Preview Content (always visible when collapsed) */}
      {!isExpanded && previewContent && (
        <CardContent className="p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {previewContent}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="text-[#3D0B5B] dark:text-purple-400 border-[#3D0B5B]/30 hover:bg-[#3D0B5B]/5"
          >
            {finalExpandText}
          </Button>
        </CardContent>
      )}

      {/* Full Content (visible when expanded) */}
      {isExpanded && (
        <CardContent className="p-4">
          {children}
        </CardContent>
      )}
    </Card>
  )
}
