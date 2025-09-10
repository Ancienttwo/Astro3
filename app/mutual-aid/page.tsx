'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import MutualAidLayout from '@/components/layouts/MutualAidLayout';
import { 
  useIsWalletConnected,
  useUserProfile,
  useUIActions,
  useMutualAidStore 
} from '@/lib/stores/mutualAidStore';
import {
  Zap,
  Users,
  TrendingUp,
  Trophy,
  Heart,
  Shield,
  ArrowRight,
  Star,
  Clock,
  DollarSign,
  Activity,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCard {
  title: string;
  titleEn: string;
  value: string;
  description: string;
  descriptionEn: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

interface QuickAction {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  requiresWallet?: boolean;
  badge?: string;
}

const systemStats: StatCard[] = [
  {
    title: '总互助金额',
    titleEn: 'Total Aid Distributed',
    value: '12,450 AZI',
    description: '累计发放互助资金',
    descriptionEn: 'Total mutual aid distributed',
    icon: DollarSign,
    color: 'text-green-600 bg-green-50',
    trend: { value: '+15.2%', isPositive: true }
  },
  {
    title: '活跃验证者',
    titleEn: 'Active Validators',
    value: '234',
    description: '参与验证的用户数',
    descriptionEn: 'Users participating in validation',
    icon: Users,
    color: 'text-blue-600 bg-blue-50',
    trend: { value: '+8.1%', isPositive: true }
  },
  {
    title: '成功率',
    titleEn: 'Success Rate',
    value: '87.3%',
    description: '申请批准通过率',
    descriptionEn: 'Request approval rate',
    icon: CheckCircle,
    color: 'text-purple-600 bg-purple-50',
    trend: { value: '+2.5%', isPositive: true }
  },
  {
    title: '平均响应时间',
    titleEn: 'Avg Response Time',
    value: '18小时',
    description: '验证平均耗时',
    descriptionEn: 'Average validation time',
    icon: Clock,
    color: 'text-orange-600 bg-orange-50',
    trend: { value: '-12min', isPositive: true }
  }
];

const quickActions: QuickAction[] = [
  {
    title: '厄运预警分析',
    titleEn: 'Adversity Analysis',
    description: '分析当前困难状况，评估互助需求',
    descriptionEn: 'Analyze current difficulties and assess aid needs',
    href: '/mutual-aid/analysis',
    icon: Zap,
    color: 'from-red-500 to-orange-500',
    requiresWallet: true,
    badge: 'AI分析'
  },
  {
    title: '社区验证',
    titleEn: 'Community Validation',
    description: '验证其他用户的互助申请',
    descriptionEn: 'Validate other users\' aid requests',
    href: '/mutual-aid/validation',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    requiresWallet: true,
    badge: '5个待验证'
  },
  {
    title: '我的请求',
    titleEn: 'My Requests',
    description: '查看我的互助申请历史',
    descriptionEn: 'View my aid request history',
    href: '/mutual-aid/requests',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    requiresWallet: true
  },
  {
    title: 'NFT收藏',
    titleEn: 'NFT Collection',
    description: '管理关帝签文NFT收藏',
    descriptionEn: 'Manage Guandi fortune NFT collection',
    href: '/mutual-aid/nfts',
    icon: Trophy,
    color: 'from-amber-500 to-yellow-500',
    requiresWallet: true
  },
  {
    title: '排行榜',
    titleEn: 'Leaderboard',
    description: '查看社区贡献排行',
    descriptionEn: 'View community contribution rankings',
    href: '/mutual-aid/leaderboard',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-500'
  },
  {
    title: '社区治理',
    titleEn: 'Governance',
    description: '参与社区治理和提案投票',
    descriptionEn: 'Participate in governance and proposal voting',
    href: '/mutual-aid/governance',
    icon: Shield,
    color: 'from-indigo-500 to-purple-500',
    requiresWallet: true
  }
];

export default function MutualAidHomePage() {
  const isWalletConnected = useIsWalletConnected();
  const userProfile = useUserProfile();
  const { language } = useMutualAidStore((state) => state.ui);
  const { addNotification } = useUIActions();

  useEffect(() => {
    // Welcome notification for new users
    if (isWalletConnected && userProfile.mutualAidHistory.length === 0) {
      addNotification({
        type: 'info',
        title: language === 'en' ? 'Welcome to AstroZi Mutual Aid!' : '欢迎使用 AstroZi 互助系统！',
        message: language === 'en' 
          ? 'Start by analyzing your situation or help validate others\' requests.'
          : '开始分析您的情况或帮助验证其他人的申请。'
      });
    }
  }, [isWalletConnected, userProfile, language, addNotification]);

  const getStatTitle = (stat: StatCard) => {
    return language === 'en' ? stat.titleEn : stat.title;
  };

  const getStatDescription = (stat: StatCard) => {
    return language === 'en' ? stat.descriptionEn : stat.description;
  };

  const getActionTitle = (action: QuickAction) => {
    return language === 'en' ? action.titleEn : action.title;
  };

  const getActionDescription = (action: QuickAction) => {
    return language === 'en' ? action.descriptionEn : action.description;
  };

  const canAccessAction = (action: QuickAction) => {
    return !action.requiresWallet || isWalletConnected;
  };

  const handleActionClick = (action: QuickAction) => {
    if (!canAccessAction(action)) {
      addNotification({
        type: 'warning',
        title: language === 'en' ? 'Wallet Required' : '需要连接钱包',
        message: language === 'en' 
          ? 'Please connect your wallet to access this feature.'
          : '请先连接钱包以访问此功能。'
      });
    }
  };

  return (
    <MutualAidLayout 
      title={language === 'en' ? 'Mutual Aid Dashboard' : '互助系统仪表板'}
      subtitle={language === 'en' 
        ? 'Community-driven support through traditional wisdom and AI'
        : '基于传统智慧和AI技术的社区互助平台'
      }
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">
                    {language === 'en' ? 'Welcome to AstroZi Mutual Aid' : '欢迎来到 AstroZi 互助系统'}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    {language === 'en' 
                      ? 'A decentralized mutual aid system combining ancient wisdom with modern AI technology to help community members during times of adversity.'
                      : '结合古代智慧与现代AI技术的去中心化互助系统，在困难时期为社区成员提供帮助。'
                    }
                  </p>
                  
                  {isWalletConnected ? (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500" />
                        <span className="text-sm font-medium">
                          {language === 'en' ? 'Reputation:' : '信誉分数:'} {userProfile.reputation.toFixed(1)}/5.0
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium">
                          {language === 'en' ? 'NFTs:' : 'NFT数量:'} {userProfile.nftCollection.totalCount}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">
                          {language === 'en' 
                            ? 'Connect your wallet to access all features'
                            : '连接钱包以访问所有功能'
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center">
                    <Heart className="w-16 h-16 text-primary" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">
              {language === 'en' ? 'System Overview' : '系统概览'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Real-time statistics of the mutual aid community'
                : '互助社区实时统计数据'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        stat.color
                      )}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      
                      {stat.trend && (
                        <Badge variant={stat.trend.isPositive ? 'default' : 'destructive'} className="text-xs">
                          {stat.trend.value}
                        </Badge>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-2xl font-bold mb-1">{stat.value}</p>
                      <p className="text-sm font-medium text-foreground mb-1">
                        {getStatTitle(stat)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getStatDescription(stat)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">
              {language === 'en' ? 'Quick Actions' : '快速操作'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Common actions to get started with mutual aid'
                : '开始使用互助系统的常用操作'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
              >
                <Link 
                  href={canAccessAction(action) ? action.href : '#'}
                  onClick={() => handleActionClick(action)}
                >
                  <Card className={cn(
                    "group hover:shadow-xl transition-all duration-300 cursor-pointer",
                    "hover:-translate-y-1",
                    !canAccessAction(action) && "opacity-60 cursor-not-allowed"
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center",
                          "bg-gradient-to-r text-white",
                          action.color
                        )}>
                          <action.icon className="w-6 h-6" />
                        </div>
                        
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {getActionTitle(action)}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {getActionDescription(action)}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          {action.requiresWallet && (
                            <Badge variant="outline" className="text-xs">
                              {language === 'en' ? 'Wallet Required' : '需要钱包'}
                            </Badge>
                          )}
                        </div>
                        
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity (if wallet connected) */}
        {isWalletConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {language === 'en' ? 'Recent Activity' : '最近活动'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userProfile.mutualAidHistory.length === 0 && userProfile.validationHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-medium mb-2">
                      {language === 'en' ? 'No activity yet' : '暂无活动记录'}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {language === 'en' 
                        ? 'Start by analyzing your situation or helping validate requests'
                        : '开始分析您的情况或帮助验证申请'
                      }
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Link href="/mutual-aid/analysis">
                        <Button variant="outline" size="sm">
                          {language === 'en' ? 'Start Analysis' : '开始分析'}
                        </Button>
                      </Link>
                      <Link href="/mutual-aid/validation">
                        <Button size="sm">
                          {language === 'en' ? 'Help Validate' : '帮助验证'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Show recent activities */}
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Your recent mutual aid activities will appear here.' : '您最近的互助活动将在这里显示。'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </MutualAidLayout>
  );
}