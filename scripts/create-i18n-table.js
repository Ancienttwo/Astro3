// 创建多语言翻译表
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createI18nTable() {
  console.log('🚀 创建多语言翻译表...\n');

  try {
    // 使用SQL直接创建表
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS fortune_slips_i18n (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slip_id UUID NOT NULL,
        language_code VARCHAR(10) NOT NULL CHECK (language_code IN ('zh-CN', 'zh-TW', 'en-US')),
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        basic_interpretation TEXT NOT NULL,
        historical_context TEXT,
        symbolism TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- 确保每个签文的每种语言只有一条记录
        UNIQUE(slip_id, language_code),
        
        -- 外键约束
        FOREIGN KEY (slip_id) REFERENCES fortune_slips(id) ON DELETE CASCADE
      );
    `;

    console.log('📝 创建fortune_slips_i18n表...');
    
    // 尝试直接执行SQL - 这可能不工作，但值得一试
    const { data, error } = await supabase.rpc('exec_sql', {
      query: createTableSQL
    });

    if (error && error.message.includes('does not exist')) {
      console.log('⚠️  exec_sql函数不存在，尝试通过API创建...');
      
      // 如果exec_sql不存在，我们尝试通过插入数据来"创建"表
      // 这通常不会工作，但Supabase有时会自动创建表
      const { error: insertError } = await supabase
        .from('fortune_slips_i18n')
        .insert({
          slip_id: '00000000-0000-0000-0000-000000000000', // dummy ID
          language_code: 'zh-CN',
          title: 'test',
          content: 'test',
          basic_interpretation: 'test'
        });

      // 删除测试数据
      if (!insertError) {
        await supabase
          .from('fortune_slips_i18n')
          .delete()
          .eq('title', 'test');
        console.log('✅ 表已存在或已创建');
      } else {
        console.log('❌ 创建表失败:', insertError.message);
        
        // 如果表不存在，我们需要手动在Supabase Dashboard中创建
        console.log('\n📝 请在Supabase Dashboard中手动创建表:');
        console.log('Table Editor -> New table -> fortune_slips_i18n');
        console.log('列定义:');
        console.log('- id: uuid, primary key, default: gen_random_uuid()');
        console.log('- slip_id: uuid, not null, foreign key to fortune_slips(id)');
        console.log('- language_code: varchar(10), not null, check in (zh-CN, zh-TW, en-US)');
        console.log('- title: varchar(200), not null');
        console.log('- content: text, not null');
        console.log('- basic_interpretation: text, not null');
        console.log('- historical_context: text, nullable');
        console.log('- symbolism: text, nullable');
        console.log('- created_at: timestamptz, default now()');
        console.log('- updated_at: timestamptz, default now()');
        console.log('- UNIQUE constraint: (slip_id, language_code)');
        
        return false;
      }
    } else if (error) {
      console.error('❌ 创建表失败:', error);
      return false;
    } else {
      console.log('✅ 表创建成功');
    }

    // 创建索引
    const indexes = [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fortune_slips_i18n_lookup ON fortune_slips_i18n(slip_id, language_code)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fortune_slips_i18n_language ON fortune_slips_i18n(language_code)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fortune_slips_i18n_content ON fortune_slips_i18n(language_code, slip_id) INCLUDE (title, content, basic_interpretation)'
    ];

    console.log('📝 创建索引...');
    for (const indexSQL of indexes) {
      try {
        const { error: indexError } = await supabase.rpc('exec_sql', {
          query: indexSQL
        });
        
        if (indexError && !indexError.message.includes('already exists')) {
          console.warn('⚠️  索引创建警告:', indexError.message);
        }
      } catch (err) {
        console.warn('⚠️  索引创建跳过:', err.message);
      }
    }

    return true;

  } catch (error) {
    console.error('❌ 创建多语言表时发生错误:', error.message);
    return false;
  }
}

async function testI18nTable() {
  console.log('\n🔍 测试多语言翻译表...');
  
  try {
    const { data, error, count } = await supabase
      .from('fortune_slips_i18n')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log('❌ 表不存在或无法访问:', error.message);
      return false;
    } else {
      console.log(`✅ fortune_slips_i18n表可用 (${count || 0} 行)`);
      return true;
    }
  } catch (err) {
    console.log('❌ 测试表失败:', err.message);
    return false;
  }
}

async function main() {
  try {
    // 先测试表是否已存在
    const tableExists = await testI18nTable();
    
    if (tableExists) {
      console.log('✅ 多语言翻译表已存在，无需创建');
    } else {
      console.log('🔧 表不存在，尝试创建...');
      const created = await createI18nTable();
      
      if (created) {
        // 再次测试
        await testI18nTable();
      }
    }

  } catch (error) {
    console.error('\n❌ 执行过程中发生错误:', error.message);
  }
}

main();