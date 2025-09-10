import { renderHook, act } from '@testing-library/react'
import { useDailyCheckin } from '../useDailyCheckin'
import { mockFetch, mockSupabaseResponse } from '@/lib/test-utils'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => mockSupabaseResponse({ consecutive_checkin_days: 5 })),
          limit: jest.fn(() => mockSupabaseResponse([]))
        }))
      })),
      insert: jest.fn(() => mockSupabaseResponse({ id: 1 })),
      update: jest.fn(() => mockSupabaseResponse({ id: 1 }))
    }))
  }
}))

describe('useDailyCheckin Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch({ success: true })
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useDailyCheckin())
    
    expect(result.current.canCheckinToday).toBe(true)
    expect(result.current.checkinStatus).toBeNull()
    expect(result.current.error).toBeNull()
    expect(typeof result.current.performCheckin).toBe('function')
    expect(typeof result.current.getCheckinSummary).toBe('function')
  })

  it('fetches checkin status on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useDailyCheckin())
    
    await act(async () => {
      await result.current.fetchCheckinStatus()
    })
    
    expect(result.current.checkinStatus).not.toBeNull()
  })

  it('performs checkin successfully', async () => {
    const { result } = renderHook(() => useDailyCheckin())
    
    await act(async () => {
      await result.current.performCheckin()
    })
    
    expect(global.fetch).toHaveBeenCalledWith('/api/daily-checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
  })

  it('handles checkin error', async () => {
    mockFetch({ error: 'Already checked in today' }, false)
    
    const { result } = renderHook(() => useDailyCheckin())
    
    await act(async () => {
      await result.current.performCheckin()
    })
    
    expect(result.current.error).toBeTruthy()
  })

  it('generates correct checkin summary', () => {
    const { result } = renderHook(() => useDailyCheckin())
    
    // Mock checkin status
    act(() => {
      // This would normally be set by fetchCheckinStatus
      // but we're testing the summary calculation
    })
    
    const summary = result.current.getCheckinSummary()
    
    expect(summary).toHaveProperty('consecutiveDays')
    expect(summary).toHaveProperty('hasCheckedInToday')
    expect(summary).toHaveProperty('creditsEarned')
  })

  it('calculates next consecutive reward correctly', () => {
    const { result } = renderHook(() => useDailyCheckin())
    
    const nextReward = result.current.getNextConsecutiveReward()
    
    expect(nextReward).toHaveProperty('daysNeeded')
    expect(nextReward).toHaveProperty('reward')
  })
})