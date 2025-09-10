"use client";

import React from 'react';
import { Master, MasterType } from '@/types/chatbot';
import { getMastersForLanguage } from '@/config/chatbot';
import { APP_CONFIG } from '@/lib/config/app-config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageCircle, RefreshCw, Trash2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  currentMaster: Master | null;
  activeMasterType: MasterType | null;
  usage?: {
    chatbotRemaining: number;
    chatbotLimit: number;
  };
  usageLoading?: boolean;
  onSwitchMaster: (masterType: MasterType) => void;
  onRefreshUsage: () => void;
  onClearHistory: () => void;
  className?: string;
  language?: 'zh' | 'en';
}

export function ChatHeader({
  currentMaster,
  activeMasterType,
  usage,
  usageLoading = false,
  onSwitchMaster,
  onRefreshUsage,
  onClearHistory,
  className,
  language = 'zh'
}: ChatHeaderProps) {
  
  if (!currentMaster || !activeMasterType) {
    return null;
  }

  // 获取当前语言的Master配置
  const MASTERS = getMastersForLanguage(language);

  // 多语言文本配置
  const texts = {
    zh: {
      switchAgent: '切换Agent',
      online: '在线',
      refreshUsage: '刷新使用次数',
      clearHistory: '清空聊天历史'
    },
    en: {
      switchAgent: 'Switch Agent',
      online: 'Online',
      refreshUsage: 'Refresh Usage',
      clearHistory: 'Clear History'
    }
  };

  const t = texts[language];

  // 渲染Master选择器
  const renderMasterSelector = () => (
    <div className="flex items-center gap-1 min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 text-sm md:text-base hover:text-primary transition-colors min-w-0">
            <div className="text-left leading-tight min-w-max">
              {currentMaster.name.includes('·') ? (
                <div className="min-w-max">
                  <div className="text-sm md:text-base font-medium">{currentMaster.name.split('·')[0]}</div>
                  <div className="text-sm md:text-base font-medium">{currentMaster.name.split('·')[1]}</div>
                </div>
              ) : (
                <span className="whitespace-nowrap font-medium">{currentMaster.name}</span>
              )}
            </div>
            <ChevronDown className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {Object.entries(MASTERS).map(([key, master]) => (
            <DropdownMenuItem 
              key={key}
              onClick={() => onSwitchMaster(key as MasterType)}
              className={activeMasterType === key ? 'bg-accent' : ''}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs',
                  master.color
                )}>
                  {master.avatar}
                </div>
                <div>
                  <div className="font-medium">{master.name}</div>
                  <div className="text-xs text-muted-foreground">{master.title}</div>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* 切换提示 */}
      <span className="text-xs text-muted-foreground hidden md:inline flex-shrink-0">{t.switchAgent}</span>
    </div>
  );

  // 渲染使用次数显示
  const renderUsageDisplay = () => {
    if (!usage) return null;

    const isLow = usage.chatbotRemaining <= 3;
    const isVeryLow = usage.chatbotRemaining <= 1;

    return (
      <Badge 
        variant={isLow ? "destructive" : "secondary"}
        className={cn(
          "px-2 py-1 md:px-3 text-xs shadow-sm",
          isVeryLow ? "bg-red-50 text-red-700 border-red-200" : 
          isLow ? "bg-orange-50 text-orange-700 border-orange-200" :
          "bg-blue-50 text-blue-700 border-blue-200"
        )}
      >
        <MessageCircle className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />
        <span className="text-xs font-medium">{usage.chatbotRemaining}/{usage.chatbotLimit}</span>
      </Badge>
    );
  };

  // 渲染操作按钮
  const renderActionButtons = () => (
    <div className="flex items-center gap-0.5 md:gap-1">
      {/* 刷新使用次数 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRefreshUsage}
        className="text-muted-foreground hover:text-primary hover:bg-gray-100 p-1 md:p-1.5 h-7 w-7 md:h-8 md:w-8 rounded-lg transition-all duration-200"
        title={t.refreshUsage}
      >
        <RefreshCw className={cn(
          'w-3.5 h-3.5 md:w-4 md:h-4',
          usageLoading && 'animate-spin'
        )} />
      </Button>
      
      {/* 清空聊天历史 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearHistory}
        className="text-muted-foreground hover:text-red-500 hover:bg-red-50 p-1 md:p-1.5 h-7 w-7 md:h-8 md:w-8 rounded-lg transition-all duration-200"
        title={t.clearHistory}
      >
        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
      </Button>
    </div>
  );

  return (
    <div className={cn('pb-3 md:pb-4 px-4 md:px-6 py-3 md:py-5 bg-white/50 backdrop-blur-sm border-b', className)}>
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {/* Master头像 */}
        <div className={cn(
          'w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm md:text-base shadow-sm flex-shrink-0',
          currentMaster.color
        )}>
          {currentMaster.avatar}
        </div>
        
        {/* Master选择器 - 给予更多空间 */}
        <div className="flex-1 min-w-0">
          {renderMasterSelector()}
        </div>
        
        {/* 右侧功能区 - 紧凑排列 */}
        <div className="flex items-center gap-1 md:gap-1.5 flex-shrink-0">
          {/* 在线状态 */}
          <Badge variant="secondary" className="text-xs px-2 md:px-3 py-1 bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
            {t.online}
          </Badge>
          
          {/* 使用次数显示 */}
          {renderUsageDisplay()}
          
          {/* 操作按钮 */}
          {renderActionButtons()}
        </div>
      </div>
    </div>
  );
} 