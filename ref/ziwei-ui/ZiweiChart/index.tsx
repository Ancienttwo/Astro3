/**
 * 紫微斗数星盘主组件
 * 包含12宫位 + 中宫的4×4布局
 * 平台自适应
 */

import React from 'react'
import { View, Platform, Dimensions } from 'react-native'
import { PalaceCard } from './PalaceCard'
import { CenterGrid } from './CenterGrid'
import { ChartContainer } from './ChartContainer'
import type { ZiweiChartProps, Palace } from '../types'
import { AnchorsProvider, sihuaColor } from '../Arrows/AnchorContext'
import { SvgArrowOverlay } from '../Arrows/SvgArrowOverlay'
// Import SIHUA table for flying palace transformation
import { BIRTH_YEAR_SIHUA } from '@astroall/ziwei-core'

const BRANCH_CYCLE = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'] as const
const MAJOR_LABELS = ['大命','大兄','大妻','大子','大财','大疾','大迁','大友','大官','大田','大福','大父'] as const
const MAJOR_LABEL_HIGHLIGHTS = new Set(['大命','大财','大官'])
const YEAR_LABELS = ['年命','年兄','年妻','年子','年财','年疾','年迁','年友','年官','年田','年福','年父'] as const
const MINOR_LABELS = ['小限','小兄','小妻','小子','小财','小疾','小迁','小友','小官','小田','小福','小父'] as const
const MONTH_LABELS = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'] as const

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const pickLabel = <T,>(list: readonly T[], offset: number): T => {
  const len = list.length
  if (len === 0) {
    throw new Error('Label list cannot be empty')
  }
  const idx = ((offset % len) + len) % len
  return list[idx]!
}

