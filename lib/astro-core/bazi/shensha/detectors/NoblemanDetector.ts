/**
 * 贵人神煞检测器
 * 专门检测各种贵人类神煞
 */

import { ShenShaCondition, ShenShaInput } from '../types';
import type { BranchName, StemName } from '../../types';
import { BaseDetector } from './BaseDetector';

export class NoblemanDetector extends BaseDetector {
  public name = 'NoblemanDetector';
  public supportedShenSha = [
    '天乙贵人',
    '天德贵人',
    '月德贵人',
    '天德合',
    '月德合',
    '太极贵人',
    '三奇贵人',
    '文昌贵人',
    '国印贵人',
  ];

  protected initializeShenShaInfo(): void {
    // 天乙贵人
    this.addShenShaInfo('天乙贵人', {
      name: '天乙贵人',
      category: 'auspicious',
      group: 'nobleman',
      description: '命中最重要的贵人星，主得贵人相助',
      details:
        '天乙贵人是八字中最重要的神煞之一，命带天乙贵人者，遇事有人相助，逢凶化吉。天乙贵人有阴贵阳贵之分，以日干查四柱地支。',
      strength: 9,
      isImportant: true,
      aliases: ['天乙', '贵人'],
    });

    // 天德贵人
    this.addShenShaInfo('天德贵人', {
      name: '天德贵人',
      category: 'auspicious',
      group: 'nobleman',
      description: '德行高尚，逢凶化吉，多有天助',
      details:
        '天德贵人主德望清高，所作所为多利他人，能逢凶化吉，不犯官司。以年干和月干查看是否构成天德。',
      strength: 8,
      isImportant: true,
      aliases: ['天德'],
    });

    // 月德贵人
    this.addShenShaInfo('月德贵人', {
      name: '月德贵人',
      category: 'auspicious',
      group: 'nobleman',
      description: '品德高尚，受人尊敬，多得月助',
      details: '月德贵人主品德高尚，为人正直，多受人尊敬。以月支查四柱天干，有特定的配对关系。',
      strength: 7,
      isImportant: true,
      aliases: ['月德'],
    });

    // 天德合
    this.addShenShaInfo('天德合', {
      name: '天德合',
      category: 'auspicious',
      group: 'nobleman',
      description: '天德贵人的合化，增强贵人之力',
      details: '天德合是天德贵人的增强版本，同时拥有天德和天德合者，贵人力量更强。',
      strength: 7,
      isImportant: false,
      aliases: ['德合'],
    });

    // 月德合
    this.addShenShaInfo('月德合', {
      name: '月德合',
      category: 'auspicious',
      group: 'nobleman',
      description: '月德贵人的合化，增强月德之力',
      details: '月德合是月德贵人的增强版本，同时拥有月德和月德合者，德望更高。',
      strength: 6,
      isImportant: false,
      aliases: ['月合'],
    });

    // 太极贵人
    this.addShenShaInfo('太极贵人', {
      name: '太极贵人',
      category: 'auspicious',
      group: 'nobleman',
      description: '聪明好学，喜神秘文化，有宗教缘分',
      details: '太极贵人主聪明好学，喜研究神秘文化，与宗教、哲学、易学等有缘分。',
      strength: 6,
      isImportant: false,
      aliases: ['太极'],
    });

    // 三奇贵人
    this.addShenShaInfo('三奇贵人', {
      name: '三奇贵人',
      category: 'auspicious',
      group: 'nobleman',
      description: '才华横溢，有特殊技能，多有奇遇',
      details:
        '三奇贵人分天奇、地奇、人奇。天奇甲戊庚，地奇乙丙丁，人奇壬癸辛。命带三奇者多有特殊才能。',
      strength: 7,
      isImportant: false,
      aliases: ['三奇'],
    });

    // 文昌贵人
    this.addShenShaInfo('文昌贵人', {
      name: '文昌贵人',
      category: 'auspicious',
      group: 'academic',
      description: '聪明好学，利于读书考试，文才出众',
      details: '文昌贵人主聪明好学，记忆力强，利于读书考试，多有文采。以日干查地支。',
      strength: 6,
      isImportant: false,
      aliases: ['文昌'],
    });

    // 国印贵人
    this.addShenShaInfo('国印贵人', {
      name: '国印贵人',
      category: 'auspicious',
      group: 'nobleman',
      description: '有权威，受人尊敬，多居要职',
      details: '国印贵人主有权威性，受人尊敬，多能居于要职。以年支或日支查其他地支。',
      strength: 6,
      isImportant: false,
      aliases: ['国印'],
    });
  }

