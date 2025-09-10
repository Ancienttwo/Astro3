/**
 * WalletConnect + Supabase JWT 集成配置
 * 基于 EIP-4361 (Sign-In with Ethereum) 标准
 * 提供成熟的 Web3 认证解决方案
 */

import { WalletConnectModal } from '@walletconnect/modal'
import { SignClient } from '@walletconnect/sign-client'
import { SessionTypes } from '@walletconnect/types'
import { ethers } from 'ethers'

// 扩展 Window 对象类型
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      isOkxWallet?: boolean
      isCoinbaseWallet?: boolean
      isTrust?: boolean
      request: (request: { method: string; params?: any[] }) => Promise<any>
    }
    okxwallet?: {
      request: (request: { method: string; params?: any[] }) => Promise<any>
    }
    BinanceChain?: any
  }
}

// WalletConnect 配置
const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '04309ed1007e77d1f119b85205bb779d' // 测试用ID

// 验证必需的环境变量
if (typeof window !== 'undefined' && !WALLET_CONNECT_PROJECT_ID) {
  console.error('❌ NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is required')
}

// 支持的链配置
const SUPPORTED_CHAINS = [
  'eip155:1',     // Ethereum Mainnet
  'eip155:137',   // Polygon
  'eip155:5',     // Goerli (测试网)
  'eip155:80001', // Mumbai (Polygon测试网)
]

const SUPPORTED_METHODS = [
  'eth_sendTransaction',
  'eth_signTransaction',
  'eth_sign',
  'personal_sign',
  'eth_signTypedData',
]

const SUPPORTED_EVENTS = [
  'chainChanged',
  'accountsChanged',
]

// WalletConnect 客户端实例
let signClient: InstanceType<typeof SignClient> | null = null
let wcModal: WalletConnectModal | null = null
let isInitializing = false
let initPromise: Promise<InstanceType<typeof SignClient>> | null = null

/**
 * 清理损坏的WalletConnect存储
 */
export const clearWalletConnectStorage = (): void => {
  try {
    if (typeof window !== 'undefined') {
      // 清理所有WalletConnect相关的localStorage项
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('wc@2') || key.startsWith('@walletconnect') || key.includes('walletconnect')) {
          localStorage.removeItem(key)
        }
      })
      
      // 清理IndexedDB中的WalletConnect数据
      if ('indexedDB' in window) {
        try {
          indexedDB.deleteDatabase('keyvaluestorage')
          indexedDB.deleteDatabase('WALLET_CONNECT_V2_INDEXED_DB')
        } catch (error) {
          console.warn('Failed to clear IndexedDB:', error)
        }
      }
      
      console.log('🧹 WalletConnect存储已清理')
    }
  } catch (error) {
    console.warn('清理WalletConnect存储时出错:', error)
  }
}

/**
 * 初始化 WalletConnect
 */
export const initWalletConnect = async (retryCount: number = 0): Promise<InstanceType<typeof SignClient>> => {
  try {
    // 如果已经有客户端实例，直接返回
    if (signClient) {
      return signClient
    }

    // 如果正在初始化，返回现有的Promise
    if (isInitializing && initPromise) {
      console.log('🔄 WalletConnect 正在初始化中，等待完成...')
      return initPromise
    }

    // 验证项目ID
    if (!WALLET_CONNECT_PROJECT_ID) {
      throw new Error('WalletConnect Project ID is required. Please set NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID in your environment variables.')
    }

    console.log('🔧 初始化 WalletConnect...', { 
      projectId: WALLET_CONNECT_PROJECT_ID.slice(0, 8) + '...',
      retry: retryCount 
    })

    // 设置初始化状态
    isInitializing = true
    
    // 创建初始化Promise
    initPromise = _initWalletConnectInternal(retryCount)
    
    const result = await initPromise
    
    // 重置状态
    isInitializing = false
    initPromise = null
    
    return result
  } catch (error) {
    // 重置状态
    isInitializing = false
    initPromise = null
    throw error
  }
}

