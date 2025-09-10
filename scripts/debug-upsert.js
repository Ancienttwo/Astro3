// 调试upsert操作
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUpsert() {
  console.log('🔍 调试upsert操作...\n');

  try {
    // 获取关帝庙签文ID
    const { data: temple } = await supabase
      .from('temple_systems')
      .select('id')
      .eq('temple_code', 'guandi')
      .single();

    const { data: slips } = await supabase
      .from('fortune_slips')
      .select('id, slip_number')
      .eq('temple_system_id', temple.id)
      .eq('slip_number', 1)
      .single();

    console.log('签文信息:', slips);

    // 测试简单插入
    console.log('\n测试简单插入...');
    const testData = {
      slip_id: slips.id,
      language_code: 'zh-TW',
      title: '测试标题',
      content: '测试内容',
      basic_interpretation: '测试解读'
    };

    console.log('插入数据:', testData);

    const { data: insertResult, error: insertError } = await supabase
      .from('fortune_slips_i18n')
      .insert(testData)
      .select();

    if (insertError) {
      console.error('❌ 插入失败:', insertError);
      console.error('错误详情:', JSON.stringify(insertError, null, 2));
    } else {
      console.log('✅ 插入成功:', insertResult);

      // 清理测试数据
      const { error: deleteError } = await supabase
        .from('fortune_slips_i18n')
        .delete()
        .eq('title', '测试标题');

      if (deleteError) {
        console.warn('⚠️  清理测试数据失败:', deleteError);
      } else {
        console.log('✅ 测试数据已清理');
      }
    }

    // 测试upsert
    console.log('\n测试upsert...');
    const upsertData = {
      slip_id: slips.id,
      language_code: 'zh-TW',
      title: '测试Upsert标题',
      content: '测试Upsert内容',
      basic_interpretation: '测试Upsert解读'
    };

    const { data: upsertResult, error: upsertError } = await supabase
      .from('fortune_slips_i18n')
      .upsert(upsertData, {
        onConflict: 'slip_id,language_code'
      })
      .select();

    if (upsertError) {
      console.error('❌ Upsert失败:', upsertError);
      console.error('错误详情:', JSON.stringify(upsertError, null, 2));
    } else {
      console.log('✅ Upsert成功:', upsertResult);

      // 清理测试数据
      await supabase
        .from('fortune_slips_i18n')
        .delete()
        .eq('title', '测试Upsert标题');
    }

  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error.message);
    console.error('Error stack:', error.stack);
  }
}

debugUpsert();