  protected initializeConditions(): void {
    // 天乙贵人检测条件
    this.addCondition('天乙贵人', [
      {
        type: 'relationship',
        targetPillar: 'day',
        extraConditions: { checkType: 'tianyiGuiren' },
      },
    ]);

    // 天德贵人检测条件
    this.addCondition('天德贵人', [
      {
        type: 'relationship',
        referencePillar: 'year',
        targetPillar: 'month',
        extraConditions: { checkType: 'tiandeGuiren' },
      },
    ]);

    // 月德贵人检测条件
    this.addCondition('月德贵人', [
      {
        type: 'relationship',
        referencePillar: 'month',
        extraConditions: { checkType: 'yuedeGuiren' },
      },
    ]);

    // 天德合检测条件
    this.addCondition('天德合', [
      {
        type: 'relationship',
        referencePillar: 'year',
        extraConditions: { checkType: 'tiandeHe' },
      },
    ]);

    // 月德合检测条件
    this.addCondition('月德合', [
      {
        type: 'relationship',
        referencePillar: 'month',
        extraConditions: { checkType: 'yuedeHe' },
      },
    ]);

    // 太极贵人检测条件
    this.addCondition('太极贵人', [
      {
        type: 'relationship',
        targetPillar: 'day',
        extraConditions: { checkType: 'taijiGuiren' },
      },
    ]);

    // 三奇贵人检测条件
    this.addCondition('三奇贵人', [
      {
        type: 'combination',
        extraConditions: { checkType: 'sanqiGuiren' },
      },
    ]);

    // 文昌贵人检测条件
    this.addCondition('文昌贵人', [
      {
        type: 'relationship',
        targetPillar: 'day',
        extraConditions: { checkType: 'wenchangGuiren' },
      },
    ]);

    // 国印贵人检测条件
    this.addCondition('国印贵人', [
      {
        type: 'relationship',
        referencePillar: 'year',
        extraConditions: { checkType: 'guoyinGuiren' },
      },
    ]);
  }

  /**
   * 重写关系条件评估，实现具体的贵人检测逻辑
   */
  protected evaluateRelationshipCondition(
    condition: ShenShaCondition,
    input: ShenShaInput,
  ): {
    matched: boolean;
    positions: Array<{ pillar: any; stem?: string; branch?: string }>;
    details?: any;
  } {
    const checkType = condition.extraConditions?.checkType;

    switch (checkType) {
      case 'tianyiGuiren':
        return this.checkTianyiGuiren(input);
      case 'tiandeGuiren':
        return this.checkTiandeGuiren(input);
      case 'yuedeGuiren':
        return this.checkYuedeGuiren(input);
      case 'tiandeHe':
        return this.checkTiandeHe(input);
      case 'yuedeHe':
        return this.checkYuedeHe(input);
      case 'taijiGuiren':
        return this.checkTaijiGuiren(input);
      case 'wenchangGuiren':
        return this.checkWenchangGuiren(input);
      case 'guoyinGuiren':
        return this.checkGuoyinGuiren(input);
      default:
        return { matched: false, positions: [] };
    }
  }

  /**
   * 重写组合条件评估
   */
  protected evaluateCombinationCondition(
    condition: ShenShaCondition,
    input: ShenShaInput,
  ): {
    matched: boolean;
    positions: Array<{ pillar: any; stem?: string; branch?: string }>;
    details?: any;
  } {
    const checkType = condition.extraConditions?.checkType;

    switch (checkType) {
      case 'sanqiGuiren':
        return this.checkSanqiGuiren(input);
      default:
        return { matched: false, positions: [] };
    }
  }

