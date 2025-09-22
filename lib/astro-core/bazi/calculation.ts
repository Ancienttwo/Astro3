/**
 * @astroall/bazi-core 核心计算接口 - 八字计算统一入口
 * 
 * @ai-context BAZI_CORE_CALCULATION
 * @purpose 提供统一的八字计算核心算法，替代分散的工具函数
 * @pattern 参考 ziwei-core/src/calculations.ts 设计模式
 * @critical 禁止算法重复实现，所有八字计算必须使用此模块
 * @version 1.0.0
 * @created 2025-01-05
 */

import { SolarDay, LunarDay, SolarTime } from 'tyme4ts';
import { BaziAlgorithmAdapter, BaziAlgorithmUtils } from './algorithms';
import {
  BaziCalculationInput,
  BaziCalculationOptions,
  CompleteBaziAnalysis,
  FourPillars,
  StemBranchPair,
  NaYin,
  TenGodAnalysis,
  ElementAnalysis,
  StrengthAnalysis,
  MajorPeriod,
  FleetingYear,
  ValidationResult,
  PerformanceMetrics,
  BaziCalculationError,
  StemName,
  BranchName,
  ElementName,
  TenGodType,
  TenGodSimplified,
  SpecialBranchAttribute,
  LuShen,
  // 🆕 关系分析相关类型
  RelationshipAnalysis,
  StemRelationship,
  BranchRelationship,
  StemRelationType,
  BranchRelationType,
  StemCombinationType,
  BranchCombinationType,
  BranchClashType,
  BranchPunishmentType,
  BranchHarmType,
  BranchBreakType,
  BranchDestroyType,
  // 🆕 羊刃帝旺相关类型
  YangBlade,
  EmperorProsperity,
  // 🆕 数值索引系统
  STEM_INDEX_MAP,
  BRANCH_INDEX_MAP,
  INDEX_TO_STEM,
  INDEX_TO_BRANCH,
  // 🆕 神煞分类系统
  ShenShaName,
  ShenShaCategory,
  ShenShaInfo,
  // 🆕 暗合信息
  SamePillarHiddenCombination,
  // 🆕 魁罡信息
  KuiGangType,
  KuiGangSubType,
  KuiGangInfo
} from './types';

/**
 * 🌟 主要计算函数 - generateCompleteBaziChart
 * 
 * @ai-usage 替代所有分散的八字计算函数
 * @pattern 类似 ziwei-core 的 generateCompleteZiWeiChart
 * @example
 * ```typescript
 * import { generateCompleteBaziChart } from '@astroall/bazi-core'
 * 
 * const result = generateCompleteBaziChart({
 *   year: 1990, month: 6, day: 15, hour: 14, minute: 30,
 *   gender: 'male', isLunar: false
 * });
 * ```
 */
export function generateCompleteBaziChart(
  input: BaziCalculationInput,
  options: BaziCalculationOptions = {}
): CompleteBaziAnalysis {
  const startTime = performance.now();
  
  // 参数验证
  const validation = validateInput(input);
  if (!validation.isValid) {
    throw new BaziCalculationError(
      `输入参数验证失败: ${validation.errors.join(', ')}`,
      'INVALID_INPUT',
      input
    );
  }
  
  // 默认选项
  const finalOptions: BaziCalculationOptions = {
    includeTenGods: true,
    includeElementAnalysis: true,
    includeStrengthAnalysis: true,
    includeMajorPeriods: true,
    includeFleetingYears: true,
    includeHiddenStems: true, // 🆕 默认包含藏干分析
    includeRelationshipAnalysis: true, // 🆕 默认包含关系分析
    majorPeriodCount: 10,
    fleetingYearRange: 10,
    precision: 'standard',
    enableCache: true,
    debug: false,
    ...options
  };
  
  try {
    // Step 1: 获取基础时间对象
    const { solarDay, lunarDay, targetHour } = getTimeComponents(input);
    
    // Step 2: 计算四柱八字
    const fourPillars = calculateFourPillars(solarDay, lunarDay, targetHour, finalOptions.includeHiddenStems, input.gender);
    
    // Step 3: 计算纳音
    const naYin = calculateNaYin(fourPillars);
    
    // Step 4: 十神分析 (可选) - 使用现有算法
    let tenGodAnalysis: TenGodAnalysis | undefined;
    if (finalOptions.includeTenGods) {
      tenGodAnalysis = calculateTenGodsUsingExistingAlgorithm(fourPillars);
    }
    
    // Step 5: 五行分析 (可选)
    let elementAnalysis: ElementAnalysis | undefined;
    if (finalOptions.includeElementAnalysis) {
      elementAnalysis = analyzeElements(fourPillars);
    }
    
    // Step 6: 强弱分析 (可选)
    let strengthAnalysis: StrengthAnalysis | undefined;
    if (finalOptions.includeStrengthAnalysis && elementAnalysis) {
      strengthAnalysis = analyzeStrength(fourPillars, elementAnalysis);
    }
    
    // Step 7: 计算起运年龄 (童限计算)
    const solarTime = SolarTime.fromYmdHms(
      input.year, input.month, input.day, 
      input.hour, input.minute || 0, 0
    );
    const startingAge = calculateStartingAge(solarTime, input.gender);
    
    // Step 8: 大运计算 (可选)
    let majorPeriods: MajorPeriod[] = [];
    let currentMajorPeriod: MajorPeriod | undefined;
    if (finalOptions.includeMajorPeriods) {
      majorPeriods = calculateMajorPeriods(
        fourPillars,
        input.gender,
        input.year,
        startingAge, // 🆕 使用实际起运年龄
        finalOptions.majorPeriodCount || 10
      );
      currentMajorPeriod = getCurrentMajorPeriod(majorPeriods, new Date().getFullYear() - input.year);
    }
    
    // Step 9: 流年计算 (可选)
    let fleetingYears: FleetingYear[] = [];
    let currentFleetingYear: FleetingYear | undefined;
    if (finalOptions.includeFleetingYears) {
      fleetingYears = calculateFleetingYears(
        fourPillars,
        input.year,
        finalOptions.fleetingYearRange || 10
      );
      currentFleetingYear = getCurrentFleetingYear(fleetingYears);
    }
    
    // Step 9: 神煞计算 (可选) - 保持模块分离
    let shenShaAnalysis = undefined;
    if (finalOptions.includeShenSha) {
      try {
        const { checkBaziShenSha } = require('./algorithms');
        
        // 转换四柱格式为神煞计算所需的数组格式
        const baziArray = [
          fourPillars.year.stem, fourPillars.year.branch,
          fourPillars.month.stem, fourPillars.month.branch,
          fourPillars.day.stem, fourPillars.day.branch,
          fourPillars.hour.stem, fourPillars.hour.branch
        ];
        
        shenShaAnalysis = checkBaziShenSha(baziArray, true); // true表示有准确时辰
        
        if (finalOptions.debug) {
          console.log('🎭 神煞计算完成:', shenShaAnalysis);
        }
      } catch (error) {
        console.warn('⚠️ 神煞计算失败，跳过:', error);
        shenShaAnalysis = undefined;
      }
    }
    
    // Step 9.5: 关系分析 (可选)
    let relationshipAnalysis = undefined;
    if (finalOptions.includeRelationshipAnalysis) {
      try {
        relationshipAnalysis = analyzeRelationships(fourPillars);
        if (finalOptions.debug) {
          console.log('🔗 关系分析完成:', relationshipAnalysis);
        }
      } catch (error) {
        console.warn('⚠️ 关系分析失败，跳过:', error);
        relationshipAnalysis = undefined;
      }
    }
    
    // Step 10: 构建完整结果
    const result: CompleteBaziAnalysis = {
      birthInfo: {
        solarDate: new Date(solarDay.toString()),
        lunarDate: input.isLunar ? {
          year: input.year,
          month: input.month,
          day: input.day,
          isLeapMonth: input.isLeapMonth || false
        } : {
          year: lunarDay.getYear(),
          month: lunarDay.getMonth(),
          day: lunarDay.getDay(),
          isLeapMonth: false // 简化处理，实际应该从lunarDay获取
        },
        hour: input.hour,
        minute: input.minute,
        gender: input.gender,
        timezone: input.timezone
      },
      fourPillars,
      naYin,
      tenGodAnalysis: tenGodAnalysis || createEmptyTenGodAnalysis(),
      elementAnalysis: elementAnalysis || createEmptyElementAnalysis(),
      strengthAnalysis: strengthAnalysis || createEmptyStrengthAnalysis(),
      startingAge, // 🆕 使用童限计算的实际起运年龄
      majorPeriods,
      currentMajorPeriod,
      fleetingYears,
      currentFleetingYear,
      shenShaAnalysis, // 神煞分析数据
      relationshipAnalysis, // 🆕 关系分析数据
      calculatedAt: Date.now(),
      version: '1.0.0'
    };
    
    // 调试信息
    if (finalOptions.debug) {
      console.log('🔧 Bazi Calculation Debug:', {
        input,
        options: finalOptions,
        performance: performance.now() - startTime,
        result: {
          fourPillars: result.fourPillars,
          majorPeriodsCount: result.majorPeriods.length,
          fleetingYearsCount: result.fleetingYears.length
        }
      });
    }
    
    return result;
    
  } catch (error) {
    throw new BaziCalculationError(
      `八字计算失败: ${error instanceof Error ? error.message : '未知错误'}`,
      'CALCULATION_ERROR',
      input
    );
  }
}

/**
 * 🏛️ 地支藏干常量表 (标准八字算法)
 * 完整的十二地支藏干对应关系
 */
const EARTHLY_BRANCH_HIDDEN_STEMS: Record<BranchName, StemName[]> = {
  '子': ['癸'],                      // 子：癸水
  '丑': ['己', '癸', '辛'],          // 丑：己土、癸水、辛金
  '寅': ['甲', '丙', '戊'],          // 寅：甲木、丙火、戊土
  '卯': ['乙'],                      // 卯：乙木
  '辰': ['戊', '乙', '癸'],          // 辰：戊土、乙木、癸水
  '巳': ['丙', '戊', '庚'],          // 巳：丙火、戊土、庚金
  '午': ['丁', '己'],                // 午：丁火、己土
  '未': ['己', '丁', '乙'],          // 未：己土、丁火、乙木
  '申': ['庚', '壬', '戊'],          // 申：庚金、壬水、戊土
  '酉': ['辛'],                      // 酉：辛金
  '戌': ['戊', '辛', '丁'],          // 戌：戊土、辛金、丁火
  '亥': ['壬', '甲']                 // 亥：壬水、甲木
};

