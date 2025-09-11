"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Activity, TrendingUp, Settings, AlertTriangle, Shield, Info } from "lucide-react";
import { useAccount, useBalance, useChainId } from "wagmi";

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
  const { toast } = useToast();

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
              Web3 Mode
            </span>
            {walletInfo?.isConnected ? (
              <Badge className="bg-green-500 text-white">
                已连接
              </Badge>
            ) : (
              <Badge variant="outline">
                未连接
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Web3模式</strong>让您通过区块链钱包进行身份验证，参与链上签到赚取积分和空投权重。
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>每次签到消耗 0.0002 BNB</li>
                <li>获得积分和空投权重</li>
                <li>连续签到获得奖励倍数</li>
                <li>参与未来代币空投</li>
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
                <p className="font-medium text-yellow-800">网络不匹配</p>
                <p className="text-sm text-yellow-700">
                  请切换到 BSC 主网以使用 Web3 功能
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
              概览
            </TabsTrigger>
            <TabsTrigger value="checkin" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              签到
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              钱包
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
                  <h3 className="text-lg font-semibold mb-2">网络不可用</h3>
                  <p className="text-gray-600 mb-4">
                    请切换到 BSC 测试网以查看您的Web3数据
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
                  <p className="text-gray-600">请连接到正确的网络以进行签到</p>
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
          <CardTitle className="text-sm">需要帮助？</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs text-gray-600">
            <p>• 如果没有MetaMask，请先安装并创建钱包</p>
            <p>• 若需测试，请切换到 BSC 测试网并获取测试 BNB</p>
            <p>• 遇到问题？检查网络连接和钱包设置</p>
          </div>
          <div className="flex gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
            >
              安装MetaMask
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://testnet.binance.org/faucet-smart', '_blank')}
            >
              获取测试BNB
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
