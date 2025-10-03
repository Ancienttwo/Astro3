import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Platform, View } from 'react-native'

export type Point = { x: number; y: number }

type AnchorsMap = Map<string, Point>

interface AnchorsContextValue {
  // container metrics
  width: number
  height: number
  setSize: (w: number, h: number) => void
  // web-only: DOM rect of container
  getContainerRect: () => DOMRect | null
  setContainerEl: (el: HTMLElement | null) => void
  // anchor ops
  setAnchor: (id: string, p: Point) => void
  removeAnchor: (id: string) => void
  anchors: AnchorsMap
  // helpers
  branchCenter: (branch: string) => Point | null
  oppositeBranchCenter: (branch: string) => Point | null
}

const AnchorsContext = createContext<AnchorsContextValue | null>(null)

const BRANCH_GRID_POS: Record<string, { row: number; col: number }> = {
  '巳': { row: 1, col: 1 },
  '午': { row: 1, col: 2 },
  '未': { row: 1, col: 3 },
  '申': { row: 1, col: 4 },
  '辰': { row: 2, col: 1 },
  '酉': { row: 2, col: 4 },
  '卯': { row: 3, col: 1 },
  '戌': { row: 3, col: 4 },
  '寅': { row: 4, col: 1 },
  '丑': { row: 4, col: 2 },
  '子': { row: 4, col: 3 },
  '亥': { row: 4, col: 4 },
}

const RING_ORDER = ['巳','午','未','申','酉','戌','亥','子','丑','寅','卯','辰'] as const

export const AnchorsProvider: React.FC<{ children: React.ReactNode }>
  = ({ children }) => {
  const [size, setSizeState] = useState({ width: 0, height: 0 })
  const anchorsRef = useRef<AnchorsMap>(new Map())
  const [, force] = useState(0)

  // Web container ref for measurement
  const containerElRef = useRef<HTMLElement | null>(null)
  const containerRectRef = useRef<DOMRect | null>(null)

  const setSize = useCallback((w: number, h: number) => {
    setSizeState(prev => (prev.width === w && prev.height === h ? prev : { width: w, height: h }))
  }, [])

  const setContainerEl = useCallback((el: HTMLElement | null) => {
    containerElRef.current = el
    if (Platform.OS === 'web') {
      if (el) {
        containerRectRef.current = el.getBoundingClientRect()
      } else {
        containerRectRef.current = null
      }
    }
  }, [])

  // Observe size changes (web)
  useEffect(() => {
    if (Platform.OS !== 'web') return
    const el = containerElRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const cr = e.contentRect
        setSize(cr.width, cr.height)
        containerRectRef.current = el.getBoundingClientRect()
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [setSize])

  const setAnchor = useCallback((id: string, p: Point) => {
    anchorsRef.current.set(id, p)
    force(x => x + 1)
  }, [])

  const removeAnchor = useCallback((id: string) => {
    if (anchorsRef.current.delete(id)) force(x => x + 1)
  }, [])

  const branchCenter = useCallback((branch: string): Point | null => {
    const { width, height } = size
    if (!width || !height) return null
    const pos = BRANCH_GRID_POS[branch]
    if (!pos) return null
    const cellW = width / 4
    const cellH = height / 4
    const cx = (pos.col - 0.5) * cellW
    const cy = (pos.row - 0.5) * cellH
    return { x: cx, y: cy }
  }, [size])

  const oppositeBranchCenter = useCallback((branch: string): Point | null => {
    const idx = RING_ORDER.indexOf(branch as any)
    if (idx < 0) return null
    const opposite = RING_ORDER[(idx + 6) % 12] ?? branch
    return branchCenter(opposite)
  }, [branchCenter])

  const getContainerRect = useCallback(() => {
    return containerRectRef.current
  }, [])

  const ctx: AnchorsContextValue = useMemo(() => ({
    width: size.width,
    height: size.height,
    setSize,
    getContainerRect,
    setContainerEl,
    anchors: anchorsRef.current,
    setAnchor,
    removeAnchor,
    branchCenter,
    oppositeBranchCenter,
  }), [size, setSize, getContainerRect, setContainerEl, setAnchor, removeAnchor, branchCenter, oppositeBranchCenter])

  if (Platform.OS === 'web') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }} ref={el => setContainerEl(el)}>
        <AnchorsContext.Provider value={ctx}>
          {children}
        </AnchorsContext.Provider>
      </div>
    )
  }

  // Native wrapper measures size via onLayout
  return (
    <View style={{ flex: 1 }} onLayout={e => setSize(e.nativeEvent.layout.width, e.nativeEvent.layout.height)}>
      <AnchorsContext.Provider value={ctx}>
        {children}
      </AnchorsContext.Provider>
    </View>
  )
}

export function useAnchors() {
  const v = useContext(AnchorsContext)
  if (!v) throw new Error('useAnchors must be used within AnchorsProvider')
  return v
}

// Helpers to compute colors for ABCD
export const sihuaColor = (k: 'A'|'B'|'C'|'D'|string): string => {
  const map: Record<string,string> = {
    A: '#10B981', // 禄 - 绿
    B: '#8B5CF6', // 权 - 紫
    C: '#3B82F6', // 科 - 蓝
    D: '#EF4444', // 忌 - 红
  }
  return map[k] || '#6B7280'
}
