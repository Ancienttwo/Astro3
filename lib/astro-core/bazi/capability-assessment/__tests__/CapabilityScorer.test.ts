/**
 * CapabilityScorer 单元测试
 * 测试六能力评分器的核心算法
 */

import { CapabilityScorer } from '../CapabilityScorer';
import { TenGodStrength, CapabilityScores } from '../types';

describe('CapabilityScorer', () => {
  let scorer: CapabilityScorer;
  
  beforeEach(() => {
    scorer = new CapabilityScorer();
  });

  const TEN_GOD_KEYS: Array<keyof TenGodStrength> = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'];

  const createStrengthObject = (value = 0): TenGodStrength => ({
    '比肩': value,
    '劫财': value,
    '食神': value,
    '伤官': value,
    '偏财': value,
    '正财': value,
    '七杀': value,
    '正官': value,
    '偏印': value,
    '正印': value,
  });

  const normalizeStrength = (strengths: TenGodStrength): TenGodStrength => {
    const sanitized = createStrengthObject();
    let total = 0;

    TEN_GOD_KEYS.forEach((key) => {
      const numeric = Number(strengths[key]) || 0;
      const clamped = numeric > 0 ? numeric : 0;
      sanitized[key] = clamped;
      total += clamped;
    });

    if (total === 0) {
      return createStrengthObject(1 / TEN_GOD_KEYS.length);
    }

    const normalized = createStrengthObject();
    TEN_GOD_KEYS.forEach((key) => {
      normalized[key] = sanitized[key] / total;
    });

    return normalized;
  };

  // 测试用十神强度数据
  const rawTestTenGodStrength: TenGodStrength = {
    '比肩': 25,
    '劫财': 15,
    '食神': 35,  // 较强
    '伤官': 20,
    '偏财': 30,  // 较强
    '正财': 25,
    '七杀': 40,  // 最强
    '正官': 15,
    '偏印': 10,
    '正印': 20
  };
  const testTenGodStrength = normalizeStrength(rawTestTenGodStrength);

  describe('六能力评分计算', () => {
    it('应该正确计算六项能力评分', async () => {
      const result = await scorer.calculateScores(testTenGodStrength);
      const scores = result.scores;

      expect(scores).toBeDefined();

      const expectedCapabilities: Array<keyof CapabilityScores> = [
        '执行力基础分',
        '创新力基础分',
        '管理力基础分',
        '销售力基础分',
        '协调力基础分',
        '稳定性基础分'
      ];

      expectedCapabilities.forEach(capability => {
        expect(scores).toHaveProperty(capability);
        const value = scores[capability];
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });
    });

    it('执行力应该主要基于官杀和印星', async () => {
      // 高官杀的八字应该执行力强
      const highOfficialStrength: TenGodStrength = {
        '比肩': 10, '劫财': 10, '食神': 10, '伤官': 10,
        '偏财': 10, '正财': 10, '七杀': 80, '正官': 60,  // 官杀很强
        '偏印': 50, '正印': 40  // 印星也强
      };
      
      const result = await scorer.calculateScores(normalizeStrength(highOfficialStrength));
      
      // 执行力应该很高
      expect(result.scores['执行力基础分']).toBeGreaterThan(70);
    });

    it('创新力应该主要基于食伤', async () => {
      // 高食伤的八字应该创新力强
      const highFoodInjuryStrength: TenGodStrength = {
        '比肩': 10, '劫财': 10, '食神': 80, '伤官': 70,  // 食伤很强
        '偏财': 10, '正财': 10, '七杀': 10, '正官': 10,
        '偏印': 10, '正印': 10
      };
      
      const result = await scorer.calculateScores(normalizeStrength(highFoodInjuryStrength));
      
      // 创新力应该很高
      expect(result.scores['创新力基础分']).toBeGreaterThan(70);
    });

    it('管理力应该主要基于官星和比劫', async () => {
      // 高官星和适中比劫的八字应该管理力强
      const highManagementStrength: TenGodStrength = {
        '比肩': 40, '劫财': 30,  // 比劫适中
        '食神': 10, '伤官': 10,
        '偏财': 20, '正财': 20,
        '七杀': 70, '正官': 60,  // 官杀强
        '偏印': 20, '正印': 30
      };
      
      const result = await scorer.calculateScores(normalizeStrength(highManagementStrength));
      
      // 管理力应该很高
      expect(result.scores['管理力基础分']).toBeGreaterThan(70);
    });

    it('销售力应该主要基于财星和食伤', async () => {
      // 高财星和食伤的八字应该销售力强
      const highSalesStrength: TenGodStrength = {
        '比肩': 20, '劫财': 15,
        '食神': 60, '伤官': 50,  // 食伤强
        '偏财': 80, '正财': 70,  // 财星很强
        '七杀': 10, '正官': 10,
        '偏印': 10, '正印': 15
      };
      
      const result = await scorer.calculateScores(normalizeStrength(highSalesStrength));
      
      // 销售力应该很高
      expect(result.scores['销售力基础分']).toBeGreaterThan(75);
    });

    it('协调力应该主要基于印星和适度的比劫', async () => {
      // 高印星和适中比劫的八字应该协调力强
      const highCoordinationStrength: TenGodStrength = {
        '比肩': 30, '劫财': 25,  // 比劫适中
        '食神': 20, '伤官': 15,
        '偏财': 20, '正财': 25,
        '七杀': 20, '正官': 30,
        '偏印': 70, '正印': 80   // 印星很强
      };
      
      const result = await scorer.calculateScores(normalizeStrength(highCoordinationStrength));
      
      // 协调力应该很高
      expect(result.scores['协调力基础分']).toBeGreaterThan(70);
    });

    it('稳定性应该主要基于印星和财星', async () => {
      // 高印星和财星的八字应该稳定性强
      const highStabilityStrength: TenGodStrength = {
        '比肩': 25, '劫财': 20,
        '食神': 15, '伤官': 10,
        '偏财': 70, '正财': 80,  // 财星强
        '七杀': 15, '正官': 25,
        '偏印': 60, '正印': 75   // 印星强
      };
      
      const result = await scorer.calculateScores(normalizeStrength(highStabilityStrength));
      
      // 稳定性应该很高
      expect(result.scores['稳定性基础分']).toBeGreaterThan(75);
    });
  });

  describe('特殊情况处理', () => {
    it('应该处理极端的十神分布', async () => {
      // 只有一个十神很强的极端情况
      const extremeStrength: TenGodStrength = {
        '比肩': 100, '劫财': 0, '食神': 0, '伤官': 0,
        '偏财': 0, '正财': 0, '七杀': 0, '正官': 0,
        '偏印': 0, '正印': 0
      };
      
      const result = await scorer.calculateScores(normalizeStrength(extremeStrength));
      const scores = result.scores;
      
      Object.values(scores).forEach(score => {
        expect(typeof score).toBe('number');
        expect(score).not.toBeNaN();
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it('应该处理所有十神为0的情况', async () => {
      const zeroStrength: TenGodStrength = {
        '比肩': 0, '劫财': 0, '食神': 0, '伤官': 0,
        '偏财': 0, '正财': 0, '七杀': 0, '正官': 0,
        '偏印': 0, '正印': 0
      };
      
      const result = await scorer.calculateScores(normalizeStrength(zeroStrength));
      const scores = result.scores;
      
      Object.values(scores).forEach(score => {
        expect(typeof score).toBe('number');
        expect(score).not.toBeNaN();
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it('应该处理平均分布的十神', async () => {
      const averageStrength: TenGodStrength = {
        '比肩': 30, '劫财': 30, '食神': 30, '伤官': 30,
        '偏财': 30, '正财': 30, '七杀': 30, '正官': 30,
        '偏印': 30, '正印': 30
      };
      
      const result = await scorer.calculateScores(normalizeStrength(averageStrength));
      
      const scores = Object.values(result.scores);
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);
      
      // 最高分和最低分的差异不应该太大
      expect(maxScore - minScore).toBeLessThan(40);
    });
  });

  describe('算法一致性测试', () => {
    it('相同输入应该产生相同输出', async () => {
      const result1 = await scorer.calculateScores(testTenGodStrength);
      const result2 = await scorer.calculateScores(testTenGodStrength);
      const result3 = await scorer.calculateScores(testTenGodStrength);

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it('能力评分应该反映十神强度变化', async () => {
      const baseStrength = normalizeStrength(rawTestTenGodStrength);
      const enhancedStrength = normalizeStrength({
        ...rawTestTenGodStrength,
        '食神': rawTestTenGodStrength['食神'] + 30  // 提升食神强度
      });

      const baseResult = await scorer.calculateScores(baseStrength);
      const enhancedResult = await scorer.calculateScores(enhancedStrength);

      expect(enhancedResult.scores['创新力基础分']).toBeGreaterThan(baseResult.scores['创新力基础分']);
    });

    it('不同十神组合应该产生不同的能力分布', async () => {
      const officialStrength = normalizeStrength({
        ...rawTestTenGodStrength,
        '正官': 80,
        '七杀': 70
      });

      const wealthStrength = normalizeStrength({
        ...rawTestTenGodStrength,
        '正财': 80,
        '偏财': 70
      });

      const officialResult = await scorer.calculateScores(officialStrength);
      const wealthResult = await scorer.calculateScores(wealthStrength);

      expect(officialResult.scores['执行力基础分']).not.toEqual(wealthResult.scores['执行力基础分']);
      expect(officialResult.scores['管理力基础分']).not.toEqual(wealthResult.scores['管理力基础分']);
    });
  });

  describe('权重系统测试', () => {
    it('应该正确应用不同十神的权重', async () => {
      // 测试官杀对执行力的权重
      const strongOfficial: TenGodStrength = {
        '比肩': 20, '劫财': 20, '食神': 20, '伤官': 20,
        '偏财': 20, '正财': 20, '七杀': 80, '正官': 20,
        '偏印': 20, '正印': 20
      };

      const strongKill: TenGodStrength = {
        '比肩': 20, '劫财': 20, '食神': 20, '伤官': 20,
        '偏财': 20, '正财': 20, '七杀': 20, '正官': 80,
        '偏印': 20, '正印': 20
      };

      const officialResult = await scorer.calculateScores(normalizeStrength(strongOfficial));
      const killResult = await scorer.calculateScores(normalizeStrength(strongKill));

      expect(officialResult.scores['执行力基础分']).toBeGreaterThan(50);
      expect(killResult.scores['执行力基础分']).toBeGreaterThan(50);
    });

    it('复合能力应该综合考虑多个十神', async () => {
      // 测试销售力需要财星+食伤的组合
      const goodSeller: TenGodStrength = {
        '比肩': 15, '劫财': 15,
        '食神': 60, '伤官': 50,  // 表达能力强
        '偏财': 70, '正财': 60,  // 财运好
        '七杀': 15, '正官': 15,
        '偏印': 15, '正印': 15
      };

      const onlyWealth: TenGodStrength = {
        '比肩': 15, '劫财': 15,
        '食神': 15, '伤官': 15,  // 表达能力弱
        '偏财': 80, '正财': 70,  // 只有财星强
        '七杀': 15, '正官': 15,
        '偏印': 15, '正印': 15
      };

      const goodSellerResult = await scorer.calculateScores(normalizeStrength(goodSeller));
      const onlyWealthResult = await scorer.calculateScores(normalizeStrength(onlyWealth));

      expect(goodSellerResult.scores['销售力基础分']).toBeGreaterThanOrEqual(onlyWealthResult.scores['销售力基础分']);
      expect(goodSellerResult.scores['创新力基础分']).toBeGreaterThan(onlyWealthResult.scores['创新力基础分']);
    });
  });

  describe('边界值测试', () => {
    it('应该正确处理最大值输入', async () => {
      const maxStrength: TenGodStrength = {
        '比肩': 100, '劫财': 100, '食神': 100, '伤官': 100,
        '偏财': 100, '正财': 100, '七杀': 100, '正官': 100,
        '偏印': 100, '正印': 100
      };

      const result = await scorer.calculateScores(normalizeStrength(maxStrength));

      Object.values(result.scores).forEach(score => {
        expect(score).toBeGreaterThan(80);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it('应该处理负数输入', async () => {
      const negativeStrength: TenGodStrength = {
        '比肩': -10, '劫财': -5, '食神': 30, '伤官': 25,
        '偏财': -15, '正财': 20, '七杀': 40, '正官': 15,
        '偏印': -20, '正印': 10
      };

      const result = await scorer.calculateScores(normalizeStrength(negativeStrength));

      Object.values(result.scores).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('性能测试', () => {
    it('单次计算应该快速完成', async () => {
      const startTime = Date.now();
      await scorer.calculateScores(testTenGodStrength);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50); // 50毫秒内完成
    });

    it('批量计算应该高效', async () => {
      const inputs = Array.from({ length: 1000 }, () => normalizeStrength({
        ...rawTestTenGodStrength,
        '比肩': Math.random() * 100,
        '食神': Math.random() * 100,
        '偏财': Math.random() * 100
      }));

      const startTime = Date.now();
      for (const input of inputs) {
        await scorer.calculateScores(input);
      }
      const endTime = Date.now();

      const totalDuration = endTime - startTime;
      const averageTime = totalDuration / inputs.length;

      expect(averageTime).toBeLessThan(1); // 平均1毫秒内完成
    });
  });

  describe('错误处理', () => {
    it('应该处理空输入', async () => {
      await expect(scorer.calculateScores(null as any)).rejects.toThrow();
      await expect(scorer.calculateScores(undefined as any)).rejects.toThrow();
    });

    it('应该处理不完整的十神数据', async () => {
      const incompleteStrength = {
        '比肩': 25,
        '食神': 35
        // 缺少其他十神
      } as any;

      await expect(scorer.calculateScores(incompleteStrength)).rejects.toThrow();
    });

    it('应该处理非数字的十神强度', async () => {
      const invalidStrength = {
        ...testTenGodStrength,
        '比肩': 'invalid' as any
      };

      await expect(scorer.calculateScores(invalidStrength)).rejects.toThrow();
    });
  });
});