/**
 * 🏛️ 地支本气常量表
 * 每个地支的主要天干（第一个藏干）
 */
const EARTHLY_BRANCH_PRIMARY_QI: Record<BranchName, StemName> = {
  '子': '癸', '丑': '己', '寅': '甲', '卯': '乙',
  '辰': '戊', '巳': '丙', '午': '丁', '未': '己',
  '申': '庚', '酉': '辛', '戌': '戊', '亥': '壬'
};

/**
 * 🌸 桃花地支 (子午卯酉)
 * 主管感情、人缘、异性缘
 */
const PEACH_BLOSSOM_BRANCHES: BranchName[] = ['子', '午', '卯', '酉'];

/**
 * 🏇 驿马地支 (寅申巳亥)
 * 主管变动、迁移、出行
 */
const POST_HORSE_BRANCHES: BranchName[] = ['寅', '申', '巳', '亥'];

/**
 * ⚰️ 墓库地支定义
 * 丑=金墓库, 未=木墓库, 辰=水墓库, 戌=火墓库
 */
const TOMB_STORAGE_BRANCHES: Partial<Record<BranchName, string>> = {
  '丑': '金墓库',
  '未': '木墓库', 
  '辰': '水墓库',
  '戌': '火墓库'
};

/**
 * 🎯 禄神对应表
 * 天干对地支的禄位关系
 */
const LU_SHEN_MAP: Record<StemName, BranchName> = {
  '甲': '寅',  // 甲禄在寅
  '乙': '卯',  // 乙禄在卯
  '丙': '巳',  // 丙禄在巳
  '丁': '午',  // 丁禄在午
  '戊': '巳',  // 戊禄在巳
  '己': '午',  // 己禄在午
  '庚': '申',  // 庚禄在申
  '辛': '酉',  // 辛禄在酉
  '壬': '亥',  // 壬禄在亥
  '癸': '子'   // 癸禄在子
};

/**
 * ⚔️ 羊刃地支 (五阳干专用)
 * 甲丙戊庚壬 - 甲日见卯，丙日见午
 */
const YANG_BLADE_MAP: Partial<Record<StemName, BranchName>> = {
  '甲': '卯',  // 甲羊刃在卯
  '丙': '午',  // 丙羊刃在午
  '戊': '午',  // 戊羊刃在午
  '庚': '酉',  // 庚羊刃在酉
  '壬': '子'   // 壬羊刃在子
};

/**
 * 👑 帝旺地支 (五阴干专用)  
 * 乙丁己辛癸 - 阴干论帝旺
 */
const EMPEROR_PROSPERITY_MAP: Partial<Record<StemName, BranchName>> = {
  '乙': '午',  // 乙帝旺在午
  '丁': '酉',  // 丁帝旺在酉
  '己': '酉',  // 己帝旺在酉
  '辛': '子',  // 辛帝旺在子
  '癸': '卯'   // 癸帝旺在卯
};

/**
 * 🤝 天干五合关系
 * 甲己合土，乙庚合金，丙辛合水，丁壬合木，戊癸合火
 */
const STEM_COMBINATION_MAP: Record<string, StemCombinationType> = {
  '甲己': '甲己合',
  '己甲': '甲己合',
  '乙庚': '乙庚合',
  '庚乙': '乙庚合',
  '丙辛': '丙辛合',
  '辛丙': '丙辛合',
  '丁壬': '丁壬合',
  '壬丁': '丁壬合',
  '戊癸': '戊癸合',
  '癸戊': '戊癸合'
};

/**
 * ⚡ 地支六冲关系
 * 子午冲，丑未冲，寅申冲，卯酉冲，辰戌冲，巳亥冲
 */
const BRANCH_CLASH_MAP: Record<string, BranchClashType> = {
  '子午': '子午冲', '午子': '子午冲',
  '丑未': '丑未冲', '未丑': '丑未冲', 
  '寅申': '寅申冲', '申寅': '寅申冲',
  '卯酉': '卯酉冲', '酉卯': '卯酉冲',
  '辰戌': '辰戌冲', '戌辰': '辰戌冲',
  '巳亥': '巳亥冲', '亥巳': '巳亥冲'
};

/**
 * 🔥 地支三合关系
 * 申子辰三合水局，亥卯未三合木局，寅午戌三合火局，巳酉丑三合金局
 */
const BRANCH_TRIPLE_COMBINATION_MAP: Record<string, BranchCombinationType> = {
  '申子辰': '申子辰合', '子辰申': '申子辰合', '辰申子': '申子辰合',
  '申辰子': '申子辰合', '子申辰': '申子辰合', '辰子申': '申子辰合',
  '亥卯未': '亥卯未合', '卯未亥': '亥卯未合', '未亥卯': '亥卯未合',
  '亥未卯': '亥卯未合', '卯亥未': '亥卯未合', '未卯亥': '亥卯未合',
  '寅午戌': '寅午戌合', '午戌寅': '寅午戌合', '戌寅午': '寅午戌合',
  '寅戌午': '寅午戌合', '午寅戌': '寅午戌合', '戌午寅': '寅午戌合',
  '巳酉丑': '巳酉丑合', '酉丑巳': '巳酉丑合', '丑巳酉': '巳酉丑合',
  '巳丑酉': '巳酉丑合', '酉巳丑': '巳酉丑合', '丑酉巳': '巳酉丑合'
};

/**
 * 🤲 地支六合关系
 * 子丑合，寅亥合，卯戌合，辰酉合，巳申合，午未合
 */
const BRANCH_SIX_COMBINATION_MAP: Record<string, BranchCombinationType> = {
  '子丑': '子丑合', '丑子': '子丑合',
  '寅亥': '寅亥合', '亥寅': '寅亥合',
  '卯戌': '卯戌合', '戌卯': '卯戌合',
  '辰酉': '辰酉合', '酉辰': '辰酉合',
  '巳申': '巳申合', '申巳': '巳申合',
  '午未': '午未合', '未午': '午未合'
};

/**
 * 🌍 地支三会关系
 * 寅卯辰会东方木，巳午未会南方火，申酉戌会西方金，亥子丑会北方水
 */
const BRANCH_TRIPLE_MEETING_MAP: Record<string, BranchCombinationType> = {
  '寅卯辰': '寅卯辰会', '卯辰寅': '寅卯辰会', '辰寅卯': '寅卯辰会',
  '寅辰卯': '寅卯辰会', '卯寅辰': '寅卯辰会', '辰卯寅': '寅卯辰会',
  '巳午未': '巳午未会', '午未巳': '巳午未会', '未巳午': '巳午未会',
  '巳未午': '巳午未会', '午巳未': '巳午未会', '未午巳': '巳午未会',
  '申酉戌': '申酉戌会', '酉戌申': '申酉戌会', '戌申酉': '申酉戌会',
  '申戌酉': '申酉戌会', '酉申戌': '申酉戌会', '戌酉申': '申酉戌会',
  '亥子丑': '亥子丑会', '子丑亥': '亥子丑会', '丑亥子': '亥子丑会',
  '亥丑子': '亥子丑会', '子亥丑': '亥子丑会', '丑子亥': '亥子丑会'
};

/**
 * 🔥 地支相刑关系
 * 子卯刑(无礼之刑)，寅巳申刑(恩将仇报之刑)，丑戌未刑(倚势之刑)，辰午酉亥自刑
 */
const BRANCH_PUNISHMENT_MAP: Record<string, BranchPunishmentType> = {
  '子卯': '子卯刑', '卯子': '子卯刑',
  '寅巳': '寅巳申刑', '寅申': '寅巳申刑', '巳申': '寅巳申刑',
  '巳寅': '寅巳申刑', '申寅': '寅巳申刑', '申巳': '寅巳申刑',
  '丑戌': '丑戌未刑', '丑未': '丑戌未刑', '戌未': '丑戌未刑',
  '戌丑': '丑戌未刑', '未丑': '丑戌未刑', '未戌': '丑戌未刑',
  '辰辰': '辰午酉亥刑', '午午': '辰午酉亥刑', '酉酉': '辰午酉亥刑', '亥亥': '辰午酉亥刑'
};

/**
 * ⚡ 地支相穿(害)关系
 * 子未穿，丑午穿，寅巳穿，卯辰穿，申亥穿，酉戌穿
 */
const BRANCH_HARM_MAP: Record<string, BranchHarmType> = {
  '子未': '子未穿', '未子': '子未穿',
  '丑午': '丑午穿', '午丑': '丑午穿',
  '寅巳': '寅巳穿', '巳寅': '寅巳穿',
  '卯辰': '卯辰穿', '辰卯': '卯辰穿',
  '申亥': '申亥穿', '亥申': '申亥穿',
  '酉戌': '酉戌穿', '戌酉': '酉戌穿'
};

/**
 * 💥 地支相破关系
 * 子酉破，午卯破，寅亥破，申巳破，辰丑破，戌未破
 */
const BRANCH_BREAK_MAP: Record<string, BranchBreakType> = {
  '子酉': '子酉破', '酉子': '子酉破',
  '午卯': '午卯破', '卯午': '午卯破',
  '寅亥': '寅亥破', '亥寅': '寅亥破',
  '申巳': '申巳破', '巳申': '申巳破',
  '辰丑': '辰丑破', '丑辰': '辰丑破',
  '戌未': '戌未破', '未戌': '戌未破'
};

/**
 * ☠️ 地支相绝关系
 * 子巳绝，卯申绝，午亥绝，酉寅绝，戌卯绝，丑午绝，辰酉绝，未子绝
 */
