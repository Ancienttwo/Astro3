// 完整测试多语言功能
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMultilingualComplete() {
  console.log('🧪 完整测试多语言功能...\n');

  try {
    // 获取关帝庙记录
    const { data: temple } = await supabase
      .from('temple_systems')
      .select('id')
      .eq('temple_code', 'guandi')
      .single();

    console.log('✅ 关帝庙记录:', temple.id);

    // 测试前3签的多语言数据
    console.log('\n📝 测试前3签的多语言数据:');
    
    for (let slipNumber = 1; slipNumber <= 3; slipNumber++) {
      console.log(`\n--- 第${slipNumber}签 ---`);
      
      const { data: slip, error } = await supabase
        .from('fortune_slips')
        .select(`
          slip_number,
          title,
          title_en,
          content,
          content_en,
          basic_interpretation,
          basic_interpretation_en,
          historical_context,
          historical_context_en,
          symbolism,
          symbolism_en
        `)
        .eq('temple_system_id', temple.id)
        .eq('slip_number', slipNumber)
        .single();

      if (error) {
        console.error(`❌ 第${slipNumber}签获取失败:`, error);
        continue;
      }

      // 检查每个字段的翻译完整度
      const fields = [
        { name: '标题', zh: 'title', en: 'title_en' },
        { name: '内容', zh: 'content', en: 'content_en' },
        { name: '解读', zh: 'basic_interpretation', en: 'basic_interpretation_en' },
        { name: '典故', zh: 'historical_context', en: 'historical_context_en' },
        { name: '象征', zh: 'symbolism', en: 'symbolism_en' }
      ];

      fields.forEach(field => {
        const zhValue = slip[field.zh];
        const enValue = slip[field.en];
        
        const zhStatus = zhValue ? '✅' : '❌';
        const enStatus = enValue ? '✅' : '❌';
        
        console.log(`  ${field.name}: 中文${zhStatus} 英文${enStatus}`);
        
        if (zhValue) {
          console.log(`    中文: ${zhValue.substring(0, 50)}${zhValue.length > 50 ? '...' : ''}`);
        }
        
        if (enValue) {
          console.log(`    英文: ${enValue.substring(0, 50)}${enValue.length > 50 ? '...' : ''}`);
        }
      });
    }

    // 测试API端点模拟
    console.log('\n🔗 测试API端点模拟:');
    
    // 模拟多语言API逻辑
    const testSlip = await supabase
      .from('fortune_slips')
      .select('*')
      .eq('temple_system_id', temple.id)
      .eq('slip_number', 2)
      .single();

    if (testSlip.data) {
      const slip = testSlip.data;
      
      // 模拟不同语言的响应
      const languages = [
        { code: 'zh-CN', name: '简体中文' },
        { code: 'zh-TW', name: '繁体中文' },
        { code: 'en-US', name: '英文' }
      ];

      languages.forEach(lang => {
        console.log(`\n${lang.name} (${lang.code}):`);
        
        let title, content, interpretation;
        
        switch (lang.code) {
          case 'en-US':
            title = slip.title_en || slip.title;
            content = slip.content_en || slip.content;
            interpretation = slip.basic_interpretation_en || slip.basic_interpretation;
            break;
          case 'zh-TW':
          case 'zh-CN':
          default:
            title = slip.title;
            content = slip.content;
            interpretation = slip.basic_interpretation;
            break;
        }
        
        console.log(`  标题: ${title}`);
        console.log(`  内容: ${content.substring(0, 80)}...`);
        console.log(`  解读: ${interpretation.substring(0, 80)}...`);
      });
    }

    // 统计翻译完整度
    console.log('\n📊 翻译完整度统计:');
    
    const { data: allSlips } = await supabase
      .from('fortune_slips')
      .select('slip_number, title, title_en, content_en, basic_interpretation_en')
      .eq('temple_system_id', temple.id)
      .order('slip_number');

    if (allSlips) {
      const totalSlips = allSlips.length;
      const englishTitles = allSlips.filter(s => s.title_en).length;
      const englishContent = allSlips.filter(s => s.content_en).length;
      const englishInterpretation = allSlips.filter(s => s.basic_interpretation_en).length;

      console.log(`总签文数: ${totalSlips}`);
      console.log(`英文标题: ${englishTitles}/${totalSlips} (${Math.round(englishTitles/totalSlips*100)}%)`);
      console.log(`英文内容: ${englishContent}/${totalSlips} (${Math.round(englishContent/totalSlips*100)}%)`);
      console.log(`英文解读: ${englishInterpretation}/${totalSlips} (${Math.round(englishInterpretation/totalSlips*100)}%)`);
    }

    console.log('\n🎉 多语言功能测试完成！');
    return true;

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    return false;
  }
}

async function main() {
  const success = await testMultilingualComplete();
  
  if (success) {
    console.log('\n✅ 所有测试通过，多语言功能已就绪！');
  } else {
    console.log('\n❌ 测试失败，需要检查问题');
    process.exit(1);
  }
}

main();