'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Wallet, Copy, CheckCircle, ExternalLink, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { DualAuthManager, type Web3User } from '@/lib/dual-auth-system'

interface Web3UserProfileProps {
  user: Web3User
}

export default function Web3UserProfile({ user }: Web3UserProfileProps) {
  const [copied, setCopied] = useState(false)

  const copyWalletAddress = async () => {
    try {
      await navigator.clipboard.writeText(user.wallet_address)
      setCopied(true)
      toast.success('钱包地址已复制')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('复制失败')
    }
  }

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const openInBSCScan = () => {
    window.open(`https://bscscan.com/address/${user.wallet_address}`, '_blank')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Wallet className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {user.username}
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                  Web3用户
                </Badge>
              </CardTitle>
              <CardDescription>
                去中心化身份认证
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 钱包信息 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            钱包信息
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <div className="text-sm font-medium">钱包地址</div>
                <div className="font-mono text-xs text-muted-foreground mt-1">
                  {user.wallet_address}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyWalletAddress}
                  className="h-8 w-8 p-0"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openInBSCScan}
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium">网络</div>
                <div className="text-sm text-muted-foreground mt-1">BSC Mainnet</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium">绑定时间</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {formatDate(user.wallet_bound_at)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* 账户信息 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            账户信息
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">用户ID</span>
              <span className="text-sm font-mono text-muted-foreground">
                {user.id.slice(0, 8)}...
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">创建时间</span>
              <span className="text-sm text-muted-foreground">
                {formatDate(user.created_at)}
              </span>
            </div>

            {user.email && (
              <div className="flex items-center justify-between">
                <span className="text-sm">通知邮箱</span>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Web3特性 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Web3特性
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <div className="text-sm font-medium">去中心化身份</div>
                <div className="text-xs text-muted-foreground">
                  基于区块链的身份验证
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-sm font-medium">免密码登录</div>
                <div className="text-xs text-muted-foreground">
                  使用钱包签名验证身份
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <div className="text-sm font-medium">数据主权</div>
                <div className="text-xs text-muted-foreground">
                  完全控制您的数字身份
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 