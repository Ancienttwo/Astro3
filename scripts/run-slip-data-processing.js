/**
 * 执行关帝灵签数据处理的简化脚本
 * 作者: SuperClaude
 * 创建日期: 2025-01-31
 */

const { processFortuneSlips } = require('./process-fortune-slips-data');

async function main() {
  try {
    console.log('🎯 关帝灵签多语言数据处理');
    console.log('================================\n');
    
    const result = await processFortuneSlips();
    
    if (result.success) {
      console.log('\n🎉 数据处理成功完成!');
      console.log(`处理了 ${result.processed_slips} 个签文`);
      console.log(`输出文件: ${result.output_file}`);
    }
    
  } catch (error) {
    console.error('❌ 处理过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行主函数
main();