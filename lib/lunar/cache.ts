/**
 * 农历计算缓存优化
 * 避免重复计算，提升性能
 */

import { Solar, Lunar } from 'lunar-typescript';

// 缓存存储
const lunarCache = new Map<string, Lunar>();
const solarCache = new Map<string, Solar>();
const yijiCache = new Map<string, any>();
const baziCache = new Map<string, any>();

// 缓存配置
const MAX_CACHE_SIZE = 1000; // 最大缓存条目
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24小时过期

// 缓存元数据
const cacheTimestamps = new Map<string, number>();

/**
 * 清理过期缓存
 */
const cleanExpiredCache = () => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  cacheTimestamps.forEach((timestamp, key) => {
    if (now - timestamp > CACHE_TTL) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => {
    lunarCache.delete(key);
    solarCache.delete(key);
    yijiCache.delete(key);
    baziCache.delete(key);
    cacheTimestamps.delete(key);
  });
};

/**
 * 限制缓存大小
 */
const limitCacheSize = () => {
  if (lunarCache.size > MAX_CACHE_SIZE) {
    // 删除最早的条目
    const entriesToDelete = lunarCache.size - MAX_CACHE_SIZE;
    const keys = Array.from(lunarCache.keys());
    for (let i = 0; i < entriesToDelete; i++) {
      const key = keys[i];
      lunarCache.delete(key);
      solarCache.delete(key);
      yijiCache.delete(key);
      baziCache.delete(key);
      cacheTimestamps.delete(key);
    }
  }
};

/**
 * 生成缓存键
 */
const generateCacheKey = (year: number, month: number, day: number, hour?: number): string => {
  return hour !== undefined 
    ? `${year}-${month}-${day}-${hour}`
    : `${year}-${month}-${day}`;
};

/**
 * 获取缓存的 Solar 对象
 */
export const getCachedSolar = (year: number, month: number, day: number): Solar => {
  const key = generateCacheKey(year, month, day);
  
  if (!solarCache.has(key)) {
    const solar = Solar.fromYmd(year, month, day);
    solarCache.set(key, solar);
    cacheTimestamps.set(key, Date.now());
    limitCacheSize();
  }
  
  return solarCache.get(key)!;
};

/**
 * 获取缓存的 Lunar 对象
 */
export const getCachedLunar = (year: number, month: number, day: number): Lunar => {
  const key = generateCacheKey(year, month, day);
  
  if (!lunarCache.has(key)) {
    const solar = getCachedSolar(year, month, day);
    const lunar = solar.getLunar();
    lunarCache.set(key, lunar);
    cacheTimestamps.set(key, Date.now());
    limitCacheSize();
  }
  
  return lunarCache.get(key)!;
};

/**
 * 获取缓存的宜忌信息
 */
export const getCachedYiJi = (year: number, month: number, day: number) => {
  const key = `yiji-${generateCacheKey(year, month, day)}`;
  
  if (!yijiCache.has(key)) {
    const lunar = getCachedLunar(year, month, day);
    const yiji = {
      yi: lunar.getDayYi(),
      ji: lunar.getDayJi(),
      shenWei: lunar.getDayPositionTai(),
      chongSha: lunar.getDayChongDesc(),
      pengZu: lunar.getPengZuGan() + ' ' + lunar.getPengZuZhi(),
      jieQi: lunar.getJieQi(),
    };
    yijiCache.set(key, yiji);
    cacheTimestamps.set(key, Date.now());
  }
  
  return yijiCache.get(key);
};

/**
 * 获取缓存的八字信息
 */
export const getCachedBazi = (year: number, month: number, day: number, hour: number) => {
  const key = `bazi-${generateCacheKey(year, month, day, hour)}`;
  
  if (!baziCache.has(key)) {
    const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();
    
    const bazi = {
      year: eightChar.getYear(),
      month: eightChar.getMonth(),
      day: eightChar.getDay(),
      hour: eightChar.getTime(),
      yearHideGan: eightChar.getYearHideGan(),
      monthHideGan: eightChar.getMonthHideGan(),
      dayHideGan: eightChar.getDayHideGan(),
      timeHideGan: eightChar.getTimeHideGan(),
    };
    
    baziCache.set(key, bazi);
    cacheTimestamps.set(key, Date.now());
  }
  
  return baziCache.get(key);
};

/**
 * 批量预加载日期范围的农历数据
 */
export const preloadDateRange = async (startDate: Date, endDate: Date) => {
  const tasks: Promise<void>[] = [];
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    
    tasks.push(
      new Promise<void>((resolve) => {
        getCachedLunar(year, month, day);
        getCachedYiJi(year, month, day);
        resolve();
      })
    );
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  await Promise.all(tasks);
};

/**
 * 清空所有缓存
 */
export const clearAllCache = () => {
  lunarCache.clear();
  solarCache.clear();
  yijiCache.clear();
  baziCache.clear();
  cacheTimestamps.clear();
};

/**
 * 获取缓存统计信息
 */
export const getCacheStats = () => {
  return {
    lunarCacheSize: lunarCache.size,
    solarCacheSize: solarCache.size,
    yijiCacheSize: yijiCache.size,
    baziCacheSize: baziCache.size,
    totalSize: lunarCache.size + solarCache.size + yijiCache.size + baziCache.size,
    maxSize: MAX_CACHE_SIZE,
    ttl: CACHE_TTL,
  };
};

// 定期清理过期缓存
if (typeof window !== 'undefined') {
  setInterval(cleanExpiredCache, 60 * 60 * 1000); // 每小时清理一次
}