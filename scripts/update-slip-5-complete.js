// 更新第五签完整数据到数据库
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 从JSON文件读取第五签数据
function loadSlip5Data() {
  try {
    const dataPath = path.join(__dirname, '../data/guandi-slip-5-normalized.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    return data.slip_5;
  } catch (error) {
    console.error('读取第五签数据文件失败:', error.message);
    return null;
  }
}

// 获取关帝庙第五签记录
async function getSlip5Record() {
  console.log('获取关帝庙第五签记录...');
  
  try {
    const { data: temple } = await supabase
      .from('temple_systems')
      .select('id')
      .eq('temple_code', 'guandi')
      .single();

    const { data: slip, error } = await supabase
      .from('fortune_slips')
      .select('id, slip_number, title')
      .eq('temple_system_id', temple.id)
      .eq('slip_number', 5)
      .single();

    if (error) {
      throw new Error(`获取第五签失败: ${error.message}`);
    }

    console.log(`✅ 找到第五签记录: ${slip.title}`);
    return slip;
    
  } catch (error) {
    console.error('❌ 获取第五签记录失败:', error.message);
    return null;
  }
}

// 构建历史典故的JSON字符串（存储为JSON对象，不转字符串）
function buildHistoricalContextJson(context) {
  const jsonObj = {};
  Object.keys(context).forEach(key => {
    jsonObj[key] = context[key];
  });
  return jsonObj; // 返回对象，不转字符串
}

// 更新第五签的完整数据
async function updateSlip5Complete(slip5Data) {
  console.log('\n开始更新第五签完整数据...\n');

  const slip = await getSlip5Record();
  if (!slip) {
    throw new Error('无法获取第五签记录');
  }

  try {
    // 更新中文主字段数据
    console.log('📝 更新中文主字段...');
    const { error: zhError } = await supabase
      .from('fortune_slips')
      .update({
        title: slip5Data.zh_CN.title,
        content: slip5Data.zh_CN.content,
        basic_interpretation: slip5Data.zh_CN.basic_interpretation,
        historical_context: buildHistoricalContextJson(slip5Data.zh_CN.historical_context),
        symbolism: slip5Data.zh_CN.symbolism,
        updated_at: new Date().toISOString()
      })
      .eq('id', slip.id);

    if (zhError) {
      throw zhError;
    }
    console.log('✅ 中文主字段更新成功');

    // 更新英文字段数据
    console.log('📝 更新英文字段...');
    const { error: enError } = await supabase
      .from('fortune_slips')
      .update({
        title_en: slip5Data.en_US.title,
        content_en: slip5Data.en_US.content,
        basic_interpretation_en: slip5Data.en_US.basic_interpretation,
        historical_context_en: buildHistoricalContextJson(slip5Data.en_US.historical_context),
        symbolism_en: slip5Data.en_US.symbolism,
        updated_at: new Date().toISOString()
      })
      .eq('id', slip.id);

    if (enError) {
      throw enError;
    }
    console.log('✅ 英文字段更新成功');

    return { success: true, slip_id: slip.id };

  } catch (error) {
    console.error(`❌ 更新第五签失败: ${error.message}`);
    throw error;
  }
}

// 验证更新结果
async function validateUpdate() {
  console.log('\n🔍 验证第五签更新结果...');
  
  try {
    const { data: temple } = await supabase
      .from('temple_systems')
      .select('id')
      .eq('temple_code', 'guandi')
      .single();

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
      .eq('slip_number', 5)
      .single();

    if (error) {
      console.error('验证失败:', error);
      return;
    }

    console.log('\n📋 第五签验证结果:');
    console.log(`中文标题: ${slip.title}`);
    console.log(`英文标题: ${slip.title_en}`);
    console.log(`中文内容: ${slip.content.substring(0, 50)}...`);
    console.log(`英文内容: ${slip.content_en.substring(0, 50)}...`);
    console.log(`中文解读长度: ${slip.basic_interpretation.length} 字符`);
    console.log(`英文解读长度: ${slip.basic_interpretation_en.length} 字符`);
    
    // 检查历史典故字段
    if (slip.historical_context) {
      console.log(`中文历史典故数: ${Object.keys(slip.historical_context).length}`);
    }
    
    if (slip.historical_context_en) {
      console.log(`英文历史典故数: ${Object.keys(slip.historical_context_en).length}`);
    }

    console.log(`象征意义: 中文 ${slip.symbolism?.length || 0} / 英文 ${slip.symbolism_en?.length || 0} 字符`);

  } catch (error) {
    console.error('验证过程中发生错误:', error.message);
  }
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始更新关帝灵签第五签完整数据\n');

    // 加载第五签数据
    const slip5Data = loadSlip5Data();
    if (!slip5Data) {
      throw new Error('无法加载第五签数据');
    }

    console.log('📋 第五签数据加载成功:');
    console.log(`  简体中文: ${slip5Data.zh_CN.title}`);
    console.log(`  繁体中文: ${slip5Data.zh_TW.title}`);
    console.log(`  英文: ${slip5Data.en_US.title}`);
    console.log(`  详细分解项目: ${Object.keys(slip5Data.zh_CN.detailed_breakdown).length} 项`);
    console.log(`  历史典故: ${Object.keys(slip5Data.zh_CN.historical_context).length} 个`);

    // 更新数据库
    const result = await updateSlip5Complete(slip5Data);
    
    // 验证更新结果
    await validateUpdate();

    console.log('\n📊 更新总结:');
    console.log('✅ 第五签完整数据更新成功！');
    console.log('✅ 包含历史典故和象征意义');
    console.log('✅ 中英文数据完整');

  } catch (error) {
    console.error('\n❌ 更新过程中发生错误:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  loadSlip5Data,
  getSlip5Record,
  updateSlip5Complete,
  validateUpdate
};