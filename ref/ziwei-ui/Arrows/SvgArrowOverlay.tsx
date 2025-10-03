import React, { useEffect, useMemo } from 'react'
import { Platform, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import Animated, { useSharedValue, useAnimatedProps, withTiming, withRepeat, Easing } from 'react-native-reanimated'
import type { ChartData, Palace, Star } from '../types'
import { useAnchors, sihuaColor } from './AnchorContext'
// 直接引入常量表，避免运行时环境下某些聚合入口的装载顺序问题
import { BIRTH_YEAR_SIHUA } from '@astroall/ziwei-core'

const APath = Animated.createAnimatedComponent(Path)

type Arrow = {
  id: string
  from: { x: number; y: number }
  to: { x: number; y: number }
  color: string
  dashed?: boolean
  head?: boolean
  width?: number
  headSize?: number
  headWidth?: number
  flow?: boolean
}

// length utility removed (unused)

function arrowHead(d: {x:number;y:number}, t: {x:number;y:number}, size = 6) {
  // Simple triangle arrow head at target point oriented along the line
  const angle = Math.atan2(t.y - d.y, t.x - d.x)
  const a = angle
  const left = { x: t.x - size * Math.cos(a - Math.PI/6), y: t.y - size * Math.sin(a - Math.PI/6) }
  const right = { x: t.x - size * Math.cos(a + Math.PI/6), y: t.y - size * Math.sin(a + Math.PI/6) }
  return `M ${left.x} ${left.y} L ${t.x} ${t.y} L ${right.x} ${right.y}`
}

const AnimatedArrow: React.FC<{ arrow: Arrow; animate?: boolean }>
  = ({ arrow, animate = true }) => {
  // const length = lineLen(arrow.from, arrow.to)
  const progress = useSharedValue(animate ? 0 : 1)
  const dashOffset = useSharedValue(0)

  useEffect(() => {
    if (!animate) return
    progress.value = 0
    progress.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })
    if (arrow.flow && arrow.dashed) {
      dashOffset.value = 0
      dashOffset.value = withRepeat(withTiming(-14, { duration: 900, easing: Easing.linear }), -1, false)
    }
  }, [animate, progress, arrow.flow, arrow.dashed, dashOffset])

  const animatedProps = useAnimatedProps(() => {
    const base: any = { opacity: progress.value }
    if (arrow.flow && arrow.dashed) {
      base.strokeDashoffset = dashOffset.value as number
    }
    return base
  })

  return (
    <>
      <APath
        animatedProps={animatedProps}
        d={`M ${arrow.from.x} ${arrow.from.y} L ${arrow.to.x} ${arrow.to.y}`}
        stroke={arrow.color}
        strokeWidth={arrow.width ?? 2}
        fill="none"
        {...(arrow.dashed ? { strokeDasharray: [8, 6] as const } : {})}
      />
      {/* head */}
      {arrow.head !== false && (
        <Path d={arrowHead(arrow.from, arrow.to, arrow.headSize ?? 6)} stroke={arrow.color} strokeWidth={arrow.headWidth ?? (arrow.width ?? 2)} fill="none" />
      )}
    </>
  )
}

