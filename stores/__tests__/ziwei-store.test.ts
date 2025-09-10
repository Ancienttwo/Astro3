import { act, renderHook } from '@testing-library/react'
import { useZiweiStore, useZiweiActions } from '../ziwei-store'
import { mockZiweiResult } from '@/lib/test-utils'

describe('Ziwei Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useZiweiActions())
    act(() => {
      result.current.resetForm()
    })
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useZiweiStore())
    
    expect(result.current.formData.year).toBe('')
    expect(result.current.formData.month).toBe('')
    expect(result.current.formData.day).toBe('')
    expect(result.current.formData.hour).toBe('')
    expect(result.current.formData.minute).toBe('0')
    expect(result.current.formData.gender).toBe('male')
    expect(result.current.result).toBeNull()
    expect(result.current.isCalculating).toBe(false)
  })

  it('updates form data correctly', () => {
    const { result: storeResult } = renderHook(() => useZiweiStore())
    const { result: actionsResult } = renderHook(() => useZiweiActions())
    
    act(() => {
      actionsResult.current.updateFormData({ year: '1990' })
    })
    
    expect(storeResult.current.formData.year).toBe('1990')
  })

  it('validates form correctly', () => {
    const { result: storeResult } = renderHook(() => useZiweiStore())
    const { result: actionsResult } = renderHook(() => useZiweiActions())
    
    // Form should be invalid initially
    expect(storeResult.current.isFormValid).toBe(false)
    
    // Fill in required fields
    act(() => {
      actionsResult.current.updateFormData({
        year: '1990',
        month: '5',
        day: '15',
        hour: '10'
      })
    })
    
    expect(storeResult.current.isFormValid).toBe(true)
  })

  it('sets calculation result', () => {
    const { result: storeResult } = renderHook(() => useZiweiStore())
    const { result: actionsResult } = renderHook(() => useZiweiActions())
    
    act(() => {
      actionsResult.current.setResult(mockZiweiResult)
    })
    
    expect(storeResult.current.result).toEqual(mockZiweiResult)
    expect(storeResult.current.hasResult).toBe(true)
  })

  it('handles calculation loading state', () => {
    const { result: storeResult } = renderHook(() => useZiweiStore())
    const { result: actionsResult } = renderHook(() => useZiweiActions())
    
    act(() => {
      actionsResult.current.setIsCalculating(true)
    })
    
    expect(storeResult.current.isCalculating).toBe(true)
    
    act(() => {
      actionsResult.current.setIsCalculating(false)
    })
    
    expect(storeResult.current.isCalculating).toBe(false)
  })

  it('resets form data', () => {
    const { result: storeResult } = renderHook(() => useZiweiStore())
    const { result: actionsResult } = renderHook(() => useZiweiActions())
    
    // Set some data first
    act(() => {
      actionsResult.current.updateFormData({ year: '1990' })
      actionsResult.current.setResult(mockZiweiResult)
    })
    
    expect(storeResult.current.formData.year).toBe('1990')
    expect(storeResult.current.result).not.toBeNull()
    
    // Reset
    act(() => {
      actionsResult.current.resetForm()
    })
    
    expect(storeResult.current.formData.year).toBe('')
    expect(storeResult.current.result).toBeNull()
  })

  it('handles menu state', () => {
    const { result: storeResult } = renderHook(() => useZiweiStore())
    const { result: actionsResult } = renderHook(() => useZiweiActions())
    
    expect(storeResult.current.showMenu).toBe(false)
    
    act(() => {
      actionsResult.current.setShowMenu(true)
    })
    
    expect(storeResult.current.showMenu).toBe(true)
  })
})