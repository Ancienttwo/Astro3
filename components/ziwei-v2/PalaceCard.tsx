/**
 * 紫微斗数宫位卡片组件 - 100% 还原 Web 版本
 * 基于 ref/ziwei-ui/ZiweiChart/PalaceCard.tsx
 * 使用 Tailwind CSS + 自定义 CSS 实现所有样式
 */

'use client'

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import type { PalaceCardProps, Star } from './types'

// ==================== 星曜颜色常量（精确还原）====================

const MAIN_DEEP_PURPLE = '#3D0B5B' // 系统深紫（14主星）
const PINK = '#F06292' // 桃花星（更浅的粉红）
const GREEN = '#10B981' // 禄存/天马/天钺/天魁（青绿）
const RED = '#EF4444' // 文昌/文曲/左辅/右弼（红）
const GRAY = '#6B7280' // 煞星（灰）

const GREEN_STARS = new Set(['禄存', '天马', '天钺', '天魁'])
const RED_STARS = new Set(['文昌', '文曲', '左辅', '右弼'])
const PINK_STARS = new Set(['桃花', '桃花星', '咸池', '红鸾', '天喜', '天姚'])
const SHA_STARS = new Set(['地空', '地劫', '擎羊', '陀罗', '火星', '铃星', '天刑'])

const getStarColor = (star: Star): string => {
  // 名称优先的强制映射（满足业务配色需求）
  if (SHA_STARS.has(star.name)) return GRAY
  if (PINK_STARS.has(star.name)) return PINK
  if (GREEN_STARS.has(star.name)) return GREEN
  if (RED_STARS.has(star.name)) return RED
  if (star.type === 'main') return MAIN_DEEP_PURPLE
  if (star.type === 'malefic') return GRAY

  const fallback: Record<string, string> = {
    auxiliary: '#3B82F6',
    auspicious: GREEN,
    default: GRAY
  }
  return fallback[star.type] || fallback['default']
}

// 四化颜色
const getSihuaColor = (sihua: string): string => {
  const colors: Record<string, string> = {
    A: '#10B981', // 禄 - 绿
    B: '#8B5CF6', // 权 - 紫
    C: '#3B82F6', // 科 - 蓝
    D: '#EF4444' // 忌 - 红
  }
  return colors[sihua] || '#6B7280'
}

// ==================== 星曜项组件（带锚点注册）====================

interface StarItemWebProps {
  star: Star
  idx: number
  palace: any
  activeSihuaHighlights?: Map<string, { code: 'A' | 'B' | 'C' | 'D'; color: string }>
}