export const SvgArrowOverlay: React.FC<{
  chartData: ChartData
  activePalace: string | null
}>
  = ({ chartData, activePalace }) => {
  const { width, height, anchors } = useAnchors()

  // 辅助：环序与 grid 坐标
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
  // 环序（与 4x4 网格连通的视觉顺序，用于对宫等几何关系）
  const RING_ORDER = ['巳','午','未','申','酉','戌','亥','子','丑','寅','卯','辰'] as const
  // 业务“index”映射（0=子，顺时针 → 11=亥），用于和你沟通的编号规则
  const INDEX_TO_BRANCH = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'] as const

  const innerPointOfBranch = (branch: string): { x: number; y: number } | null => {
    if (!width || !height) return null
    const cellW = width / 4
    const cellH = height / 4
    const pos = BRANCH_GRID_POS[branch]
    if (!pos) return null
    const x0 = (pos.col - 1) * cellW
    const y0 = (pos.row - 1) * cellH
    const isCorner = (pos.row === 1 || pos.row === 4) && (pos.col === 1 || pos.col === 4)
    if (isCorner) {
      // 内圈交点为朝向中心的角
      const cx = pos.col === 1 ? x0 + cellW : x0
      const cy = pos.row === 1 ? y0 + cellH : y0
      return { x: cx, y: cy }
    }
    // 边：取朝向中心的一侧中点
    if (pos.row === 1) return { x: x0 + cellW / 2, y: y0 + cellH } // 顶部 → 底边中点
    if (pos.row === 4) return { x: x0 + cellW / 2, y: y0 }          // 底部 → 顶边中点
    if (pos.col === 1) return { x: x0 + cellW, y: y0 + cellH / 2 }  // 左侧 → 右边中点
    if (pos.col === 4) return { x: x0, y: y0 + cellH / 2 }          // 右侧 → 左边中点
    return null
  }

  const oppositeBranch = (branch: string): string | null => {
    const i = RING_ORDER.indexOf(branch as any)
    if (i < 0) return null
    return RING_ORDER[(i + 6) % 12] ?? null
  }

  // 向心自化：按“本宫+对宫”为一组，平移规则：0, +2, -2, +4, -4, ...（px）
  const buildInwardArrows = (acc: Arrow[]) => {
    type Item = { from: {x:number;y:number}; to: {x:number;y:number}; color: string }
    const groups = new Map<string, Item[]>()
    const indexOf = (b: string) => RING_ORDER.indexOf(b as any)
    chartData.palaces.forEach((p: Palace) => {
      p.stars.forEach((s: Star) => {
        if (!s.sihuaInward) return
        const opp = oppositeBranch(p.branch)
        const from = opp ? innerPointOfBranch(opp) : null
        const to = innerPointOfBranch(p.branch)
        if (!from || !to) return
        const color = sihuaColor(s.sihuaInward)
        const a = indexOf(p.branch)
        const b = opp ? indexOf(opp) : -1
        if (a < 0 || b < 0) return
        const key = a < b ? `${a}-${b}` : `${b}-${a}`
        const arr = groups.get(key) || []
        arr.push({ from, to, color })
        groups.set(key, arr)
      })
    })

    groups.forEach((items) => {
      // 应用平移偏移
      items.forEach((it, idx) => {
        const dx = it.to.x - it.from.x
        const dy = it.to.y - it.from.y
        const len = Math.max(1, Math.hypot(dx, dy))
        const nx = -dy / len
        const ny = dx / len
        const BASE = 4 // 以 4px 为单位
        const step = Math.ceil(idx / 2) * BASE // 0,4,4,8,8,... before sign
        const sign = idx === 0 ? 0 : (idx % 2 === 1 ? 1 : -1)
        const off = step * sign
        const from = { x: it.from.x + nx * off, y: it.from.y + ny * off }
        const to = { x: it.to.x + nx * off, y: it.to.y + ny * off }
        acc.push({ id: `inward:${from.x.toFixed(1)}-${from.y.toFixed(1)}-${idx}`, from, to, color: it.color, dashed: true, head: true, width: 1, headSize: 9, headWidth: 2 })
      })
    })
  }

  // Gather arrow specs：向心自化 + 部分离心自化（实线）+ 点击飞宫自化（虚线流动）
  const computed = useMemo(() => {
    const acc: Arrow[] = []
    if (!width || !height) return { arrows: acc }

    const addArrow = (
      id: string,
      from: {x:number;y:number} | null | undefined,
      to: {x:number;y:number} | null | undefined,
      color: string,
      dashed?: boolean,
      head: boolean = true,
      width?: number,
      headSize?: number,
      headWidth?: number,
    ) => {
      if (!from || !to) return
      const obj: Arrow = { id, from, to, color, dashed: !!dashed, head }
      if (typeof width !== 'undefined') obj.width = width
      if (typeof headSize !== 'undefined') obj.headSize = headSize
      if (typeof headWidth !== 'undefined') obj.headWidth = headWidth
      acc.push(obj)
    }

    buildInwardArrows(acc)

    // 离心自化：仅处理索引 [2,1,0,11]（上方四宫，向上）与 [5,6,7,8]（下方四宫，向下）
    // 用户规则：
    // 0/1/2/11 直下；5/6/7/8 直上；3/4 下后左转；9/10 下后右转
    const downIdx = new Set([0,1,2,11])
    const upIdx = new Set([5,6,7,8])
    const specialIdx = new Set([3,4,9,10])
    const upBranches = Array.from(upIdx).map(i => INDEX_TO_BRANCH[(i+12)%12])
    const downBranches = Array.from(downIdx).map(i => INDEX_TO_BRANCH[(i+12)%12])
    const specialBranches = Array.from(specialIdx).map(i => INDEX_TO_BRANCH[(i+12)%12])

  const makeOutward = (from: {x:number;y:number}, dir: 'up'|'down', _color: string, branch: string) => {
      const dx = 4
      const start = { x: from.x + dx, y: from.y }
      // 计算本宫边界位置
      const pos = BRANCH_GRID_POS[branch]
      // const cellW = width / 4
      const cellH = height / 4
      const y0 = pos ? (pos.row - 1) * cellH : from.y
      // 为避免被外层裁剪，箭头收在边界内 2px
      const MARGIN_IN = 2
      const to = dir === 'up'
        ? { x: start.x, y: y0 + MARGIN_IN }
        : { x: start.x, y: y0 + cellH - MARGIN_IN }
      return { start, to }
    }

    chartData.palaces.forEach((p: Palace) => {
      const colorFor = (s: Star) => sihuaColor(s.sihuaOutward as 'A'|'B'|'C'|'D')
      const isUp = upBranches.includes(p.branch as any)
      const isDown = downBranches.includes(p.branch as any)
      const isSpecial = specialBranches.includes(p.branch as any)
      if (!(isUp || isDown || isSpecial)) return

      let specialCounter = 0
      p.stars.forEach((s: Star, idx) => {
        if (!s.sihuaOutward) return
        const b = anchors.get(`bright:${p.branch}:${s.name}:${idx}`) || anchors.get(`star:${p.branch}:${s.name}:${idx}`)
        if (!b) return
        const color = colorFor(s)

        if (isUp || isDown) {
          const seg = makeOutward(b, isUp ? 'up' : 'down', color, p.branch)
          addArrow(`outward:${p.branch}:${s.name}:${idx}`, seg.start, seg.to, color, false, true, 2)
          return
        }

        // special: 先向下到该宫高度 2/3，再水平向外（左/右）
        const pos = BRANCH_GRID_POS[p.branch]
        if (!pos) return
        const cellW = width / 4
        const cellH = height / 4
        const x0 = (pos.col - 1) * cellW
        const y0 = (pos.row - 1) * cellH
        const turnY = Math.max(b.y, y0 + cellH * (3/5)) + (specialCounter > 0 ? 4 * specialCounter : 0)
        const startX = b.x + 4
        const via = { x: startX, y: turnY }
        const MARGIN_IN = 2
        const end = (p.branch === '卯' || p.branch === '辰')
          // 左侧宫：到左边界内 2px
          ? { x: x0 + MARGIN_IN, y: via.y }
          // 右侧宫（酉/戌）：到右边界内 2px
          : { x: x0 + cellW - MARGIN_IN, y: via.y }
        // 第一段：无箭头
        addArrow(`outward-special-1:${p.branch}:${s.name}:${idx}`, { x: startX, y: b.y }, via, color, false, false, 2)
        // 第二段：有箭头
        addArrow(`outward-special-2:${p.branch}:${s.name}:${idx}`, via, end, color, false, true, 2)
        specialCounter++
      })
    })

    // 飞宫自化已禁用：改为在星曜本身反色高亮显示（见 PalaceCard 组件）
    // 此段代码已被移除，原本用于绘制天干到四化星的虚线连接
    // 现在通过 activePalace 直接在 PalaceCard 中渲染高亮星曜（反色背景+白字）

    return { arrows: acc }
  }, [width, height, chartData, anchors, activePalace])

  if (!width || !height) return null

  // Overlay container
  const platformOS = Platform.OS as unknown as string
  if (platformOS === 'web') {
    // Web: 使用原生 <svg>，避免 react-native-svg 在部分版本下给 DOM 注入 RN Responder 事件导致控制台警告
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 500 }}>
        <style>{`
          @keyframes dash-flow {
            from { stroke-dashoffset: 0; }
            to { stroke-dashoffset: -14; }
          }
          .arrow-flow {
            animation: dash-flow 0.9s linear infinite;
          }
        `}</style>
        <svg width={width} height={height}>
          {computed.arrows.map(a => (
            <g key={a.id}>
              <path
                d={`M ${a.from.x} ${a.from.y} L ${a.to.x} ${a.to.y}`}
                stroke={a.color}
                strokeWidth={a.width ?? 2}
                fill="none"
                className={a.flow && a.dashed ? 'arrow-flow' : ''}
                {...(a.dashed ? { strokeDasharray: '8,6' } : {})}
              />
              {a.head !== false && (
                <path
                  d={arrowHead(a.from, a.to, a.headSize ?? 6)}
                  stroke={a.color}
                  strokeWidth={a.headWidth ?? (a.width ?? 2)}
                  fill="none"
                />
              )}
            </g>
          ))}
        </svg>
      </div>
    )
  }

  // Native
  return (
    <View
      {...(Platform.OS !== 'web' ? { pointerEvents: 'none' as const } : {})}
      style={{ position: 'absolute', left: 0, top: 0, width, height, zIndex: 500, ...(Platform.OS === 'web' ? { pointerEvents: 'none' as const } : {}) }}
    >
      <Svg width={width} height={height}>
        {computed.arrows.map(a => (
          <AnimatedArrow key={a.id} arrow={a} />
        ))}
      </Svg>
    </View>
  )
}

// no default export per repository conventions
