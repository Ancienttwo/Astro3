// 运行SQL迁移创建i18n表
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQLMigration() {
  console.log('🚀 运行SQL迁移创建i18n表...\n');

  try {
    // 读取SQL文件
    const sqlPath = path.join(__dirname, '../sql/create-i18n-table-corrected.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 SQL内容预览:');
    console.log(sqlContent.substring(0, 200) + '...\n');

    // 分割SQL语句
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`找到 ${statements.length} 个SQL语句\n`);

    // 逐个执行SQL语句（使用fetch直接调用REST API）
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim().length === 0 || statement.startsWith('--')) {
        continue;
      }

      console.log(`执行第 ${i + 1}/${statements.length} 个语句...`);
      console.log(`SQL: ${statement.substring(0, 80)}...`);

      try {
        // 使用原始的fetch API调用Supabase REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            query: statement + ';' 
          })
        });

        if (response.ok) {
          console.log(`✅ 语句 ${i + 1} 执行成功`);
        } else {
          const errorText = await response.text();
          console.warn(`⚠️  语句 ${i + 1} 可能失败: ${response.status} ${errorText}`);
          
          // 某些错误是预期的（比如表已存在）
          if (errorText.includes('already exists') || 
              errorText.includes('does not exist') ||
              response.status === 404) {
            console.log(`   └─ 跳过预期错误`);
          }
        }

      } catch (fetchError) {
        console.warn(`⚠️  语句 ${i + 1} 网络错误:`, fetchError.message);
      }

      // 添加延迟
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // 验证表是否创建成功
    console.log('\n🔍 验证表创建...');
    const { data: testData, error: testError } = await supabase
      .from('fortune_slips_i18n')
      .select('*')
      .limit(1);

    if (testError) {
      if (testError.code === '42P01') {
        console.log('❌ 表仍然不存在，SQL执行可能失败');
        
        // 提供手动创建指导
        console.log('\n📝 请在Supabase Dashboard中手动创建表:');
        console.log('1. 访问 https://supabase.com/dashboard');
        console.log('2. 选择项目 -> Table Editor -> New table');
        console.log('3. 表名: fortune_slips_i18n');
        console.log('4. 列定义:');
        console.log('   id (uuid, primary) | slip_id (uuid, not null) | language_code (varchar(10), not null)');
        console.log('   title (varchar(200), not null) | content (text, not null) | basic_interpretation (text, not null)');
        console.log('   historical_context (text, nullable) | symbolism (text, nullable)');
        console.log('   created_at (timestamptz, default now()) | updated_at (timestamptz, default now())');
        console.log('5. 外键: slip_id -> fortune_slips(id)');
        console.log('6. 唯一约束: (slip_id, language_code)');
        
        return false;
      } else {
        console.log('❌ 验证失败:', testError);
        return false;
      }
    } else {
      console.log('✅ 表创建成功并可访问');
      console.log(`当前记录数: ${testData?.length || 0}`);
      return true;
    }

  } catch (error) {
    console.error('❌ SQL迁移失败:', error.message);
    return false;
  }
}

async function main() {
  const success = await runSQLMigration();
  
  if (success) {
    console.log('\n🎉 i18n表创建成功！可以继续导入翻译数据');
  } else {
    console.log('\n⚠️  需要手动创建表后再继续');
  }
}

main();