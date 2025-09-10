// 检查现有数据
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExistingData() {
  console.log('🔍 检查现有数据...\n');

  // 检查庙宇系统
  console.log('📋 庙宇系统:');
  const { data: temples, error: templeError } = await supabase
    .from('temple_systems')
    .select('*');

  if (templeError) {
    console.error('❌ 获取庙宇数据失败:', templeError);
  } else {
    temples.forEach(temple => {
      console.log(`  - ${temple.temple_name} (${temple.temple_code}): ${temple.total_slips}签`);
    });
  }

  // 检查关帝庙的签文
  console.log('\n🎲 关帝庙签文:');
  const guangdiTemple = temples?.find(t => t.temple_code === 'guandi');
  
  if (guangdiTemple) {
    console.log(`✅ 找到关帝庙记录: ID ${guangdiTemple.id}`);
    
    const { data: slips, error: slipsError } = await supabase
      .from('fortune_slips')
      .select('*')
      .eq('temple_system_id', guangdiTemple.id)
      .order('slip_number');

    if (slipsError) {
      console.error('❌ 获取签文数据失败:', slipsError);
    } else {
      console.log(`📝 关帝庙现有 ${slips.length} 签:`);
      slips.slice(0, 5).forEach(slip => {
        console.log(`  - 第${slip.slip_number}签: ${slip.title}`);
        console.log(`    内容: ${slip.content.substring(0, 50)}...`);
      });

      if (slips.length > 5) {
        console.log(`  ... 和另外 ${slips.length - 5} 签`);
      }

      // 检查多语言翻译数据
      console.log('\n🌐 多语言翻译数据:');
      const { data: translations, error: translationError } = await supabase
        .from('fortune_slips_i18n')
        .select('*')
        .in('slip_id', slips.map(s => s.id));

      if (translationError) {
        console.log('❌ 获取翻译数据失败:', translationError.message);
      } else {
        const zhTW = translations?.filter(t => t.language_code === 'zh-TW').length || 0;
        const enUS = translations?.filter(t => t.language_code === 'en-US').length || 0;
        
        console.log(`  - 繁体中文: ${zhTW} 签`);
        console.log(`  - 英文: ${enUS} 签`);
      }
    }
  } else {
    console.log('❌ 未找到关帝庙记录');
  }

  return { temples, guangdiTemple };
}

async function main() {
  try {
    const result = await checkExistingData();
    
    if (result.guangdiTemple && result.guangdiTemple.total_slips > 0) {
      console.log('\n✅ 数据库已有基础数据，可以直接进行多语言翻译导入');
    } else {
      console.log('\n⚠️  需要先创建基础签文数据');
    }

  } catch (error) {
    console.error('\n❌ 检查数据时发生错误:', error.message);
  }
}

main();