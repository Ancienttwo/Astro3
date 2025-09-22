/**
 * 紫微斗数Hook接口数据格式类型定义
 * ZiWei Hook Interface Data Format Types
 *
 * @ai-context ZIWEI_HOOK_INTERFACE
 * @preload tyme4ts, AlgorithmRegistry
 * @algorithm-dependency ziwei-calculator
 */
// 四化类型标记常量
export const SIHUA_TYPES = {
    // 生年四化
    BIRTH_LU: "iA", // 生年禄
    BIRTH_QUAN: "iB", // 生年权
    BIRTH_KE: "iC", // 生年科
    BIRTH_JI: "iD", // 生年忌
    // 自化四化
    SELF_LU: "xA", // 自化禄
    SELF_QUAN: "xB", // 自化权
    SELF_KE: "xC", // 自化科
    SELF_JI: "xD", // 自化忌
    // 其他标记
    STAR_TYPE_D: "D", // 主星标记
};
// 地支常量映射
export const BRANCH_NAMES = [
    "子", "丑", "寅", "卯", "辰", "巳",
    "午", "未", "申", "酉", "戌", "亥"
];
// 星曜亮度常量
export const STAR_BRIGHTNESS = {
    TEMPLE: "庙", // 庙
    PROSPER: "旺", // 旺
    GAIN: "得", // 得
    BENEFIT: "利", // 利
    NORMAL: "平", // 平
    FALL: "陷" // 陷
};
//# sourceMappingURL=hook-format-types.js.map