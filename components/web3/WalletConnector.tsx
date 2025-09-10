'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Shield,
  Zap,
  Network
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletInfo {
  address: string;
  balance: {
    native: string; // BNB
    azi: string;    // AZI tokens
    luck: string;   // Luck points
  };
  networkId: number;
  networkName: string;
  nftCount: number;
  reputation: number;
}

interface WalletConnectorProps {
  onWalletConnect?: (walletInfo: WalletInfo) => void;
  onWalletDisconnect?: () => void;
  onNetworkSwitch?: (networkId: number) => void;
}

const supportedNetworks = {
  56: {
    name: 'BSC Mainnet',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    blockExplorer: 'https://bscscan.com'
  },
  97: {
    name: 'BSC Testnet',
    symbol: 'tBNB', 
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    blockExplorer: 'https://testnet.bscscan.com'
  }
};

export default function WalletConnector({
  onWalletConnect,
  onWalletDisconnect,
  onNetworkSwitch
}: WalletConnectorProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

  useEffect(() => {
    // Auto-connect if previously connected
    checkPreviousConnection();
    
    // Listen for account changes
    if (isMetaMaskInstalled) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }

    return () => {
      if (isMetaMaskInstalled) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  const checkPreviousConnection = async () => {
    if (!isMetaMaskInstalled) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await connectWallet(false);
      }
    } catch (error) {
      console.error('检查钱包连接失败:', error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      handleDisconnect();
    } else if (walletInfo && accounts[0] !== walletInfo.address) {
      connectWallet(false);
    }
  };

  const handleChainChanged = (chainId: string) => {
    const networkId = parseInt(chainId, 16);
    if (supportedNetworks[networkId as keyof typeof supportedNetworks]) {
      connectWallet(false);
      onNetworkSwitch?.(networkId);
    } else {
      setShowNetworkModal(true);
    }
  };

  const handleDisconnect = () => {
    setWalletInfo(null);
    setError(null);
    onWalletDisconnect?.();
  };

  const connectWallet = async (requestPermission = true) => {
    if (!isMetaMaskInstalled) {
      setError('请安装 MetaMask 钱包');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      let accounts;
      
      if (requestPermission) {
        accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
      } else {
        accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });
      }

      if (accounts.length === 0) {
        throw new Error('没有可用的钱包账户');
      }

      const address = accounts[0];
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const networkId = parseInt(chainId, 16);

      // Check if on supported network
      if (!supportedNetworks[networkId as keyof typeof supportedNetworks]) {
        setShowNetworkModal(true);
        return;
      }

      // Get balances
      const balance = await getWalletBalances(address, networkId);
      
      // Get NFT count and reputation (simulated)
      const nftCount = await getNFTCount(address);
      const reputation = await getUserReputation(address);

      const walletData: WalletInfo = {
        address,
        balance,
        networkId,
        networkName: supportedNetworks[networkId as keyof typeof supportedNetworks].name,
        nftCount,
        reputation
      };

      setWalletInfo(walletData);
      onWalletConnect?.(walletData);

    } catch (error: any) {
      setError(error.message || '连接钱包失败');
    } finally {
      setIsConnecting(false);
    }
  };

  const getWalletBalances = async (address: string, networkId: number): Promise<WalletInfo['balance']> => {
    try {
      // Get native token balance (BNB)
      const nativeBalance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      
      const nativeFormatted = (parseInt(nativeBalance, 16) / 1e18).toFixed(4);

      // In a real implementation, we would call contract methods to get token balances
      // For now, simulate the data
      return {
        native: nativeFormatted,
        azi: '150.25', // Simulated AZI balance
        luck: '350'    // Simulated luck points
      };
    } catch (error) {
      console.error('获取余额失败:', error);
      return {
        native: '0',
        azi: '0',
        luck: '0'
      };
    }
  };

  const getNFTCount = async (address: string): Promise<number> => {
    // Simulate NFT count - in real implementation, query the NFT contract
    return Math.floor(Math.random() * 10) + 1;
  };

  const getUserReputation = async (address: string): Promise<number> => {
    // Simulate reputation score - in real implementation, query from database
    return 4.2 + Math.random() * 0.8;
  };

  const switchNetwork = async (targetNetworkId: number) => {
    if (!isMetaMaskInstalled) return;

    const network = supportedNetworks[targetNetworkId as keyof typeof supportedNetworks];
    if (!network) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetNetworkId.toString(16)}` }]
      });
      setShowNetworkModal(false);
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added to MetaMask, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${targetNetworkId.toString(16)}`,
              chainName: network.name,
              nativeCurrency: {
                name: network.symbol,
                symbol: network.symbol,
                decimals: 18
              },
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.blockExplorer]
            }]
          });
          setShowNetworkModal(false);
        } catch (addError) {
          console.error('添加网络失败:', addError);
        }
      } else {
        console.error('切换网络失败:', error);
      }
    }
  };

  const copyAddress = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address);
      // Show toast notification (implement with your toast system)
    }
  };

  const openInExplorer = () => {
    if (walletInfo) {
      const network = supportedNetworks[walletInfo.networkId as keyof typeof supportedNetworks];
      if (network) {
        window.open(`${network.blockExplorer}/address/${walletInfo.address}`, '_blank');
      }
    }
  };

  return (
    <div className="space-y-4">
      {!walletInfo ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Wallet className="w-5 h-5" />
              连接钱包
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isMetaMaskInstalled ? (
              <div className="text-center space-y-4">
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    需要安装 MetaMask 钱包才能使用 Web3 功能
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => window.open('https://metamask.io/download/', '_blank')}
                  className="w-full"
                >
                  安装 MetaMask
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={() => connectWallet(true)}
                  disabled={isConnecting}
                  className="w-full"
                  size="lg"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      连接中...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      连接 MetaMask
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  连接钱包后可享受完整的 Web3 功能
                </p>
              </div>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                已连接钱包
              </CardTitle>
              <Badge variant="outline" className="flex items-center gap-1">
                <Network className="w-3 h-3" />
                {walletInfo.networkName}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 钱包地址 */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">钱包地址</p>
                  <p className="font-mono text-sm">
                    {`${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="p-1 h-6 w-6"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openInExplorer}
                    className="p-1 h-6 w-6"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* 余额信息 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">
                  {supportedNetworks[walletInfo.networkId as keyof typeof supportedNetworks].symbol}
                </p>
                <p className="font-bold">{walletInfo.balance.native}</p>
              </div>
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">AZI</p>
                <p className="font-bold text-primary">{walletInfo.balance.azi}</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">幸运值</p>
                <p className="font-bold text-amber-600">{walletInfo.balance.luck}</p>
              </div>
            </div>

            {/* 用户统计 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Shield className="w-3 h-3 text-blue-600" />
                  <p className="text-xs text-muted-foreground">NFT收藏</p>
                </div>
                <p className="font-bold text-blue-600">{walletInfo.nftCount}</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-3 h-3 text-purple-600" />
                  <p className="text-xs text-muted-foreground">信誉分数</p>
                </div>
                <p className="font-bold text-purple-600">{walletInfo.reputation.toFixed(1)}</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="w-full"
            >
              断开连接
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 网络切换模态框 */}
      <AnimatePresence>
        {showNetworkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNetworkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    不支持的网络
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    请切换到支持的网络以使用互助功能
                  </p>
                </div>

                <div className="space-y-2">
                  {Object.entries(supportedNetworks).map(([networkId, network]) => (
                    <Button
                      key={networkId}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => switchNetwork(parseInt(networkId))}
                    >
                      <Network className="w-4 h-4 mr-2" />
                      {network.name}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setShowNetworkModal(false)}
                  className="w-full"
                >
                  取消
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}