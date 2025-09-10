'use client';

import { useState, useEffect } from 'react';
import { supabaseSessionManager } from '@/lib/services/supabase-session-manager';
import Web3Layout from '@/components/Web3Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Clock, 
  Star, 
  Gift, 
  Users, 
  TrendingUp,
  Zap,
  Link,
  Calendar,
  Trophy,
  ChevronRight,
  Sparkles,
  Award,
  Target
} from 'lucide-react';

interface Task {
  id: string;
  taskKey: string;
  title: string;
  description: string;
  taskType: 'daily' | 'onetime' | 'recurring';
  category: 'newbie' | 'advanced';
  pointsReward: number;
  requirements: any;
  status: 'pending' | 'completed' | 'claimed';
  progress: number;
  completedAt?: string;
  claimedAt?: string;
  metadata?: any;
}

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalPointsEarned: number;
  totalPointsAvailable: number;
}

interface TasksData {
  tasks: Task[];
  tasksByCategory: {
    newbie: Task[];
    advanced: Task[];
  };
  stats: TaskStats;
  userInfo: {
    userId: string | null;
    walletAddress: string | null;
  };
}

export default function TasksPage() {
  const [tasksData, setTasksData] = useState<TasksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'newbie' | 'advanced'>('newbie');
  const [claimingTask, setClaimingTask] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<{ userId: string | null; walletAddress: string | null } | null>(null);

  useEffect(() => {
    checkAuthAndFetchTasks();
  }, []);

  const checkAuthAndFetchTasks = async () => {
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
        await fetchTasks();
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

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // 手动设置认证头，绕过apiClient的localStorage检查
      const supabase = supabaseSessionManager.getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please login to view tasks');
        return;
      }

      // 直接调用API
      const response = await fetch('/api/tasks', {
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
        setTasksData(data.data);
      } else {
        setError(data.error || 'Failed to load tasks');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAction = async (task: Task) => {
    if (task.status === 'completed') {
      // Claim reward
      await claimReward(task.taskKey);
    } else if (task.status === 'pending') {
      // Update progress or complete task
      await updateTaskProgress(task.taskKey);
    }
  };

  const claimReward = async (taskKey: string) => {
    try {
      setClaimingTask(taskKey);
      
      const supabase = supabaseSessionManager.getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Please login first');
        return;
      }

      const response = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ taskKey })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchTasks(); // Refresh tasks
        alert(`Congratulations! You earned ${data.data.pointsEarned} points!`);
      } else {
        alert(data.error || 'Failed to claim reward, please try again');
      }
    } catch (err) {
      console.error('Error claiming reward:', err);
      alert('Failed to claim reward, please try again');
    } finally {
      setClaimingTask(null);
    }
  };

  const updateTaskProgress = async (taskKey: string) => {
    try {
      const supabase = supabaseSessionManager.getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Please login first');
        return;
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          taskKey, 
          action: 'update_progress',
          progress: 1
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchTasks(); // Refresh tasks
        
        if (data.data.canClaim) {
          alert('Task completed! You can claim your reward now!');
        }
      }
    } catch (err) {
      console.error('Error updating task progress:', err);
    }
  };

  const getTaskIcon = (taskKey: string) => {
    switch (taskKey) {
      case 'daily_checkin':
        return <Calendar className="w-6 h-6 text-[#3D0B5B]" />;
      case 'create_chart':
        return <Star className="w-6 h-6 text-[#3D0B5B]" />;
      case 'join_community':
        return <Users className="w-6 h-6 text-[#3D0B5B]" />;
      case 'web3_connect':
        return <Zap className="w-6 h-6 text-[#3D0B5B]" />;
      case 'consecutive_checkin_7':
        return <TrendingUp className="w-6 h-6 text-[#3D0B5B]" />;
      case 'invite_friend':
        return <Users className="w-6 h-6 text-[#3D0B5B]" />;
      case 'on_chain_checkin':
        return <Link className="w-6 h-6 text-[#3D0B5B]" />;
      default:
        return <Trophy className="w-6 h-6 text-[#3D0B5B]" />;
    }
  };

  const getStatusBadge = (task: Task) => {
    if (task.status === 'claimed') {
      return (
        <Badge className="bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 font-rajdhani font-bold">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Claimed
        </Badge>
      );
    } else if (task.status === 'completed') {
      return (
        <Badge className="bg-[#FBCB0A]/20 border-[#FBCB0A]/50 text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold">
          <Sparkles className="w-3 h-3 mr-1" />
          Claimable
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-[#3D0B5B]/10 dark:bg-[#FBCB0A]/10 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold">
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    }
  };

  const getActionButton = (task: Task) => {
    if (task.status === 'claimed') {
      return (
        <Button 
          disabled 
          className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-rajdhani font-bold rounded-lg"
        >
          Completed
        </Button>
      );
    } else if (task.status === 'completed') {
      return (
        <Button
          onClick={() => handleTaskAction(task)}
          disabled={claimingTask === task.taskKey}
          className="bg-[#FBCB0A] text-[#3D0B5B] hover:bg-[#3D0B5B] hover:text-[#FBCB0A] font-rajdhani font-bold rounded-lg transition-all hover:-translate-y-1 disabled:opacity-50"
        >
          {claimingTask === task.taskKey ? 'Claiming...' : 'Claim Reward'}
        </Button>
      );
    } else {
      return (
        <Button
          onClick={() => handleTaskAction(task)}
          className="bg-[#FBCB0A]/10 dark:bg-black/25 text-[#3D0B5B] dark:text-[#FBCB0A] border border-[#3D0B5B]/50 dark:border-[#FBCB0A]/50 hover:bg-[#FBCB0A] hover:text-[#420868] dark:hover:text-[#1A2242] font-rajdhani font-bold transition-all duration-300 rounded-lg hover:-translate-y-1"
        >
          Start Task
        </Button>
      );
    }
  };

  return (
    <Web3Layout>
      {!isAuthenticated ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-xl bg-[#FBCB0A] flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-[#3D0B5B]" />
          </div>
          <h2 className="text-2xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A] mb-2 font-rajdhani">Login to View Tasks</h2>
          <p className="text-[#333333]/70 dark:text-[#E0E0E0]/70 mb-6 font-rajdhani">Please login to view and complete tasks</p>
          <Button 
            onClick={() => window.location.href = '/auth'}
            className="bg-[#FBCB0A] text-[#3D0B5B] border-2 border-[#FBCB0A] hover:bg-[#3D0B5B] hover:text-[#FBCB0A] font-rajdhani font-bold text-lg px-8 py-6 rounded-lg transition-all hover:-translate-y-1"
          >
            Go to Login
          </Button>
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-[#3D0B5B] dark:border-[#FBCB0A] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#333333] dark:text-[#E0E0E0] font-rajdhani">Loading tasks...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4 font-rajdhani">{error}</p>
          <Button 
            onClick={fetchTasks}
            className="bg-[#FBCB0A] text-[#3D0B5B] hover:bg-[#3D0B5B] hover:text-[#FBCB0A] font-rajdhani font-bold rounded-lg transition-all"
          >
            Retry
          </Button>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-[3.5rem] font-bold text-[#3D0B5B] dark:text-[#FBCB0A] mb-2 font-rajdhani leading-tight">
              Task Center
            </h1>
            <p className="text-[1.5rem] text-[#333333] dark:text-[#E0E0E0] font-normal font-rajdhani">
              Complete tasks and earn rewards in your Web3 journey
            </p>
          </div>

          {/* Stats Cards */}
          {tasksData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all hover:-translate-y-1 rounded-xl shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">Completed</CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-[#FBCB0A] flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-[#3D0B5B]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-[#333333] dark:text-[#E0E0E0]">
                      {tasksData.stats.completedTasks}
                    </span>
                    <span className="text-[#333333]/60 dark:text-[#E0E0E0]/60">/ {tasksData.stats.totalTasks}</span>
                  </div>
                  <p className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60 mt-2">Tasks Completed</p>
                </CardContent>
              </Card>

              <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all hover:-translate-y-1 rounded-xl shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">Points Earned</CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-[#FBCB0A] flex items-center justify-center">
                      <Star className="w-5 h-5 text-[#3D0B5B]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-[#333333] dark:text-[#E0E0E0]">{tasksData.stats.totalPointsEarned}</span>
                    <span className="text-[#333333]/60 dark:text-[#E0E0E0]/60">pts</span>
                  </div>
                  <p className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60 mt-2">Points Earned</p>
                </CardContent>
              </Card>

              <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all hover:-translate-y-1 rounded-xl shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">Available</CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-[#FBCB0A] flex items-center justify-center">
                      <Gift className="w-5 h-5 text-[#3D0B5B]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-[#333333] dark:text-[#E0E0E0]">{tasksData.stats.totalPointsAvailable}</span>
                    <span className="text-[#333333]/60 dark:text-[#E0E0E0]/60">pts</span>
                  </div>
                  <p className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60 mt-2">Points Available</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Category Selector */}
          <Card className="mb-8 bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[2rem] flex items-center">
                <Target className="w-6 h-6 mr-2" />
                Task Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => setActiveCategory('newbie')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:-translate-y-1 ${
                    activeCategory === 'newbie' 
                      ? 'border-[#FBCB0A] bg-[#FBCB0A]/10' 
                      : 'border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#FBCB0A]/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#FBCB0A] flex items-center justify-center">
                      <Users className="w-4 h-4 text-[#3D0B5B]" />
                    </div>
                    <h3 className="font-bold text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani">Beginner Tasks</h3>
                  </div>
                  <p className="text-sm text-[#333333]/70 dark:text-[#E0E0E0]/70">Simple tasks for first-time users to quickly get started with Web3 features</p>
                </div>
                
                <div 
                  onClick={() => setActiveCategory('advanced')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:-translate-y-1 ${
                    activeCategory === 'advanced' 
                      ? 'border-[#FBCB0A] bg-[#FBCB0A]/10' 
                      : 'border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#FBCB0A]/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#FBCB0A] flex items-center justify-center">
                      <Award className="w-4 h-4 text-[#3D0B5B]" />
                    </div>
                    <h3 className="font-bold text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani">Advanced Tasks</h3>
                  </div>
                  <p className="text-sm text-[#333333]/70 dark:text-[#E0E0E0]/70">Advanced tasks that require more time and effort, offering generous rewards</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Grid */}
          {tasksData && (
            <div className="grid gap-6 mb-8">
              {tasksData.tasksByCategory[activeCategory].map((task) => (
                <Card key={task.id} className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all hover:-translate-y-1 rounded-xl shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-[#FBCB0A] flex items-center justify-center">
                          {getTaskIcon(task.taskKey)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-[1.5rem] font-bold text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani">{task.title}</h3>
                            {getStatusBadge(task)}
                          </div>
                          <p className="text-[#333333]/70 dark:text-[#E0E0E0]/70 mb-4 font-rajdhani">{task.description}</p>
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-[#FBCB0A] flex items-center justify-center">
                                <Star className="w-3 h-3 text-[#3D0B5B]" />
                              </div>
                              <span className="text-[#3D0B5B] dark:text-[#FBCB0A] font-bold font-rajdhani">{task.pointsReward} Points</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-[#FBCB0A] flex items-center justify-center">
                                <Clock className="w-3 h-3 text-[#3D0B5B]" />
                              </div>
                              <span className="text-[#333333] dark:text-[#E0E0E0] font-rajdhani">{task.taskType === 'daily' ? 'Daily Task' : 'One-time Task'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        {getActionButton(task)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Progress Overview */}
          {tasksData && (
            <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[2rem] flex items-center">
                  <Sparkles className="w-6 h-6 mr-2" />
                  Overall Progress
                </CardTitle>
                <CardDescription className="text-[#333333]/70 dark:text-[#E0E0E0]/70 font-rajdhani">
                  Track your journey to Web3 mastery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress 
                    value={(tasksData.stats.completedTasks / tasksData.stats.totalTasks) * 100} 
                    className="h-3"
                  />
                  <div className="flex justify-between text-sm font-rajdhani">
                    <span className="text-[#333333] dark:text-[#E0E0E0]">
                      Completed {tasksData.stats.completedTasks} tasks
                    </span>
                    <span className="text-[#333333]/60 dark:text-[#E0E0E0]/60">
                      {tasksData.stats.pendingTasks} tasks remaining
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </Web3Layout>
  );
}