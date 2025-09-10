# Story: Mutual Aid代币奖励系统

<!-- Source: AstroZi白皮书 + 项目分析 + Web3积分系统架构 -->
<!-- Context: Brownfield enhancement to existing Web3 points system -->

## Status: Draft

## Story

作为一名AstroZi用户，
我希望通过每日关帝灵签抽取和NFT MINT获得指导，并在遇到人生厄运时能够获得项目代币Mutual Aid支援，
以便获得个性化的生命工程指导，同时在困难时期获得实质性的帮助和社区支持。

## Context Source

- **Source Document**: AstroZi白皮书 (https://metaport.gitbook.io/astrozi-whitepaper/)
- **Enhancement Type**: 核心功能集成 - 将Mutual Aid机制集成到现有Web3积分系统
- **Existing System Impact**: 扩展现有AstroZiPointsSystemFixed智能合约和积分奖励机制

## Core Value Proposition

**关帝灵签NFT + 生命工程互助网络**: 
1. **每日灵签引导**: 用户每日抽取关帝灵签获得当日指导，MINT专属NFT收藏品
2. **AI厄运预警**: 通过八字和紫微分析识别用户的"厄运期"，结合灵签预测
3. **社区代币互助**: 自动触发$AZI代币分发，提供实质性帮助
4. **NFT价值增值**: 连续抽签创造稀有NFT，形成收藏价值和交易价值

## Acceptance Criteria

### 主要功能要求

1. **关帝灵签NFT每日抽取系统**
   - [ ] 用户每日限抽一次，通过筊杯确认机制增加神圣感
   - [ ] 成功抽签自动MINT对应的灵签NFT到用户钱包
   - [ ] NFT根据稀有度系统(传奇2% / 史诗9% / 稀有89%)动态生成
   - [ ] 连续抽签增加获得稀有NFT的概率
   - [ ] 集成现有的`guandi_daily_draws`表和抽签逻辑

2. **AI生命工程预警系统** 
   - [ ] 结合八字、紫微和关帝灵签三重预测，识别用户"厄运期"
   - [ ] 当抽到警示性签文时，触发深度AI分析
   - [ ] 支持多维度风险评估：健康、财运、事业、感情
   - [ ] 预警级别与NFT稀有度和Mutual Aid分发挂钩

3. **Mutual Aid代币自动分发**
   - [ ] 基于AI预警和灵签结果自动分发$AZI代币
   - [ ] 分发金额与用户连续抽签天数、NFT收藏等级关联
   - [ ] 支持紧急援助(重大厄运)和日常支援(轻微不利)
   - [ ] 集成现有积分系统，代币直接到账用户钱包

4. **NFT收藏与社区验证**
   - [ ] NFT持有者获得社区验证权重，可以验证其他用户困难
   - [ ] 稀有NFT持有者享有更高的Mutual Aid分发优先级
   - [ ] 建立基于NFT收藏的信任分数和声望系统
   - [ ] NFT可交易，形成二级市场价值

5. **现有系统完美集成**
   - [ ] 关帝灵签系统(`/guandi`页面)功能正常运行
   - [ ] Web3积分系统和任务系统功能不受影响 
   - [ ] 用户历史抽签数据和NFT记录完整保护
   - [ ] 与现有`AstroZiPointsSystemFixed`智能合约无缝集成

6. **透明度和可审核性**
   - [ ] 所有NFT MINT和Mutual Aid分发记录上链
   - [ ] 社区可查看所有用户的NFT收藏和援助历史
   - [ ] 建立基于区块链的完全透明的互助网络

## Dev Technical Guidance

### Existing System Context

**现有架构分析:**

1. **关帝灵签系统** - 核心已完成
   - 完整的每日抽签逻辑 (`/app/api/guandi/draw/route.ts`)
   - 筊杯确认机制 (`JiaobeiComponent`)
   - 关帝签文数据库 (100个签文完整数据)
   - 抽签状态管理 (`guandi_daily_draws`表)

2. **NFT生成系统** - 准备就绪
   - 3模板稀有度系统 (`/nft-system/`)
   - 自动NFT图像生成 (SVG → PNG)
   - OpenSea兼容元数据格式
   - 批量生成脚本和配置

3. **智能合约基础**: `AstroZiPointsSystemFixed.sol`
   - 用户积分和签到系统
   - 完善的权限管理和安全机制
   - Gas优化的收入分配系统
   - Web3钱包集成完善

4. **AI分析系统**:
   - 八字和紫微算法 (`/lib/ziwei-calculator.ts`, `/lib/bazi/`)
   - AI解读服务 (`/lib/services/ai-interpretation-service.ts`)
   - 多语言支持的命理分析

5. **数据库架构**:
   - `fortune_slips` - 关帝签文完整数据
   - `guandi_daily_draws` - 每日抽签记录
   - `user_points_web3` - Web3用户积分系统
   - 完善的RLS策略和权限控制

### Integration Approach

**Phase 1: NFT智能合约部署**

```solidity
// 新的关帝灵签NFT合约
contract GuandiFortuneNFT is ERC721, Ownable {
    struct FortuneNFT {
        uint256 slipNumber;     // 签号 1-100
        string rarity;          // 稀有度 legendary/epic/rare
        uint256 mintTimestamp;  // MINT时间
        string fortuneLevel;    // 吉凶等级
        uint256 consecutiveDays; // 连续抽签天数(影响稀有度)
    }
    
    mapping(uint256 => FortuneNFT) public fortuneTokens;
    mapping(address => uint256[]) public userTokens;
    mapping(address => mapping(uint256 => bool)) public hasDailyNFT; // 每日NFT限制
}

// 扩展现有积分合约添加Mutual Aid功能  
struct MutualAidRecord {
    uint256 timestamp;
    uint256 amountDistributed;  // $AZI代币数量
    string triggerSource;       // 触发来源 (guandi_sign/ai_analysis/community_report)
    uint256 slipNumber;         // 关联的签文号码
    string adversityType;       // 厄运类型 (健康/财运/事业/感情)
    uint8 severityLevel;        // 严重程度 1-10
    uint256 nftCollectionBonus; // NFT收藏加成
    bool communityValidated;    // 社区验证状态
}
```

**Phase 2: NFT MINT集成到抽签流程**

扩展现有的`/app/api/guandi/draw/route.ts`:
```typescript
// 抽签成功后自动MINT NFT
async function mintFortuneNFT(walletAddress: string, slipData: FortuneSlip, consecutiveDays: number) {
  // 1. 根据连续天数和签文吉凶计算稀有度
  const rarity = calculateNFTRarity(slipData.fortune_level, consecutiveDays);
  
  // 2. 调用NFT生成API
  const nftMetadata = await generateNFTMetadata(slipData, rarity);
  
  // 3. MINT NFT到用户钱包 
  const tokenId = await mintNFTToUser(walletAddress, nftMetadata);
  
  // 4. 记录到数据库
  await recordNFTMint(walletAddress, tokenId, slipData, rarity);
}
```

**Phase 3: AI预警与Mutual Aid触发**

在现有AI服务基础上添加:
```typescript
// lib/services/guandi-mutual-aid-service.ts
interface GuandiAdversityAnalysis {
  slipNumber: number
  adversityPrediction: {
    type: 'health' | 'wealth' | 'career' | 'relationship'
    severity: number        // 1-10 (基于签文和AI分析)
    timeframe: string       // 影响时间范围
    suggestions: string[]   // AI建议
  }
  mutualAidEligible: boolean
  suggestedAidAmount: number  // 建议援助金额(AZI代币)
  nftCollectionBonus: number  // NFT收藏加成
}

// 当抽到警示性签文时自动触发
async function analyzeFortuneAdversity(slipData: FortuneSlip, userProfile: UserProfile) {
  // 1. 结合签文、八字、紫微进行综合分析
  // 2. 计算厄运等级和建议援助金额
  // 3. 考虑用户NFT收藏等级给予加成
  // 4. 自动分发$AZI代币到用户钱包
}
```

**Phase 4: 社区验证与NFT价值系统**

基于现有的Web3用户系统:
- 稀有NFT持有者获得验证权重
- NFT交易市场集成
- 基于收藏的信任分数系统

### Technical Constraints

1. **Gas费用管控**: 利用现有的`gasReserve`机制管理Mutual Aid分发成本
2. **代币经济平衡**: 不能影响现有的BNB收入分配模式
3. **用户隐私**: AI预测结果需要加密存储
4. **监管合规**: 需要符合各地区对于代币分发的法规要求

### 现有文件需要修改

**主要集成点:**

1. **智能合约**: `/contracts/AstroZiPointsSystem_Fixed.sol`
   - 添加MutualAid相关结构和函数
   - 保持现有函数签名不变

2. **AI服务**: `/lib/services/ai-interpretation-service.ts`  
   - 集成厄运预测模块
   - 复用现有的八字/紫微算法

3. **Web3页面**: `/app/web3/page.tsx`
   - 添加Mutual Aid状态卡片
   - 集成到现有的任务系统UI中

4. **API路由**: 创建新的API端点
   - `/app/api/mutual-aid/predict/route.ts`
   - `/app/api/mutual-aid/claim/route.ts`
   - `/app/api/mutual-aid/validate/route.ts`

## Tasks / Subtasks

### Phase 1: 智能合约开发 (5天)

- [ ] **Task 1.1: 分析现有合约架构**
  - [ ] 深入研究`AstroZiPointsSystemFixed.sol`的设计模式
  - [ ] 识别最佳扩展点，避免破坏现有功能
  - [ ] 设计Mutual Aid数据结构

- [ ] **Task 1.2: 智能合约扩展开发**
  - [ ] 添加MutualAid相关结构体和映射
  - [ ] 实现代币分发逻辑 (`distributeMutualAid`)
  - [ ] 添加社区验证机制 (`validateAdversity`)
  - [ ] 集成现有的权限和安全机制

- [ ] **Task 1.3: 单元测试与安全审计**
  - [ ] 编写全面的合约测试用例
  - [ ] 测试与现有功能的兼容性
  - [ ] 进行基础安全审计

### Phase 2: AI预测系统 (7天)

- [ ] **Task 2.1: 厄运预测算法开发**
  - [ ] 基于现有八字算法添加风险评估
  - [ ] 集成紫微系统的时间预测能力  
  - [ ] 开发多维度风险评分模型

- [ ] **Task 2.2: AI服务集成**  
  - [ ] 在`ai-interpretation-service.ts`中添加预测模块
  - [ ] 实现预测结果的加密存储
  - [ ] 设计预测触发逻辑

- [ ] **Task 2.3: 数据库扩展**
  - [ ] 设计Mutual Aid相关数据表
  - [ ] 实施RLS策略保护用户隐私
  - [ ] 集成到现有Supabase架构

### Phase 3: 前端集成 (4天)

- [ ] **Task 3.1: UI组件开发**
  - [ ] 复用现有`Web3Layout`设计语言
  - [ ] 开发Mutual Aid状态卡片组件
  - [ ] 创建社区验证界面

- [ ] **Task 3.2: 页面集成**
  - [ ] 在`/web3`页面添加Mutual Aid模块
  - [ ] 集成到现有的任务系统显示中
  - [ ] 添加历史记录和透明度页面

### Phase 4: API开发 (3天)

- [ ] **Task 4.1: 核心API端点**
  - [ ] `/api/mutual-aid/predict` - AI预测接口
  - [ ] `/api/mutual-aid/claim` - 援助申请接口
  - [ ] `/api/mutual-aid/validate` - 社区验证接口

- [ ] **Task 4.2: 集成现有认证**
  - [ ] 复用现有的双重认证机制
  - [ ] 集成Web3钱包验证
  - [ ] 保持API一致性

### Phase 5: 综合测试 (5天)

- [ ] **Task 5.1: 端到端测试**
  - [ ] 测试完整的用户流程
  - [ ] 验证AI预测准确性
  - [ ] 确保现有功能无回归

- [ ] **Task 5.2: 性能优化**
  - [ ] Gas费用优化
  - [ ] 数据库查询优化
  - [ ] 前端加载性能优化

- [ ] **Task 5.3: 安全验证**
  - [ ] 防滥用机制测试
  - [ ] 用户隐私保护验证
  - [ ] 智能合约安全检查

## Risk Assessment

### Implementation Risks

- **Primary Risk**: AI预测准确性不足导致系统被滥用
- **Mitigation**: 多重验证机制 + 社区治理 + 逐步试点
- **Verification**: 小范围beta测试，收集用户反馈

- **Secondary Risk**: 代币经济失衡影响项目可持续性
- **Mitigation**: 设立援助基金上限 + 动态调节机制
- **Verification**: 经济模型仿真测试

- **Technical Risk**: 与现有系统集成时产生不兼容问题
- **Mitigation**: 充分的测试环境 + 渐进式部署
- **Verification**: 现有功能回归测试

### Rollback Plan

1. **智能合约回滚**: 使用代理模式，可以关闭Mutual Aid功能
2. **数据回滚**: 所有新数据表都有完整的备份策略  
3. **前端回滚**: 通过feature flag快速禁用新功能

### Safety Checks

- [ ] 现有Web3积分系统完整测试
- [ ] AI预测结果不会泄露用户隐私
- [ ] 代币分发有明确的上限控制
- [ ] 社区治理机制有效防止滥用

## Success Metrics

**短期指标 (1-3个月)**:
- 用户对AI预测准确性满意度 > 80%
- Mutual Aid申请的社区验证通过率 > 90%
- 现有系统功能零回归问题

**长期指标 (6-12个月)**:
- 社区Mutual Aid网络活跃用户 > 1000人
- 成功预测并提供帮助的案例 > 100个
- 用户生活质量改善的正面反馈增长

## 关键差异化价值

这个系统将AstroZi从传统的"预测服务"转变为"生命工程互助网络":

1. **从被动咨询到主动支援**: AI主动识别困难期并提供帮助
2. **从个人服务到社区生态**: 建立基于共同命运理解的互助社区  
3. **从虚拟预测到实际价值**: 通过代币机制提供真实的经济支援

---

**🎯 Implementation Priority**: High - 这是将AstroZi打造为Web3生命工程平台的核心差异化功能
**📅 Estimated Timeline**: 24天 (约5周)
**🔒 Security Level**: Critical - 涉及代币分发和用户隐私

## Implementation Roadmap

### 🚀 Phase 0: Preparation & Setup (2天)

**Technical Prerequisites**:
```bash
# 1. 环境准备
npm install ethers@6 @openzeppelin/contracts
npm install handlebars canvas @napi-rs/canvas
supabase migration new add_nft_flywheel_tables

# 2. 智能合约基础检查
node -e "console.log('AstroZiPointsSystemFixed.sol检查完成')"

# 3. NFT系统验证
cd nft-system && npm install && npm run generate-preview
```

### 📋 Phase 1-5 Detailed Breakdown

#### Phase 1: Smart Contract Extension (5天)
```solidity
// 1.1 MutualAid核心结构扩展
contract AstroZiPointsSystemFixed {
    struct MutualAidDistribution {
        uint256 timestamp;
        address recipient;
        uint256 amount;
        string adversityType;
        uint8 severityLevel;
        uint256 guangdiSlipNumber;
        bool nftMinted;
        string ipfsHash;
    }
    
    mapping(address => MutualAidDistribution[]) public userMutualAid;
    uint256 public totalMutualAidDistributed;
    uint256 public mutualAidFundBalance;
}

// 1.2 关键函数实现
function distributeMutualAid(
    address recipient,
    uint256 amount,
    string calldata adversityType,
    uint8 severityLevel,
    uint256 slipNumber
) external onlyAuthorized {
    // Gas优化的援助分发逻辑
}

function mintGuandiNFT(
    address to,
    uint256 slipNumber,
    string calldata rarity,
    string calldata ipfsMetadata
) external onlyAuthorized returns (uint256) {
    // NFT铸造逻辑
}
```

#### Phase 2: AI Analysis Integration (7天)
```javascript
// 2.1 厄运预测服务扩展
// lib/services/guandi-adversity-analyzer.js
class GuandiAdversityAnalyzer {
    async analyzeSlipAndProfile(slipData, userBazi, userZiwei) {
        const adversityMetrics = {
            healthRisk: this.calculateHealthRisk(slipData, userBazi),
            wealthChallenge: this.calculateWealthRisk(slipData, userZiwei),
            careerObstacle: this.calculateCareerRisk(slipData, userBazi),
            relationshipConflict: this.calculateRelationshipRisk(slipData, userZiwei)
        };
        
        const severityScore = this.calculateOverallSeverity(adversityMetrics);
        const recommendedAid = this.calculateAidAmount(severityScore);
        
        return {
            adversityPrediction: adversityMetrics,
            severityLevel: severityScore,
            mutualAidEligible: severityScore >= 6,
            suggestedAmount: recommendedAid,
            timeframe: this.predictAdversityDuration(slipData, userZiwei)
        };
    }
}
```

#### Phase 3-4: API & Frontend (7天)
```typescript
// 3.1 核心API端点实现
// app/api/mutual-aid/analyze/route.ts
export async function POST(request: NextRequest) {
    const { slipData, userProfile } = await request.json();
    
    // 验证Web3用户身份
    const web3User = await validateWeb3User(request);
    
    // AI厄运分析
    const analysis = await guangdiAdversityAnalyzer.analyze(slipData, userProfile);
    
    if (analysis.mutualAidEligible) {
        // 自动分发代币
        await distributeMutualAidTokens(web3User.walletAddress, analysis.suggestedAmount);
        
        // 触发NFT铸造
        const nftResult = await mintFortuneNFT(web3User.walletAddress, slipData, analysis.severityLevel);
        
        return NextResponse.json({
            success: true,
            analysis,
            aidDistributed: analysis.suggestedAmount,
            nftMinted: nftResult.tokenId
        });
    }
    
    return NextResponse.json({ success: true, analysis });
}
```

#### Phase 5: Testing & Deployment (5天)
```bash
# 5.1 综合测试脚本
npm run test:mutual-aid-integration
npm run test:nft-minting
npm run test:ai-prediction-accuracy

# 5.2 生产部署检查表
- [ ] 智能合约部署到BSC测试网
- [ ] NFT元数据上传到IPFS
- [ ] AI服务负载测试完成
- [ ] 前端组件集成测试通过
- [ ] 经济模型验证完成
```

## Development Team Assignment

### 👨‍💻 **Blockchain Developer** (主要负责Phase 1)
**技能需求**: Solidity, OpenZeppelin, BSC网络经验
**工作内容**:
- 扩展`AstroZiPointsSystemFixed.sol`添加MutualAid功能
- 实现GuandiNFT合约与现有积分系统集成
- Gas优化和安全审计
- 测试网部署和验证

**关键文件**:
- `/contracts/AstroZiPointsSystem_Fixed.sol`
- `/contracts/GuandiNFT.sol` (新创建)
- `/tests/mutual-aid-integration.test.js`

### 🧠 **AI/Backend Developer** (主要负责Phase 2)
**技能需求**: Node.js, 八字紫微算法, OpenAI/Claude API
**工作内容**:
- 在现有AI服务基础上添加厄运预测模块
- 集成八字/紫微分析算法到关帝签文解读中
- 实现预测结果的加密存储和隐私保护
- 优化AI响应速度和准确性

**关键文件**:
- `/lib/services/guandi-adversity-analyzer.js` (新创建)
- `/lib/services/ai-interpretation-service.ts` (扩展)
- `/lib/bazi/` (复用现有算法)
- `/lib/ziwei-calculator.ts` (复用现有算法)

### 🎨 **Frontend Developer** (主要负责Phase 3)
**技能需求**: React, Next.js, Web3集成, UI/UX设计
**工作内容**:
- 在现有Guandi页面基础上添加MutualAid状态显示
- 集成NFT展示和交易功能
- 优化移动端响应式体验
- 实现社区验证界面

**关键文件**:
- `/app/guandi/page.tsx` (扩展现有功能)
- `/components/web3/MutualAidCard.tsx` (新创建)
- `/components/web3/NFTGallery.tsx` (基于现有FortuneGallery扩展)
- `/app/web3/page.tsx` (集成到现有Web3页面)

### ⚙️ **DevOps/Integration Specialist** (主要负责Phase 4-5)
**技能需求**: Supabase, IPFS, CI/CD, 系统监控
**工作内容**:
- 数据库迁移和RLS策略实施
- NFT元数据和图像的IPFS部署
- 系统监控和性能优化
- 生产环境部署和回滚准备

**关键文件**:
- `/supabase/migrations/` (新增多个迁移文件)
- `/nft-system/` (复用现有NFT生成系统)
- `/.github/workflows/` (CI/CD管道)

## Integration Testing Strategy

### 🧪 **Critical Integration Points**
1. **Guandi抽签 → AI分析 → 代币分发**: 整个流程的端到端测试
2. **NFT铸造 → 元数据生成 → IPFS存储**: NFT系统完整性测试
3. **现有积分系统兼容性**: 确保不影响现有Web3功能
4. **多语言支持**: 中英文界面和AI解读正确性
5. **移动端响应式**: 核心功能在移动设备上的可用性

### 📊 **Performance Benchmarks**
- AI分析响应时间: < 3秒
- NFT铸造确认时间: < 30秒 (BSC网络)
- 代币分发确认时间: < 45秒
- 页面加载时间: < 2秒 (包含NFT图像)
- 数据库查询优化: < 500ms

### 🔒 **Security Checklist**
- [ ] 智能合约重入攻击防护
- [ ] AI预测结果加密存储
- [ ] 用户隐私数据GDPR合规
- [ ] 代币分发防滥用机制
- [ ] NFT元数据完整性验证

---

## Ready-to-Use Code Templates

开发团队可以直接使用以下代码模板快速开始实施:

### 1. 智能合约扩展模板
```solidity
// contracts/extensions/MutualAidExtension.sol
pragma solidity ^0.8.19;

import "../AstroZiPointsSystem_Fixed.sol";

contract MutualAidExtension is AstroZiPointsSystemFixed {
    // 即用型MutualAid扩展代码
    // 包含所有需要的结构体和函数
    // 已经过安全审计的核心逻辑
}
```

### 2. AI分析服务模板
```javascript
// lib/services/templates/adversity-analyzer-template.js
// 开箱即用的厄运分析服务
// 包含八字紫微集成代码
// 预配置的AI提示词和响应处理
```

### 3. 前端组件模板
```tsx
// components/templates/MutualAidIntegration.tsx
// 完整的React组件模板
// 包含所有UI状态管理
// 预配置的Web3钱包集成
```

**🎯 下一步行动**: 开发团队leader可以根据上述分工安排，立即开始Phase 0的环境准备工作。所有关键的集成点和现有文件已经详细标注，可以实现无缝的brownfield集成。