#!/usr/bin/env node

/**
 * BSC主网部署脚本
 * 使用方法: npx hardhat run scripts/deploy-mainnet.js --network bscMainnet
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// 主网部署配置
const MAINNET_CONFIG = {
  // 平台金库地址 (签到收入接收地址)
  platformTreasury: '0x6280279d2aD1627552C56088b2A49397be954942',
  
  // 签到费用 (0.0002 BNB)
  checkinCost: ethers.parseEther('0.0002'),
  
  // Gas配置 (BSC主网)
  gasPrice: ethers.parseUnits('5', 'gwei'),
  gasLimit: 3000000,
  
  // 网络信息
  network: 'BSC Mainnet',
  chainId: 56,
  explorer: 'https://bscscan.com',
  rpcUrl: 'https://bsc-dataseed1.binance.org/'
};

async function main() {
  console.log('🚀 开始部署到BSC主网...');
  console.log('================================');
  
  // 获取网络信息
  const network = await ethers.provider.getNetwork();
  console.log('🌐 网络信息:');
  console.log(`   Chain ID: ${network.chainId}`);
  console.log(`   Network: ${network.name}`);
  
  // 验证网络
  if (network.chainId !== 56n) {
    console.error('❌ 错误: 当前网络不是BSC主网');
    console.error(`   期望Chain ID: 56, 实际: ${network.chainId}`);
    process.exit(1);
  }
  
  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log('👤 部署者信息:');
  console.log(`   地址: ${deployer.address}`);
  
  // 检查账户余额
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInBNB = ethers.formatEther(balance);
  console.log(`   余额: ${balanceInBNB} BNB`);
  
  // 检查最低余额要求 (0.1 BNB)
  const minimumBalance = ethers.parseEther('0.1');
  if (balance < minimumBalance) {
    console.error('❌ 错误: 账户余额不足');
    console.error(`   需要至少 0.1 BNB 用于部署，当前余额: ${balanceInBNB} BNB`);
    process.exit(1);
  }
  
  // 验证平台金库地址
  console.log('🏦 平台金库地址验证:');
  console.log(`   地址: ${MAINNET_CONFIG.platformTreasury}`);
  
  if (!ethers.isAddress(MAINNET_CONFIG.platformTreasury)) {
    console.error('❌ 错误: 平台金库地址无效');
    process.exit(1);
  }
  
  // 用户确认
  console.log('⚠️  请确认部署参数:');
  console.log(`   网络: ${MAINNET_CONFIG.network}`);
  console.log(`   平台金库: ${MAINNET_CONFIG.platformTreasury}`);
  console.log(`   签到费用: ${ethers.formatEther(MAINNET_CONFIG.checkinCost)} BNB`);
  console.log(`   Gas价格: ${ethers.formatUnits(MAINNET_CONFIG.gasPrice, 'gwei')} gwei`);
  console.log('');
  
  // 部署合约
  console.log('📦 开始部署合约...');
  const AstroZiPointsSystem = await ethers.getContractFactory('AstroZiPointsSystem');
  
  console.log('⏳ 正在部署...');
  const contract = await AstroZiPointsSystem.deploy(
    MAINNET_CONFIG.platformTreasury,
    {
      gasPrice: MAINNET_CONFIG.gasPrice,
      gasLimit: MAINNET_CONFIG.gasLimit
    }
  );
  
  console.log('📤 交易已提交...');
  console.log(`   交易哈希: ${contract.deploymentTransaction().hash}`);
  
  // 等待部署确认
  console.log('⏱️  等待部署确认...');
  const receipt = await contract.deploymentTransaction().wait();
  
  if (receipt.status === 1) {
    console.log('✅ 合约部署成功!');
    console.log(`   合约地址: ${await contract.getAddress()}`);
    console.log(`   区块高度: ${receipt.blockNumber}`);
    console.log(`   Gas使用: ${receipt.gasUsed.toString()}`);
    console.log(`   Gas价格: ${ethers.formatUnits(receipt.gasPrice, 'gwei')} gwei`);
    
    // 验证合约部署
    console.log('🔍 验证合约状态...');
    const contractAddress = await contract.getAddress();
    
    try {
      const platformTreasury = await contract.platformTreasury();
      const checkinCost = await contract.checkinCost();
      const owner = await contract.owner();
      
      console.log('✅ 合约验证成功:');
      console.log(`   平台金库: ${platformTreasury}`);
      console.log(`   签到费用: ${ethers.formatEther(checkinCost)} BNB`);
      console.log(`   合约所有者: ${owner}`);
      
      // 保存部署信息
      await saveDeploymentInfo(contractAddress, receipt, deployer.address);
      
      // 更新配置文件
      await updateConfigFiles(contractAddress);
      
      console.log('🎉 主网部署完成!');
      console.log('');
      console.log('📋 后续步骤:');
      console.log('1. 更新前端配置文件');
      console.log('2. 在BSCScan上验证合约代码');
      console.log('3. 测试合约功能');
      console.log('4. 公告部署信息');
      console.log('');
      console.log(`🔗 BSCScan链接: ${MAINNET_CONFIG.explorer}/address/${contractAddress}`);
      
    } catch (error) {
      console.error('❌ 合约验证失败:', error);
      process.exit(1);
    }
    
  } else {
    console.error('❌ 合约部署失败');
    process.exit(1);
  }
}

async function saveDeploymentInfo(contractAddress, receipt, deployerAddress) {
  const timestamp = new Date().toISOString();
  const deploymentInfo = {
    network: MAINNET_CONFIG.network,
    chainId: MAINNET_CONFIG.chainId,
    contractAddress: contractAddress,
    deployerAddress: deployerAddress,
    deploymentHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    gasPrice: receipt.gasPrice.toString(),
    timestamp: timestamp,
    config: {
      checkinCost: ethers.formatEther(MAINNET_CONFIG.checkinCost),
      platformTreasury: MAINNET_CONFIG.platformTreasury,
      owner: deployerAddress
    }
  };
  
  // 保存部署记录
  const deploymentPath = path.join(__dirname, '../deployment');
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }
  
  const filename = `deployment-bscMainnet-${Date.now()}.json`;
  const filepath = path.join(deploymentPath, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 部署信息已保存: ${filename}`);
}

async function updateConfigFiles(contractAddress) {
  // 更新合约配置文件
  const configPath = path.join(__dirname, '../contracts-config.json');
  const config = {
    contractAddress: contractAddress,
    network: 'bscMainnet',
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('📄 合约配置文件已更新');
}

// 错误处理
process.on('unhandledRejection', (error) => {
  console.error('❌ 未处理的错误:', error);
  process.exit(1);
});

if (require.main === module) {
  main()
    .then(() => {
      console.log('🏁 部署脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 部署失败:', error);
      process.exit(1);
    });
}

module.exports = { main };