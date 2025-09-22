/**
 * TenGodStrengthCalculator 单元测试
 * 测试十神强度计算器的核心算法
 */

import { TenGodStrengthCalculator } from '../TenGodStrengthCalculator';
import { BaziInput, TenGodStrength } from '../types';

const baseSolarDate: BaziInput['solarDate'] = {
  year: 1990,
  month: 5,
  day: 15,
  hour: 12,
  minute: 0
};

const createBaziInput = (
  pillars: BaziInput['pillars'],
  options: { gender?: 'male' | 'female'; solarDate?: BaziInput['solarDate']; lunarDate?: BaziInput['lunarDate'] } = {}
): BaziInput => ({
  pillars,
  gender: options.gender ?? 'male',
  solarDate: options.solarDate ?? { ...baseSolarDate },
  ...(options.lunarDate ? { lunarDate: options.lunarDate } : {})
});

describe('TenGodStrengthCalculator', () => {
  let calculator: TenGodStrengthCalculator;
  
  beforeEach(() => {
    calculator = new TenGodStrengthCalculator();
  });

  // 测试用八字数据 - 经典案例
  const testBaziInput = createBaziInput({
    year: { stem: '庚', branch: '午' },   // 庚午 - 偏财
    month: { stem: '壬', branch: '午' },  // 壬午 - 伤官  
    day: { stem: '甲', branch: '子' },    // 甲子 - 日主
    hour: { stem: '丙', branch: '寅' }    // 丙寅 - 食神
  });

  describe('十神关系计算', () => {
    it('应该正确识别十神关系', async () => {
      const { strengths } = await calculator.calculateStrength(testBaziInput);
      
      expect(strengths).toBeDefined();
      expect(typeof strengths).toBe('object');
      
      // 验证返回的十神强度对象包含所有十神
      const expectedTenGods: Array<keyof TenGodStrength> = [
        '比肩', '劫财', '食神', '伤官', '偏财',
        '正财', '七杀', '正官', '偏印', '正印'
      ];

      expectedTenGods.forEach(tenGod => {
        expect(strengths).toHaveProperty(tenGod);
        const value = strengths[tenGod];
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });

    it('应该正确计算甲日主的十神关系', async () => {
      // 甲日主的十神关系测试
      const jiaInput = createBaziInput({
        year: { stem: '甲', branch: '子' },   // 甲 - 比肩
        month: { stem: '乙', branch: '丑' },  // 乙 - 劫财
        day: { stem: '甲', branch: '寅' },    // 甲 - 日主
        hour: { stem: '丙', branch: '卯' }    // 丙 - 食神
      });

      const { strengths } = await calculator.calculateStrength(jiaInput);

      const entries = (Object.entries(strengths) as Array<[keyof TenGodStrength, number]>).sort((a, b) => b[1] - a[1]);
      const [topGod, topValue] = entries[0];

      expect(topGod).toBe('比肩');
      expect(topValue).toBeGreaterThan(0.45);
      expect(strengths['正财']).toBeGreaterThan(0.2);
    });

    it('应该正确计算不同日主的十神关系', async () => {
      const testCases: Array<{ dayMaster: BaziInput['pillars']['day']['stem']; stem: BaziInput['pillars']['day']['stem']; expectedDominant: keyof TenGodStrength }> = [
        { dayMaster: '乙', stem: '甲', expectedDominant: '劫财' },
        { dayMaster: '丙', stem: '甲', expectedDominant: '正印' },
        { dayMaster: '丁', stem: '甲', expectedDominant: '偏印' },
        { dayMaster: '戊', stem: '甲', expectedDominant: '比肩' },
        { dayMaster: '己', stem: '甲', expectedDominant: '劫财' }
      ];

      for (const { dayMaster, stem, expectedDominant } of testCases) {
        const input = createBaziInput({
          year: { stem, branch: '子' },
          month: { stem: '甲', branch: '丑' },
          day: { stem: dayMaster, branch: '寅' },
          hour: { stem: '甲', branch: '卯' }
        });

        const { strengths } = await calculator.calculateStrength(input);
        const dominant = (Object.entries(strengths) as Array<[keyof TenGodStrength, number]>).reduce((prev, current) => (current[1] > prev[1] ? current : prev));
        expect(dominant[0]).toBe(expectedDominant);
      }
    });
  });

  describe('地支藏干分析', () => {
    it('应该正确处理地支藏干', async () => {
      // 使用包含复杂地支的八字测试
      const complexInput = createBaziInput({
        year: { stem: '甲', branch: '寅' },   // 寅中藏甲丙戊
        month: { stem: '乙', branch: '卯' }, // 卯中藏乙
        day: { stem: '甲', branch: '辰' },   // 辰中藏戊乙癸  
        hour: { stem: '丙', branch: '巳' }   // 巳中藏丙戊庚
      });

      const { strengths } = await calculator.calculateStrength(complexInput);

      expect(strengths).toBeDefined();
      const dominant = (Object.entries(strengths) as Array<[keyof TenGodStrength, number]>).reduce((prev, current) => (current[1] > prev[1] ? current : prev));
      expect(dominant[0]).toBe('比肩');
      expect(dominant[1]).toBeGreaterThan(0.9);
    });

    it('应该正确处理月令的权重', async () => {
      // 月令对十神强度有更大影响
      const monthlyInput1 = createBaziInput({
        year: { stem: '甲', branch: '子' },
        month: { stem: '甲', branch: '寅' }, // 月令比肩
        day: { stem: '甲', branch: '辰' },
        hour: { stem: '乙', branch: '巳' }
      });

      const monthlyInput2 = createBaziInput({
        year: { stem: '甲', branch: '寅' }, // 年柱比肩
        month: { stem: '丙', branch: '子' },
        day: { stem: '甲', branch: '辰' },
        hour: { stem: '乙', branch: '巳' }
      });

      const { strengths: strengths1 } = await calculator.calculateStrength(monthlyInput1);
      const { strengths: strengths2 } = await calculator.calculateStrength(monthlyInput2);

      // 月令比肩应该比年柱比肩强度更高
      expect(strengths1['比肩']).toBeGreaterThan(strengths2['比肩']);
    });
  });

  describe('性别差异处理', () => {
    it('应该正确处理男女性别差异', async () => {
      const maleInput = createBaziInput(testBaziInput.pillars, { gender: 'male', solarDate: testBaziInput.solarDate });
      const femaleInput = createBaziInput(testBaziInput.pillars, { gender: 'female', solarDate: testBaziInput.solarDate });

      const { strengths: maleStrengths } = await calculator.calculateStrength(maleInput);
      const { strengths: femaleStrengths } = await calculator.calculateStrength(femaleInput);

      expect(maleStrengths).toBeDefined();
      expect(femaleStrengths).toBeDefined();
      expect(maleStrengths).toEqual(femaleStrengths);
    });

    it('应该处理财官印食的性别特异性', async () => {
      // 测试对异性和同性十神的不同处理
      const input = createBaziInput({
        year: { stem: '己', branch: '未' },   // 己 - 正官（异性）
        month: { stem: '戊', branch: '午' },  // 戊 - 七杀（同性）
        day: { stem: '甲', branch: '子' },    // 甲 - 日主
        hour: { stem: '辛', branch: '酉' }    // 辛 - 正财（异性）
      });

      const { strengths } = await calculator.calculateStrength(input);

      expect(strengths['正财']).toBeGreaterThan(0.7);
      expect(strengths['正官']).toBeGreaterThan(strengths['七杀']);
    });
  });

  describe('特殊格局处理', () => {
    it('应该处理从格八字', async () => {
      // 模拟从财格八字（甲日主身弱，财星强旺）
      const congCaiInput = createBaziInput({
        year: { stem: '戊', branch: '戌' },   // 戊戌 - 七杀
        month: { stem: '己', branch: '未' },  // 己未 - 正官
        day: { stem: '甲', branch: '申' },    // 甲申 - 日主
        hour: { stem: '庚', branch: '申' }    // 庚申 - 偏财
      });

      const { strengths } = await calculator.calculateStrength(congCaiInput);

      expect(strengths).toBeDefined();
      expect(strengths['正财']).toBeGreaterThan(0.75);
      expect(strengths['正官']).toBeGreaterThan(strengths['比肩']);
    });

    it('应该处理化气格', async () => {
      // 甲己化土格
      const huaQiInput = createBaziInput({
        year: { stem: '己', branch: '未' },
        month: { stem: '己', branch: '未' },
        day: { stem: '甲', branch: '戌' },
        hour: { stem: '己', branch: '未' }
      });

      const { strengths } = await calculator.calculateStrength(huaQiInput);

      expect(strengths).toBeDefined();
      expect(strengths['正财']).toBeGreaterThan(0.9);
      expect(strengths['正官']).toBeLessThan(0.05);
    });
  });

  describe('边界条件测试', () => {
    it('应该处理全部相同天干的极端情况', async () => {
      const extremeInput = createBaziInput({
        year: { stem: '甲', branch: '子' },
        month: { stem: '甲', branch: '丑' },
        day: { stem: '甲', branch: '寅' },
        hour: { stem: '甲', branch: '卯' }
      });

      const { strengths } = await calculator.calculateStrength(extremeInput);

      expect(strengths).toBeDefined();
      expect(strengths['比肩']).toBeGreaterThan(0.5);
      expect(strengths['正财']).toBeLessThan(0.3);
    });

    it('应该处理完全没有某个十神的情况', async () => {
      const noWealthInput = createBaziInput({
        year: { stem: '甲', branch: '寅' },  // 甲 - 比肩
        month: { stem: '乙', branch: '卯' }, // 乙 - 劫财
        day: { stem: '甲', branch: '辰' },   // 甲 - 比肩
        hour: { stem: '壬', branch: '子' }   // 壬 - 伤官
      });

      const { strengths } = await calculator.calculateStrength(noWealthInput);

      expect(strengths).toBeDefined();
      expect(strengths['正财']).toBeLessThan(0.05);
      expect(strengths['偏财']).toBe(0);
    });
  });

  describe('算法一致性测试', () => {
    it('相同八字多次计算应该得到相同结果', async () => {
      const result1 = await calculator.calculateStrength(testBaziInput);
      const result2 = await calculator.calculateStrength(testBaziInput);
      const result3 = await calculator.calculateStrength(testBaziInput);

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it('强度值总和应该为1', async () => {
      const { strengths } = await calculator.calculateStrength(testBaziInput);
      const totalStrength = (Object.values(strengths) as number[]).reduce((sum, value) => sum + value, 0);
      expect(totalStrength).toBeCloseTo(1, 6);
    });

    it('应该有主导十神', async () => {
      const { strengths } = await calculator.calculateStrength(testBaziInput);
      
      const strengthValues = Object.values(strengths) as number[];
      const maxStrength = Math.max(...strengthValues);
      const minStrength = Math.min(...strengthValues);
      expect(maxStrength - minStrength).toBeGreaterThan(0.1);
    });
  });

  describe('错误处理', () => {
    it('应该处理无效输入', async () => {
      const invalidInput = {
        pillars: {
          year: { stem: '' as any, branch: '' as any },
          month: { stem: '' as any, branch: '' as any },
          day: { stem: '' as any, branch: '' as any },
          hour: { stem: '' as any, branch: '' as any }
        },
        gender: 'invalid',
        solarDate: { year: -1, month: 0, day: 0, hour: -1, minute: -1 }
      } as unknown as BaziInput;

      await expect(calculator.calculateStrength(invalidInput)).rejects.toThrow();
    });

    it('应该处理不完整的八字', async () => {
      const incompleteInput = {
        pillars: {
          year: { stem: '甲', branch: '子' }
        } as any,
        gender: 'male',
        solarDate: { year: 1990, month: 1, day: 1, hour: 0, minute: 0 }
      } as unknown as BaziInput;

      await expect(calculator.calculateStrength(incompleteInput)).rejects.toThrow();
    });

    it('应该处理无效的天干地支', async () => {
      const invalidStemInput = {
        ...testBaziInput,
        pillars: {
          ...testBaziInput.pillars,
          year: { stem: '无效天干' as any, branch: '子' }
        }
      } as unknown as BaziInput;

      await expect(calculator.calculateStrength(invalidStemInput)).rejects.toThrow();
    });
  });

  describe('性能测试', () => {
    it('单次计算应该在合理时间内完成', async () => {
      const startTime = Date.now();
      await calculator.calculateStrength(testBaziInput);
      const endTime = Date.now();

      const duration = endTime - startTime;

      // 单次计算应该在100毫秒内完成
      expect(duration).toBeLessThan(100);
    });

    it('批量计算应该高效执行', async () => {
      const branches: BaziInput['pillars']['year']['branch'][] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      const inputs = Array.from({ length: 100 }, (_, i) => createBaziInput({
        ...testBaziInput.pillars,
        year: { stem: '甲', branch: branches[i % branches.length] }
      }, { solarDate: testBaziInput.solarDate }));

      const startTime = Date.now();
      for (const input of inputs) {
        await calculator.calculateStrength(input);
      }
      const endTime = Date.now();

      const duration = endTime - startTime;
      const averageTime = duration / inputs.length;

      // 平均每次计算应该在10毫秒内
      expect(averageTime).toBeLessThan(10);
    });
  });
});
