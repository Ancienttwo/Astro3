'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { checkFrontendPermission } from '@/lib/auth-config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, TrendingUp, Gift, Users, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import PromotionManager from '@/components/PromotionManager'

export default function OperationsManagerPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<'admin' | 'operator' | 'user' | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // 检查用户权限
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const result = await checkFrontendPermission('admin_or_operator')
        
        if (result.hasPermission) {
          setUserRole(result.userRole || null)
        } else {
          toast({
            title: '权限不足',
            description: result.error || '需要管理员或运营人员权限',
            variant: 'destructive'
          })
          setTimeout(() => router.push('/home'), 3000)
        }
        
      } catch (error) {
        console.error('权限检查失败:', error)
        toast({
          title: '权限检查失败',
          description: '请重新登录',
          variant: 'destructive'
        })
        setTimeout(() => router.push('/home'), 3000)
      } finally {
        setLoading(false)
      }
    }
    
    checkPermissions()
  }, [router, toast])

  // 权限检查中
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p>验证权限中...</p>
        </div>
      </div>
    )
  }

  // 权限不足
  if (!userRole || userRole === 'user') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
          <h1 className="text-2xl font-bold mb-4">权限不足</h1>
          <p className="mb-4">只有管理员和运营人员可以访问运营管理系统</p>
          <Button onClick={() => router.push('/home')} variant="outline" className="border-gray-900 dark:border-white text-gray-900 dark:text-white">
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                运营管理系统
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                管理兑换码活动和推荐奖励系统，监控运营数据，提升用户活跃度
              </p>
            </div>
            <div className="text-right">
              <Badge 
                variant={userRole === 'admin' ? 'default' : 'secondary'}
                className="text-sm px-3 py-1"
              >
                {userRole === 'admin' ? '👑 管理员' : '👥 运营人员'}
              </Badge>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {userRole === 'admin' 
                  ? '完全权限：可生成兑换码和查看数据分析' 
                  : '只读权限：仅可查看数据分析'
                }
              </p>
            </div>
          </div>
        </div>

        {/* 快速统计概览 */}
        {userRole && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">今日新增用户</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">--</p>
                  </div>
                  <Users className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">兑换码使用率</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">--</p>
                  </div>
                  <Gift className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">推荐转化率</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">--</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">活跃用户数</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">--</p>
                  </div>
                  <Activity className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 运营活动管理组件 */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Gift className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              运营活动管理
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {userRole === 'admin' 
                ? '管理兑换码活动和推荐奖励系统，查看运营数据分析'
                : '查看运营数据分析和活动效果统计'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PromotionManager />
          </CardContent>
        </Card>

        {/* 权限说明 */}
        <Card className="mt-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium mb-1">权限说明：</p>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>管理员</strong>：可以生成兑换码、查看完整数据分析、管理推荐系统</li>
                  <li>• <strong>运营人员</strong>：只能查看数据分析报告，不能生成兑换码</li>
                  <li>• <strong>普通用户</strong>：无法访问此页面</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 