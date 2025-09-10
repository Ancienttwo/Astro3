"use client";

import React, { useState } from 'react';
import { Message } from '@/types/chatbot';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  message: Message;
  className?: string;
  language?: 'zh' | 'en';
}

export function ChatMessage({ message, className, language = 'zh' }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';
  const isSending = message.status === 'sending';
  const [showThinking, setShowThinking] = useState(false);

  // 多语言文本
  const texts = {
    zh: {
      showThinking: '查看推理过程',
      hideThinking: '隐藏推理过程',
      thinkingTitle: 'AI 推理过程',
      characters: '字'
    },
    en: {
      showThinking: 'Show thinking process',
      hideThinking: 'Hide thinking process',
      thinkingTitle: 'AI Thinking Process',
      characters: 'chars'
    }
  };

  const t = texts[language];

  // 解析思考过程和最终答案
  const parseContent = (content: string) => {
    // 匹配各种思考标签
    const thinkingPatterns = [
      /<think>([\s\S]*?)<\/think>/gi,
      /<thinking>([\s\S]*?)<\/thinking>/gi,
      /思考[:：]([\s\S]*?)(?=\n\n|$)/gi,
      /【思考】([\s\S]*?)(?=\n\n|【(?!思考)|$)/gi,
      /\*\*思考\*\*([\s\S]*?)(?=\n\n|\*\*(?!思考)|$)/gi
    ];

    let thinking = '';
    let cleanContent = content;

    // 提取所有思考内容
    thinkingPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          thinking += match + '\n\n';
          cleanContent = cleanContent.replace(match, '').trim();
        });
      }
    });

    // 清理多余空行
    cleanContent = cleanContent.replace(/\n\s*\n\s*\n+/g, '\n\n').trim();
    thinking = thinking.trim();

    return {
      thinking: thinking || null,
      answer: cleanContent || content // 如果没有思考内容，返回原始内容
    };
  };

  const { thinking, answer } = !isUser ? parseContent(message.content) : { thinking: null, answer: message.content };
  
  // 状态图标
  const getStatusIcon = () => {
    if (isSending) {
      return <Clock className="w-3 h-3 text-blue-500 animate-pulse" />;
    }
    if (isError) {
      return <XCircle className="w-3 h-3 text-red-500" />;
    }
    if (message.status === 'sent') {
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    }
    return null;
  };

  // 消息时间格式化
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取消息样式
  const getMessageStyles = () => {
    if (isUser) {
      return {
        container: 'justify-end',
        bubble: cn(
          'bg-primary text-primary-foreground ml-6 md:ml-12 shadow-sm',
          isError && 'bg-red-500',
          isSending && 'bg-blue-500'
        )
      };
    }
    
    return {
      container: 'justify-start',
      bubble: cn(
        'bg-muted mr-6 md:mr-12 shadow-sm border border-border/50',
        isError && 'bg-red-50 border border-red-200',
        message.id.startsWith('loading_') && 'bg-blue-50 border border-blue-200'
      )
    };
  };

  const styles = getMessageStyles();

  return (
    <div className={cn('flex mb-4 md:mb-6', styles.container, className)}>
      <div
        className={cn(
          'max-w-[85%] md:max-w-[75%] rounded-2xl',
          isUser ? 'p-3 md:p-4' : 'p-4 md:p-5',
          styles.bubble
        )}
      >
        {/* 消息内容 */}
        <div className={cn(
          "text-sm md:text-base",
          isUser ? "leading-relaxed" : "leading-loose"
        )}>
          {/* 思考过程展开按钮（仅AI消息且有思考内容时显示） */}
          {!isUser && thinking && (
            <div className="mb-3 pb-3 border-b border-border/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowThinking(!showThinking)}
                className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Brain className="w-3 h-3 mr-1.5" />
                {showThinking ? t.hideThinking : t.showThinking}
                {showThinking ? (
                  <ChevronUp className="w-3 h-3 ml-1.5" />
                ) : (
                  <ChevronDown className="w-3 h-3 ml-1.5" />
                )}
              </Button>
              
              {/* 思考过程内容 */}
              {showThinking && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border/20">
                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                    <Brain className="w-3 h-3 mr-1" />
                    {t.thinkingTitle}
                  </div>
                  <div className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
                    {thinking}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* 主要答案内容 */}
          <div className="whitespace-pre-wrap break-words">
            {answer}
          </div>
        </div>
        
        {/* 消息元信息 */}
        <div className="flex items-center justify-between mt-2 text-xs opacity-70">
          <span>{formatTime(message.timestamp)}</span>
          
          {/* 状态和元数据 */}
          <div className="flex items-center gap-1">
            {/* 字符计数（仅AI消息） */}
            {!isUser && message.metadata?.characterCount && (
              <span className="text-xs text-muted-foreground">
                {message.metadata.characterCount}{t.characters}
              </span>
            )}
            
            {/* 状态图标 */}
            {getStatusIcon()}
          </div>
        </div>
        
        {/* 错误信息 */}
        {isError && (
          <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded border">
            消息发送失败，请重试
          </div>
        )}
        
        {/* 加载动画 */}
        {message.id.startsWith('loading_') && (
          <div className="flex items-center gap-1 mt-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
      </div>
    </div>
  );
} 