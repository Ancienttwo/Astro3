#!/usr/bin/env node

/**
 * 关帝灵签 NFT 预览生成脚本
 * 生成代表性的样本NFT用于测试和预览
 * 
 * 使用方法：
 * npm run generate-preview
 * 或
 * node scripts/generate-preview.js
 */

const path = require('path');
const fs = require('fs-extra');

// 确保项目根目录正确
process.chdir(path.join(__dirname, '..'));

// 导入核心模块
const DataFetcher = require('../src/data-fetcher');
const TemplateEngine = require('../src/template-engine');
const ImageGenerator = require('../src/image-generator');
const MetadataGenerator = require('../src/metadata-generator');

class PreviewGenerator {
  constructor() {
    this.dataFetcher = new DataFetcher();
    this.templateEngine = new TemplateEngine();
    this.imageGenerator = new ImageGenerator();
    this.metadataGenerator = new MetadataGenerator();
    
    this.outputDir = path.join(__dirname, '../output');
    this.previewDir = path.join(this.outputDir, 'preview');
  }

  async initialize() {
    console.log('🎨 初始化预览生成器...\n');
    
    // 创建预览目录
    await fs.ensureDir(this.previewDir);
    await fs.emptyDir(this.previewDir);
    
    console.log(`📁 预览输出目录: ${this.previewDir}\n`);
  }

  async generatePreviewSet() {
    console.log('📊 获取签文数据...\n');
    const allSlips = await this.dataFetcher.getAllFortuneSlips();
    
    // 选择代表性样本
    const previewSlips = this.selectRepresentativeSlips(allSlips);
    
    console.log('🎯 选中的预览样本:');
    previewSlips.forEach(slip => {
      console.log(`  第${slip.slipNumber}签 (${slip.rarity}) - ${slip.title}`);
    });
    console.log('');
    
    // 生成预览NFT
    const results = [];
    for (let i = 0; i < previewSlips.length; i++) {
      const slip = previewSlips[i];
      console.log(`🎨 [${i + 1}/${previewSlips.length}] 生成预览: 第${slip.slipNumber}签...`);
      
      try {
        // 生成SVG
        const svgContent = this.templateEngine.generateSVG(slip);
        
        // 保存SVG源文件 (便于调试)
        const svgPath = path.join(this.previewDir, `preview-${slip.slipNumber}.svg`);
        await fs.writeFile(svgPath, svgContent, 'utf8');
        
        // 生成PNG图片
        const imagePath = path.join(this.previewDir, `preview-${slip.slipNumber}.png`);
        await this.imageGenerator.generateFromSVG(svgContent, imagePath);
        await this.imageGenerator.addWatermark(imagePath, slip.slipNumber);
        
        // 生成元数据
        const imageUrl = `https://astrozi.com/nft/guandi/preview/preview-${slip.slipNumber}.png`;
        const metadata = this.metadataGenerator.generateNFTMetadata(slip, imageUrl);
        const metadataPath = path.join(this.previewDir, `preview-${slip.slipNumber}.json`);
        await fs.writeJSON(metadataPath, metadata, { spaces: 2 });
        
        console.log(`✅ 第${slip.slipNumber}签预览生成成功`);
        
        results.push({
          success: true,
          slipNumber: slip.slipNumber,
          rarity: slip.rarity,
          files: {
            svg: svgPath,
            image: imagePath,
            metadata: metadataPath
          }
        });
        
      } catch (error) {
        console.error(`❌ 第${slip.slipNumber}签预览生成失败: ${error.message}`);
        results.push({
          success: false,
          slipNumber: slip.slipNumber,
          error: error.message
        });
      }
    }
    
    return results;
  }

  selectRepresentativeSlips(allSlips) {
    const slipsByRarity = allSlips.reduce((acc, slip) => {
      if (!acc[slip.rarity]) acc[slip.rarity] = [];
      acc[slip.rarity].push(slip);
      return acc;
    }, {});
    
    const previewSlips = [];
    
    // 传奇级：选择所有（通常只有2个）
    if (slipsByRarity.legendary) {
      previewSlips.push(...slipsByRarity.legendary);
    }
    
    // 史诗级：选择前2个
    if (slipsByRarity.epic) {
      previewSlips.push(...slipsByRarity.epic.slice(0, 2));
    }
    
    // 稀有级：选择有代表性的3个
    if (slipsByRarity.rare) {
      const rareSlips = slipsByRarity.rare;
      previewSlips.push(
        rareSlips[0], // 第一个
        rareSlips[Math.floor(rareSlips.length / 2)], // 中间的一个
        rareSlips[rareSlips.length - 1] // 最后一个
      );
    }
    
    // 按签号排序
    return previewSlips.sort((a, b) => a.slipNumber - b.slipNumber);
  }

  async generateRarityComparison() {
    console.log('\n🔄 生成稀有度对比图...');
    
    const allSlips = await this.dataFetcher.getAllFortuneSlips();
    const comparisonSlips = [
      allSlips.find(s => s.rarity === 'legendary'),
      allSlips.find(s => s.rarity === 'epic'),
      allSlips.find(s => s.rarity === 'rare')
    ].filter(Boolean);
    
    const comparisonDir = path.join(this.previewDir, 'comparison');
    await fs.ensureDir(comparisonDir);
    
    for (const slip of comparisonSlips) {
      const svgContent = this.templateEngine.generateSVG(slip);
      const imagePath = path.join(comparisonDir, `${slip.rarity}-example.png`);
      await this.imageGenerator.generateFromSVG(svgContent, imagePath);
      console.log(`✅ ${slip.rarity} 对比图生成: ${imagePath}`);
    }
  }

  generatePreviewReport(results) {
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;
    
    console.log('\n' + '='.repeat(50));
    console.log('🎨 预览生成完成报告');
    console.log('='.repeat(50));
    
    console.log('\n📊 生成统计:');
    console.log(`  成功: ${successCount} 个`);
    console.log(`  失败: ${failedCount} 个`);
    
    console.log('\n🎯 生成的预览文件:');
    const successResults = results.filter(r => r.success);
    successResults.forEach(result => {
      console.log(`  第${result.slipNumber}签 (${result.rarity}):`);
      console.log(`    图片: ${path.basename(result.files.image)}`);
      console.log(`    元数据: ${path.basename(result.files.metadata)}`);
    });
    
    console.log(`\n📁 预览文件位置: ${this.previewDir}`);
    
    console.log('\n🚀 下一步:');
    console.log('  1. 查看预览图片，检查设计效果');
    console.log('  2. 调整模板配置');
    console.log('  3. 运行完整生成: npm run generate-all');
    
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

// 主函数
async function main() {
  const generator = new PreviewGenerator();
  
  try {
    await generator.initialize();
    
    const results = await generator.generatePreviewSet();
    await generator.generateRarityComparison();
    
    generator.generatePreviewReport(results);
    
    console.log('🎉 预览生成完成！请查看生成的图片文件。\n');
    
  } catch (error) {
    console.error('\n❌ 预览生成失败:');
    console.error(error.message);
    console.error('\n请检查配置后重试。\n');
    process.exit(1);
  }
}

// 启动预览生成
if (require.main === module) {
  main();
}

module.exports = PreviewGenerator;