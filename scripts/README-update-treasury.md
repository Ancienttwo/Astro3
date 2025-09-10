# 更新签到收入地址指南

## 概述
此指南说明如何将签到系统的收入地址从当前地址更新为新地址：
- **旧地址**: `0x3d72E9Ad5A0Ae1B0911335238822F4eFa2e8F957`
- **新地址**: `0x6280279d2aD1627552C56088b2A49397be954942`

## 更新步骤

### 1. 准备工作

确保你有：
- 合约所有者的私钥权限
- 足够的 BNB 用于交易 Gas 费
- Hardhat 环境已配置

### 2. 执行智能合约更新

运行更新脚本：
```bash
# 在项目根目录下执行
npx hardhat run scripts/update-platform-treasury.js --network bscTestnet
```

### 3. 验证更新

脚本会自动验证地址是否更新成功。你也可以手动验证：

```bash
# 检查合约当前的平台金库地址
npx hardhat console --network bscTestnet
```

在控制台中：
```javascript
const contract = await ethers.getContractAt("AstroZiPointsSystem", "0xFC78beF935ce081f42cC3dA5e0F65adC0fF555a7");
console.log("当前平台金库地址:", await contract.platformTreasury());
```

## 文件更新状态

以下文件已更新为新地址：

✅ **已更新的配置文件**:
- `deployment/deployment-bscTestnet-1752546742412.json` - 部署记录文件
- `deployment/deploy-setup.js` - 默认部署配置

⚠️ **需要链上更新**:
- 智能合约中的 `platformTreasury` 变量 (需要执行脚本)

## 智能合约详情

- **合约地址**: `0xFC78beF935ce081f42cC3dA5e0F65adC0fF555a7`
- **网络**: BSC Testnet (Chain ID: 97)
- **更新函数**: `updatePlatformTreasury(address newPlatformTreasury)`
- **权限要求**: 仅合约所有者可执行

## 影响范围

地址更新后，所有新的签到交易（每次 0.0002 BNB）将发送到新地址：
- **Gas 预留**: 5% (用于合约运营)
- **平台收入**: 95% (发送到新的平台金库地址)

## 故障排除

### 常见错误：

1. **"Only owner can call this function"**
   - 确保使用的账户是合约所有者
   - 当前所有者: `0x3d72E9Ad5A0Ae1B0911335238822F4eFa2e8F957`

2. **"Invalid platform treasury"**
   - 检查新地址格式是否正确
   - 确保地址不是零地址

3. **交易失败**
   - 检查 Gas 费是否足够
   - 确保网络连接正常

## 联系支持

如果遇到问题，请检查：
- Hardhat 配置是否正确
- 网络连接是否稳定
- 私钥权限是否正确