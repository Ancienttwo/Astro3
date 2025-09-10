// Deploy script for AstroZi Mutual Aid System contracts
// Usage: node deploy.js [network] [verify]

const { ethers, upgrades } = require('hardhat');
const fs = require('fs');
const path = require('path');

// Configuration
const DEPLOY_CONFIG = {
  bsc_testnet: {
    name: 'BSC Testnet',
    chainId: 97,
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorer: 'https://testnet.bscscan.com',
    gasPrice: '10000000000', // 10 gwei
  },
  bsc_mainnet: {
    name: 'BSC Mainnet',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    explorer: 'https://bscscan.com',
    gasPrice: '5000000000', // 5 gwei
  }
};

// Deployment parameters
const DEPLOYMENT_PARAMS = {
  // Token configuration
  TOKEN_NAME: 'AstroZi Mutual Aid Token',
  TOKEN_SYMBOL: 'AZI',
  
  // NFT configuration  
  NFT_NAME: 'Guandi Fortune NFT',
  NFT_SYMBOL: 'GFNFT',
  
  // Governance configuration
  VOTING_DELAY: 1 * 24 * 60 * 60, // 1 day in seconds
  VOTING_PERIOD: 7 * 24 * 60 * 60, // 7 days in seconds
  TIMELOCK_MIN_DELAY: 1 * 24 * 60 * 60, // 1 day in seconds
  
  // System parameters
  MAX_DAILY_DISTRIBUTION: ethers.parseEther('1000'), // 1000 AZI
  MIN_STAKING_AMOUNT: ethers.parseEther('100'), // 100 AZI
  QUORUM_PERCENTAGE: 4, // 4%
};

class ContractDeployer {
  constructor(network) {
    this.network = network;
    this.config = DEPLOY_CONFIG[network];
    this.deployedContracts = {};
    this.deploymentLog = [];
  }

  async deploy() {
    console.log(`🚀 Starting deployment to ${this.config.name}...`);
    console.log(`📡 RPC URL: ${this.config.rpcUrl}`);
    console.log('');

    try {
      // Initialize provider and signer
      await this.initialize();
      
      // Deploy contracts in order
      await this.deployMutualAidToken();
      await this.deployGuandiNFT();
      await this.deployTimelockController();
      await this.deployGovernance();
      
      // Setup roles and permissions
      await this.setupRoles();
      
      // Save deployment info
      await this.saveDeploymentInfo();
      
      console.log('✅ Deployment completed successfully!');
      console.log('');
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      throw error;
    }
  }

  async initialize() {
    // Get signer
    const [deployer] = await ethers.getSigners();
    this.deployer = deployer;
    
    console.log(`👤 Deployer address: ${deployer.address}`);
    
    // Check balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} ${this.network.includes('bsc') ? 'BNB' : 'ETH'}`);
    
    if (balance < ethers.parseEther('0.1')) {
      throw new Error('Insufficient balance for deployment');
    }
    
    console.log('');
  }

  async deployMutualAidToken() {
    console.log('📄 Deploying MutualAidToken (AZI)...');
    
    const MutualAidToken = await ethers.getContractFactory('MutualAidToken');
    const token = await MutualAidToken.deploy(this.deployer.address);
    await token.waitForDeployment();
    
    const tokenAddress = await token.getAddress();
    console.log(`✅ MutualAidToken deployed at: ${tokenAddress}`);
    
    this.deployedContracts.MutualAidToken = {
      address: tokenAddress,
      contract: token
    };
    
    this.deploymentLog.push({
      contract: 'MutualAidToken',
      address: tokenAddress,
      txHash: token.deploymentTransaction()?.hash
    });
    
    // Verify deployment
    const name = await token.name();
    const symbol = await token.symbol();
    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    console.log('');
  }

  async deployGuandiNFT() {
    console.log('🎨 Deploying GuandiNFT...');
    
    const GuandiNFT = await ethers.getContractFactory('GuandiNFT');
    const nft = await GuandiNFT.deploy(this.deployer.address);
    await nft.waitForDeployment();
    
    const nftAddress = await nft.getAddress();
    console.log(`✅ GuandiNFT deployed at: ${nftAddress}`);
    
    this.deployedContracts.GuandiNFT = {
      address: nftAddress,
      contract: nft
    };
    
    this.deploymentLog.push({
      contract: 'GuandiNFT',
      address: nftAddress,
      txHash: nft.deploymentTransaction()?.hash
    });
    
    // Verify deployment
    const name = await nft.name();
    const symbol = await nft.symbol();
    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    console.log('');
  }