const StarItemWeb: React.FC<StarItemWebProps> = ({
  star,
  idx,
  palace,
  activeSihuaHighlights
}) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const brightRef = useRef<HTMLDivElement | null>(null)

  const chars = Array.from(star.name)

  // 检查是否被四化飞宫高亮
  const sihuaHighlight = activeSihuaHighlights?.get(star.name)
  const isHighlighted = Boolean(sihuaHighlight)

  return (
    <div
      ref={ref}
      className="star"
      data-star-name={star.name}
      style={{ color: getStarColor(star) }}
    >
      <div
        className="star-vertical-name"
        style={{
          backgroundColor: isHighlighted ? sihuaHighlight?.color : 'transparent',
          color: isHighlighted ? '#FFFFFF' : 'inherit',
          padding: isHighlighted ? '1px 2px' : '0',
          borderRadius: isHighlighted ? '2px' : '0',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: isHighlighted ? '-1px -2px' : '0'
        }}
      >
        {chars.map((ch, i) => (
          <span key={i} className="star-char">
            {ch}
          </span>
        ))}
      </div>

      {star.brightness && (
        <div ref={brightRef} className="star-brightness-line">
          {star.brightness}
        </div>
      )}

      {(star.sihuaOrigin || star.sihuaInward || star.sihuaOutward || star.sihua) && (
        <div className="star-sihua-line">
          {/* 生年四化 */}
          {star.sihuaOrigin && (
            <span
              className={`star-sihua sihua-${star.sihuaOrigin}`}
              style={{ backgroundColor: getSihuaColor(star.sihuaOrigin) }}
            >
              {star.sihuaOrigin}
            </span>
          )}

          {/* 向心四化 */}
          {star.sihuaInward && (
            <span
              className={`star-sihua star-sihua-muted sihua-i sihua-${star.sihuaInward}`}
              style={{
                borderColor: getSihuaColor(star.sihuaInward),
                color: getSihuaColor(star.sihuaInward)
              }}
            >
              i{star.sihuaInward}
            </span>
          )}

          {/* 离心四化 */}
          {star.sihuaOutward && (
            <span
              className={`star-sihua star-sihua-muted sihua-x sihua-${star.sihuaOutward}`}
              style={{
                borderColor: getSihuaColor(star.sihuaOutward),
                color: getSihuaColor(star.sihuaOutward)
              }}
            >
              x{star.sihuaOutward}
            </span>
          )}

          {/* 兼容：旧版四化字段 */}
          {!star.sihuaOrigin && !star.sihuaInward && !star.sihuaOutward && star.sihua && (
            <span
              className={`star-sihua sihua-${star.sihua}`}
              style={{ backgroundColor: getSihuaColor(star.sihua) }}
            >
              {star.sihua}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ==================== 宫位卡片主组件 ====================

export const PalaceCard: React.FC<PalaceCardProps> = ({
  palace,
  isActive,
  onClick,
  selectedPeriod,
  selectedYear,
  selectedMonth,
  majorLabel,
  yearLabel,
  minorLabel,
  dayunYearAge,
  monthLabel,
  activeSihuaHighlights
}) => {
  // 蛇形排列：测量容器宽度，计算列数
  const starsContainerRef = useRef<HTMLDivElement | null>(null)
  const [cols, setCols] = useState<number>(0)

  const measureCols = useCallback(() => {
    const el = starsContainerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const first = el.querySelector('.star') as HTMLElement | null
    const starW = first ? first.getBoundingClientRect().width : 14
    const cw = rect.width || 0
    const c = Math.max(1, Math.floor(cw / Math.max(1, starW)))
    if (c !== cols) setCols(c)
  }, [cols])

  useEffect(() => {
    const el = starsContainerRef.current
    if (!el) return
    measureCols()

    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      const ro = new ResizeObserver(() => measureCols())
      ro.observe(el)
      return () => ro.disconnect()
    }
  }, [measureCols])

  // 蛇形排列算法（行奇数正序，偶数逆序）
  const snakeStarsWeb = useMemo(() => {
    const list = (palace.stars || []).map((s, i) => ({ star: s, origIdx: i }))
    if (!cols || cols <= 1) return list
    const res: Array<{ star: Star; origIdx: number }> = []
    for (let i = 0; i < list.length; i += cols) {
      const row = list.slice(i, i + cols)
      const rowIndex = Math.floor(i / cols)
      if (rowIndex % 2 === 1) row.reverse()
      res.push(...row)
    }
    return res
  }, [palace.stars, cols])

  // 注册天干锚点
  const stemTextRef = useRef<HTMLSpanElement | null>(null)

  const hasBothMarkers = Boolean(palace.isBodyPalace && palace.isLaiyinPalace)

  return (
    <div
      className={`palace-card palace-${palace.branch} ${isActive ? 'palace-active' : ''} ${hasBothMarkers ? 'has-both-markers' : ''}`}
      onClick={onClick}
      data-branch={palace.branch}
    >
      {/* 星曜容器（每颗星按竖排字符显示，整体横向排列，可换行）*/}
      <div className="palace-stars" ref={starsContainerRef}>
        {snakeStarsWeb.map(({ star, origIdx }) => (
          <StarItemWeb
            key={`${star.name}-${origIdx}`}
            star={star}
            idx={origIdx}
            palace={palace}
            activeSihuaHighlights={activeSihuaHighlights}
          />
        ))}
      </div>

      {/* 宫位底部信息 */}
      <div className="palace-bottom">
        <div className="palace-stem-branch">
          <span className="palace-stem" ref={stemTextRef}>
            {palace.stem}
          </span>
          <span className="palace-branch">{palace.branch}</span>
        </div>
        <div className="palace-name">
          <span>{palace.name}</span>
        </div>
      </div>

      {/* 大运激活时：在左下天干的上方，排布该宫对应的"年 与 岁"（最多10年映射之一）*/}
      {dayunYearAge && (
        <div className="palace-year-age">
          <span className="year-age-text">{dayunYearAge}</span>
        </div>
      )}

      {/* 流年激活时：以"年财"宫为起点，从左下角标注正月→腊月（顺序）*/}
      {selectedYear && monthLabel && (
        <div className="palace-month">
          <span className="palace-month-text">{monthLabel}</span>
        </div>
      )}

      {/* 选择某步大运后：在宫名上方排布 12 个"大运宫位名"，以选中宫为"大命"起点逆时针 */}
      {!!majorLabel && (
        <div className={`palace-major-label ${majorLabel.highlight ? 'highlight' : ''}`}>
          <span className="major-label-text">{majorLabel.text}</span>
        </div>
      )}

      {/* 固定大运区间：每个宫底部置中展示（无需点击选择器）*/}
      {yearLabel ? (
        <div
          className={`palace-dayun-fixed year-label ${['年命', '年财', '年官'].includes(yearLabel.text) ? 'highlight' : ''}`}
        >
          <span className="palace-dayun-fixed-text">{yearLabel.text}</span>
        </div>
      ) : (
        palace.dayunInfo && (
          <div className="palace-dayun-fixed">
            <span className="palace-dayun-fixed-text">
              {(palace.dayunInfo.ageRange || '').replace(/岁$/, '').replace(/\s+/g, '')}
            </span>
          </div>
        )
      )}

      {/* 小限标签：置于流年标签上方 */}
      {minorLabel && (
        <div className={`palace-minor-label ${minorLabel.text === '小限' ? 'highlight' : ''}`}>
          <span className="minor-label-text">{minorLabel.text}</span>
        </div>
      )}

      {selectedYear && palace.liunianInfo && (
        <div className="palace-liunian">
          <span>{palace.liunianInfo.name}</span>
        </div>
      )}

      {selectedMonth && palace.liuyueInfo && (
        <div className="palace-liuyue">
          <span>{palace.liuyueInfo}</span>
        </div>
      )}

      {/* 特殊标记 */}
      {palace.isBodyPalace && <div className="palace-marker body-palace">身</div>}
      {palace.isLaiyinPalace && <div className="palace-marker laiyin-palace">来</div>}
    </div>
  )
}
