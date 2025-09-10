"use client";

import React, { useState, useEffect } from 'react';
import { X, Smartphone, Download, Share, Plus, Home, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PWAInstallPromptProps {
  showOnPages?: string[]; // 指定在哪些页面显示
}

export default function PWAInstallPrompt({ showOnPages = ['/auth'] }: PWAInstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 检测设备类型
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    if (isIOS) {
      setDeviceType('ios');
    } else if (isAndroid) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
      return; // 桌面端不显示提示
    }

    // 检查是否已经安装或已经提示过
    const hasPrompted = localStorage.getItem('pwa-install-prompted');
    const neverShowAgain = localStorage.getItem('pwa-never-show-again');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const currentPath = window.location.pathname;
    
    // 只在指定页面显示，且未安装、未提示过、未设置永不显示
    if (showOnPages.includes(currentPath) && !hasPrompted && !neverShowAgain && !isStandalone) {
      // 延迟显示，给用户一些时间适应页面
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    // 监听Android的PWA安装事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [showOnPages]);

  const handleInstallClick = async () => {
    if (deviceType === 'android' && deferredPrompt) {
      // Android原生安装提示
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`用户选择: ${outcome}`);
      setDeferredPrompt(null);
    }
    handleDismiss();
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompted', 'true');
  };

  const handleNeverShowAgain = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-never-show-again', 'true');
  };

  if (!showPrompt || deviceType === 'desktop') {
    return null;
  }

  const IOSInstructions = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
          1
        </div>
        <div className="flex items-center space-x-2">
          <Share className="w-5 h-5 text-blue-500" />
          <span className="text-sm">点击浏览器底部的"分享"按钮</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
          2
        </div>
        <div className="flex items-center space-x-2">
          <Plus className="w-5 h-5 text-blue-500" />
          <span className="text-sm">选择"添加到主屏幕"</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
          3
        </div>
        <div className="flex items-center space-x-2">
          <Home className="w-5 h-5 text-blue-500" />
          <span className="text-sm">点击"添加"完成安装</span>
        </div>
      </div>
    </div>
  );

  const AndroidInstructions = () => (
    <div className="space-y-4">
      {deferredPrompt ? (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            点击下方按钮直接安装到桌面
          </p>
          <Button 
            onClick={handleInstallClick}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            立即安装
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              1
            </div>
            <span className="text-sm">点击浏览器菜单（三个点）</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              2
            </div>
            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-green-500" />
              <span className="text-sm">选择"安装应用"或"添加到主屏幕"</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-500">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-primary">添加到桌面</h4>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="h-6 w-6 p-0 hover:bg-muted/50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            将AstroZi添加到桌面，享受更好的使用体验！
          </p>

          {deviceType === 'ios' ? <IOSInstructions /> : <AndroidInstructions />}

          <div className="mt-4 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center mb-3">
              💡 添加后可以像原生应用一样快速启动
            </p>
            
            {/* 新增的操作按钮 */}
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDismiss}
                className="flex-1 text-xs"
              >
                稍后提醒
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNeverShowAgain}
                className="flex-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <EyeOff className="w-3 h-3 mr-1" />
                不再提示
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 