"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PaidFeatures {
  timeAdjustment: boolean;
  premiumAnalysis: boolean;
  unlimitedRecords: boolean;
}

interface PaidUserInfo {
  userID: string;
  birthDate: string;
  gender: 'male' | 'female';
  features: PaidFeatures;
  paidAt: number;
  verified: boolean;
}

interface PaidUserContextType {
  paidStatus: PaidUserInfo | null;
  isPaidUser: boolean;
  hasTimeAdjustment: boolean;
  checkPaidStatus: (birthDate: string, gender: 'male' | 'female') => Promise<boolean>;
  recordPayment: (userInfo: { birthDate: string; gender: 'male' | 'female' }, features: string[]) => Promise<void>;
  clearPaidStatus: () => void;
}

const PaidUserContext = createContext<PaidUserContextType | undefined>(undefined);

export const PaidUserProvider = ({ children }: { children: ReactNode }) => {
  const [paidStatus, setPaidStatus] = useState<PaidUserInfo | null>(null);
  
  // 生成用户唯一ID - 使用安全哈希
  const generateUserID = async (birthDate: string, gender: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${birthDate}:${gender}:astrozi2024:${process.env.NEXT_PUBLIC_SALT || 'default-salt'}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // 检查付费状态 - 添加数据验证
  const checkPaidStatus = async (birthDate: string, gender: 'male' | 'female'): Promise<boolean> => {
    try {
      const userID = await generateUserID(birthDate, gender);
      const storedData = localStorage.getItem('astrozi_paid_users');
      
      if (!storedData) return false;
      
      // 验证存储数据格式
      let paidUsers;
      try {
        paidUsers = JSON.parse(storedData);
        if (typeof paidUsers !== 'object' || paidUsers === null) {
          console.warn('无效的付费用户数据格式');
          localStorage.removeItem('astrozi_paid_users');
          return false;
        }
      } catch (parseError) {
        console.warn('付费用户数据解析失败:', parseError);
        localStorage.removeItem('astrozi_paid_users');
        return false;
      }
      
      const userPaidInfo = paidUsers[userID];
      
      if (userPaidInfo && userPaidInfo.verified) {
        // 验证付费信息的完整性
        if (!userPaidInfo.paidAt || typeof userPaidInfo.paidAt !== 'number') {
          console.warn('付费时间戳无效');
          return false;
        }
        
        // 检查付费是否过期（例如1年有效期）
        const oneYear = 365 * 24 * 60 * 60 * 1000;
        if (Date.now() - userPaidInfo.paidAt > oneYear) {
          console.warn('付费已过期');
          return false;
        }
        
        setPaidStatus({
          userID,
          birthDate,
          gender,
          features: userPaidInfo.features || {
            timeAdjustment: false,
            premiumAnalysis: false,
            unlimitedRecords: false
          },
          paidAt: userPaidInfo.paidAt,
          verified: userPaidInfo.verified
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('检查付费状态失败:', error);
      return false;
    }
  };

  // 记录付费信息 - 添加安全验证
  const recordPayment = async (
    userInfo: { birthDate: string; gender: 'male' | 'female' }, 
    features: string[]
  ): Promise<void> => {
    try {
      const userID = await generateUserID(userInfo.birthDate, userInfo.gender);
      const storedData = localStorage.getItem('astrozi_paid_users') || '{}';
      
      let paidUsers;
      try {
        paidUsers = JSON.parse(storedData);
        if (typeof paidUsers !== 'object' || paidUsers === null) {
          paidUsers = {};
        }
      } catch (parseError) {
        console.warn('解析存储数据失败，重置数据:', parseError);
        paidUsers = {};
      }
      
      const featureMap: PaidFeatures = {
        timeAdjustment: features.includes('time-adjustment'),
        premiumAnalysis: features.includes('premium-analysis'),
        unlimitedRecords: features.includes('unlimited-records')
      };
      
      // 注意：这仍然是客户端验证，生产环境应使用服务器端验证
      // TODO: 迁移到服务器端JWT令牌验证
      paidUsers[userID] = {
        features: featureMap,
        paidAt: Date.now(),
        verified: true,
        // 不存储敏感的生日和性别信息
        dataHash: userID.substring(0, 8) // 只存储哈希的前8位作为标识
      };
      
      try {
        localStorage.setItem('astrozi_paid_users', JSON.stringify(paidUsers));
      } catch (storageError) {
        console.error('存储付费信息失败:', storageError);
        throw new Error('无法保存付费信息');
      }
      
      setPaidStatus({
        userID,
        birthDate: userInfo.birthDate,
        gender: userInfo.gender,
        features: featureMap,
        paidAt: Date.now(),
        verified: true
      });
      
      console.log('付费记录已保存:', userID);
    } catch (error) {
      console.error('保存付费记录失败:', error);
    }
  };

  // 清除付费状态
  const clearPaidStatus = () => {
    setPaidStatus(null);
  };

  const isPaidUser = !!paidStatus?.verified;
  const hasTimeAdjustment = !!paidStatus?.features.timeAdjustment;

  return (
    <PaidUserContext.Provider value={{
      paidStatus,
      isPaidUser,
      hasTimeAdjustment,
      checkPaidStatus,
      recordPayment,
      clearPaidStatus
    }}>
      {children}
    </PaidUserContext.Provider>
  );
};

export const usePaidUser = () => {
  const context = useContext(PaidUserContext);
  if (!context) {
    throw new Error('usePaidUser must be used within a PaidUserProvider');
  }
  return context;
}; 