# 关帝灵签 NFT 技术实现方案

## 架构概述

使用 Node.js + SVG 模板引擎 + Canvas API 实现动态NFT生成，支持批量处理100个签文数据，自动匹配对应稀有度模板。

## 技术栈选择

- **模板引擎**: SVG + Handlebars.js (支持中文字体和复杂布局)
- **图像处理**: node-canvas + sharp (高质量渲染和格式转换)  
- **数据源**: Supabase PostgreSQL (现有签文数据库)
- **文件管理**: fs-extra (批量文件操作)
- **字体支持**: 华文字体系列 (中文显示)

## 项目结构

```
nft-system/
├── config/
│   ├── template-mapping.json    # 模板映射配置
│   ├── rarity-rules.json       # 稀有度规则
│   └── font-config.json        # 字体配置
├── templates/
│   ├── legendary.svg           # 传奇模板 (2个签文)
│   ├── epic.svg               # 史诗模板 (9个签文)  
│   └── rare.svg               # 稀有模板 (89个签文)
├── assets/
│   ├── fonts/                 # 字体文件
│   │   ├── HuaWenXingKai.ttf
│   │   └── HuaWenZhongSong.ttf
│   ├── patterns/              # 背景纹理
│   └── effects/               # 特效图层
├── src/
│   ├── data-fetcher.js        # 数据库查询
│   ├── template-engine.js     # SVG模板渲染
│   ├── image-generator.js     # 图像生成
│   ├── metadata-generator.js  # NFT元数据生成
│   └── batch-processor.js     # 批量处理主程序
├── output/
│   ├── images/               # 生成的NFT图片
│   ├── metadata/             # NFT元数据JSON
│   └── collection.json       # 集合元数据
└── scripts/
    ├── generate-all.js       # 一键生成所有NFT
    └── verify-output.js      # 验证输出质量
```

## 核心实现

### 1. 数据获取模块 (data-fetcher.js)

```javascript
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class DataFetcher {
  async getAllFortuneSlips() {
    try {
      const { data: temple } = await supabase
        .from('temple_systems')
        .select('id')
        .eq('temple_code', 'guandi')
        .single();

      if (!temple) throw new Error('关帝庙系统未找到');

      const { data: slips, error } = await supabase
        .from('fortune_slips')
        .select(`
          slip_number,
          title,
          title_en,
          content,
          basic_interpretation,
          historical_context,
          symbolism,
          fortune_level,
          categories
        `)
        .eq('temple_system_id', temple.id)
        .order('slip_number');

      if (error) throw error;

      return slips.map(slip => ({
        slipNumber: slip.slip_number,
        title: slip.title,
        titleEn: slip.title_en,
        poem: slip.content,
        interpretation: slip.basic_interpretation,
        story: slip.historical_context,
        symbolism: slip.symbolism,
        fortuneLevel: slip.fortune_level,
        categories: this.parseCategories(slip.categories),
        rarity: this.determineRarity(slip.fortune_level, slip.slip_number)
      }));
    } catch (error) {
      console.error('数据获取失败:', error);
      throw error;
    }
  }

  parseCategories(categories) {
    if (!categories || !Array.isArray(categories)) return [];
    
    return categories.slice(0, 4).map(categoryStr => {
      try {
        const category = JSON.parse(categoryStr);
        return {
          name: category.category,
          prediction: category.judgment,
          predictionEn: category.judgment_en
        };
      } catch {
        return null;
      }
    }).filter(Boolean);
  }

  determineRarity(fortuneLevel, slipNumber) {
    // 传奇级：极品上上签 (已知第1,42签为上上签)
    if (fortuneLevel === 'excellent') {
      return 'legendary';
    }
    // 史诗级：上吉签
    if (fortuneLevel === 'good') {
      return 'epic';
    }
    // 稀有级：其他
    return 'rare';
  }
}

module.exports = DataFetcher;
```

### 2. 模板引擎 (template-engine.js)

