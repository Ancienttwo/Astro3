// 导入关帝庙基础签文数据
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 关帝庙签文基础数据（1-100签）
async function createGuandiBaseSlips() {
  console.log('🚀 开始创建关帝庙基础签文数据...\n');

  const baseSlips = [];
  
  // 创建1-100签的基础结构
  for (let i = 1; i <= 100; i++) {
    baseSlips.push({
      temple_code: 'guandi',
      slip_number: i,
      title: `第${i}签`,
      content: `关帝庙第${i}签签文待完善`,
      basic_interpretation: `第${i}签基础解读待完善`,
      categories: ['通用'],
      fortune_level: 'average',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // 批量插入基础数据
  try {
    console.log('📝 插入100签基础数据...');
    const { data, error } = await supabase
      .from('fortune_divination_slips')
      .insert(baseSlips)
      .select();

    if (error) {
      console.error('❌ 插入基础数据失败:', error);
      return false;
    }

    console.log(`✅ 成功插入 ${data.length} 签基础数据`);
    return data;

  } catch (error) {
    console.error('❌ 创建基础数据时发生错误:', error.message);
    return false;
  }
}

// 更新特定签文的详细数据
async function updateSpecificSlips() {
  console.log('\n📝 更新具体签文数据...');

  // 第一签数据
  const slip1Data = {
    title: '第一签 上上签',
    content: '天开地辟结良缘\n日吉时良万事全\n若得此签非小可\n人行忠正帝王宣',
    basic_interpretation: '此签大吉。天地开泰，良缘天成，时机极佳，万事亨通。若能心怀忠义，行事正直，必得上天庇佑，贵人提携，前程似锦。',
    categories: ['事业', '婚姻', '财运', '功名'],
    fortune_level: 'excellent',
    historical_context: '此签取自《三国演义》中刘备三顾茅庐请诸葛亮的典故。刘备以诚待人，诸葛亮被其诚意感动，结为君臣，共创蜀汉大业。',
    symbolism: '天开地辟象征新的开始，结良缘意指遇到贵人相助。日吉时良代表时机成熟，万事全表示诸事顺遂。'
  };

  // 第二签数据
  const slip2Data = {
    title: '第二签 张子房游赤松 甲乙 上吉',
    content: '盈虚消息总天时\n自此君当百事宜\n若问前程归缩地\n更须方寸好修为',
    basic_interpretation: '盈满虚空，生灭盛衰，乃是天时的循环，一个人处世，如果能够顺天时，自然样样好。如果想前途无阻碍，一路风顺，须要心地好好修为向善才行。曾经遇到不顺遂的过去，到现在也该是转运的时候了，之后会渐入佳境，但不可因此而骄纵。',
    categories: ['修身', '前程', '时运', '德行'],
    fortune_level: 'excellent',
    historical_context: '张良（字子房），韩国人。自博浪沙事后匿下邳，遇黄石公授太公兵法。后佐汉高祖定天下，封留侯。因感鸟尽弓藏，谢病归入白云山，师事黄石号赤松子。',
    symbolism: '盈虚消息指事物的循环变化，天时代表自然规律。前程归缩地意为前路需要收敛，方寸好修为强调内心修养的重要性。'
  };

  // 第三签数据  
  const slip3Data = {
    title: '第三签 贾谊遇汉文帝 甲丙 中吉',
    content: '衣食自然生处有\n劝君不用苦劳心\n但能孝悌存忠信\n福禄来成祸不侵',
    basic_interpretation: '此签只宜守旧，不可贪求，但存中直，却得两平。须以孝悌忠信为本，自有福禄来成之应，若思强取强求，反招意外之祸，占者循理守分则吉。一个人在世，只要照本份去做，衣食自然不用愁。',
    categories: ['守分', '孝悌', '忠信', '安分'],
    fortune_level: 'good',
    historical_context: '贾谊，洛阳人。汉文帝时为博士，年二十余超迁至大中大夫。后因绛、灌等毁之，出为长沙王太傅。贾生有王佐才，遇汉文明主，终不大用，卒悲伤而死。',
    symbolism: '衣食自然有指基本生活无忧，孝悌忠信代表做人的根本品德。福禄来成表示自然会有好运，祸不侵意为灾祸不会侵扰。'
  };

  // 更新具体签文
  const updates = [
    { slip_number: 1, ...slip1Data },
    { slip_number: 2, ...slip2Data },
    { slip_number: 3, ...slip3Data }
  ];

  for (const update of updates) {
    try {
      const { error } = await supabase
        .from('fortune_divination_slips')
        .update(update)
        .eq('temple_code', 'guandi')
        .eq('slip_number', update.slip_number);

      if (error) {
        console.error(`❌ 更新第${update.slip_number}签失败:`, error);
      } else {
        console.log(`✅ 成功更新第${update.slip_number}签数据`);
      }
    } catch (err) {
      console.error(`❌ 更新第${update.slip_number}签时发生错误:`, err.message);
    }
  }
}

async function main() {
  try {
    // 检查是否已有基础数据
    const { data: existing, error: checkError } = await supabase
      .from('fortune_divination_slips')
      .select('*')
      .eq('temple_code', 'guandi');

    if (checkError) {
      throw new Error(`检查现有数据失败: ${checkError.message}`);
    }

    if (existing && existing.length > 0) {
      console.log(`📋 已存在 ${existing.length} 签基础数据，跳过创建步骤`);
    } else {
      // 创建基础签文数据
      const baseData = await createGuandiBaseSlips();
      if (!baseData) {
        throw new Error('创建基础数据失败');
      }
    }

    // 更新具体签文数据
    await updateSpecificSlips();

    console.log('\n🎉 关帝庙基础数据导入完成！');

  } catch (error) {
    console.error('\n❌ 导入过程中发生错误:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createGuandiBaseSlips, updateSpecificSlips };