export const ZiweiChart: React.FC<ZiweiChartProps> = ({
  chartData,
  activePalace,
  onPalaceClick,
  selectedPeriod,
  selectedYear,
  selectedMonth
}) => {
  const chartSize = Platform.select({
    web: Math.min(600, screenWidth * 0.9),
    default: Math.min(screenWidth - 20, screenHeight * 0.6, 400)
  }) ?? Math.min(screenWidth - 20, screenHeight * 0.6, 400)
  // Web 固定区域高度估算：Header(48) + 选择器(3×32=96) + BottomBar(30) + 额外边距(8)
  const webFixedOffset = 48 + 96 + 30 + 8

  const palacesByUiOrder = React.useMemo(() => {
    const toIndex = (palace: Palace): number => {
      const branchIdx = BRANCH_CYCLE.indexOf(palace.branch as typeof BRANCH_CYCLE[number])
      return branchIdx >= 0 ? branchIdx : Number.MAX_SAFE_INTEGER
    }
    return [...chartData.palaces].sort((a, b) => toIndex(a) - toIndex(b))
  }, [chartData.palaces])

  const branchToUiIndex = React.useMemo(() => {
    const map: Record<string, number> = {}
    palacesByUiOrder.forEach((palace, idx) => {
      map[palace.branch] = idx
    })
    return map
  }, [palacesByUiOrder])

  const totalPalaces = palacesByUiOrder.length || MAJOR_LABELS.length

  // Compute active sihua highlights when a palace is clicked
  const activeSihuaHighlights = React.useMemo(() => {
    if (!activePalace) return new Map<string, { code: 'A' | 'B' | 'C' | 'D'; color: string }>()

    const palace = chartData.palaces.find(p => p.branch === activePalace)
    if (!palace?.stem) return new Map()

    const si = (BIRTH_YEAR_SIHUA as any)?.[palace.stem] || { A: '', B: '', C: '', D: '' }
    const highlights = new Map<string, { code: 'A' | 'B' | 'C' | 'D'; color: string }>()

    if (si.A) highlights.set(si.A, { code: 'A', color: sihuaColor('A') })
    if (si.B) highlights.set(si.B, { code: 'B', color: sihuaColor('B') })
    if (si.C) highlights.set(si.C, { code: 'C', color: sihuaColor('C') })
    if (si.D) highlights.set(si.D, { code: 'D', color: sihuaColor('D') })

    return highlights
  }, [activePalace, chartData.palaces])

  if (Platform.OS === 'web') {
    const rotateWithGenerator = <T,>(baseIndex: number, generator: (offset: number) => T, length = totalPalaces) => {
      const map: Record<string, T> = {}
      for (let offset = 0; offset < length; offset += 1) {
        const idx = (baseIndex - offset + totalPalaces) % totalPalaces
        const palace = palacesByUiOrder[idx]
        if (!palace) continue
        map[palace.branch] = generator(offset)
      }
      return map
    }

    // 当选择了某个大运时，计算每个宫的"大运宫位名"（大命→逆时针12宫）
    const majorLabelsByBranch = (() => {
      if (!selectedPeriod) return {} as Record<string, { text: string; highlight: boolean }>
      const n = Number(String(selectedPeriod).replace('period-', ''))
      if (!Number.isFinite(n)) return {} as Record<string, { text: string; highlight: boolean }>
      const selectedPalace = chartData.palaces.find(p => (p.dayunInfo?.name || '').includes(`第${n}运`))
      if (!selectedPalace) return {} as Record<string, { text: string; highlight: boolean }>
      const baseIndex = branchToUiIndex[selectedPalace.branch]
      if (typeof baseIndex === 'undefined') return {} as Record<string, { text: string; highlight: boolean }>
      return rotateWithGenerator(baseIndex, (delta) => {
        const text = pickLabel(MAJOR_LABELS, delta)
        return { text, highlight: MAJOR_LABEL_HIGHLIGHTS.has(text) }
      })
    })()

    // 流年被选中时：以该年的地支所在宫为“年命”，逆时针排 12 宫（在底部年龄区间位置渲染，隐藏年龄区间）
    const yearLabelsByBranch = (() => {
      if (!selectedYear) return {} as Record<string, { text: string }>
      const m = /^year-(\d+)$/.exec(String(selectedYear))
      const year = m ? Number(m[1]) : NaN
      if (!Number.isFinite(year)) return {} as Record<string, { text: string }>
      const baseBranch = BRANCH_CYCLE[((year - 4) % BRANCH_CYCLE.length + BRANCH_CYCLE.length) % BRANCH_CYCLE.length] as string
      const baseIndex = branchToUiIndex[baseBranch]
      if (typeof baseIndex === 'undefined') return {} as Record<string, { text: string }>
      return rotateWithGenerator(baseIndex, (delta) => ({ text: pickLabel(YEAR_LABELS, delta) }))
    })()

    // 流年激活时：以“年财”所在宫为正月起点，按逆时针顺序标注12个月
    const monthLabelsByBranch = (() => {
      if (!selectedYear) return {} as Record<string, string>
      if (!yearLabelsByBranch || Object.keys(yearLabelsByBranch).length === 0) return {}
      const startIndex = palacesByUiOrder.findIndex(palace => yearLabelsByBranch[palace.branch]?.text === '年财')
      if (startIndex < 0) return {}
      return rotateWithGenerator(startIndex, (delta) => pickLabel(MONTH_LABELS, delta), MONTH_LABELS.length)
    })()

    // 小限十二宫：以当年年龄所在小限宫起“⼩限”，逆时针排
    const minorLabelsByBranch = (() => {
      if (!selectedYear) return {} as Record<string, { text: string }>
      const birthStr = chartData?.centerInfo?.birthDate
      const ym = /^year-(\d+)$/.exec(String(selectedYear))
      const selYear = ym ? Number(ym[1]) : NaN
      if (!birthStr || !Number.isFinite(selYear)) return {} as Record<string, { text: string }>
      const parts = String(birthStr).split('-').map(n => parseInt(n, 10))
      const y = Number.isFinite(parts[0]) ? (parts[0] as number) : 2000
      const m = Number.isFinite(parts[1]) ? (parts[1] as number) : 1
      const d = Number.isFinite(parts[2]) ? (parts[2] as number) : 1
      const birth = new Date(y, m - 1, d)
      const target = new Date(selYear, birth.getMonth(), birth.getDate())
      let age = target.getFullYear() - birth.getFullYear()
      const beforeBirthday = (target.getMonth() < birth.getMonth()) || (target.getMonth() === birth.getMonth() && target.getDate() < birth.getDate())
      if (beforeBirthday) age -= 1
      if (age < 0) return {}
      const minorPalace = chartData.palaces.find(p => Array.isArray((p as any).minorAges) && (p as any).minorAges!.includes(age))
      if (!minorPalace) return {}
      const baseIndex = branchToUiIndex[minorPalace.branch]
      if (typeof baseIndex === 'undefined') return {}
      return rotateWithGenerator(baseIndex, (delta) => ({ text: pickLabel(MINOR_LABELS, delta) }))
    })()

    // 选中大运时：基于该大运的起始年龄→起始年份，按第一个流年的地支开始，逆时针在12宫中排入10个“年 与 岁”
    const dayunYearAgeByBranch = (() => {
      if (!selectedPeriod || selectedYear) return {} as Record<string, string>
      const periodMeta = chartData.periods.find(pp => pp.id === selectedPeriod)
      if (!periodMeta) return {}
      const birthYear = Number.parseInt(String(chartData.centerInfo?.birthDate || '').slice(0, 4), 10)
      if (!Number.isFinite(birthYear)) return {}
      const matcher = /^(\d+)\s*-\s*(\d+)/.exec(periodMeta.subtext || '')
      if (!matcher) return {}
      const startAge = Number.parseInt(matcher[1]!, 10)
      if (!Number.isFinite(startAge)) return {}
      const startYear = birthYear + startAge
      const firstBranch = BRANCH_CYCLE[((startYear - 4) % BRANCH_CYCLE.length + BRANCH_CYCLE.length) % BRANCH_CYCLE.length] as string
      const baseIndex = branchToUiIndex[firstBranch]
      if (typeof baseIndex === 'undefined') return {}
      return rotateWithGenerator(baseIndex, (delta) => {
        const year = startYear + delta
        const age = startAge + delta
        return `${year} ${age}岁`
      }, Math.min(10, totalPalaces))
    })()

    return (
      <ChartContainer maxVhOffset={webFixedOffset}>
        <AnchorsProvider>
          {/* Web版使用CSS Grid */}
          <div className="ziwei-chart-grid">
          {/* 渲染12个宫位 */}
          {chartData.palaces.map((palace: Palace) => (
            <PalaceCard
              key={palace.branch}
              palace={palace}
              isActive={activePalace === palace.branch}
              onClick={() => onPalaceClick(palace.branch)}
              selectedPeriod={selectedPeriod ?? null}
              selectedYear={selectedYear ?? null}
              selectedMonth={selectedMonth ?? null}
              activeSihuaHighlights={activeSihuaHighlights}
              {...(majorLabelsByBranch[palace.branch] ? { majorLabel: majorLabelsByBranch[palace.branch] } : {})}
              {...(yearLabelsByBranch[palace.branch] ? { yearLabel: yearLabelsByBranch[palace.branch] } : {})}
              {...(minorLabelsByBranch[palace.branch] ? { minorLabel: minorLabelsByBranch[palace.branch] } : {})}
              {...(dayunYearAgeByBranch[palace.branch] ? { dayunYearAge: dayunYearAgeByBranch[palace.branch] } : {})}
              {...(monthLabelsByBranch[palace.branch] ? { monthLabel: monthLabelsByBranch[palace.branch] } : {})}
            />
          ))}
          
          {/* 中宫2×2区域 */}
          <CenterGrid centerInfo={chartData.centerInfo} />
          </div>
          <SvgArrowOverlay chartData={chartData} activePalace={activePalace} />
        </AnchorsProvider>
      </ChartContainer>
    )
  }
  
  // Native版使用绝对定位
  return (
    <ChartContainer size={chartSize}>
      <AnchorsProvider>
      <View style={{
        width: chartSize,
        height: chartSize,
        position: 'relative'
      }}>
        {/* 渲染12个宫位 */}
        {chartData.palaces.map((palace: Palace) => (
          <PalaceCard
            key={palace.branch}
            palace={palace}
            isActive={activePalace === palace.branch}
            onClick={() => onPalaceClick(palace.branch)}
            selectedPeriod={selectedPeriod ?? null}
            selectedYear={selectedYear ?? null}
            selectedMonth={selectedMonth ?? null}
            chartSize={chartSize}
            activeSihuaHighlights={activeSihuaHighlights}
          />
        ))}
        
        {/* 中宫2×2区域 */}
        <CenterGrid 
          centerInfo={chartData.centerInfo}
          chartSize={chartSize}
        />
      </View>
      <SvgArrowOverlay chartData={chartData} activePalace={activePalace} />
      </AnchorsProvider>
    </ChartContainer>
  )
}

// no default export per repository conventions
