// 多语言选择器组件
// 创建日期: 2025-01-31
// 功能: 语言切换UI组件，支持紧凑和完整两种模式

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { 
  useLanguageStore, 
  getSupportedLanguages, 
  useTranslations,
  type SupportedLanguage 
} from '@/lib/i18n/language-manager';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  /** 紧凑模式：只显示地球图标 */
  compact?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 下拉菜单对齐方式 */
  align?: 'left' | 'right';
  /** 禁用状态 */
  disabled?: boolean;
  /** 语言切换回调 */
  onLanguageChange?: (language: SupportedLanguage) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  className,
  align = 'right',
  disabled = false,
  onLanguageChange
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const { currentLanguage, setLanguage } = useLanguageStore();
  const { t } = useTranslations();
  const supportedLanguages = getSupportedLanguages();
  
  // 获取当前语言配置
  const currentConfig = supportedLanguages.find(lang => lang.code === currentLanguage);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node) &&
          !buttonRef.current?.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  // ESC键关闭下拉菜单
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && showDropdown) {
        setShowDropdown(false);
        buttonRef.current?.focus();
      }
    }

    if (showDropdown) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showDropdown]);

  // 处理语言切换
  const handleLanguageSelect = async (languageCode: SupportedLanguage) => {
    if (languageCode === currentLanguage) {
      setShowDropdown(false);
      return;
    }

    try {
      // 更新语言状态
      setLanguage(languageCode);
      
      // 调用外部回调
      onLanguageChange?.(languageCode);
      
      // 关闭下拉菜单
      setShowDropdown(false);
      
      // 记录语言切换事件（用于分析）
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('languageSwitch', {
          detail: {
            from: currentLanguage,
            to: languageCode,
            timestamp: new Date().toISOString()
          }
        }));
      }
      
    } catch (error) {
      console.error('Language switch failed:', error);
    }
  };

  // 键盘导航支持
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setShowDropdown(!showDropdown);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!showDropdown) {
          setShowDropdown(true);
        }
        break;
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* 语言选择按钮 */}
      <button
        ref={buttonRef}
        onClick={() => !disabled && setShowDropdown(!showDropdown)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          "flex items-center p-2 rounded-lg transition-colors",
          "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
          disabled && "opacity-50 cursor-not-allowed",
          compact ? "space-x-0" : "space-x-2"
        )}
        aria-label={compact ? t.navigation.language : undefined}
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
      >
        {compact ? (
          // 紧凑模式：只显示地球图标
          <Globe className="w-5 h-5 text-gray-600" />
        ) : (
          // 完整模式：显示图标、语言名称和下拉箭头
          <>
            <Globe className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">
              {currentConfig?.nativeName || '简体'}
            </span>
            <ChevronDown 
              className={cn(
                "w-3 h-3 text-gray-600 transition-transform",
                showDropdown && "rotate-180"
              )} 
            />
          </>
        )}
      </button>

      {/* 下拉菜单 */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-60",
            "min-w-[140px] max-w-[200px] py-1",
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="listbox"
          aria-label={t.navigation.language}
        >
          {supportedLanguages.map((language) => {
            const isSelected = language.code === currentLanguage;
            
            return (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-left",
                  "hover:bg-gray-50 transition-colors text-sm",
                  "first:rounded-t-lg last:rounded-b-lg",
                  isSelected && "bg-blue-50 text-blue-600"
                )}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-base leading-none">
                    {language.flag}
                  </span>
                  <span className="font-medium">
                    {language.nativeName}
                  </span>
                </div>
                
                {isSelected && (
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 带加载状态的语言选择器
export const LanguageSelectorWithLoading: React.FC<LanguageSelectorProps & {
  loading?: boolean;
}> = ({ loading, ...props }) => {
  if (loading) {
    return (
      <div className={cn("flex items-center p-2", props.className)}>
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }
  
  return <LanguageSelector {...props} />;
};

// 导出默认组件
export default LanguageSelector;