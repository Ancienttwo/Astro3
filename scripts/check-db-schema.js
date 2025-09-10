// 检查数据库结构脚本
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseSchema() {
  try {
    console.log('🔍 检查数据库结构...\n');

    // 查询所有表名
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (tablesError) {
      console.error('获取表列表失败:', tablesError);
      return;
    }

    console.log('📋 数据库中的表:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // 检查是否有fortune相关的表
    const fortuneTables = tables.filter(t => t.table_name.includes('fortune'));
    console.log('\n🎲 签文相关的表:');
    if (fortuneTables.length > 0) {
      fortuneTables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    } else {
      console.log('  - 未找到签文相关的表');
    }

    // 如果存在fortune表，检查其结构
    for (const table of fortuneTables) {
      console.log(`\n📝 表 ${table.table_name} 的结构:`);
      
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', table.table_name)
        .order('ordinal_position');

      if (!columnsError && columns) {
        columns.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ 检查数据库结构失败:', error.message);
  }
}

checkDatabaseSchema();