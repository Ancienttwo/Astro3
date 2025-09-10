'use client'

import WalletConnectAuth from '@/components/WalletConnectAuth'

export default function EnglishWalletAuthPage() {
  return (
    <WalletConnectAuth 
      onAuthSuccess={(user) => {
        console.log('✅ Web3认证成功:', user.email)
      }}
      onAuthError={(error) => {
        console.error('❌ Web3认证失败:', error.message)
      }}
    />
  )
}