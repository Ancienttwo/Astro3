// 检查fortune_slips表结构
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFortuneSlipsStructure() {
  console.log('🔍 检查fortune_slips表结构...\n');

  try {
    // 获取一条记录查看所有字段
    const { data: sampleSlip, error } = await supabase
      .from('fortune_slips')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      throw new Error(`获取样本数据失败: ${error.message}`);
    }

    console.log('📋 fortune_slips表字段:');
    Object.keys(sampleSlip).forEach(key => {
      const value = sampleSlip[key];
      const type = Array.isArray(value) ? 'array' : typeof value;
      const preview = Array.isArray(value) ? `[${value.length} items]` : 
                     typeof value === 'string' ? value.substring(0, 50) + '...' : 
                     String(value);
      
      console.log(`  ${key}: ${type} = ${preview}`);
    });

    // 检查是否有多语言字段
    const multilingualFields = Object.keys(sampleSlip).filter(key => 
      key.includes('_en') || key.includes('_ja') || key.includes('title_') || key.includes('content_')
    );

    console.log('\n🌐 多语言字段:');
    if (multilingualFields.length > 0) {
      multilingualFields.forEach(field => {
        console.log(`  ${field}: ${sampleSlip[field] || 'null'}`);
      });
    } else {
      console.log('  未找到多语言字段');
    }

    // 检查是否可以更新多语言字段
    console.log('\n🧪 测试多语言字段更新...');
    
    const { data: updateResult, error: updateError } = await supabase
      .from('fortune_slips')
      .update({
        title_en: 'Test English Title',
        content_en: 'Test English Content',
        basic_interpretation_en: 'Test English Interpretation'
      })
      .eq('id', sampleSlip.id)
      .select();

    if (updateError) {
      console.error('❌ 更新多语言字段失败:', updateError);
    } else {
      console.log('✅ 多语言字段更新成功');
      console.log('更新结果:', updateResult[0]?.title_en);

      // 恢复原始值
      await supabase
        .from('fortune_slips')
        .update({
          title_en: sampleSlip.title_en,
          content_en: sampleSlip.content_en,
          basic_interpretation_en: sampleSlip.basic_interpretation_en
        })
        .eq('id', sampleSlip.id);
    }

    return sampleSlip;

  } catch (error) {
    console.error('❌ 检查表结构失败:', error.message);
    return null;
  }
}

async function main() {
  const structure = await checkFortuneSlipsStructure();
  
  if (structure) {
    console.log('\n✅ 表结构检查完成');
    
    // 判断是否可以使用现有的多语言字段
    const hasMultilingualFields = Object.keys(structure).some(key => 
      key.includes('_en') || key.includes('_ja')
    );
    
    if (hasMultilingualFields) {
      console.log('🎉 可以使用现有的多语言字段直接存储翻译数据！');
    } else {
      console.log('⚠️  需要手动创建独立的i18n表');
    }
  }
}

main();