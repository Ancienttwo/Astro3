/**
 * 紫微斗数 V2 演示页面 - 100% UI 还原
 */

'use client'

import React, { useState, useEffect } from 'react'
import { ZiweiChart } from '@/components/ziwei-v2/ZiweiChart'
import type { ChartData } from '@/components/ziwei-v2/types'
import { generateWebZiweiChart } from '@/lib/ziwei/integration-v2'

export default function ZiweiNewPage() {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [activePalace, setActivePalace] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 加载默认数据
    const loadDefaultChart = async () => {
      try {
        const data = await generateWebZiweiChart({
          year: 1989,
          month: 1,
          day: 2,
          hour: 19,
          minute: 30,
          gender: 'female',
          isLunar: false,
          name: '测试用户'
        })
        setChartData(data)
      } catch (error) {
        console.error('Failed to load chart:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDefaultChart()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">加载中...</div>
          <div className="text-gray-500">正在生成紫微斗数命盘</div>
        </div>
      </div>
    )
  }

  if (!chartData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">加载失败</div>
          <div className="text-gray-500">无法生成紫微斗数命盘</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* 标题栏 */}
      <div className="max-w-7xl mx-auto mb-4">
        <h1 className="text-3xl font-bold text-purple-900 text-center mb-2">
          紫微斗数命盘 V2
        </h1>
        <p className="text-center text-gray-600">
          100% UI 还原 · 基于 ref/ziwei-ui + ref/ziwei-core
        </p>
      </div>

      {/* 紫微图表容器 */}
      <div
        className="max-w-7xl mx-auto"
        style={{
          width: '100%',
          maxWidth: '1200px',
          aspectRatio: '4 / 3'
        }}
      >
        <ZiweiChart
          chartData={chartData}
          activePalace={activePalace}
          onPalaceClick={(branch) => {
            setActivePalace(activePalace === branch ? null : branch)
          }}
        />
      </div>

      {/* 功能说明 */}
      <div className="max-w-7xl mx-auto mt-4 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">功能说明</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>点击宫位查看详情（紫色高亮）</li>
          <li>中宫显示基本信息、八字四柱、大运列表</li>
          <li>星曜按传统竖排显示，支持亮度标记</li>
          <li>四化标记：A(禄) B(权) C(科) D(忌)</li>
          <li>身宫/来因宫特殊标记</li>
        </ul>
      </div>

      {/* 调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="max-w-7xl mx-auto mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">调试信息</h3>
          <pre className="text-xs text-yellow-800 overflow-auto">
            {JSON.stringify(
              {
                activePalace,
                palaceCount: chartData.palaces.length,
                periods: chartData.periods.length,
                years: chartData.years.length
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  )
}
