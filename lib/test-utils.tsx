// 测试工具和公共Mocks
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'

// Mock Providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// 常用的测试数据
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00.000Z'
}

export const mockBaziData = {
  year: 1990,
  month: 5,
  day: 15,
  hour: 10,
  minute: 30,
  gender: 'male' as const,
  timezone: 8,
  location: '北京'
}

export const mockZiweiResult = {
  palaces: [
    {
      id: 1,
      name: '命宫',
      branch: '子' as const,
      heavenlyStem: '甲' as const,
      isLaiYinPalace: false,
      isShenGong: false,
      decade: '6-15',
      decadeIndex: 0,
      stars: [
        {
          name: '紫微' as const,
          brightness: '庙' as const,
          type: '主星' as const
        }
      ]
    }
  ],
  basePalaces: [],
  decadePalaces: [],
  lunarDate: '庚午年四月廿二',
  mingZhu: '紫微',
  shenZhu: '天机',
  gender: 'male' as const,
  selectedIndex: null,
  yearGan: '甲' as const
}

// API Mock helpers
export const mockFetch = (data: any, ok = true) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    })
  ) as jest.Mock
}

export const mockSupabaseResponse = (data: any, error: any = null) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK'
})

// 测试用户交互helpers
export const createMockEvent = (type: string, properties = {}) => ({
  type,
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: { value: '' },
  ...properties
})

// 异步测试helpers
export const waitForElement = async (callback: () => any, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const checkElement = () => {
      try {
        const element = callback()
        if (element) {
          resolve(element)
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Element not found within timeout'))
        } else {
          setTimeout(checkElement, 50)
        }
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(error)
        } else {
          setTimeout(checkElement, 50)
        }
      }
    }
    checkElement()
  })
}