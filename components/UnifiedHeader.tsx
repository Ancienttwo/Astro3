"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Menu } from 'lucide-react';
import { useJapaneseTranslation } from '@/hooks/useJapaneseTranslation';

interface UnifiedHeaderProps {
  title: string;
  showBackButton?: boolean;
  onMenuClick?: () => void;
}

export default function UnifiedHeader({ 
  title, 
  showBackButton = true, 
  onMenuClick 
}: UnifiedHeaderProps) {
  const router = useRouter();
  const { jt, isJapanese } = useJapaneseTranslation();

  const handleLeftClick = () => {
    if (showBackButton) {
      router.back();
    } else {
      router.push('/home');
    }
  };

  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
    }
  };

  return (
    <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-gray-100 relative">
      {/* 左侧 - Logo/返回按钮 */}
      <button 
        onClick={handleLeftClick}
        className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {showBackButton ? (
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        ) : (
          <Home className="w-5 h-5 text-gray-700" />
        )}
      </button>
      
      {/* 中间 - 标题 */}
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      
      {/* 右侧 - Menu按钮 */}
      <button
        onClick={handleMenuClick}
        className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
} 