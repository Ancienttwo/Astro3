"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import SmartChatBotLayout from '@/components/SmartChatBotLayout';
import { ThemedCard } from '@/components/ui/themed-card';
import { ThemedButton } from '@/components/ui/themed-button';
import { CardContent, CardHeader } from '@/components/ui/card';
import { APP_CONFIG } from '@/lib/config/app-config';
import { ChatMessage } from '@/components/chatbot/ChatMessage';
import { ChatHeader } from '@/components/chatbot/ChatHeader';
import { ChatInput } from '@/components/chatbot/ChatInput';
import { useChatManager } from '@/hooks/chatbot/useChatManager';

export default function EnglishChatbotPage() {
  const router = useRouter();
  const {
    state,
    currentMaster,
    usage,
    usageLoading,
    messagesEndRef,
    textareaRef,
    switchMaster,
    sendMessage,
    clearChatHistory,
    handleKeyDown,
    closeSubscriptionDialog,
    goToCheckin,
    setInputValue,
    refreshUsage
  } = useChatManager();

  // 检查聊天机器人功能是否启用
  const chatbotEnabled = APP_CONFIG.features.chatbot;
  
  if (!chatbotEnabled) {
    return (
      <SmartChatBotLayout 
        title="AI Intelligent Q&A"
      >
        <div className="min-h-screen bg-background flex items-center justify-center">
          <ThemedCard themeVariant="elevated">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-xl font-semibold">AI Chatbot Not Available</h2>
              <p className="text-muted-foreground">
                This feature is not enabled in the current version.
              </p>
            </CardContent>
          </ThemedCard>
        </div>
      </SmartChatBotLayout>
    );
  }

  // 如果没有选择BOT，返回选择页面
  if (!state.activeMaster || !currentMaster) {
    console.log('🤖 English Chatbot返回SmartChatBotLayout，等待SubNav显示:', { 
      activeMaster: state.activeMaster, 
      currentMaster: !!currentMaster 
    });
    return (
      <SmartChatBotLayout 
        title="AI Intelligent Q&A"
      >
        <div className="min-h-screen bg-background flex items-center justify-center">
          <ThemedCard themeVariant="elevated">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-xl font-semibold text-muted-foreground">Please Select AI Master</h2>
              <p className="text-sm text-muted-foreground">
                Please select the AI Master you need from the navigation menu
              </p>
            </CardContent>
          </ThemedCard>
        </div>
      </SmartChatBotLayout>
    );
  }

  // 聊天头部组件
  const headerComponent = (
    <ChatHeader
      currentMaster={currentMaster}
      activeMasterType={state.activeMaster}
      usage={usage ? {
        chatbotRemaining: usage.chatbotRemaining,
        chatbotLimit: usage.chatbotLimit
      } : undefined}
      usageLoading={usageLoading}
      onSwitchMaster={switchMaster}
      onRefreshUsage={refreshUsage}
      onClearHistory={clearChatHistory}
      language="en"
    />
  );

  // 输入框组件
  const inputComponent = (
    <ChatInput
      value={state.inputValue}
      onChange={setInputValue}
      onSend={sendMessage}
      onKeyDown={handleKeyDown}
      isLoading={state.isLoading}
      user={state.user}
      messagesCount={state.messages.length}
      placeholder={`Ask ${currentMaster.name}...`}
      textareaRef={textareaRef}
      language="en"
    />
  );

  // 统一使用SmartChatBotLayout，它会自动处理Web3/Web2用户和桌面/移动端布局
  return (
    <SmartChatBotLayout
      header={headerComponent}
      input={inputComponent}
      title="AI Intelligent Q&A"
    >
      {/* 提示语 */}
      <div className="text-center mb-4 md:mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50 shadow-sm">
          <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
            💡 Astrology Knowledge Base Optimized BOT - Suitable for specific concept explanations, not full chart analysis<br />
            AI chart capabilities are limited, specific data needed for interpretation. For complete destiny analysis and major luck trends, please use professional report features
          </p>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="space-y-3 md:space-y-4 pb-4">
        {state.messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            language="en"
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 订阅提醒对话框 */}
      {state.showSubscriptionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <ThemedCard themeVariant="elevated" className="w-full max-w-sm mx-4">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold">Insufficient ChatBot Credits</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your ChatBot conversation credits have been exhausted. Please check in to get more credits.
              </p>
              <div className="flex gap-2">
                <ThemedButton 
                  themeVariant="primary"
                  onClick={goToCheckin}
                  className="flex-1"
                  size="sm"
                >
                  Check In
                </ThemedButton>
                <ThemedButton 
                  themeVariant="secondary"
                  onClick={closeSubscriptionDialog}
                  className="flex-1"
                  size="sm"
                >
                  Close
                </ThemedButton>
              </div>
            </CardContent>
          </ThemedCard>
        </div>
      )}

      {/* 错误提示 */}
      {state.error && (
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <ThemedCard themeVariant="elevated" className="bg-red-50 border border-red-200 shadow-lg max-w-md mx-auto">
            <CardContent className="p-3">
              <p className="text-red-600 text-sm">{state.error}</p>
              <ThemedButton
                themeVariant="ghost"
                size="sm"
                onClick={() => setInputValue('')}
                className="mt-2 text-red-600 hover:text-red-700"
              >
                Close
              </ThemedButton>
            </CardContent>
          </ThemedCard>
        </div>
      )}
    </SmartChatBotLayout>
  );
} 