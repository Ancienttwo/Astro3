// 检查RLS策略
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLSPolicies() {
  console.log('🔍 检查RLS策略和权限...\n');

  try {
    // 检查表是否启用了RLS
    console.log('1. 检查fortune_slips_i18n表结构...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('fortune_slips_i18n')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ 无法访问fortune_slips_i18n表:', tableError);
      return;
    }

    console.log('✅ 可以读取fortune_slips_i18n表');

    // 测试使用anon key
    console.log('\n2. 测试匿名访问...');
    const anonSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: anonData, error: anonError } = await anonSupabase
      .from('fortune_slips_i18n')
      .select('*')
      .limit(1);

    if (anonError) {
      console.log('❌ 匿名用户无法访问:', anonError.message);
    } else {
      console.log('✅ 匿名用户可以访问');
    }

    // 尝试直接插入（不使用upsert）
    console.log('\n3. 测试service_role直接插入...');
    
    // 先获取一个签文ID
    const { data: slip } = await supabase
      .from('fortune_slips')
      .select('id')
      .limit(1)
      .single();

    if (slip) {
      const testRecord = {
        slip_id: slip.id,
        language_code: 'test',
        title: '测试RLS',
        content: '测试内容',
        basic_interpretation: '测试解读'
      };

      // 尝试插入
      const { data: insertData, error: insertError } = await supabase
        .from('fortune_slips_i18n')
        .insert(testRecord);

      if (insertError) {
        console.error('❌ Service role插入失败:', insertError);
        
        // 检查是否是约束问题
        if (insertError.message.includes('check constraint')) {
          console.log('⚠️  可能是语言代码约束问题，测试有效语言代码...');
          
          const validTestRecord = {
            ...testRecord,
            language_code: 'zh-CN'
          };

          const { data: validData, error: validError } = await supabase
            .from('fortune_slips_i18n')
            .insert(validTestRecord);

          if (validError) {
            console.error('❌ 使用有效语言代码仍然失败:', validError);
          } else {
            console.log('✅ 插入成功！问题是语言代码约束');
            
            // 清理测试数据
            await supabase
              .from('fortune_slips_i18n')
              .delete()
              .eq('language_code', 'zh-CN')
              .eq('title', '测试RLS');
          }
        }
      } else {
        console.log('✅ Service role插入成功');
        
        // 清理测试数据
        await supabase
          .from('fortune_slips_i18n')
          .delete()
          .eq('language_code', 'test')
          .eq('title', '测试RLS');
      }
    }

    // 检查外键约束
    console.log('\n4. 检查外键约束...');
    const { data: constraints } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name='fortune_slips_i18n';
      `
    }).catch(() => null);

    if (constraints) {
      console.log('表约束信息:', constraints);
    }

  } catch (error) {
    console.error('❌ 检查RLS时发生错误:', error.message);
  }
}

checkRLSPolicies();