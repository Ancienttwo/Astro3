'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  Crown, 
  Star, 
  ArrowRight, 
  Mail,
  X
} from 'lucide-react';

interface LoginGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (method: 'email' | 'google') => void;
  context?: {
    slipNumber: number;
    fortuneType: string;
    userQuestion?: string;
  };
}

const LoginGuidanceModal: React.FC<LoginGuidanceModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  context
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'google' | null>(null);

  const handleMethodSelect = (method: 'email' | 'google') => {
    setSelectedMethod(method);
  };

  const handleProceed = () => {
    if (selectedMethod) {
      onLogin(selectedMethod);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl text-red-800">
            <Crown className="w-7 h-7 text-yellow-600" />
            <span>开启AI智慧解读</span>
            <Crown className="w-7 h-7 text-yellow-600" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 当前签文信息 */}
          {context && (
            <Card className="bg-gradient-to-r from-red-50 to-amber-50 border-red-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-semibold text-red-800 mb-2">
                    您抽得第{context.slipNumber}签
                  </h3>
                  <p className="text-red-700 text-sm">
                    即将为您提供深度的个性化解读和智慧指引
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI解读特色介绍 */}
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
              <h3 className="text-xl font-bold text-purple-800">AI解读特色</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-white p-3 rounded-lg border border-purple-100 mb-3">
                  <Star className="w-8 h-8 text-purple-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-purple-800 mb-2">个性化解读</h4>
                <p className="text-sm text-purple-700">
                  结合您的具体问题，提供量身定制的解答
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white p-3 rounded-lg border border-purple-100 mb-3">
                  <Crown className="w-8 h-8 text-purple-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-purple-800 mb-2">历史典故融合</h4>
                <p className="text-sm text-purple-700">
                  运用古代智慧，讲述引人入胜的故事
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white p-3 rounded-lg border border-purple-100 mb-3">
                  <Sparkles className="w-8 h-8 text-purple-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-purple-800 mb-2">智慧指引</h4>
                <p className="text-sm text-purple-700">
                  提供实用的人生建议和行动方向
                </p>
              </div>
            </div>
          </div>

          {/* 登录方式选择 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              请选择您的登录方式
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 邮箱登录 */}
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedMethod === 'email' 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleMethodSelect('email')}
              >
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      selectedMethod === 'email' ? 'bg-blue-500' : 'bg-gray-100'
                    }`}>
                      <Mail className={`w-8 h-8 ${
                        selectedMethod === 'email' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-gray-800 mb-2">邮箱登录</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    使用邮箱和密码登录，传统可靠
                  </p>
                  
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center justify-center space-x-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>完全控制</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>隐私安全</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Google登录 */}
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedMethod === 'google' 
                    ? 'border-red-500 bg-red-50 ring-2 ring-red-200' 
                    : 'border-gray-200 hover:border-red-300'
                }`}
                onClick={() => handleMethodSelect('google')}
              >
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      selectedMethod === 'google' ? 'bg-red-500' : 'bg-gray-100'
                    }`}>
                      {/* Google Icon */}
                      <svg className={`w-8 h-8 ${
                        selectedMethod === 'google' ? 'text-white' : 'text-gray-600'
                      }`} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-gray-800 mb-2">Google登录</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    使用Google账号，一键快速登录
                  </p>
                  
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center justify-center space-x-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span>一键登录</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span>无需密码</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              暂不登录
            </Button>
            
            <Button
              onClick={handleProceed}
              disabled={!selectedMethod}
              className={`flex-1 ${
                selectedMethod === 'email' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : selectedMethod === 'google'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-400'
              }`}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              {selectedMethod === 'email' ? '邮箱登录' : 
               selectedMethod === 'google' ? 'Google登录' : '请选择登录方式'}
            </Button>
          </div>

          {/* 功能说明 */}
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">
              💡 登录后，您可以保存解读历史、获得更精准的个性化建议，并享受更多高级功能
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginGuidanceModal;