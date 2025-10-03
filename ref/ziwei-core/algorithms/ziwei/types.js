"use strict";
/**
 * 紫微斗数核心类型定义
 * 从生产环境迁移 - AstroZi Mobile
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PALACE_NAMES = exports.EARTHLY_BRANCH_INDICES = exports.ZiweiPalace = exports.SiHua = exports.ZiweiMinorStar = exports.ZiweiAuxiliaryStar = exports.ZiweiMainStar = exports.FiveElementsBureau = exports.EarthlyBranch = exports.HeavenlyStem = void 0;
// ==================== 基础枚举类型 ====================
/**
 * 天干枚举
 */
var HeavenlyStem;
(function (HeavenlyStem) {
    HeavenlyStem["JIA"] = "\u7532";
    HeavenlyStem["YI"] = "\u4E59";
    HeavenlyStem["BING"] = "\u4E19";
    HeavenlyStem["DING"] = "\u4E01";
    HeavenlyStem["WU"] = "\u620A";
    HeavenlyStem["JI"] = "\u5DF1";
    HeavenlyStem["GENG"] = "\u5E9A";
    HeavenlyStem["XIN"] = "\u8F9B";
    HeavenlyStem["REN"] = "\u58EC";
    HeavenlyStem["GUI"] = "\u7678";
})(HeavenlyStem || (exports.HeavenlyStem = HeavenlyStem = {}));
/**
 * 地支枚举
 */
var EarthlyBranch;
(function (EarthlyBranch) {
    EarthlyBranch["ZI"] = "\u5B50";
    EarthlyBranch["CHOU"] = "\u4E11";
    EarthlyBranch["YIN"] = "\u5BC5";
    EarthlyBranch["MAO"] = "\u536F";
    EarthlyBranch["CHEN"] = "\u8FB0";
    EarthlyBranch["SI"] = "\u5DF3";
    EarthlyBranch["WU"] = "\u5348";
    EarthlyBranch["WEI"] = "\u672A";
    EarthlyBranch["SHEN"] = "\u7533";
    EarthlyBranch["YOU"] = "\u9149";
    EarthlyBranch["XU"] = "\u620C";
    EarthlyBranch["HAI"] = "\u4EA5";
})(EarthlyBranch || (exports.EarthlyBranch = EarthlyBranch = {}));
/**
 * 五行局枚举
 */
var FiveElementsBureau;
(function (FiveElementsBureau) {
    FiveElementsBureau["WATER_TWO"] = "\u6C34\u4E8C\u5C40";
    FiveElementsBureau["WOOD_THREE"] = "\u6728\u4E09\u5C40";
    FiveElementsBureau["METAL_FOUR"] = "\u91D1\u56DB\u5C40";
    FiveElementsBureau["EARTH_FIVE"] = "\u571F\u4E94\u5C40";
    FiveElementsBureau["FIRE_SIX"] = "\u706B\u516D\u5C40";
})(FiveElementsBureau || (exports.FiveElementsBureau = FiveElementsBureau = {}));
/**
 * 紫微斗数主星枚举
 */
var ZiweiMainStar;
(function (ZiweiMainStar) {
    ZiweiMainStar["ZIWEI"] = "\u7D2B\u5FAE";
    ZiweiMainStar["TIANJI"] = "\u5929\u673A";
    ZiweiMainStar["TAIYANG"] = "\u592A\u9633";
    ZiweiMainStar["WUQU"] = "\u6B66\u66F2";
    ZiweiMainStar["TIANTONG"] = "\u5929\u540C";
    ZiweiMainStar["LIANZHEN"] = "\u5EC9\u8D1E";
    ZiweiMainStar["TIANFU"] = "\u5929\u5E9C";
    ZiweiMainStar["TAIYIN"] = "\u592A\u9634";
    ZiweiMainStar["TANLANG"] = "\u8D2A\u72FC";
    ZiweiMainStar["JUMEN"] = "\u5DE8\u95E8";
    ZiweiMainStar["TIANXIANG"] = "\u5929\u76F8";
    ZiweiMainStar["TIANLIANG"] = "\u5929\u6881";
    ZiweiMainStar["QISHA"] = "\u4E03\u6740";
    ZiweiMainStar["POJUN"] = "\u7834\u519B";
})(ZiweiMainStar || (exports.ZiweiMainStar = ZiweiMainStar = {}));
/**
 * 紫微斗数辅星枚举
 */
var ZiweiAuxiliaryStar;
(function (ZiweiAuxiliaryStar) {
    ZiweiAuxiliaryStar["ZUOFU"] = "\u5DE6\u8F85";
    ZiweiAuxiliaryStar["YOUBI"] = "\u53F3\u5F3C";
    ZiweiAuxiliaryStar["WENCHANG"] = "\u6587\u660C";
    ZiweiAuxiliaryStar["WENQU"] = "\u6587\u66F2";
    ZiweiAuxiliaryStar["LUCUN"] = "\u7984\u5B58";
    ZiweiAuxiliaryStar["TIANMA"] = "\u5929\u9A6C";
    ZiweiAuxiliaryStar["QINGYANG"] = "\u64CE\u7F8A";
    ZiweiAuxiliaryStar["TUOLUO"] = "\u9640\u7F57";
    ZiweiAuxiliaryStar["HUOXING"] = "\u706B\u661F";
    ZiweiAuxiliaryStar["LINGXING"] = "\u94C3\u661F";
    ZiweiAuxiliaryStar["TIANKUI"] = "\u5929\u9B41";
    ZiweiAuxiliaryStar["TIANYUE"] = "\u5929\u94BA";
})(ZiweiAuxiliaryStar || (exports.ZiweiAuxiliaryStar = ZiweiAuxiliaryStar = {}));
/**
 * 紫微斗数小星枚举（部分常用）
 */
