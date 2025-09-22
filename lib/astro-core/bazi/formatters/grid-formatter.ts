/**
 * BaZi Grid Formatter
 * 
 * Transforms BaZi calculation results into structured grid data for UI display
 * Maintains clean separation between calculation logic and presentation
 */

import { BasicChartResult } from '../chart/types';
import { 
  BaziGridData, 
  GridCell, 
  GridFormatOptions, 
  SimpleBaziGrid,
  ELEMENT_COLORS 
} from './types';
import { StemName, BranchName, ElementName } from '../types';

/**
 * Main formatter function - transforms calculation results to grid data
 */
export function formatForGrid(
  result: BasicChartResult,
  options: GridFormatOptions = {}
): BaziGridData {
  const {
    includeHiddenStems = true,
    includeTenGods = true,
    includeMajorPeriods = true,
    useColors = true,
    highlightDayMaster = true,
    locale = 'zh-CN'
  } = options;

  const { fourPillars, tenGodAnalysis, majorPeriods, naYin } = result;
  const tenGodExtended = tenGodAnalysis as (Record<string, any> | undefined);
  const dayMaster = fourPillars.day.stem;

  return {
    pillars: {
      year: formatPillar(
        fourPillars.year,
        '年柱',
        tenGodExtended?.yearStem,
        naYin?.year,
        { useColors, highlightDayMaster, dayMaster }
      ),
      month: formatPillar(
        fourPillars.month,
        '月柱',
        tenGodExtended?.monthStem,
        naYin?.month,
        { useColors, highlightDayMaster, dayMaster }
      ),
      day: formatPillar(
        fourPillars.day,
        '日柱',
        tenGodExtended?.dayStem,
        naYin?.day,
        { useColors, highlightDayMaster, dayMaster }
      ),
      hour: formatPillar(
        fourPillars.hour,
        '时柱',
        tenGodExtended?.hourStem,
        naYin?.hour,
        { useColors, highlightDayMaster, dayMaster }
      )
    },

    tenGods: includeTenGods ? {
      yearStem: tenGodExtended?.yearStem,
      monthStem: tenGodExtended?.monthStem,
      dayStem: tenGodExtended?.dayStem,
      hourStem: tenGodExtended?.hourStem,
      yearBranch: tenGodExtended?.yearBranchTenGods,
      monthBranch: tenGodExtended?.monthBranchTenGods,
      dayBranch: tenGodExtended?.dayBranchTenGods,
      hourBranch: tenGodExtended?.hourBranchTenGods
    } : {},

    majorPeriods: includeMajorPeriods && majorPeriods ? 
      formatMajorPeriods(majorPeriods.periods, { useColors }) : undefined,

    annualPillars: undefined, // TODO: Implement annual pillars formatting

    summary: {
      dayMaster: fourPillars.day.stem,
      dayMasterElement: getStemElement(fourPillars.day.stem),
      strongWeak: tenGodExtended?.dayMasterStrength,
      favorableElements: tenGodExtended?.favorableElements,
      unfavorableElements: tenGodExtended?.unfavorableElements
    },

    metadata: {
      title: generateTitle(result, locale),
      subtitle: generateSubtitle(result, locale),
      generatedAt: new Date(),
      calculationVersion: result.algorithm || '1.0.0'
    }
  };
}

/**
 * Format a single pillar for grid display
 */
function formatPillar(
  pillar: any,
  label: string,
  tenGod?: any,
  naYin?: string,
  options?: any
): any {
  const { useColors, highlightDayMaster, dayMaster } = options || {};
  
  return {
    stem: formatGridCell(
      pillar.stem,
      'stem',
      getStemElement(pillar.stem),
      tenGod,
      naYin,
      { 
        label,
        useColors,
        isHighlighted: highlightDayMaster && pillar.stem === dayMaster
      }
    ),
    branch: formatGridCell(
      pillar.branch,
      'branch',
      getBranchElement(pillar.branch),
      undefined,
      undefined,
      { label: '', useColors }
    ),
    hiddenStems: pillar.hiddenStems?.map((hs: any) => 
      formatGridCell(
        hs.stem,
        'hidden',
        getStemElement(hs.stem),
        hs.tenGod,
        undefined,
        { label: `藏干`, useColors }
      )
    )
  };
}

/**
 * Format a single grid cell
 */
