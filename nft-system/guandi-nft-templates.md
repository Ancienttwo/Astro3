# 关帝灵签 NFT 模板系统设计

## 概述

基于签文稀有度分析，设计3个基础模板动态生成100个独特的关帝灵签NFT，大幅减少设计工作量同时保持每个NFT的独特性。

## 稀有度分析结果

- **传奇级 (Legendary)**: 2个签文 (2%) - 极品上上签
- **史诗级 (Epic)**: 9个签文 (9%) - 上吉/中吉签
- **稀有级 (Rare)**: 89个签文 (89%) - 中平/下吉签

## NFT模板设计方案

### Template 1: 传奇级 (Legendary) - "帝王金辉"
```json
{
  "templateId": "legendary",
  "rarity": "传奇",
  "colorScheme": {
    "primary": "#FFD700",    // 帝王金
    "secondary": "#8B0000",  // 深红
    "accent": "#FFA500",     // 橙金
    "background": "radial-gradient(circle, #FFD700 0%, #FFA500 50%, #8B0000 100%)"
  },
  "visualEffects": {
    "border": "双层金边，外发光效果",
    "backgroundAnimation": "金色粒子浮动，龙纹水印",
    "cardShine": "全息彩虹反光效果",
    "specialElements": [
      "关帝印章(动画)",
      "金龙环绕边框",
      "闪烁金星特效"
    ]
  },
  "typography": {
    "titleFont": "华文行楷 + 金色描边",
    "contentFont": "华文中宋",
    "accentColor": "#8B0000"
  }
}
```

### Template 2: 史诗级 (Epic) - "紫气东来"
```json
{
  "templateId": "epic", 
  "rarity": "史诗",
  "colorScheme": {
    "primary": "#9D4EDD",    // 帝王紫
    "secondary": "#4CC9F0",  // 青蓝
    "accent": "#7209B7",     // 深紫
    "background": "linear-gradient(135deg, #9D4EDD 0%, #4CC9F0 100%)"
  },
  "visualEffects": {
    "border": "紫色发光边框",
    "backgroundAnimation": "紫气流动，云纹装饰",
    "cardShine": "珠光效果",
    "specialElements": [
      "祥云浮动",
      "紫色光晕",
      "古典花纹边角"
    ]
  },
  "typography": {
    "titleFont": "华文行楷 + 紫色描边",
    "contentFont": "华文中宋",
    "accentColor": "#2A0845"
  }
}
```

### Template 3: 稀有级 (Rare) - "青锋如意"
```json
{
  "templateId": "rare",
  "rarity": "稀有", 
  "colorScheme": {
    "primary": "#2196F3",    // 青蓝
    "secondary": "#81C784",  // 翠绿
    "accent": "#1976D2",     // 深蓝
    "background": "linear-gradient(45deg, #2196F3 0%, #81C784 100%)"
  },
  "visualEffects": {
    "border": "简约蓝边",
    "backgroundAnimation": "水波纹效果，竹叶飘落",
    "cardShine": "淡雅光泽",
    "specialElements": [
      "竹叶装饰",
      "水纹背景",
      "简约几何边框"
    ]
  },
  "typography": {
    "titleFont": "华文行楷 + 深蓝描边",
    "contentFont": "华文中宋", 
    "accentColor": "#0D47A1"
  }
}
```

## 动态内容叠加区域

每个模板都包含以下可替换的动态内容区域：

### 1. 头部信息区
- **签号**: 第X签 (动态)
- **稀有度标识**: 传奇/史诗/稀有 (基于模板)
- **AstroZi Logo**: 固定品牌标识

### 2. 主体签文区
- **签文标题**: 动态中英文标题
- **签诗内容**: 完整签文诗句
- **吉凶等级**: 甲甲大吉/甲乙上吉等

### 3. 解读信息区
- **古典概述**: 简化版解读
- **现代寓意**: 当代解释
- **12类运势**: 精选3-4个重要类别

### 4. 底部元数据区
- **Mint编号**: #001/100
- **求签日期**: 动态时间戳
- **区块链标识**: 链标识 + 合约地址

## 卡片尺寸规格

```json
{
  "dimensions": {
    "width": 400,
    "height": 600,
    "ratio": "2:3",
    "dpi": 300,
    "format": "PNG/SVG"
  },
  "layout": {
    "headerHeight": 80,
    "contentHeight": 400, 
    "footerHeight": 120,
    "padding": 20,
    "borderRadius": 15
  }
}
```

## 技术实现架构

### 1. 模板引擎结构
```
nft-templates/
├── templates/
│   ├── legendary.svg          # 传奇模板
│   ├── epic.svg              # 史诗模板
│   └── rare.svg              # 稀有模板
├── assets/
│   ├── fonts/                # 字体文件
│   ├── patterns/             # 背景纹理
│   └── effects/              # 特效素材
└── generator/
    ├── template-engine.js    # 模板渲染引擎
    ├── content-mapper.js     # 内容映射器
    └── nft-generator.js      # NFT批量生成器
```

### 2. 内容映射逻辑
```javascript
// 根据fortune_level映射到对应模板
const getTemplateByRarity = (fortuneLevel, slipNumber) => {
  // 传奇级：第1,42签 (极品上上签)
  if (['excellent'].includes(fortuneLevel) && [1,42].includes(slipNumber)) {
    return 'legendary';
  }
  // 史诗级：上吉签文
  if (['good'].includes(fortuneLevel)) {
    return 'epic'; 
  }
  // 稀有级：其他所有签文
  return 'rare';
};
```

### 3. 生成流程
1. **数据获取**: 从数据库读取100个签文的完整信息
2. **模板选择**: 根据签文等级选择对应模板
3. **内容渲染**: 将签文内容动态填入模板占位符
4. **特效处理**: 应用对应等级的视觉特效
5. **文件输出**: 生成最终的NFT图片和metadata

## 预期效果

通过这套模板系统，可以：
- **设计效率**: 只需设计3个模板，而非100个独立设计
- **视觉统一**: 保持整体风格一致性和品牌识别度
- **稀有性体现**: 不同等级的签文有明显的视觉差异
- **动态生成**: 支持未来新增签文的快速NFT化
- **可扩展性**: 可轻松添加新的稀有度等级和模板

## 成本分析

- **传统方案**: 100个独立设计 = 设计师30天 + 高昂成本
- **模板方案**: 3个模板设计 + 技术实现 = 设计师5天 + 开发2天
- **效率提升**: 约85%的时间和成本节省

这套方案既保证了每个NFT的独特性，又大大降低了制作成本，是理想的解决方案。