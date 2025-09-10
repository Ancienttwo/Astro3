// 统一输入验证和清理工具
import { z } from 'zod'

// 常用验证规则
export const ValidationRules = {
  // 邮箱验证
  email: z.string().email('邮箱格式不正确').max(254, '邮箱过长'),
  
  // 密码验证
  password: z.string()
    .min(8, '密码至少8位')
    .max(128, '密码过长')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
  
  // 用户名验证
  username: z.string()
    .min(2, '用户名至少2位')
    .max(20, '用户名最多20位')
    .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, '用户名只能包含字母、数字、下划线和中文'),
  
  // 手机号验证
  phone: z.string()
    .regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  
  // 出生日期验证
  birthDate: z.object({
    year: z.number().min(1900).max(2100),
    month: z.number().min(1).max(12),
    day: z.number().min(1).max(31),
    hour: z.number().min(0).max(23)
  }),
  
  // 性别验证
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: '性别必须是男或女' })
  }),
  
  // 命盘类型验证
  chartType: z.enum(['bazi', 'ziwei'], {
    errorMap: () => ({ message: '命盘类型不正确' })
  }),
  
  // 分析类型验证
  analysisType: z.enum([
    'yongshen_analysis', 'tiekou_zhiduan', 
    'ziwei_master', 'sihua_analysis'
  ], {
    errorMap: () => ({ message: '分析类型不正确' })
  }),
  
  // UUID验证
  uuid: z.string().uuid('ID格式不正确'),
  
  // 注册码验证
  registrationCode: z.string()
    .min(6, '注册码至少6位')
    .max(20, '注册码最多20位')
    .regex(/^[A-Z0-9]+$/, '注册码只能包含大写字母和数字'),
  
  // 兑换码验证
  promoCode: z.string()
    .min(4, '兑换码至少4位')
    .max(20, '兑换码最多20位')
    .regex(/^[A-Z0-9]+$/, '兑换码只能包含大写字母和数字'),
  
  // 金额验证
  amount: z.number().positive('金额必须大于0').max(999999, '金额过大'),
  
  // 文本内容验证
  content: z.string()
    .min(1, '内容不能为空')
    .max(10000, '内容过长')
    .refine(content => !containsSuspiciousContent(content), '内容包含敏感信息'),
  
  // 命盘名称验证
  chartName: z.string()
    .min(1, '命盘名称不能为空')
    .max(50, '命盘名称最多50个字符')
    .refine(name => !containsSuspiciousContent(name), '命盘名称包含敏感信息'),
  
  // 分类验证
  category: z.enum(['friends', 'family', 'clients', 'favorites', 'others'], {
    errorMap: () => ({ message: '分类不正确' })
  }),
  
  // 缓存键验证
  cacheKey: z.string()
    .min(1, '缓存键不能为空')
    .max(100, '缓存键过长')
    .regex(/^[a-zA-Z0-9_-]+$/, '缓存键格式不正确'),
  
  // IP地址验证
  ipAddress: z.string()
    .regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, 'IP地址格式不正确'),
  
  // URL验证
  url: z.string().url('URL格式不正确').max(2048, 'URL过长'),
  
  // 分页参数验证
  pagination: z.object({
    page: z.number().min(1).max(1000).default(1),
    limit: z.number().min(1).max(100).default(10)
  })
}

