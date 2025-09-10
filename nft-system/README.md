# 关帝灵签 NFT 生成系统

🎨 **基于稀有度模板的批量NFT生成解决方案**

一个创新的NFT生成系统，使用仅3个精美设计的模板，智能生成100个独特的关帝灵签NFT收藏品。通过稀有度分级和动态内容填充，大幅降低设计成本同时保持每个NFT的独特性。

## ✨ 核心特色

- 🎯 **高效设计**: 3个模板生成100个独特NFT，节省85%设计成本
- 🏆 **稀有度系统**: 传奇(2%) / 史诗(9%) / 稀有(89%) 三级分布
- 🎨 **精美设计**: 东方美学 + 现代设计，支持动画效果
- 🔄 **动态生成**: 基于数据库内容自动填充签文信息
- 📱 **多格式支持**: PNG图片 + OpenSea兼容元数据
- 🚀 **批量处理**: 并发生成，支持大规模批量操作

## 📊 稀有度分布

| 等级 | 数量 | 比例 | 主题色彩 | 特殊效果 |
|------|------|------|----------|----------|
| 传奇 (Legendary) | 2个 | 2% | 帝王金辉 | 金色发光、龙纹装饰、星光动画 |
| 史诗 (Epic) | 9个 | 9% | 紫气东来 | 紫色光晕、祥云浮动、珠光效果 |
| 稀有 (Rare) | 89个 | 89% | 青锋如意 | 水波纹理、竹叶装饰、淡雅光泽 |

## 🛠️ 技术架构

```
nft-system/
├── 📁 config/              # 配置文件
│   ├── template-mapping.json    # 模板映射配置
│   └── rarity-rules.json       # 稀有度规则
├── 📁 templates/           # SVG模板文件
│   ├── legendary.svg           # 传奇级模板 (金色主题)
│   ├── epic.svg               # 史诗级模板 (紫色主题)
│   └── rare.svg               # 稀有级模板 (蓝色主题)
├── 📁 src/                 # 核心代码
│   ├── data-fetcher.js         # 数据库查询
│   ├── template-engine.js      # 模板渲染引擎
│   ├── image-generator.js      # 图像生成器
│   └── metadata-generator.js   # 元数据生成器
├── 📁 scripts/             # 执行脚本
│   ├── generate-all.js         # 批量生成所有NFT
│   └── generate-preview.js     # 生成预览样本
└── 📁 output/              # 输出结果
    ├── images/                 # NFT图片文件
    ├── metadata/               # 元数据JSON文件
    └── collection.json         # 集合元数据
```

## 🚀 快速开始

### 1. 环境准备

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入Supabase凭据
```

**必需环境变量**:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. 字体准备

下载并放置中文字体到 `assets/fonts/` 目录：
- `HuaWenXingKai.ttf` (华文行楷)
- `HuaWenZhongSong.ttf` (华文中宋)

### 3. 生成预览样本

```bash
# 生成代表性预览NFT，用于测试模板效果
npm run generate-preview
```

### 4. 批量生成所有NFT

```bash
# 一键生成全部100个NFT
npm run generate-all
```

## 🎨 模板定制

### 修改颜色主题

编辑 `config/template-mapping.json`:

```json
{
  "legendary": {
    "colorScheme": {
      "primary": "#FFD700",    // 主色调
      "secondary": "#8B0000",  // 辅助色
      "accent": "#FFA500"      // 强调色
    }
  }
}
```

### 调整稀有度规则

编辑 `config/rarity-rules.json`:

```json
{
  "rarityRules": {
    "mapping": {
      "legendary": {
        "criteria": {
          "fortune_level": ["excellent"],
          "special_slips": [1, 42]  // 指定特殊签文
        }
      }
    }
  }
}
```

### 自定义模板设计

直接编辑SVG模板文件：
- `templates/legendary.svg` - 传奇级设计
- `templates/epic.svg` - 史诗级设计  
- `templates/rare.svg` - 稀有级设计

使用Handlebars语法插入动态内容：
```svg
<!-- 签文标题 -->
<text>{{title}}</text>

<!-- 签号 -->
<text>{{formatSlipNumber slipNumber}}</text>