  /**
   * 检测天乙贵人
   */
  private checkTianyiGuiren(input: ShenShaInput): {
    matched: boolean;
    positions: Array<{ pillar: any; stem?: string; branch?: string }>;
    details?: any;
  } {
    const dayStem = input.fourPillars.day.stem;
    const positions: Array<{ pillar: any; stem?: string; branch?: string }> = [];

    // 天乙贵人对照表
    const tianyiMap: Record<StemName, BranchName[]> = {
      甲: ['丑', '未'],
      乙: ['子', '申'],
      丙: ['亥', '酉'],
      丁: ['亥', '酉'],
      戊: ['丑', '未'],
      己: ['子', '申'],
      庚: ['丑', '未'],
      辛: ['寅', '午'],
      壬: ['卯', '巳'],
      癸: ['卯', '巳'],
    };

    const targetBranches = tianyiMap[dayStem];
    if (!targetBranches) {
      return { matched: false, positions: [] };
    }

    let matched = false;
    const pillars = ['year', 'month', 'day', 'hour'] as const;

    for (const pillarType of pillars) {
      const branch = input.fourPillars[pillarType].branch;
      if (targetBranches.includes(branch)) {
        matched = true;
        positions.push({ pillar: pillarType, branch });
      }
    }

    return {
      matched,
      positions,
      details: {
        type: matched ? '天乙贵人' : '无天乙贵人',
        dayMaster: dayStem,
        targetBranches,
      },
    };
  }

  /**
   * 检测天德贵人
   */
  private checkTiandeGuiren(input: ShenShaInput): {
    matched: boolean;
    positions: Array<{ pillar: any; stem?: string; branch?: string }>;
    details?: any;
  } {
    const yearStem = input.fourPillars.year.stem;
    const monthStem = input.fourPillars.month.stem;

    // 天德贵人：甲见戊、乙见己、丙见丙、丁见丁、戊见甲、己见乙、庚见庚、辛见辛、壬见壬、癸见癸
    const tiandeMap: Record<StemName, StemName> = {
      甲: '戊',
      乙: '己',
      丙: '丙',
      丁: '丁',
      戊: '甲',
      己: '乙',
      庚: '庚',
      辛: '辛',
      壬: '壬',
      癸: '癸',
    };

    const requiredStem = tiandeMap[yearStem];
    const matched = monthStem === requiredStem;

    const positions = matched ? [{ pillar: 'month' as const, stem: monthStem }] : [];

    return {
      matched,
      positions,
      details: {
        type: matched ? '天德贵人' : '无天德贵人',
        yearStem,
        monthStem,
        requiredStem,
      },
    };
  }

  /**
   * 检测月德贵人
   */
  private checkYuedeGuiren(input: ShenShaInput): {
    matched: boolean;
    positions: Array<{ pillar: any; stem?: string; branch?: string }>;
    details?: any;
  } {
    const monthBranch = input.fourPillars.month.branch;
    const positions: Array<{ pillar: any; stem?: string; branch?: string }> = [];

    // 月德贵人对照表
    const yuedeMap: Record<BranchName, StemName> = {
      子: '丙',
      丑: '甲',
      寅: '丁',
      卯: '甲',
      辰: '乙',
      巳: '乙',
      午: '甲',
      未: '甲',
      申: '壬',
      酉: '辛',
      戌: '辛',
      亥: '甲',
    };

    const requiredStem = yuedeMap[monthBranch];
    if (!requiredStem) {
      return { matched: false, positions: [] };
    }

    let matched = false;
    const pillars = ['year', 'month', 'day', 'hour'] as const;

    for (const pillarType of pillars) {
      const stem = input.fourPillars[pillarType].stem;
      if (stem === requiredStem) {
        matched = true;
        positions.push({ pillar: pillarType, stem });
      }
    }

    return {
      matched,
      positions,
      details: {
        type: matched ? '月德贵人' : '无月德贵人',
        monthBranch,
        requiredStem,
      },
    };
  }

  /**
   * 检测天德合
   */
  private checkTiandeHe(input: ShenShaInput): {
    matched: boolean;
    positions: Array<{ pillar: any; stem?: string; branch?: string }>;
    details?: any;
  } {
    // 首先检查是否有天德贵人
    const tiandeResult = this.checkTiandeGuiren(input);
    if (!tiandeResult.matched) {
      return { matched: false, positions: [] };
    }

    const yearStem = input.fourPillars.year.stem;
    const positions: Array<{ pillar: any; stem?: string; branch?: string }> = [];

    // 天德合对照表（与天德相合的干）
    const tiandeHeMap: Record<StemName, StemName> = {
      甲: '己',
      乙: '庚',
      丙: '辛',
      丁: '壬',
      戊: '癸',
      己: '甲',
      庚: '乙',
      辛: '丙',
      壬: '丁',
      癸: '戊',
    };

    const requiredStem = tiandeHeMap[yearStem];
    if (!requiredStem) {
      return { matched: false, positions: [] };
    }

    let matched = false;
    const pillars = ['year', 'month', 'day', 'hour'] as const;

    for (const pillarType of pillars) {
      const stem = input.fourPillars[pillarType].stem;
      if (stem === requiredStem) {
        matched = true;
        positions.push({ pillar: pillarType, stem });
      }
    }

    return {
      matched,
      positions,
      details: {
        type: matched ? '天德合' : '无天德合',
        yearStem,
        requiredStem,
      },
    };
  }

