'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet, ExternalLink, Copy, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ethers } from 'ethers';

// 合约配置
const CONTRACT_ADDRESS = '0x3b016F5A7C462Fe51B691Ef18559DE720D9B452F';
const BSC_MAINNET_CONFIG = {
  chainId: '0x38', // 56 in hex
  chainName: 'BSC Mainnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed1.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
};

interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  isConnected: boolean;
}

interface Web3WalletConnectorProps {
  onWalletConnect?: (walletInfo: WalletInfo) => void;
  onWalletDisconnect?: () => void;
}

export default function Web3WalletConnector({ 
  onWalletConnect, 
  onWalletDisconnect 
}: Web3WalletConnectorProps) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkWalletConnection();
    setupEventListeners();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const setupEventListeners = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  const handleChainChanged = (chainId: string) => {
    window.location.reload();
  };

  const isMetaMaskInstalled = (): boolean => {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           window.ethereum.isMetaMask;
  };

  const addBSCMainnet = async (): Promise<boolean> => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [BSC_MAINNET_CONFIG],
      });
      return true;
    } catch (error) {
      console.error('Error adding BSC Mainnet:', error);
      return false;
    }
  };

  const switchToBSCMainnet = async (): Promise<boolean> => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_MAINNET_CONFIG.chainId }],
      });
      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, try to add it
        return await addBSCMainnet();
      }
      console.error('Error switching to BSC Mainnet:', error);
      return false;
    }
  };

  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Create provider
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);

      // Get network and balance
      const network = await web3Provider.getNetwork();
      const signer = await web3Provider.getSigner();
      const address = await signer.getAddress();
      const balance = await web3Provider.getBalance(address);

      // Check if on BSC Mainnet
      if (Number(network.chainId) !== 56) {
        const switched = await switchToBSCMainnet();
        if (!switched) {
          throw new Error('Please switch to BSC Mainnet');
        }
        // Retry after switching
        return await connectWallet();
      }

      const walletData: WalletInfo = {
        address,
        balance: ethers.formatEther(balance),
        chainId: Number(network.chainId),
        isConnected: true,
      };

      setWalletInfo(walletData);
      
      if (onWalletConnect) {
        onWalletConnect(walletData);
      }

      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });

    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletInfo(null);
    setProvider(null);
    
    if (onWalletDisconnect) {
      onWalletDisconnect();
    }

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const copyAddress = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const openInExplorer = () => {
    if (walletInfo?.address) {
      window.open(`https://bscscan.com/address/${walletInfo.address}`, '_blank');
    }
  };

  const getNetworkBadge = () => {
    if (!walletInfo) return null;
    
    if (walletInfo.chainId === 56) {
      return (
        <Badge className="bg-green-500 text-white">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          BSC Mainnet
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Wrong Network
        </Badge>
      );
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isMetaMaskInstalled()) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">MetaMask Required</h3>
          <p className="text-gray-600 mb-4">
            Please install MetaMask to connect your wallet and participate in Web3 features.
          </p>
          <Button 
            onClick={() => window.open('https://metamask.io/download/', '_blank')}
            className="w-full"
          >
            Install MetaMask
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!walletInfo) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600 mb-4">
            Connect your MetaMask wallet to participate in Web3 sign-in and earn points.
          </p>
          <Button 
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Connected
          </span>
          {getNetworkBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Address:</span>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                {formatAddress(walletInfo.address)}
              </code>
              <Button variant="ghost" size="sm" onClick={copyAddress}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={openInExplorer}>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Balance:</span>
            <span className="font-medium">
              {parseFloat(walletInfo.balance).toFixed(4)} BNB
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Network:</span>
            <span className="text-sm">
              {walletInfo.chainId === 56 ? 'BSC Mainnet' : `Chain ID: ${walletInfo.chainId}`}
            </span>
          </div>
        </div>

        {walletInfo.chainId !== 56 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700 mb-2">
              Please switch to BSC Mainnet to use Web3 features.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={switchToBSCMainnet}
              className="w-full"
            >
              Switch to BSC Mainnet
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={disconnectWallet}
            className="flex-1"
          >
            Disconnect
          </Button>
          {walletInfo.chainId === 56 && (
            <Button 
              onClick={() => window.open(`https://pancakeswap.finance/swap`, '_blank')}
              variant="outline"
              className="flex-1"
            >
              Get BNB
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}