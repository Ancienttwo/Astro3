/**
 * 紫微斗数时间计算功能
 * Time-based Calculations for ZiWei DouShu
 */
/**
 * 计算年龄
 * Calculate age from birth date to target date
 */
export declare function calculateAge(birthDate: Date, targetDate: Date): number;
/**
 * 大运期信息
 */
export interface MajorPeriodInfo {
    periodNumber: number;
    startAge: number;
    endAge: number;
    palaceIndex: number;
    palaceName: string;
    stem: string;
    branch: string;
    startYear: number;
    endYear: number;
}
/**
 * 获取当前大运期
 * Get current major period (10-year fortune period)
 *
 * @param birthDate 出生日期
 * @param targetDate 目标日期
 * @param gender 性别 ('male' | 'female')
 * @param yearStem 年干
 * @param fiveElementsBureau 五行局
 * @param lifePalaceIndex 命宫位置索引
 */
export declare function getCurrentMajorPeriod(birthDate: Date, targetDate: Date, gender: 'male' | 'female', yearStem: string, fiveElementsBureau: string, lifePalaceIndex: number): MajorPeriodInfo;
/**
 * 流年信息
 */
export interface FleetingYearInfo {
    year: number;
    age: number;
    stem: string;
    branch: string;
    ganZhi: string;
    palaceIndex: number;
    palaceName: string;
}
/**
 * 获取流年信息
 * Get fleeting year information
 *
 * @param birthDate 出生日期
 * @param year 目标年份
 */
export declare function getFleetingYear(birthDate: Date, year: number): FleetingYearInfo;
/**
 * 流月信息
 */
export interface FleetingMonthInfo {
    year: number;
    month: number;
    stem: string;
    branch: string;
    ganZhi: string;
    palaceIndex: number;
    palaceName: string;
}
/**
 * 获取流月信息
 * Get fleeting month information
 *
 * @param birthDate 出生日期
 * @param year 年份
 * @param month 月份 (1-12)
 */
export declare function getFleetingMonth(birthDate: Date, year: number, month: number): FleetingMonthInfo;
/**
 * 小限信息
 */
export interface MinorLimitInfo {
    age: number;
    palaceIndex: number;
    palaceName: string;
    branch: string;
}
/**
 * 获取小限信息
 * Get minor limit (annual fortune) information
 *
 * @param birthDate 出生日期
 * @param targetDate 目标日期
 * @param gender 性别
 * @param yearBranch 年支
 */
export declare function getMinorLimit(birthDate: Date, targetDate: Date, gender: 'male' | 'female', yearBranch: string): MinorLimitInfo;
/**
 * 时间跨度信息
 */
export interface TimeSpanInfo {
    years: number;
    months: number;
    days: number;
    totalDays: number;
}
/**
 * 计算时间跨度
 * Calculate time span between two dates
 */
export declare function calculateTimeSpan(startDate: Date, endDate: Date): TimeSpanInfo;
/**
 * 验证日期有效性
 * Validate date
 */
export declare function isValidDate(date: Date): boolean;
/**
 * 格式化干支
 * Format GanZhi (Stem-Branch)
 */
export declare function formatGanZhi(stem: string, branch: string): string;
/**
 * 获取完整的时间查询结果
 * Get comprehensive time query result
 */
export interface ComprehensiveTimeInfo {
    currentAge: number;
    majorPeriod: MajorPeriodInfo;
    fleetingYear: FleetingYearInfo;
    fleetingMonth: FleetingMonthInfo;
    minorLimit: MinorLimitInfo;
    timeSpan: TimeSpanInfo;
}
/**
 * 获取综合时间信息
 * Get comprehensive time information
 */
export declare function getComprehensiveTimeInfo(birthDate: Date, targetDate: Date, gender: 'male' | 'female', yearStem: string, yearBranch: string, fiveElementsBureau: string, lifePalaceIndex: number): ComprehensiveTimeInfo;
