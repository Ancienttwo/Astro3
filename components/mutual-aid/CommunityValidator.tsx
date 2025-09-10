'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  FileText,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Shield,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationRequest {
  id: string;
  userId: string;
  walletAddress: string;
  requestedAmount: string;
  severityLevel: number;
  timeframe: string;
  personalContext: {
    currentSituation: string;
    duration: string;
    severity: string;
  };
  supportingEvidence?: string[];
  submittedAt: string;
  requesterReputation: {
    totalScore: number;
    validationAccuracy: number;
    communityContributions: number;
    mutualAidHistory: number;
  };
  currentVotes: {
    approve: number;
    reject: number;
    total: number;
    required: number;
  };
  status: 'pending' | 'approved' | 'rejected' | 'expired';
}

interface MyValidation {
  requestId: string;
  vote: 'approve' | 'reject';
  confidence: number;
  reason: string;
  votedAt: string;
  outcome: 'correct' | 'incorrect' | 'pending';
}

interface CommunityValidatorProps {
  walletAddress?: string;
  userNFTCount?: number;
  userReputation?: number;
}

const mockValidationRequests: ValidationRequest[] = [
  {
    id: '1',
    userId: 'user1',
    walletAddress: '0x1234...5678',
    requestedAmount: '75',
    severityLevel: 7,
    timeframe: '接下来7天',
    personalContext: {
      currentSituation: '失业三个月，积蓄即将用完，孩子需要上学费用',
      duration: '3months',
      severity: 'high'
    },
    submittedAt: '2025-01-09T10:00:00Z',
    requesterReputation: {
      totalScore: 4.2,
      validationAccuracy: 0.85,
      communityContributions: 12,
      mutualAidHistory: 3
    },
    currentVotes: {
      approve: 8,
      reject: 2,
      total: 10,
      required: 15
    },
    status: 'pending'
  },
  {
    id: '2',
    userId: 'user2',
    walletAddress: '0x9876...5432',
    requestedAmount: '45',
    severityLevel: 5,
    timeframe: '接下来30天',
    personalContext: {
      currentSituation: '医疗费用超出预算，需要短期资金周转',
      duration: 'month',
      severity: 'medium'
    },
    submittedAt: '2025-01-09T08:30:00Z',
    requesterReputation: {
      totalScore: 3.8,
      validationAccuracy: 0.92,
      communityContributions: 8,
      mutualAidHistory: 1
    },
    currentVotes: {
      approve: 12,
      reject: 1,
      total: 13,
      required: 15
    },
    status: 'pending'
  }
];

const mockMyValidations: MyValidation[] = [
  {
    requestId: 'req123',
    vote: 'approve',
    confidence: 85,
    reason: '情况描述详细，符合互助条件',
    votedAt: '2025-01-08T14:00:00Z',
    outcome: 'correct'
  },
  {
    requestId: 'req124',
    vote: 'reject',
    confidence: 70,
    reason: '申请金额过高，与描述情况不符',
    votedAt: '2025-01-08T10:30:00Z',
    outcome: 'correct'
  }
];

