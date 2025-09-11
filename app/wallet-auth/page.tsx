"use client"

import dynamic from 'next/dynamic'

const WalletConnectAuth = dynamic(() => import('@/components/WalletConnectAuth'), { ssr: false })

export default function WalletAuthPage() {
  return <WalletConnectAuth />
}
