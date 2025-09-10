// 更新第五签和第六签完整数据到数据库
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 从JSON文件读取第五和第六签数据
function loadSlipsData() {
  try {
    const dataPath = path.join(__dirname, '../data/guandi-slips-5-6-normalized.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    return data;
  } catch (error) {
    console.error('读取签文数据文件失败:', error.message);
    return null;
  }
}

// 获取关帝庙指定签号记录
async function getSlipRecord(slipNumber) {
  console.log(`获取关帝庙第${slipNumber}签记录...`);
  
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
      .eq('slip_number', slipNumber)
      .single();

    if (error) {
      throw new Error(`获取第${slipNumber}签失败: ${error.message}`);
    }

    console.log(`✅ 找到第${slipNumber}签记录: ${slip.title}`);
    return slip;
    
  } catch (error) {
    console.error(`❌ 获取第${slipNumber}签记录失败:`, error.message);
    return null;
  }
}

// 构建历史典故的JSON对象
function buildHistoricalContextJson(context) {
  const jsonObj = {};
  Object.keys(context).forEach(key => {
    jsonObj[key] = context[key];
  });
  return jsonObj;
}

// 更新指定签的完整数据
async function updateSlipComplete(slipNumber, slipData) {
  console.log(`\n开始更新第${slipNumber}签完整数据...`);

  const slip = await getSlipRecord(slipNumber);
  if (!slip) {
    throw new Error(`无法获取第${slipNumber}签记录`);
  }

  try {
    // 更新中文主字段数据
    console.log(`📝 更新第${slipNumber}签中文主字段...`);
    const { error: zhError } = await supabase
      .from('fortune_slips')
      .update({
        title: slipData.zh_CN.title,
        content: slipData.zh_CN.content,
        basic_interpretation: slipData.zh_CN.basic_interpretation,
        historical_context: buildHistoricalContextJson(slipData.zh_CN.historical_context),
        symbolism: slipData.zh_CN.symbolism,
        updated_at: new Date().toISOString()
      })
      .eq('id', slip.id);

    if (zhError) {
      throw zhError;
    }
    console.log(`✅ 第${slipNumber}签中文主字段更新成功`);

    // 更新英文字段数据
    console.log(`📝 更新第${slipNumber}签英文字段...`);
    const { error: enError } = await supabase
      .from('fortune_slips')
      .update({
        title_en: slipData.en_US.title,
        content_en: slipData.en_US.content,
        basic_interpretation_en: slipData.en_US.basic_interpretation,
        historical_context_en: buildHistoricalContextJson(slipData.en_US.historical_context),
        symbolism_en: slipData.en_US.symbolism,
        updated_at: new Date().toISOString()
      })
      .eq('id', slip.id);

    if (enError) {
      throw enError;
    }
    console.log(`✅ 第${slipNumber}签英文字段更新成功`);

    return { success: true, slip_id: slip.id };

  } catch (error) {
    console.error(`❌ 更新第${slipNumber}签失败: ${error.message}`);
    throw error;
  }
}

// 验证更新结果
async function validateUpdate(slipNumber) {
  console.log(`\n🔍 验证第${slipNumber}签更新结果...`);
  
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
      .eq('slip_number', slipNumber)
      .single();

    if (error) {
      console.error(`验证第${slipNumber}签失败:`, error);
      return;
    }

    console.log(`\n📋 第${slipNumber}签验证结果:`);
    console.log(`中文标题: ${slip.title}`);
    console.log(`英文标题: ${slip.title_en}`);
    console.log(`中文内容: ${slip.content.substring(0, 30)}...`);
    console.log(`英文内容: ${slip.content_en.substring(0, 30)}...`);
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
    console.error(`验证第${slipNumber}签过程中发生错误:`, error.message);
  }
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始更新关帝灵签第五签和第六签完整数据\n');

    // 加载签文数据
    const slipsData = loadSlipsData();
    if (!slipsData) {
      throw new Error('无法加载签文数据');
    }

    console.log('📋 签文数据加载成功:');
    console.log(`  第五签: ${slipsData.slip_5.zh_CN.title}`);
    console.log(`  第六签: ${slipsData.slip_6.zh_CN.title}`);

    let successCount = 0;
    let errorCount = 0;

    // 更新第五签
    try {
      await updateSlipComplete(5, slipsData.slip_5);
      await validateUpdate(5);
      successCount++;
    } catch (error) {
      console.error(`第五签更新失败: ${error.message}`);
      errorCount++;
    }

    // 添加延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 更新第六签
    try {
      await updateSlipComplete(6, slipsData.slip_6);
      await validateUpdate(6);
      successCount++;
    } catch (error) {
      console.error(`第六签更新失败: ${error.message}`);
      errorCount++;
    }

    console.log('\n📊 更新总结:');
    console.log(`✅ 成功更新: ${successCount} 签`);
    console.log(`❌ 更新失败: ${errorCount} 签`);

    if (errorCount === 0) {
      console.log('✅ 第五签和第六签完整数据更新成功！');
      console.log('✅ 包含历史典故和象征意义');
      console.log('✅ 中英文数据完整');
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
  loadSlipsData,
  getSlipRecord,
  updateSlipComplete,
  validateUpdate
};