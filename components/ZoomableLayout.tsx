"use client"

import { useEffect } from 'react'
import { useDesktopZoom } from '../hooks/useDesktopZoom'
import DesktopZoomControl, { useZoomKeyboardShortcuts } from './DesktopZoomControl'

interface ZoomableLayoutProps {
  children: React.ReactNode
  className?: string
  showZoomControl?: boolean
  zoomControlPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  enableKeyboardShortcuts?: boolean
  transformOrigin?: string
  onlyDesktop?: boolean
}

export default function ZoomableLayout({
  children,
  className = '',
  showZoomControl = true,
  zoomControlPosition = 'bottom-right',
  enableKeyboardShortcuts = true,
  transformOrigin = 'top center',
  onlyDesktop = true
}: ZoomableLayoutProps) {
  const { scale } = useDesktopZoom()
  const { handleKeyDown } = useZoomKeyboardShortcuts()

  // 键盘快捷键支持
  useEffect(() => {
    if (!enableKeyboardShortcuts) return

    const keyDownHandler = (event: KeyboardEvent) => {
      // 避免在输入框中触发缩放
      const target = event.target as HTMLElement
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') {
        return
      }
      handleKeyDown(event)
    }

    window.addEventListener('keydown', keyDownHandler)
    return () => window.removeEventListener('keydown', keyDownHandler)
  }, [enableKeyboardShortcuts, handleKeyDown])

  // 检测是否为桌面端
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768

  // 如果设置为仅桌面端且当前不是桌面端，则不应用缩放
  if (onlyDesktop && !isDesktop) {
    return <>{children}</>
  }

  return (
    <>
      {/* 缩放容器 */}
      <div
        className={`transition-transform duration-300 ease-out ${className}`}
        style={{
          transform: `scale(${scale})`,
          transformOrigin,
          width: scale < 1 ? `${100 / scale}%` : '100%',
          height: scale < 1 ? `${100 / scale}%` : '100%'
        }}
      >
        {children}
      </div>

      {/* 缩放控制器 */}
      {showZoomControl && isDesktop && (
        <DesktopZoomControl 
          position={zoomControlPosition}
          autoHide={false}
        />
      )}
    </>
  )
}

// 特定场景的缩放布局组件
export function ZoomablePageLayout({ children, ...props }: Omit<ZoomableLayoutProps, 'transformOrigin'>) {
  return (
    <ZoomableLayout 
      {...props}
      transformOrigin="top center"
      className="min-h-screen"
    >
      {children}
    </ZoomableLayout>
  )
}

export function ZoomableCardLayout({ children, ...props }: Omit<ZoomableLayoutProps, 'transformOrigin'>) {
  return (
    <ZoomableLayout 
      {...props}
      transformOrigin="center"
      className="w-full"
    >
      {children}
    </ZoomableLayout>
  )
}

// 仅在特定条件下显示的缩放控制器
export function ConditionalZoomControl({
  show,
  condition,
  ...props
}: {
  show?: boolean
  condition?: () => boolean
} & React.ComponentProps<typeof DesktopZoomControl>) {
  const shouldShow = show ?? (condition ? condition() : true)
  
  if (!shouldShow) return null
  
  return <DesktopZoomControl {...props} />
}