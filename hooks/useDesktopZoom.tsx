"use client"

import { useState, useEffect, useCallback } from 'react'

interface UseDesktopZoomOptions {
  minScale?: number
  maxScale?: number
  autoScaleBreakpoint?: number
  enableAutoScale?: boolean
}

interface UseDesktopZoomReturn {
  scale: number
  setScale: (scale: number) => void
  isAutoScale: boolean
  toggleAutoScale: () => void
  resetScale: () => void
  zoomIn: () => void
  zoomOut: () => void
  canZoomIn: boolean
  canZoomOut: boolean
}

export function useDesktopZoom({
  minScale = 0.7,
  maxScale = 1.2,
  autoScaleBreakpoint = 1200,
  enableAutoScale = true
}: UseDesktopZoomOptions = {}): UseDesktopZoomReturn {
  const [scale, setScaleState] = useState(1)
  const [isAutoScale, setIsAutoScale] = useState(enableAutoScale)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)

  // 计算自动缩放比例
  const calculateAutoScale = useCallback((width: number): number => {
    if (width >= autoScaleBreakpoint) return 1
    
    // 当窗口宽度小于断点时，按比例缩放，但不低于最小值
    const ratio = width / autoScaleBreakpoint
    return Math.max(minScale, ratio)
  }, [autoScaleBreakpoint, minScale])

  // 监听窗口大小变化
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const newWidth = window.innerWidth
      setWindowWidth(newWidth)
      
      // 如果开启了自动缩放，根据窗口大小自动调整
      if (isAutoScale) {
        const autoScale = calculateAutoScale(newWidth)
        setScaleState(autoScale)
      }
    }

    window.addEventListener('resize', handleResize)
    
    // 初始化时计算缩放比例
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [isAutoScale, calculateAutoScale])

  // 设置缩放比例（带边界检查）
  const setScale = useCallback((newScale: number) => {
    const clampedScale = Math.max(minScale, Math.min(maxScale, newScale))
    setScaleState(clampedScale)
    // 设置手动缩放时关闭自动缩放
    if (isAutoScale) {
      setIsAutoScale(false)
    }
  }, [minScale, maxScale, isAutoScale])

  // 切换自动缩放
  const toggleAutoScale = useCallback(() => {
    setIsAutoScale(prev => {
      const newAutoScale = !prev
      if (newAutoScale) {
        // 开启自动缩放时重新计算
        const autoScale = calculateAutoScale(windowWidth)
        setScaleState(autoScale)
      }
      return newAutoScale
    })
  }, [calculateAutoScale, windowWidth])

  // 重置缩放
  const resetScale = useCallback(() => {
    if (isAutoScale) {
      const autoScale = calculateAutoScale(windowWidth)
      setScaleState(autoScale)
    } else {
      setScaleState(1)
    }
  }, [isAutoScale, calculateAutoScale, windowWidth])

  // 放大
  const zoomIn = useCallback(() => {
    setScale(scale + 0.1)
  }, [scale, setScale])

  // 缩小
  const zoomOut = useCallback(() => {
    setScale(scale - 0.1)
  }, [scale, setScale])

  // 检查是否可以继续缩放
  const canZoomIn = scale < maxScale
  const canZoomOut = scale > minScale

  return {
    scale,
    setScale,
    isAutoScale,
    toggleAutoScale,
    resetScale,
    zoomIn,
    zoomOut,
    canZoomIn,
    canZoomOut
  }
}