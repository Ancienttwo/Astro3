/**
 * 紫微斗数星盘主组件 - 100% 还原 Web 版本
 */

'use client'

import React, { useMemo } from 'react'
import { PalaceCard } from './PalaceCard'
import { CenterGrid } from './CenterGrid'
import type { ZiweiChartProps, Palace } from './types'
import './ziwei.css'

const BRANCH_CYCLE = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥'
] as const
const MAJOR_LABELS = [
  '大命',
  '大兄',
  '大妻',
  '大子',
  '大财',
  '大疾',
  '大迁',
  '大友',
  '大官',
  '大田',
  '大福',
  '大父'
] as const
const MAJOR_LABEL_HIGHLIGHTS = new Set(['大命', '大财', '大官'])
const YEAR_LABELS = [
  '年命',
  '年兄',
  '年妻',
  '年子',
  '年财',
  '年疾',
  '年迁',
  '年友',
  '年官',
  '年田',
  '年福',
  '年父'
] as const

const pickLabel = <T,>(list: readonly T[], offset: number): T => {
  const len = list.length
  if (len === 0) throw new Error('Label list cannot be empty')
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
  const palacesByUiOrder = useMemo(() => {
    const toIndex = (palace: Palace): number => {
      const branchIdx = BRANCH_CYCLE.indexOf(palace.branch as (typeof BRANCH_CYCLE)[number])
      return branchIdx >= 0 ? branchIdx : Number.MAX_SAFE_INTEGER
    }
    return [...chartData.palaces].sort((a, b) => toIndex(a) - toIndex(b))
  }, [chartData.palaces])

  const branchToUiIndex = useMemo(() => {
    const map: Record<string, number> = {}
    palacesByUiOrder.forEach((palace, idx) => {
      map[palace.branch] = idx
    })
    return map
  }, [palacesByUiOrder])

  const totalPalaces = palacesByUiOrder.length || MAJOR_LABELS.length

  const rotateWithGenerator = <T,>(
    baseIndex: number,
    generator: (offset: number) => T,
    length = totalPalaces
  ) => {
    const map: Record<string, T> = {}
    for (let offset = 0; offset < length; offset += 1) {
      const idx = (baseIndex - offset + totalPalaces) % totalPalaces
      const palace = palacesByUiOrder[idx]
      if (!palace) continue
      map[palace.branch] = generator(offset)
    }
    return map
  }

  // 大运标签
  const majorLabelsByBranch = useMemo(() => {
    if (!selectedPeriod) return {} as Record<string, { text: string; highlight: boolean }>
    const n = Number(String(selectedPeriod).replace('period-', ''))
    if (!Number.isFinite(n)) return {} as Record<string, { text: string; highlight: boolean }>
    const selectedPalace = chartData.palaces.find((p) =>
      (p.dayunInfo?.name || '').includes(`第${n}运`)
    )
    if (!selectedPalace) return {} as Record<string, { text: string; highlight: boolean }>
    const baseIndex = branchToUiIndex[selectedPalace.branch]
    if (typeof baseIndex === 'undefined')
      return {} as Record<string, { text: string; highlight: boolean }>
    return rotateWithGenerator(baseIndex, (delta) => {
      const text = pickLabel(MAJOR_LABELS, delta)
      return { text, highlight: MAJOR_LABEL_HIGHLIGHTS.has(text) }
    })
  }, [selectedPeriod, chartData.palaces, branchToUiIndex, totalPalaces])

  // 流年标签
  const yearLabelsByBranch = useMemo(() => {
    if (!selectedYear) return {} as Record<string, { text: string }>
    const m = /^year-(\d+)$/.exec(String(selectedYear))
    const year = m ? Number(m[1]) : NaN
    if (!Number.isFinite(year)) return {} as Record<string, { text: string }>
    const baseBranch = BRANCH_CYCLE[
      ((year - 4) % BRANCH_CYCLE.length + BRANCH_CYCLE.length) % BRANCH_CYCLE.length
    ] as string
    const baseIndex = branchToUiIndex[baseBranch]
    if (typeof baseIndex === 'undefined') return {} as Record<string, { text: string }>
    return rotateWithGenerator(baseIndex, (delta) => ({ text: pickLabel(YEAR_LABELS, delta) }))
  }, [selectedYear, branchToUiIndex, totalPalaces])

  return (
    <div className="ziwei-chart-container">
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
            {...(majorLabelsByBranch[palace.branch]
              ? { majorLabel: majorLabelsByBranch[palace.branch] }
              : {})}
            {...(yearLabelsByBranch[palace.branch]
              ? { yearLabel: yearLabelsByBranch[palace.branch] }
              : {})}
          />
        ))}

        {/* 中宫2×2区域 */}
        <CenterGrid centerInfo={chartData.centerInfo} />
      </div>
    </div>
  )
}
