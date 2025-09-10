# AstroZi 智能合约部署指南

## 🚀 快速开始

### 1. 环境准备

```bash
# 安装依赖
npm install

# 复制环境变量配置
cp ../env.example ../.env

# 编辑 .env 文件，填入真实值
vim ../.env
```

### 2. 必需配置

在 `.env` 文件中配置以下变量：

```bash
# 部署者私钥 (需要有BNB余额)
DEPLOYER_PRIVATE_KEY=你的私钥

# 平台收入钱包地址
PLATFORM_WALLET=你的钱包地址

# BSC扫描API密钥 (用于合约验证)
BSCSCAN_API_KEY=你的API密钥
```

### 3. 获取测试BNB

访问 [BSC测试网水龙头](https://testnet.binance.org/faucet-smart) 获取测试BNB

### 4. 部署合约

```bash
# 部署到BSC测试网 (推荐先测试)
npm run deploy:testnet

# 部署到BSC主网 (生产环境)
npm run deploy:mainnet
```

## 📋 部署流程详解

### 步骤1: 编译合约
```bash
npx hardhat compile
```

### 步骤2: 测试网部署
```bash
npx hardhat run deployment/deploy-setup.js --network bscTestnet
```

### 步骤3: 验证合约
```bash
npx hardhat verify CONTRACT_ADDRESS PLATFORM_WALLET_ADDRESS --network bscTestnet
```

### 步骤4: 测试功能
```bash
node -e "
const { testContract } = require('./deployment/deploy-setup.js');
testContract('CONTRACT_ADDRESS', 'bscTestnet');
"
```

## ⚙️ 配置说明

### 网络配置

| 网络 | Chain ID | RPC URL | 浏览器 |
|------|----------|---------|--------|
| BSC测试网 | 97 | https://data-seed-prebsc-1-s1.binance.org:8545/ | https://testnet.bscscan.com |
| BSC主网 | 56 | https://bsc-dataseed1.binance.org/ | https://bscscan.com |

### 合约参数

| 参数 | 值 | 说明 |
|------|-----|------|
| 签到费用 | 0.0002 BNB | 每次签到费用 |
| Gas Price | 5 Gwei | BSC标准Gas价格 |
| Gas Limit | 2,000,000 | 部署Gas限制 |

## 🔍 验证部署

部署成功后，你会看到类似输出：

```
🎉 合约部署成功!
  合约地址: 0x1234567890abcdef...
  交易哈希: 0xabcdef1234567890...
  区块浏览器: https://testnet.bscscan.com/address/0x1234567890abcdef...

🔍 验证合约状态...
  签到费用: 0.0002 BNB
  平台钱包: 0x742d35Cc6134C0532925a3b8D7C1d2e9dC5e6B9E
  合约所有者: 0x9876543210fedcba...
```

## 🧪 测试合约

```bash
# 编译和测试
npx hardhat test

# 本地网络测试
npx hardhat node
npx hardhat run deployment/deploy-setup.js --network localhost
```

## 📄 部署记录

每次部署都会生成记录文件：
- `deployment-bscTestnet-{timestamp}.json`
- `deployment-bscMainnet-{timestamp}.json`

包含完整的部署信息和合约配置。

## ⚠️ 安全注意事项

1. **私钥安全**: 绝不要将私钥提交到代码仓库
2. **测试优先**: 总是先在测试网测试再部署主网
3. **余额检查**: 确保部署账户有足够的BNB
4. **验证合约**: 部署后务必验证合约代码

## 🔧 故障排除

### 常见错误

1. **余额不足**
   ```bash
   Error: insufficient funds for gas * price + value
   ```
   解决: 向部署地址转入更多BNB

2. **网络连接失败**
   ```bash
   Error: could not detect network
   ```
   解决: 检查网络配置和RPC URL

3. **Gas费用过高**
   ```bash
   Error: gas required exceeds allowance
   ```
   解决: 增加gasLimit或降低gasPrice

### 查看部署状态

```bash
# 查看合约
npx hardhat console --network bscTestnet

# 在控制台中
const contract = await ethers.getContractAt("AstroZiPointsSystem", "CONTRACT_ADDRESS");
await contract.CHECKIN_COST();
```

## 🎯 下一步

部署成功后：

1. **更新前端配置**: 将合约地址添加到前端配置
2. **集成API**: 更新后端API以使用新合约
3. **测试流程**: 执行端到端签到流程测试
4. **监控设置**: 配置合约事件监控

---

*AstroZi 智能合约部署系统 v1.0*