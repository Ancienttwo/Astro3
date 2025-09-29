"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccount, useBalance, useChainId } from "wagmi";
import { Shield, Info, AlertTriangle, Activity, TrendingUp, Wallet } from 'lucide-react';
import { useNamespaceTranslations } from '@/lib/i18n/useI18n';

import WagmiWalletConnector from "./WagmiWalletConnector";
import Web3SmartContractInteraction from './Web3SmartContractInteraction';

interface Web3IntegrationProps {
  onWeb3UserUpdate?: (isWeb3User: boolean, walletAddress?: string) => void;
}

export default function Web3Integration({ onWeb3UserUpdate }: Web3IntegrationProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: bal } = useBalance({ address });
  const [isLoading, setIsLoading] = useState(true);
  const tDashboard = useNamespaceTranslations('web3/auth');

  useEffect(() => {
    // 初始化 provider（供旧组件使用）
    // 仅用于兼容旧组件的 provider 已迁移，保留轻量初始化避免闪烁
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // 通知父组件Web3用户状态变化
    if (onWeb3UserUpdate) {
      onWeb3UserUpdate(!!isConnected, address);
    }
  }, [isConnected, address, onWeb3UserUpdate]);

  const walletInfo = useMemo(
    () =>
      address
        ? {
            address,
            balance: bal?.formatted ?? '0',
            chainId: chainId ?? 0,
            isConnected,
          }
        : null,
    [address, bal?.formatted, chainId, isConnected]
  );

  const isCorrectNetwork = (chainId ?? 0) === 56; // BSC Mainnet
  const statusBulletKeys = ['gas', 'points', 'streak', 'airdrop'] as const;
  const statusBullets = statusBulletKeys.map(key => tDashboard(`integration.status.bullets.${key}`));

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Web3状态指示器 */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              {tDashboard('integration.status.title')}
            </span>
            {walletInfo?.isConnected ? (
              <Badge className="bg-green-500 text-white">
                {tDashboard('integration.status.connected')}
              </Badge>
            ) : (
              <Badge variant="outline">
                {tDashboard('integration.status.disconnected')}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm text-gray-600">
              <p>{tDashboard('integration.status.description')}</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                {statusBullets.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 网络状态警告 */}
      {isConnected && !isCorrectNetwork && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">{tDashboard('integration.networkWarning.title')}</p>
                <p className="text-sm text-yellow-700">
                  {tDashboard('integration.networkWarning.message')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 主要内容区域 */}
      {!isConnected ? (
        <WagmiWalletConnector />
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {tDashboard('integration.tabs.overview')}
            </TabsTrigger>
            <TabsTrigger value="checkin" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {tDashboard('integration.tabs.checkin')}
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              {tDashboard('integration.tabs.wallet')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {isCorrectNetwork ? (
              <Web3SmartContractInteraction 
                walletAddress={walletInfo?.address as string}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-lg font-semibold mb-2">{tDashboard('integration.networkUnavailable.title')}</h3>
                  <p className="text-gray-600 mb-4">
                    {tDashboard('integration.networkUnavailable.description')}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="checkin" className="space-y-4">
            {isCorrectNetwork ? (
              <Web3SmartContractInteraction 
                walletAddress={walletInfo?.address as string}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600">{tDashboard('integration.checkinUnavailable')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="wallet">
            <WagmiWalletConnector />
          </TabsContent>
        </Tabs>
      )}

      {/* 帮助信息 */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">{tDashboard('integration.help.title')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs text-gray-600">
            <p>• {tDashboard('integration.help.items.install')}</p>
            <p>• {tDashboard('integration.help.items.testnet')}</p>
            <p>• {tDashboard('integration.help.items.troubleshoot')}</p>
          </div>
          <div className="flex gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
            >
              {tDashboard('integration.help.buttons.install')}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://testnet.binance.org/faucet-smart', '_blank')}
            >
              {tDashboard('integration.help.buttons.testBnb')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
