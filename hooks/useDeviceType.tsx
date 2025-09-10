"use client";

import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    
    const checkDeviceType = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    // 初始检测
    checkDeviceType();

    // 添加窗口大小变化监听器
    window.addEventListener('resize', checkDeviceType);

    // 清理监听器
    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  // 在hydration完成前返回desktop，避免服务端客户端不匹配
  return isHydrated ? deviceType : 'desktop';
}

// 检测是否为移动设备
export function useIsMobile(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'mobile';
}

// 检测是否为平板或移动设备
export function useIsMobileOrTablet(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'mobile' || deviceType === 'tablet';
} 