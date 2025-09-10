// 手动创建多语言翻译表
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createI18nTableManual() {
  console.log('🚀 手动创建多语言翻译表...\n');

  try {
    // 先检查fortune_slips表结构，确保我们可以创建外键
    console.log('检查fortune_slips表...');
    const { data: sampleSlip, error: slipError } = await supabase
      .from('fortune_slips')
      .select('id')
      .limit(1)
      .single();

    if (slipError) {
      throw new Error(`fortune_slips表不存在: ${slipError.message}`);
    }

    console.log('✅ fortune_slips表存在，示例ID:', sampleSlip.id);

    // 使用直接的INSERT方式创建记录来测试表是否存在
    console.log('\n创建多语言翻译表记录...');
    
    const testRecord = {
      slip_id: sampleSlip.id,
      language_code: 'zh-TW',
      title: '创建表测试',
      content: '这是一个测试内容',
      basic_interpretation: '这是测试解读',
      historical_context: null,
      symbolism: null
    };

    // 如果表不存在，这个操作会失败
    const { data: createResult, error: createError } = await supabase
      .from('fortune_slips_i18n')
      .insert([testRecord])
      .select();

    if (createError) {
      console.error('❌ 表不存在，错误:', createError);
      
      // 如果是表不存在的错误，我们需要手动创建
      if (createError.code === '42P01') {
        console.log('\n📝 表不存在，需要在Supabase Dashboard中创建');
        console.log('\n请按以下步骤在Supabase Dashboard中创建表:');
        console.log('1. 打开 https://supabase.com/dashboard');
        console.log('2. 选择项目 -> Table Editor -> New table');
        console.log('3. 表名: fortune_slips_i18n');
        console.log('4. 添加以下列:');
        console.log('   - id: uuid, primary key, default: gen_random_uuid()');
        console.log('   - slip_id: uuid, not null, foreign key to fortune_slips(id)');
        console.log('   - language_code: varchar, not null, 最大长度: 10');
        console.log('   - title: varchar, not null, 最大长度: 200');
        console.log('   - content: text, not null');
        console.log('   - basic_interpretation: text, not null');
        console.log('   - historical_context: text, nullable');
        console.log('   - symbolism: text, nullable');
        console.log('   - created_at: timestamptz, default: now()');
        console.log('   - updated_at: timestamptz, default: now()');
        console.log('5. 添加约束: UNIQUE(slip_id, language_code)');
        console.log('6. 启用RLS并添加策略');
        
        return false;
      } else {
        throw createError;
      }
    } else {
      console.log('✅ 多语言翻译表存在并可写入');
      console.log('创建结果:', createResult);

      // 清理测试数据
      const { error: deleteError } = await supabase
        .from('fortune_slips_i18n')
        .delete()
        .eq('title', '创建表测试');

      if (deleteError) {
        console.warn('⚠️  清理测试数据失败:', deleteError);
      } else {
        console.log('✅ 测试数据已清理');
      }

      return true;
    }

  } catch (error) {
    console.error('❌ 创建表时发生错误:', error.message);
    return false;
  }
}

async function main() {
  const success = await createI18nTableManual();
  
  if (success) {
    console.log('\n🎉 多语言翻译表已就绪！');
  } else {
    console.log('\n⚠️  需要手动创建表');
  }
}

main();