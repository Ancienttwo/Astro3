/**
 * 旺衰分析器测试文件
 * 验证模块化重构后的功能正确性
 */

import { StrengthAnalyzer, analyzeWuxingStrength, analyzeWuxingStrengthSimple } from '../index';

const createAnalyzer = () => new StrengthAnalyzer();

describe('StrengthAnalyzer', () => {
  let analyzer: StrengthAnalyzer;

  beforeEach(() => {
    analyzer = createAnalyzer();
  });

  describe('基础功能测试', () => {
    void test('应能正确解析标准八字', async () => {
      // 测试八字：甲子、乙丑、丙寅、丁卯（春季木旺）
      const bazi = ['甲', '子', '乙', '丑', '丙', '寅', '丁', '卯'];
      
      const result = await analyzer.analyze(bazi);
      
      expect(result.dayMaster.element).toBe('fire');
      expect(result.scores).toBeDefined();
      expect(result.percentages).toBeDefined();
      expect(result.strongest).toBeDefined();
      expect(result.weakest).toBeDefined();
      expect(result.balance).toBeDefined();
      expect(result.metadata.algorithVersion).toBe('2.0.0-modular');
    });

    void test('应能处理不同季节的影响', async () => {
      // 春季八字（木旺）
      const springBazi = ['甲', '寅', '乙', '卯', '丙', '辰', '丁', '巳'];
      const springResult = await analyzer.analyze(springBazi);
      
      // 夏季八字（火旺）
      const summerBazi = ['甲', '巳', '乙', '午', '丙', '未', '丁', '申'];
      const summerResult = await analyzer.analyze(summerBazi);
      
      // 春季木应该比夏季强
      expect(springResult.scores.wood).toBeGreaterThan(summerResult.scores.wood);
      // 夏季火应该比春季强
      expect(summerResult.scores.fire).toBeGreaterThan(springResult.scores.fire);
    });

    void test('应能正确计算百分比总和', async () => {
      const bazi = ['甲', '子', '乙', '丑', '丙', '寅', '丁', '卯'];
      const result = await analyzer.analyze(bazi);
      
      const total = Object.values(result.percentages).reduce((sum, val) => sum + val, 0);
      expect(Math.round(total)).toBe(100);
    });
  });

  describe('日主强弱判断测试', () => {
    void test('应能识别强日主', async () => {
      // 构造一个火多的八字（日主为火）
      const strongFireBazi = ['丙', '午', '丁', '巳', '丙', '戌', '丁', '未'];
      const result = await analyzer.analyze(strongFireBazi);
      
      expect(result.dayMaster.element).toBe('fire');
      expect(['strong', 'balanced']).toContain(result.dayMaster.strength);
      expect(result.dayMaster.percentage).toBeGreaterThanOrEqual(20);
    });

    void test('应能识别弱日主', async () => {
      // 构造一个日主很弱的八字
      const weakBazi = ['甲', '申', '乙', '酉', '丙', '子', '丁', '亥'];
      const result = await analyzer.analyze(weakBazi);
      
      expect(['weak', 'balanced']).toContain(result.dayMaster.strength);
    });
  });

  describe('合会冲突测试', () => {
    void test('应能识别三合局', async () => {
      // 亥卯未木局
      const sanheWoodBazi = ['甲', '亥', '乙', '卯', '丙', '未', '丁', '巳'];
      const result = await analyzer.analyze(sanheWoodBazi, { includeDetails: true });
      
      expect(result.details?.combinationInfluence.sanhe.length).toBeGreaterThan(0);
    });

    void test('应能识别相冲', async () => {
      // 子午冲
      const chongBazi = ['甲', '子', '乙', '丑', '丙', '午', '丁', '卯'];
      const result = await analyzer.analyze(chongBazi, { includeDetails: true });
      
      expect(result.details?.conflictInfluence.chong.length).toBeGreaterThan(0);
    });
  });

  describe('透干分析测试', () => {
    void test('应能识别透干', async () => {
      // 甲木透干在寅月
      const transparentBazi = ['甲', '寅', '乙', '卯', '丙', '辰', '丁', '巳'];
      const result = await analyzer.analyze(transparentBazi, { includeDetails: true });
      
      expect(result.details?.transparencyInfluence.transparentStems.length).toBeGreaterThan(0);
      expect(result.details?.transparencyInfluence.totalBonus.wood).toBeGreaterThan(0);
    });
  });

  describe('选项参数测试', () => {
    void test('应能使用高精度模式', async () => {
      const bazi = ['甲', '子', '乙', '丑', '丙', '寅', '丁', '卯'];
      const result = await analyzer.analyze(bazi, { precisionLevel: 'high' });
      
      // 高精度模式应该有更多小数位
      const scoreString = result.scores.wood.toString();
      expect(scoreString.includes('.')).toBe(true);
    });

    void test('应能包含详细分析', async () => {
      const bazi = ['甲', '子', '乙', '丑', '丙', '寅', '丁', '卯'];
      const result = await analyzer.analyze(bazi, { includeDetails: true });
      
      expect(result.details).toBeDefined();
      expect(result.details?.breakdown).toBeDefined();
      expect(result.details?.seasonalInfluence).toBeDefined();
      expect(result.details?.combinationInfluence).toBeDefined();
    });

    void test('应能使用自定义权重', async () => {
      const bazi = ['甲', '子', '乙', '丑', '丙', '寅', '丁', '卯'];
      const customWeights = { basic: 2.0, seasonal: 0.5 };
      const result = await analyzer.analyze(bazi, { customWeights });
      
      expect(result.metadata.options.customWeights).toEqual(expect.objectContaining(customWeights));
    });
  });
});