// 敏感内容检测
function containsSuspiciousContent(content: string): boolean {
  const suspiciousPatterns = [
    // SQL注入模式
    /(\bunion\b|\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b)/i,
    // XSS模式
    /<script[^>]*>.*?<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    // 命令注入模式
    /(\$\(|`|\||;|&&|\|\|)/,
    // 敏感路径
    /(\.\.\/)|(\/etc\/)|(\bpasswd\b)|(\bshadow\b)/i,
    // 敏感关键词
    /(\bpassword\b|\btoken\b|\bapi_key\b|\bsecret\b)/i
  ]
  
  return suspiciousPatterns.some(pattern => pattern.test(content))
}

// HTML清理函数
export function sanitizeHtml(html: string): string {
  // 移除所有HTML标签，只保留纯文本
  return html
    .replace(/<[^>]*>/g, '') // 移除HTML标签
    .replace(/&lt;/g, '<')   // 解码HTML实体
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim()
}

// SQL注入防护
export function sanitizeSqlInput(input: string): string {
  // 移除或转义SQL特殊字符
  return input
    .replace(/'/g, "''")     // 转义单引号
    .replace(/"/g, '""')     // 转义双引号
    .replace(/;/g, '')       // 移除分号
    .replace(/--/g, '')      // 移除SQL注释
    .replace(/\/\*/g, '')    // 移除多行注释开始
    .replace(/\*\//g, '')    // 移除多行注释结束
    .trim()
}

// 创建验证器
export class InputValidator {
  // 验证单个字段
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): { 
    success: boolean
    data?: T
    errors?: string[]
  } {
    try {
      const result = schema.parse(data)
      return { success: true, data: result }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(err => err.message)
        }
      }
      return {
        success: false,
        errors: ['验证失败']
      }
    }
  }

  // 验证API请求体
  static validateApiRequest<T>(schema: z.ZodSchema<T>, requestBody: unknown): T {
    try {
      return schema.parse(requestBody)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`请求参数验证失败: ${error.errors.map(e => e.message).join(', ')}`)
      }
      throw new Error('请求参数格式错误')
    }
  }

  // 批量验证
  static validateBatch<T>(schema: z.ZodSchema<T>, dataArray: unknown[]): {
    success: boolean
    validData: T[]
    errors: Array<{ index: number, errors: string[] }>
  } {
    const validData: T[] = []
    const errors: Array<{ index: number, errors: string[] }> = []

    dataArray.forEach((data, index) => {
      const result = this.validate(schema, data)
      if (result.success && result.data) {
        validData.push(result.data)
      } else {
        errors.push({
          index,
          errors: result.errors || ['验证失败']
        })
      }
    })

    return {
      success: errors.length === 0,
      validData,
      errors
    }
  }
}

// 常用验证Schema
export const ApiSchemas = {
  // 创建命盘
  createChart: z.object({
    name: ValidationRules.chartName,
    birth_year: ValidationRules.birthDate.shape.year,
    birth_month: ValidationRules.birthDate.shape.month,
    birth_day: ValidationRules.birthDate.shape.day,
    birth_hour: ValidationRules.birthDate.shape.hour,
    gender: ValidationRules.gender,
    chart_type: ValidationRules.chartType,
    category: ValidationRules.category.optional()
  }),

  // 用户注册
  userRegister: z.object({
    email: ValidationRules.email,
    password: ValidationRules.password,
    username: ValidationRules.username.optional(),
    registration_code: ValidationRules.registrationCode.optional()
  }),

  // 用户登录
  userLogin: z.object({
    email: ValidationRules.email,
    password: z.string().min(1, '密码不能为空')
  }),

  // 创建分析任务
  createAnalysisTask: z.object({
    task_type: ValidationRules.chartType,
    analysis_type: ValidationRules.analysisType,
    input_data: z.object({
      baziData: z.record(z.any()).optional(),
      ziweiData: z.record(z.any()).optional(),
      cacheKey: ValidationRules.cacheKey.optional()
    }),
    user_id: ValidationRules.uuid
  }),

  // 兑换码使用
  redeemPromoCode: z.object({
    code: ValidationRules.promoCode,
    user_email: ValidationRules.email.optional()
  }),

  // 更新用户档案
  updateUserProfile: z.object({
    username: ValidationRules.username.optional(),
    birth_date: z.string().optional(),
    birth_time: z.string().optional(),
    birth_location: z.string().max(100).optional(),
    nickname: ValidationRules.username.optional()
  }),

  // 分页查询
  paginationQuery: z.object({
    page: z.string().transform(str => parseInt(str) || 1),
    limit: z.string().transform(str => Math.min(parseInt(str) || 10, 100))
  })
}

// 导出验证中间件
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return async (requestBody: unknown): Promise<T> => {
    return InputValidator.validateApiRequest(schema, requestBody)
  }
} 