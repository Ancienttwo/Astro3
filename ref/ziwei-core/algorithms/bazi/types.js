"use strict";
/**
 * 八字分析系统核心类型定义
 * 从生产环境迁移 - AstroZi Mobile
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenGodCalculator = exports.ElementRelations = exports.SeasonalMatrix = void 0;
// ========================= 季节强度矩阵 =========================
class SeasonalMatrix {
    static getFactor(monthBranch, element) {
        return this.MATRIX[monthBranch]?.[element] ?? 1.00;
    }
    static getAllFactors(monthBranch) {
        return this.MATRIX[monthBranch] ?? {
            "木": 1.00, "火": 1.00, "土": 1.00, "金": 1.00, "水": 1.00
        };
    }
}
exports.SeasonalMatrix = SeasonalMatrix;
SeasonalMatrix.MATRIX = {
    "寅": { "木": 1.35, "火": 1.10, "土": 0.75, "金": 0.65, "水": 0.90 },
    "卯": { "木": 1.40, "火": 1.15, "土": 0.70, "金": 0.60, "水": 0.85 },
    "辰": { "木": 1.05, "火": 0.95, "土": 1.25, "金": 1.00, "水": 0.95 },
    "巳": { "木": 0.95, "火": 1.30, "土": 1.10, "金": 0.80, "水": 0.70 },
    "午": { "木": 0.85, "火": 1.40, "土": 1.15, "金": 0.75, "水": 0.60 },
    "未": { "木": 0.90, "火": 1.20, "土": 1.30, "金": 0.95, "水": 0.75 },
    "申": { "木": 0.70, "火": 0.80, "土": 1.05, "金": 1.35, "水": 1.10 },
    "酉": { "木": 0.60, "火": 0.75, "土": 1.00, "金": 1.40, "水": 1.15 },
    "戌": { "木": 0.75, "火": 0.95, "土": 1.25, "金": 1.20, "水": 0.90 },
    "亥": { "木": 1.10, "火": 0.70, "土": 0.85, "金": 0.90, "水": 1.30 },
    "子": { "木": 1.20, "火": 0.60, "土": 0.80, "金": 0.95, "水": 1.40 },
    "丑": { "木": 0.95, "火": 0.75, "土": 1.20, "金": 1.10, "水": 1.25 }
};
// ========================= 五行关系计算器 =========================
class ElementRelations {
    static generates(from, to) {
        const fromIndex = this.CYCLE.indexOf(from);
        const toIndex = this.CYCLE.indexOf(to);
        return (fromIndex + 1) % 5 === toIndex;
    }
    static controls(from, to) {
        const controlPairs = new Set([
            "木土", "土水", "水火", "火金", "金木"
        ]);
        return controlPairs.has(from + to);
    }
    static getGeneratedElement(from) {
        const fromIndex = this.CYCLE.indexOf(from);
        return this.CYCLE[(fromIndex + 1) % 5];
    }
    static getControlledElement(from) {
        const controlMap = {
            "木": "土", "土": "水", "水": "火", "火": "金", "金": "木"
        };
        return controlMap[from];
    }
    static getGeneratingElement(to) {
        const toIndex = this.CYCLE.indexOf(to);
        return this.CYCLE[(toIndex + 4) % 5];
    }
    static getControllingElement(to) {
        const controlMap = {
            "木": "金", "火": "水", "土": "木", "金": "火", "水": "土"
        };
        return controlMap[to];
    }
}
exports.ElementRelations = ElementRelations;
ElementRelations.CYCLE = ["木", "火", "土", "金", "水"];
// ========================= 十神关系计算器 =========================
class TenGodCalculator {
    static getTenGod(dayElement, dayYinYang, targetElement, targetYinYang) {
        const sameYinYang = dayYinYang === targetYinYang;
        if (dayElement === targetElement) {
            return sameYinYang ? '比肩' : '劫财';
        }
        if (ElementRelations.generates(dayElement, targetElement)) {
            return sameYinYang ? '食神' : '伤官';
        }
        if (ElementRelations.generates(targetElement, dayElement)) {
            return sameYinYang ? '偏印' : '正印';
        }
        if (ElementRelations.controls(dayElement, targetElement)) {
            return sameYinYang ? '偏财' : '正财';
        }
        if (ElementRelations.controls(targetElement, dayElement)) {
            return sameYinYang ? '七杀' : '正官';
        }
        throw new Error(`Invalid element relationship: ${dayElement}-${targetElement}`);
    }
    static getTenGodElement(dayElement, tenGod) {
        switch (tenGod) {
            case '比肩':
            case '劫财':
                return dayElement;
            case '食神':
            case '伤官':
                return ElementRelations.getGeneratedElement(dayElement);
            case '正印':
            case '偏印':
                return ElementRelations.getGeneratingElement(dayElement);
            case '正财':
            case '偏财':
                return ElementRelations.getControlledElement(dayElement);
            case '正官':
            case '七杀':
                return ElementRelations.getControllingElement(dayElement);
            default:
                throw new Error(`Unknown ten god: ${tenGod}`);
        }
    }
}
exports.TenGodCalculator = TenGodCalculator;