  async deployTimelockController() {
    console.log('⏱️  Deploying TimelockController...');
    
    const TimelockController = await ethers.getContractFactory('TimelockController');
    const timelock = await TimelockController.deploy(
      DEPLOYMENT_PARAMS.TIMELOCK_MIN_DELAY,
      [this.deployer.address], // proposers
      [this.deployer.address], // executors
      this.deployer.address // admin
    );
    await timelock.waitForDeployment();
    
    const timelockAddress = await timelock.getAddress();
    console.log(`✅ TimelockController deployed at: ${timelockAddress}`);
    
    this.deployedContracts.TimelockController = {
      address: timelockAddress,
      contract: timelock
    };
    
    this.deploymentLog.push({
      contract: 'TimelockController',
      address: timelockAddress,
      txHash: timelock.deploymentTransaction()?.hash
    });
    
    console.log(`   Min delay: ${DEPLOYMENT_PARAMS.TIMELOCK_MIN_DELAY} seconds`);
    console.log('');
  }

  async deployGovernance() {
    console.log('🗳️  Deploying MutualAidGovernance...');
    
    const MutualAidGovernance = await ethers.getContractFactory('MutualAidGovernance');
    
    // Create a mock voting token for governance (in production, this might be the AZI token)
    const VotesToken = await ethers.getContractFactory('ERC20Votes');
    const votesToken = await VotesToken.deploy();
    await votesToken.waitForDeployment();
    
    const governance = await MutualAidGovernance.deploy(
      this.deployedContracts.GuandiNFT.address,
      await votesToken.getAddress(),
      this.deployedContracts.TimelockController.address
    );
    await governance.waitForDeployment();
    
    const governanceAddress = await governance.getAddress();
    console.log(`✅ MutualAidGovernance deployed at: ${governanceAddress}`);
    
    this.deployedContracts.MutualAidGovernance = {
      address: governanceAddress,
      contract: governance
    };
    
    this.deployedContracts.VotesToken = {
      address: await votesToken.getAddress(),
      contract: votesToken
    };
    
    this.deploymentLog.push({
      contract: 'MutualAidGovernance',
      address: governanceAddress,
      txHash: governance.deploymentTransaction()?.hash
    });
    
    console.log(`   Voting delay: ${DEPLOYMENT_PARAMS.VOTING_DELAY} seconds`);
    console.log(`   Voting period: ${DEPLOYMENT_PARAMS.VOTING_PERIOD} seconds`);
    console.log('');
  }

  async setupRoles() {
    console.log('🔐 Setting up roles and permissions...');
    
    const token = this.deployedContracts.MutualAidToken.contract;
    const nft = this.deployedContracts.GuandiNFT.contract;
    const governance = this.deployedContracts.MutualAidGovernance.contract;
    
    // Grant NFT minter role to token contract (for automatic NFT minting)
    const MINTER_ROLE = await nft.MINTER_ROLE();
    await nft.grantRole(MINTER_ROLE, await token.getAddress());
    console.log('✅ Granted MINTER_ROLE to MutualAidToken');
    
    // Grant distributor role to governance contract
    const DISTRIBUTOR_ROLE = await token.DISTRIBUTOR_ROLE();
    await token.grantRole(DISTRIBUTOR_ROLE, await governance.getAddress());
    console.log('✅ Granted DISTRIBUTOR_ROLE to MutualAidGovernance');
    
    // Setup governance roles
    const PROPOSER_ROLE = await governance.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await governance.EXECUTOR_ROLE();
    
    // Grant proposer role to community (anyone can propose with sufficient stake)
    await governance.grantRole(PROPOSER_ROLE, ethers.ZeroAddress);
    console.log('✅ Granted PROPOSER_ROLE to public');
    
    // Grant executor role to timelock
    await governance.grantRole(EXECUTOR_ROLE, this.deployedContracts.TimelockController.address);
    console.log('✅ Granted EXECUTOR_ROLE to TimelockController');
    
    console.log('');
  }

