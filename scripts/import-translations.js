// 关帝灵签翻译数据导入脚本
// 创建日期: 2025-01-31
// 功能: 批量导入繁体中文和英文翻译数据

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 从外部JSON文件读取翻译数据
function loadTranslationData() {
  try {
    const dataPath = path.join(__dirname, '../data/guandi-translations.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('读取翻译数据文件失败:', error.message);
    console.log('使用内置示例数据...');
    return getBuiltinTranslations();
  }
}

// 内置翻译数据作为备选
function getBuiltinTranslations() {
  return {
  // 繁体中文翻译
  'zh-TW': [
    {
      slip_number: 1,
      title: '第一籤 上上籤',
      content: '天開地闢結良緣\n日吉時良萬事全\n若得此籤非小可\n人行忠正帝王宣',
      basic_interpretation: '此籤大吉。天地開泰，良緣天成，時機極佳，萬事亨通。若能心懷忠義，行事正直，必得上天庇佑，貴人提攜，前程似錦。',
      historical_context: '此籤取自《三國演義》中劉備三顧茅廬請諸葛亮的典故。劉備以誠待人，諸葛亮被其誠意感動，結為君臣，共創蜀漢大業。',
      symbolism: '天開地闢象徵新的開始，結良緣意指遇到貴人相助。日吉時良代表時機成熟，萬事全表示諸事順遂。'
    },
    {
      slip_number: 2,
      title: '第二籤 中吉籤',
      content: '鯤魚化作鳳凰飛\n勸君切莫心生疑\n現在正好行好事\n來日必定有聲威',
      basic_interpretation: '此籤中吉。如鯤魚化鳳，變化驚人。勸君莫疑，當下行善，必有成就。現在雖平凡，但要堅持正道，未來必有威名遠播之日。',
      historical_context: '取自《莊子·逍遙遊》中"鯤之大，不知其幾千里也；化而為鳥，其名為鵬"的典故，比喻平凡之人經過努力可以成就大事。',
      symbolism: '鯤魚化鳳象徵脫胎換骨，從平凡走向不凡。勸君莫疑表示要有信心，行好事代表要積德行善。'
    },
    {
      slip_number: 3,
      title: '第三籤 中平籤',
      content: '臨風冒雨去還歸\n役役勞心似燕飛\n銜泥況築堂前屋\n燕子歸來好處棲',
      basic_interpretation: '此籤中平。如燕子辛苦築巢，勞心勞力，但終有成果。雖然過程辛苦，風雨兼程，但只要堅持不懈，最終必能築成理想家園。',
      historical_context: '取自燕子春來築巢的自然現象，古人常以燕子比喻勤勞持家、安居樂業的美好願望。',
      symbolism: '燕子象徵勤勞和歸宿，銜泥築屋代表辛苦經營，終有好處棲表示努力會有回報。'
    }
    // ... 可以繼續添加更多籤文
  ],

  // 英文翻译
  'en-US': [
    {
      slip_number: 1,
      title: 'First Oracle - Most Auspicious',
      content: 'Heaven opens, earth forms, good relationships bind\nAuspicious day, favorable time, all matters align\nIf you receive this oracle, it is no small thing\nWalk in loyalty and righteousness, the emperor will sing your name',
      basic_interpretation: 'This oracle is most auspicious. Heaven and earth are in harmony, good relationships are destined, timing is perfect, and all matters will proceed smoothly. If you maintain loyalty and act righteously, you will receive divine protection and support from nobles, leading to a bright future.',
      historical_context: 'This oracle references the story from "Romance of the Three Kingdoms" where Liu Bei visited Zhuge Liang three times to seek his service. Liu Bei\'s sincerity moved Zhuge Liang, and together they built the Shu Han dynasty.',
      symbolism: 'Heaven opening and earth forming symbolizes new beginnings, while good relationships represent meeting helpful people. Auspicious day and favorable time indicate perfect timing, and all matters aligning suggests everything will go smoothly.'
    },
    {
      slip_number: 2,
      title: 'Second Oracle - Moderately Auspicious',
      content: 'The kun fish transforms into a flying phoenix\nI advise you not to let doubt arise in your heart\nNow is the perfect time to do good deeds\nIn the future, you will surely gain prestige',
      basic_interpretation: 'This oracle is moderately auspicious. Like the kun fish transforming into a phoenix, change can be remarkable. Do not doubt yourself, do good deeds now, and you will achieve success. Though you may seem ordinary now, by staying on the righteous path, you will gain fame in the future.',
      historical_context: 'Derived from Zhuangzi\'s "Free and Easy Wandering" which tells of "the kun is so large, thousands of li in size; it transforms into a bird called the peng," symbolizing how ordinary people can achieve great things through effort.',
      symbolism: 'The kun fish transforming into a phoenix represents complete transformation from ordinary to extraordinary. The advice not to doubt indicates the need for confidence, while doing good deeds represents accumulating virtue.'
    },
    {
      slip_number: 3,
      title: 'Third Oracle - Average',
      content: 'Going and returning through wind and rain\nTirelessly working like a flying swallow\nCarrying mud to build a house in front of the hall\nWhen the swallow returns, it finds a good place to rest',
      basic_interpretation: 'This oracle is average. Like a swallow working hard to build its nest, there is much labor and worry, but ultimately there will be results. Though the process is difficult, facing wind and rain, persistence will eventually create an ideal home.',
      historical_context: 'Based on the natural phenomenon of swallows building nests in spring, ancient people often compared swallows to diligent homemaking and peaceful living.',
      symbolism: 'The swallow represents diligence and having a place to belong, carrying mud to build represents hard work and management, and finding a good place to rest indicates that effort will be rewarded.'
    }
    // ... 可以繼續添加更多籤文
  ]
  };
}

// 获取现有签文ID映射
async function getSlipIdMapping() {
  console.log('获取现有签文ID映射...');
  
  const { data: slips, error } = await supabase
    .from('fortune_divination_slips')
    .select('id, slip_number')
    .eq('temple_code', 'guandi')
    .order('slip_number');

  if (error) {
    throw new Error(`获取签文失败: ${error.message}`);
  }

  const mapping = {};
  slips.forEach(slip => {
    mapping[slip.slip_number] = slip.id;
  });

  console.log(`✅ 获取到 ${slips.length} 个签文的ID映射`);
  return mapping;
}

// 导入翻译数据
async function importTranslations(languageCode, translations, slipIdMapping) {
  console.log(`\n开始导入 ${languageCode} 翻译数据...`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const translation of translations) {
    const slipId = slipIdMapping[translation.slip_number];
    
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
          historical_context: translation.historical_context,
          symbolism: translation.symbolism
        }, {
          onConflict: 'slip_id,language_code'
        });

      if (error) {
        throw error;
      }

      console.log(`✅ 导入第${translation.slip_number}签 (${languageCode})`);
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

  console.log(`\n${languageCode} 导入完成:`);
  console.log(`  ✅ 成功: ${successCount}`);
  console.log(`  ❌ 失败: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\n错误详情:');
    errors.forEach(error => console.log(`  - ${error}`));
  }

  return { successCount, errorCount, errors };
}

// 验证翻译完整性
async function validateTranslations() {
  console.log('\n验证翻译完整性...');
  
  const { data: stats, error } = await supabase
    .rpc('check_missing_translations', { p_language_code: 'zh-TW' });

  if (error) {
    console.error('验证失败:', error);
    return;
  }

  const missingCount = stats?.length || 0;
  console.log(`繁体中文缺失翻译数量: ${missingCount}`);

  // 检查英文翻译
  const { data: enStats, error: enError } = await supabase
    .rpc('check_missing_translations', { p_language_code: 'en-US' });

  if (!enError) {
    const enMissingCount = enStats?.length || 0;
    console.log(`英文缺失翻译数量: ${enMissingCount}`);
  }

  // 获取翻译完整度统计
  const { data: completeness, error: compError } = await supabase
    .from('v_translation_completeness')
    .select('*')
    .eq('temple_code', 'guandi');

  if (!compError && completeness?.[0]) {
    const stats = completeness[0];
    console.log('\n翻译完整度统计:');
    console.log(`  总签文数: ${stats.total_slips}`);
    console.log(`  简体中文: ${stats.zh_cn_completion_rate}%`);
    console.log(`  繁体中文: ${stats.zh_tw_completion_rate}%`);
    console.log(`  英文: ${stats.en_us_completion_rate}%`);
  }
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始导入关帝灵签翻译数据\n');

    // 检查数据库连接
    const { data: testData, error: testError } = await supabase
      .from('fortune_divination_slips')
      .select('*', { count: 'exact', head: true })
      .eq('temple_code', 'guandi');

    if (testError) {
      throw new Error(`数据库连接失败: ${testError.message}`);
    }

    console.log('✅ 数据库连接成功');

    // 加载翻译数据
    const GUANDI_TRANSLATIONS = loadTranslationData();

    // 获取签文ID映射
    const slipIdMapping = await getSlipIdMapping();

    // 导入繁体中文翻译
    const zhTWResult = await importTranslations('zh-TW', GUANDI_TRANSLATIONS['zh-TW'], slipIdMapping);

    // 导入英文翻译
    const enUSResult = await importTranslations('en-US', GUANDI_TRANSLATIONS['en-US'], slipIdMapping);

    // 验证翻译完整性
    await validateTranslations();

    // 输出总结
    console.log('\n📊 导入总结:');
    console.log(`繁体中文: 成功${zhTWResult.successCount}, 失败${zhTWResult.errorCount}`);
    console.log(`英文: 成功${enUSResult.successCount}, 失败${enUSResult.errorCount}`);

    const totalSuccess = zhTWResult.successCount + enUSResult.successCount;
    const totalErrors = zhTWResult.errorCount + enUSResult.errorCount;

    if (totalErrors === 0) {
      console.log('\n🎉 所有翻译数据导入成功！');
    } else {
      console.log(`\n⚠️  导入完成，但有 ${totalErrors} 个错误需要处理`);
    }

  } catch (error) {
    console.error('\n❌ 导入过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  importTranslations,
  getSlipIdMapping,
  validateTranslations,
  loadTranslationData,
  getBuiltinTranslations
};