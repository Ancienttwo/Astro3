'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Gift, Download, Copy, CheckCircle, XCircle, Settings, BarChart3, Shield, Key } from 'lucide-react';
import { toast } from 'sonner';
import AnalyticsManager from '@/components/AnalyticsManager';
import { getUserRole, type UserRole } from '@/lib/auth';
import RegistrationCodeManager from './RegistrationCodeManager'

interface GeneratedCode {
  id: number;
  code: string;
  credits: number;
  expire_date: string;
}

interface ActivityData {
  id: number;
  name: string;
  credits: number;
  expire_date: string;
}

interface GenerationResult {
  success: boolean;
  message: string;
  data?: {
    activity: ActivityData;
    codes: GeneratedCode[];
    summary: {
      requested: number;
      generated: number;
      failed: number;
      expireDays: number;
    };
  };
  error?: string;
  details?: string;
  timestamp: string;
}

export default function PromotionManager() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [formData, setFormData] = useState({
    activityName: '',
    credits: 5,
    quantity: 10,
    expireDays: 30,
    description: ''
  });

  // 获取用户角色
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const role = await getUserRole();
        setUserRole(role);
      } catch (error) {
        console.error('获取用户角色失败:', error);
        setUserRole('user');
      } finally {
        setIsLoadingRole(false);
      }
    };

    fetchUserRole();
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = async () => {
    // 表单验证
    if (!formData.activityName.trim()) {
      toast.error('请输入活动名称');
      return;
    }

    if (formData.credits <= 0 || formData.quantity <= 0 || formData.expireDays <= 0) {
      toast.error('次数、数量和有效期必须大于0');
      return;
    }

    if (formData.quantity > 1000) {
      toast.error('单次最多生成1000个兑换码');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/create-promo-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: GenerationResult = await response.json();
      setResult(data);

      if (data.success) {
        toast.success(`成功生成 ${data.data?.summary.generated} 个兑换码！`);
        // 清空表单
        setFormData({
          activityName: '',
          credits: 5,
          quantity: 10,
          expireDays: 30,
          description: ''
        });
      } else {
        toast.error(data.message || '生成失败');
      }

    } catch (error) {
      const errorResult: GenerationResult = {
        success: false,
        message: '网络错误',
        error: '请求失败',
        details: error instanceof Error ? error.message : '网络请求失败，请稍后重试',
        timestamp: new Date().toISOString()
      };
      setResult(errorResult);
      toast.error('网络请求失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  const copyAllCodes = () => {
    if (!result?.data?.codes) return;
    
    const codesText = result.data.codes.map(code => code.code).join('\n');
    navigator.clipboard.writeText(codesText);
    toast.success(`已复制 ${result.data.codes.length} 个兑换码`);
  };

  const downloadCodes = () => {
    if (!result?.data?.codes) return;

    const csvContent = [
      '兑换码,次数,过期时间,活动名称',
      ...result.data.codes.map(code => 
        `${code.code},${code.credits},${new Date(code.expire_date).toLocaleString()},${result.data!.activity.name}`
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `兑换码_${result.data.activity.name}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('兑换码已导出到CSV文件');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 权限检查加载中
  if (isLoadingRole) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-muted-foreground">检查权限中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 权限不足
  if (userRole === 'user') {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">权限不足</h3>
              <p className="text-muted-foreground">
                只有管理员和运营人员可以访问运营管理功能
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 根据角色确定可用的标签页
  const getAvailableTabs = () => {
    const tabs = [
      { value: 'analytics', label: '数据分析', icon: BarChart3, description: '查看运营数据统计' }
    ];

    // 只有管理员可以生成兑换码和激活码
    if (userRole === 'admin') {
      tabs.unshift(
        { value: 'generate', label: '生成兑换码', icon: Plus, description: '创建和管理兑换码活动' },
        { value: 'activation', label: '激活码管理', icon: Key, description: '管理内测激活码' }
      );
    }

    return tabs;
  };

  const availableTabs = getAvailableTabs();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                运营活动管理
              </CardTitle>
              <CardDescription>
                {userRole === 'admin' ? '管理兑换码活动和查看运营数据' : '查看运营活动数据分析'}
              </CardDescription>
            </div>
            <Badge variant={userRole === 'admin' ? 'default' : 'secondary'}>
              {userRole === 'admin' ? '管理员' : '运营人员'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue={availableTabs[0]?.value || 'analytics'} className="space-y-6">
        <TabsList className={`grid w-full ${availableTabs.length === 1 ? 'grid-cols-1' : availableTabs.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {availableTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* 数据分析标签页 */}
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsManager />
        </TabsContent>

        {/* 生成兑换码标签页（仅管理员） */}
        {userRole === 'admin' && (
          <TabsContent value="generate" className="space-y-6">
          {/* 生成表单 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-500" />
                创建新活动
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activityName">活动名称 *</Label>
                  <Input
                    id="activityName"
                    placeholder="例如：新年福利活动"
                    value={formData.activityName}
                    onChange={(e) => handleInputChange('activityName', e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">每码次数 *</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.credits}
                    onChange={(e) => handleInputChange('credits', parseInt(e.target.value) || 1)}
                    disabled={isGenerating}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">生成数量 *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-muted-foreground">最多生成1000个</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expireDays">有效期(天) *</Label>
                  <Input
                    id="expireDays"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.expireDays}
                    onChange={(e) => handleInputChange('expireDays', parseInt(e.target.value) || 1)}
                    disabled={isGenerating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">活动描述</Label>
                <Textarea
                  id="description"
                  placeholder="活动详细描述（可选）"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={isGenerating}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-1">
                  <p className="text-sm font-medium">预览</p>
                  <p className="text-xs text-muted-foreground">
                    将生成 {formData.quantity} 个兑换码，每个可兑换 {formData.credits} 次免费分析，
                    有效期至 {new Date(Date.now() + formData.expireDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !formData.activityName.trim()}
                  className="min-w-32"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      生成兑换码
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 生成结果 */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  生成结果
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.success ? (
                  <div className="space-y-4">
                    {/* 成功信息 */}
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <div className="space-y-2">
                          <div className="font-medium">{result.message}</div>
                          {result.data && (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>活动: {result.data.activity.name}</div>
                              <div>单码次数: {result.data.activity.credits}</div>
                              <div>生成数量: {result.data.summary.generated}/{result.data.summary.requested}</div>
                              <div>过期时间: {formatDate(result.data.activity.expire_date)}</div>
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>

                    {/* 操作按钮 */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyAllCodes}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        复制所有码
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={downloadCodes}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        导出CSV
                      </Button>
                    </div>

                    {/* 兑换码列表 */}
                    {result.data?.codes && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">生成的兑换码</h4>
                          <Badge variant="secondary">
                            {result.data.codes.length} 个
                          </Badge>
                        </div>
                        <div className="max-h-60 overflow-y-auto border rounded-lg">
                          <div className="grid gap-1 p-2">
                            {result.data.codes.map((code, index) => (
                              <div 
                                key={code.id} 
                                className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm hover:bg-gray-100"
                              >
                                <span className="font-mono font-medium">{code.code}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyCode(code.code)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <div className="space-y-2">
                        <div className="font-medium">{result.message}</div>
                        {result.details && (
                          <div className="text-sm">{result.details}</div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
          </TabsContent>
        )}

        {/* 激活码管理标签页（仅管理员） */}
        {userRole === 'admin' && (
          <TabsContent value="activation" className="space-y-6">
            <RegistrationCodeManager />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 