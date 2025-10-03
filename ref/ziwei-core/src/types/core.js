/**
 * Core type definitions for ZiWei Dou Shu calculations
 * 紫微斗数核心类型定义
 */
/**
 * Calculation Error (计算错误)
 */
export class ZiWeiCalculationError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ZiWeiCalculationError';
    }
}
/**
 * Validation Error (验证错误)
 */
export class ZiWeiValidationError extends Error {
    field;
    value;
    constructor(message, field, value) {
        super(message);
        this.field = field;
        this.value = value;
        this.name = 'ZiWeiValidationError';
    }
}
//# sourceMappingURL=core.js.map