describe('便捷函数测试', () => {
  void test('analyzeWuxingStrength 应能返回完整结果', async () => {
    const bazi = ['甲', '子', '乙', '丑', '丙', '寅', '丁', '卯'];
    const result = await analyzeWuxingStrength(bazi);
    
    expect(result).toBeDefined();
    expect(result.dayMaster).toBeDefined();
    expect(result.scores).toBeDefined();
    expect(result.aiSummary).toBeDefined();
  });

  void test('analyzeWuxingStrengthSimple 应能返回简化结果', async () => {
    const bazi = ['甲', '子', '乙', '丑', '丙', '寅', '丁', '卯'];
    const result = await analyzeWuxingStrengthSimple(bazi);
    
    expect(result.dayMasterElement).toBeDefined();
    expect(result.dayMasterStrength).toBeDefined();
    expect(result.scores).toBeDefined();
    expect(result.percentages).toBeDefined();
    expect(result.strongestElement).toBeDefined();
    expect(result.weakestElement).toBeDefined();
    expect(result.summary).toBeDefined();
    
    // 验证简化结果的数据类型
    expect(typeof result.dayMasterElement).toBe('string');
    expect(['strong', 'weak', 'balanced']).toContain(result.dayMasterStrength);
    expect(typeof result.summary).toBe('string');
  });
});

describe('边界条件测试', () => {
  void test('应能处理无效八字输入', async () => {
    const analyzer = createAnalyzer();
    const invalidBazi = ['甲', '子', '乙']; // 不足8个字符
    
    await expect(analyzer.analyze(invalidBazi)).rejects.toThrow('八字必须包含8个字符');
  });

  void test('应能处理空字符串', async () => {
    const analyzer = createAnalyzer();
    const emptyBazi = ['', '', '', '', '', '', '', ''];
    
    await expect(analyzer.analyze(emptyBazi)).rejects.toThrow();
  });

  void test('应能处理无效天干地支', async () => {
    const analyzer = createAnalyzer();
    const invalidBazi = ['X', 'Y', 'Z', 'A', 'B', 'C', 'D', 'E'];
    const result = await analyzer.analyze(invalidBazi);
    
    // 应该能够处理但返回默认值
    expect(result).toBeDefined();
    expect(result.dayMaster.element).toBe('wood'); // 默认值
  });
});

describe('性能测试', () => {
  void test('单次分析应在合理时间内完成', async () => {
    const analyzer = createAnalyzer();
    const bazi = ['甲', '子', '乙', '丑', '丙', '寅', '丁', '卯'];
    
    const startTime = Date.now();
    const result = await analyzer.analyze(bazi);
    const endTime = Date.now();
    
    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(1000); // 应在1秒内完成
    expect(result.metadata.calculationTime).toBeLessThan(1000);
  });

  void test('批量分析应能正确处理', async () => {
    const analyzer = createAnalyzer();
    const baziList = [
      ['甲', '子', '乙', '丑', '丙', '寅', '丁', '卯'],
      ['戊', '申', '己', '酉', '庚', '戌', '辛', '亥'],
      ['壬', '子', '癸', '丑', '甲', '寅', '乙', '卯']
    ];
    
    const promises = baziList.map(bazi => analyzer.analyze(bazi));
    const results = await Promise.all(promises);
    
    expect(results).toHaveLength(3);
    results.forEach(result => {
      expect(result).toBeDefined();
      expect(result.dayMaster).toBeDefined();
      expect(result.scores).toBeDefined();
    });
  });
});

describe('数据完整性测试', () => {
  void test('AI摘要应包含所有必需字段', async () => {
    const analyzer = createAnalyzer();
    const bazi = ['甲', '子', '乙', '丑', '丙', '寅', '丁', '卯'];
    const result = await analyzer.analyze(bazi);
    
    expect(result.aiSummary.conciseDescription).toBeDefined();
    expect(result.aiSummary.strengthPattern).toBeDefined();
    expect(result.aiSummary.criticalFactors).toBeInstanceOf(Array);
    expect(result.aiSummary.lifeGuidance).toBeInstanceOf(Array);
    
    expect(result.aiSummary.criticalFactors.length).toBeGreaterThan(0);
    expect(result.aiSummary.lifeGuidance.length).toBeGreaterThan(0);
  });

  void test('详细分析应包含所有模块结果', async () => {
    const analyzer = createAnalyzer();
    const bazi = ['甲', '子', '乙', '丑', '丙', '寅', '丁', '卯'];
    const result = await analyzer.analyze(bazi, { includeDetails: true });
    
    expect(result.details).toBeDefined();
    expect(result.details?.breakdown).toBeDefined();
    expect(result.details?.seasonalInfluence).toBeDefined();
    expect(result.details?.relationshipInfluence).toBeDefined();
    expect(result.details?.combinationInfluence).toBeDefined();
    expect(result.details?.conflictInfluence).toBeDefined();
    expect(result.details?.transparencyInfluence).toBeDefined();
    
    // 验证每个模块的基本结构
    expect(result.details?.breakdown.wood).toBeDefined();
    expect(result.details?.seasonalInfluence.currentSeason).toBeDefined();
    expect(result.details?.combinationInfluence.totalBonus).toBeDefined();
  });

  void test('元数据应包含正确信息', async () => {
    const analyzer = createAnalyzer();
    const bazi = ['甲', '子', '乙', '丑', '丙', '寅', '丁', '卯'];
    const options = { precisionLevel: 'high' as const, includeDetails: true };
    const result = await analyzer.analyze(bazi, options);
    
    expect(result.metadata.calculationTime).toBeGreaterThan(0);
    expect(result.metadata.algorithVersion).toBe('2.0.0-modular');
    expect(result.metadata.options.precisionLevel).toBe('high');
    expect(result.metadata.options.includeDetails).toBe(true);
  });
});
