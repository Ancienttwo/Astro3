// 测试Supabase连接
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 测试Supabase连接...');
console.log('URL:', supabaseUrl?.substring(0, 30) + '...');
console.log('Key:', supabaseKey?.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // 测试简单的查询
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Auth test failed:', error.message);
    } else {
      console.log('✅ Auth connection works');
    }

    // 测试数据库查询
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (userError) {
      console.log('❌ Database test failed:', userError.message);
    } else {
      console.log('✅ Database connection works');
    }

    // 测试已知存在的表
    const tables = ['users', 'temple_systems', 'fortune_slips'];
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: ${count || 0} rows`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();