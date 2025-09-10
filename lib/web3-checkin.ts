// Web3智能合约签到交互库
import { ethers } from 'ethers';

// 合约配置
export const CHECKIN_CONTRACT_CONFIG = {
  // BSC主网合约地址 (已部署)
  contractAddress: process.env.NEXT_PUBLIC_CHECKIN_CONTRACT_ADDRESS || '0x3b016F5A7C462Fe51B691Ef18559DE720D9B452F',
  // 签到价格 (0.0002 BNB)
  checkinPrice: '0.0002', // BNB (18位小数)
  // 网络配置
  chainId: 56, // BSC主网
  rpcUrl: 'https://bsc-dataseed1.binance.org/',
  // 区块链浏览器
  explorerUrl: 'https://bscscan.com',
};

// 合约ABI (更新为实际合约方法)
export const CHECKIN_CONTRACT_ABI = [
  // 查询方法
  'function canCheckin(address user) external view returns (bool)',
  'function getUserStats(address user) external view returns (uint256 totalPoints, uint256 consecutiveDays, uint256 lastCheckinDate, uint256 airdropWeight, uint256 totalBNBSpent, uint256 totalCheckins, bool isActive)',
  'function previewCheckinRewards(address user) external view returns (uint256 pointsEarned, uint256 airdropWeightEarned, uint256 consecutiveDays)',
  'function calculatePoints(uint256 consecutiveDays) public view returns (uint256)',
  'function calculateAirdropWeight(uint256 consecutiveDays) public view returns (uint256)',
  'function getCurrentDay() public view returns (uint256)',
  'function checkinCost() public view returns (uint256)',
  'function getContractInfo() external view returns (uint256 _checkinCost, uint256 _totalUsers, uint256 _totalCheckins, uint256 _totalRevenue, uint256 _contractBalance)',
  
  // 交易方法
  'function performCheckin() external payable',
  
  // 事件
  'event CheckinCompleted(address indexed user, uint256 pointsEarned, uint256 consecutiveDays, uint256 airdropWeightEarned, uint256 bnbPaid, uint256 timestamp)',
];

export interface UserCheckinData {
  lastCheckinDate: string;
  consecutiveDays: number;
  totalDays: number;
  totalCredits: number;
  totalAiReports: number;
  totalSpent: string;
}

export interface CheckinRewards {
  nextCredits: number;
  nextAiReports: number;
  nextConsecutiveDays: number;
}

export interface CheckinResult {
  success: boolean;
  txHash?: string;
  error?: string;
  gasUsed?: string;
  creditsEarned?: number;
  aiReportsEarned?: number;
}

export class Web3CheckinService {
  private provider: ethers.BrowserProvider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        await this.provider.send('eth_requestAccounts', []);
        this.signer = await this.provider.getSigner();
        