  /**
   * 检测月德合
   */
  private checkYuedeHe(input: ShenShaInput): {
    matched: boolean;
    positions: Array<{ pillar: any; stem?: string; branch?: string }>;
    details?: any;
  } {
    // 首先检查是否有月德贵人
    const yuedeResult = this.checkYuedeGuiren(input);
    if (!yuedeResult.matched) {
      return { matched: false, positions: [] };
    }

    const monthBranch = input.fourPillars.month.branch;
    const positions: Array<{ pillar: any; stem?: string; branch?: string }> = [];

    // 月德合对照表
    const yuedeHeMap: Record<BranchName, StemName> = {
      子: '辛',
      丑: '己',
      寅: '壬',
      卯: '己',
      辰: '庚',
      巳: '庚',
      午: '己',
      未: '己',
      申: '丁',
      酉: '丙',
      戌: '丙',
      亥: '己',
    };

    const requiredStem = yuedeHeMap[monthBranch];
    if (!requiredStem) {
      return { matched: false, positions: [] };
    }

    let matched = false;
    const pillars = ['year', 'month', 'day', 'hour'] as const;

    for (const pillarType of pillars) {
      const stem = input.fourPillars[pillarType].stem;
      if (stem === requiredStem) {
        matched = true;
        positions.push({ pillar: pillarType, stem });
      }
    }

    return {
      matched,
      positions,
      details: {
        type: matched ? '月德合' : '无月德合',
        monthBranch,
        requiredStem,
      },
    };
  }

  /**
   * 检测太极贵人
   */
  private checkTaijiGuiren(input: ShenShaInput): {
    matched: boolean;
    positions: Array<{ pillar: any; stem?: string; branch?: string }>;
    details?: any;
  } {
    const dayStem = input.fourPillars.day.stem;
    const positions: Array<{ pillar: any; stem?: string; branch?: string }> = [];

    // 太极贵人对照表
    const taijiMap: Record<StemName, BranchName[]> = {
      甲: ['子', '午'],
      乙: ['子', '午'],
      丙: ['卯', '酉'],
      丁: ['卯', '酉'],
      戊: ['辰', '戌', '丑', '未'],
      己: ['辰', '戌', '丑', '未'],
      庚: ['寅', '亥'],
      辛: ['寅', '亥'],
      壬: ['巳', '申'],
      癸: ['巳', '申'],
    };

    const targetBranches = taijiMap[dayStem];
    if (!targetBranches) {
      return { matched: false, positions: [] };
    }

    let matched = false;
    const pillars = ['year', 'month', 'day', 'hour'] as const;

    for (const pillarType of pillars) {
      const branch = input.fourPillars[pillarType].branch;
      if (targetBranches.includes(branch)) {
        matched = true;
        positions.push({ pillar: pillarType, branch });
      }
    }

    return {
      matched,
      positions,
      details: {
        type: matched ? '太极贵人' : '无太极贵人',
        dayMaster: dayStem,
        targetBranches,
      },
    };
  }

