// AstroZi 智能合约部署配置
// 支持BSC测试网和主网部署

const { ethers } = require('hardhat');
require('dotenv').config();

// 网络配置
const NETWORKS = {
  bscTestnet: {
    name: 'BSC Testnet',
    chainId: 97,
    rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    explorer: 'https://testnet.bscscan.com',
    faucet: 'https://testnet.binance.org/faucet-smart'
  },
  bscMainnet: {
    name: 'BSC Mainnet',
    chainId: 56,
    rpc: 'https://bsc-dataseed1.binance.org/',
    explorer: 'https://bscscan.com'
  }
};

// 部署配置
const DEPLOY_CONFIG = {
  // 签到费用 (0.0002 BNB)
  checkinCost: ethers.parseEther('0.0002'),
  
  // 平台钱包地址 (需要替换为你的实际地址)
  platformWallet: process.env.PLATFORM_WALLET || '0x6280279d2aD1627552C56088b2A49397be954942',
  
  // Gas配置
  gasPrice: ethers.parseUnits('10', 'gwei'), // 提高gas价格确保执行
  gasLimit: 3000000,
  
  // 合约初始化参数
  initialOwner: process.env.INITIAL_OWNER || process.env.DEPLOYER_PRIVATE_KEY,
};

// 验证部署环境
function validateEnvironment() {
  const required = ['DEPLOYER_PRIVATE_KEY'];
  
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
  
  console.log('✅ Environment validation passed');
}

// 部署合约
async function deployContract(network = 'bscTestnet') {
  validateEnvironment();
  
  console.log(`🚀 开始部署到 ${NETWORKS[network].name}...`);
  
  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);
  
  console.log('📝 部署信息:');
  console.log(`  部署者地址: ${deployerAddress}`);
  console.log(`  账户余额: ${ethers.formatEther(balance)} BNB`);
  console.log(`  网络: ${NETWORKS[network].name}`);
  console.log(`  签到费用: ${ethers.formatEther(DEPLOY_CONFIG.checkinCost)} BNB`);
  console.log(`  平台钱包: ${DEPLOY_CONFIG.platformWallet}`);
  
  // 检查余额是否足够
  const estimatedGasCost = DEPLOY_CONFIG.gasPrice * BigInt(DEPLOY_CONFIG.gasLimit);
  if (balance < estimatedGasCost) {
    throw new Error(`余额不足! 需要至少 ${ethers.formatEther(estimatedGasCost)} BNB`);
  }
  
  // 部署合约
  console.log('\n📦 部署AstroZiPointsSystem合约...');
  
  const AstroZiPointsSystem = await ethers.getContractFactory('AstroZiPointsSystem');
  const contract = await AstroZiPointsSystem.deploy(
    DEPLOY_CONFIG.platformWallet,
    {
      gasPrice: DEPLOY_CONFIG.gasPrice,
      gasLimit: DEPLOY_CONFIG.gasLimit
    }
  );
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log('🎉 合约部署成功!');
  console.log(`  合约地址: ${contractAddress}`);
  console.log(`  交易哈希: ${contract.deploymentTransaction().hash}`);
  console.log(`  区块浏览器: ${NETWORKS[network].explorer}/address/${contractAddress}`);
  
  // 验证合约状态
  console.log('\n🔍 验证合约状态...');
  
  const checkinCost = await contract.checkinCost();
  const platformTreasury = await contract.platformTreasury();
  const owner = await contract.owner();
  
  console.log(`  签到费用: ${ethers.formatEther(checkinCost)} BNB`);
  console.log(`  平台钱包: ${platformTreasury}`);
  console.log(`  合约所有者: ${owner}`);
  
  // 保存部署信息
  const deploymentInfo = {
    network: NETWORKS[network].name,
    chainId: NETWORKS[network].chainId,
    contractAddress,
    deployerAddress,
    deploymentHash: contract.deploymentTransaction().hash,
    timestamp: new Date().toISOString(),
    config: {
      checkinCost: ethers.formatEther(checkinCost),
      platformTreasury,
      owner
    }
  };
  
  // 写入部署记录
  const fs = require('fs');
  const path = require('path');
  
  const deploymentFile = path.join(__dirname, `deployment-${network}-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`\n📄 部署信息已保存到: ${deploymentFile}`);
  
  return {
    contract,
    address: contractAddress,
    deploymentInfo
  };
}

// 验证合约 (用于BSC区块浏览器验证)
async function verifyContract(contractAddress, network = 'bscTestnet') {
  console.log(`🔍 验证合约 ${contractAddress} 在 ${NETWORKS[network].name}...`);
  
  try {
    await hre.run('verify:verify', {
      address: contractAddress,
      constructorArguments: [DEPLOY_CONFIG.platformWallet],
      network: network
    });
    
    console.log('✅ 合约验证成功!');
  } catch (error) {
    console.error('❌ 合约验证失败:', error.message);
  }
}

// 测试合约功能
async function testContract(contractAddress, network = 'bscTestnet') {
  console.log(`🧪 测试合约功能...`);
  
  const AstroZiPointsSystem = await ethers.getContractFactory('AstroZiPointsSystem');
  const contract = AstroZiPointsSystem.attach(contractAddress);
  
  const [deployer] = await ethers.getSigners();
  
  try {
    // 测试签到功能
    console.log('  测试签到功能...');
    
    const balanceBefore = await ethers.provider.getBalance(deployer.address);
    console.log(`    签到前余额: ${ethers.formatEther(balanceBefore)} BNB`);
    
    // 执行签到
    const tx = await contract.performCheckin({
      value: DEPLOY_CONFIG.checkinCost,
      gasLimit: 200000
    });
    
    const receipt = await tx.wait();
    console.log(`    签到交易哈希: ${receipt.hash}`);
    
    const balanceAfter = await ethers.provider.getBalance(deployer.address);
    console.log(`    签到后余额: ${ethers.formatEther(balanceAfter)} BNB`);
    
    // 查询用户统计
    const userStats = await contract.userStats(deployer.address);
    console.log('    用户统计:', {
      totalPoints: userStats.totalPoints.toString(),
      consecutiveDays: userStats.consecutiveDays.toString(),
      airdropWeight: userStats.airdropWeight.toString(),
      isEligible: userStats.isEligible
    });
    
    console.log('✅ 合约功能测试成功!');
    
  } catch (error) {
    console.error('❌ 合约测试失败:', error.message);
  }
}

module.exports = {
  deployContract,
  verifyContract,
  testContract,
  NETWORKS,
  DEPLOY_CONFIG
};

// 如果直接运行此脚本
if (require.main === module) {
  const network = process.argv[2] || 'bscTestnet';
  
  deployContract(network)
    .then(({ address }) => {
      console.log('\n🎯 下一步操作:');
      console.log(`1. 验证合约: npx hardhat run scripts/verify.js --network ${network}`);
      console.log(`2. 测试合约: npx hardhat run scripts/test-contract.js --network ${network}`);
      console.log(`3. 更新前端配置文件中的合约地址: ${address}`);
    })
    .catch(console.error);
}