const BRANCH_DESTROY_MAP: Record<string, BranchDestroyType> = {
  '子巳': '子巳绝', '巳子': '子巳绝',
  '卯申': '卯申绝', '申卯': '卯申绝', 
  '午亥': '午亥绝', '亥午': '午亥绝',
  '酉寅': '酉寅绝', '寅酉': '酉寅绝',
  '戌卯': '戌卯绝', '卯戌': '戌卯绝',
  '丑午': '丑午绝', '午丑': '丑午绝',
  '辰酉': '辰酉绝', '酉辰': '辰酉绝',
  '未子': '未子绝', '子未': '未子绝'
};

/**
 * 🔢 数值索引算法 - 天干相冲计算
 * 甲(0) + 6 = 庚(6) % 10，天干相冲规律：+6或-4 (mod 10)
 */
function getStemClash(stem: StemName): StemName {
  const index = STEM_INDEX_MAP[stem];
  const clashIndex = (index + 6) % 10;
  return INDEX_TO_STEM[clashIndex];
}

/**
 * 🔢 数值索引算法 - 地支相冲计算  
 * 子(0) + 6 = 午(6) % 12，地支相冲规律：+6 (mod 12)
 */
function getBranchClash(branch: BranchName): BranchName {
  const index = BRANCH_INDEX_MAP[branch];
  const clashIndex = (index + 6) % 12;
  return INDEX_TO_BRANCH[clashIndex];
}

/**
 * 🔢 数值索引算法 - 天干五合计算
 * 甲己合：甲(0) + 己(5) = 5，乙庚合：乙(1) + 庚(6) = 7
 * 规律：相合的两干索引之和为5或7 (甲己=5, 乙庚=7, 丙辛=9, 丁壬=11, 戊癸=13)
 */
function getStemCombination(stem1: StemName, stem2: StemName): StemCombinationType | null {
  const index1 = STEM_INDEX_MAP[stem1];
  const index2 = STEM_INDEX_MAP[stem2];
  const sum = index1 + index2;
  
  const combinationMap: Record<number, StemCombinationType> = {
    5: '甲己合',   // 甲(0) + 己(5) = 5
    7: '乙庚合',   // 乙(1) + 庚(6) = 7
    9: '丙辛合',   // 丙(2) + 辛(7) = 9
    11: '丁壬合',  // 丁(3) + 壬(8) = 11
    13: '戊癸合'   // 戊(4) + 癸(9) = 13
  };
  
  return combinationMap[sum] || null;
}

/**
 * 🔢 数值索引算法 - 地支六合计算
 * 子丑合：子(0) + 丑(1) = 1，规律：相邻或特定组合
 */
function getBranchSixCombination(branch1: BranchName, branch2: BranchName): BranchCombinationType | null {
  const index1 = BRANCH_INDEX_MAP[branch1];
  const index2 = BRANCH_INDEX_MAP[branch2];
  
  // 六合规律：子丑(0,1), 寅亥(2,11), 卯戌(3,10), 辰酉(4,9), 巳申(5,8), 午未(6,7)
  const combinations: Record<string, BranchCombinationType> = {
    '0,1': '子丑合', '1,0': '子丑合',
    '2,11': '寅亥合', '11,2': '寅亥合', 
    '3,10': '卯戌合', '10,3': '卯戌合',
    '4,9': '辰酉合', '9,4': '辰酉合',
    '5,8': '巳申合', '8,5': '巳申合',
    '6,7': '午未合', '7,6': '午未合'
  };
  
  const key = `${index1},${index2}`;
  return combinations[key] || null;
}

/**
 * 🔢 数值索引算法验证函数
 * 验证天干地支相冲和合化关系的数值规律
 */
function validateNumericalRelationships() {
  console.log('🔢 数值索引算法验证:');
  console.log('━'.repeat(30));
  
  // 验证天干相冲
  console.log('天干相冲验证:');
  ['甲', '乙', '丙', '丁', '戊'].forEach(stem => {
    const clash = getStemClash(stem as StemName);
    console.log(`  ${stem}(${STEM_INDEX_MAP[stem as StemName]}) 冲 ${clash}(${STEM_INDEX_MAP[clash]})`);
  });
  
  // 验证地支相冲  
  console.log('\n地支相冲验证:');
  ['子', '丑', '寅', '卯', '辰', '巳'].forEach(branch => {
    const clash = getBranchClash(branch as BranchName);
    console.log(`  ${branch}(${BRANCH_INDEX_MAP[branch as BranchName]}) 冲 ${clash}(${BRANCH_INDEX_MAP[clash]})`);
  });
  
  // 验证天干五合
  console.log('\n天干五合验证:');
  const stemPairs = [['甲', '己'], ['乙', '庚'], ['丙', '辛'], ['丁', '壬'], ['戊', '癸']];
  stemPairs.forEach(([stem1, stem2]) => {
    const combination = getStemCombination(stem1 as StemName, stem2 as StemName);
    const sum = STEM_INDEX_MAP[stem1 as StemName] + STEM_INDEX_MAP[stem2 as StemName];
    console.log(`  ${stem1}${stem2}: ${combination} (索引和=${sum})`);
  });
}

// 使用已有的地支藏干表 EARTHLY_BRANCH_HIDDEN_STEMS

/**
 * 🔧 检查地支暗合关系 - Check Hidden Stem Combinations in Branches
 * 分析两个地支的藏干是否存在五合关系
 */
function checkBranchHiddenCombination(branch1: BranchName, branch2: BranchName): { 
  description: string; 
  combination: StemCombinationType;
  stem1: StemName;
  stem2: StemName;
} | null {
  const hiddenStems1 = EARTHLY_BRANCH_HIDDEN_STEMS[branch1];
  const hiddenStems2 = EARTHLY_BRANCH_HIDDEN_STEMS[branch2];
  
  // 检查所有藏干组合是否存在五合关系
  for (const stem1 of hiddenStems1) {
    for (const stem2 of hiddenStems2) {
      const combination = getStemCombination(stem1, stem2);
      if (combination) {
        return {
          description: `${branch1}中${stem1}与${branch2}中${stem2}暗合`,
          combination,
          stem1,
          stem2
        };
      }
    }
  }
  
  return null;
}

/**
 * 🔧 检查同柱干支暗合 - Check Stem-Branch Hidden Combination in Same Pillar
 * 检查同一柱中天干与地支藏干的合化关系  
 */
function checkSamePillarHiddenCombination(stem: StemName, branch: BranchName): {
  description: string;
  combination: StemCombinationType; 
  hiddenStem: StemName;
} | null {
  const hiddenStems = EARTHLY_BRANCH_HIDDEN_STEMS[branch];
  
  // 检查天干与地支藏干的五合关系
  for (const hiddenStem of hiddenStems) {
    const combination = getStemCombination(stem, hiddenStem);
    if (combination) {
      return {
        description: `${stem}与${branch}中${hiddenStem}暗合`,
        combination,
        hiddenStem
      };
    }
  }
  
  return null;
}

/**
 * 🔧 魁罡神煞常量表 - KuiGang ShenSha Constants
 * 魁罡的四个特定日柱干支组合
 */
const KUIGANG_COMBINATIONS: Record<string, { type: KuiGangType; subType: KuiGangSubType }> = {
  '庚辰': { type: '庚辰', subType: '绝夫罡' },
  '壬辰': { type: '壬辰', subType: '绝妻罡' },
  '戊戌': { type: '戊戌', subType: '绝妻罡' },
  '庚戌': { type: '庚戌', subType: '绝夫罡' }
};

/**
 * 🔧 检查魁罡神煞 - Check KuiGang ShenSha
 * 检查指定柱是否为魁罡，并进行详细分析
 */
function checkKuiGang(
  stem: StemName, 
  branch: BranchName, 
  pillarType: 'day' | 'year' | 'month' | 'hour',
  fourPillars: FourPillars,
  gender: 'male' | 'female'
): { isKuiGang: boolean; kuiGangInfo?: KuiGangInfo } {
  const ganZhi = `${stem}${branch}`;
  const kuiGangData = KUIGANG_COMBINATIONS[ganZhi];
  
  if (!kuiGangData) {
    return { isKuiGang: false };
  }
  
  // 进行详细的魁罡分析
  const analysis = analyzeKuiGangQuality(kuiGangData.type, pillarType, fourPillars, gender);
  
  return {
    isKuiGang: true,
    kuiGangInfo: {
      type: kuiGangData.type,
      subType: kuiGangData.subType,
      pillarType,
      strength: pillarType === 'day' ? 'primary' : 'secondary',
      isPositive: analysis.isPositive,
      analysis: analysis,
      description: generateKuiGangDescription(kuiGangData, pillarType, analysis),
      effect: generateKuiGangEffect(kuiGangData, analysis),
      advice: generateKuiGangAdvice(kuiGangData, analysis, gender)
    }
  };
}

/**
 * 🔧 分析魁罡品质 - Analyze KuiGang Quality
 * 根据八字整体格局判断魁罡的吉凶
 */