const _initWalletConnectInternal = async (retryCount: number): Promise<InstanceType<typeof SignClient>> => {
  try {
    // 添加超时机制
    const initPromise = SignClient.init({
      projectId: WALLET_CONNECT_PROJECT_ID,
      metadata: {
        name: 'AstroZi',
        description: 'AI-Powered Chinese Astrology Assistant',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://astrozi.ai',
        icons: [
          typeof window !== 'undefined' 
            ? `${window.location.origin}/logo.png`
            : 'https://astrozi.ai/logo.png'
        ]
      },
      // 添加更多配置选项来避免初始化问题
      relayUrl: 'wss://relay.walletconnect.com',
      logger: 'silent' // 完全禁用日志输出以避免pino-pretty问题
    })

    // 添加15秒超时
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('WalletConnect initialization timeout after 15 seconds')), 15000)
    })

    signClient = await Promise.race([initPromise, timeoutPromise])

    // 清理所有旧的会话
    const sessions = signClient.session.getAll()
    if (sessions.length > 0) {
      console.log('🧹 清理旧的WalletConnect会话:', sessions.length)
      for (const session of sessions) {
        try {
          await signClient.disconnect({
            topic: session.topic,
            reason: {
              code: 6000,
              message: 'Cleaning up old sessions'
            }
          })
        } catch (cleanupError) {
          console.warn('清理会话失败:', cleanupError)
        }
      }
    }

    // 创建 Modal 增强配置，确保显示主流钱包
    wcModal = new WalletConnectModal({
      projectId: WALLET_CONNECT_PROJECT_ID,
      chains: SUPPORTED_CHAINS,
      themeMode: 'light',
      themeVariables: {
        '--wcm-accent-color': '#8B5CF6', // 紫色主题
        '--wcm-background-color': '#ffffff',
      },
      // 添加推荐钱包配置
      explorerRecommendedWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
        '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
        '163d2cf19babf05eb8962e9748f9ebe613ed52cc16211b0eae7c46f5c3d59997', // OKX Wallet
        'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
        'c286eebc742a537cd1d6818363e9dc53b21759a1e8e5d9b263d0c03ec7703576', // 1inch Wallet
        '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Ledger Live
        'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
        '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662', // Bitget Wallet
      ],
      // 启用钱包浏览器
      enableExplorer: true
    })

    console.log('✅ WalletConnect 初始化成功')
    return signClient
  } catch (error) {
    console.error('❌ WalletConnect 初始化失败:', error)
    
    // 如果是第一次失败，尝试清理存储后重试
    if (retryCount === 0) {
      console.log('🔄 清理存储后重试初始化...')
      clearWalletConnectStorage()
      signClient = null
      wcModal = null
      
      // 等待一小段时间再重试
      await new Promise(resolve => setTimeout(resolve, 1000))
      return _initWalletConnectInternal(1)
    }
    
    // 提供更具体的错误信息
    if (error instanceof Error) {
      if (error.message.includes('Project ID')) {
        throw new Error('WalletConnect configuration error: Invalid or missing Project ID')
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('WalletConnect network error: Please check your internet connection')
      } else if (error.message.includes('Invalid') || error.message.includes('restore')) {
        throw new Error('WalletConnect storage error: Please refresh the page')
      }
    }
    
    throw new Error(`WalletConnect initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 连接钱包
 */
export const connectWallet = async (): Promise<SessionTypes.Struct> => {
  try {
    if (!signClient) {
      throw new Error('WalletConnect 未初始化')
    }

    console.log('📱 打开钱包连接模态框...')

    // 创建连接配置 (使用 optionalNamespaces 替代已废弃的 requiredNamespaces)
    const { uri, approval } = await signClient.connect({
      optionalNamespaces: {
        eip155: {
          methods: SUPPORTED_METHODS,
          chains: SUPPORTED_CHAINS,
          events: SUPPORTED_EVENTS,
        },
      },
    })

    // 如果有 URI，打开模态框
    if (uri && wcModal) {
      wcModal.openModal({ uri })
    }

    // 等待批准
    const session = await approval()
    
    // 关闭模态框
    if (wcModal) {
      wcModal.closeModal()
    }

    console.log('✅ 钱包连接成功:', session)
    return session
  } catch (error) {
    console.error('❌ 钱包连接失败:', error)
    if (wcModal) {
      wcModal.closeModal()
    }
    throw error
  }
}

/**
 * 断开钱包连接
 */
export const disconnectWallet = async (session: SessionTypes.Struct): Promise<void> => {
  try {
    if (!signClient) {
      throw new Error('WalletConnect 未初始化')
    }

    await signClient.disconnect({
      topic: session.topic,
      reason: {
        code: 6000,
        message: 'User disconnected',
      },
    })

    console.log('✅ 钱包断开成功')
  } catch (error) {
    console.error('❌ 钱包断开失败:', error)
    throw error
  }
}

/**
 * 获取钱包地址
 */
export const getWalletAddress = (session: SessionTypes.Struct): string => {
  const accounts = session.namespaces.eip155?.accounts || []
  if (accounts.length === 0) {
    throw new Error('没有找到钱包地址')
  }
  
  // 从账户字符串中提取地址 (格式: "eip155:1:0x...")
  const address = accounts[0].split(':')[2]
  return address
}

/**
 * 获取链ID
 */
export const getChainId = (session: SessionTypes.Struct): number => {
  const accounts = session.namespaces.eip155?.accounts || []
  if (accounts.length === 0) {
    throw new Error('没有找到链信息')
  }
  
  // 从账户字符串中提取链ID (格式: "eip155:1:0x...")
  const chainId = parseInt(accounts[0].split(':')[1])
  return chainId
}

/**
 * 签名消息 (EIP-4361 兼容)
 */
export const signMessage = async (
  session: SessionTypes.Struct, 
  message: string
): Promise<string> => {
  try {
    if (!signClient) {
      throw new Error('WalletConnect 未初始化')
    }

    const address = getWalletAddress(session)
    const chainId = getChainId(session)

    console.log('✍️ 请求签名消息...', { address, chainId })

    const signature = await signClient.request({
      topic: session.topic,
      chainId: `eip155:${chainId}`,
      request: {
        method: 'personal_sign',
        params: [message, address],
      },
    })

    console.log('✅ 消息签名成功')
    return signature as string
  } catch (error) {
    console.error('❌ 消息签名失败:', error)
    throw error
  }
}

/**
 * 生成 EIP-4361 兼容的签名消息
 */
export const generateSIWEMessage = (params: {
  domain: string
  address: string
  chainId: number
  nonce: string
  issuedAt?: string
}): string => {
  const { domain, address, chainId, nonce, issuedAt = new Date().toISOString() } = params

  // 处理本地开发环境的URI
  const protocol = domain.includes('localhost') ? 'http' : 'https'
  const uri = `${protocol}://${domain}`
  
  const message = `${domain} wants you to sign in with your Ethereum account:
${address}

Welcome to AstroZi! Click to sign in and accept the Terms of Service.

URI: ${uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`

  return message
}

/**
 * 验证签名 (客户端验证)
 */
export const verifySignature = (
  message: string, 
  signature: string, 
  expectedAddress: string
): boolean => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature)
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
  } catch (error) {
    console.error('❌ 签名验证失败:', error)
    return false
  }
}

/**
 * 获取当前会话
 */
export const getCurrentSession = (): SessionTypes.Struct | null => {
  if (!signClient) {
    return null
  }

  const sessions = signClient.session.getAll()
  return sessions.length > 0 ? sessions[0] : null
}

/**
 * 监听会话事件
 */
export const setupSessionListeners = (callbacks: {
  onSessionDelete?: () => void
  onSessionUpdate?: (session: SessionTypes.Struct) => void
}) => {
  if (!signClient) {
    return
  }

  signClient.on('session_delete', () => {
    console.log('🔄 会话已删除')
    callbacks.onSessionDelete?.()
  })

  signClient.on('session_update', ({ topic, params }) => {
    console.log('🔄 会话已更新:', topic, params)
    const session = signClient?.session.get(topic)
    if (session) {
      callbacks.onSessionUpdate?.(session)
    }
  })
}

/**
 * 重置WalletConnect状态（用于清理和重新初始化）
 */
export const resetWalletConnect = (): void => {
  signClient = null
  wcModal = null
  isInitializing = false
  initPromise = null
  console.log('🔄 WalletConnect 状态已重置')
}

export { signClient, wcModal }