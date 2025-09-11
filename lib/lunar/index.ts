/**
 * 农历库中央导出文件
 * 统一管理所有农历相关的导入和工具函数
 */

// 核心类导出
export { 
  Solar, 
  Lunar, 
  EightChar, 
  SolarWeek, 
  SolarMonth,
  SolarYear,
  LunarMonth,
  LunarYear,
  ShuJiu,
  Fu,
  JieQi,
  LiuYue,
  LiuNian,
  XiaoYun,
  DaYun,
  Yun
} from 'lunar-typescript';

// 工具函数

/**
 * 获取指定日期的农历信息
 */
export const getLunarDate = (date: Date) => {
  const { Solar } = require('lunar-typescript');
  const solar = Solar.fromDate(date);
  return solar.getLunar();
};

/**
 * 获取八字信息
 */
export const getBaziInfo = (date: Date, hour: number) => {
  const { Solar } = require('lunar-typescript');
  const solar = Solar.fromYmdHms(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    hour,
    0,
    0
  );
  const lunar = solar.getLunar();
  return lunar.getEightChar();
};

/**
 * 获取宜忌信息
 */
export const getYiJi = (date: Date) => {
  const { Solar } = require('lunar-typescript');
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  
  return {
    yi: lunar.getDayYi(),           // 宜
    ji: lunar.getDayJi(),           // 忌
    shenWei: lunar.getDayPositionTai(), // 胎神
    chongSha: lunar.getDayChongDesc(),  // 冲煞
    pengZu: lunar.getPengZuGan() + ' ' + lunar.getPengZuZhi(), // 彭祖百忌
    jieQi: lunar.getJieQi(),        // 节气
  };
};

/**
 * 判断是否为节假日
 */
export const isHoliday = (date: Date): boolean => {
  const { Solar } = require('lunar-typescript');
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  
  // 检查农历节日
  const lunarFestivals = lunar.getFestivals();
  if (lunarFestivals.length > 0) return true;
  
  // 检查公历节日
  const solarFestivals = solar.getFestivals();
  if (solarFestivals.length > 0) return true;
  
  return false;
};

/**
 * 获取节日列表
 */
export const getFestivals = (date: Date) => {
  const { Solar } = require('lunar-typescript');
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  
  return {
    lunar: lunar.getFestivals(),
    solar: solar.getFestivals(),
    jieQi: lunar.getJieQi(),
    other: lunar.getOtherFestivals(),
  };
};

/**
 * 获取完整的日期信息
 */
export const getFullDateInfo = (date: Date) => {
  const { Solar } = require('lunar-typescript');
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  
  return {
    // 公历信息
    solar: {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      week: solar.getWeekInChinese(),
      constellation: solar.getXingZuo(), // 星座
    },
    // 农历信息
    lunar: {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      yearChinese: lunar.getYearInChinese(),
      monthChinese: lunar.getMonthInChinese(),
      dayChinese: lunar.getDayInChinese(),
      yearGanZhi: lunar.getYearInGanZhi(),
      monthGanZhi: lunar.getMonthInGanZhi(),
      dayGanZhi: lunar.getDayInGanZhi(),
      shengXiao: lunar.getYearShengXiao(), // 生肖
    },
    // 八字信息
    bazi: {
      year: eightChar.getYear(),
      month: eightChar.getMonth(),
      day: eightChar.getDay(),
      hour: eightChar.getTime(),
    },
    // 节日信息
    festivals: {
      lunar: lunar.getFestivals(),
      solar: solar.getFestivals(),
      jieQi: lunar.getJieQi(),
    },
    // 宜忌信息
    yiji: {
      yi: lunar.getDayYi(),
      ji: lunar.getDayJi(),
    },
  };
};