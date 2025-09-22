/**
 * 紫微斗数常量定义 - 统一导出入口
 * Constants for ZiWei DouShu calculations - Unified Export Entry
 * 
 * @deprecated 建议直接从 './constants/' 导入以获得更好的模块化体验
 * @ai-context BACKWARD_COMPATIBILITY_LAYER
 * @purpose 保持向后兼容性，同时解决ESLint文件大小限制
 * @migration 逐步迁移到 import from './constants/' 以获得更好的性能
 */

// 重新导出所有常量以保持向后兼容性（显式 index，避免与本文件名冲突导致循环）
export * from './constants/index'

// 为了向后兼容，保持原有的导出方式
// 新代码建议直接从 './constants/' 模块导入
