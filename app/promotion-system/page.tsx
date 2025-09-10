'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gift, Users, Share2, Info } from 'lucide-react';

import PromoCodeRedeemer from '@/components/PromoCodeRedeemer';
import ReferralCodeManager from '@/components/ReferralCodeManager';
import AuthGuard from '@/components/AuthGuard';

export default function PromotionSystemPage() {
  const [activeTab, setActiveTab] = useState('redeem');

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              运营活动中心
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              兑换码福利和推荐奖励，让您获得更多免费AI分析次数
            </p>
          </div>

          {/* 功能标签页 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="redeem" className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                <span className="hidden sm:inline">兑换码</span>
              </TabsTrigger>
              <TabsTrigger value="referral" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">推荐好友</span>
              </TabsTrigger>
            </TabsList>

            {/* 兑换码功能 */}
            <TabsContent value="redeem" className="space-y-6">
              <div className="flex justify-center">
                <PromoCodeRedeemer />
              </div>

              {/* 使用说明 */}
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="h-5 w-5 text-blue-600" />
                    使用说明
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-semibold">1.</span>
                    <span>输入您获得的兑换码，每个兑换码只能使用一次</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-semibold">2.</span>
                    <span>成功兑换后，次数将自动添加到您的账户中</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-semibold">3.</span>
                    <span>可在个人中心查看您的剩余次数和使用记录</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 推荐好友功能 */}
            <TabsContent value="referral" className="space-y-6">
              <div className="flex justify-center">
                <ReferralCodeManager />
              </div>

              {/* 推荐奖励说明 */}
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Gift className="h-5 w-5 text-green-600" />
                    推荐奖励规则
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-semibold">·</span>
                    <span><strong>推荐人奖励：</strong>每成功推荐一位好友注册，您将获得 3 次免费AI分析</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-semibold">·</span>
                    <span><strong>新用户奖励：</strong>通过推荐链接注册的新用户将获得 3 次免费AI分析</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-semibold">·</span>
                    <span><strong>如何推荐：</strong>分享您的专属推荐链接给好友，好友通过链接注册即可</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
} 