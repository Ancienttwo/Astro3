'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  Database,
  Camera,
  Calendar,
  Users,
  TrendingUp,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportFilters {
  minWeight: number;
  snapshotDate: string;
  includeDetails: boolean;
  limit: number;
}

interface SnapshotData {
  snapshotName: string;
  airdropPoolSize: number;
  minWeight: number;
  description: string;
}

export default function PointsExportManager() {
  const [loading, setLoading] = useState(false);
  const [exportFilters, setExportFilters] = useState<ExportFilters>({
    minWeight: 0,
    snapshotDate: '',
    includeDetails: false,
    limit: 10000
  });
  const [snapshotData, setSnapshotData] = useState<SnapshotData>({
    snapshotName: '',
    airdropPoolSize: 10000000,
    minWeight: 0,
    description: ''
  });
  const [previewData, setPreviewData] = useState<any>(null);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // 设置默认快照名称
    const today = new Date().toISOString().split('T')[0];
    setSnapshotData(prev => ({
      ...prev,
      snapshotName: `airdrop_snapshot_${today}`
    }));
  }, []);

  // 预览数据
  const handlePreview = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        format: 'json',
        min_weight: exportFilters.minWeight.toString(),
        details: exportFilters.includeDetails.toString(),
        limit: Math.min(exportFilters.limit, 100).toString() // 预览限制100条
      });

      if (exportFilters.snapshotDate) {
        params.append('snapshot_date', exportFilters.snapshotDate);
      }

      const response = await fetch(`/api/admin/points/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch preview data');
      }

      const result = await response.json();
      setPreviewData(result.data);

      toast({
        title: "预览成功",
        description: `显示前${result.data.users.length}条记录`,
      });

    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: "预览失败",
        description: "获取预览数据时发生错误",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 导出CSV
  const handleExportCSV = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        format: 'csv',
        min_weight: exportFilters.minWeight.toString(),
        details: exportFilters.includeDetails.toString(),
        limit: exportFilters.limit.toString()
      });

      if (exportFilters.snapshotDate) {
        params.append('snapshot_date', exportFilters.snapshotDate);
      }

      const response = await fetch(`/api/admin/points/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `airdrop_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "导出成功",
        description: "CSV文件已下载",
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "导出失败",
        description: "导出CSV时发生错误",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 导出JSON
  const handleExportJSON = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        format: 'json',
        min_weight: exportFilters.minWeight.toString(),
        details: exportFilters.includeDetails.toString(),
        limit: exportFilters.limit.toString()
      });

      if (exportFilters.snapshotDate) {
        params.append('snapshot_date', exportFilters.snapshotDate);
      }

      const response = await fetch(`/api/admin/points/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export JSON');
      }

      const result = await response.json();
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { 
        type: 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `airdrop_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "导出成功",
        description: "JSON文件已下载",
      });

    } catch (error) {
      console.error('Export JSON error:', error);
      toast({
        title: "导出失败",
        description: "导出JSON时发生错误",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 创建快照
  const handleCreateSnapshot = async () => {
    if (!snapshotData.snapshotName) {
      toast({
        title: "错误",
        description: "请输入快照名称",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/points/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(snapshotData)
      });

      if (!response.ok) {
        throw new Error('Failed to create snapshot');
      }

      const result = await response.json();

      toast({
        title: "快照创建成功",
        description: `快照 "${snapshotData.snapshotName}" 已创建，包含 ${result.data.summary.total_eligible_users} 个用户`,
      });

      // 重置表单
      const today = new Date().toISOString().split('T')[0];
      setSnapshotData({
        snapshotName: `airdrop_snapshot_${today}_2`,
        airdropPoolSize: 10000000,
        minWeight: 0,
        description: ''
      });

    } catch (error) {
      console.error('Create snapshot error:', error);
      toast({
        title: "创建快照失败",
        description: "创建快照时发生错误",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">积分导出管理</h1>
          <p className="text-gray-600 mt-1">导出空投资格数据，用于运营公告和快照管理</p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          管理员工具
        </Badge>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            数据导出
          </TabsTrigger>
          <TabsTrigger value="snapshot" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            创建快照
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            数据预览
          </TabsTrigger>
        </TabsList>

        {/* 数据导出 */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                导出筛选条件
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minWeight">最小权重</Label>
                  <Input
                    id="minWeight"
                    type="number"
                    step="0.1"
                    value={exportFilters.minWeight}
                    onChange={(e) => setExportFilters(prev => ({
                      ...prev,
                      minWeight: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">只导出权重大于此值的用户</p>
                </div>

                <div>
                  <Label htmlFor="limit">导出数量限制</Label>
                  <Input
                    id="limit"
                    type="number"
                    value={exportFilters.limit}
                    onChange={(e) => setExportFilters(prev => ({
                      ...prev,
                      limit: parseInt(e.target.value) || 10000
                    }))}
                    placeholder="10000"
                  />
                  <p className="text-xs text-gray-500 mt-1">最多导出的用户数量</p>
                </div>

                <div>
                  <Label htmlFor="snapshotDate">快照日期 (可选)</Label>
                  <Input
                    id="snapshotDate"
                    type="date"
                    value={exportFilters.snapshotDate}
                    onChange={(e) => setExportFilters(prev => ({
                      ...prev,
                      snapshotDate: e.target.value
                    }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">留空则使用最新数据</p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeDetails"
                    checked={exportFilters.includeDetails}
                    onChange={(e) => setExportFilters(prev => ({
                      ...prev,
                      includeDetails: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <Label htmlFor="includeDetails">包含详细信息</Label>
                  <p className="text-xs text-gray-500">包含签到统计等详细数据</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handlePreview}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {loading ? '加载中...' : '预览数据'}
            </Button>

            <Button 
              onClick={handleExportCSV}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {loading ? '导出中...' : '导出 CSV'}
            </Button>

            <Button 
              onClick={handleExportJSON}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              {loading ? '导出中...' : '导出 JSON'}
            </Button>
          </div>
        </TabsContent>

        {/* 创建快照 */}
        <TabsContent value="snapshot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                创建空投快照
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="snapshotName">快照名称</Label>
                <Input
                  id="snapshotName"
                  value={snapshotData.snapshotName}
                  onChange={(e) => setSnapshotData(prev => ({
                    ...prev,
                    snapshotName: e.target.value
                  }))}
                  placeholder="airdrop_snapshot_2025_01_14"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="airdropPoolSize">空投池大小 (AZI)</Label>
                  <Input
                    id="airdropPoolSize"
                    type="number"
                    value={snapshotData.airdropPoolSize}
                    onChange={(e) => setSnapshotData(prev => ({
                      ...prev,
                      airdropPoolSize: parseInt(e.target.value) || 10000000
                    }))}
                    placeholder="10000000"
                  />
                </div>

                <div>
                  <Label htmlFor="snapshotMinWeight">最小权重要求</Label>
                  <Input
                    id="snapshotMinWeight"
                    type="number"
                    step="0.1"
                    value={snapshotData.minWeight}
                    onChange={(e) => setSnapshotData(prev => ({
                      ...prev,
                      minWeight: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">描述 (可选)</Label>
                <Input
                  id="description"
                  value={snapshotData.description}
                  onChange={(e) => setSnapshotData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  placeholder="第一轮空投快照，包含所有合格用户"
                />
              </div>

              <Button 
                onClick={handleCreateSnapshot}
                disabled={loading || !snapshotData.snapshotName}
                className="w-full flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                {loading ? '创建中...' : '创建快照'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 数据预览 */}
        <TabsContent value="preview" className="space-y-6">
          {previewData ? (
            <>
              {/* 统计摘要 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">总用户数</p>
                        <p className="text-2xl font-bold">{previewData.summary.total_users}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">总权重</p>
                        <p className="text-2xl font-bold">{previewData.summary.total_weight.toFixed(2)}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">平均权重</p>
                        <p className="text-2xl font-bold">{previewData.summary.average_weight.toFixed(2)}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Top10占比</p>
                        <p className="text-2xl font-bold">{previewData.summary.top_10_percentage.toFixed(1)}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 用户列表预览 */}
              <Card>
                <CardHeader>
                  <CardTitle>用户数据预览 (前10名)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">排名</th>
                          <th className="text-left p-2">钱包地址</th>
                          <th className="text-left p-2">总权重</th>
                          <th className="text-left p-2">预估Token</th>
                          <th className="text-left p-2">等级</th>
                          <th className="text-left p-2">池子占比</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.users.slice(0, 10).map((user: any, index: number) => (
                          <tr key={user.wallet_address} className="border-b">
                            <td className="p-2 font-mono">#{user.rank}</td>
                            <td className="p-2 font-mono text-xs">
                              {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                            </td>
                            <td className="p-2">{user.total_weight.toFixed(4)}</td>
                            <td className="p-2">{user.estimated_tokens.toFixed(0)}</td>
                            <td className="p-2">
                              <Badge variant="outline" className={user.tier.color}>
                                {user.tier.name}
                              </Badge>
                            </td>
                            <td className="p-2">{user.percentage_of_pool.toFixed(4)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">暂无预览数据</h3>
                <p className="text-gray-500 mb-4">点击"预览数据"按钮来查看导出数据预览</p>
                <Button onClick={handlePreview} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  加载预览
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}