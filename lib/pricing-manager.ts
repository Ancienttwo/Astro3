// 定价和收入分配管理

export interface PricingConfig {
  checkinPriceBNB: string;     // BNB价格
  checkinPriceUSD: string;     // USD等值
  bnbPriceUSD: number;         // BNB/USD汇率
  platformFeePercent: number;  // 平台费用百分比
  gasReservePercent: number;   // Gas储备百分比
  lastUpdated: number;         // 最后更新时间戳
}

export interface RevenueStats {
  totalRevenueBNB: string;     // 总收入 BNB
  totalRevenueUSD: string;     // 总收入 USD
  platformFeeBNB: string;      // 平台费用 BNB
  gasReserveBNB: string;       // Gas储备 BNB
  totalCheckins: number;       // 总签到次数
  uniqueUsers: number;         // 独立用户数
  avgCheckinPerUser: number;   // 每用户平均签到次数
}

export class PricingManager {
  private static readonly STORAGE_KEY = 'astrozi_pricing_config';
  private static readonly DEFAULT_CONFIG: PricingConfig = {
    checkinPriceBNB: '0.0002',
    checkinPriceUSD: '0.10',
    bnbPriceUSD: 500,
    platformFeePercent: 70,
    gasReservePercent: 30,
    lastUpdated: Date.now()
  };

  /**
   * 获取当前定价配置
   */
  static getCurrentPricing(): PricingConfig {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const config = JSON.parse(stored);
          // 验证配置完整性
          if (this.validateConfig(config)) {
            return config;
          }
        }
      }
    } catch (error) {
      console.error('Error loading pricing config:', error);
    }
    
    return { ...this.DEFAULT_CONFIG };
  }

  /**
   * 更新定价配置
   */
  static updatePricing(newConfig: Partial<PricingConfig>): PricingConfig {
    const currentConfig = this.getCurrentPricing();
    const updatedConfig: PricingConfig = {
      ...currentConfig,
      ...newConfig,
      lastUpdated: Date.now()
    };

    // 验证新配置
    if (!this.validateConfig(updatedConfig)) {
      throw new Error('Invalid pricing configuration');
    }

    // 自动计算相关价格
    if (newConfig.bnbPriceUSD || newConfig.checkinPriceUSD) {
      updatedConfig.checkinPriceBNB = this.calculateBNBPrice(
        parseFloat(updatedConfig.checkinPriceUSD),
        updatedConfig.bnbPriceUSD
      ).toString();
    }

    if (newConfig.bnbPriceUSD || newConfig.checkinPriceBNB) {
      updatedConfig.checkinPriceUSD = this.calculateUSDPrice(
        parseFloat(updatedConfig.checkinPriceBNB),
        updatedConfig.bnbPriceUSD
      ).toString();
    }

    // 保存配置
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedConfig));
      }
    } catch (error) {
      console.error('Error saving pricing config:', error);
    }

    return updatedConfig;
  }

  /**
   * 根据BNB价格计算签到费用
   */
  static calculateBNBPrice(usdPrice: number, bnbPriceUSD: number): number {
    return Number((usdPrice / bnbPriceUSD).toFixed(6));
  }

  /**
   * 根据BNB数量计算USD价值
   */
  static calculateUSDPrice(bnbAmount: number, bnbPriceUSD: number): number {
    return Number((bnbAmount * bnbPriceUSD).toFixed(4));
  }

  /**
   * 计算收入分配
   */
  static calculateRevenueDistribution(totalAmount: string, config?: PricingConfig): {
    platformFee: string;
    gasReserve: string;
    platformFeeUSD: string;
    gasReserveUSD: string;
  } {
    const pricing = config || this.getCurrentPricing();
    const total = parseFloat(totalAmount);
    
    const platformFee = (total * pricing.platformFeePercent / 100).toString();
    const gasReserve = (total * pricing.gasReservePercent / 100).toString();
    
    const platformFeeUSD = this.calculateUSDPrice(parseFloat(platformFee), pricing.bnbPriceUSD).toString();
    const gasReserveUSD = this.calculateUSDPrice(parseFloat(gasReserve), pricing.bnbPriceUSD).toString();
    
    return {
      platformFee,
      gasReserve,
      platformFeeUSD,
      gasReserveUSD
    };
  }

  /**
   * 验证配置有效性
   */
  private static validateConfig(config: any): config is PricingConfig {
    return (
      config &&
      typeof config.checkinPriceBNB === 'string' &&
      typeof config.checkinPriceUSD === 'string' &&
      typeof config.bnbPriceUSD === 'number' &&
      typeof config.platformFeePercent === 'number' &&
      typeof config.gasReservePercent === 'number' &&
      typeof config.lastUpdated === 'number' &&
      config.platformFeePercent + config.gasReservePercent === 100 &&
      config.platformFeePercent >= 0 &&
      config.gasReservePercent >= 0 &&
      config.bnbPriceUSD > 0 &&
      parseFloat(config.checkinPriceBNB) > 0 &&
      parseFloat(config.checkinPriceUSD) > 0
    );
  }

  /**
   * 从外部API获取BNB价格
   */
  static async fetchBNBPrice(): Promise<number> {
    try {
      // 尝试多个价格源
      const apis = [
        'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd',
        'https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT'
      ];
      
      for (const api of apis) {
        try {
          const response = await fetch(api);
          if (!response.ok) continue;
          
          const data = await response.json();
          
          if (api.includes('coingecko')) {
            return data.binancecoin?.usd || 0;
          } else if (api.includes('binance')) {
            return parseFloat(data.price) || 0;
          }
        } catch (error) {
          console.warn(`Failed to fetch from ${api}:`, error);
          continue;
        }
      }
      
      throw new Error('All price APIs failed');
    } catch (error) {
      console.error('Error fetching BNB price:', error);
      // 返回默认价格
      return 500;
    }
  }

  /**
   * 自动更新BNB价格
   */
  static async updateBNBPrice(): Promise<PricingConfig> {
    try {
      const newPrice = await this.fetchBNBPrice();
      return this.updatePricing({ bnbPriceUSD: newPrice });
    } catch (error) {
      console.error('Error updating BNB price:', error);
      throw error;
    }
  }

  /**
   * 获取价格更新建议
   */
  static getPriceUpdateSuggestion(currentPrice: number, marketPrice: number): {
    shouldUpdate: boolean;
    reason: string;
    suggestedBNBPrice: string;
    suggestedUSDPrice: string;
  } {
    const currentConfig = this.getCurrentPricing();
    const priceDifference = Math.abs(currentPrice - marketPrice) / currentPrice;
    const threshold = 0.05; // 5% 差异阈值
    
    const shouldUpdate = priceDifference > threshold;
    
    let reason = '';
    if (shouldUpdate) {
      const direction = marketPrice > currentPrice ? '上涨' : '下跌';
      const percentage = (priceDifference * 100).toFixed(1);
      reason = `BNB价格${direction}${percentage}%，建议更新定价`;
    } else {
      reason = '价格变动在可接受范围内';
    }

    const suggestedBNBPrice = this.calculateBNBPrice(
      parseFloat(currentConfig.checkinPriceUSD),
      marketPrice
    ).toString();
    
    return {
      shouldUpdate,
      reason,
      suggestedBNBPrice,
      suggestedUSDPrice: currentConfig.checkinPriceUSD
    };
  }

  /**
   * 重置为默认配置
   */
  static resetToDefault(): PricingConfig {
    const defaultConfig = { ...this.DEFAULT_CONFIG, lastUpdated: Date.now() };
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultConfig));
      }
    } catch (error) {
      console.error('Error resetting pricing config:', error);
    }
    
    return defaultConfig;
  }
}

