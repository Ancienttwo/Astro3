"use client"

import { useState, useEffect } from 'react'

interface Web3User {
  wallet_address: string
  auth_method: 'walletconnect' | 'web3_jwt'
  username?: string
  auth_token?: string
}

interface UseWeb3UserReturn {
  isWeb3User: boolean
  web3User: Web3User | null
  isLoading: boolean
}

export function useWeb3User(): UseWeb3UserReturn {
  const [isWeb3User, setIsWeb3User] = useState(false)
  const [web3User, setWeb3User] = useState<Web3User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    const checkWeb3User = () => {
      try {
        // 优先检查WalletConnect认证
        const walletConnectAuth = localStorage.getItem('walletconnect_auth')
        const currentUser = localStorage.getItem('current_user')
        
        if (walletConnectAuth && currentUser) {
          const authData = JSON.parse(walletConnectAuth)
          const userData = JSON.parse(currentUser)
          
          if (authData.auth_token && userData.wallet_address && userData.auth_method === 'walletconnect') {
            setIsWeb3User(true)
            setWeb3User({
              wallet_address: userData.wallet_address,
              auth_method: 'walletconnect',
              username: userData.username,
              auth_token: authData.auth_token
            })
            setIsLoading(false)
            return
          }
        }

        // 回退到传统Web3认证
        const web3Auth = localStorage.getItem('web3_auth')
        
        if (web3Auth && currentUser) {
          const authData = JSON.parse(web3Auth)
          const userData = JSON.parse(currentUser)
          
          if (authData.auth_token && userData.wallet_address) {
            setIsWeb3User(true)
            setWeb3User({
              wallet_address: userData.wallet_address,
              auth_method: userData.auth_method || 'web3_jwt',
              username: userData.username,
              auth_token: authData.auth_token
            })
            setIsLoading(false)
            return
          }
        }

        // 检查是否有Supabase认证（Web2用户）
        const possibleKeys = [
          'sb-localhost-auth-token',
          'sb-astrozi-auth-token', 
          'sb-fbtumedqykpgichytumn-auth-token'
        ]
        
        let hasSupabaseAuth = false
        for (const key of possibleKeys) {
          const supabaseAuth = localStorage.getItem(key)
          if (supabaseAuth) {
            try {
              const authData = JSON.parse(supabaseAuth)
              if (authData && authData.access_token) {
                hasSupabaseAuth = true
                break
              }
            } catch (e) {
              // Continue checking other keys
            }
          }
        }

        // 如果有Supabase认证但没有Web3认证，说明是Web2用户
        if (hasSupabaseAuth) {
          setIsWeb3User(false)
          setWeb3User(null)
        } else {
          // 没有任何认证
          setIsWeb3User(false)
          setWeb3User(null)
        }
      } catch (error) {
        console.error('检查Web3用户状态失败:', error)
        setIsWeb3User(false)
        setWeb3User(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkWeb3User()

    // 监听localStorage变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'walletconnect_auth' || e.key === 'web3_auth' || e.key === 'current_user') {
        checkWeb3User()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return {
    isWeb3User,
    web3User,
    isLoading
  }
}