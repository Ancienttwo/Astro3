// 检查RLS策略和权限
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPermissions() {
  console.log('🔍 检查RLS策略和权限...\n');

  try {
    // 使用service role key应该能绕过RLS
    console.log('Service Role Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'Not found');

    // 测试直接访问fortune_slips_i18n表
    console.log('\n测试表访问权限...');
    const { data: testSelect, error: selectError } = await supabase
      .from('fortune_slips_i18n')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('❌ SELECT权限测试失败:', selectError);
    } else {
      console.log('✅ SELECT权限正常，当前记录数:', testSelect?.length || 0);
    }

    // 检查表是否启用了RLS
    console.log('\n检查表RLS状态...');
    
    // 尝试通过anon key访问（应该受RLS限制）
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: anonData, error: anonError } = await anonSupabase
      .from('fortune_slips_i18n')
      .select('*')
      .limit(1);

    if (anonError) {
      console.log('✅ RLS正常工作 - anon key被拒绝:', anonError.message);
    } else {
      console.log('⚠️  RLS可能未生效 - anon key可以访问');
    }

    // 尝试一个非常简单的插入
    console.log('\n尝试最简单的插入...');
    
    // 获取一个存在的slip_id
    const { data: slips } = await supabase
      .from('fortune_slips')
      .select('id')
      .limit(1)
      .single();

    if (slips) {
      const simpleData = {
        slip_id: slips.id,
        language_code: 'test',
        title: 'Simple Test',
        content: 'Test Content',
        basic_interpretation: 'Test Interpretation'
      };

      console.log('插入数据:', simpleData);

      // 尝试原始插入
      const { data: insertData, error: insertError } = await supabase
        .from('fortune_slips_i18n')
        .insert([simpleData]);  // 注意这里用数组包装

      if (insertError) {
        console.error('❌ 简单插入失败:', insertError);
        console.error('错误码:', insertError.code);
        console.error('错误详情:', insertError.details);
        console.error('错误提示:', insertError.hint);
      } else {
        console.log('✅ 简单插入成功');
        
        // 清理测试数据
        await supabase
          .from('fortune_slips_i18n')
          .delete()
          .eq('language_code', 'test');
      }
    }

  } catch (error) {
    console.error('❌ 检查权限时发生错误:', error.message);
    console.error('完整错误:', error);
  }
}

checkPermissions();