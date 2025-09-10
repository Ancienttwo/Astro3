'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Mail, ArrowRight } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config/app-config';
import { getCrossDomainAuthUrl, isCrossDomainAuthEnabled } from '@/lib/config/deployment-config';

interface AuthOptionsProps {
  isEnglish?: boolean;
  showTitle?: boolean;
  onAuthSuccess?: () => void;
}

export function AuthOptions({ isEnglish = false, showTitle = true, onAuthSuccess }: AuthOptionsProps) {
  const router = useRouter();

  const handleWalletAuth = () => {
    const route = isEnglish ? '/en/wallet-auth' : '/wallet-auth';
    router.push(route);
  };

  const handleEmailAuth = () => {
    // 检查是否有跨域认证配置
    const crossDomainUrl = getCrossDomainAuthUrl('web2');
    
    if (crossDomainUrl && APP_CONFIG.mode === 'web3' && isCrossDomainAuthEnabled()) {
      // Web3版本跳转到Web2域名进行传统登录
      window.location.href = crossDomainUrl;
      return;
    }
    
    // 本地传统登录
    const route = isEnglish ? '/en/auth' : '/auth';
    router.push(route);
  };

  const texts = {
    title: isEnglish ? 'Choose Login Method' : '选择登录方式',
    walletTitle: isEnglish ? 'Web3 Wallet' : 'Web3钱包登录',
    walletDesc: isEnglish ? 'Connect your Web3 wallet' : '连接您的Web3钱包',
    emailTitle: isEnglish ? 'Email Account' : '邮箱账号登录',
    emailDesc: isEnglish ? 'Traditional email login' : '传统邮箱账号登录',
    walletBtn: isEnglish ? 'Connect Wallet' : '连接钱包',
    emailBtn: isEnglish ? 'Email Login' : '邮箱登录'
  };

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {texts.title}
          </h2>
        </div>
      )}

      <div className="grid gap-4">
        {/* Web3钱包登录 - 优先显示在Web3版本 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-purple-300">
          <CardContent className="p-6" onClick={handleWalletAuth}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {texts.walletTitle}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {texts.walletDesc}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* 传统邮箱登录 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-green-300">
          <CardContent className="p-6" onClick={handleEmailAuth}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {texts.emailTitle}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {texts.emailDesc}
                  {APP_CONFIG.mode === 'web3' && isCrossDomainAuthEnabled() && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 block mt-1">
                      {isEnglish ? '(Redirects to astrozi.app)' : '(跳转到 astrozi.app)'}
                    </span>
                  )}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Web3版本说明 */}
      {APP_CONFIG.mode === 'web3' && (
        <div className="text-center text-sm text-muted-foreground">
          <p>
            {isEnglish 
              ? 'Web3 version focuses on core astrology features with wallet integration'
              : 'Web3版本专注于核心命理功能和钱包集成'
            }
          </p>
        </div>
      )}
    </div>
  );
}