function analyzeKuiGangQuality(
  kuiGangType: KuiGangType,
  pillarType: 'day' | 'year' | 'month' | 'hour',
  fourPillars: FourPillars,
  gender: 'male' | 'female'
): {
  hasBreakage: boolean;
  hasClash: boolean;
  supportCount: number;
  breakageFactors: string[];
  supportFactors: string[];
  isPositive: boolean;
} {
  const breakageFactors: string[] = [];
  const supportFactors: string[] = [];
  let hasBreakage = false;
  let hasClash = false;
  
  const pillars = [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour];
  
  // 1. 检查财官破格 (最关键的破格因素)
  const dayMasterStem = fourPillars.day.stem;
  const dayMasterElement = getStemElement(dayMasterStem);
  
  pillars.forEach((pillar, index) => {
    const pillarName = ['年', '月', '日', '时'][index];
    const pillarStemElement = getStemElement(pillar.stem);
    const pillarBranchElement = getBranchElement(pillar.branch);
    
    // 检查财星 (日主克者)
    const elementRelations: Record<ElementName, { generates: ElementName; destroys: ElementName }> = {
      '木': { generates: '火', destroys: '土' },
      '火': { generates: '土', destroys: '金' },
      '土': { generates: '金', destroys: '水' },
      '金': { generates: '水', destroys: '木' },
      '水': { generates: '木', destroys: '火' }
    };
    
    // 财星判断 (日主克的五行)
    if (elementRelations[dayMasterElement].destroys === pillarStemElement) {
      breakageFactors.push(`${pillarName}柱天干${pillar.stem}为财星`);
      hasBreakage = true;
    }
    if (elementRelations[dayMasterElement].destroys === pillarBranchElement) {
      breakageFactors.push(`${pillarName}柱地支${pillar.branch}为财星`);
      hasBreakage = true;
    }
    
    // 官星判断 (克日主的五行)
    if (elementRelations[pillarStemElement]?.destroys === dayMasterElement) {
      breakageFactors.push(`${pillarName}柱天干${pillar.stem}为官星`);
      hasBreakage = true;
    }
    if (elementRelations[pillarBranchElement]?.destroys === dayMasterElement) {
      breakageFactors.push(`${pillarName}柱地支${pillar.branch}为官星`);
      hasBreakage = true;
    }
  });
  
  // 2. 检查刑冲破格
  const kuiGangBranch = kuiGangType.slice(1) as BranchName; // 提取地支 (辰或戌)
  
  pillars.forEach((pillar, index) => {
    const pillarName = ['年', '月', '日', '时'][index];
    
    // 辰戌相冲
    if ((kuiGangBranch === '辰' && pillar.branch === '戌') || 
        (kuiGangBranch === '戌' && pillar.branch === '辰')) {
      breakageFactors.push(`${pillarName}柱${pillar.branch}与魁罡${kuiGangBranch}相冲`);
      hasClash = true;
      hasBreakage = true;
    }
    
    // 丑未刑辰戌
    if ((kuiGangBranch === '辰' && (pillar.branch === '丑' || pillar.branch === '未')) ||
        (kuiGangBranch === '戌' && (pillar.branch === '丑' || pillar.branch === '未'))) {
      breakageFactors.push(`${pillarName}柱${pillar.branch}刑魁罡${kuiGangBranch}`);
      hasClash = true;
      hasBreakage = true;
    }
  });
  
  // 3. 检查支撑因素
  
  // 3.1 叠见魁罡
  let kuiGangCount = 0;
  pillars.forEach((pillar, index) => {
    const ganZhi = `${pillar.stem}${pillar.branch}`;
    if (KUIGANG_COMBINATIONS[ganZhi]) {
      kuiGangCount++;
      if (index !== pillars.findIndex(p => p === fourPillars.day)) { // 不重复计算日柱
        supportFactors.push(`${['年', '月', '日', '时'][index]}柱叠见魁罡${ganZhi}`);
      }
    }
  });
  if (kuiGangCount > 1) {
    supportFactors.push(`命中叠见${kuiGangCount}个魁罡，力量倍增`);
  }
  
  // 3.2 日主身旺 (简化判断 - 实际需要复杂的身旺身弱分析)
  let dayMasterStrengthFactors = 0;
  pillars.forEach(pillar => {
    if (getStemElement(pillar.stem) === dayMasterElement) {
      dayMasterStrengthFactors++;
    }
    if (getBranchElement(pillar.branch) === dayMasterElement) {
      dayMasterStrengthFactors++;
    }
  });
  
  if (dayMasterStrengthFactors >= 3) {
    supportFactors.push(`日主${dayMasterStem}身旺，能承受魁罡之力`);
  } else if (dayMasterStrengthFactors <= 1) {
    breakageFactors.push(`日主${dayMasterStem}身弱，难承魁罡之力`);
    hasBreakage = true;
  }
  
  // 3.3 无财官混杂
  if (breakageFactors.filter(f => f.includes('财星') || f.includes('官星')).length === 0) {
    supportFactors.push('八字无财官星破格，魁罡纯清');
  }
  
  // 综合判断吉凶
  const supportCount = supportFactors.length;
  const isPositive = !hasBreakage && supportCount > 0;
  
  return {
    hasBreakage,
    hasClash,
    supportCount,
    breakageFactors,
    supportFactors,
    isPositive
  };
}

/**
 * 🔧 生成魁罡描述 - Generate KuiGang Description
 */
function generateKuiGangDescription(
  kuiGangData: { type: KuiGangType; subType: KuiGangSubType },
  pillarType: string,
  analysis: any
): string {
  const pillarNames = { day: '日', year: '年', month: '月', hour: '时' };
  const pillarName = pillarNames[pillarType as keyof typeof pillarNames];
  
  let desc = `${pillarName}柱见魁罡${kuiGangData.type}，${kuiGangData.subType}`;
  
  if (pillarType === 'day') {
    desc += '，为正格魁罡，影响力最强';
  } else {
    desc += '，为偏格魁罡，影响力次之';
  }
  
  if (analysis.isPositive) {
    desc += '。格局纯清，主聪明果决，有威权';
  } else {
    desc += '。格局被破，主性格刚愎，易有波折';
  }
  
  return desc;
}

/**
 * 🔧 生成魁罡效果 - Generate KuiGang Effect
 */
function generateKuiGangEffect(
  kuiGangData: { type: KuiGangType; subType: KuiGangSubType },
  analysis: any
): string {
  if (analysis.isPositive) {
    return '头脑清晰，思维敏捷，有强烈的领导才能和决断力。性格刚毅果决，不畏艰难，有开拓精神。富有正义感，口才出众。若格局得当，能掌大权，成就非凡。';
  } else {
    return '性格过于刚硬，固执己见，容易与人发生冲突。脾气暴躁，攻击性强。婚姻感情不顺，人生起落较大。一旦运势走低，容易遭遇重大挫折。';
  }
}

/**
 * 🔧 生成魁罡建议 - Generate KuiGang Advice
 */
function generateKuiGangAdvice(
  kuiGangData: { type: KuiGangType; subType: KuiGangSubType },
  analysis: any,
  gender: 'male' | 'female'
): string {
  let advice = '';
  
  if (analysis.isPositive) {
    advice = '魁罡格局纯清，宜发挥领导才能，从事管理、军警、法律等需要决断力的职业。';
  } else {
    advice = '魁罡格局被破，需修身养性，控制脾气。避免与人正面冲突，';
    
    if (analysis.hasBreakage) {
      advice += '忌贪财求官，宜专心技艺。';
    }
    
    if (analysis.hasClash) {
      advice += '注意辰戌丑未年份，防刑冲引发意外。';
    }
  }
  
  // 根据绝夫罡/绝妻罡给出婚姻建议
  if (kuiGangData.subType === '绝夫罡' && gender === 'female') {
    advice += '女命见绝夫罡，宜晚婚，婚后需学会柔顺，与夫协调。';
  } else if (kuiGangData.subType === '绝妻罡' && gender === 'male') {
    advice += '男命见绝妻罡，择偶宜选性格温柔者，婚后需多体贴妻子。';
  }
  
  return advice;
}

/**
 * 🌟 分析天干关系 - Stem Relationship Analysis
 * 分析两个天干之间的五行生克和合化关系
 */
function analyzeStemRelationship(stem1: StemName, stem2: StemName): StemRelationship {
  // 1. 检查是否为五合关系
  const combination = getStemCombination(stem1, stem2);
  if (combination) {
    return {
      stem1,
      stem2, 
      relationType: '合',
      combinationType: combination,
      description: `${stem1}与${stem2}相合化土`,
      isPositive: true,
      strength: 'strong'
    };
  }
  
  // 2. 检查是否为相冲关系  
  const stem1Clash = getStemClash(stem1);
  if (stem1Clash === stem2) {
    return {
      stem1,
      stem2,
      relationType: '相克',
      description: `${stem1}与${stem2}相冲对立`,
      isPositive: false,
      strength: 'strong'
    };
  }
  
  // 3. 分析五行生克关系
  const stem1Element = getStemElement(stem1);
  const stem2Element = getStemElement(stem2);
  
  // 生克关系表
  const elementRelations: Record<ElementName, { generates: ElementName; destroys: ElementName }> = {
    '木': { generates: '火', destroys: '土' },
    '火': { generates: '土', destroys: '金' },
    '土': { generates: '金', destroys: '水' },
    '金': { generates: '水', destroys: '木' },
    '水': { generates: '木', destroys: '火' }
  };
  
  if (elementRelations[stem1Element].generates === stem2Element) {
    return {
      stem1,
      stem2,
      relationType: '相生',
      description: `${stem1}(${stem1Element})生${stem2}(${stem2Element})`,
      isPositive: true,
      strength: 'medium'
    };
  }
  
  if (elementRelations[stem1Element].destroys === stem2Element) {
    return {
      stem1,
      stem2,
      relationType: '相克',
      description: `${stem1}(${stem1Element})克${stem2}(${stem2Element})`,
      isPositive: false,
      strength: 'medium'
    };
  }
  
  // 4. 同类关系
  if (stem1Element === stem2Element) {
    return {
      stem1,
      stem2,
      relationType: '无关系',
      description: `${stem1}与${stem2}同为${stem1Element}，关系平和`,
      isPositive: true,
      strength: 'weak'
    };
  }
  
  // 5. 其他关系
  return {
    stem1,
    stem2,
    relationType: '无关系',
    description: `${stem1}与${stem2}无特殊关系`,
    isPositive: true,
    strength: 'weak'
  };
}

/**
 * 🌟 分析地支关系 - Branch Relationship Analysis  
 * 分析两个地支之间的冲合刑穿破绝关系
 */
