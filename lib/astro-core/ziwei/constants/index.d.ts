/**
 * 紫微斗数常量统一导出
 * Unified Constants Export for ZiWei DouShu
 *
 * @ai-context MODULAR_CONSTANTS_SYSTEM
 * @purpose 解决大文件ESLint限制，提供模块化常量系统
 * @architecture 按功能域分组的常量模块
 * @note 注意：紫微斗数的五行局是通过命宫地支+生年天干查表得到的，不是八字的纳音五行！
 */
export * from './basic-elements';
export type { Stem, Branch, PalaceName, MajorPeriodPalaceName, FleetingYearPalaceName, MinorPeriodPalaceName } from './basic-elements';
export * from './five-elements-bureau';
export type { FiveElementsBureauName, FiveElementsBureauCode } from './five-elements-bureau';
export * from './star-systems';
export type { MainStar, AuxiliaryStar, MaleficStar, PeachBlossomStar, MinorStar, StarName } from './star-systems';
export * from './master-stars';
export type { LifeMasterStar, BodyMasterStar, SihuaTransformation, SihuaType } from './master-stars';
export * from './star-brightness';
export type { StarBrightnessValue, BrightnessLevel, StarBrightnessData } from './star-brightness';
/**
 * @ai-export-summary
 * 模块化常量系统导出总结：
 *
 * 1. **基础元素**: 天干地支、十二宫位名称
 * 2. **五行局**: 五行局查对表、起运年龄表
 * 3. **星曜系统**: 主星、辅星、煞星位置表
 * 4. **命主身主**: 命主身主星、四化表
 * 5. **星曜亮度**: 亮度等级、亮度对照表
 *
 * @ai-usage
 * ```typescript
 * import { STEMS, BRANCHES, PALACE_NAMES } from '@astroall/ziwei-core/constants'
 * import { FIVE_ELEMENTS_BUREAU } from '@astroall/ziwei-core/constants'
 * import { MAIN_STARS, ZIWEI_POSITION_TABLE } from '@astroall/ziwei-core/constants'
 * ```
 *
 * @ai-benefits
 * - ✅ 解决ESLint文件行数限制问题
 * - ✅ 提高代码可维护性和可读性
 * - ✅ 按功能域组织，便于查找和修改
 * - ✅ 保持完整的类型安全性
 * - ✅ 向后兼容原有导入方式
 */ 
//# sourceMappingURL=index.d.ts.map