'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Wallet,
  Download,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Smartphone,
  Monitor,
  Globe,
  Copy,
  Eye,
  EyeOff,
  ArrowRight,
  Gift,
  DollarSign,
  Clock,
  Users,
  Star,
  Coins,
  Link as LinkIcon,
  Settings,
  RefreshCw,
  HelpCircle
} from 'lucide-react'
import EnglishLayout from '@/components/EnglishLayout'

export default function WalletGuideePage() {
  const [activeStep, setActiveStep] = useState(1)
  const [showSeedPhrase, setShowSeedPhrase] = useState(false)

  const walletOptions = [
    {
      name: 'MetaMask',
      icon: '🦊',
      description: 'Most popular Web3 wallet with excellent BSC support',
      platforms: ['Browser Extension', 'Mobile App'],
      recommended: true,
      downloadUrl: 'https://metamask.io/download/',
      features: ['Easy BSC setup', 'Wide compatibility', 'Secure', 'User-friendly']
    },
    {
      name: 'Trust Wallet',
      icon: '🛡️',
      description: 'Mobile-first wallet with built-in DApp browser',
      platforms: ['Mobile App', 'Browser Extension'],
      recommended: false,
      downloadUrl: 'https://trustwallet.com/',
      features: ['Mobile-optimized', 'Built-in browser', 'Multi-chain', 'Staking support']
    },
    {
      name: 'Coinbase Wallet',
      icon: '💙',
      description: 'User-friendly wallet from Coinbase exchange',
      platforms: ['Mobile App', 'Browser Extension'],
      recommended: false,
      downloadUrl: 'https://wallet.coinbase.com/',
      features: ['Beginner-friendly', 'Exchange integration', 'Secure backup', 'DeFi access']
    }
  ]

  const setupSteps = [
    {
      id: 1,
      title: 'Choose & Download Wallet',
      description: 'Select and install a Web3 wallet that supports BSC',
      icon: Download,
      estimatedTime: '2-3 minutes'
    },
    {
      id: 2,
      title: 'Create New Wallet',
      description: 'Set up your wallet with a secure password and backup phrase',
      icon: Shield,
      estimatedTime: '5-7 minutes'
    },
    {
      id: 3,
      title: 'Add BSC Network',
      description: 'Configure Binance Smart Chain for AstroZi compatibility',
      icon: LinkIcon,
      estimatedTime: '2-3 minutes'
    },
    {
      id: 4,
      title: 'Get BNB for Fees',
      description: 'Add a small amount of BNB for transaction fees',
      icon: Coins,
      estimatedTime: '5-10 minutes'
    },
    {
      id: 5,
      title: 'Connect to AstroZi',
      description: 'Link your wallet to AstroZi and start earning rewards',
      icon: Zap,
      estimatedTime: '1-2 minutes'
    }
  ]

  const bscNetworkConfig = {
    networkName: 'Smart Chain',
    newRpcUrl: 'https://bsc-dataseed.binance.org/',
    chainId: '56',
    symbol: 'BNB',
    blockExplorerUrl: 'https://bscscan.com'
  }

  const benefits = [
    {
      icon: Gift,
      title: 'Airdrop Eligibility',
      description: 'Participate in future token distributions from AstroZi foundation'
    },
    {
      icon: Shield,
      title: 'Enhanced Security',
      description: 'Decentralized authentication with no passwords or personal data required'
    },
    {
      icon: DollarSign,
      title: 'Transparent Payments',
      description: 'All transactions on-chain, fully verifiable and transparent'
    },
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'One-click login with wallet signature, no forms to fill'
    },
    {
      icon: Users,
      title: 'Web3 Community',
      description: 'Join the growing community of Web3-enabled astrology enthusiasts'
    },
    {
      icon: Star,
      title: 'Exclusive Features',
      description: 'Access to Web3-only features and early platform updates'
    }
  ]

  const commonIssues = [
    {
      problem: 'Wallet won\'t connect',
      solutions: [
        'Make sure you\'re on BSC Mainnet (Chain ID: 56)',
        'Try refreshing the page and reconnecting',
        'Disable other wallet extensions temporarily',
        'Clear browser cache and cookies'
      ]
    },
    {
      problem: 'Transaction fails',
      solutions: [
        'Ensure you have enough BNB for gas fees (usually 0.0002 BNB)',
        'Check if BSC network is experiencing congestion',
        'Try increasing gas limit slightly',
        'Wait a few minutes and retry'
      ]
    },
    {
      problem: 'Can\'t see daily check-in button',
      solutions: [
        'Verify wallet is connected and on BSC Mainnet',
        'Refresh the page to reload Web3 components',
        'Check if you\'ve already checked in today',
        'Ensure you have a small amount of BNB for the transaction'
      ]
    }
  ]

  return (
    <EnglishLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        {/* Page Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-xl">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Web3 Wallet Setup Guide
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Complete step-by-step guide to set up your Web3 wallet and connect to AstroZi for enhanced security, 
                airdrops eligibility, and seamless astrology analysis experience.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Why Web3 Section */}
          <Card className="mb-12 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-gray-900 dark:text-white flex items-center justify-center">
                <Gift className="w-6 h-6 mr-2 text-purple-500" />
                Why Choose Web3 for AstroZi?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Setup Progress */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Setup Progress
            </h2>
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2 overflow-x-auto">
                {setupSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div 
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer transition-all ${
                        activeStep >= step.id 
                          ? 'bg-purple-500 border-purple-500 text-white' 
                          : 'border-gray-300 dark:border-slate-600 text-gray-500'
                      }`}
                      onClick={() => setActiveStep(step.id)}
                    >
                      {activeStep > step.id ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-bold">{step.id}</span>
                      )}
                    </div>
                    {index < setupSteps.length - 1 && (
                      <div className={`w-8 h-0.5 ${
                        activeStep > step.id ? 'bg-purple-500' : 'bg-gray-300 dark:bg-slate-600'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Choose Wallet */}
              {activeStep === 1 && (
                <Card className="dark:bg-slate-800 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                      <Download className="w-6 h-6 mr-2 text-purple-500" />
                      Step 1: Choose & Download Wallet
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-gray-600 dark:text-gray-300">
                      Select a Web3 wallet that supports Binance Smart Chain. We recommend MetaMask for beginners.
                    </p>
                    
                    <div className="space-y-4">
                      {walletOptions.map((wallet, index) => (
                        <Card key={index} className={`border-2 ${
                          wallet.recommended 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                            : 'border-gray-200 dark:border-slate-600'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <div className="text-2xl">{wallet.icon}</div>
                                <div>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                      {wallet.name}
                                    </h3>
                                    {wallet.recommended && (
                                      <Badge className="bg-purple-500 text-white text-xs">
                                        Recommended
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    {wallet.description}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {wallet.platforms.map((platform, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {platform}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {wallet.features.map((feature, idx) => (
                                      <span key={idx} className="text-xs text-gray-500 dark:text-gray-400">
                                        • {feature}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                className="bg-purple-500 hover:bg-purple-600 text-white"
                                onClick={() => window.open(wallet.downloadUrl, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Security Tip:</strong> Only download wallets from official websites. 
                        Never share your seed phrase or private keys with anyone.
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-end">
                      <Button 
                        onClick={() => setActiveStep(2)}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        Next: Create Wallet
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Create Wallet */}
              {activeStep === 2 && (
                <Card className="dark:bg-slate-800 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                      <Shield className="w-6 h-6 mr-2 text-purple-500" />
                      Step 2: Create New Wallet
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-gray-600 dark:text-gray-300">
                      Follow these steps to create a secure wallet. This process is similar across all wallet providers.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          1
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Open Your Wallet App/Extension</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Launch the wallet you downloaded and click "Create a new wallet"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          2
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Set a Strong Password</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Create a secure password with at least 12 characters, including uppercase, lowercase, numbers, and symbols
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          3
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Backup Your Seed Phrase</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            Write down your 12-word seed phrase in order. This is your wallet recovery key.
                          </p>
                          <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800 dark:text-red-200">
                              <strong>Critical:</strong> Store your seed phrase offline and securely. 
                              Anyone with these words can access your wallet. Never share them online.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          4
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Confirm Seed Phrase</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Most wallets will ask you to confirm your seed phrase by entering specific words
                          </p>
                        </div>
                      </div>
                    </div>

                    <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                          🔐 Security Best Practices
                        </h4>
                        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                          <li>• Write seed phrase on paper, never store digitally</li>
                          <li>• Keep multiple copies in different secure locations</li>
                          <li>• Never enter seed phrase on websites or apps</li>
                          <li>• Use a hardware wallet for large amounts</li>
                          <li>• Enable 2FA where available</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <div className="flex justify-between">
                      <Button 
                        variant="outline"
                        onClick={() => setActiveStep(1)}
                      >
                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                        Previous
                      </Button>
                      <Button 
                        onClick={() => setActiveStep(3)}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        Next: Add BSC Network
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Add BSC Network */}
              {activeStep === 3 && (
                <Card className="dark:bg-slate-800 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                      <LinkIcon className="w-6 h-6 mr-2 text-purple-500" />
                      Step 3: Add BSC Network
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-gray-600 dark:text-gray-300">
                      Configure Binance Smart Chain (BSC) network to use AstroZi's Web3 features.
                    </p>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Option 1: Automatic Setup (Recommended)</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        When you connect to AstroZi, we'll automatically prompt you to add BSC if it's not already configured.
                      </p>

                      <h4 className="font-semibold text-gray-900 dark:text-white">Option 2: Manual Setup</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Add BSC network manually using these settings:
                      </p>

                      <Card className="bg-gray-50 dark:bg-slate-700">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900 dark:text-white">Network Name:</span>
                              <div className="flex items-center space-x-2">
                                <code className="text-sm bg-white dark:bg-slate-600 px-2 py-1 rounded">
                                  {bscNetworkConfig.networkName}
                                </code>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => navigator.clipboard.writeText(bscNetworkConfig.networkName)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900 dark:text-white">New RPC URL:</span>
                              <div className="flex items-center space-x-2">
                                <code className="text-sm bg-white dark:bg-slate-600 px-2 py-1 rounded">
                                  {bscNetworkConfig.newRpcUrl}
                                </code>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => navigator.clipboard.writeText(bscNetworkConfig.newRpcUrl)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900 dark:text-white">Chain ID:</span>
                              <div className="flex items-center space-x-2">
                                <code className="text-sm bg-white dark:bg-slate-600 px-2 py-1 rounded">
                                  {bscNetworkConfig.chainId}
                                </code>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => navigator.clipboard.writeText(bscNetworkConfig.chainId)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900 dark:text-white">Symbol:</span>
                              <div className="flex items-center space-x-2">
                                <code className="text-sm bg-white dark:bg-slate-600 px-2 py-1 rounded">
                                  {bscNetworkConfig.symbol}
                                </code>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => navigator.clipboard.writeText(bscNetworkConfig.symbol)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900 dark:text-white">Block Explorer:</span>
                              <div className="flex items-center space-x-2">
                                <code className="text-sm bg-white dark:bg-slate-600 px-2 py-1 rounded">
                                  {bscNetworkConfig.blockExplorerUrl}
                                </code>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => navigator.clipboard.writeText(bscNetworkConfig.blockExplorerUrl)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-900 dark:text-white">Manual Setup Steps:</h5>
                        <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-decimal list-inside">
                          <li>Open your wallet and go to network settings</li>
                          <li>Click "Add Network" or "Custom RPC"</li>
                          <li>Enter the BSC network details above</li>
                          <li>Save and switch to BSC Mainnet</li>
                        </ol>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button 
                        variant="outline"
                        onClick={() => setActiveStep(2)}
                      >
                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                        Previous
                      </Button>
                      <Button 
                        onClick={() => setActiveStep(4)}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        Next: Get BNB
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Get BNB */}
              {activeStep === 4 && (
                <Card className="dark:bg-slate-800 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                      <Coins className="w-6 h-6 mr-2 text-purple-500" />
                      Step 4: Get BNB for Transaction Fees
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-gray-600 dark:text-gray-300">
                      You need a small amount of BNB to pay for transaction fees on Binance Smart Chain.
                    </p>

                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          How Much BNB Do I Need?
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          <li>• <strong>Daily Check-in:</strong> ~0.0002 BNB per transaction</li>
                          <li>• <strong>Subscription Payment:</strong> ~0.0005 BNB</li>
                          <li>• <strong>Recommended minimum:</strong> 0.005 BNB (~$1-2 USD)</li>
                          <li>• <strong>This covers:</strong> 20+ check-ins and multiple transactions</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Ways to Get BNB:</h4>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <Card className="border-l-4 border-l-yellow-500">
                          <CardContent className="p-4">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                              Option 1: Buy Directly (Easiest)
                            </h5>
                            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                              <li>• Use wallet's built-in purchase feature</li>
                              <li>• Buy with credit card or bank transfer</li>
                              <li>• Automatic BSC network selection</li>
                              <li>• Usually available in MetaMask, Trust Wallet</li>
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                              Option 2: Exchange Transfer
                            </h5>
                            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                              <li>• Buy BNB on Binance, KuCoin, etc.</li>
                              <li>• Withdraw to your wallet address</li>
                              <li>• Select BSC network for withdrawal</li>
                              <li>• Lower fees for larger amounts</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </div>

                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Important:</strong> When transferring BNB from an exchange, 
                          make sure to select "BSC" or "BEP20" network, not "BNB Beacon Chain" or "BEP2".
                        </AlertDescription>
                      </Alert>

                      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-4">
                          <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                            ✅ How to Verify You Have BNB
                          </h5>
                          <ol className="text-sm text-green-700 dark:text-green-300 space-y-1 list-decimal list-inside">
                            <li>Open your wallet and switch to BSC Mainnet</li>
                            <li>Check your balance - you should see BNB listed</li>
                            <li>If balance shows 0, wait a few minutes for the transaction to confirm</li>
                            <li>You can check transaction status on bscscan.com</li>
                          </ol>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex justify-between">
                      <Button 
                        variant="outline"
                        onClick={() => setActiveStep(3)}
                      >
                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                        Previous
                      </Button>
                      <Button 
                        onClick={() => setActiveStep(5)}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        Next: Connect to AstroZi
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 5: Connect to AstroZi */}
              {activeStep === 5 && (
                <Card className="dark:bg-slate-800 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                      <Zap className="w-6 h-6 mr-2 text-purple-500" />
                      Step 5: Connect to AstroZi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-gray-600 dark:text-gray-300">
                      Final step! Connect your wallet to AstroZi and start your Web3 astrology journey.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          1
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Visit AstroZi Authentication</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Go to the AstroZi homepage and click "🎁 Connect Wallet"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          2
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Authorize Wallet Connection</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Your wallet will prompt you to connect. Click "Connect" to authorize AstroZi access.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          3
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Sign Authentication Message</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Sign a message to prove wallet ownership. This is free and creates your AstroZi account.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          4
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Start Using AstroZi!</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Once connected, you can create charts, perform daily check-ins, and access all features.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center">
                          <Gift className="w-4 h-4 mr-2" />
                          What Happens After Connection?
                        </h4>
                        <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                          <li>• <strong>Account Created:</strong> Virtual email address created automatically</li>
                          <li>• <strong>Daily Check-ins:</strong> Start earning points and airdrop weight</li>
                          <li>• <strong>Full Access:</strong> Create charts, get AI analysis, use all features</li>
                          <li>• <strong>Web3 Benefits:</strong> Transparent payments, enhanced security</li>
                          <li>• <strong>Community:</strong> Join other Web3 astrology enthusiasts</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <div className="text-center">
                      <Button 
                        size="lg"
                        className="bg-purple-500 hover:bg-purple-600 text-white px-8"
                      >
                        <Wallet className="w-5 h-5 mr-2" />
                        Connect Your Wallet Now
                      </Button>
                    </div>

                    <div className="flex justify-start">
                      <Button 
                        variant="outline"
                        onClick={() => setActiveStep(4)}
                      >
                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                        Previous
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Current Step Info */}
              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    Current Step
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      {React.createElement(setupSteps[activeStep - 1].icon, { className: "w-5 h-5 text-purple-500" })}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {setupSteps[activeStep - 1].title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {setupSteps[activeStep - 1].description}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Estimated time: {setupSteps[activeStep - 1].estimatedTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step Navigation */}
              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    All Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {setupSteps.map((step) => (
                      <Button
                        key={step.id}
                        variant="ghost"
                        className={`w-full justify-start text-left h-auto p-3 ${
                          activeStep === step.id 
                            ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' 
                            : 'text-gray-600 dark:text-gray-300'
                        }`}
                        onClick={() => setActiveStep(step.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            activeStep >= step.id 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                          }`}>
                            {activeStep > step.id ? '✓' : step.id}
                          </div>
                          <span className="text-sm">{step.title}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Troubleshooting */}
              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      View FAQ
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Video Tutorials
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Common Issues Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Common Issues & Solutions
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {commonIssues.map((issue, index) => (
                <Card key={index} className="dark:bg-slate-800 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                      {issue.problem}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {issue.solutions.map((solution, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                          {solution}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </EnglishLayout>
  )
}