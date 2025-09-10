// 关帝灵签翻译数据最终导入脚本
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 从外部JSON文件读取翻译数据
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

// 获取关帝庙签文ID映射
async function getGuandiSlipMapping() {
  console.log('获取关帝庙签文ID映射...');
  
  try {
    // 先获取关帝庙记录
    const { data: temple, error: templeError } = await supabase
      .from('temple_systems')
      .select('id')
      .eq('temple_code', 'guandi')
      .single();

    if (templeError) {
      throw new Error(`获取关帝庙失败: ${templeError.message}`);
    }

    // 获取签文列表
    const { data: slips, error: slipsError } = await supabase
      .from('fortune_slips')
      .select('id, slip_number')
      .eq('temple_system_id', temple.id)
      .order('slip_number');

    if (slipsError) {
      throw new Error(`获取签文失败: ${slipsError.message}`);
    }

    const mapping = {};
    slips.forEach(slip => {
      mapping[slip.slip_number] = slip.id;
    });

    console.log(`✅ 获取到 ${slips.length} 个签文的ID映射`);
    return { templeId: temple.id, mapping };
    
  } catch (error) {
    console.error('❌ 获取签文映射失败:', error.message);
    return null;
  }
}

// 导入翻译数据
async function importTranslations(languageCode, translations, slipMapping) {
  console.log(`\n开始导入 ${languageCode} 翻译数据...`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const translation of translations) {
    const slipId = slipMapping[translation.slip_number];
    
    if (!slipId) {
      const error = `签文 ${translation.slip_number} 的ID未找到`;
      console.warn(`⚠️ ${error}`);
      errors.push(error);
      errorCount++;
      continue;
    }

    try {
      const { error } = await supabase
        .from('fortune_slips_i18n')
        .upsert({
          slip_id: slipId,
          language_code: languageCode,
          title: translation.title,
          content: translation.content,
          basic_interpretation: translation.basic_interpretation,
          historical_context: translation.historical_context || null,
          symbolism: translation.symbolism || null
        }, {
          onConflict: 'slip_id,language_code'
        });

      if (error) {
        console.error(`详细错误信息:`, JSON.stringify(error, null, 2));
        throw error;
      }

      console.log(`✅ 第${translation.slip_number}签 (${languageCode})`);
      successCount++;
      
      // 添加小延迟避免数据库压力
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      const errorMsg = `导入第${translation.slip_number}签失败: ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      errors.push(errorMsg);
      errorCount++;
    }
  }

  console.log(`\n${languageCode} 导入结果:`);
  console.log(`  ✅ 成功: ${successCount}`);
  console.log(`  ❌ 失败: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\n错误详情:');
    errors.forEach(error => console.log(`  - ${error}`));
  }

  return { successCount, errorCount, errors };
}

// 验证翻译完整性
async function validateTranslations(templeId) {
  console.log('\n验证翻译完整性...');
  
  try {
    // 统计各语言的翻译数量
    const languages = ['zh-TW', 'en-US'];
    
    for (const lang of languages) {
      const { data, error } = await supabase
        .from('fortune_slips_i18n')
        .select('slip_id')
        .eq('language_code', lang)
        .in('slip_id', [
          // 这里需要子查询，但先用简单方式
        ]);

      if (!error && data) {
        console.log(`${lang}: ${data.length} 个翻译`);
      }
    }

    // 获取完整统计
    const { data: stats, error: statsError } = await supabase
      .from('fortune_slips_i18n')
      .select('language_code, slip_id')
      .order('language_code');

    if (!statsError && stats) {
      const statsByLang = stats.reduce((acc, item) => {
        acc[item.language_code] = (acc[item.language_code] || 0) + 1;
        return acc;
      }, {});

      console.log('\n翻译统计:');
      Object.entries(statsByLang).forEach(([lang, count]) => {
        console.log(`  ${lang}: ${count} 签`);
      });
    }

  } catch (error) {
    console.error('验证翻译时发生错误:', error.message);
  }
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始导入关帝灵签翻译数据\n');

    // 加载翻译数据
    const translations = loadTranslationData();
    if (!translations) {
      throw new Error('无法加载翻译数据');
    }

    console.log('📋 翻译数据加载成功:');
    console.log(`  繁体中文: ${translations['zh-TW'].length} 签`);
    console.log(`  英文: ${translations['en-US'].length} 签`);

    // 获取签文ID映射
    const slipData = await getGuandiSlipMapping();
    if (!slipData) {
      throw new Error('无法获取签文映射');
    }

    // 导入繁体中文翻译
    const zhTWResult = await importTranslations('zh-TW', translations['zh-TW'], slipData.mapping);

    // 导入英文翻译
    const enUSResult = await importTranslations('en-US', translations['en-US'], slipData.mapping);

    // 验证翻译完整性
    await validateTranslations(slipData.templeId);

    // 输出总结
    console.log('\n📊 导入总结:');
    console.log(`繁体中文: 成功${zhTWResult.successCount}, 失败${zhTWResult.errorCount}`);
    console.log(`英文: 成功${enUSResult.successCount}, 失败${enUSResult.errorCount}`);

    const totalSuccess = zhTWResult.successCount + enUSResult.successCount;
    const totalErrors = zhTWResult.errorCount + enUSResult.errorCount;

    if (totalErrors === 0) {
      console.log('\n🎉 所有翻译数据导入成功！');
      console.log(`✅ 共导入 ${totalSuccess} 条翻译记录`);
    } else {
      console.log(`\n⚠️  导入完成，成功 ${totalSuccess} 条，失败 ${totalErrors} 条`);
    }

  } catch (error) {
    console.error('\n❌ 导入过程中发生错误:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  loadTranslationData,
  getGuandiSlipMapping,
  importTranslations,
  validateTranslations
};