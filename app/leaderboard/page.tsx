'use client';

import { useState, useEffect } from 'react';
import { supabaseSessionManager } from '@/lib/services/supabase-session-manager';
import Web3Layout from '@/components/Web3Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  Users, 
  Star,
  Zap,
  Calendar,
  Award,
  Target,
  BarChart3
} from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  displayAddress: string;
  currentPoints: number;
  chainPointsBalance: number;
  totalChainEarned: number;
  consecutiveDays: number;
  tier: {
    name: string;
    color: string;
    minPoints: number;
  };
  percentage: number;
  lastActive: string;
}

interface LeaderboardStats {
  totalUsers: number;
  totalPoints: number;
  totalBalance: number;
  averagePoints: number;
  activeUsers: number;
  topTierUsers: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  stats: LeaderboardStats;
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  category: string;
  lastUpdated: string;
}

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('total');
  const [userRank, setUserRank] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<{ userId: string | null; walletAddress: string | null } | null>(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeaderboard();
    }
  }, [category, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && userInfo?.walletAddress) {
      fetchUserRank();
    }
  }, [isAuthenticated, userInfo?.walletAddress]);

  const checkAuthAndFetch = async () => {
    try {
      const supabase = supabaseSessionManager.getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsAuthenticated(true);
        // For Web3 users, wallet address is in JWT claims
        const walletAddress = session.user?.user_metadata?.wallet_address || null;
        setUserInfo({
          userId: session.user.id,
          walletAddress
        });
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      // 手动设置认证头，绕过apiClient的localStorage检查
      const supabase = supabaseSessionManager.getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please login to view leaderboard');
        return;
      }

      const response = await fetch(`/api/points/leaderboard?category=${category}&limit=50`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setLeaderboardData(data.data);
      } else {
        setError(data.error || 'Failed to load leaderboard');
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRank = async () => {
    try {
      const supabase = supabaseSessionManager.getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const response = await fetch('/api/points/my-rank', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserRank(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching user rank:', err);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
        <Crown className="w-6 h-6 text-white" />
      </div>
    );
    if (rank === 2) return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg">
        <Medal className="w-6 h-6 text-white" />
      </div>
    );
    if (rank === 3) return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
        <Medal className="w-6 h-6 text-white" />
      </div>
    );
    return (
      <div className="w-10 h-10 rounded-full bg-[#FBCB0A] flex items-center justify-center">
        <span className="text-[#3D0B5B] font-bold font-rajdhani text-lg">#{rank}</span>
      </div>
    );
  };

  const formatPoints = (points: number) => {
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Web3Layout>
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-[#3D0B5B] dark:border-[#FBCB0A] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#333333] dark:text-[#E0E0E0] font-rajdhani">Loading leaderboard...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4 font-rajdhani">{error}</p>
          <Button 
            onClick={fetchLeaderboard}
            className="bg-[#FBCB0A] text-[#3D0B5B] hover:bg-[#3D0B5B] hover:text-[#FBCB0A] font-rajdhani font-bold rounded-lg transition-all"
          >
            重试
          </Button>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-[3.5rem] font-bold text-[#3D0B5B] dark:text-[#FBCB0A] mb-2 font-rajdhani leading-tight">
              Leaderboard
            </h1>
            <p className="text-[1.5rem] text-[#333333] dark:text-[#E0E0E0] font-normal font-rajdhani">
              Compete with the best Web3 users and climb the ranks
            </p>
            {userRank && (
              <Card className="mt-6 bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 rounded-xl shadow-sm max-w-md mx-auto">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Trophy className="w-5 h-5 text-[#FBCB0A]" />
                    <span className="text-[#333333] dark:text-[#E0E0E0] font-rajdhani">我的排名:</span>
                    <span className="font-bold text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani">#{userRank.rank?.total || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stats Cards */}
          {leaderboardData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all hover:-translate-y-1 rounded-xl shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">Total Users</CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-[#FBCB0A] flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#3D0B5B]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-[#333333] dark:text-[#E0E0E0]">{leaderboardData.stats.totalUsers}</span>
                    <span className="text-[#333333]/60 dark:text-[#E0E0E0]/60">users</span>
                  </div>
                  <p className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60 mt-2">总用户数</p>
                </CardContent>
              </Card>

              <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all hover:-translate-y-1 rounded-xl shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">Total Points</CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-[#FBCB0A] flex items-center justify-center">
                      <Star className="w-5 h-5 text-[#3D0B5B]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-[#333333] dark:text-[#E0E0E0]">{formatPoints(leaderboardData.stats.totalPoints)}</span>
                    <span className="text-[#333333]/60 dark:text-[#E0E0E0]/60">pts</span>
                  </div>
                  <p className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60 mt-2">总积分</p>
                </CardContent>
              </Card>

              <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all hover:-translate-y-1 rounded-xl shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">Active Users</CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-[#FBCB0A] flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#3D0B5B]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-[#333333] dark:text-[#E0E0E0]">{leaderboardData.stats.activeUsers}</span>
                    <span className="text-[#333333]/60 dark:text-[#E0E0E0]/60">active</span>
                  </div>
                  <p className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60 mt-2">活跃用户</p>
                </CardContent>
              </Card>

              <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all hover:-translate-y-1 rounded-xl shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">Top Tier</CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-[#FBCB0A] flex items-center justify-center">
                      <Award className="w-5 h-5 text-[#3D0B5B]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-[#333333] dark:text-[#E0E0E0]">{leaderboardData.stats.topTierUsers}</span>
                    <span className="text-[#333333]/60 dark:text-[#E0E0E0]/60">elite</span>
                  </div>
                  <p className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60 mt-2">顶级用户</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Category Selector */}
          <Card className="mb-8 bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[2rem] flex items-center">
                <BarChart3 className="w-6 h-6 mr-2" />
                Ranking Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'total', label: '总积分', icon: Star, description: '累计获得的总积分' },
                  { key: 'chain', label: '当前余额', icon: Zap, description: '当前账户余额' },
                  { key: 'consecutive', label: '连续签到', icon: Calendar, description: '连续签到天数' }
                ].map(({ key, label, icon: Icon, description }) => (
                  <div 
                    key={key}
                    onClick={() => setCategory(key)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:-translate-y-1 ${
                      category === key 
                        ? 'border-[#FBCB0A] bg-[#FBCB0A]/10' 
                        : 'border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#FBCB0A]/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#FBCB0A] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#3D0B5B]" />
                      </div>
                      <h3 className="font-bold text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani">{label}</h3>
                    </div>
                    <p className="text-sm text-[#333333]/70 dark:text-[#E0E0E0]/70">{description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[2rem]">
                {category === 'total' && '总积分排行榜'}
                {category === 'chain' && '当前余额排行榜'}
                {category === 'consecutive' && '连续签到排行榜'}
              </CardTitle>
              <CardDescription className="text-[#333333]/70 dark:text-[#E0E0E0]/70 font-rajdhani">
                更新时间: {leaderboardData ? formatDate(leaderboardData.lastUpdated) : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {leaderboardData?.leaderboard.map((entry, index) => (
                  <div key={entry.rank} className={`p-6 border-b border-[#3D0B5B]/10 dark:border-[#FBCB0A]/10 hover:bg-[#FBCB0A]/5 dark:hover:bg-[#FBCB0A]/5 transition-colors ${index === leaderboardData.leaderboard.length - 1 ? 'border-b-0' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                          {getRankIcon(entry.rank)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-bold text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani">{entry.displayAddress}</h3>
                            <Badge className={`${entry.tier.color} bg-[#FBCB0A]/10 border-[#FBCB0A]/30 font-rajdhani font-bold`}>
                              {entry.tier.name}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-6 text-sm font-rajdhani">
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 rounded-full bg-[#FBCB0A] flex items-center justify-center">
                                <Star className="w-2 h-2 text-[#3D0B5B]" />
                              </div>
                              <span className="text-[#333333] dark:text-[#E0E0E0]">总积分: {formatPoints(entry.totalChainEarned)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 rounded-full bg-[#FBCB0A] flex items-center justify-center">
                                <Zap className="w-2 h-2 text-[#3D0B5B]" />
                              </div>
                              <span className="text-[#333333] dark:text-[#E0E0E0]">余额: {formatPoints(entry.chainPointsBalance)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 rounded-full bg-[#FBCB0A] flex items-center justify-center">
                                <Calendar className="w-2 h-2 text-[#3D0B5B]" />
                              </div>
                              <span className="text-[#333333] dark:text-[#E0E0E0]">连续: {entry.consecutiveDays}天</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani">
                          {formatPoints(entry.currentPoints)}
                        </p>
                        <p className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60 font-rajdhani">
                          {entry.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {leaderboardData?.pagination.hasMore && (
                <div className="p-6 text-center border-t border-[#3D0B5B]/10 dark:border-[#FBCB0A]/10">
                  <Button className="bg-[#FBCB0A] text-[#3D0B5B] hover:bg-[#3D0B5B] hover:text-[#FBCB0A] font-rajdhani font-bold rounded-lg transition-all hover:-translate-y-1">
                    加载更多
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Call to Action */}
          {!isAuthenticated && (
            <Card className="mt-8 bg-gradient-to-br from-[#3D0B5B] to-[#420868] border-2 border-[#FBCB0A]/20 rounded-xl shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-xl bg-[#FBCB0A] flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-[#3D0B5B]" />
                </div>
                <h3 className="text-2xl font-bold text-[#FBCB0A] mb-2 font-rajdhani">想要上榜吗？</h3>
                <p className="text-white/90 mb-6 font-rajdhani">登录账户，完成任务，赚取积分，冲击排行榜顶端！</p>
                <Button 
                  onClick={() => window.location.href = '/auth'}
                  className="bg-[#FBCB0A] text-[#3D0B5B] border-2 border-[#FBCB0A] hover:bg-white hover:text-[#3D0B5B] font-rajdhani font-bold text-lg px-8 py-6 rounded-lg transition-all hover:-translate-y-1"
                >
                  前往登录
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </Web3Layout>
  );
}