        if (CHECKIN_CONTRACT_CONFIG.contractAddress) {
          this.contract = new ethers.Contract(
            CHECKIN_CONTRACT_CONFIG.contractAddress,
            CHECKIN_CONTRACT_ABI,
            this.signer
          );
        }
      } catch (error) {
        console.error('Failed to initialize Web3 provider:', error);
      }
    }
  }

  /**
   * 检查用户今天是否可以签到
   */
  async canCheckinToday(userAddress: string): Promise<boolean> {
    try {
      if (!this.contract) await this.initializeProvider();
      return await this.contract!.canCheckinToday(userAddress);
    } catch (error) {
      console.error('Error checking checkin status:', error);
      return false;
    }
  }

  /**
   * 获取用户签到数据
   */
  async getUserCheckinData(userAddress: string): Promise<UserCheckinData | null> {
    try {
      if (!this.contract) await this.initializeProvider();
      
      const data = await this.contract!.getUserCheckinData(userAddress);
      return {
        lastCheckinDate: data.lastCheckinDate.toString(),
        consecutiveDays: Number(data.consecutiveDays),
        totalDays: Number(data.totalDays),
        totalCredits: Number(data.totalCredits),
        totalAiReports: Number(data.totalAiReports),
        totalSpent: ethers.formatEther(data.totalSpent), // BNB has 18 decimals
      };
    } catch (error) {
      console.error('Error fetching user checkin data:', error);
      return null;
    }
  }

  /**
   * 预览签到奖励
   */
  async previewCheckinRewards(userAddress: string): Promise<CheckinRewards | null> {
    try {
      if (!this.contract) await this.initializeProvider();
      
      const [nextCredits, nextAiReports, nextConsecutiveDays] = 
        await this.contract!.previewCheckinRewards(userAddress);
      
      return {
        nextCredits: Number(nextCredits),
        nextAiReports: Number(nextAiReports),
        nextConsecutiveDays: Number(nextConsecutiveDays),
      };
    } catch (error) {
      console.error('Error previewing checkin rewards:', error);
      return null;
    }
  }

  /**
   * 检查用户BNB余额
   */
  async getBNBBalance(userAddress: string): Promise<string> {
    try {
      if (!this.provider) await this.initializeProvider();
      
      const balance = await this.provider!.getBalance(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error fetching BNB balance:', error);
      return '0';
    }
  }

  /**
   * 获取当前签到价格
   */
  async getCurrentCheckinPrice(): Promise<string> {
    try {
      if (!this.contract) await this.initializeProvider();
      
      const price = await this.contract!.checkinPrice();
      return ethers.formatEther(price);
    } catch (error) {
      console.error('Error fetching checkin price:', error);
      return CHECKIN_CONTRACT_CONFIG.checkinPrice;
    }
  }

  /**
   * 执行签到
   */
  async performCheckin(): Promise<CheckinResult> {
    try {
      if (!this.contract || !this.signer) await this.initializeProvider();
      
      const userAddress = await this.signer!.getAddress();
      
      // 获取当前签到价格
      const checkinPriceStr = await this.getCurrentCheckinPrice();
      const checkinPriceWei = ethers.parseEther(checkinPriceStr);
      
      // 检查BNB余额
      const balance = await this.getBNBBalance(userAddress);
      if (parseFloat(balance) < parseFloat(checkinPriceStr)) {
        return {
          success: false,
          error: `Insufficient BNB balance. Need at least ${checkinPriceStr} BNB.`,
        };
      }

      // 执行签到 (发送BNB)
      const tx = await this.contract!.dailyCheckin({
        value: checkinPriceWei
      });
      const receipt = await tx.wait();
      
      // 解析事件获取奖励信息
      const events = receipt.logs?.filter((log: any) => {
        try {
          return this.contract!.interface.parseLog(log)?.name === 'CheckinCompleted';
        } catch {
          return false;
        }
      });
      
      let creditsEarned = 0;
      let aiReportsEarned = 0;
      
      if (events && events.length > 0) {
        const parsedEvent = this.contract!.interface.parseLog(events[0]);
        creditsEarned = Number(parsedEvent?.args?.creditsEarned || 0);
        aiReportsEarned = Number(parsedEvent?.args?.aiReportsEarned || 0);
      }
      
      // 同步到后端数据库
      try {
        await this.syncCheckinToBackend({
          userAddress,
          txHash: receipt.hash,
          consecutiveDays: creditsEarned ? Math.floor(creditsEarned / 10) : 1, // 反推连续天数
          creditsEarned,
          aiReportsEarned,
          amountPaid: checkinPriceStr,
          blockNumber: receipt.blockNumber?.toString(),
          timestamp: Date.now()
        });
      } catch (syncError) {
        console.warn('Failed to sync checkin to backend:', syncError);
        // 即使后端同步失败，仍然返回成功，因为链上交易已经成功
      }
      
      return {
        success: true,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed?.toString(),
        creditsEarned,
        aiReportsEarned,
      };
    } catch (error: any) {
      console.error('Error performing checkin:', error);
      return {
        success: false,
        error: error.message || 'Checkin failed',
      };
    }
  }

  /**
   * 同步签到数据到后端数据库
   */
  private async syncCheckinToBackend(data: {
    userAddress: string;
    txHash: string;
    consecutiveDays: number;
    creditsEarned: number;
    aiReportsEarned: number;
    amountPaid: string;
    blockNumber?: string;
    timestamp: number;
  }): Promise<void> {
    try {
      // 获取Web3用户信息
      const web3User = this.getCurrentWeb3User();
      if (!web3User) {
        throw new Error('No Web3 user found');
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Web3-User': btoa(encodeURIComponent(JSON.stringify(web3User)))
      };

      const response = await fetch('/api/web3-checkin', {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync to backend');
      }
    } catch (error) {
      console.error('Backend sync error:', error);
      throw error;
    }
  }

  /**
   * 从后端获取用户签到数据
   */
  async getBackendCheckinData(userAddress: string): Promise<UserCheckinData | null> {
    try {
      const web3User = this.getCurrentWeb3User();
      if (!web3User) {
        return null;
      }

      const headers: Record<string, string> = {
        'X-Web3-User': btoa(encodeURIComponent(JSON.stringify(web3User)))
      };

      const response = await fetch(`/api/web3-checkin?userAddress=${userAddress}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch backend data');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return {
          lastCheckinDate: result.data.lastCheckinDate || '0',
          consecutiveDays: result.data.consecutiveDays || 0,
          totalDays: result.data.totalDays || 0,
          totalCredits: result.data.totalCredits || 0,
          totalAiReports: result.data.totalAiReports || 0,
          totalSpent: result.data.totalSpent || '0'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching backend checkin data:', error);
      return null;
    }
  }

  /**
   * 获取当前Web3用户信息
   */
  private getCurrentWeb3User() {
    try {
      if (typeof window !== 'undefined') {
        const web3UserData = localStorage.getItem('web3_user');
        if (web3UserData) {
          return JSON.parse(web3UserData);
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting Web3 user:', error);
      return null;
    }
  }

  /**
   * 检查是否连接到正确的网络
   */
  async checkNetwork(): Promise<boolean> {
    try {
      if (!this.provider) await this.initializeProvider();
      
      const network = await this.provider!.getNetwork();
      return Number(network.chainId) === CHECKIN_CONTRACT_CONFIG.chainId;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }

  /**
   * 切换到BSC网络
   */
  async switchToBSC(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        return false;
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // BSC主网
      });
      
      return true;
    } catch (error: any) {
      // 如果网络不存在，尝试添加
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x38',
              chainName: 'BNB Smart Chain',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18,
              },
              rpcUrls: ['https://bsc-dataseed1.binance.org/'],
              blockExplorerUrls: ['https://bscscan.com/'],
            }],
          });
          return true;
        } catch (addError) {
          console.error('Error adding BSC network:', addError);
          return false;
        }
      }
      console.error('Error switching to BSC:', error);
      return false;
    }
  }
}

// 单例实例
export const web3CheckinService = new Web3CheckinService();