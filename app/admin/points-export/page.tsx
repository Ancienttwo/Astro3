'use client';

import { useState } from 'react';
import PointsExportManager from '@/components/admin/PointsExportManager';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Database, Download } from 'lucide-react';

export default function PointsExportPage() {

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* 安全提醒 */}
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-orange-800">
              <strong>管理员工具 - 敏感数据操作</strong>
              <br />
              此页面允许导出用户钱包地址和积分数据，请妥善保管导出的文件，不要泄露给未授权人员。
              导出的数据将用于空投公告和运营分析。
            </AlertDescription>
          </Alert>

          {/* 功能说明 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Download className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">数据导出</h3>
                <p className="text-gray-600 text-sm">
                  导出用户空投资格数据为CSV或JSON格式，支持筛选条件和详细信息选择
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Database className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">快照管理</h3>
                <p className="text-gray-600 text-sm">
                  创建空投快照，固化某个时间点的用户权重和Token分配，用于正式空投
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">数据预览</h3>
                <p className="text-gray-600 text-sm">
                  在导出前预览数据，查看统计摘要和排行榜，确保数据准确性
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 主要内容 */}
          <PointsExportManager />

          {/* 使用说明 */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">使用说明</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <strong>数据导出：</strong>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>CSV格式适合Excel分析，JSON格式适合程序处理</li>
                    <li>最小权重筛选可以过滤掉权重过低的用户</li>
                    <li>包含详细信息会增加签到统计、消费记录等数据</li>
                    <li>快照日期可以获取历史某个时间点的数据</li>
                  </ul>
                </div>
                
                <div>
                  <strong>快照创建：</strong>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>快照会固化当前时间点的用户权重和Token分配</li>
                    <li>空投池大小决定了总的Token分配数量</li>
                    <li>创建快照后，用户的最终Token分配将被计算并存储</li>
                    <li>快照可用于正式空投的分发和公告</li>
                  </ul>
                </div>
                
                <div>
                  <strong>数据安全：</strong>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>导出的数据包含用户钱包地址，属于敏感信息</li>
                    <li>请确保文件存储在安全的位置，设置适当的访问权限</li>
                    <li>不要将包含钱包地址的文件分享给未授权人员</li>
                    <li>用于公告的数据可以隐藏钱包地址的中间部分</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminAuthGuard>
  );
}