<!-- 吉凶等级 -->
<text>{{formatFortuneLevel fortuneLevel}}</text>
```

## 📋 可用脚本

| 命令 | 功能 | 说明 |
|------|------|------|
| `npm run generate-all` | 生成所有NFT | 批量生成100个完整NFT |
| `npm run generate-preview` | 生成预览样本 | 生成代表性样本用于测试 |
| `npm run clean-output` | 清理输出目录 | 删除所有生成的文件 |
| `npm run verify-output` | 验证输出质量 | 检查生成文件的完整性 |

## 🎯 输出结果

### 生成的文件结构
```
output/
├── images/                 # NFT图片 (400x600 PNG)
│   ├── guandi-1.png       # 第1签NFT图片
│   ├── guandi-2.png       # 第2签NFT图片
│   └── ...                # 其他签文图片
├── metadata/              # OpenSea标准元数据
│   ├── 1.json            # 第1签元数据
│   ├── 2.json            # 第2签元数据
│   └── ...               # 其他签文元数据
└── collection.json        # 整个集合的元数据
```

### 元数据格式示例
```json
{
  "name": "关帝灵签 #1",
  "description": "吕蒙正祭灶 - 传统关帝灵签的数字化收藏品...",
  "image": "https://astrozi.com/nft/guandi/images/guandi-1.png",
  "attributes": [
    {
      "trait_type": "签号",
      "value": 1
    },
    {
      "trait_type": "稀有度",
      "value": "传奇"
    },
    {
      "trait_type": "吉凶等级",
      "value": "甲甲 大吉"
    }
  ],
  "properties": {
    "rarity_score": 10000,
    "slip_content": "签文内容...",
    "creator": "AstroZi"
  }
}
```

## ⚡ 性能优化

### 并发控制
系统自动限制并发数量，避免内存溢出：
```javascript
const concurrencyLimit = 3; // 可在配置中调整
```

### 内存管理
- 自动垃圾回收
- 批次处理避免内存积累
- 大型图像对象及时释放

### 处理速度
- 预期速度: ~2-3秒/NFT
- 总耗时: ~5-8分钟(100个NFT)
- 支持断点续传

## 🔧 故障排除

### 常见问题

**1. 字体显示异常**
```bash
# 确保字体文件存在
ls assets/fonts/
# 应该看到: HuaWenXingKai.ttf, HuaWenZhongSong.ttf
```

**2. 数据库连接失败**
```bash
# 检查环境变量
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

**3. 内存不足错误**
```bash
# 增加Node.js内存限制
node --max-old-space-size=4096 scripts/generate-all.js
```

**4. SVG渲染异常**
- 检查SVG模板语法
- 确保Handlebars表达式正确
- 验证CSS样式兼容性

### 调试模式

启用详细日志：
```bash
DEBUG=* npm run generate-all
```

生成单个NFT用于调试：
```bash
node -e "
const generator = new (require('./src/batch-processor'));
generator.generateSingleNFT(slipData, 0);
"
```

## 🚀 部署到生产

### 1. IPFS部署
```bash
# 使用Pinata或其他IPFS服务
ipfs add -r output/images/
ipfs add -r output/metadata/
```

### 2. CDN部署
```bash
# 上传到AWS S3 / Cloudflare / 阿里云OSS
aws s3 sync output/ s3://your-nft-bucket/guandi/
```

### 3. 智能合约配置
```solidity
// 设置baseURI指向部署的元数据
function setBaseURI(string memory baseURI) external onlyOwner {
    _baseTokenURI = baseURI; 
    // 例如: https://astrozi.com/nft/guandi/metadata/
}
```

## 📈 扩展功能

### 添加新的稀有度等级
1. 在 `config/rarity-rules.json` 添加新等级
2. 创建对应的SVG模板文件
3. 更新模板映射配置

### 支持动画NFT
1. 添加GIF/MP4生成逻辑
2. 在SVG中使用 `<animate>` 标签
3. 配置元数据 `animation_url` 字段

### 多语言支持
系统已内置中英文支持，可扩展其他语言：
1. 添加翻译数据到数据库
2. 修改 `data-fetcher.js` 支持语言参数
3. 创建对应语言的模板

## 🤝 贡献指南

### 提交代码
1. Fork 项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建Pull Request

### 报告问题
在GitHub Issues中提交问题时，请包含：
- 错误详细描述
- 复现步骤
- 环境信息 (Node.js版本、操作系统等)
- 相关日志输出

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关链接

- [AstroZi 官网](https://astrozi.com)
- [项目文档](https://docs.astrozi.com/nft)
- [Discord 社区](https://discord.gg/astrozi)
- [Twitter](https://twitter.com/astroziai)

---

<div align="center">
  <strong>🎊 恭喜！你已经掌握了高效的NFT批量生成技术！</strong><br>
  <em>3个模板 × 100个签文 = 无限可能</em>
</div>