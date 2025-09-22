/**
 * useZiWeiIntegratedStore
 * 以一键方式生成完整紫微数据（Hook + Web/Native 渲染数据），并保存到 Zustand
 * 用于逐步集成：先验证数据生成，再接入渲染。
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { HookCalculationInput } from '../types/hook-format-types'
import type { IntegratedChartResponse } from '../api/integrated-chart-api'
import { generateIntegratedChart } from '../api/integrated-chart-api'

export interface ZiweiIntegratedState {
  integrated: IntegratedChartResponse | null
  isGenerating: boolean
  error: string | null
}

export interface ZiweiIntegratedActions {
  generate: (input: HookCalculationInput) => Promise<IntegratedChartResponse | null>
  clear: () => void
}

export type ZiweiIntegratedStore = ZiweiIntegratedState & ZiweiIntegratedActions

export const useZiweiIntegratedStore = create<ZiweiIntegratedStore>()(
  devtools((set) => ({
    integrated: null,
    isGenerating: false,
    error: null,

    async generate(input) {
      set({ isGenerating: true, error: null })
      try {
        const res = await generateIntegratedChart(input, { platform: 'web' })
        set({ integrated: res, isGenerating: false })
        return res
      } catch (e) {
        const message = e instanceof Error ? e.message : '生成失败'
        set({ error: message, isGenerating: false })
        return null
      }
    },

    clear() {
      set({ integrated: null, error: null })
    },
  }), { name: 'ZiweiIntegratedStore' })
)