function analyzeBranchRelationship(branch1: BranchName, branch2: BranchName): BranchRelationship {
  // 1. 检查六合关系
  const sixCombination = getBranchSixCombination(branch1, branch2);
  if (sixCombination) {
    return {
      branch1,
      branch2,
      relationType: '六合',
      combinationType: sixCombination,
      description: `${branch1}与${branch2}六合，关系和谐`,
      isPositive: true,
      strength: 'strong',
      effect: '增强彼此力量，带来和谐与合作'
    };
  }
  
  // 2. 检查相冲关系
  const branch1Clash = getBranchClash(branch1);
  if (branch1Clash === branch2) {
    const clashType = `${branch1}${branch2}冲` as BranchClashType;
    return {
      branch1,
      branch2,
      relationType: '相冲',
      clashType,
      description: `${branch1}与${branch2}相冲对立`,
      isPositive: false,
      strength: 'strong',
      effect: '产生冲突和变动，易有波折'
    };
  }
  
  // 3. 检查三合关系
  const triCombinations: Record<string, BranchCombinationType> = {
    '申子辰': '申子辰合',
    '子辰申': '申子辰合',
    '辰申子': '申子辰合',
    '亥卯未': '亥卯未合', 
    '卯未亥': '亥卯未合',
    '未亥卯': '亥卯未合',
    '寅午戌': '寅午戌合',
    '午戌寅': '寅午戌合',
    '戌寅午': '寅午戌合',
    '巳酉丑': '巳酉丑合',
    '酉丑巳': '巳酉丑合',
    '丑巳酉': '巳酉丑合'
  };
  
  // 检查三合的所有可能组合
  for (const [combination, type] of Object.entries(triCombinations)) {
    if (combination.includes(branch1) && combination.includes(branch2)) {
      return {
        branch1,
        branch2,
        relationType: '三合',
        combinationType: type,
        description: `${branch1}与${branch2}为三合局的一部分`,
        isPositive: true,
        strength: 'strong',
        effect: '形成强力合作关系，增强五行力量'
      };
    }
  }
  
  // 3.5. 检查半合关系 (三合的2/3组合)
  const halfCombinations: Record<string, BranchCombinationType> = {
    // 申子辰合的半合
    '申子': '申子半合', '子申': '申子半合',
    '子辰': '子辰半合', '辰子': '子辰半合',
    '申辰': '申子半合', '辰申': '申子半合', // 申辰为申子辰的拱合
    // 亥卯未合的半合  
    '亥卯': '亥卯半合', '卯亥': '亥卯半合',
    '卯未': '卯未半合', '未卯': '卯未半合',
    '亥未': '亥卯半合', '未亥': '亥卯半合', // 亥未为亥卯未的拱合
    // 寅午戌合的半合
    '寅午': '寅午半合', '午寅': '寅午半合',
    '午戌': '午戌半合', '戌午': '午戌半合',  
    '寅戌': '寅午半合', '戌寅': '寅午半合', // 寅戌为寅午戌的拱合
    // 巳酉丑合的半合
    '巳酉': '巳酉半合', '酉巳': '巳酉半合',
    '酉丑': '酉丑半合', '丑酉': '酉丑半合',
    '巳丑': '巳酉半合', '丑巳': '巳酉半合'  // 巳丑为巳酉丑的拱合
  };
  
  const halfCombinationKey = `${branch1}${branch2}`;
  if (halfCombinations[halfCombinationKey]) {
    return {
      branch1,
      branch2,
      relationType: '半合',
      combinationType: halfCombinations[halfCombinationKey],
      description: `${branch1}与${branch2}半合，关系友好`,
      isPositive: true,
      strength: 'medium',
      effect: '形成部分合作关系，增强部分力量'
    };
  }
  
  // 4. 检查相刑关系
  const punishmentCombinations = [
    ['子', '卯'], ['卯', '子'], // 子卯刑
    ['寅', '巳'], ['巳', '申'], ['申', '寅'], // 寅巳申刑
    ['丑', '戌'], ['戌', '未'], ['未', '丑'], // 丑戌未刑
    ['辰', '午'], ['午', '酉'], ['酉', '亥'], ['亥', '辰'] // 辰午酉亥自刑
  ];
  
  for (const [b1, b2] of punishmentCombinations) {
    if ((branch1 === b1 && branch2 === b2) || (branch1 === b2 && branch2 === b1)) {
      let punishmentType: BranchPunishmentType;
      if ([branch1, branch2].includes('子') && [branch1, branch2].includes('卯')) {
        punishmentType = '子卯刑';
      } else if ([branch1, branch2].some(b => ['寅', '巳', '申'].includes(b))) {
        punishmentType = '寅巳申刑';
      } else if ([branch1, branch2].some(b => ['丑', '戌', '未'].includes(b))) {
        punishmentType = '丑戌未刑';
      } else {
        punishmentType = '辰午酉亥刑';
      }
      
      return {
        branch1,
        branch2,
        relationType: '相刑',
        punishmentType,
        description: `${branch1}与${branch2}相刑，有刑伤之忧`,
        isPositive: false,
        strength: 'medium',
        effect: '带来刑伤和麻烦，需要谨慎小心'
      };
    }
  }
  
  // 5. 检查相穿关系
  const harmPairs = [
    ['子', '未'], ['丑', '午'], ['寅', '巳'], 
    ['卯', '辰'], ['申', '亥'], ['酉', '戌']
  ];
  
  for (const [b1, b2] of harmPairs) {
    if ((branch1 === b1 && branch2 === b2) || (branch1 === b2 && branch2 === b1)) {
      const harmType = `${b1}${b2}穿` as BranchHarmType;
      return {
        branch1,
        branch2,
        relationType: '相穿',
        harmType,
        description: `${branch1}与${branch2}相穿，暗中伤害`,
        isPositive: false,
        strength: 'medium',
        effect: '暗中损伤，影响健康和感情'
      };
    }
  }
  
  // 6. 检查相破关系
  const breakPairs = [
    ['子', '酉'], ['午', '卯'], ['寅', '亥'],
    ['申', '巳'], ['辰', '丑'], ['戌', '未']
  ];
  
  for (const [b1, b2] of breakPairs) {
    if ((branch1 === b1 && branch2 === b2) || (branch1 === b2 && branch2 === b1)) {
      const breakType = `${b1}${b2}破` as BranchBreakType;
      return {
        branch1,
        branch2,
        relationType: '相破',
        breakType,
        description: `${branch1}与${branch2}相破，破坏力量`,
        isPositive: false,
        strength: 'weak',
        effect: '削弱力量，破坏和谐'
      };
    }
  }
  
  // 7. 检查五行生克关系
  const branch1Element = getBranchElement(branch1);
  const branch2Element = getBranchElement(branch2);
  
  const elementRelations: Record<ElementName, { generates: ElementName; destroys: ElementName }> = {
    '木': { generates: '火', destroys: '土' },
    '火': { generates: '土', destroys: '金' },
    '土': { generates: '金', destroys: '水' },
    '金': { generates: '水', destroys: '木' },
    '水': { generates: '木', destroys: '火' }
  };
  
  if (elementRelations[branch1Element].generates === branch2Element) {
    return {
      branch1,
      branch2,
      relationType: '相生',
      description: `${branch1}(${branch1Element})生${branch2}(${branch2Element})`,
      isPositive: true,
      strength: 'weak',
      effect: '相互支持，增强力量'
    };
  }
  
  if (elementRelations[branch1Element].destroys === branch2Element) {
    return {
      branch1,
      branch2,
      relationType: '相克',
      description: `${branch1}(${branch1Element})克${branch2}(${branch2Element})`,
      isPositive: false,
      strength: 'weak',
      effect: '相互制约，削弱力量'
    };
  }
  
  // 8. 检查地支暗合关系 (藏干五合)
  const hiddenStemCombination = checkBranchHiddenCombination(branch1, branch2);
  if (hiddenStemCombination) {
    return {
      branch1,
      branch2,
      relationType: '六合',
      description: `${branch1}与${branch2}暗合 (${hiddenStemCombination.description})`,
      isPositive: true,
      strength: 'medium',
      effect: '暗中相助，潜在的合作关系'
    };
  }
  
  // 9. 无特殊关系
  return {
    branch1,
    branch2,
    relationType: '无关系',
    description: `${branch1}与${branch2}无特殊关系`,
    isPositive: true,
    strength: 'weak',
    effect: '关系平和，影响较小'
  };
}

/**
 * 🌟 综合关系分析 - Complete Relationship Analysis
 * 分析四柱中所有天干地支的相互关系
 */
function analyzeRelationships(fourPillars: FourPillars): RelationshipAnalysis {
  const stemRelationships: StemRelationship[] = [];
  const branchRelationships: BranchRelationship[] = [];
  
  const pillars = [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour];
  
  // 分析所有天干之间的关系
  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const stemRelation = analyzeStemRelationship(pillars[i].stem, pillars[j].stem);
      if (stemRelation.relationType !== '无关系' || stemRelation.strength !== 'weak') {
        stemRelationships.push(stemRelation);
      }
    }
  }
  
  // 分析所有地支之间的关系  
  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const branchRelation = analyzeBranchRelationship(pillars[i].branch, pillars[j].branch);
      if (branchRelation.relationType !== '无关系' || branchRelation.strength !== 'weak') {
        branchRelationships.push(branchRelation);
      }
    }
  }
  
  // 提取特殊关系
  const stemCombinations = stemRelationships.filter(r => r.relationType === '合');
  const branchCombinations = branchRelationships.filter(r => 
    r.relationType === '六合' || r.relationType === '三合' || r.relationType === '三会'
  );
  const branchClashes = branchRelationships.filter(r => 
    ['相冲', '相刑', '相穿', '相破', '相绝'].includes(r.relationType)
  );
  
  // 统计关系类型
  const positiveRelationships = [...stemRelationships, ...branchRelationships]
    .filter(r => r.isPositive).length;
  const negativeRelationships = [...stemRelationships, ...branchRelationships]
    .filter(r => !r.isPositive).length;
  const neutralRelationships = [...stemRelationships, ...branchRelationships].length 
    - positiveRelationships - negativeRelationships;
  
  // 强关系
  const strongRelationships = branchRelationships.filter(r => r.strength === 'strong');
  
  // 计算关系分数 (0-100)
  const relationshipScore = Math.min(100, Math.max(0, 
    50 + (positiveRelationships * 10) - (negativeRelationships * 15)
  ));
  
  // 整体和谐度评价
  let overallHarmony: 'excellent' | 'good' | 'average' | 'poor' | 'terrible';
  if (relationshipScore >= 85) overallHarmony = 'excellent';
  else if (relationshipScore >= 70) overallHarmony = 'good';
  else if (relationshipScore >= 50) overallHarmony = 'average';
  else if (relationshipScore >= 30) overallHarmony = 'poor';
  else overallHarmony = 'terrible';
  
  // 生成总结
  const summary = `四柱关系分析：共发现${stemRelationships.length + branchRelationships.length}组关系，` +
    `其中正面关系${positiveRelationships}个，负面关系${negativeRelationships}个。` +
    `整体关系${overallHarmony}，适合${relationshipScore >= 70 ? '积极发展' : '稳健保守'}。`;
  
  return {
    stemRelationships,
    stemCombinations,
    branchRelationships,
    branchCombinations, 
    branchClashes,
    positiveRelationships,
    negativeRelationships,
    neutralRelationships,
    strongRelationships,
    overallHarmony,
    relationshipScore,
    summary
  };
}