```javascript
const fs = require('fs-extra');
const Handlebars = require('handlebars');
const path = require('path');

class TemplateEngine {
  constructor() {
    this.templates = {};
    this.loadTemplates();
    this.registerHelpers();
  }

  async loadTemplates() {
    const templateDir = path.join(__dirname, '../templates');
    const templateFiles = ['legendary.svg', 'epic.svg', 'rare.svg'];

    for (const file of templateFiles) {
      const templatePath = path.join(templateDir, file);
      const templateContent = await fs.readFile(templatePath, 'utf8');
      const templateName = path.basename(file, '.svg');
      this.templates[templateName] = Handlebars.compile(templateContent);
    }
  }

  registerHelpers() {
    // 文本长度限制助手
    Handlebars.registerHelper('truncate', (text, length) => {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    });

    // 格式化签号助手
    Handlebars.registerHelper('formatSlipNumber', (number) => {
      return `第${number}签`;
    });

    // 吉凶等级中文显示
    Handlebars.registerHelper('formatFortuneLevel', (level) => {
      const levelMap = {
        'excellent': '甲甲 大吉',
        'good': '甲乙 上吉', 
        'average': '乙丙 中平',
        'caution': '丙丁 下吉',
        'warning': '丁戊 下下'
      };
      return levelMap[level] || '未知';
    });

    // 当前日期助手
    Handlebars.registerHelper('currentDate', () => {
      return new Date().toLocaleDateString('zh-CN');
    });
  }

  generateSVG(slipData) {
    const template = this.templates[slipData.rarity];
    if (!template) {
      throw new Error(`模板 ${slipData.rarity} 不存在`);
    }

    const templateData = {
      ...slipData,
      // 添加生成时间戳
      generatedAt: new Date().toISOString(),
      // 添加集合信息
      collection: {
        name: "关帝灵签",
        symbol: "GDS", 
        totalSupply: 100
      }
    };

    return template(templateData);
  }
}

module.exports = TemplateEngine;
```

### 3. 图像生成器 (image-generator.js)

```javascript
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

class ImageGenerator {
  constructor() {
    this.setupFonts();
    this.canvasWidth = 400;
    this.canvasHeight = 600;
  }

  setupFonts() {
    const fontDir = path.join(__dirname, '../assets/fonts');
    
    // 注册中文字体
    try {
      registerFont(path.join(fontDir, 'HuaWenXingKai.ttf'), { family: '华文行楷' });
      registerFont(path.join(fontDir, 'HuaWenZhongSong.ttf'), { family: '华文中宋' });
    } catch (error) {
      console.warn('字体加载失败，将使用系统默认字体');
    }
  }

  async generateFromSVG(svgContent, outputPath) {
    try {
      // 使用 sharp 将 SVG 转换为高质量 PNG
      const pngBuffer = await sharp(Buffer.from(svgContent))
        .png({
          quality: 100,
          compressionLevel: 0
        })
        .resize(this.canvasWidth, this.canvasHeight, {
          fit: 'cover',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .toBuffer();

      await fs.writeFile(outputPath, pngBuffer);
      return outputPath;
    } catch (error) {
      console.error('图像生成失败:', error);
      throw error;
    }
  }

  async addWatermark(imagePath, slipNumber) {
    try {
      const canvas = createCanvas(this.canvasWidth, this.canvasHeight);
      const ctx = canvas.getContext('2d');

      // 加载原图
      const image = await loadImage(imagePath);
      ctx.drawImage(image, 0, 0);

      // 添加水印
      ctx.font = '12px 华文中宋';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'right';
      ctx.fillText(`AstroZi #${slipNumber}`, this.canvasWidth - 10, this.canvasHeight - 10);

      // 保存带水印的图像
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(imagePath, buffer);
      
      return imagePath;
    } catch (error) {
      console.error('水印添加失败:', error);
      throw error;
    }
  }
}

