import { LRUCache } from '../CacheService'

describe('LRUCache TTL handling', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('expires entries according to ttl and updates stats', async () => {
    const cache = new LRUCache<string>(5, 1000)

    await cache.set('foo', 'bar')
    expect(await cache.get('foo')).toBe('bar')

    jest.advanceTimersByTime(1001)

    expect(await cache.get('foo')).toBeNull()
    expect(cache.size()).toBe(0)

    const stats = cache.getStats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
    expect(stats.evictions).toBe(1)
  })

  it('skips persisting entries when ttl is non-positive', async () => {
    const cache = new LRUCache<string>(5, 1000)

    await cache.set('temp', 'value', 0)
    expect(await cache.get('temp')).toBeNull()
    expect(cache.size()).toBe(0)

    await cache.set('forever', 'value', Number.POSITIVE_INFINITY)
    expect(await cache.get('forever')).toBe('value')
  })
})
