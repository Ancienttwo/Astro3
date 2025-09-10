// 简化版部署脚本
const { ethers } = require("hardhat");
const { deployContract } = require("../deployment/deploy-setup");

async function main() {
  const network = hre.network.name;
  console.log(`🚀 正在部署到网络: ${network}`);
  
  try {
    const result = await deployContract(network);
    
    console.log("\n✅ 部署完成!");
    console.log(`合约地址: ${result.address}`);
    
    // 保存合约地址到配置文件
    const fs = require('fs');
    const config = {
      contractAddress: result.address,
      network: network,
      deployedAt: new Date().toISOString()
    };
    
    fs.writeFileSync('./contracts-config.json', JSON.stringify(config, null, 2));
    console.log("📝 合约配置已保存到 contracts-config.json");
    
  } catch (error) {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });