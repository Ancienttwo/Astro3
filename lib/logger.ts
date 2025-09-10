/**
 * 生产环境日志控制
 * 自动在生产环境关闭调试日志
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production'

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && level === 'debug') {
      return false
    }
    return true
  }

  debug(...args: any[]) {
    if (this.shouldLog('debug')) {
      console.log('🔍', ...args)
    }
  }

  info(...args: any[]) {
    if (this.shouldLog('info')) {
      console.info('ℹ️', ...args)
    }
  }

  warn(...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn('⚠️', ...args)
    }
  }

  error(...args: any[]) {
    if (this.shouldLog('error')) {
      console.error('❌', ...args)
    }
  }

  // 生产环境安全的日志方法
  production(...args: any[]) {
    if (this.isDevelopment) {
      console.log('🏭', ...args)
    }
  }
}

export const logger = new Logger()

// 向后兼容的console替换（可选）
export const safeConsole = {
  log: (...args: any[]) => logger.debug(...args),
  info: (...args: any[]) => logger.info(...args),
  warn: (...args: any[]) => logger.warn(...args),
  error: (...args: any[]) => logger.error(...args),
}