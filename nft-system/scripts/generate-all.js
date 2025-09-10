#!/usr/bin/env node

/**
 * 关帝灵签 NFT 批量生成脚本
 * 一键生成所有100个独特的关帝灵签NFT
 * 
 * 使用方法：
 * npm run generate-all
 * 或
 * node scripts/generate-all.js
 */

const path = require('path');
const fs = require('fs-extra');
const { performance } = require('perf_hooks');

// 确保项目根目录正确
process.chdir(path.join(__dirname, '..'));

// 导入核心模块
const DataFetcher = require('../src/data-fetcher');
const TemplateEngine = require('../src/template-engine');
const ImageGenerator = require('../src/image-generator');
const MetadataGenerator = require('../src/metadata-generator');

// 加载配置
const templateMapping = require('../config/template-mapping.json');
const rarityRules = require('../config/rarity-rules.json');

class NFTGenerator {
  constructor() {
    this.dataFetcher = new DataFetcher();
    this.templateEngine = new TemplateEngine();
    this.imageGenerator = new ImageGenerator();
    this.metadataGenerator = new MetadataGenerator();
    
    this.outputDir = path.join(__dirname, '../output');
    this.imageDir = path.join(this.outputDir, 'images');
    this.metadataDir = path.join(this.outputDir, 'metadata');
    
    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      legendary: 0,
      epic: 0,
      rare: 0,
      startTime: null,
      endTime: null
    };
  }

  async initialize() {
    console.log('🚀 初始化关帝灵签NFT生成器...\n');
    
    // 创建输出目录
    await fs.ensureDir(this.imageDir);
    await fs.ensureDir(this.metadataDir);
    
    // 清理旧文件
    await fs.emptyDir(this.imageDir);
    await fs.emptyDir(this.metadataDir);
    
    console.log('✅ 输出目录准备完毕');
    console.log(`📁 图片输出: ${this.imageDir}`);
    console.log(`📁 元数据输出: ${this.metadataDir}\n`);
  }

  async validateEnvironment() {
    console.log('🔍 验证生成环境...\n');
    
    // 检查环境变量
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
      throw new Error(`缺少环境变量: ${missingEnvVars.join(', ')}`);
    }
    
    // 检查模板文件
    const templateDir = path.join(__dirname, '../templates');
    const requiredTemplates = ['legendary.svg', 'epic.svg', 'rare.svg'];
    
    for (const template of requiredTemplates) {
      const templatePath = path.join(templateDir, template);
      if (!await fs.pathExists(templatePath)) {
        throw new Error(`模板文件不存在: ${template}`);
      }
    }
    
    console.log('✅ 环境验证通过\n');
  }

  async generateSingleNFT(slipData, index) {
    const slipNumber = slipData.slipNumber;
    
    try {
      console.log(`🎨 [${index + 1}/100] 生成第${slipNumber}签 (${slipData.rarity})...`);
      
      // 1. 生成SVG内容
      const svgContent = this.templateEngine.generateSVG(slipData);
      
      // 2. 生成PNG图片
      const imagePath = path.join(this.imageDir, `guandi-${slipNumber}.png`);
      await this.imageGenerator.generateFromSVG(svgContent, imagePath);
      
      // 3. 添加水印
      await this.imageGenerator.addWatermark(imagePath, slipNumber);
      
      // 4. 生成元数据
      const imageUrl = `https://astrozi.com/nft/guandi/images/guandi-${slipNumber}.png`;
      const metadata = this.metadataGenerator.generateNFTMetadata(slipData, imageUrl);
      
      // 5. 保存元数据文件
      const metadataPath = path.join(this.metadataDir, `${slipNumber}.json`);
      await fs.writeJSON(metadataPath, metadata, { spaces: 2 });
      
      // 6. 更新统计
      this.stats.success++;
      this.stats[slipData.rarity]++;
      
      console.log(`✅ 第${slipNumber}签生成成功 (${slipData.rarity})`);
      
      return {
        success: true,
        slipNumber,
        rarity: slipData.rarity,
        files: {
          image: imagePath,
          metadata: metadataPath
        }
      };
      
    } catch (error) {
      this.stats.failed++;
      console.error(`❌ 第${slipNumber}签生成失败: ${error.message}`);
      
      return {
        success: false,
        slipNumber,
        error: error.message
      };
    }
  }

  async generateAllNFTs() {
    this.stats.startTime = performance.now();
    
    try {
      console.log('📊 获取签文数据...\n');
      const slips = await this.dataFetcher.getAllFortuneSlips();
      this.stats.total = slips.length;
      
      console.log(`✅ 成功获取 ${slips.length} 个签文\n`);
      
      // 显示稀有度分布预测
      const rarityDistribution = slips.reduce((acc, slip) => {
        acc[slip.rarity] = (acc[slip.rarity] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📈 预期稀有度分布:');
      console.log(`  传奇级 (Legendary): ${rarityDistribution.legendary || 0} 个`);
      console.log(`  史诗级 (Epic): ${rarityDistribution.epic || 0} 个`);
      console.log(`  稀有级 (Rare): ${rarityDistribution.rare || 0} 个\n`);
      
      // 批量生成NFT
      console.log('🎨 开始批量生成NFT...\n');
      
      const results = [];
      const concurrencyLimit = 3; // 限制并发数量避免内存溢出
      
      for (let i = 0; i < slips.length; i += concurrencyLimit) {
        const batch = slips.slice(i, i + concurrencyLimit);
        const batchResults = await Promise.all(
          batch.map((slip, batchIndex) => this.generateSingleNFT(slip, i + batchIndex))
        );
        results.push(...batchResults);
        
        // 显示进度
        const progress = Math.round(((i + batch.length) / slips.length) * 100);
        console.log(`📈 进度: ${progress}% (${i + batch.length}/${slips.length})\n`);
      }
      
      // 生成集合元数据
      console.log('📋 生成集合元数据...');
      const collectionMetadata = this.metadataGenerator.generateCollectionMetadata(slips);
      const collectionPath = path.join(this.outputDir, 'collection.json');
      await fs.writeJSON(collectionPath, collectionMetadata, { spaces: 2 });
      console.log('✅ 集合元数据生成完成\n');
      
      return results;
      
    } catch (error) {
      console.error('❌ 批量生成过程出错:', error);
      throw error;
    } finally {
      this.stats.endTime = performance.now();
    }
  }

  generateReport(results) {
    const duration = ((this.stats.endTime - this.stats.startTime) / 1000).toFixed(2);
    const successResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 关帝灵签NFT生成完成报告');
    console.log('='.repeat(60));
    
    console.log('\n📊 生成统计:');
    console.log(`  总计: ${this.stats.total} 个`);
    console.log(`  成功: ${this.stats.success} 个`);
    console.log(`  失败: ${this.stats.failed} 个`);
    console.log(`  成功率: ${((this.stats.success / this.stats.total) * 100).toFixed(1)}%`);
    
    console.log('\n🎨 稀有度分布:');
    console.log(`  传奇级 (Legendary): ${this.stats.legendary} 个`);
    console.log(`  史诗级 (Epic): ${this.stats.epic} 个`);
    console.log(`  稀有级 (Rare): ${this.stats.rare} 个`);
    
    console.log('\n⏱️  性能数据:');
    console.log(`  总耗时: ${duration} 秒`);
    console.log(`  平均每个NFT: ${(duration / this.stats.success).toFixed(2)} 秒`);
    
    console.log('\n📁 输出位置:');
    console.log(`  图片文件: ${this.imageDir}`);
    console.log(`  元数据文件: ${this.metadataDir}`);
    console.log(`  集合元数据: ${path.join(this.outputDir, 'collection.json')}`);
    
    if (failedResults.length > 0) {
      console.log('\n❌ 失败详情:');
      failedResults.forEach(result => {
        console.log(`  第${result.slipNumber}签: ${result.error}`);
      });
    }
    
    console.log('\n🚀 下一步:');
    console.log('  1. 检查生成的图片质量');
    console.log('  2. 验证元数据格式');
    console.log('  3. 部署到IPFS或Web服务器');
    console.log('  4. 配置智能合约');
    console.log('  5. 在OpenSea等平台上架');
    
    console.log('\n' + '='.repeat(60));
    console.log('🎊 恭喜！关帝灵签NFT系列生成完成！');
    console.log('='.repeat(60) + '\n');
  }
}

// 主函数
async function main() {
  const generator = new NFTGenerator();
  
  try {
    await generator.initialize();
    await generator.validateEnvironment();
    
    const results = await generator.generateAllNFTs();
    generator.generateReport(results);
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ 生成过程发生致命错误:');
    console.error(error.message);
    console.error('\n请检查配置和环境后重试。\n');
    process.exit(1);
  }
}

// 优雅处理中断
process.on('SIGINT', () => {
  console.log('\n⚠️  用户中断生成过程');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 启动生成
if (require.main === module) {
  main();
}

module.exports = NFTGenerator;