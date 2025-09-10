"use client"

import { useState } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Settings, Monitor } from 'lucide-react'
import { Button } from './ui/button'
import { useDesktopZoom } from '../hooks/useDesktopZoom'

interface DesktopZoomControlProps {
  className?: string
  showPercentage?: boolean
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  autoHide?: boolean
}

export default function DesktopZoomControl({
  className = '',
  showPercentage = true,
  position = 'bottom-right',
  autoHide = false
}: DesktopZoomControlProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(!autoHide)
  
  const {
    scale,
    setScale,
    isAutoScale,
    toggleAutoScale,
    resetScale,
    zoomIn,
    zoomOut,
    canZoomIn,
    canZoomOut
  } = useDesktopZoom()

  // 位置样式映射
  const positionStyles = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  }

  // 如果不可见且开启了自动隐藏，返回切换按钮
  if (!isVisible && autoHide) {
    return (
      <div className={`fixed ${positionStyles[position]} z-50`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 shadow-lg"
        >
          <Monitor className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed ${positionStyles[position]} z-50 ${className}`}>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg p-2">
        {/* 主控制区域 */}
        <div className="flex items-center gap-2">
          {/* 缩小按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            disabled={!canZoomOut}
            className="text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed p-2"
            title="缩小 (Ctrl + -)"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          {/* 缩放比例显示 */}
          {showPercentage && (
            <div className="flex items-center gap-1 px-3 py-1 bg-black/20 rounded text-white text-sm font-mono min-w-[60px] justify-center">
              {Math.round(scale * 100)}%
            </div>
          )}

          {/* 放大按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            disabled={!canZoomIn}
            className="text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed p-2"
            title="放大 (Ctrl + +)"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          {/* 设置按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:bg-white/20 p-2"
            title="设置"
          >
            <Settings className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </Button>
        </div>

        {/* 扩展控制区域 */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-white/20 space-y-2">
            {/* 重置按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetScale}
              className="w-full text-white hover:bg-white/20 justify-start gap-2"
              title="重置缩放"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </Button>

            {/* 自动缩放切换 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAutoScale}
              className={`w-full justify-start gap-2 ${
                isAutoScale 
                  ? 'text-yellow-400 hover:bg-yellow-400/20' 
                  : 'text-white hover:bg-white/20'
              }`}
              title="切换自动缩放"
            >
              <Monitor className="w-4 h-4" />
              {isAutoScale ? '自动缩放' : '手动缩放'}
            </Button>

            {/* 预设缩放比例 */}
            <div className="grid grid-cols-3 gap-1">
              {[0.7, 0.85, 1.0].map((ratio) => (
                <Button
                  key={ratio}
                  variant="ghost"
                  size="sm"
                  onClick={() => setScale(ratio)}
                  className={`text-xs px-2 py-1 ${
                    Math.abs(scale - ratio) < 0.01
                      ? 'text-yellow-400 bg-yellow-400/20' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {Math.round(ratio * 100)}%
                </Button>
              ))}
            </div>

            {/* 自动隐藏选项 */}
            {autoHide && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="w-full text-white hover:bg-white/20 justify-start"
              >
                隐藏控制器
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 键盘快捷键提示 */}
      {isExpanded && (
        <div className="mt-2 bg-black/40 backdrop-blur-md rounded-lg p-2 text-xs text-white/70">
          <div>快捷键:</div>
          <div>Ctrl + Plus: 放大</div>
          <div>Ctrl + Minus: 缩小</div>
          <div>Ctrl + 0: 重置</div>
        </div>
      )}
    </div>
  )
}

// 键盘快捷键支持
export function useZoomKeyboardShortcuts() {
  const { zoomIn, zoomOut, resetScale } = useDesktopZoom()

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '+':
        case '=':
          event.preventDefault()
          zoomIn()
          break
        case '-':
          event.preventDefault()
          zoomOut()
          break
        case '0':
          event.preventDefault()
          resetScale()
          break
      }
    }
  }

  return { handleKeyDown }
}