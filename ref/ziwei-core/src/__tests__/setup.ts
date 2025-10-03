// Jest setup file for ziwei-core tests
import 'jest'

// Global test configuration
beforeEach(() => {
  // Reset any global state before each test
})

afterEach(() => {
  // Cleanup after each test
})

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidZiWeiChart(): R
      toBeValidGanZhi(): R
    }
  }
}

// Custom Jest matchers for ZiWei-specific validations
expect.extend({
  toBeValidZiWeiChart(received: any) {
    const pass = 
      received &&
      typeof received === 'object' &&
      received.birthInfo &&
      received.bazi &&
      received.palaces &&
      Object.keys(received.palaces).length === 12

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ZiWei chart`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be a valid ZiWei chart`,
        pass: false,
      }
    }
  },

  toBeValidGanZhi(received: any) {
    const ganZhiPattern = /^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/
    const pass = typeof received === 'string' && ganZhiPattern.test(received)

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid GanZhi`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be a valid GanZhi (format: 天干地支)`,
        pass: false,
      }
    }
  },
})