function formatGridCell(
  content: StemName | BranchName,
  type: 'stem' | 'branch' | 'hidden',
  element: ElementName,
  tenGod?: any,
  naYin?: string,
  options?: any
): GridCell {
  const { label, sublabel, useColors, isHighlighted } = options || {};

  return {
    [type === 'stem' ? 'stem' : 'branch']: content,
    element,
    tenGod,
    naYin,
    color: useColors ? ELEMENT_COLORS[element] : undefined,
    isHighlighted,
    label,
    sublabel,
    tooltip: generateTooltip(content, element, tenGod, naYin)
  };
}

/**
 * Format major periods for grid display
 */
function formatMajorPeriods(periods: any[], options: any) {
  return periods?.map(period => ({
    age: period.startAge,
    stem: formatGridCell(
      period.stem,
      'stem',
      getStemElement(period.stem),
      undefined,
      period.naYin,
      { useColors: options.useColors }
    ),
    branch: formatGridCell(
      period.branch,
      'branch',
      getBranchElement(period.branch),
      undefined,
      undefined,
      { useColors: options.useColors }
    ),
    startYear: period.startYear,
    endYear: period.endYear
  }));
}

/**
 * Create simplified grid format
 */
export function formatSimpleGrid(result: BasicChartResult): SimpleBaziGrid {
  const { fourPillars } = result;
  
  return {
    grid: [
      {
        position: 'year',
        stem: fourPillars.year.stem,
        branch: fourPillars.year.branch,
        stemElement: getStemElement(fourPillars.year.stem),
        branchElement: getBranchElement(fourPillars.year.branch)
      },
      {
        position: 'month',
        stem: fourPillars.month.stem,
        branch: fourPillars.month.branch,
        stemElement: getStemElement(fourPillars.month.stem),
        branchElement: getBranchElement(fourPillars.month.branch)
      },
      {
        position: 'day',
        stem: fourPillars.day.stem,
        branch: fourPillars.day.branch,
        stemElement: getStemElement(fourPillars.day.stem),
        branchElement: getBranchElement(fourPillars.day.branch)
      },
      {
        position: 'hour',
        stem: fourPillars.hour.stem,
        branch: fourPillars.hour.branch,
        stemElement: getStemElement(fourPillars.hour.stem),
        branchElement: getBranchElement(fourPillars.hour.branch)
      }
    ],
    dayMaster: fourPillars.day.stem,
    dayMasterElement: getStemElement(fourPillars.day.stem)
  };
}

/**
 * Get element for a heavenly stem
 */
function getStemElement(stem: StemName): ElementName {
  const stemElements: Record<StemName, ElementName> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  return stemElements[stem];
}

/**
 * Get element for an earthly branch
 */
function getBranchElement(branch: BranchName): ElementName {
  const branchElements: Record<BranchName, ElementName> = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木',
    '辰': '土', '巳': '火', '午': '火', '未': '土',
    '申': '金', '酉': '金', '戌': '土', '亥': '水'
  };
  return branchElements[branch];
}

/**
 * Generate tooltip text for a grid cell
 */
function generateTooltip(
  content: string,
  element?: ElementName,
  tenGod?: any,
  naYin?: string
): string {
  const parts = [`${content}`];
  if (element) parts.push(`五行: ${element}`);
  if (tenGod) parts.push(`十神: ${tenGod}`);
  if (naYin) parts.push(`纳音: ${naYin}`);
  return parts.join(' | ');
}

/**
 * Generate title for the grid
 */
function generateTitle(result: BasicChartResult, locale: string): string {
  const { input } = result;
  if (locale === 'zh-CN' || locale === 'zh-TW') {
    return `${input.gender === 'male' ? '男' : '女'}命 四柱八字`;
  }
  return `BaZi Chart - ${input.gender}`;
}

/**
 * Generate subtitle for the grid
 */
function generateSubtitle(result: BasicChartResult, locale: string): string {
  const { solarDate } = result;
  if (locale === 'zh-CN' || locale === 'zh-TW') {
    return `${solarDate.year}年${solarDate.month}月${solarDate.day}日 ${solarDate.hour}时`;
  }
  return `${solarDate.year}-${solarDate.month}-${solarDate.day} ${solarDate.hour}:${solarDate.minute}`;
}

/**
 * Export utility functions for UI components
 */
export const GridFormatUtils = {
  getStemElement,
  getBranchElement,
  generateTooltip,
  generateTitle,
  generateSubtitle,
  ELEMENT_COLORS
};
