// 直接更新fortune_slips表的多语言字段
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 从JSON文件读取翻译数据
function loadTranslationData() {
  try {
    const dataPath = path.join(__dirname, '../data/guandi-translations-updated.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('读取翻译数据文件失败:', error.message);
    return null;
  }
}

// 获取关帝庙签文映射
async function getGuandiSlips() {
  console.log('获取关帝庙签文列表...');
  
  try {
    const { data: temple } = await supabase
      .from('temple_systems')
      .select('id')
      .eq('temple_code', 'guandi')
      .single();

    const { data: slips, error } = await supabase
      .from('fortune_slips')
      .select('id, slip_number, title')
      .eq('temple_system_id', temple.id)
      .order('slip_number');

    if (error) {
      throw new Error(`获取签文失败: ${error.message}`);
    }

    console.log(`✅ 获取到 ${slips.length} 个签文`);
    return slips;
    
  } catch (error) {
    console.error('❌ 获取签文失败:', error.message);
    return null;
  }
}

// 更新签文的多语言字段
async function updateMultilingualFields(translations) {
  console.log('\n开始更新多语言字段...\n');

  const slips = await getGuandiSlips();
  if (!slips) {
    throw new Error('无法获取签文列表');
  }

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  // 处理繁体中文翻译（存储为简体中文的备选）
  console.log('📝 更新繁体中文翻译...');
  for (const translation of translations['zh-TW']) {
    const slip = slips.find(s => s.slip_number === translation.slip_number);
    
    if (!slip) {
      const error = `签文 ${translation.slip_number} 未找到`;
      console.warn(`⚠️ ${error}`);
      errors.push(error);
      errorCount++;
      continue;
    }

    try {
      // 更新简体中文主字段（因为原数据是繁体，现在用更详细的版本替换）
      const { error } = await supabase
        .from('fortune_slips')
        .update({
          title: translation.title,
          content: translation.content,
          basic_interpretation: translation.basic_interpretation,
          historical_context: translation.historical_context || null,
          symbolism: translation.symbolism || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', slip.id);

      if (error) {
        throw error;
      }

      console.log(`✅ 第${translation.slip_number}签 (zh-TW -> main)`);
      successCount++;
      
    } catch (error) {
      const errorMsg = `更新第${translation.slip_number}签失败: ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      errors.push(errorMsg);
      errorCount++;
    }

    // 添加延迟
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 处理英文翻译
  console.log('\n📝 更新英文翻译...');
  for (const translation of translations['en-US']) {
    const slip = slips.find(s => s.slip_number === translation.slip_number);
    
    if (!slip) {
      const error = `签文 ${translation.slip_number} 未找到`;
      console.warn(`⚠️ ${error}`);
      errors.push(error);
      errorCount++;
      continue;
    }

    try {
      // 更新英文字段
      const { error } = await supabase
        .from('fortune_slips')
        .update({
          title_en: translation.title,
          content_en: translation.content,
          basic_interpretation_en: translation.basic_interpretation,
          historical_context_en: translation.historical_context || null,
          symbolism_en: translation.symbolism || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', slip.id);

      if (error) {
        throw error;
      }

      console.log(`✅ 第${translation.slip_number}签 (en-US)`);
      successCount++;
      
    } catch (error) {
      const errorMsg = `更新第${translation.slip_number}签英文失败: ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      errors.push(errorMsg);
      errorCount++;
    }

    // 添加延迟
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { successCount, errorCount, errors };
}

// 验证翻译结果
async function validateTranslations() {
  console.log('\n🔍 验证翻译结果...');
  
  try {
    const { data: temple } = await supabase
      .from('temple_systems')
      .select('id')
      .eq('temple_code', 'guandi')
      .single();

    // 检查前3签的翻译情况
    const { data: slips, error } = await supabase
      .from('fortune_slips')
      .select('slip_number, title, title_en, content, content_en, basic_interpretation, basic_interpretation_en')
      .eq('temple_system_id', temple.id)
      .in('slip_number', [1, 2, 3])
      .order('slip_number');

    if (error) {
      console.error('验证失败:', error);
      return;
    }

    console.log('\n📋 翻译验证结果:');
    slips.forEach(slip => {
      console.log(`\n第${slip.slip_number}签:`);
      console.log(`  中文标题: ${slip.title}`);
      console.log(`  英文标题: ${slip.title_en || '无'}`);
      console.log(`  中文内容: ${slip.content.substring(0, 30)}...`);
      console.log(`  英文内容: ${(slip.content_en || '无').substring(0, 30)}...`);
      console.log(`  解读长度: 中文 ${slip.basic_interpretation.length} / 英文 ${(slip.basic_interpretation_en || '').length}`);
    });

  } catch (error) {
    console.error('验证过程中发生错误:', error.message);
  }
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始更新关帝灵签多语言数据\n');

    // 加载翻译数据
    const translations = loadTranslationData();
    if (!translations) {
      throw new Error('无法加载翻译数据');
    }

    console.log('📋 翻译数据加载成功:');
    console.log(`  繁体中文: ${translations['zh-TW'].length} 签`);
    console.log(`  英文: ${translations['en-US'].length} 签`);

    // 更新多语言字段
    const result = await updateMultilingualFields(translations);

    // 验证翻译结果
    await validateTranslations();

    // 输出总结
    console.log('\n📊 更新总结:');
    console.log(`✅ 成功: ${result.successCount} 条`);
    console.log(`❌ 失败: ${result.errorCount} 条`);

    if (result.errors.length > 0) {
      console.log('\n错误详情:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (result.errorCount === 0) {
      console.log('\n🎉 所有多语言数据更新成功！');
    } else {
      console.log(`\n⚠️  更新完成，但有 ${result.errorCount} 个错误需要处理`);
    }

  } catch (error) {
    console.error('\n❌ 更新过程中发生错误:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  loadTranslationData,
  getGuandiSlips,
  updateMultilingualFields,
  validateTranslations
};