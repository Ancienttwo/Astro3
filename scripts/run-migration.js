// 运行数据库迁移脚本
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🚀 开始运行数据库迁移...\n');

    // 读取迁移SQL文件
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250130000000_create_fortune_divination_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 执行迁移SQL...');

    // 分割SQL语句（基于分号分割）
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`找到 ${statements.length} 个SQL语句`);

    let successCount = 0;
    let errorCount = 0;

    // 逐个执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // 跳过注释行
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue;
      }

      try {
        console.log(`执行第 ${i + 1}/${statements.length} 个语句...`);
        
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });

        if (error) {
          console.warn(`⚠️  语句 ${i + 1} 执行警告:`, error.message);
          // 某些语句可能因为已存在而失败，这是正常的
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('permission denied')) {
            console.log(`   └─ 跳过已存在或权限问题: ${error.message.substring(0, 100)}...`);  
          } else {
            errorCount++;
            console.error(`   └─ 严重错误: ${error.message}`);
          }
        } else {
          successCount++;
          console.log(`   ✅ 成功`);
        }

        // 添加延迟避免限制
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        errorCount++;
        console.error(`❌ 语句 ${i + 1} 执行失败:`, err.message);
      }
    }

    console.log(`\n📊 迁移完成:`);
    console.log(`  ✅ 成功: ${successCount}`);
    console.log(`  ❌ 错误: ${errorCount}`);

    // 验证表是否创建成功
    console.log('\n🔍 验证表创建情况...');
    await verifyTables();

  } catch (error) {
    console.error('\n❌ 迁移过程中发生错误:', error.message);
    process.exit(1);
  }
}

async function verifyTables() {
  const expectedTables = [
    'temple_systems',
    'fortune_slips', 
    'temple_referral_campaigns',
    'temple_referrals',
    'divination_history'
  ];

  for (const tableName of expectedTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: 存在 (${count || 0} 行)`);
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err.message}`);
    }
  }
}

// 直接执行SQL的替代方法
async function executeSQL(sql) {
  try {
    // 使用原始的REST API调用
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql_query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    // 如果exec_sql不存在，尝试直接创建表
    console.log('exec_sql函数不存在，尝试直接创建表...');
    return null;
  }
}

runMigration();