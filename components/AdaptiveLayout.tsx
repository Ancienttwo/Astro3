"use client";

import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/useDeviceType';
import AnalysisLayout from './AnalysisLayout';
import MobileNavigation from './MobileNavigation';
import ZoomableLayout from './ZoomableLayout';

interface AdaptiveLayoutProps {
  children: ReactNode;
  hideBottomNav?: boolean;
  enableZoom?: boolean;
}

export default function AdaptiveLayout({ children, hideBottomNav = false, enableZoom = true }: AdaptiveLayoutProps) {
  const isMobile = useIsMobile();

  // 在移动端使用 MobileNavigation，桌面端使用 AnalysisLayout
  if (isMobile) {
    return <MobileNavigation hideBottomNav={hideBottomNav}>{children}</MobileNavigation>;
  }

  // 桌面端：根据enableZoom决定是否启用缩放功能
  if (enableZoom) {
    return (
      <ZoomableLayout 
        showZoomControl={true}
        zoomControlPosition="bottom-right"
        enableKeyboardShortcuts={true}
        onlyDesktop={true}
      >
        <AnalysisLayout>{children}</AnalysisLayout>
      </ZoomableLayout>
    );
  }

  return <AnalysisLayout>{children}</AnalysisLayout>;
} 