/**
 * 🔧 十神全称转简体 (辅助函数)
 * 将十神全称转换为简体字符
 */
function convertTenGodToSimplified(tenGod: TenGodType): TenGodSimplified {
  const conversionTable: Record<TenGodType, TenGodSimplified> = {
    '比肩': '比',
    '劫财': '劫', 
    '食神': '食',
    '伤官': '伤',
    '偏财': '才', // 注意：偏财简体为"才"而非"财"
    '正财': '财',
    '七杀': '杀',
    '正官': '官',
    '偏印': '枭',
    '正印': '印'
  };
  
  return conversionTable[tenGod];
}

/**
 * 🔧 获取地支特殊属性
 * @param branch 地支
 * @returns 特殊属性数组
 */
function getBranchAttributes(stem: StemName, branch: BranchName): SpecialBranchAttribute[] {
  const attributes: SpecialBranchAttribute[] = [];
  
  // 检查桃花
  if (PEACH_BLOSSOM_BRANCHES.includes(branch)) {
    attributes.push('桃花');
  }
  
  // 检查驿马
  if (POST_HORSE_BRANCHES.includes(branch)) {
    attributes.push('驿马');
  }
  
  // 检查墓库
  if (branch in TOMB_STORAGE_BRANCHES) {
    attributes.push(TOMB_STORAGE_BRANCHES[branch] as SpecialBranchAttribute);
  }
  
  // 🆕 检查羊刃 (五阳干专用)
  const yangStems: StemName[] = ['甲', '丙', '戊', '庚', '壬'];
  if (yangStems.includes(stem) && YANG_BLADE_MAP[stem] === branch) {
    attributes.push('羊刃');
  }
  
  // 🆕 检查帝旺 (五阴干专用)
  const yinStems: StemName[] = ['乙', '丁', '己', '辛', '癸'];
  if (yinStems.includes(stem) && EMPEROR_PROSPERITY_MAP[stem] === branch) {
    attributes.push('帝旺');
  }
  
  return attributes;
}

/**
 * 🔧 检查是否为禄神
 * @param stem 天干
 * @param branch 地支
 * @returns 禄神信息
 */
function checkLuShen(stem: StemName, branch: BranchName): { isLuShen: boolean; luShenInfo?: LuShen } {
  const luBranch = LU_SHEN_MAP[stem];
  
  if (luBranch === branch) {
    return {
      isLuShen: true,
      luShenInfo: {
        stem,
        branch,
        description: `${stem}禄在${branch}`
      }
    };
  }
  
  return { isLuShen: false };
}

/**
 * ⚔️ 检查羊刃 (五阳干专用)
 * 甲丙戊庚壬日见对应地支为羊刃
 */
function checkYangBlade(stem: StemName, branch: BranchName): { isYangBlade: boolean; yangBladeInfo?: YangBlade } {
  // 只检查阳干
  const yangStems: StemName[] = ['甲', '丙', '戊', '庚', '壬'];
  if (!yangStems.includes(stem)) {
    return { isYangBlade: false };
  }
  
  const bladeBranch = YANG_BLADE_MAP[stem];
  if (bladeBranch && branch === bladeBranch) {
    return {
      isYangBlade: true,
      yangBladeInfo: {
        stem,
        branch: bladeBranch,
        description: `${stem}羊刃在${bladeBranch}`
      }
    };
  }
  
  return { isYangBlade: false };
}

/**
 * 👑 检查帝旺 (五阴干专用)
 * 乙丁己辛癸日见对应地支为帝旺
 */
function checkEmperorProsperity(stem: StemName, branch: BranchName): { isEmperorProsperity: boolean; emperorProsperityInfo?: EmperorProsperity } {
  // 只检查阴干
  const yinStems: StemName[] = ['乙', '丁', '己', '辛', '癸'];
  if (!yinStems.includes(stem)) {
    return { isEmperorProsperity: false };
  }
  
  const prosperityBranch = EMPEROR_PROSPERITY_MAP[stem];
  if (prosperityBranch && branch === prosperityBranch) {
    return {
      isEmperorProsperity: true,
      emperorProsperityInfo: {
        stem,
        branch: prosperityBranch,
        description: `${stem}帝旺在${prosperityBranch}`
      }
    };
  }
  
  return { isEmperorProsperity: false };
}

/**
 * 🔧 获取时间组件 (Step 1)
 * 基于 tyme4ts 获取标准化的时间对象
 */
function getTimeComponents(input: BaziCalculationInput) {
  let solarDay: SolarDay;
  let lunarDay: LunarDay;
  
  if (input.isLunar) {
    // 农历输入，转换为公历
    lunarDay = LunarDay.fromYmd(input.year, input.month, input.day);
    solarDay = lunarDay.getSolarDay();
  } else {
    // 公历输入，转换为农历
    solarDay = SolarDay.fromYmd(input.year, input.month, input.day);
    lunarDay = solarDay.getLunarDay();
  }
  
  // 获取时辰
  const hours = lunarDay.getHours();
  const targetHour = hours.find(h => h.getHour() === input.hour) || hours[0];
  
  return { solarDay, lunarDay, targetHour };
}

/**
 * 🏛️ 计算四柱八字 (Step 2)
 * 使用 tyme4ts 的标准算法，可选计算藏干
 */
function calculateFourPillars(
  _solarDay: SolarDay, 
  _lunarDay: LunarDay, 
  targetHour: any,
  includeHiddenStems: boolean = false,
  gender: 'male' | 'female' = 'male'
): FourPillars {
  const eightChar = targetHour.getEightChar();
  
  const createPair = (sixtyCycle: any): StemBranchPair => {
    const stem = sixtyCycle.getHeavenStem().toString() as StemName;
    const branch = sixtyCycle.getEarthBranch().toString() as BranchName;
    
    const pair: StemBranchPair = {
      stem,
      branch,
      ganZhi: sixtyCycle.toString()
    };
    
    // 可选：添加藏干信息
    if (includeHiddenStems) {
      pair.hiddenStems = EARTHLY_BRANCH_HIDDEN_STEMS[branch] || [];
      pair.primaryQi = EARTHLY_BRANCH_PRIMARY_QI[branch];
    }
    
    // 🆕 添加传统命理属性
    pair.branchAttributes = getBranchAttributes(stem, branch);
    
    // 🆕 检查禄神
    const luShenResult = checkLuShen(stem, branch);
    pair.isLuShen = luShenResult.isLuShen;
    if (luShenResult.luShenInfo) {
      pair.luShenInfo = luShenResult.luShenInfo;
    }
    
    // 🆕 检查羊刃 (五阳干)
    const yangBladeResult = checkYangBlade(stem, branch);
    pair.isYangBlade = yangBladeResult.isYangBlade;
    if (yangBladeResult.yangBladeInfo) {
      pair.yangBladeInfo = yangBladeResult.yangBladeInfo;
    }
    
    // 🆕 检查帝旺 (五阴干)  
    const emperorResult = checkEmperorProsperity(stem, branch);
    pair.isEmperorProsperity = emperorResult.isEmperorProsperity;
    if (emperorResult.emperorProsperityInfo) {
      pair.emperorProsperityInfo = emperorResult.emperorProsperityInfo;
    }
    
    // 🆕 检查同柱暗合
    const samePillarCombination = checkSamePillarHiddenCombination(stem, branch);
    if (samePillarCombination) {
      pair.samePillarHiddenCombination = {
        stem,
        hiddenStem: samePillarCombination.hiddenStem,
        combination: samePillarCombination.combination,
        description: samePillarCombination.description
      };
    }
    
    return pair;
  };
  
  // 创建四柱
  const fourPillars = {
    year: createPair(eightChar.getYear()),
    month: createPair(eightChar.getMonth()),
    day: createPair(eightChar.getDay()),
    hour: createPair(eightChar.getHour())
  };
  
  // 🆕 添加魁罡分析 - 需要完整四柱信息
  addKuiGangAnalysis(fourPillars, gender);
  
  return fourPillars;
}

/**
 * 🆕 添加魁罡分析到四柱中
 * @param fourPillars 四柱对象
 * @param gender 性别
 */
function addKuiGangAnalysis(fourPillars: FourPillars, gender: 'male' | 'female'): void {
  // 检查日柱魁罡（最重要）
  const dayKuiGangResult = checkKuiGang(
    fourPillars.day.stem, 
    fourPillars.day.branch, 
    'day', 
    fourPillars, 
    gender
  );
  
  if (dayKuiGangResult.isKuiGang) {
    fourPillars.day.isKuiGang = true;
    fourPillars.day.kuiGangInfo = dayKuiGangResult.kuiGangInfo;
  }
  
  // 检查年柱魁罡（次要影响）
  const yearKuiGangResult = checkKuiGang(
    fourPillars.year.stem, 
    fourPillars.year.branch, 
    'year', 
    fourPillars, 
    gender
  );
  
  if (yearKuiGangResult.isKuiGang) {
    fourPillars.year.isKuiGang = true;
    fourPillars.year.kuiGangInfo = yearKuiGangResult.kuiGangInfo;
  }
  
  // 检查月柱魁罡（次要影响）
  const monthKuiGangResult = checkKuiGang(
    fourPillars.month.stem, 
    fourPillars.month.branch, 
    'month', 
    fourPillars, 
    gender
  );
  
  if (monthKuiGangResult.isKuiGang) {
    fourPillars.month.isKuiGang = true;
    fourPillars.month.kuiGangInfo = monthKuiGangResult.kuiGangInfo;
  }
  
  // 检查时柱魁罡（次要影响）
  const hourKuiGangResult = checkKuiGang(
    fourPillars.hour.stem, 
    fourPillars.hour.branch, 
    'hour', 
    fourPillars, 
    gender
  );
  
  if (hourKuiGangResult.isKuiGang) {
    fourPillars.hour.isKuiGang = true;
    fourPillars.hour.kuiGangInfo = hourKuiGangResult.kuiGangInfo;
  }
}

