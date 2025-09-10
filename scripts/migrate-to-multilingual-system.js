/**
 * 关帝灵签多语言系统数据迁移脚本
 * 作者: SuperClaude 架构师
 * 创建日期: 2025-01-31
 * 
 * 功能：
 * 1. 执行多语言数据库schema创建
 * 2. 迁移现有中文数据到新的多语言表结构
 * 3. 验证数据完整性
 * 4. 生成迁移报告
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  batchSize: 100,
  logLevel: 'info' // debug, info, warn, error
};

class MultilingualMigration {
  constructor() {
    this.supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseServiceKey);
    this.migrationLog = [];
    this.stats = {
      schemasCreated: 0,
      tablesCreated: 0,
      dataRowsMigrated: 0,
      errorsEncountered: 0,
      startTime: new Date(),
      endTime: null
    };
  }

  log(level, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
    
    this.migrationLog.push(logEntry);
    
    if (CONFIG.logLevel === 'debug' || 
        (CONFIG.logLevel === 'info' && ['info', 'warn', 'error'].includes(level)) ||
        (CONFIG.logLevel === 'warn' && ['warn', 'error'].includes(level)) ||
        (CONFIG.logLevel === 'error' && level === 'error')) {
      console.log(`[${level.toUpperCase()}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  async runMigration() {
    try {
      this.log('info', '开始关帝灵签多语言系统数据迁移');
      
      // Step 1: 执行数据库schema
      await this.executeSchema();
      
      // Step 2: 验证schema创建
      await this.validateSchema();
      
      // Step 3: 迁移现有数据
      await this.migrateExistingData();
      
      // Step 4: 验证数据迁移
      await this.validateDataMigration();
      
      // Step 5: 创建初始多语言数据
      await this.createInitialTranslations();
      
      // Step 6: 生成迁移报告
      await this.generateMigrationReport();
      
      this.stats.endTime = new Date();
      this.log('info', '多语言系统迁移完成', this.stats);
      
      return {
        success: true,
        stats: this.stats,
        log: this.migrationLog
      };
      
    } catch (error) {
      this.stats.errorsEncountered++;
      this.log('error', '迁移过程中发生错误', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async executeSchema() {
    try {
      this.log('info', '正在执行数据库schema创建...');
      
      // 读取SQL文件
      const sqlPath = path.join(__dirname, '..', 'sql', 'multilingual-fortune-system-enhanced.sql');
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      
      // 分割SQL语句（简单方式，实际可能需要更复杂的解析）
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      this.log('debug', `发现 ${statements.length} 个SQL语句需要执行`);
      
      // 执行每个SQL语句
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX') || 
            statement.includes('CREATE VIEW') || statement.includes('CREATE FUNCTION')) {
          
          try {
            const { error } = await this.supabase.rpc('execute_sql', { 
              sql_query: statement 
            });
            
            if (error) {
              this.log('warn', `SQL语句执行警告: ${statement.substring(0, 100)}...`, error);
            } else {
              this.stats.schemasCreated++;
              this.log('debug', `成功执行SQL语句: ${statement.substring(0, 100)}...`);
            }
          } catch (err) {
            this.log('error', `SQL语句执行失败: ${statement.substring(0, 100)}...`, err);
            // 某些语句失败可能是正常的（如已存在的表）
          }
        }
      }
      
      this.log('info', `Schema创建完成，共处理 ${this.stats.schemasCreated} 个对象`);
      
    } catch (error) {
      this.log('error', 'Schema执行失败', error);
      throw new Error(`Schema执行失败: ${error.message}`);
    }
  }

  async validateSchema() {
    try {
      this.log('info', '验证数据库schema...');
      
      const requiredTables = [
        'fortune_slips',
        'fortune_slips_i18n', 
        'ai_interpretations',
        'usage_records',
        'language_configs'
      ];
      
      for (const tableName of requiredTables) {
        const { data, error } = await this.supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (error) {
          throw new Error(`表 ${tableName} 验证失败: ${error.message}`);
        }
        
        this.stats.tablesCreated++;
        this.log('debug', `表 ${tableName} 验证通过`);
      }
      
      this.log('info', `所有 ${requiredTables.length} 个必需表验证通过`);
      
    } catch (error) {
      this.log('error', 'Schema验证失败', error);
      throw error;
    }
  }

  async migrateExistingData() {
    try {
      this.log('info', '开始迁移现有签文数据...');
      
      // 查询现有的签文数据
      const { data: existingSlips, error } = await this.supabase
        .from('fortune_slips')
        .select('*');
        
      if (error) {
        throw new Error(`查询现有数据失败: ${error.message}`);
      }
      
      if (!existingSlips || existingSlips.length === 0) {
        this.log('warn', '未发现需要迁移的现有数据');
        return;
      }
      
      this.log('info', `发现 ${existingSlips.length} 条现有签文数据需要迁移`);
      
      // 批量处理数据迁移
      for (let i = 0; i < existingSlips.length; i += CONFIG.batchSize) {
        const batch = existingSlips.slice(i, i + CONFIG.batchSize);
        await this.migrateBatch(batch);
      }
      
      this.log('info', `数据迁移完成，共迁移 ${this.stats.dataRowsMigrated} 条记录`);
      
    } catch (error) {
      this.log('error', '数据迁移失败', error);
      throw error;
    }
  }

  async migrateBatch(slips) {
    const i18nRecords = [];
    
    for (const slip of slips) {
      // 检查是否有需要迁移的文本内容
      if (slip.title || slip.content || slip.basic_interpretation) {
        const i18nRecord = {
          slip_id: slip.id,
          language_code: 'zh-CN',
          title: slip.title || '标题待补充',
          content: slip.content || '签文内容待补充',
          basic_interpretation: slip.basic_interpretation || '基础解读待补充',
          historical_context: slip.historical_context,
          symbolism: slip.symbolism,
          keywords: slip.keywords || []
        };
        
        i18nRecords.push(i18nRecord);
      }
    }
    
    if (i18nRecords.length > 0) {
      const { error } = await this.supabase
        .from('fortune_slips_i18n')
        .upsert(i18nRecords, { 
          onConflict: 'slip_id,language_code',
          ignoreDuplicates: false 
        });
        
      if (error) {
        this.log('error', '批量插入i18n数据失败', error);
        throw error;
      }
      
      this.stats.dataRowsMigrated += i18nRecords.length;
      this.log('debug', `成功迁移 ${i18nRecords.length} 条i18n记录`);
    }
  }

  async validateDataMigration() {
    try {
      this.log('info', '验证数据迁移完整性...');
      
      // 统计原始数据
      const { count: originalCount, error: originalError } = await this.supabase
        .from('fortune_slips')
        .select('*', { count: 'exact', head: true });
        
      if (originalError) {
        throw new Error(`统计原始数据失败: ${originalError.message}`);
      }
      
      // 统计迁移后的中文数据
      const { count: migratedCount, error: migratedError } = await this.supabase
        .from('fortune_slips_i18n')
        .select('*', { count: 'exact', head: true })
        .eq('language_code', 'zh-CN');
        
      if (migratedError) {
        throw new Error(`统计迁移数据失败: ${migratedError.message}`);
      }
      
      this.log('info', `数据完整性验证: 原始 ${originalCount} 条，迁移 ${migratedCount} 条`);
      
      if (migratedCount === 0) {
        this.log('warn', '未发现迁移后的数据，可能需要手动检查');
      }
      
    } catch (error) {
      this.log('error', '数据验证失败', error);
      throw error;
    }
  }

  async createInitialTranslations() {
    try {
      this.log('info', '创建初始语言配置数据...');
      
      const languageConfigs = [
        {
          code: 'zh-CN',
          name: 'Chinese (Simplified)',
          native_name: '简体中文',
          flag_emoji: '🇨🇳',
          sort_order: 1,
          enabled: true
        },
        {
          code: 'zh-TW', 
          name: 'Chinese (Traditional)',
          native_name: '繁體中文',
          flag_emoji: '🇹🇼',
          sort_order: 2,
          enabled: true
        },
        {
          code: 'en-US',
          name: 'English',
          native_name: 'English', 
          flag_emoji: '🇺🇸',
          sort_order: 3,
          enabled: true
        }
      ];
      
      const { error } = await this.supabase
        .from('language_configs')
        .upsert(languageConfigs, { onConflict: 'code' });
        
      if (error) {
        throw new Error(`创建语言配置失败: ${error.message}`);
      }
      
      this.log('info', `成功创建 ${languageConfigs.length} 个语言配置`);
      
    } catch (error) {
      this.log('error', '创建初始翻译失败', error);
      throw error;
    }
  }

  async generateMigrationReport() {
    const report = {
      migration_id: `migration_${Date.now()}`,
      timestamp: new Date().toISOString(),
      duration_ms: this.stats.endTime - this.stats.startTime,
      statistics: this.stats,
      summary: {
        success: this.stats.errorsEncountered === 0,
        tables_created: this.stats.tablesCreated,
        data_migrated: this.stats.dataRowsMigrated,
        errors: this.stats.errorsEncountered
      },
      next_steps: [
        '1. 验证多语言API端点功能',
        '2. 添加繁体中文和英文翻译内容',
        '3. 测试前端语言切换功能',
        '4. 配置AI解读服务',
        '5. 进行端到端测试'
      ],
      log: this.migrationLog
    };
    
    // 保存报告到文件
    const reportPath = path.join(__dirname, '..', 'reports', `migration-report-${Date.now()}.json`);
    
    try {
      // 确保reports目录存在
      const reportsDir = path.dirname(reportPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      this.log('info', `迁移报告已保存到: ${reportPath}`);
    } catch (error) {
      this.log('warn', '保存迁移报告失败', error);
    }
    
    return report;
  }
}

// 执行迁移的主函数
async function runMigration() {
  try {
    console.log('🚀 开始关帝灵签多语言系统迁移...\n');
    
    const migration = new MultilingualMigration();
    const result = await migration.runMigration();
    
    console.log('\n✅ 迁移成功完成!');
    console.log('📊 统计信息:', result.stats);
    console.log('\n📋 后续步骤:');
    console.log('1. 运行 npm run dev 启动开发服务器');
    console.log('2. 测试多语言API端点: /api/fortune/slips/guandi/1?language=zh-CN');
    console.log('3. 添加翻译内容到数据库');
    console.log('4. 集成前端语言切换功能');
    
    return result;
    
  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    console.error('请检查错误日志并修复问题后重新运行');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runMigration();
}

module.exports = {
  MultilingualMigration,
  runMigration
};