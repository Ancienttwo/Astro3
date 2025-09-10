#!/usr/bin/env node

/**
 * 更新智能合约的平台金库地址
 * 使用方法: node scripts/update-platform-treasury.js
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// 配置
const NEW_PLATFORM_TREASURY = '0x6280279d2aD1627552C56088b2A49397be954942';
const CONTRACTS_CONFIG_PATH = path.join(__dirname, '../contracts-config.json');

async function main() {
  console.log('🚀 开始更新平台金库地址...');
  console.log('📝 新地址:', NEW_PLATFORM_TREASURY);
  
  // 读取合约配置
  let contractConfig;
  try {
    const configData = fs.readFileSync(CONTRACTS_CONFIG_PATH, 'utf8');
    contractConfig = JSON.parse(configData);
    console.log('📋 当前合约地址:', contractConfig.contractAddress);
  } catch (error) {
    console.error('❌ 无法读取合约配置:', error);
    process.exit(1);
  }

  // 获取网络信息
  const network = await ethers.provider.getNetwork();
  console.log('🌐 当前网络:', network.name, '(Chain ID:', network.chainId, ')');

  // 获取签名者
  const [deployer] = await ethers.getSigners();
  console.log('👤 部署者地址:', deployer.address);
  console.log('💰 部署者余额:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'BNB');

  // 获取合约实例
  const AstroZiPointsSystem = await ethers.getContractFactory('AstroZiPointsSystem');
  const contract = AstroZiPointsSystem.attach(contractConfig.contractAddress);

  try {
    // 检查当前的平台金库地址
    const currentTreasury = await contract.platformTreasury();
    console.log('🏦 当前平台金库地址:', currentTreasury);

    // 检查合约所有者
    const contractOwner = await contract.owner();
    console.log('👑 合约所有者:', contractOwner);
    
    if (contractOwner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.error('❌ 错误: 只有合约所有者才能更新平台金库地址');
      console.error('   合约所有者:', contractOwner);
      console.error('   当前账户:', deployer.address);
      process.exit(1);
    }

    // 如果地址相同则跳过
    if (currentTreasury.toLowerCase() === NEW_PLATFORM_TREASURY.toLowerCase()) {
      console.log('✅ 地址已经是目标地址，无需更新');
      return;
    }

    // 执行更新
    console.log('⏳ 正在更新平台金库地址...');
    const tx = await contract.updatePlatformTreasury(NEW_PLATFORM_TREASURY);
    console.log('📤 交易已提交:', tx.hash);
    
    // 等待确认
    console.log('⏱️  等待交易确认...');
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log('✅ 交易成功确认!');
      console.log('⛽ Gas 使用:', receipt.gasUsed.toString());
      
      // 验证更新
      const newTreasury = await contract.platformTreasury();
      console.log('🔍 验证新地址:', newTreasury);
      
      if (newTreasury.toLowerCase() === NEW_PLATFORM_TREASURY.toLowerCase()) {
        console.log('🎉 平台金库地址更新成功!');
        
        // 更新本地配置文件
        await updateLocalConfig(NEW_PLATFORM_TREASURY);
        
      } else {
        console.error('❌ 验证失败: 地址更新不正确');
      }
    } else {
      console.error('❌ 交易失败');
    }

  } catch (error) {
    console.error('❌ 更新失败:', error);
    
    if (error.message.includes('Only owner')) {
      console.error('   原因: 只有合约所有者才能执行此操作');
    } else if (error.message.includes('Invalid platform treasury')) {
      console.error('   原因: 提供的地址无效');
    }
    
    process.exit(1);
  }
}

async function updateLocalConfig(newAddress) {
  try {
    // 更新部署记录
    const deploymentPath = path.join(__dirname, '../deployment');
    const files = fs.readdirSync(deploymentPath).filter(f => f.startsWith('deployment-') && f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(deploymentPath, file);
      const deploymentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (deploymentData.config) {
        deploymentData.config.platformTreasury = newAddress;
        deploymentData.config.lastUpdated = new Date().toISOString();
        fs.writeFileSync(filePath, JSON.stringify(deploymentData, null, 2));
        console.log('📄 已更新部署记录:', file);
      }
    }
    
    console.log('📝 本地配置文件已更新');
  } catch (error) {
    console.warn('⚠️  更新本地配置文件时出错:', error.message);
  }
}

// 错误处理
process.on('unhandledRejection', (error) => {
  console.error('❌ 未处理的错误:', error);
  process.exit(1);
});

if (require.main === module) {
  main()
    .then(() => {
      console.log('🏁 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { main };