/**
 * CapabilityAssessmentFormatter 单元测试
 * 测试能力评估格式化器的数据转换功能
 */

import { CapabilityAssessmentFormatter } from '../formatters';
import { AlgorithmOutput } from '../../capability-assessment/types';
import { AICapabilityAssessment } from '../types';

describe('CapabilityAssessmentFormatter', () => {
  // 测试用能力评估输出数据
  const testAlgorithmOutput: AlgorithmOutput = {
    ten_god_strength: {
      '比肩': 25,
      '劫财': 15,
      '食神': 65,  // 较强
      '伤官': 35,
      '偏财': 45,
      '正财': 30,
      '七杀': 70,  // 最强
      '正官': 20,
      '偏印': 15,
      '正印': 40
    },
    capabilities: {
      '执行力基础分': 75,     // 执行力强
      '创新力基础分': 80,     // 创新力很强  
      '管理力基础分': 65,     // 管理力中等
      '销售力基础分': 70,     // 销售力强
      '协调力基础分': 55,     // 协调力中等
      '稳定性基础分': 50      // 稳定性一般
    },
    clusters: {
      食伤: 68,
      官杀: 82,
      比劫: 45,
      财: 60,
      印: 52
    },
    tags: {
      hurt_absorb_rate: 0.15,
      kill_mode: 'normal' as const,
      cong_pattern: false,
      phantom_ratio: 0.05,
      dominance: 0.3,
      seasonal_method: 'precise_matrix' as const,
      warnings: []
    },
    intermediates: {
      root_scores: { '木': 65, '火': 45, '土': 30, '金': 40, '水': 20 },
      seasonal_factors: { '木': 1.2, '火': 0.8, '土': 1.0, '金': 1.1, '水': 0.9 },
      month_branch: '辰',
      polarization: { disparity: 32, balance: 0.68 },
      phantom_stems: ['己']
    },
    analysis_details: {
      pattern: {
        pattern_type: '食神生财格',
        dominant_ten_god: '食神' as const,
        strength_ratio: 1.8,
        confidence: 0.85,
        description: '食神强旺，财星有力，创新能力突出'
      },
      recommendations: [
        '适合从事创意产业或自主创业',
        '发挥创意优势，寻找合作伙伴',
        '注意风险控制',
        '提升团队协作和稳定性',
        '学习团队管理，培养耐心',
        '建立规律作息'
      ],
      capability_breakdown: [
        {
          capability: '执行力基础分',
          base_contributions: [
            { ten_god: '正官', raw_strength: 0.2, effective_strength: 0.45, weight: 0.35, contribution: 15.75 }
          ],
          base_score: 45,
          dominance_bonus: 18,
          pattern_bonus: 12,
          final_score: 75
        }
      ]
    }
  };

  describe('基础格式化功能', () => {
    it('应该成功格式化完整的能力评估数据', () => {
      const result = CapabilityAssessmentFormatter.format(testAlgorithmOutput);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      // 验证顶级结构
      expect(result).toHaveProperty('tenGodStrength');
      expect(result).toHaveProperty('capabilityScores');
      expect(result).toHaveProperty('pattern');
      expect(result).toHaveProperty('overallAssessment');
      expect(result).toHaveProperty('recommendations');
    });

    it('应该正确格式化十神强度数据', () => {
      const result = CapabilityAssessmentFormatter.format(testAlgorithmOutput);
      
      const { tenGodStrength } = result;
      expect(tenGodStrength).toBeDefined();
      expect(tenGodStrength).toHaveProperty('dominant');
      expect(tenGodStrength).toHaveProperty('all');

      // 验证主导十神
      expect(Array.isArray(tenGodStrength.dominant)).toBe(true);
      expect(tenGodStrength.dominant.length).toBeGreaterThan(0);
      
      tenGodStrength.dominant.forEach((item, index) => {
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('strength');
        expect(item).toHaveProperty('rank');
        expect(item).toHaveProperty('influence');
        expect(item.rank).toBe(index + 1);
      });

      // 验证所有十神数据
      expect(typeof tenGodStrength.all).toBe('object');
      Object.entries(tenGodStrength.all).forEach(([name, data]) => {
        expect(data).toHaveProperty('value');
        expect(data).toHaveProperty('level');
        expect(data).toHaveProperty('description');
        expect(typeof data.value).toBe('number');
        expect(['极强', '较强', '中等', '较弱', '极弱']).toContain(data.level);
      });
    });

    it('应该正确格式化六能力评分', () => {
      const result = CapabilityAssessmentFormatter.format(testAlgorithmOutput);
      
      const { capabilityScores } = result;
      expect(capabilityScores).toBeDefined();
      
      const expectedCapabilities = ['execution', 'innovation', 'management', 'sales', 'coordination', 'stability'];
      expectedCapabilities.forEach(capability => {
        expect(capabilityScores).toHaveProperty(capability);
        const score = capabilityScores[capability as keyof typeof capabilityScores];
        expect(score).toHaveProperty('score');
        expect(score).toHaveProperty('rank');
        expect(score).toHaveProperty('description');
        expect(typeof score.score).toBe('number');
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(100);
      });
    });

    it('应该正确格式化格局分析', () => {
      const result = CapabilityAssessmentFormatter.format(testAlgorithmOutput);
      
      const { pattern } = result;
      expect(pattern).toBeDefined();
      expect(pattern).toHaveProperty('type');
      expect(pattern).toHaveProperty('confidence');
      expect(pattern).toHaveProperty('description');
      expect(pattern).toHaveProperty('implications');
      expect(pattern).toHaveProperty('advantages');
      expect(pattern).toHaveProperty('challenges');
      
      expect(pattern.type).toBe('食神生财格');
      expect(typeof pattern.confidence).toBe('number');
      expect(pattern.confidence).toBeGreaterThan(0);
      expect(pattern.confidence).toBeLessThanOrEqual(1);
      expect(Array.isArray(pattern.implications)).toBe(true);
      expect(Array.isArray(pattern.advantages)).toBe(true);
      expect(Array.isArray(pattern.challenges)).toBe(true);
    });

    it('应该正确格式化综合评价', () => {
      const result = CapabilityAssessmentFormatter.format(testAlgorithmOutput);
      
      const { overallAssessment } = result;
      expect(overallAssessment).toBeDefined();
      expect(overallAssessment).toHaveProperty('strengthRank');
      expect(overallAssessment).toHaveProperty('topThreeCapabilities');
      expect(overallAssessment).toHaveProperty('personalityType');
      expect(overallAssessment).toHaveProperty('careerSuggestions');
      expect(overallAssessment).toHaveProperty('developmentAdvice');
      
      expect(typeof overallAssessment.strengthRank).toBe('number');
      expect(overallAssessment.strengthRank).toBeGreaterThan(0);
      expect(overallAssessment.strengthRank).toBeLessThanOrEqual(100);
      
      expect(Array.isArray(overallAssessment.topThreeCapabilities)).toBe(true);
      expect(overallAssessment.topThreeCapabilities.length).toBeLessThanOrEqual(3);
      
      expect(Array.isArray(overallAssessment.careerSuggestions)).toBe(true);
      expect(Array.isArray(overallAssessment.developmentAdvice)).toBe(true);
    });

    it('应该正确格式化个性化建议', () => {
      const result = CapabilityAssessmentFormatter.format(testAlgorithmOutput);
      
      const { recommendations } = result;
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('category');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('suggestion');
        expect(rec).toHaveProperty('reasoning');
        expect(rec).toHaveProperty('actionItems');
        
        expect(['career', 'skill', 'mindset', 'relationship', 'health']).toContain(rec.category);
        expect(['high', 'medium', 'low']).toContain(rec.priority);
        expect(Array.isArray(rec.actionItems)).toBe(true);
      });
    });
  });

  describe('数据缺失处理', () => {
    it('应该处理缺失格局分析的情况', () => {
      const incompleteOutput = {
        ...testAlgorithmOutput,
        analysis_details: {
          ...testAlgorithmOutput.analysis_details!,
          pattern: {
            pattern_type: '普通格局',
            dominant_ten_god: '比肩' as const,
            strength_ratio: 1.0,
            confidence: 0.5,
            description: '格局平均，无明显偏向'
          }
        }
      };

      const result = CapabilityAssessmentFormatter.format(incompleteOutput);
      
      expect(result.pattern).toBeDefined();
      expect(result.pattern.type).toBe('普通格局');
      expect(result.pattern.confidence).toBe(0.5);
    });

    it('应该处理缺失建议数据的情况', () => {
      const noRecommendations = {
        ...testAlgorithmOutput,
        analysis_details: {
          ...testAlgorithmOutput.analysis_details!,
          recommendations: undefined
        }
      };

      const result = CapabilityAssessmentFormatter.format(noRecommendations);
      
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThanOrEqual(1);
      // 应该有默认建议
    });

    it('应该处理缺失cluster数据的情况', () => {
      const noClusters = {
        ...testAlgorithmOutput,
        clusters: {
          食伤: 0,
          官杀: 0,
          比劫: 0,
          财: 0,
          印: 0
        }
      };

      const result = CapabilityAssessmentFormatter.format(noClusters);
      
      // 应该仍能正常格式化
      expect(result).toBeDefined();
      expect(result.overallAssessment).toBeDefined();
    });

    it('应该处理缺失analysis_details的情况', () => {
      const noAnalysisDetails = {
        ...testAlgorithmOutput,
        analysis_details: undefined
      };

      const result = CapabilityAssessmentFormatter.format(noAnalysisDetails);
      
      expect(result).toBeDefined();
      expect(result.pattern.type).toBe('普通格局');
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('等级分类测试', () => {
    it('应该正确分类十神强度等级', () => {
      const testStrengths = [
        { value: 90, expectedLevel: '极强' },
        { value: 75, expectedLevel: '较强' },
        { value: 50, expectedLevel: '中等' },
        { value: 25, expectedLevel: '较弱' },
        { value: 5, expectedLevel: '极弱' }
      ];

      testStrengths.forEach(({ value, expectedLevel }) => {
        const output = {
          ...testAlgorithmOutput,
          ten_god_strength: {
            ...testAlgorithmOutput.ten_god_strength,
            '测试十神': value
          }
        };

        const result = CapabilityAssessmentFormatter.format(output);
        expect(result.tenGodStrength.all['测试十神']?.level).toBe(expectedLevel);
      });
    });

    it('应该正确排序主导十神', () => {
      const result = CapabilityAssessmentFormatter.format(testAlgorithmOutput);
      
      const { dominant } = result.tenGodStrength;
      
      // 应该按强度降序排列
      for (let i = 0; i < dominant.length - 1; i++) {
        expect(dominant[i].strength).toBeGreaterThanOrEqual(dominant[i + 1].strength);
        expect(dominant[i].rank).toBe(i + 1);
      }
      
      // 第一名应该是最强的十神（七杀：70）
      expect(dominant[0].name).toBe('七杀');
      expect(dominant[0].strength).toBe(70);
      expect(dominant[0].rank).toBe(1);
    });

    it('应该正确排序能力评分', () => {
      const result = CapabilityAssessmentFormatter.format(testAlgorithmOutput);
      
      const capabilities = Object.entries(result.capabilityScores)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => a.rank - b.rank);
      
      // 验证排名的连续性和正确性
      capabilities.forEach((cap, index) => {
        expect(cap.rank).toBe(index + 1);
      });
      
      // 验证分数排序
      for (let i = 0; i < capabilities.length - 1; i++) {
        expect(capabilities[i].score).toBeGreaterThanOrEqual(capabilities[i + 1].score);
      }
    });
  });

  describe('描述生成测试', () => {
    it('应该生成合适的十神影响描述', () => {
      const result = CapabilityAssessmentFormatter.format(testAlgorithmOutput);
      
      result.tenGodStrength.dominant.forEach(item => {
        expect(typeof item.influence).toBe('string');
        expect(item.influence.length).toBeGreaterThan(0);
        // 描述应该包含十神名称
        expect(item.influence).toContain(item.name);
      });
    });

    it('应该生成合适的能力描述', () => {
      const result = CapabilityAssessmentFormatter.format(testAlgorithmOutput);
      
      Object.entries(result.capabilityScores).forEach(([name, data]) => {
        expect(typeof data.description).toBe('string');
        expect(data.description.length).toBeGreaterThan(0);
      });
    });

    it('应该生成个性化的性格类型', () => {
      const result = CapabilityAssessmentFormatter.format(testAlgorithmOutput);
      
      expect(typeof result.overallAssessment.personalityType).toBe('string');
      expect(result.overallAssessment.personalityType.length).toBeGreaterThan(0);
    });
  });

  describe('边界条件测试', () => {
    it('应该处理极端的能力评分', () => {
      const extremeOutput = {
        ...testAlgorithmOutput,
        capabilities: {
          '执行力基础分': 100,
          '创新力基础分': 0,
          '管理力基础分': 100,
          '销售力基础分': 0,
          '协调力基础分': 100,
          '稳定性基础分': 0
        }
      };

      const result = CapabilityAssessmentFormatter.format(extremeOutput);
      
      expect(result.capabilityScores.execution.score).toBe(100);
      expect(result.capabilityScores.innovation.score).toBe(0);
      
      // 排名应该正确
      expect(result.capabilityScores.execution.rank).toBe(1);
      expect(result.capabilityScores.innovation.rank).toBe(6);
    });

    it('应该处理所有十神强度相等的情况', () => {
      const equalOutput = {
        ...testAlgorithmOutput,
        ten_god_strength: Object.fromEntries(
          Object.keys(testAlgorithmOutput.ten_god_strength).map(key => [key, 50])
        ) as any
      };

      const result = CapabilityAssessmentFormatter.format(equalOutput);
      
      // 所有十神应该都是中等等级
      Object.values(result.tenGodStrength.all).forEach(data => {
        expect(data.level).toBe('中等');
      });
    });

    it('应该处理非常高的置信度', () => {
      const highConfidenceOutput = {
        ...testAlgorithmOutput,
        analysis_details: {
          ...testAlgorithmOutput.analysis_details!,
          pattern: {
            ...testAlgorithmOutput.analysis_details!.pattern!,
            confidence: 0.98
          }
        }
      };

      const result = CapabilityAssessmentFormatter.format(highConfidenceOutput);
      
      expect(result.pattern.confidence).toBe(0.98);
    });
  });

  describe('性能测试', () => {
    it('格式化操作应该快速完成', () => {
      const startTime = Date.now();
      CapabilityAssessmentFormatter.format(testAlgorithmOutput);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // 100毫秒内完成
    });

    it('批量格式化应该高效', () => {
      const outputs = Array.from({ length: 100 }, () => ({
        ...testAlgorithmOutput,
        capabilities: {
          '执行力基础分': Math.random() * 100,
          '创新力基础分': Math.random() * 100,
          '管理力基础分': Math.random() * 100,
          '销售力基础分': Math.random() * 100,
          '协调力基础分': Math.random() * 100,
          '稳定性基础分': Math.random() * 100
        }
      }));

      const startTime = Date.now();
      outputs.forEach(output => CapabilityAssessmentFormatter.format(output));
      const endTime = Date.now();

      const totalDuration = endTime - startTime;
      const averageTime = totalDuration / outputs.length;

      expect(averageTime).toBeLessThan(5); // 平均5毫秒内完成
    });
  });

  describe('错误处理', () => {
    it('应该处理空输入', () => {
      expect(() => CapabilityAssessmentFormatter.format(null as any)).toThrow();
      expect(() => CapabilityAssessmentFormatter.format(undefined as any)).toThrow();
    });

    it('应该处理缺失必要数据的输入', () => {
      const incompleteOutput = {
        // 只有部分数据
        ten_god_strength: testAlgorithmOutput.ten_god_strength
      } as any;

      expect(() => CapabilityAssessmentFormatter.format(incompleteOutput)).toThrow();
    });

    it('应该处理无效的十神强度数据', () => {
      const invalidOutput = {
        ...testAlgorithmOutput,
        ten_god_strength: {
          '比肩': 'invalid' as any,
          '劫财': 0, '食神': 0, '伤官': 0, '正财': 0,
          '偏财': 0, '正官': 0, '七杀': 0, '正印': 0, '偏印': 0
        }
      };

      expect(() => CapabilityAssessmentFormatter.format(invalidOutput)).toThrow();
    });

    it('应该处理无效的能力评分数据', () => {
      const invalidOutput = {
        ...testAlgorithmOutput,
        capabilities: {
          '执行力基础分': 'invalid' as any,
          '创新力基础分': 0,
          '管理力基础分': 0,
          '销售力基础分': 0,
          '协调力基础分': 0,
          '稳定性基础分': 0
        }
      };

      expect(() => CapabilityAssessmentFormatter.format(invalidOutput)).toThrow();
    });
  });
});