/**
 * 星盘渲染专用API
 * Chart Render API
 *
 * @ai-context CHART_RENDER_API
 * @preload ZiWeiHookChart, 渲染组件数据转换
 * @algorithm-dependency ziwei-chart-render
 */
import { BRANCH_NAMES } from '../types/hook-format-types';
/**
 * Type guard to check if a value is HookPalaceInfo
 */
function isHookPalaceInfo(value) {
    return value !== null &&
        typeof value === 'object' &&
        'branch' in value &&
        'branchIndex' in value &&
        'palaceName' in value;
}
/**
 * Safely get palace info from hook chart
 */
function getPalaceInfo(hookChart, branch) {
    const value = hookChart[branch];
    if (isHookPalaceInfo(value)) {
        return value;
    }
    // Fallback with minimal required structure
    return {
        branch,
        branchIndex: BRANCH_NAMES.indexOf(branch),
        stem: '甲', // Default stem
        palaceName: '未知宫', // Unknown palace
        'mainStars&sihuaStars': [],
        'auxiliaryStars&sihuaStars': [],
        minorStars: [],
        fleetingYears: [],
        majorPeriod: { period: 1, startAge: 6, endAge: 15, startYear: 2025, endYear: 2034 },
        minorPeriod: []
    };
}
// =============================================================================
// 渲染数据缓存管理
// =============================================================================
class ChartRenderCache {
    cache = new Map();
    maxSize = 50;
    ttl = 30 * 60 * 1000; // 30分钟
    generateCacheKey(input) {
        const hookFingerprint = this.generateHookFingerprint(input.hookChart);
        const optionsHash = JSON.stringify(input.options);
        // Use a web-safe base64 without Buffer
        const base64 = (() => {
            try {
                const g = globalThis;
                if (typeof g.btoa === 'function') {
                    return g.btoa(unescape(encodeURIComponent(optionsHash)));
                }
                if (typeof globalThis.Buffer !== 'undefined') {
                    const B = globalThis.Buffer;
                    return B.from(optionsHash, 'utf-8').toString('base64');
                }
            }
            catch { }
            return '';
        })();
        // Use a longer slice or the full hash to avoid collisions
        return `${hookFingerprint}_${base64.slice(0, 32)}`;
    }
    generateHookFingerprint(hookChart) {
        const key = {
            birth: hookChart.birthInfo,
            lifePalace: hookChart.命宫,
            bodyPalace: hookChart.身宫,
            bureau: hookChart.五行局,
            version: hookChart.version
        };
        try {
            const json = JSON.stringify(key);
            const g = globalThis;
            if (typeof g.btoa === 'function') {
                return g.btoa(unescape(encodeURIComponent(json))).slice(0, 32);
            }
            if (typeof globalThis.Buffer !== 'undefined') {
                const B = globalThis.Buffer;
                return B.from(json, 'utf-8').toString('base64').slice(0, 32);
            }
        }
        catch { }
        return '';
    }
    get(cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (!cached)
            return null;
        // 检查过期
        if (new Date() > new Date(cached.expiresAt)) {
            this.cache.delete(cacheKey);
            return null;
        }
        return cached;
    }
    set(cacheKey, data) {
        // LRU清理
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }
        const now = new Date();
        const cached = {
            cacheKey,
            generatedAt: now.toISOString(),
            expiresAt: new Date(now.getTime() + this.ttl).toISOString(),
            hookDataFingerprint: '',
            ...data
        };
        this.cache.set(cacheKey, cached);
    }
    clear() {
        this.cache.clear();
    }
}
const renderCache = new ChartRenderCache();
// =============================================================================
// 数据转换核心逻辑
// =============================================================================
/**
 * 将Hook格式的星曜信息转换为渲染格式
 */
function convertHookStarToRenderStar(star) {
    const types = [];
    let sihua;
    let color = 'primary';
    // 解析星曜类型标记
    if (star.type) {
        star.type.forEach(t => {
            if (t === 'D')
                types.push('主星');
            if (t === 'A')
                types.push('辅星');
            if (t === 'S')
                types.push('煞星');
            if (t === 'M')
                types.push('小星');
            // 四化标记解析
            if (t === 'iA' || t === 'xA') {
                sihua = '禄';
                types.push('四化');
                color = 'success';
            }
            if (t === 'iB' || t === 'xB') {
                sihua = '权';
                types.push('四化');
                color = 'warning';
            }
            if (t === 'iC' || t === 'xC') {
                sihua = '科';
                types.push('四化');
                color = 'primary';
            }
            if (t === 'iD' || t === 'xD') {
                sihua = '忌';
                types.push('四化');
                color = 'danger';
            }
        });
    }
    // 默认类型推断（如果没有明确标记）
    if (types.length === 0) {
        // 根据星曜名称推断类型
        const majorStars = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'];
        if (majorStars.includes(star.name)) {
            types.push('主星');
        }
        else {
            types.push('辅星');
        }
    }
    const base = {
        name: star.name,
        types,
        color,
        highlight: !!sihua
    };
    if (sihua)
        base.sihua = sihua;
    if (star.brightness) {
        // 只有在有亮度值时才添加该可选属性，避免 exactOptionalPropertyTypes 误报
        base.brightness = star.brightness;
    }
    return base;
}
/**
 * 将Hook格式的宫位信息转换为渲染格式
 */
