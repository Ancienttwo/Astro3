// 检查具体表存在性脚本
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tablesToCheck = [
    'fortune_divination_slips',
    'fortune_slips_i18n',
    'ai_interpretations',
    'user_usage_records',
    'manmo_fortune_slips',
    'users',
    'profiles'
  ];

  console.log('🔍 检查具体表是否存在...\n');

  for (const tableName of tablesToCheck) {
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

  // 让我们也试试查看是否有任何关帝相关数据
  console.log('\n🔍 检查关帝签文数据...');
  try {
    const { data, error } = await supabase
      .from('manmo_fortune_slips')
      .select('*')
      .limit(5);

    if (!error && data) {
      console.log('✅ manmo_fortune_slips表中有数据:');
      data.forEach(slip => {
        console.log(`  - 第${slip.slip_number}签: ${slip.title || '无标题'}`);
      });
    }
  } catch (err) {
    console.log('❌ 检查manmo_fortune_slips失败:', err.message);
  }
}

checkTables();