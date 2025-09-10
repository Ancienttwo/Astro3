"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import ChatBotLayout from '@/components/ChatBotLayout';
import { AdaptiveLayout } from '@/components/layout/adaptive-layout';
import { ThemedCard } from '@/components/ui/themed-card';
import { ThemedButton } from '@/components/ui/themed-button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { isFeatureEnabled } from '@/lib/config/feature-flags';
import { ChatMessage } from '@/components/chatbot/ChatMessage';
import { ChatHeader } from '@/components/chatbot/ChatHeader';
import { ChatInput } from '@/components/chatbot/ChatInput';
import { useChatManager } from '@/hooks/chatbot/useChatManager';
import { useIsMobile } from '@/hooks/use-mobile';

export default function ChatbotPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
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
  if (!isFeatureEnabled('chatbot')) {
    return (
      <AdaptiveLayout 
        title="功能暂不可用"
        description="AI聊天机器人功能在当前版本中不可用"
      >
        <div className="min-h-screen bg-background flex items-center justify-center">
          <ThemedCard themeVariant="elevated">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-xl font-semibold">AI聊天机器人暂不可用</h2>
              <p className="text-muted-foreground">
                此功能在当前版本中未启用。
              </p>
            </CardContent>
          </ThemedCard>
        </div>
      </AdaptiveLayout>
    );
  }

  // 如果没有选择BOT，返回选择页面
  if (!state.activeMaster || !currentMaster) {
    console.log('🤖 Chatbot返回AdaptiveLayout，等待SubNav显示:', { 
      activeMaster: state.activeMaster, 
      currentMaster: !!currentMaster 
    });
    return (
      <AdaptiveLayout 
        title="AI智能问答"
        description="选择AI大师开始您的咨询"
      >
        <div className="min-h-screen bg-background flex items-center justify-center">
          <ThemedCard themeVariant="elevated">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-xl font-semibold text-muted-foreground">请选择AI大师</h2>
              <p className="text-sm text-muted-foreground">
                {isMobile ? '请点击上方导航选择AI大师' : '请在左侧导航中选择您需要的AI大师'}
              </p>
            </CardContent>
          </ThemedCard>
        </div>
      </AdaptiveLayout>
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
      placeholder={`向${currentMaster.name}提问...`}
      textareaRef={textareaRef}
    />
  );

  // 桌面端布局
  if (!isMobile) {
    return (
      <AdaptiveLayout title="AI智能问答">
        <div className="min-h-screen bg-background">
          <div className="p-4 md:p-6 space-y-6">
            {/* 页面标题 */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI智能问答</h1>
              <p className="text-muted-foreground">与{currentMaster.name}对话，获取专业命理解答</p>
            </div>

            {/* 聊天容器 */}
            <div className="max-w-4xl mx-auto">
              <Card className="h-[calc(100vh-200px)] flex flex-col">
                {/* 聊天头部 */}
                <CardHeader className="border-b">
                  {headerComponent}
                </CardHeader>

                {/* 聊天内容 */}
                <CardContent className="flex-1 overflow-y-auto p-6">
                  {/* 提示语 */}
                  <div className="text-center mb-6">
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        💡 命理知识库优化BOT - 适用于局部概念解答，不提供全局命盘分析<br />
                        AI排盘能力有限，需提供具体数据进行推演。如需完整命局分析和大运走势，请使用专业报告功能
                      </p>
                    </div>
                  </div>

                  {/* 消息列表 */}
                  <div className="space-y-4 pb-4">
                    {state.messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>

                {/* 输入框 */}
                <div className="border-t p-4">
                  {inputComponent}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* 订阅提醒对话框 */}
        {state.showSubscriptionDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm mx-4">
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold">ChatBot次数不足</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  您的ChatBot对话次数已用完，请通过签到获得更多次数。
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={goToCheckin}
                    className="flex-1"
                    size="sm"
                  >
                    去签到
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={closeSubscriptionDialog}
                    className="flex-1"
                    size="sm"
                  >
                    关闭
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 错误提示 */}
        {state.error && (
          <div className="fixed bottom-4 left-4 right-4 z-40">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg max-w-md mx-auto">
              <p className="text-red-600 text-sm">{state.error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInputValue('')}
                className="mt-2 text-red-600 hover:text-red-700"
              >
                关闭
              </Button>
            </div>
          </div>
        )}
      </AdaptiveLayout>
    );
  }

  // 移动端布局（保持原有体验）
  return (
    <ChatBotLayout
      header={headerComponent}
      input={inputComponent}
    >
      {/* 提示语 */}
      <div className="text-center mb-4 md:mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50 shadow-sm">
          <p className="text-muted-foreground text-xs md:text-sm leading-tight">
            💡 命理知识库优化BOT - 适用于局部概念解答，不提供全局命盘分析<br className="hidden md:block"/>
            <span className="md:hidden">AI排盘能力有限，需提供具体数据进行推演</span>
            <span className="hidden md:inline">AI排盘能力有限，需提供具体数据进行推演。如需完整命局分析和大运走势，请使用专业报告功能</span>
          </p>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="space-y-0 pb-4">
        {state.messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 订阅提醒对话框 */}
      {state.showSubscriptionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm mx-4">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold">ChatBot次数不足</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                您的ChatBot对话次数已用完，请通过签到获得更多次数。
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={goToCheckin}
                  className="flex-1"
                  size="sm"
                >
                  去签到
                </Button>
                <Button 
                  variant="outline" 
                  onClick={closeSubscriptionDialog}
                  className="flex-1"
                  size="sm"
                >
                  关闭
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 错误提示 */}
      {state.error && (
        <div className="fixed bottom-20 left-4 right-4 z-40">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg">
            <p className="text-red-600 text-sm">{state.error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInputValue('')}
              className="mt-2 text-red-600 hover:text-red-700"
            >
              关闭
            </Button>
          </div>
        </div>
      )}
    </ChatBotLayout>
  );
} 