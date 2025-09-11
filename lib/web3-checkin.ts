// Web3智能合约签到交互库（Viem / Wagmi 版本）
import { createWalletClient, createPublicClient, custom, http, parseEther, formatEther, decodeEventLog } from 'viem';
import { bsc } from 'viem/chains';

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
  
  // 交易方法（兼容两种命名）
  'function performCheckin() external payable',
  'function dailyCheckin() external payable',
  
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
  private walletClient: ReturnType<typeof createWalletClient> | null = null;
  private publicClient: ReturnType<typeof createPublicClient> | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    try {
      const eth = (window as any).ethereum;
      this.walletClient = createWalletClient({
        chain: bsc,
        transport: custom(eth),
      });
      this.publicClient = createPublicClient({
        chain: bsc,
        transport: custom(eth),
      });
      // request accounts to ensure permission
      await eth.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      console.error('Failed to initialize Web3 client:', error);
    }
  }

  /**
   * 检查用户今天是否可以签到
   */
  async canCheckinToday(userAddress: string): Promise<boolean> {
    try {
      if (!this.publicClient) await this.initializeProvider();
      const address = CHECKIN_CONTRACT_CONFIG.contractAddress as `0x${string}`;
      // 优先尝试 canCheckin，再回退 canCheckinToday
      try {
        const r = await this.publicClient!.readContract({
          address,
          abi: CHECKIN_CONTRACT_ABI as any,
          functionName: 'canCheckin',
          args: [userAddress as `0x${string}`],
        });
        return Boolean(r);
      } catch {
        const r2 = await this.publicClient!.readContract({
          address,
          abi: CHECKIN_CONTRACT_ABI as any,
          functionName: 'canCheckinToday',
          args: [userAddress as `0x${string}`],
        });
        return Boolean(r2);
      }
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
      if (!this.publicClient) await this.initializeProvider();
      const address = CHECKIN_CONTRACT_CONFIG.contractAddress as `0x${string}`;
      // 优先兼容 getUserStats
      const res = await this.publicClient!.readContract({
        address,
        abi: CHECKIN_CONTRACT_ABI as any,
        functionName: 'getUserStats',
        args: [userAddress as `0x${string}`],
      }) as any;
      // 约定返回: (totalPoints, consecutiveDays, lastCheckinDate, airdropWeight, totalBNBSpent, totalCheckins, isActive)
      return {
        lastCheckinDate: (res?.[2] ?? 0).toString(),
        consecutiveDays: Number(res?.[1] ?? 0),
        totalDays: Number(res?.[5] ?? 0),
        totalCredits: Number(res?.[0] ?? 0),
        totalAiReports: 0,
        totalSpent: formatEther(res?.[4] ?? 0n),
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
      if (!this.publicClient) await this.initializeProvider();
      const address = CHECKIN_CONTRACT_CONFIG.contractAddress as `0x${string}`;
      const [pointsEarned, airdropWeightEarned, consecutiveDays] = await this.publicClient!.readContract({
        address,
        abi: CHECKIN_CONTRACT_ABI as any,
        functionName: 'previewCheckinRewards',
        args: [userAddress as `0x${string}`],
      }) as any[];
      
      return {
        nextCredits: Number(pointsEarned ?? 0),
        nextAiReports: Number(airdropWeightEarned ?? 0),
        nextConsecutiveDays: Number(consecutiveDays ?? 0),
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
      if (!this.publicClient) await this.initializeProvider();
      const balance = await this.publicClient!.getBalance({ address: userAddress as `0x${string}` });
      return formatEther(balance);
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
      if (!this.publicClient) await this.initializeProvider();
      const address = CHECKIN_CONTRACT_CONFIG.contractAddress as `0x${string}`;
      try {
        const price = await this.publicClient!.readContract({
          address,
          abi: CHECKIN_CONTRACT_ABI as any,
          functionName: 'checkinPrice',
        }) as bigint;
        return formatEther(price);
      } catch {
        const price2 = await this.publicClient!.readContract({
          address,
          abi: CHECKIN_CONTRACT_ABI as any,
          functionName: 'checkinCost',
        }) as bigint;
        return formatEther(price2);
      }
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
      if (!this.walletClient || !this.publicClient) await this.initializeProvider();
      const [userAddress] = await this.walletClient!.getAddresses();
      
      // 获取当前签到价格
      const checkinPriceStr = await this.getCurrentCheckinPrice();
      const checkinPriceWei = parseEther(checkinPriceStr);
      
      // 检查BNB余额
      const balance = await this.getBNBBalance(userAddress);
      if (parseFloat(balance) < parseFloat(checkinPriceStr)) {
        return {
          success: false,
          error: `Insufficient BNB balance. Need at least ${checkinPriceStr} BNB.`,
        };
      }

      // 执行签到 (发送BNB) - 优先performCheckin，再回退dailyCheckin
      let hash: `0x${string}`;
      const address = CHECKIN_CONTRACT_CONFIG.contractAddress as `0x${string}`;
      try {
        hash = await this.walletClient!.writeContract({
          address,
          abi: CHECKIN_CONTRACT_ABI as any,
          functionName: 'performCheckin',
          value: checkinPriceWei,
        });
      } catch {
        hash = await this.walletClient!.writeContract({
          address,
          abi: CHECKIN_CONTRACT_ABI as any,
          functionName: 'dailyCheckin',
          value: checkinPriceWei,
        });
      }
      const receipt = await this.publicClient!.waitForTransactionReceipt({ hash });
      
      // 解析事件获取奖励信息
      let creditsEarned = 0;
      let aiReportsEarned = 0;
      try {
        const log = receipt.logs?.[0];
        if (log) {
          const parsed = decodeEventLog({ abi: CHECKIN_CONTRACT_ABI as any, data: log.data, topics: log.topics });
          if ((parsed as any)?.eventName === 'CheckinCompleted') {
            const args: any = (parsed as any).args;
            creditsEarned = Number(args?.pointsEarned ?? args?.creditsEarned ?? 0);
            aiReportsEarned = Number(args?.airdropWeightEarned ?? args?.aiReportsEarned ?? 0);
          }
        }
      } catch {}
      
      // 同步到后端数据库
      try {
        await this.syncCheckinToBackend({
          userAddress,
          txHash: receipt.transactionHash,
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
        txHash: receipt.transactionHash,
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

      const response = await fetch('/api/points/web3', {
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

      const response = await fetch(`/api/points/web3?userAddress=${userAddress}`, {
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
      if (!this.publicClient) await this.initializeProvider();
      const chainId = await this.publicClient!.getChainId();
      return Number(chainId) === CHECKIN_CONTRACT_CONFIG.chainId;
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

      const eth: any = (window as any).ethereum;
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // BSC主网
      });
      
      return true;
    } catch (error: any) {
      // 如果网络不存在，尝试添加
      if (error.code === 4902) {
        try {
          const eth2: any = (window as any).ethereum;
          await eth2.request({
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