  async saveDeploymentInfo() {
    const deploymentInfo = {
      network: this.network,
      chainId: this.config.chainId,
      deployedAt: new Date().toISOString(),
      deployer: this.deployer.address,
      contracts: {},
      transactions: this.deploymentLog,
      config: DEPLOYMENT_PARAMS
    };

    // Add contract addresses and ABIs
    for (const [name, info] of Object.entries(this.deployedContracts)) {
      deploymentInfo.contracts[name] = {
        address: info.address,
        // In a full implementation, we'd also save the ABI here
      };
    }

    // Save to JSON file
    const filename = `deployment-${this.network}-${Date.now()}.json`;
    const filepath = path.join(__dirname, '..', 'deployments', filename);
    
    // Create deployments directory if it doesn't exist
    const deploymentDir = path.dirname(filepath);
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${filepath}`);
    
    // Also save a latest.json for easy access
    const latestPath = path.join(deploymentDir, `latest-${this.network}.json`);
    fs.writeFileSync(latestPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Latest deployment info saved to: ${latestPath}`);
    
    console.log('');
  }

  printSummary() {
    console.log('📋 DEPLOYMENT SUMMARY');
    console.log('=' .repeat(50));
    console.log(`Network: ${this.config.name} (Chain ID: ${this.config.chainId})`);
    console.log(`Deployer: ${this.deployer.address}`);
    console.log('');
    
    console.log('📄 Deployed Contracts:');
    for (const [name, info] of Object.entries(this.deployedContracts)) {
      console.log(`   ${name}: ${info.address}`);
    }
    
    console.log('');
    console.log('🔗 Next Steps:');
    console.log('1. Verify contracts on block explorer');
    console.log('2. Update frontend configuration with new addresses');
    console.log('3. Run integration tests');
    console.log('4. Configure API endpoints with contract addresses');
    console.log('');
    
    if (this.config.explorer) {
      console.log('🔍 Block Explorer Links:');
      for (const [name, info] of Object.entries(this.deployedContracts)) {
        console.log(`   ${name}: ${this.config.explorer}/address/${info.address}`);
      }
    }
  }
}

// Contract verification helper
async function verifyContract(address, constructorArgs = []) {
  try {
    console.log(`🔍 Verifying contract at ${address}...`);
    
    await hre.run('verify:verify', {
      address: address,
      constructorArguments: constructorArgs,
    });
    
    console.log(`✅ Contract verified successfully`);
  } catch (error) {
    console.error(`❌ Verification failed: ${error.message}`);
  }
}

// Main deployment function
async function main() {
  const network = process.argv[2] || 'bsc_testnet';
  const shouldVerify = process.argv.includes('--verify');

  if (!DEPLOY_CONFIG[network]) {
    console.error(`❌ Unknown network: ${network}`);
    console.log('Available networks:', Object.keys(DEPLOY_CONFIG).join(', '));
    process.exit(1);
  }

  const deployer = new ContractDeployer(network);
  await deployer.deploy();

  // Optional contract verification
  if (shouldVerify) {
    console.log('🔍 Starting contract verification...');
    
    for (const [name, info] of Object.entries(deployer.deployedContracts)) {
      if (name === 'VotesToken') continue; // Skip utility contracts
      
      let constructorArgs = [];
      if (name === 'MutualAidToken' || name === 'GuandiNFT') {
        constructorArgs = [deployer.deployer.address];
      } else if (name === 'TimelockController') {
        constructorArgs = [
          DEPLOYMENT_PARAMS.TIMELOCK_MIN_DELAY,
          [deployer.deployer.address],
          [deployer.deployer.address],
          deployer.deployer.address
        ];
      } else if (name === 'MutualAidGovernance') {
        constructorArgs = [
          deployer.deployedContracts.GuandiNFT.address,
          deployer.deployedContracts.VotesToken.address,
          deployer.deployedContracts.TimelockController.address
        ];
      }
      
      await verifyContract(info.address, constructorArgs);
      
      // Wait between verifications to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('🎉 All done! Welcome to the AstroZi Mutual Aid ecosystem!');
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { ContractDeployer, DEPLOYMENT_PARAMS, DEPLOY_CONFIG };