  /**
   * 检测三奇贵人
   */
  private checkSanqiGuiren(input: ShenShaInput): {
    matched: boolean;
    positions: Array<{ pillar: any; stem?: string; branch?: string }>;
    details?: any;
  } {
    const stems = [
      input.fourPillars.year.stem,
      input.fourPillars.month.stem,
      input.fourPillars.day.stem,
      input.fourPillars.hour.stem,
    ];

    const positions: Array<{ pillar: any; stem?: string; branch?: string }> = [];
    let matched = false;
    let type = '';

    // 天奇：甲戊庚
    const tianqi = ['甲', '戊', '庚'] as StemName[];
    const tianqiCount = tianqi.filter((stem) => stems.includes(stem as StemName)).length;

    // 地奇：乙丙丁
    const diqi = ['乙', '丙', '丁'] as StemName[];
    const diqiCount = diqi.filter((stem) => stems.includes(stem as StemName)).length;

    // 人奇：壬癸辛
    const renqi = ['壬', '癸', '辛'] as StemName[];
    const renqiCount = renqi.filter((stem) => stems.includes(stem as StemName)).length;

    if (tianqiCount >= 3) {
      matched = true;
      type = '天奇';
      const pillars = ['year', 'month', 'day', 'hour'] as const;
      for (let i = 0; i < 4; i++) {
        if (tianqi.includes(stems[i])) {
          positions.push({ pillar: pillars[i], stem: stems[i] });
        }
      }
    } else if (diqiCount >= 3) {
      matched = true;
      type = '地奇';
      const pillars = ['year', 'month', 'day', 'hour'] as const;
      for (let i = 0; i < 4; i++) {
        if (diqi.includes(stems[i])) {
          positions.push({ pillar: pillars[i], stem: stems[i] });
        }
      }
    } else if (renqiCount >= 3) {
      matched = true;
      type = '人奇';
      const pillars = ['year', 'month', 'day', 'hour'] as const;
      for (let i = 0; i < 4; i++) {
        if (renqi.includes(stems[i])) {
          positions.push({ pillar: pillars[i], stem: stems[i] });
        }
      }
    }

    return {
      matched,
      positions,
      details: {
        type: matched ? `三奇贵人(${type})` : '无三奇贵人',
        tianqiCount,
        diqiCount,
        renqiCount,
      },
    };
  }

  /**
   * 检测文昌贵人
   */
  private checkWenchangGuiren(input: ShenShaInput): {
    matched: boolean;
    positions: Array<{ pillar: any; stem?: string; branch?: string }>;
    details?: any;
  } {
    const dayStem = input.fourPillars.day.stem;
    const positions: Array<{ pillar: any; stem?: string; branch?: string }> = [];

    // 文昌贵人对照表
    const wenchangMap: Record<StemName, BranchName> = {
      甲: '巳',
      乙: '午',
      丙: '申',
      丁: '酉',
      戊: '申',
      己: '酉',
      庚: '亥',
      辛: '子',
      壬: '寅',
      癸: '卯',
    };

    const targetBranch = wenchangMap[dayStem];
    if (!targetBranch) {
      return { matched: false, positions: [] };
    }

    let matched = false;
    const pillars = ['year', 'month', 'day', 'hour'] as const;

    for (const pillarType of pillars) {
      const branch = input.fourPillars[pillarType].branch;
      if (branch === targetBranch) {
        matched = true;
        positions.push({ pillar: pillarType, branch });
      }
    }

    return {
      matched,
      positions,
      details: {
        type: matched ? '文昌贵人' : '无文昌贵人',
        dayMaster: dayStem,
        targetBranch,
      },
    };
  }

  /**
   * 检测国印贵人
   */
  private checkGuoyinGuiren(input: ShenShaInput): {
    matched: boolean;
    positions: Array<{ pillar: any; stem?: string; branch?: string }>;
    details?: any;
  } {
    const yearBranch = input.fourPillars.year.branch;
    const positions: Array<{ pillar: any; stem?: string; branch?: string }> = [];

    // 国印贵人对照表（以年支或日支查）
    const guoyinMap: Record<BranchName, BranchName> = {
      子: '戌',
      丑: '亥',
      寅: '子',
      卯: '丑',
      辰: '寅',
      巳: '卯',
      午: '辰',
      未: '巳',
      申: '午',
      酉: '未',
      戌: '申',
      亥: '酉',
    };

    const targetBranch = guoyinMap[yearBranch];
    if (!targetBranch) {
      return { matched: false, positions: [] };
    }

    let matched = false;
    const pillars = ['year', 'month', 'day', 'hour'] as const;

    for (const pillarType of pillars) {
      const branch = input.fourPillars[pillarType].branch;
      if (branch === targetBranch) {
        matched = true;
        positions.push({ pillar: pillarType, branch });
      }
    }

    return {
      matched,
      positions,
      details: {
        type: matched ? '国印贵人' : '无国印贵人',
        yearBranch,
        targetBranch,
      },
    };
  }
}
