'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api-client'

// 导入翻译管理组件
import TranslationManagement from '@/components/TranslationManagement'

export default function AdminManagementPage() {
  const [userEmail, setUserEmail] = useState('doraable3@gmail.com')
  const [reportCredits, setReportCredits] = useState(0)
  const [chatbotCredits, setChatbotCredits] = useState(0)
  const [reason, setReason] = useState('')
  const [activityName, setActivityName] = useState('管理员手动添加')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const addCredits = async () => {
    setLoading(true)
    setMessage('')

    try {
      // 获取session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setMessage('❌ 请先登录')
        return
      }

      if (!reportCredits && !chatbotCredits) {
        setMessage('❌ 报告次数和Chatbot次数至少要填写一个')
        return
      }

      console.log('🔍 开始为用户添加积分:', {
        userEmail,
        reportCredits,
        chatbotCredits,
        reason,
        activityName
      })

      // 调用管理员API
      const response = await apiClient.post('/api/admin/grant-credits', {
        userEmails: [userEmail],
        reportCredits: reportCredits || 0,
        chatbotCredits: chatbotCredits || 0,
        reason: reason || '管理员手动添加次数',
        activityName: activityName || '管理员操作'
      })
      
      if (response.success) {
        setMessage(`✅ 成功！${response.data.message}`)
        // 清空表单
        setReportCredits(0)
        setChatbotCredits(0)
        setReason('')
      } else {
        setMessage(`❌ 失败：${response.data?.error}`)
      }

    } catch (error) {
      console.error('添加积分失败:', error)
      setMessage(`❌ 操作失败: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 管理员控制台
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="credits" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credits">用户积分管理</TabsTrigger>
              <TabsTrigger value="translations">翻译系统管理</TabsTrigger>
            </TabsList>
            
            <TabsContent value="credits" className="space-y-6">
              <div className="space-y-6">
                {/* 用户信息 */}
                <div className="space-y-2">
                  <Label htmlFor="userEmail">用户邮箱</Label>
                  <Input
                    id="userEmail"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="输入用户邮箱"
                  />
                </div>

                <Separator />

                {/* 次数设置 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportCredits">AI分析报告次数</Label>
                    <Input
                      id="reportCredits"
                      type="number"
                      min="0"
                      value={reportCredits}
                      onChange={(e) => setReportCredits(Number(e.target.value))}
                      placeholder="0"
                    />
                    <p className="text-sm text-muted-foreground">
                      用于用神大师、铁口直断等AI分析
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="chatbotCredits">Chatbot对话次数</Label>
                    <Input
                      id="chatbotCredits"
                      type="number"
                      min="0"
                      value={chatbotCredits}
                      onChange={(e) => setChatbotCredits(Number(e.target.value))}
                      placeholder="0"
                    />
                    <p className="text-sm text-muted-foreground">
                      用于司天监正·星玄大人、玄虚道人对话
                    </p>
                  </div>
                </div>

                <Separator />

                {/* 备注信息 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="activityName">活动名称</Label>
                    <Input
                      id="activityName"
                      value={activityName}
                      onChange={(e) => setActivityName(e.target.value)}
                      placeholder="例如：新用户奖励、活动补偿等"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reason">备注说明</Label>
                    <Input
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="添加次数的原因或说明"
                    />
                  </div>
                </div>

                {/* 操作按钮 */}
                <Button 
                  onClick={addCredits} 
                  disabled={loading || (!reportCredits && !chatbotCredits)}
                  className="w-full"
                >
                  {loading ? '处理中...' : '添加次数'}
                </Button>

                {/* 结果显示 */}
                {message && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap">{message}</pre>
                  </div>
                )}

                {/* 使用说明 */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">使用说明</h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• 管理员权限：只有配置在ADMIN_EMAILS中的邮箱才能使用此功能</li>
                    <li>• 次数类型：可以单独添加报告次数或Chatbot次数，也可以同时添加</li>
                    <li>• 记录追踪：所有操作都会记录在credit_grants表中，方便审计</li>
                    <li>• 立即生效：添加的次数会立即在用户账户中生效</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="translations" className="space-y-6">
              <TranslationManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 