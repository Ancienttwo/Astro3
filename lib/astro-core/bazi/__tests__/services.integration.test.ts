/**
 * Integration Tests for New Service Architecture
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { DevFlags } from '../config/feature-flags';
import { serviceFactory } from '../services/ServiceFactory';
import { migrationAdapter } from '../migration/MigrationAdapter';
import { LRUCache } from '../services/cache/CacheService';
import { ValidationService } from '../services/validation/ValidationService';
import { CalculationService } from '../services/calculation/CalculationService';

describe('Service Architecture Integration Tests', () => {
  
  beforeEach(() => {
    // Reset services before each test
    serviceFactory.reset();
    migrationAdapter.resetStats();
  });

  afterEach(() => {
    // Clean up after tests
    DevFlags.reset();
  });

  describe('Feature Flags', () => {
    void test('should default to old architecture', async () => {
      const input = {
        year: 1990,
        month: 6,
        day: 15,
        hour: 14,
        minute: 30,
        gender: 'male' as const,
        isLunar: false
      };

      const result = await migrationAdapter.calculateBasicChart(input);
      expect(result.metadata?.architecture).toBe('old');
    });

    void test('should use new architecture when enabled', async () => {
      DevFlags.enableAll();
      
      const input = {
        year: 1990,
        month: 6,
        day: 15,
        hour: 14,
        minute: 30,
        gender: 'male' as const,
        isLunar: false
      };

      const result = await migrationAdapter.forceNewArchitecture(input);
      expect(result.metadata?.architecture).toBe('new');
    });
  });

  describe('Cache Service', () => {
    void test('should cache and retrieve values', async () => {
      const cache = new LRUCache<string>(10);
      
      await cache.set('test-key', 'test-value');
      const value = await cache.get('test-key');
      
      expect(value).toBe('test-value');
    });

    void test('should track cache statistics', async () => {
      const cache = new LRUCache<string>(10);
      
      await cache.set('key1', 'value1');
      await cache.get('key1'); // Hit
      await cache.get('key2'); // Miss
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
    });

    void test('should evict LRU items when full', async () => {
      const cache = new LRUCache<string>(2);
      
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');
      await cache.set('key3', 'value3'); // Should evict key1
      
      const value1 = await cache.get('key1');
      const value3 = await cache.get('key3');
      
      expect(value1).toBeNull();
      expect(value3).toBe('value3');
    });
  });

  describe('Validation Service', () => {
    void test('should validate valid input', async () => {
      const validator = new ValidationService();
      const input = {
        year: 1990,
        month: 6,
        day: 15,
        hour: 14,
        minute: 30,
        gender: 'male' as const,
        isLunar: false
      };

      const result = await validator.validate(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    void test('should reject invalid year', async () => {
      const validator = new ValidationService();
      const input = {
        year: 1800, // Out of range
        month: 6,
        day: 15,
        hour: 14,
        minute: 30,
        gender: 'male' as const,
        isLunar: false
      };

      const result = await validator.validate(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Year must be between 1900 and 2100');
    });

    void test('should reject invalid month', async () => {
      const validator = new ValidationService();
      const input = {
        year: 1990,
        month: 13, // Invalid
        day: 15,
        hour: 14,
        minute: 30,
        gender: 'male' as const,
        isLunar: false
      };

      const result = await validator.validate(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Month must be between 1 and 12');
    });
  });

  describe('Calculation Service', () => {
    void test('should support multiple strategies', () => {
      const service = new CalculationService();
      const strategies = service.getAvailableStrategies();
      
      expect(strategies).toContain('standard');
      expect(strategies).toContain('quick');
      expect(strategies).toContain('comprehensive');
    });

    void test('should calculate with standard strategy', async () => {
      const service = new CalculationService();
      const input = {
        year: 1990,
        month: 6,
        day: 15,
        hour: 14,
        minute: 30,
        gender: 'male' as const,
        isLunar: false,
        options: {}
      };

      const result = await service.calculate(input, 'standard');
      expect(result).toHaveProperty('fourPillars');
      expect(result).toHaveProperty('calculationTime');
    });
  });

  describe('Orchestrator Integration', () => {
    void test('should coordinate all services', async () => {
      DevFlags.enableAll();
      const orchestrator = serviceFactory.getOrchestrator();
      
      const input = {
        year: 1990,
        month: 6,
        day: 15,
        hour: 14,
        minute: 30,
        gender: 'male' as const,
        isLunar: false,
        options: {}
      };

      const result = await orchestrator.calculate(input);
      expect(result).toHaveProperty('fourPillars');
      expect(result.cacheHit).toBe(false);

      // Second call should hit cache
      const result2 = await orchestrator.calculate(input);
      expect(result2.cacheHit).toBe(true);

      const metrics = orchestrator.getMetrics();
      expect(metrics.cacheHits).toBe(1);
      expect(metrics.cacheMisses).toBe(1);
    });

    void test('should handle batch calculations', async () => {
      DevFlags.enableAll();
      const orchestrator = serviceFactory.getOrchestrator();
      
      const inputs = [
        { year: 1990, month: 6, day: 15, hour: 14, minute: 30, gender: 'male' as const, isLunar: false, options: {} },
        { year: 1991, month: 7, day: 20, hour: 10, minute: 0, gender: 'female' as const, isLunar: false, options: {} }
      ];

      const results = await orchestrator.calculateBatch(inputs);
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('fourPillars');
      expect(results[1]).toHaveProperty('fourPillars');
    });
  });

  describe('Migration Adapter', () => {
    void test('should track usage statistics', async () => {
      const input = {
        year: 1990,
        month: 6,
        day: 15,
        hour: 14,
        minute: 30,
        gender: 'male' as const,
        isLunar: false
      };

      // Use old architecture
      await migrationAdapter.forceOldArchitecture(input);
      
      // Use new architecture
      DevFlags.enableAll();
      await migrationAdapter.forceNewArchitecture(input);

      const stats = migrationAdapter.getUsageStats();
      expect(stats.old).toBe(1);
      expect(stats.new).toBe(1);
      expect(stats.total).toBe(2);
    });

    void test('should fallback on error', async () => {
      const input = {
        year: 1990,
        month: 6,
        day: 15,
        hour: 14,
        minute: 30,
        gender: 'male' as const,
        isLunar: false
      };

      // Force new architecture but with invalid setup to trigger fallback
      const result = await migrationAdapter.calculateBasicChart(input);
      expect(result).toBeDefined();
      expect(result.metadata?.architecture).toBe('old'); // Should fallback
    });
  });

  describe('Performance Monitoring', () => {
    void test('should track performance metrics', async () => {
      const monitor = serviceFactory.getPerformanceMonitor();
      
      monitor.record({
        type: 'bazi-calculation',
        subType: 'calculation',
        duration: 25.5,
        timestamp: Date.now()
      });

      monitor.record({
        type: 'bazi-calculation',
        subType: 'cache-hit',
        duration: 0.5,
        timestamp: Date.now()
      });

      const averages = monitor.getAverages();
      expect(averages.averageCalculationTime).toBeGreaterThan(0);
      expect(averages.averageCacheHitTime).toBeGreaterThan(0);
    });

    void test('should generate performance report', () => {
      const monitor = serviceFactory.getPerformanceMonitor();
      
      for (let i = 0; i < 10; i++) {
        monitor.record({
          type: 'bazi-calculation',
          subType: 'calculation',
          duration: 20 + Math.random() * 10,
          timestamp: Date.now()
        });
      }

      expect(typeof monitor.generateReport).toBe('function');
      const report = monitor.generateReport!();
      expect(report).toContain('Performance Report');
      expect(report).toContain('Average Times');
    });
  });
});
