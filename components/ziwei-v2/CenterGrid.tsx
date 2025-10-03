/**
 * 中宫2×2网格组件 - Web 版本100%还原
 */

'use client'

import React, { useState } from 'react'
import type { CenterGridProps } from './types'

// 五行配色
const wuxingColor = (el: string) => {
  switch (el) {
    case '木':
      return '#16A34A'
    case '火':
      return '#DC2626'
    case '土':
      return '#A16207'
    case '金':
      return '#9CA3AF'
    case '水':
      return '#2563EB'
    default:
      return '#374151'
  }
}

export const CenterGrid: React.FC<CenterGridProps> = ({ centerInfo }) => {
  const [collapsed, setCollapsed] = useState(false)

  const displayLife = centerInfo.masters?.life || '—'
  const displayBody = centerInfo.masters?.body || '—'
  const displayZiDou = centerInfo.masters?.ziDou || '—'

  return (
    <div className="center-grid-merged">
      <button
        type="button"
        className="center-toggle-btn"
        onClick={() => setCollapsed((v) => !v)}
      >
        {collapsed ? '显示中宫' : '隐藏中宫'}
      </button>

      {/* 基本信息 */}
      <div className="center-info-block">
        <div className="info-line">
          <span className="info-label">昵称：</span>
          <span className="info-value">{centerInfo.name || '游客'}</span>
          <span className="info-value">{centerInfo.gender}</span>
          <span className="info-value">{centerInfo.fiveElementsBureau || '—'}</span>
        </div>
        {!collapsed && (
          <>
            <div className="info-line">
              <span className="info-label">公历：</span>
              <span className="info-value">
                {centerInfo.birthDate} {centerInfo.birthTime}
              </span>
            </div>
            <div className="info-line">
              <span className="info-label">农历：</span>
              <span className="info-value">
                {centerInfo.lunarDate} {centerInfo.lunarTime}
              </span>
            </div>
            <div className="info-line info-line--masters">
              <span className="info-label">命主：</span>
              <span className="info-value">{displayLife}</span>
              <span className="info-label">身主：</span>
              <span className="info-value">{displayBody}</span>
              <span className="info-label">子斗：</span>
              <span className="info-value">{displayZiDou}</span>
            </div>
          </>
        )}
      </div>

      {/* 八字四柱 */}
      {!collapsed && (
        <div className="center-bazi-section">
          <div className="bazi-lines">
            <div className="bazi-line bazi-line--label">
              <span>年</span>
              <span>月</span>
              <span>日</span>
              <span>时</span>
            </div>
            <div className="bazi-line bazi-line--ten-god">
              <span>{centerInfo.tenGods?.year?.stem || '—'}</span>
              <span>{centerInfo.tenGods?.month?.stem || '—'}</span>
              <span>主</span>
              <span>{centerInfo.tenGods?.hour?.stem || '—'}</span>
            </div>
            <div className="bazi-line bazi-line--stem">
              <span>{centerInfo.yearGan}</span>
              <span>{centerInfo.monthGan}</span>
              <span>{centerInfo.dayGan}</span>
              <span>{centerInfo.hourGan}</span>
            </div>
            <div className="bazi-line bazi-line--branch">
              <span>{centerInfo.yearZhi}</span>
              <span>{centerInfo.monthZhi}</span>
              <span>{centerInfo.dayZhi}</span>
              <span>{centerInfo.hourZhi}</span>
            </div>
            <div className="bazi-line bazi-line--ten-god-branch">
              <span>{centerInfo.tenGods?.year?.branch || '—'}</span>
              <span>{centerInfo.tenGods?.month?.branch || '—'}</span>
              <span>{centerInfo.tenGods?.day?.branch || '—'}</span>
              <span>{centerInfo.tenGods?.hour?.branch || '—'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 起运信息 */}
      {!collapsed && centerInfo.startLuck && (
        <div className="center-start-luck">
          <span className="info-label">起运：</span>
          <span className="info-value">{centerInfo.startLuck}</span>
        </div>
      )}

      {/* 八个大运 */}
      {!collapsed &&
        Array.isArray(centerInfo.majorPeriods8) &&
        centerInfo.majorPeriods8.length > 0 && (
          <div className="center-dayun-8">
            {centerInfo.majorPeriods8.map((p, idx) => (
              <div key={idx} className="dayun-col">
                <div className="dayun-tg-stem">{p.tgStem || '—'}</div>
                <div className="dayun-gan">{p.stem || '—'}</div>
                <div className="dayun-zhi">{p.branch || '—'}</div>
                <div className="dayun-tg-branch">{p.tgBranch || '—'}</div>
                <div className="dayun-start-age">
                  {Number.isFinite(p.startAge) ? String(p.startAge) : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
