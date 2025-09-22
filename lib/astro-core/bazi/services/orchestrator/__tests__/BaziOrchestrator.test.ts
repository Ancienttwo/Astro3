import { BaziOrchestrator } from '../BaziOrchestrator'
import type { BaziInput, ValidationResult, BaziResult } from '../../types'

const baseInput: BaziInput = {
  year: 1990,
  month: 6,
  day: 12,
  hour: 8,
  gender: 'male',
  isLunar: false,
}

function createMockServices(overrides?: {
  validation?: Partial<ValidationResult>
  calculation?: Partial<BaziResult>
}) {
  const validationResult: ValidationResult = {
    isValid: true,
    errors: [],
    ...overrides?.validation,
  }

  const validationService = {
    validate: jest.fn().mockResolvedValue(validationResult),
  }

  const calculationResult: BaziResult = {
    fourPillars: {},
    calculationTime: 12,
    cacheHit: false,
    ...overrides?.calculation,
  }

  const calculationService = {
    calculate: jest.fn().mockResolvedValue(calculationResult),
  }

  const cacheService = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn(),
    has: jest.fn(),
    clear: jest.fn(),
    getStats: jest.fn().mockReturnValue({ hits: 0, misses: 0, evictions: 0, size: 0, maxSize: 100 }),
    size: jest.fn().mockReturnValue(0),
    keys: jest.fn().mockReturnValue([]),
  }

  const performanceMonitor = {
    record: jest.fn(),
    recordError: jest.fn(),
  }

  return { validationService, calculationService, cacheService, performanceMonitor }
}

describe('BaziOrchestrator metrics', () => {
  it('does not increment calculation metrics on validation failure', async () => {
    const services = createMockServices({ validation: { isValid: false, errors: ['invalid data'] } })

    const orchestrator = new BaziOrchestrator(
      services.validationService as any,
      services.calculationService as any,
      services.cacheService as any,
      services.performanceMonitor as any,
      {
        enableCache: false,
        enablePerformanceMonitoring: true,
      }
    )

    await expect(orchestrator.calculate(baseInput)).rejects.toThrow()

    const metrics = orchestrator.getMetrics()
    expect(metrics.totalCalculations).toBe(0)
    expect(metrics.errors).toBe(0)
    expect(services.performanceMonitor.recordError).toHaveBeenCalledTimes(1)
  })

  it('records metrics only after successful calculations', async () => {
    const services = createMockServices()

    const orchestrator = new BaziOrchestrator(
      services.validationService as any,
      services.calculationService as any,
      services.cacheService as any,
      services.performanceMonitor as any,
      {
        enableCache: false,
        enablePerformanceMonitoring: true,
      }
    )

    const result = await orchestrator.calculate(baseInput)
    expect(result.calculationTime).toBe(12)

    const metrics = orchestrator.getMetrics()
    expect(metrics.totalCalculations).toBe(1)
    expect(metrics.errors).toBe(0)
    expect(metrics.averageCalculationTime).toBeGreaterThanOrEqual(0)
  })
})

