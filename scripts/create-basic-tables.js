// 创建基础签文表结构
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createBasicTables() {
  console.log('🚀 创建基础签文表结构...\n');

  // 首先创建一个简化的temple_systems表
  const createTempleSystemsSQL = `
    INSERT INTO temple_systems (
      temple_name, temple_code, location, deity, 
      specialization, total_slips, description,
      primary_color, secondary_color, established_year
    ) VALUES (
      '关圣帝君灵签', 'guandi', '香港', '关圣帝君',
      ARRAY['忠义', '财运', '事业', '守护'], 100,
      '关圣帝君以忠义仁勇著称，护佑信众事业有成、财源广进。',
      '#8B0000', '#FFD700', 184
    ) ON CONFLICT (temple_code) DO UPDATE SET
      temple_name = EXCLUDED.temple_name,
      description = EXCLUDED.description
    RETURNING id, temple_code;
  `;

  try {
    console.log('📝 创建关帝庙系统记录...');
    
    // 先检查是否已有数据
    const { data: existingTemples } = await supabase
      .from('temple_systems')
      .select('*')
      .eq('temple_code', 'guandi');

    let templeId;
    
    if (existingTemples && existingTemples.length > 0) {
      console.log('✅ 关帝庙记录已存在');
      templeId = existingTemples[0].id;
    } else {
      // 插入新的庙宇记录
      const { data: newTemple, error: templeError } = await supabase
        .from('temple_systems')
        .insert({
          temple_name: '关圣帝君灵签',
          temple_code: 'guandi',
          location: '香港',
          deity: '关圣帝君',
          specialization: ['忠义', '财运', '事业', '守护'],
          total_slips: 100,
          description: '关圣帝君以忠义仁勇著称，护佑信众事业有成、财源广进。',
          primary_color: '#8B0000',
          secondary_color: '#FFD700',
          established_year: 184
        })
        .select()
        .single();

      if (templeError) {
        console.error('❌ 创建庙宇记录失败:', templeError);
        return null;
      }

      console.log('✅ 成功创建关帝庙记录');
      templeId = newTemple.id;
    }

    // 检查签文数据
    const { data: existingSlips } = await supabase
      .from('fortune_slips')
      .select('*')
      .eq('temple_system_id', templeId);

    if (existingSlips && existingSlips.length > 0) {
      console.log(`✅ 已存在 ${existingSlips.length} 签基础数据`);
      return { templeId, slips: existingSlips };
    }

    // 创建100签的基础数据
    console.log('📝 创建100签基础数据...');
    
    const baseSlips = [];
    for (let i = 1; i <= 100; i++) {
      baseSlips.push({
        temple_system_id: templeId,
        slip_number: i,
        title: `第${i}签`,
        content: `关帝庙第${i}签签文待完善`,
        basic_interpretation: `第${i}签基础解读待完善`,
        categories: ['通用'],
        fortune_level: 'average',
        is_active: true
      });
    }

    // 批量插入
    const { data: createdSlips, error: slipsError } = await supabase
      .from('fortune_slips')
      .insert(baseSlips)
      .select();

    if (slipsError) {
      console.error('❌ 创建签文数据失败:', slipsError);
      return null;
    }

    console.log(`✅ 成功创建 ${createdSlips.length} 签基础数据`);

    // 更新前3签的详细数据
    await updateDetailedSlips(templeId);

    return { templeId, slips: createdSlips };

  } catch (error) {
    console.error('❌ 创建表结构时发生错误:', error.message);
    return null;
  }
}

async function updateDetailedSlips(templeId) {
  console.log('\n📝 更新详细签文数据...');

  const detailedSlips = [
    // 第一签
    {
      slip_number: 1,
      title: '第一签 上上签',
      content: '天开地辟结良缘\n日吉时良万事全\n若得此签非小可\n人行忠正帝王宣',
      basic_interpretation: '此签大吉。天地开泰，良缘天成，时机极佳，万事亨通。若能心怀忠义，行事正直，必得上天庇佑，贵人提携，前程似锦。',
      categories: ['事业', '婚姻', '财运', '功名'],
      fortune_level: 'excellent',
      historical_context: '此签取自《三国演义》中刘备三顾茅庐请诸葛亮的典故。刘备以诚待人，诸葛亮被其诚意感动，结为君臣，共创蜀汉大业。',
      symbolism: '天开地辟象征新的开始，结良缘意指遇到贵人相助。日吉时良代表时机成熟，万事全表示诸事顺遂。'
    },
    // 第二签  
    {
      slip_number: 2,
      title: '第二签 张子房游赤松 甲乙 上吉',
      content: '盈虚消息总天时\n自此君当百事宜\n若问前程归缩地\n更须方寸好修为',
      basic_interpretation: '盈满虚空，生灭盛衰，乃是天时的循环，一个人处世，如果能够顺天时，自然样样好。如果想前途无阻碍，一路风顺，须要心地好好修为向善才行。曾经遇到不顺遂的过去，到现在也该是转运的时候了，之后会渐入佳境，但不可因此而骄纵。',
      categories: ['修身', '前程', '时运', '德行'],
      fortune_level: 'excellent',
      historical_context: '张良（字子房），韩国人。自博浪沙事后匿下邳，遇黄石公授太公兵法。后佐汉高祖定天下，封留侯。因感鸟尽弓藏，谢病归入白云山，师事黄石号赤松子。',
      symbolism: '盈虚消息指事物的循环变化，天时代表自然规律。前程归缩地意为前路需要收敛，方寸好修为强调内心修养的重要性。'
    },
    // 第三签
    {
      slip_number: 3,
      title: '第三签 贾谊遇汉文帝 甲丙 中吉',
      content: '衣食自然生处有\n劝君不用苦劳心\n但能孝悌存忠信\n福禄来成祸不侵',
      basic_interpretation: '此签只宜守旧，不可贪求，但存中直，却得两平。须以孝悌忠信为本，自有福禄来成之应，若思强取强求，反招意外之祸，占者循理守分则吉。一个人在世，只要照本份去做，衣食自然不用愁。',
      categories: ['守分', '孝悌', '忠信', '安分'],
      fortune_level: 'good',
      historical_context: '贾谊，洛阳人。汉文帝时为博士，年二十余超迁至大中大夫。后因绛、灌等毁之，出为长沙王太傅。贾生有王佐才，遇汉文明主，终不大用，卒悲伤而死。',
      symbolism: '衣食自然有指基本生活无忧，孝悌忠信代表做人的根本品德。福禄来成表示自然会有好运，祸不侵意为灾祸不会侵扰。'
    }
  ];

  for (const slip of detailedSlips) {
    try {
      const { error } = await supabase
        .from('fortune_slips')
        .update(slip)
        .eq('temple_system_id', templeId)
        .eq('slip_number', slip.slip_number);

      if (error) {
        console.error(`❌ 更新第${slip.slip_number}签失败:`, error);
      } else {
        console.log(`✅ 成功更新第${slip.slip_number}签详细数据`);
      }
    } catch (err) {
      console.error(`❌ 更新第${slip.slip_number}签时发生错误:`, err.message);
    }
  }
}

async function main() {
  try {
    const result = await createBasicTables();
    
    if (result) {
      console.log('\n🎉 基础表结构创建完成！');
      console.log(`   庙宇ID: ${result.templeId}`);
      console.log(`   签文数量: ${result.slips.length}`);
    } else {
      console.log('\n❌ 创建失败');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ 执行过程中发生错误:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createBasicTables, updateDetailedSlips };