function convertHookPalaceToRenderPalace(branchName, palace, options) {
    // 合并所有星曜
    const allStars = [
        ...palace["mainStars&sihuaStars"],
        ...palace["auxiliaryStars&sihuaStars"],
        ...palace.minorStars
    ];
    const stars = allStars.map(star => convertHookStarToRenderStar(star));
    // 判断宫位强弱
    const mainStarCount = stars.filter(s => s.types.includes('主星')).length;
    const sihuaCount = stars.filter(s => s.sihua).length;
    let strength = 'normal';
    if (mainStarCount >= 2 || sihuaCount >= 2)
        strength = 'strong';
    else if (mainStarCount === 0 && sihuaCount === 0)
        strength = 'weak';
    const obj = {
        branch: branchName,
        branchIndex: palace.branchIndex,
        ringIndex: palace.branchIndex,
        stem: palace.stem,
        palaceName: palace.palaceName,
        stars,
        isLifePalace: palace.palaceName === '命宫',
        isBodyPalace: palace.palaceName === '身宫',
        isLaiyinPalace: false,
        strength,
        isEmpty: stars.length === 0
    };
    if (options.currentYear) {
        const val = palace.fleetingYears.find(age => age <= (options.currentYear - parseInt(palace.stem) + 1));
        if (typeof val === 'number') {
            obj.currentFleetingAge = val;
        }
    }
    if (options.showMajorPeriods) {
        obj.majorPeriod = {
            period: palace.majorPeriod.period,
            ageRange: `${palace.majorPeriod.startAge}-${palace.majorPeriod.endAge}岁`,
            yearRange: `${palace.majorPeriod.startYear}-${palace.majorPeriod.endYear}年`
        };
    }
    return obj;
}
/**
 * 生成中宫渲染信息
 */
function generateCenterInfo(hookChart) {
    return {
        gender: hookChart.birthInfo.gender === 'male' ? '男' : '女',
        yearGanZhi: hookChart.birthInfo.yearGanzhi,
        lunarDate: `农历${hookChart.birthInfo.monthLunar}月${hookChart.birthInfo.dayLunar}日`,
        bureau: {
            name: hookChart.五行局.name,
            number: hookChart.五行局.局数
        },
        masters: {
            life: hookChart.命主,
            body: hookChart.身主
        }
    };
}
/**
 * 生成四化连线
 */
function generateSihuaLines(palaces) {
    const lines = [];
    // 收集所有四化星曜
    palaces.forEach((palace, palaceIndex) => {
        palace.stars.forEach(star => {
            if (star.sihua) {
                // 这里可以添加四化飞化逻辑
                // 暂时简化为同宫四化连线
                lines.push({
                    from: palaceIndex,
                    to: palaceIndex, // 自化
                    type: star.sihua,
                    starName: star.name,
                    color: star.color === 'success' ? '#28a745' :
                        star.color === 'warning' ? '#ffc107' :
                            star.color === 'danger' ? '#dc3545' : '#007bff',
                    style: 'solid'
                });
            }
        });
    });
    return lines;
}
// =============================================================================
// Web平台渲染数据生成
// =============================================================================
/**
 * 为Web平台生成渲染数据
 */
export function renderPalaceForWeb(input) {
    const cacheKey = renderCache.generateCacheKey(input);
    const cached = renderCache.get(cacheKey);
    if (cached?.webData) {
        return cached.webData;
    }
    const { hookChart, options } = input;
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    // 转换宫位数据（保持环型索引 0..11：子→…→亥，不做旋转）
    const palaces = branches.map(branch => convertHookPalaceToRenderPalace(branch, getPalaceInfo(hookChart, branch), options));
    // 生成中宫信息
    const centerInfo = generateCenterInfo(hookChart);
    // 生成四化连线
    const sihuaLines = options.showSihuaLines ? generateSihuaLines(palaces) : [];
    // Web特有的布局和CSS信息
    const webData = {
        palaces,
        centerInfo,
        sihuaLines,
        cssClasses: {
            palace: 'ziwei-palace',
            star: {
                '主星': 'major-star',
                '辅星': 'auxiliary-star',
                '煞星': 'malefic-star',
                '小星': 'minor-star',
                '四化': 'sihua-star'
            },
            sihua: {
                '禄': 'sihua-lu',
                '权': 'sihua-quan',
                '科': 'sihua-ke',
                '忌': 'sihua-ji'
            }
        },
        layout: {
            gridSize: 600,
            palaceSize: 150,
            positions: generateGridPositions()
        }
    };
    // 缓存数据
    renderCache.set(cacheKey, {
        webData,
        hookDataFingerprint: renderCache.generateCacheKey(input)
    });
    return webData;
}
// =============================================================================
// Native平台渲染数据生成  
// =============================================================================
/**
 * 为Native平台生成渲染数据
 */