// 价格监控类
export class PriceMonitor {
  private static instance: PriceMonitor;
  private intervalId: NodeJS.Timeout | null = null;
  private callbacks: Array<(config: PricingConfig) => void> = [];

  static getInstance(): PriceMonitor {
    if (!this.instance) {
      this.instance = new PriceMonitor();
    }
    return this.instance;
  }

  /**
   * 开始价格监控
   */
  startMonitoring(intervalMinutes: number = 30): void {
    if (this.intervalId) {
      this.stopMonitoring();
    }

    this.intervalId = setInterval(async () => {
      try {
        const marketPrice = await PricingManager.fetchBNBPrice();
        const currentConfig = PricingManager.getCurrentPricing();
        const suggestion = PricingManager.getPriceUpdateSuggestion(
          currentConfig.bnbPriceUSD,
          marketPrice
        );

        if (suggestion.shouldUpdate) {
          console.log('Price update suggested:', suggestion.reason);
          // 通知回调函数
          this.callbacks.forEach(callback => {
            try {
              callback(currentConfig);
            } catch (error) {
              console.error('Error in price monitor callback:', error);
            }
          });
        }
      } catch (error) {
        console.error('Error in price monitoring:', error);
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`Price monitoring started, checking every ${intervalMinutes} minutes`);
  }

  /**
   * 停止价格监控
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Price monitoring stopped');
    }
  }

  /**
   * 添加价格变化回调
   */
  onPriceChange(callback: (config: PricingConfig) => void): void {
    this.callbacks.push(callback);
  }

  /**
   * 移除价格变化回调
   */
  removeCallback(callback: (config: PricingConfig) => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }
}