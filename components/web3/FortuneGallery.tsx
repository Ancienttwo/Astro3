'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scroll, 
  Calendar, 
  Star, 
  Share2, 
  Crown, 
  Sparkles,
  Trophy,
  Gift,
  TrendingUp,
  Filter,
  Search,
  Eye,
  Download
} from 'lucide-react';
import { useWeb3User } from '@/hooks/useWeb3User';

interface FortuneRecord {
  id: string;
  slip_number: number;
  draw_date: string;
  fortune_level: string;
  luck_points_earned: number;
  jiaobei_session_data: {
    results: string[];
    total_attempts: number;
    consecutive_successes: number;
  };
  is_minted_as_nft: boolean;
  nft_token_id?: number;
  nft_contract_address?: string;
  share_count: number;
  fortune_slip?: {
    title: string;
    content: string;
    basic_interpretation: string;
    historical_context: string;
    symbolism: string;
  };
}

interface GalleryStats {
  totalFortuneDraws: number;
  nftEligible: number;
  nftMinted: number;
  totalPoints: number;
  longestStreak: number;
  favoriteLevel: string;
}

interface FortuneGalleryProps {
  walletAddress?: string;
}

const FortuneGallery: React.FC<FortuneGalleryProps> = ({ walletAddress }) => {
  const { user: web3User, isConnected } = useWeb3User();
  const [records, setRecords] = useState<FortuneRecord[]>([]);
  const [stats, setStats] = useState<GalleryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'nft-eligible' | 'minted'>('all');
  const [selectedRecord, setSelectedRecord] = useState<FortuneRecord | null>(null);

  const effectiveWalletAddress = walletAddress || web3User?.walletAddress;

  useEffect(() => {
    if (effectiveWalletAddress) {
      fetchFortuneHistory();
    }
  }, [effectiveWalletAddress, filter]);

  const fetchFortuneHistory = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/guandi/gallery?wallet_address=${effectiveWalletAddress}&filter=${filter}`, {
        headers: isConnected && web3User ? {
          'X-Web3-User': btoa(encodeURIComponent(JSON.stringify(web3User)))
        } : {}
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecords(data.data.records || []);
          setStats(data.data.stats || null);
        }
      } else {
        console.warn('获取签文历史失败');
      }
    } catch (error) {
      console.error('获取签文历史错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFortuneStyle = (level: string) => {
    switch (level) {
      case 'excellent':
        return { 
          color: 'text-green-600', 
          bg: 'bg-green-50 border-green-200', 
          icon: '大吉',
          badge: 'bg-green-500'
        };
      case 'good':
        return { 
          color: 'text-blue-600', 
          bg: 'bg-blue-50 border-blue-200', 
          icon: '中吉',
          badge: 'bg-blue-500'
        };
      case 'average':
        return { 
          color: 'text-yellow-600', 
          bg: 'bg-yellow-50 border-yellow-200', 
          icon: '平',
          badge: 'bg-yellow-500'
        };
      case 'caution':
        return { 
          color: 'text-orange-600', 
          bg: 'bg-orange-50 border-orange-200', 
          icon: '小凶',
          badge: 'bg-orange-500'
        };
      case 'warning':
        return { 
          color: 'text-red-600', 
          bg: 'bg-red-50 border-red-200', 
          icon: '大凶',
          badge: 'bg-red-500'
        };
      default:
        return { 
          color: 'text-gray-600', 
          bg: 'bg-gray-50 border-gray-200', 
          icon: '未知',
          badge: 'bg-gray-500'
        };
    }
  };

  const handleShare = (record: FortuneRecord) => {
    if (navigator.share) {
      navigator.share({
        title: `关帝灵签第${record.slip_number}签`,
        text: record.fortune_slip?.title || `获得关帝灵签第${record.slip_number}签`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(
        `我在AstroZi获得了关帝灵签第${record.slip_number}签：${record.fortune_slip?.title || ''}`
      );
      alert('分享链接已复制到剪贴板！');
    }
  };

  const handleMintNFT = async (record: FortuneRecord) => {
    // TODO: 实现NFT铸造逻辑
    alert('NFT铸造功能开发中...');
  };

  if (!effectiveWalletAddress) {
    return (
      <Card className="bg-white/95 border-yellow-300 rounded-xl">
        <CardContent className="text-center py-12">
          <Scroll className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">连接钱包查看签文收藏</h3>
          <p className="text-gray-600">请先连接Web3钱包以查看您的关帝签文收藏</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-white/95 border-yellow-300 rounded-xl">
        <CardContent className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-yellow-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">加载签文收藏中...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 收藏统计 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 rounded-lg">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Scroll className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalFortuneDraws}</div>
              <div className="text-xs text-gray-600">总抽签</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 rounded-lg">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{stats.nftEligible}</div>
              <div className="text-xs text-gray-600">可铸造NFT</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 rounded-lg">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{stats.nftMinted}</div>
              <div className="text-xs text-gray-600">已铸造NFT</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 rounded-lg">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalPoints}</div>
              <div className="text-xs text-gray-600">总积分</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200 rounded-lg">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{stats.longestStreak}</div>
              <div className="text-xs text-gray-600">最长连签</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 rounded-lg">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div className="text-lg font-bold text-gray-800">{stats.favoriteLevel}</div>
              <div className="text-xs text-gray-600">偏好等级</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 过滤器 */}
      <Card className="bg-white/95 border-yellow-200 rounded-xl">
        <CardHeader>
          <CardTitle className="text-red-800 font-bold text-xl flex items-center">
            <Scroll className="w-6 h-6 mr-2" />
            我的签文收藏
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">全部签文 ({records.length})</TabsTrigger>
              <TabsTrigger value="nft-eligible">可铸造NFT ({records.filter(r => !r.is_minted_as_nft).length})</TabsTrigger>
              <TabsTrigger value="minted">已铸造NFT ({records.filter(r => r.is_minted_as_nft).length})</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-6">
              {records.length === 0 ? (
                <div className="text-center py-12">
                  <Scroll className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">暂无签文收藏</h3>
                  <p className="text-gray-600 mb-4">
                    {filter === 'all' ? '还没有抽取过关帝签文' :
                     filter === 'nft-eligible' ? '暂无可铸造NFT的签文' : '暂未铸造任何NFT'}
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/guandi'}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    前往关帝灵签
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {records.map((record) => {
                    const fortuneStyle = getFortuneStyle(record.fortune_level);
                    return (
                      <Card key={record.id} className={`${fortuneStyle.bg} border-2 hover:shadow-lg transition-all`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge className={`${fortuneStyle.badge} text-white`}>
                                第{record.slip_number}签
                              </Badge>
                              <Badge variant="outline" className={fortuneStyle.color}>
                                {fortuneStyle.icon}
                              </Badge>
                            </div>
                            {record.is_minted_as_nft && (
                              <div className="flex items-center space-x-1">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <span className="text-xs text-purple-600 font-medium">NFT</span>
                              </div>
                            )}
                          </div>
                          <CardTitle className={`${fortuneStyle.color} text-lg`}>
                            {record.fortune_slip?.title || `第${record.slip_number}签`}
                          </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          {/* 抽签信息 */}
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(record.draw_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4" />
                              <span>+{record.luck_points_earned}积分</span>
                            </div>
                          </div>

                          {/* 筊杯记录 */}
                          <div className="bg-white/50 rounded-lg p-3">
                            <div className="text-xs text-gray-600 mb-2">筊杯记录</div>
                            <div className="flex flex-wrap gap-1">
                              {record.jiaobei_session_data.results.map((result, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className={`text-xs ${
                                    result === '正反' ? 'border-green-400 text-green-600' :
                                    result === '正正' ? 'border-blue-400 text-blue-600' :
                                    'border-red-400 text-red-600'
                                  }`}
                                >
                                  {result}
                                </Badge>
                              ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {record.jiaobei_session_data.consecutive_successes}次连续成功
                            </div>
                          </div>

                          {/* 操作按钮 */}
                          <div className="flex space-x-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRecord(record)}
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              查看
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShare(record)}
                              className="flex-1"
                            >
                              <Share2 className="w-4 h-4 mr-1" />
                              分享
                            </Button>
                            
                            {!record.is_minted_as_nft && (
                              <Button
                                size="sm"
                                onClick={() => handleMintNFT(record)}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <Gift className="w-4 h-4 mr-1" />
                                铸造NFT
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 签文详情模态框 */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-red-800 text-xl">
                  第{selectedRecord.slip_number}签 - {selectedRecord.fortune_slip?.title}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedRecord(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-bold text-red-800 mb-2">签诗</h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedRecord.fortune_slip?.content}
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">基础解释</h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedRecord.fortune_slip?.basic_interpretation}
                </p>
              </div>
              
              {selectedRecord.fortune_slip?.historical_context && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-bold text-yellow-800 mb-2">历史典故</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedRecord.fortune_slip.historical_context}
                  </p>
                </div>
              )}
              
              {selectedRecord.fortune_slip?.symbolism && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-2">象征意义</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedRecord.fortune_slip.symbolism}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FortuneGallery;