/**
 * 🎵 计算纳音 (Step 3)
 * 基于传统纳音六十甲子表
 */
function calculateNaYin(fourPillars: FourPillars): NaYin {
  const getNaYinForPair = (ganZhi: string): string => {
    // 纳音查找表 - 传统六十甲子纳音
    const naYinTable: Record<string, string> = {
      '甲子': '海中金', '乙丑': '海中金',
      '丙寅': '炉中火', '丁卯': '炉中火',
      '戊辰': '大林木', '己巳': '大林木',
      '庚午': '路旁土', '辛未': '路旁土',
      '壬申': '剑锋金', '癸酉': '剑锋金',
      '甲戌': '山头火', '乙亥': '山头火',
      '丙子': '涧下水', '丁丑': '涧下水',
      '戊寅': '城头土', '己卯': '城头土',
      '庚辰': '白蜡金', '辛巳': '白蜡金',
      '壬午': '杨柳木', '癸未': '杨柳木',
      '甲申': '泉中水', '乙酉': '泉中水',
      '丙戌': '屋上土', '丁亥': '屋上土',
      '戊子': '霹雳火', '己丑': '霹雳火',
      '庚寅': '松柏木', '辛卯': '松柏木',
      '壬辰': '长流水', '癸巳': '长流水',
      '甲午': '砂石金', '乙未': '砂石金',
      '丙申': '山下火', '丁酉': '山下火',
      '戊戌': '平地木', '己亥': '平地木',
      '庚子': '壁上土', '辛丑': '壁上土',
      '壬寅': '金薄金', '癸卯': '金薄金',
      '甲辰': '覆灯火', '乙巳': '覆灯火',
      '丙午': '天河水', '丁未': '天河水',
      '戊申': '大驿土', '己酉': '大驿土',
      '庚戌': '钗环金', '辛亥': '钗环金',
      '壬子': '桑柘木', '癸丑': '桑柘木',
      '甲寅': '大溪水', '乙卯': '大溪水',
      '丙辰': '沙中土', '丁巳': '沙中土',
      '戊午': '天上火', '己未': '天上火',
      '庚申': '石榴木', '辛酉': '石榴木',
      '壬戌': '大海水', '癸亥': '大海水'
    };
    
    return naYinTable[ganZhi] || '未知';
  };
  
  return {
    year: getNaYinForPair(fourPillars.year.ganZhi),
    month: getNaYinForPair(fourPillars.month.ganZhi),
    day: getNaYinForPair(fourPillars.day.ganZhi),
    hour: getNaYinForPair(fourPillars.hour.ganZhi)
  };
}

/**
 * 👑 计算十神关系 (Step 4) - 使用现有成熟算法
 * 以日干为中心，分析其他天干的十神关系
 */
function calculateTenGodsUsingExistingAlgorithm(fourPillars: FourPillars): TenGodAnalysis {
  // 转换为现有算法所需的格式
  const baziData = {
    yearPillar: { stem: fourPillars.year.stem, branch: fourPillars.year.branch },
    monthPillar: { stem: fourPillars.month.stem, branch: fourPillars.month.branch },
    dayPillar: { stem: fourPillars.day.stem, branch: fourPillars.day.branch },
    hourPillar: { stem: fourPillars.hour.stem, branch: fourPillars.hour.branch }
  };
  
  // 使用现有的成熟算法获取基础结果
  const basicResult = BaziAlgorithmAdapter.calculateTenGodsAnalysis(baziData);
  
  // 添加简体字段
  return {
    ...basicResult,
    yearPillarSimplified: convertTenGodToSimplified(basicResult.yearPillar),
    monthPillarSimplified: convertTenGodToSimplified(basicResult.monthPillar),
    dayPillarSimplified: convertTenGodToSimplified(basicResult.dayPillar),
    hourPillarSimplified: convertTenGodToSimplified(basicResult.hourPillar)
  };
}

/**
 * 👑 计算十神关系 (简化版本保留)
 * 以日干为中心，分析其他天干的十神关系
 */
function calculateTenGods(fourPillars: FourPillars): TenGodAnalysis {
  const dayMaster = fourPillars.day.stem;
  
  const getTenGod = (stem: StemName): TenGodType => {
    // 十神计算表 - 以日干为中心
    const tenGodTable: Record<StemName, Record<StemName, TenGodType>> = {
      '甲': {
        '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官', '戊': '偏财',
        '己': '正财', '庚': '七杀', '辛': '正官', '壬': '偏印', '癸': '正印'
      },
      '乙': {
        '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神', '戊': '正财',
        '己': '偏财', '庚': '正官', '辛': '七杀', '壬': '正印', '癸': '偏印'
      },
      // ... 其他天干的十神表
      // 为了简化，这里只展示甲乙两个，实际应该包含全部十天干
      '丙': {
        '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫财', '戊': '食神',
        '己': '伤官', '庚': '偏财', '辛': '正财', '壬': '七杀', '癸': '正官'
      },
      '丁': {
        '甲': '正印', '乙': '偏印', '丙': '劫财', '丁': '比肩', '戊': '伤官',
        '己': '食神', '庚': '正财', '辛': '偏财', '壬': '正官', '癸': '七杀'
      },
      '戊': {
        '甲': '七杀', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩',
        '己': '劫财', '庚': '食神', '辛': '伤官', '壬': '偏财', '癸': '正财'
      },
      '己': {
        '甲': '正官', '乙': '七杀', '丙': '正印', '丁': '偏印', '戊': '劫财',
        '己': '比肩', '庚': '伤官', '辛': '食神', '壬': '正财', '癸': '偏财'
      },
      '庚': {
        '甲': '偏财', '乙': '正财', '丙': '七杀', '丁': '正官', '戊': '偏印',
        '己': '正印', '庚': '比肩', '辛': '劫财', '壬': '食神', '癸': '伤官'
      },
      '辛': {
        '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '七杀', '戊': '正印',
        '己': '偏印', '庚': '劫财', '辛': '比肩', '壬': '伤官', '癸': '食神'
      },
      '壬': {
        '甲': '食神', '乙': '伤官', '丙': '偏财', '丁': '正财', '戊': '七杀',
        '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫财'
      },
      '癸': {
        '甲': '伤官', '乙': '食神', '丙': '正财', '丁': '偏财', '戊': '正官',
        '己': '七杀', '庚': '正印', '辛': '偏印', '壬': '劫财', '癸': '比肩'
      }
    };
    
    return tenGodTable[dayMaster]?.[stem] || '比肩';
  };
  
  return {
    yearPillar: getTenGod(fourPillars.year.stem),
    monthPillar: getTenGod(fourPillars.month.stem),
    dayPillar: '比肩' as TenGodType, // 日干对自己
    hourPillar: getTenGod(fourPillars.hour.stem),
    // 添加简体字段
    yearPillarSimplified: convertTenGodToSimplified(getTenGod(fourPillars.year.stem)),
    monthPillarSimplified: convertTenGodToSimplified(getTenGod(fourPillars.month.stem)),
    dayPillarSimplified: '比' as TenGodSimplified,
    hourPillarSimplified: convertTenGodToSimplified(getTenGod(fourPillars.hour.stem))
  };
}

/**
 * 🌊 分析五行分布 (Step 5)
 * 统计四柱中的五行个数和强弱
 */
function analyzeElements(fourPillars: FourPillars): ElementAnalysis {
  // 天干五行对应表
  const stemElements: Record<StemName, ElementName> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  
  // 地支五行对应表
  const branchElements: Record<BranchName, ElementName> = {
    '子': '水', '亥': '水',
    '寅': '木', '卯': '木',
    '巳': '火', '午': '火',
    '申': '金', '酉': '金',
    '辰': '土', '戌': '土', '丑': '土', '未': '土'
  };
  
  // 统计五行个数
  const elementCount: Record<ElementName, number> = {
    '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
  };
  
  // 统计天干五行
  [fourPillars.year.stem, fourPillars.month.stem, fourPillars.day.stem, fourPillars.hour.stem]
    .forEach(stem => {
      const element = stemElements[stem];
      if (element) elementCount[element]++;
    });
  
  // 统计地支五行
  [fourPillars.year.branch, fourPillars.month.branch, fourPillars.day.branch, fourPillars.hour.branch]
    .forEach(branch => {
      const element = branchElements[branch];
      if (element) elementCount[element]++;
    });
  
  // 分析结果
  const elements = Object.entries(elementCount) as [ElementName, number][];
  const strongest = elements.reduce((max, current) => current[1] > max[1] ? current : max)[0];
  const weakest = elements.reduce((min, current) => current[1] < min[1] ? current : min)[0];
  const missing = elements.filter(([_, count]) => count === 0).map(([element]) => element);
  const excessive = elements.filter(([_, count]) => count > 2).map(([element]) => element);
  
  // 计算平衡度
  const total = Object.values(elementCount).reduce((sum, count) => sum + count, 0);
  const average = total / 5;
  const variance = Object.values(elementCount).reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / 5;
  const balance = Math.max(0, 100 - (variance * 20)); // 简化的平衡度计算
  
  return {
    elements: elementCount,
    strongest,
    weakest,
    missing,
    excessive,
    balance: Math.round(balance)
  };
}

/**
 * 💪 分析八字强弱 (Step 6)
 * 以日主为中心，分析整体的强弱格局
 */
function analyzeStrength(fourPillars: FourPillars, elementAnalysis: ElementAnalysis): StrengthAnalysis {
  const dayMasterElement = getDayMasterElement(fourPillars.day.stem);
  const supportingCount = elementAnalysis.elements[dayMasterElement];
  
  // 简化的强弱判断逻辑
  let dayMasterStrength: 'strong' | 'medium' | 'weak';
  let score: number;
  
  if (supportingCount >= 3) {
    dayMasterStrength = 'strong';
    score = 60 + (supportingCount - 3) * 15;
  } else if (supportingCount === 2) {
    dayMasterStrength = 'medium';
    score = 0;
  } else {
    dayMasterStrength = 'weak';
    score = -60 + supportingCount * 30;
  }
  
  // 生扶日主的五行
  const supportingElements = getSupportingElements(dayMasterElement);
  const conflictingElements = getConflictingElements(dayMasterElement);
  
  // 用神建议
  const recommendation = dayMasterStrength === 'weak' ? 
    `宜用${supportingElements.join('、')}` : 
    `宜用${conflictingElements.join('、')}`;
  
  return {
    dayMasterStrength,
    score: Math.max(-100, Math.min(100, score)),
    supportingElements,
    conflictingElements,
    recommendation
  };
}