export function renderPalaceForNative(input) {
    const cacheKey = renderCache.generateCacheKey(input);
    const cached = renderCache.get(cacheKey);
    if (cached?.nativeData) {
        return cached.nativeData;
    }
    const { hookChart, options } = input;
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    // 转换宫位数据 (与Web相同)
    const palaces = branches.map(branch => convertHookPalaceToRenderPalace(branch, getPalaceInfo(hookChart, branch), options));
    const centerInfo = generateCenterInfo(hookChart);
    const sihuaLines = options.showSihuaLines ? generateSihuaLines(palaces) : [];
    // Native特有的尺寸和主题信息
    const nativeData = {
        palaces,
        centerInfo,
        sihuaLines,
        dimensions: {
            screenWidth: 375, // 默认值，实际使用时会被覆盖
            screenHeight: 812,
            gridSize: 320,
            palaceSize: 80
        },
        theme: {
            palace: {
                background: options.theme === 'dark' ? '#2c2c2c' : '#ffffff',
                border: options.theme === 'dark' ? '#555555' : '#cccccc',
                text: options.theme === 'dark' ? '#ffffff' : '#333333'
            },
            stars: {
                '主星': { color: '#1a73e8' },
                '辅星': { color: '#34a853' },
                '煞星': { color: '#ea4335' },
                '小星': { color: '#9aa0a6' },
                '四化': { color: '#fbbc04', background: 'rgba(251, 188, 4, 0.1)' }
            },
            sihua: {
                '禄': '#28a745',
                '权': '#ffc107',
                '科': '#007bff',
                '忌': '#dc3545'
            }
        },
        interactions: {
            onPalacePress: (_palaceIndex, palace) => {
                console.log(`宫位点击: ${palace.palaceName} (${palace.branch})`);
            },
            onStarPress: (star, palace) => {
                console.log(`星曜点击: ${star.name} 在 ${palace.palaceName}`);
            }
        }
    };
    // 缓存数据
    renderCache.set(cacheKey, {
        nativeData,
        hookDataFingerprint: renderCache.generateCacheKey(input)
    });
    return nativeData;
}
// =============================================================================
// 通用渲染API
// =============================================================================
/**
 * 通用渲染数据生成器
 */
export function generateChartRenderData(input) {
    if (input.options.platform === 'web') {
        return {
            platform: 'web',
            data: renderPalaceForWeb(input)
        };
    }
    else {
        return {
            platform: 'native',
            data: renderPalaceForNative(input)
        };
    }
}
/**
 * 批量生成渲染数据 (Web + Native)
 */
export function generateBothPlatformRenderData(input) {
    return {
        web: renderPalaceForWeb({ ...input, options: { ...input.options, platform: 'web' } }),
        native: renderPalaceForNative({ ...input, options: { ...input.options, platform: 'native' } })
    };
}
/**
 * 清除渲染数据缓存
 */
export function clearRenderCache() {
    renderCache.clear();
}
/**
 * 获取缓存统计信息
 */
export function getRenderCacheStats() {
    return {
        size: renderCache['cache'].size,
        maxSize: renderCache['maxSize'],
        ttl: renderCache['ttl']
    };
}
// =============================================================================
// 辅助函数
// =============================================================================
/**
 * 生成十二宫网格位置
 */
function generateGridPositions() {
    return [
        { row: 3, col: 2 }, // 子
        { row: 3, col: 1 }, // 丑  
        { row: 3, col: 0 }, // 寅
        { row: 2, col: 0 }, // 卯
        { row: 1, col: 0 }, // 辰
        { row: 0, col: 0 }, // 巳
        { row: 0, col: 1 }, // 午
        { row: 0, col: 2 }, // 未
        { row: 0, col: 3 }, // 申
        { row: 1, col: 3 }, // 酉
        { row: 2, col: 3 }, // 戌
        { row: 3, col: 3 } // 亥
    ];
}
//# sourceMappingURL=chart-render-api.js.map