module.exports = ImageGenerator;
```

### 4. 元数据生成器 (metadata-generator.js)

```javascript
class MetadataGenerator {
  generateNFTMetadata(slipData, imageUrl) {
    const rarityScores = {
      'legendary': 10000,
      'epic': 5000, 
      'rare': 1000
    };

    const metadata = {
      name: `关帝灵签 #${slipData.slipNumber}`,
      description: `${slipData.title} - 传统关帝灵签的数字化收藏品，承载千年智慧与护佑之力。`,
      image: imageUrl,
      external_url: `https://astrozi.com/guandi/${slipData.slipNumber}`,
      
      attributes: [
        {
          trait_type: "签号",
          value: slipData.slipNumber
        },
        {
          trait_type: "稀有度",
          value: this.getRarityName(slipData.rarity)
        },
        {
          trait_type: "吉凶等级", 
          value: this.getFortuneLevel(slipData.fortuneLevel)
        },
        {
          trait_type: "历史典故",
          value: slipData.story ? "有" : "无"
        },
        {
          trait_type: "生成时间",
          value: new Date().toISOString().split('T')[0]
        }
      ],

      properties: {
        category: "Fortune Slip",
        collection: "关帝灵签",
        rarity_score: rarityScores[slipData.rarity],
        slip_content: slipData.poem,
        interpretation: slipData.interpretation,
        creator: "AstroZi"
      },

      // OpenSea 兼容格式
      background_color: this.getBackgroundColor(slipData.rarity),
      animation_url: null, // 如需动画可添加
      youtube_url: null
    };

    return metadata;
  }

  getRarityName(rarity) {
    const names = {
      'legendary': '传奇',
      'epic': '史诗',
      'rare': '稀有'
    };
    return names[rarity] || '未知';
  }

  getFortuneLevel(level) {
    const levels = {
      'excellent': '甲甲 大吉',
      'good': '甲乙 上吉',
      'average': '乙丙 中平', 
      'caution': '丙丁 下吉',
      'warning': '丁戊 下下'
    };
    return levels[level] || '未知';
  }

  getBackgroundColor(rarity) {
    const colors = {
      'legendary': 'FFD700', // 金色
      'epic': '9D4EDD',      // 紫色
      'rare': '2196F3'       // 蓝色
    };
    return colors[rarity] || 'FFFFFF';
  }

  generateCollectionMetadata(slips) {
    return {
      name: "关帝灵签 NFT Collection",
      description: "AstroZi 关帝灵签数字收藏品系列，100个独特的传统签文NFT，每一个都承载着关圣帝君的智慧与护佑。",
      image: "https://astrozi.com/images/guandi-collection-cover.png",
      external_link: "https://astrozi.com/guandi",
      
      stats: {
        total_supply: 100,
        legendary_count: slips.filter(s => s.rarity === 'legendary').length,
        epic_count: slips.filter(s => s.rarity === 'epic').length,
        rare_count: slips.filter(s => s.rarity === 'rare').length,
        created_date: new Date().toISOString()
      },

      social_links: {
        website: "https://astrozi.com",
        discord: "https://discord.gg/astrozi",
        twitter: "https://twitter.com/astroziai"
      },

      royalty_info: {
        recipient: "0x...", // 版税接收地址
        percentage: 500     // 5% 版税
      }
    };
  }
}

module.exports = MetadataGenerator;
```

### 5. 批量处理主程序 (batch-processor.js)

```javascript
const DataFetcher = require('./data-fetcher');
const TemplateEngine = require('./template-engine');
const ImageGenerator = require('./image-generator');
const MetadataGenerator = require('./metadata-generator');
const fs = require('fs-extra');
const path = require('path');

class BatchProcessor {
  constructor() {
    this.dataFetcher = new DataFetcher();
    this.templateEngine = new TemplateEngine();
    this.imageGenerator = new ImageGenerator();
    this.metadataGenerator = new MetadataGenerator();
    
    this.outputDir = path.join(__dirname, '../output');
    this.imageDir = path.join(this.outputDir, 'images');
    this.metadataDir = path.join(this.outputDir, 'metadata');
  }

  async initialize() {
    // 创建输出目录
    await fs.ensureDir(this.imageDir);
    await fs.ensureDir(this.metadataDir);
    
    console.log('🚀 批量处理器初始化完成');
  }

