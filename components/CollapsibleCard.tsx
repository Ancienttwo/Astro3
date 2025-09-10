"use client";

import { useState, ReactNode } from 'react';
import { ChevronUp, LucideIcon, Loader2 } from 'lucide-react';

interface CollapsibleCardProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  icon?: LucideIcon;
  variant?: 'default' | 'bazi' | 'ziwei';
  className?: string;
  openCardId?: string | null;
  setOpenCardId?: (id: string | null) => void;
  analysisStatus?: {
    isLoading: boolean;
    isCompleted: boolean;
    isFailed: boolean;
    elapsedTime: number;
    formattedElapsedTime: string;
    error: string | null;
  };
  keepMounted?: boolean; // 新增：是否在收起时保持组件挂载状态
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({ 
  id, 
  title, 
  description,
  children, 
  defaultOpen = true, 
  isOpen: controlledIsOpen,
  onOpenChange,
  icon: Icon,
  variant = 'default',
  className,
  openCardId,
  setOpenCardId,
  analysisStatus,
  keepMounted = false
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

  // 处理多种控制方式
  const isControlled = controlledIsOpen !== undefined;
  const isOpenCardControlled = openCardId !== undefined;
  
  let isOpen: boolean;
  if (isControlled) {
    isOpen = controlledIsOpen;
  } else if (isOpenCardControlled) {
    isOpen = openCardId === id;
  } else {
    isOpen = internalIsOpen;
  }

  const handleClick = () => {
    if (isControlled && onOpenChange) {
      onOpenChange(!isOpen);
    } else if (isOpenCardControlled && setOpenCardId) {
      setOpenCardId(isOpen ? null : id);
    } else {
      setInternalIsOpen(!isOpen);
    }
  };

  const styles = variant === 'bazi' 
    ? {
        card: "bg-white dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm",
        iconColor: "text-yellow-600 dark:text-amber-400",
        titleColor: "text-gray-900 dark:text-amber-400 font-noto",
        chevronColor: "text-yellow-600 dark:text-amber-400"
      }
    : variant === 'ziwei'
    ? {
        card: "bg-white dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm",
        iconColor: "text-purple-600 dark:text-amber-400",
        titleColor: "text-purple-600 dark:text-amber-400 font-noto", 
        chevronColor: "text-purple-600 dark:text-amber-400"
      }
    : {
        card: "bg-white dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm",
        iconColor: "text-primary dark:text-amber-400",
        titleColor: "text-primary dark:text-amber-400 font-noto", 
        chevronColor: "text-primary dark:text-amber-400"
      };

  return (
    <div id={id} className={`${styles.card} ${className || ''}`}>
      <button
        type="button"
        className="w-full flex justify-between items-center p-2 sm:p-3 lg:p-4 cursor-pointer text-left hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-200"
        onClick={handleClick}
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
      >
        <div className="flex items-center space-x-2 lg:space-x-3">
            {Icon && <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${styles.iconColor}`} />}
            <h3 className={`font-semibold text-base lg:text-lg ${styles.titleColor}`}>{title}</h3>
            {/* 分析状态指示器 */}
            {analysisStatus?.isLoading && (
              <div className="flex items-center gap-2 ml-3">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  分析中... {analysisStatus.formattedElapsedTime}
                </span>
              </div>
            )}
            {analysisStatus?.isCompleted && (
              <div className="flex items-center gap-1 ml-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 dark:text-green-400">
                  分析完成
                </span>
              </div>
            )}
            {analysisStatus?.isFailed && (
              <div className="flex items-center gap-1 ml-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-red-600 dark:text-red-400">
                  分析失败
                </span>
              </div>
            )}
        </div>
        <ChevronUp
          className={`w-5 h-5 lg:w-6 lg:h-6 ${styles.chevronColor} transform transition-transform duration-300 ${
            isOpen ? '' : 'rotate-180'
          }`}
        />
      </button>
      {/* 内容区域 - 支持keepMounted模式 */}
      {keepMounted ? (
        <div 
          id={`${id}-content`} 
          className={`p-2 sm:p-3 lg:p-4 pt-0 transition-all duration-300 overflow-hidden ${
            isOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 p-0'
          }`}
          style={{ 
            display: isOpen ? 'block' : 'none' 
          }}
        >
          {children}
        </div>
      ) : (
        isOpen && (
          <div id={`${id}-content`} className="p-2 sm:p-3 lg:p-4 pt-0">
            {children}
          </div>
        )
      )}
    </div>
  );
};

export default CollapsibleCard; 