export default function CommunityValidator({
  walletAddress,
  userNFTCount = 5,
  userReputation = 4.3
}: CommunityValidatorProps) {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<ValidationRequest | null>(null);
  const [voteReason, setVoteReason] = useState('');
  const [confidence, setConfidence] = useState([80]);
  const [requests, setRequests] = useState<ValidationRequest[]>(mockValidationRequests);
  const [myValidations, setMyValidations] = useState<MyValidation[]>(mockMyValidations);
  const [voting, setVoting] = useState(false);

  const canVote = userNFTCount > 0 && userReputation > 3.0;
  const votingWeight = Math.min(Math.floor(userNFTCount / 2), 3) + Math.floor(userReputation);

  const handleVote = async (requestId: string, vote: 'approve' | 'reject') => {
    if (!canVote || !voteReason.trim()) return;
    
    setVoting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the request votes
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? {
              ...req,
              currentVotes: {
                ...req.currentVotes,
                [vote]: req.currentVotes[vote] + votingWeight,
                total: req.currentVotes.total + votingWeight
              }
            }
          : req
      ));
      
      // Add to my validations
      const newValidation: MyValidation = {
        requestId,
        vote,
        confidence: confidence[0],
        reason: voteReason,
        votedAt: new Date().toISOString(),
        outcome: 'pending'
      };
      
      setMyValidations(prev => [newValidation, ...prev]);
      setSelectedRequest(null);
      setVoteReason('');
      setConfidence([80]);
      
    } catch (error) {
      console.error('投票失败:', error);
    } finally {
      setVoting(false);
    }
  };

  const getSeverityColor = (level: number) => {
    if (level <= 3) return 'text-green-600 bg-green-50 border-green-200';
    if (level <= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getVoteProgress = (votes: ValidationRequest['currentVotes']) => {
    return (votes.total / votes.required) * 100;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '刚刚';
    if (diffInHours < 24) return `${diffInHours}小时前`;
    return `${Math.floor(diffInHours / 24)}天前`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 头部统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">待验证</p>
                <p className="text-xl font-bold">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">我的验证</p>
                <p className="text-xl font-bold">{myValidations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">信誉分数</p>
                <p className="text-xl font-bold">{userReputation.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">投票权重</p>
                <p className="text-xl font-bold">{votingWeight}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">待验证请求</TabsTrigger>
          <TabsTrigger value="history">我的验证历史</TabsTrigger>
          <TabsTrigger value="stats">验证统计</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {!canVote && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-800">
                      验证权限不足
                    </p>
                    <p className="text-sm text-amber-700">
                      需要至少1个NFT且信誉分数≥3.0才能参与验证
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {requests.filter(r => r.status === 'pending').map((request) => (
              <Card key={request.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* 左侧：请求信息 */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={cn('text-xs', getSeverityColor(request.severityLevel))}>
                              严重程度 {request.severityLevel}/10
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {request.timeframe}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            申请者：{request.walletAddress}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {request.requestedAmount} AZI
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(request.submittedAt)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">困难描述</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.personalContext.currentSituation}
                        </p>
                      </div>

                      {/* 申请者信誉 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-xs text-muted-foreground">综合评分</p>
                          <p className="font-medium">{request.requesterReputation.totalScore}/5.0</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">验证准确率</p>
                          <p className="font-medium">
                            {(request.requesterReputation.validationAccuracy * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">社区贡献</p>
                          <p className="font-medium">{request.requesterReputation.communityContributions}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">互助历史</p>
                          <p className="font-medium">{request.requesterReputation.mutualAidHistory}</p>
                        </div>
                      </div>
                    </div>

                    {/* 右侧：投票状态和操作 */}
                    <div className="lg:w-80 space-y-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">投票进度</span>
                          <span className="text-sm text-muted-foreground">
                            {request.currentVotes.total}/{request.currentVotes.required}
                          </span>
                        </div>
                        
                        <Progress 
                          value={getVoteProgress(request.currentVotes)} 
                          className="h-2 mb-3"
                        />
                        
                        <div className="flex justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-green-600" />
                            <span>{request.currentVotes.approve} 同意</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsDown className="w-3 h-3 text-red-600" />
                            <span>{request.currentVotes.reject} 拒绝</span>
                          </div>
                        </div>
                      </div>

                      {canVote && (
                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            参与验证
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {myValidations.map((validation, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={validation.vote === 'approve' ? 'default' : 'destructive'}>
                          {validation.vote === 'approve' ? '同意' : '拒绝'}
                        </Badge>
                        <Badge variant="outline">
                          信心度 {validation.confidence}%
                        </Badge>
                        <Badge 
                          variant={
                            validation.outcome === 'correct' ? 'default' :
                            validation.outcome === 'incorrect' ? 'destructive' : 'secondary'
                          }
                        >
                          {validation.outcome === 'correct' ? '正确' :
                           validation.outcome === 'incorrect' ? '错误' : '待定'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {validation.reason}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(validation.votedAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>验证准确率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {((myValidations.filter(v => v.outcome === 'correct').length / 
                       myValidations.filter(v => v.outcome !== 'pending').length) * 100 || 0).toFixed(0)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {myValidations.filter(v => v.outcome === 'correct').length} / {myValidations.filter(v => v.outcome !== 'pending').length} 次正确
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>验证贡献</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">总验证次数</span>
                    <span className="font-medium">{myValidations.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">同意票数</span>
                    <span className="font-medium">
                      {myValidations.filter(v => v.vote === 'approve').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">拒绝票数</span>
                    <span className="font-medium">
                      {myValidations.filter(v => v.vote === 'reject').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">平均信心度</span>
                    <span className="font-medium">
                      {myValidations.length > 0 
                        ? (myValidations.reduce((sum, v) => sum + v.confidence, 0) / myValidations.length).toFixed(0)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 投票模态框 */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedRequest(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">验证申请</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRequest(null)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">申请金额</Label>
                    <p className="text-2xl font-bold text-primary">
                      {selectedRequest.requestedAmount} AZI
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">困难描述</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedRequest.personalContext.currentSituation}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="vote-reason">验证理由 *</Label>
                    <Textarea
                      id="vote-reason"
                      value={voteReason}
                      onChange={(e) => setVoteReason(e.target.value)}
                      placeholder="请说明您的验证理由..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confidence">信心度：{confidence[0]}%</Label>
                    <Slider
                      id="confidence"
                      value={confidence}
                      onValueChange={setConfidence}
                      min={1}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>不确定</span>
                      <span>非常确定</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={!voteReason.trim() || voting}
                    onClick={() => handleVote(selectedRequest.id, 'reject')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    拒绝申请
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!voteReason.trim() || voting}
                    onClick={() => handleVote(selectedRequest.id, 'approve')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    同意资助
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}