  async generateAllNFTs() {
    try {
      console.log('📊 获取签文数据...');
      const slips = await this.dataFetcher.getAllFortuneSlips();
      console.log(`✅ 成功获取 ${slips.length} 个签文`);

      let successCount = 0;
      let failureCount = 0;

      for (const slip of slips) {
        try {
          console.log(`🎨 生成第${slip.slipNumber}签 (${slip.rarity})...`);
          
          // 1. 生成SVG
          const svgContent = this.templateEngine.generateSVG(slip);
          
          // 2. 生成图片
          const imagePath = path.join(this.imageDir, `guandi-${slip.slipNumber}.png`);
          await this.imageGenerator.generateFromSVG(svgContent, imagePath);
          await this.imageGenerator.addWatermark(imagePath, slip.slipNumber);
          
          // 3. 生成元数据  
          const imageUrl = `https://astrozi.com/nft/guandi/${slip.slipNumber}.png`;
          const metadata = this.metadataGenerator.generateNFTMetadata(slip, imageUrl);
          
          const metadataPath = path.join(this.metadataDir, `${slip.slipNumber}.json`);
          await fs.writeJSON(metadataPath, metadata, { spaces: 2 });
          
          successCount++;
          console.log(`✅ 第${slip.slipNumber}签生成完成`);
          
        } catch (error) {
          failureCount++;
          console.error(`❌ 第${slip.slipNumber}签生成失败:`, error.message);
        }
      }

      // 生成集合元数据
      const collectionMetadata = this.metadataGenerator.generateCollectionMetadata(slips);
      await fs.writeJSON(
        path.join(this.outputDir, 'collection.json'), 
        collectionMetadata, 
        { spaces: 2 }
      );

      console.log('\n🎉 批量生成完成!');
      console.log(`✅ 成功: ${successCount} 个`);
      console.log(`❌ 失败: ${failureCount} 个`);
      console.log(`📁 输出目录: ${this.outputDir}`);

      return {
        success: successCount,
        failure: failureCount,
        total: slips.length,
        outputDir: this.outputDir
      };

    } catch (error) {
      console.error('❌ 批量生成失败:', error);
      throw error;
    }
  }

  async generatePreview(slipNumbers = [1, 50, 100]) {
    console.log('🎨 生成预览样本...');
    
    const slips = await this.dataFetcher.getAllFortuneSlips();
    const previewSlips = slips.filter(slip => slipNumbers.includes(slip.slipNumber));
    
    for (const slip of previewSlips) {
      const svgContent = this.templateEngine.generateSVG(slip);
      const imagePath = path.join(this.imageDir, `preview-${slip.slipNumber}.png`);
      await this.imageGenerator.generateFromSVG(svgContent, imagePath);
      console.log(`✅ 预览 第${slip.slipNumber}签 (${slip.rarity}) 生成完成`);
    }
  }
}

module.exports = BatchProcessor;
```

## 性能优化方案

### 1. 并发处理
```javascript
// 使用 Promise.all 批量并发生成
const concurrencyLimit = 5; // 限制并发数避免内存溢出

async function generateWithConcurrency(slips) {
  const chunks = chunkArray(slips, concurrencyLimit);
  
  for (const chunk of chunks) {
    await Promise.all(chunk.map(slip => generateSingleNFT(slip)));
  }
}
```

### 2. 缓存机制
```javascript
// 缓存已生成的模板，避免重复编译
const templateCache = new Map();
const getTemplate = (rarity) => {
  if (!templateCache.has(rarity)) {
    templateCache.set(rarity, compileTemplate(rarity));
  }
  return templateCache.get(rarity);
};
```

### 3. 内存管理
```javascript
// 及时释放大型图像对象
process.on('memoryWarning', () => {
  if (global.gc) {
    global.gc();
  }
});
```

## 预期输出结果

执行完成后将生成：
- **100个 PNG 图像文件** (400x600px, 高质量)
- **100个 JSON 元数据文件** (OpenSea 标准格式)
- **1个集合元数据文件** (collection.json)
- **完整的稀有度分布**:
  - 传奇级: 2个 (金色主题)
  - 史诗级: 9个 (紫色主题) 
  - 稀有级: 89个 (蓝色主题)

## 部署和使用

1. **环境准备**:
   ```bash
   npm install canvas sharp handlebars fs-extra @supabase/supabase-js
   ```

2. **字体安装**:
   - 下载华文行楷、华文中宋字体到 `assets/fonts/`

3. **生成所有NFT**:
   ```bash
   node scripts/generate-all.js
   ```

4. **生成预览样本**:
   ```bash
   node scripts/generate-preview.js
   ```

这个技术方案能够高效地将你的100个关帝灵签转换为精美的NFT收藏品，大大减少了手工设计的工作量。