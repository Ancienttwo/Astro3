"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, Plus, BarChart3 } from 'lucide-react'

interface RegistrationCodeStats {
  total: number
  used: number
  unused: number
  expired: number
  batches: number
}

interface GenerateFormData {
  count: number
  batchName: string
  description: string
  expiresAt: string
}

export default function RegistrationCodeManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState<RegistrationCodeStats | null>(null)
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])
  
  const [formData, setFormData] = useState<GenerateFormData>({
    count: 10,
    batchName: '',
    description: '',
    expiresAt: ''
  })

  // 获取统计信息
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/registration-codes-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setStats(result.data)
      }
    } catch (error) {
      console.error('获取统计失败:', error)
    }
  }

  // 生成注册码
  const handleGenerate = async () => {
    if (!formData.batchName || !formData.expiresAt) {
      setError('请填写批次名称和过期时间')
      return
    }

    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/create-registration-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setMessage(`成功生成 ${result.data.count} 个注册码`)
        setGeneratedCodes(result.data.codes)
        
        // 重置表单
        setFormData({
          count: 10,
          batchName: '',
          description: '',
          expiresAt: ''
        })
        
        // 刷新统计
        fetchStats()
      } else {
        setError(result.error || '生成失败')
      }
    } catch (error) {
      setError('生成失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 下载注册码
  const handleDownload = () => {
    if (generatedCodes.length === 0) return

    const content = generatedCodes.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `registration_codes_${formData.batchName}_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Plus className="w-5 h-5" />
        <h2 className="text-xl font-bold">注册码管理</h2>
      </div>

      {/* 统计信息 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-muted-foreground">总数</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.used}</div>
                <div className="text-sm text-muted-foreground">已使用</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.unused}</div>
                <div className="text-sm text-muted-foreground">未使用</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
                <div className="text-sm text-muted-foreground">已过期</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.batches}</div>
                <div className="text-sm text-muted-foreground">批次数</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 生成表单 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            生成注册码
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="count">生成数量</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="1000"
                value={formData.count}
                onChange={(e) => setFormData({...formData, count: parseInt(e.target.value) || 1})}
              />
            </div>
            <div>
              <Label htmlFor="batchName">批次名称</Label>
              <Input
                id="batchName"
                placeholder="例如：2024年1月批次"
                value={formData.batchName}
                onChange={(e) => setFormData({...formData, batchName: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">描述（可选）</Label>
            <Textarea
              id="description"
              placeholder="注册码用途描述"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="expiresAt">过期时间</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleGenerate} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '生成中...' : '生成注册码'}
          </Button>
        </CardContent>
      </Card>

      {/* 生成结果 */}
      {generatedCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                生成结果
              </span>
              <Button onClick={handleDownload} size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                下载
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                成功生成 {generatedCodes.length} 个注册码：
              </p>
              <div className="max-h-40 overflow-y-auto bg-muted/30 p-3 rounded">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {generatedCodes.map((code, index) => (
                    <Badge key={index} variant="secondary" className="font-mono">
                      {code}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 