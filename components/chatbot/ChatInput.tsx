"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, RefreshCw, User2 } from 'lucide-react';
import { CHATBOT_CONFIG } from '@/config/chatbot';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isLoading?: boolean;
  disabled?: boolean;
  user?: any;
  messagesCount?: number;
  placeholder?: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  className?: string;
  language?: 'zh' | 'en';
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  isLoading = false,
  disabled = false,
  user,
  messagesCount = 0,
  placeholder = "输入您的问题...",
  textareaRef,
  className,
  language = 'zh'
}: ChatInputProps) {

  // 多语言文本
  const texts = {
    zh: {
      overLimit: '超出限制',
      thinking: 'AI正在思考中...',
      limitHint: '请将内容控制在{limit}字符以内',
      sendHint: '按Enter发送，Shift+Enter换行',
      guest: '游客',
      messages: '条消息'
    },
    en: {
      overLimit: 'Over limit',
      thinking: 'AI is thinking...',
      limitHint: 'Please keep content within {limit} characters',
      sendHint: 'Press Enter to send, Shift+Enter for new line',
      guest: 'Guest',
      messages: 'messages'
    }
  };

  const t = texts[language];

  // 检查是否可以发送
  const canSend = value.trim().length > 0 && !isLoading && !disabled;

  // 字符计数和验证
  const getCharacterInfo = () => {
    const currentLength = value.length;
    const maxLength = CHATBOT_CONFIG.maxMessageLength;
    const isOverLimit = currentLength > maxLength;
    
    return {
      currentLength,
      maxLength,
      isOverLimit,
      percentage: (currentLength / maxLength) * 100
    };
  };

  const charInfo = getCharacterInfo();

  // 渲染字符计数器
  const renderCharacterCounter = () => {
    if (value.length === 0) return null;

    return (
      <div className={cn(
        'text-xs',
        charInfo.isOverLimit ? 'text-red-500' : 'text-muted-foreground'
      )}>
        {charInfo.currentLength}/{charInfo.maxLength}
        {charInfo.isOverLimit && (
          <span className="ml-1 text-red-500">{t.overLimit}</span>
        )}
      </div>
    );
  };

  // 渲染输入提示
  const renderInputHints = () => {
    if (isLoading) {
      return (
        <div className="text-xs text-blue-600 flex items-center gap-1">
          <RefreshCw className="w-3 h-3 animate-spin" />
          {t.thinking}
        </div>
      );
    }

    if (charInfo.isOverLimit) {
      return (
        <div className="text-xs text-red-500">
          {t.limitHint.replace('{limit}', CHATBOT_CONFIG.maxMessageLength.toString())}
        </div>
      );
    }

    if (value.trim().length > 0) {
      return (
        <div className="text-xs text-muted-foreground">
          {t.sendHint}
        </div>
      );
    }

    return null;
  };

  // 渲染状态栏
  const renderStatusBar = () => (
    <div className="flex items-center justify-between mt-1.5 md:mt-2 text-xs text-muted-foreground">
      {/* 用户信息 */}
      <div className="flex items-center gap-1">
        <User2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
        <span className="truncate max-w-[120px] md:max-w-none">
          {user?.email || t.guest}
        </span>
      </div>

      {/* 消息计数 */}
      <span className="text-xs">{messagesCount} {t.messages}</span>
    </div>
  );

  return (
    <div className={cn('p-3 md:p-4', className)}>
      {/* 输入区域 */}
      <div className="flex gap-2 md:gap-3">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled || isLoading}
          className={cn(
            'flex-1 min-h-[50px] md:min-h-[60px] max-h-[100px] md:max-h-[120px] resize-none text-sm md:text-base',
            'rounded-xl border-2 border-gray-200 focus:border-primary bg-white/70 backdrop-blur-sm',
            'transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-md',
            charInfo.isOverLimit && 'border-red-300 focus:border-red-500'
          )}
          maxLength={CHATBOT_CONFIG.maxMessageLength + 100} // 允许稍微超出以显示错误
        />
        
        <Button
          onClick={onSend}
          disabled={!canSend || charInfo.isOverLimit}
          size="icon"
          className={cn(
            'w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl shadow-sm',
            'transition-all duration-200 hover:shadow-md',
            canSend && !charInfo.isOverLimit && 'bg-primary hover:bg-primary/90'
          )}
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
          ) : (
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </Button>
      </div>
      
      {/* 输入提示和字符计数 */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex-1">
          {renderInputHints()}
        </div>
        {renderCharacterCounter()}
      </div>
      
      {/* 状态栏 */}
      {renderStatusBar()}
    </div>
  );
} 