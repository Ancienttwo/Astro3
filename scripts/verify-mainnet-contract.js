#!/usr/bin/env node

/**
 * BSC主网合约验证脚本
 * 使用方法: node scripts/verify-mainnet-contract.js <CONTRACT_ADDRESS>
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 主网配置
const MAINNET_CONFIG = {
  platformTreasury: '0x6280279d2aD1627552C56088b2A49397be954942',
  network: 'bscMainnet',
  explorer: 'https://bscscan.com'
};

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ 错误: 请提供合约地址');
    console.error('使用方法: node scripts/verify-mainnet-contract.js <CONTRACT_ADDRESS>');
    process.exit(1);
  }
  
  const contractAddress = args[0];
  
  console.log('🔍 开始验证BSC主网合约...');
  console.log('================================');
  console.log(`合约地址: ${contractAddress}`);
  console.log(`平台金库: ${MAINNET_CONFIG.platformTreasury}`);
  console.log(`网络: ${MAINNET_CONFIG.network}`);
  console.log('');
  
  try {
    // 构造验证命令
    const verifyCommand = `npx hardhat verify --network ${MAINNET_CONFIG.network} ${contractAddress} "${MAINNET_CONFIG.platformTreasury}"`;
    
    console.log('⏳ 执行验证命令...');
    console.log(`命令: ${verifyCommand}`);
    console.log('');
    
    // 执行验证
    const result = execSync(verifyCommand, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('✅ 合约验证成功!');
    console.log('输出:', result);
    
    // 保存验证信息
    const verificationInfo = {
      contractAddress: contractAddress,
      network: MAINNET_CONFIG.network,
      platformTreasury: MAINNET_CONFIG.platformTreasury,
      verifiedAt: new Date().toISOString(),
      explorerUrl: `${MAINNET_CONFIG.explorer}/address/${contractAddress}#code`
    };
    
    const verificationPath = path.join(__dirname, '../deployment');
    if (!fs.existsSync(verificationPath)) {
      fs.mkdirSync(verificationPath, { recursive: true });
    }
    
    const filename = `verification-${contractAddress}.json`;
    const filepath = path.join(verificationPath, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(verificationInfo, null, 2));
    console.log(`📄 验证信息已保存: ${filename}`);
    
    console.log('');
    console.log('🎉 验证完成!');
    console.log(`🔗 BSCScan链接: ${verificationInfo.explorerUrl}`);
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    
    if (error.message.includes('Already Verified')) {
      console.log('ℹ️  合约已经验证过了');
      console.log(`🔗 BSCScan链接: ${MAINNET_CONFIG.explorer}/address/${contractAddress}#code`);
    } else {
      console.error('请检查:');
      console.error('1. 合约地址是否正确');
      console.error('2. 构造函数参数是否正确');
      console.error('3. BSCScan API Key是否配置');
      console.error('4. 网络连接是否正常');
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}