// 辅助函数
function getDayMasterElement(stem: StemName): ElementName {
  const stemElements: Record<StemName, ElementName> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  return stemElements[stem];
}

function getSupportingElements(element: ElementName): ElementName[] {
  const supportMap: Record<ElementName, ElementName[]> = {
    '木': ['水', '木'],
    '火': ['木', '火'],
    '土': ['火', '土'],
    '金': ['土', '金'],
    '水': ['金', '水']
  };
  return supportMap[element] || [];
}

function getConflictingElements(element: ElementName): ElementName[] {
  const conflictMap: Record<ElementName, ElementName[]> = {
    '木': ['金', '土'],
    '火': ['水', '金'],
    '土': ['木', '水'],
    '金': ['火', '木'],
    '水': ['土', '火']
  };
  return conflictMap[element] || [];
}

/**
 * 🎯 计算起运年龄 (童限计算)
 * 
 * @description 使用 tyme4ts 的 ChildLimit 功能计算童限，从而确定大运开始年龄
 * @param solarTime 时间对象（包含具体时辰）
 * @param gender 性别
 * @returns 起运年龄（整数）
 */
function calculateStartingAge(solarTime: any, gender: 'male' | 'female'): number {
  try {
    // 导入 tyme4ts 的 ChildLimit 和 Gender 类
    const { ChildLimit, Gender } = require('tyme4ts');
    
    // 根据性别创建 ChildLimit 对象
    const childLimit = ChildLimit.fromSolarTime(
      solarTime, 
      gender === 'male' ? Gender.MAN : Gender.WOMAN
    );
    
    // 获取童限结束的年龄，即起运年龄
    const startingAge = childLimit.getEndAge();
    
    if (startingAge > 0) {
      console.log(`🎯 童限计算成功：起运年龄 ${startingAge} 岁`);
      return startingAge;
    }
    
    // 确保起运年龄至少为1岁
    return Math.max(1, startingAge);
    
  } catch (error) {
    console.warn('⚠️ tyme4ts 童限计算失败，使用默认值:', error);
    
    // 传统默认计算：根据性别和年干确定起运年龄
    // 默认6岁起运（实际应该根据阴阳年、性别等复杂计算）
    return 6;
  }
}

/**
 * 🚀 计算大运 (Step 8) - 完整实现，排出实际干支
 */
function calculateMajorPeriods(
  fourPillars: FourPillars,
  gender: 'male' | 'female',
  birthYear: number,
  startingAge: number, // 🆕 使用实际起运年龄参数
  count: number
): MajorPeriod[] {
  const majorPeriods: MajorPeriod[] = [];
  
  // 判断大运方向：阳男阴女顺行，阴男阳女逆行
  const yearStem = fourPillars.year.stem;
  const isYangStem = ['甲', '丙', '戊', '庚', '壬'].includes(yearStem);
  const isForward = (isYangStem && gender === 'male') || (!isYangStem && gender === 'female');
  
  // 从月柱开始排大运
  const monthStem = fourPillars.month.stem;
  const monthBranch = fourPillars.month.branch;
  
  // 获取月柱在六十甲子中的索引
  let currentIndex = getSixtyJiaziIndex(monthStem, monthBranch);
  
  for (let i = 0; i < count; i++) {
    const ageStart = startingAge + i * 10;
    const ageEnd = ageStart + 9;
    
    // 计算当前大运的干支索引
    let dayunIndex;
    if (isForward) {
      // 顺行：第一个大运是月柱的下一个
      dayunIndex = (currentIndex + 1 + i) % 60;
    } else {
      // 逆行：第一个大运是月柱的上一个
      dayunIndex = (currentIndex - 1 - i + 60) % 60;
    }
    
    const { stem, branch } = getStemBranchFromIndex(dayunIndex);
    const ganZhi = stem + branch;
    const stemElement = getStemElement(stem); // 天干五行
    const branchElement = getBranchElement(branch); // 地支五行
    const elementDescription = getElementDescription(stemElement, branchElement); // 组合描述
    
    majorPeriods.push({
      ganZhi,
      startAge: ageStart,
      endAge: ageEnd,
      startYear: birthYear + ageStart,
      endYear: birthYear + ageEnd,
      stemElement,
      branchElement,
      elementDescription
    });
  }
  
  return majorPeriods;
}

/**
 * 🔧 获取六十甲子索引
 */
function getSixtyJiaziIndex(stem: StemName, branch: BranchName): number {
  const stems: StemName[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const branches: BranchName[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  const stemIndex = stems.indexOf(stem);
  const branchIndex = branches.indexOf(branch);
  
  // 六十甲子的计算公式
  for (let i = 0; i < 60; i++) {
    if ((i % 10) === stemIndex && (i % 12) === branchIndex) {
      return i;
    }
  }
  
  return 0; // 默认返回甲子
}

/**
 * 🔧 从索引获取干支
 */
function getStemBranchFromIndex(index: number): { stem: StemName; branch: BranchName } {
  const stems: StemName[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const branches: BranchName[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  const stem = stems[index % 10];
  const branch = branches[index % 12];
  
  return { stem, branch };
}

/**
 * 🔧 获取天干对应的五行
 */
function getStemElement(stem: StemName): ElementName {
  const stemElements: Record<StemName, ElementName> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  
  return stemElements[stem] || '木';
}

/**
 * 🔧 获取地支对应的五行
 */
function getBranchElement(branch: BranchName): ElementName {
  const branchElements: Record<BranchName, ElementName> = {
    '子': '水', '亥': '水',
    '寅': '木', '卯': '木',
    '巳': '火', '午': '火',
    '申': '金', '酉': '金',
    '辰': '土', '戌': '土', '丑': '土', '未': '土'
  };
  
  return branchElements[branch] || '土';
}

/**
 * 🔧 生成五行组合描述
 * @param stemElement 天干五行
 * @param branchElement 地支五行
 * @returns 如"金土运"、"木火运"等
 */
function getElementDescription(stemElement: ElementName, branchElement: ElementName): string {
  if (stemElement === branchElement) {
    return `${stemElement}运`; // 同五行，如"金运"、"木运"
  } else {
    return `${stemElement}${branchElement}运`; // 不同五行，如"金土运"、"木火运"
  }
}

function shouldGoForward(yearStem: StemName, gender: 'male' | 'female'): boolean {
  // 阳男阴女顺行，阴男阳女逆行的简化判断
  const isYangStem = ['甲', '丙', '戊', '庚', '壬'].includes(yearStem);
  return (isYangStem && gender === 'male') || (!isYangStem && gender === 'female');
}

function getCurrentMajorPeriod(periods: MajorPeriod[], currentAge: number): MajorPeriod | undefined {
  return periods.find(period => currentAge >= period.startAge && currentAge <= period.endAge);
}

/**
 * 📅 计算流年 (Step 8)
 */
function calculateFleetingYears(
  _fourPillars: FourPillars,
  birthYear: number,
  range: number
): FleetingYear[] {
  const currentYear = new Date().getFullYear();
  const fleetingYears: FleetingYear[] = [];
  
  for (let i = -range; i <= range; i++) {
    const year = currentYear + i;
    const age = year - birthYear;
    
    if (age > 0) {
      fleetingYears.push({
        year,
        ganZhi: `${year}年`, // 简化处理
        age,
        element: '木', // 简化处理
        fortune: 'average' // 简化处理
      });
    }
  }
  
  return fleetingYears;
}

function getCurrentFleetingYear(years: FleetingYear[]): FleetingYear | undefined {
  const currentYear = new Date().getFullYear();
  return years.find(year => year.year === currentYear);
}

/**
 * ✅ 输入验证
 */
export function validateInput(input: BaziCalculationInput): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 年份验证
  if (input.year < 1900 || input.year > 2100) {
    errors.push('年份应在1900-2100之间');
  }
  
  // 月份验证
  if (input.month < 1 || input.month > 12) {
    errors.push('月份应在1-12之间');
  }
  
  // 日期验证
  if (input.day < 1 || input.day > 31) {
    errors.push('日期应在1-31之间');
  }
  
  // 时辰验证
  if (input.hour < 0 || input.hour > 23) {
    errors.push('小时应在0-23之间');
  }
  
  // 性别验证
  if (!['male', 'female'].includes(input.gender)) {
    errors.push('性别必须是male或female');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// 空对象创建函数
function createEmptyTenGodAnalysis(): TenGodAnalysis {
  return {
    yearPillar: '比肩',
    monthPillar: '比肩',
    dayPillar: '比肩',
    hourPillar: '比肩',
    yearPillarSimplified: '比',
    monthPillarSimplified: '比',
    dayPillarSimplified: '比',
    hourPillarSimplified: '比'
  };
}

function createEmptyElementAnalysis(): ElementAnalysis {
  return {
    elements: { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 },
    strongest: '木',
    weakest: '木',
    missing: [],
    excessive: [],
    balance: 0
  };
}

function createEmptyStrengthAnalysis(): StrengthAnalysis {
  return {
    dayMasterStrength: 'medium',
    score: 0,
    supportingElements: [],
    conflictingElements: [],
    recommendation: '待分析'
  };
}

/**
 * 🔧 性能监控工具
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  return {
    calculationTime: 0,
    memoryUsage: 0,
    cacheHits: 0,
    algorithmsUsed: ['bazi-core']
  };
}

/**
 * 🎯 批量计算接口
 */
export function calculateBatch(
  inputs: BaziCalculationInput[],
  options: BaziCalculationOptions = {}
): Promise<CompleteBaziAnalysis[]> {
  return Promise.all(
    inputs.map(input =>
      generateCompleteBaziChart(input, options)
    )
  );
}

// Functions are exported inline above