var ZiweiMinorStar;
(function (ZiweiMinorStar) {
    ZiweiMinorStar["HONGLUAN"] = "\u7EA2\u9E3E";
    ZiweiMinorStar["TIANXI"] = "\u5929\u559C";
    ZiweiMinorStar["GUCHEN"] = "\u5B64\u8FB0";
    ZiweiMinorStar["GUASU"] = "\u5BE1\u5BBF";
    ZiweiMinorStar["TIANKU"] = "\u5929\u54ED";
    ZiweiMinorStar["TIANXU"] = "\u5929\u865A";
    ZiweiMinorStar["LONGCHI"] = "\u9F99\u6C60";
    ZiweiMinorStar["FENGGE"] = "\u51E4\u9601";
    ZiweiMinorStar["SANTAI"] = "\u4E09\u53F0";
    ZiweiMinorStar["BAZUO"] = "\u516B\u5EA7";
})(ZiweiMinorStar || (exports.ZiweiMinorStar = ZiweiMinorStar = {}));
/**
 * 四化枚举
 */
var SiHua;
(function (SiHua) {
    SiHua["LU"] = "\u7984";
    SiHua["QUAN"] = "\u6743";
    SiHua["KE"] = "\u79D1";
    SiHua["JI"] = "\u5FCC";
})(SiHua || (exports.SiHua = SiHua = {}));
/**
 * 十二宫位枚举
 */
var ZiweiPalace;
(function (ZiweiPalace) {
    ZiweiPalace["MING"] = "\u547D\u5BAB";
    ZiweiPalace["XIONGDI"] = "\u5144\u5F1F\u5BAB";
    ZiweiPalace["FUQI"] = "\u592B\u59BB\u5BAB";
    ZiweiPalace["ZINV"] = "\u5B50\u5973\u5BAB";
    ZiweiPalace["CAIBO"] = "\u8D22\u5E1B\u5BAB";
    ZiweiPalace["JIBING"] = "\u75BE\u5384\u5BAB";
    ZiweiPalace["QIANYI"] = "\u8FC1\u79FB\u5BAB";
    ZiweiPalace["NUNU"] = "\u5974\u4EC6\u5BAB";
    ZiweiPalace["GUANLU"] = "\u5B98\u7984\u5BAB";
    ZiweiPalace["TIANZHAI"] = "\u7530\u5B85\u5BAB";
    ZiweiPalace["FUDE"] = "\u798F\u5FB7\u5BAB";
    ZiweiPalace["FUMU"] = "\u7236\u6BCD\u5BAB";
})(ZiweiPalace || (exports.ZiweiPalace = ZiweiPalace = {}));
// ==================== 常量映射表 ====================
/**
 * 地支索引映射
 */
exports.EARTHLY_BRANCH_INDICES = {
    [EarthlyBranch.ZI]: 0,
    [EarthlyBranch.CHOU]: 1,
    [EarthlyBranch.YIN]: 2,
    [EarthlyBranch.MAO]: 3,
    [EarthlyBranch.CHEN]: 4,
    [EarthlyBranch.SI]: 5,
    [EarthlyBranch.WU]: 6,
    [EarthlyBranch.WEI]: 7,
    [EarthlyBranch.SHEN]: 8,
    [EarthlyBranch.YOU]: 9,
    [EarthlyBranch.XU]: 10,
    [EarthlyBranch.HAI]: 11
};
/**
 * 宫位名称数组（按地支顺序）
 */
exports.PALACE_NAMES = [
    ZiweiPalace.MING, // 子宫
    ZiweiPalace.FUMU, // 丑宫
    ZiweiPalace.FUDE, // 寅宫
    ZiweiPalace.TIANZHAI, // 卯宫
    ZiweiPalace.GUANLU, // 辰宫
    ZiweiPalace.NUNU, // 巳宫
    ZiweiPalace.QIANYI, // 午宫
    ZiweiPalace.JIBING, // 未宫
    ZiweiPalace.CAIBO, // 申宫
    ZiweiPalace.ZINV, // 酉宫
    ZiweiPalace.FUQI, // 戌宫
    ZiweiPalace.XIONGDI // 亥宫
];
exports.default = {
    HeavenlyStem,
    EarthlyBranch,
    FiveElementsBureau,
    ZiweiMainStar,
    ZiweiAuxiliaryStar,
    ZiweiMinorStar,
    SiHua,
    ZiweiPalace,
    EARTHLY_BRANCH_INDICES: exports.EARTHLY_BRANCH_INDICES,
    PALACE_NAMES: exports.PALACE_NAMES
};
