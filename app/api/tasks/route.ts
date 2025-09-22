import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/server/db';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isAddress } from 'viem';

// 获取任务列表及用户完成状态
const supabaseAdmin: SupabaseClient = getSupabaseAdminClient();

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份 - 支持Web2和Web3用户
    let userId: string | null = null;
    let walletAddress: string | null = null;

    // 尝试获取Web3用户信息
    const web3UserHeader = request.headers.get('X-Web3-User');
    if (web3UserHeader) {
      try {
        const web3User = JSON.parse(decodeURIComponent(atob(web3UserHeader)));
        walletAddress = web3User.walletAddress?.toLowerCase();
        if (!isAddress(walletAddress as `0x${string}`)) {
          walletAddress = null;
        }
      } catch (e) {
        console.warn('Failed to parse Web3 user header:', e);
      }
    }

    // 尝试获取Web2用户信息
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ') && !walletAddress) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (!authError && user) {
          userId = user.id;
        }
      } catch (e) {
        console.warn('Failed to authenticate Web2 user:', e);
      }
    }

    // 如果两种认证都失败，返回错误
    if (!userId && !walletAddress) {
      return NextResponse.json({ 
        error: 'Authentication required. Please login or connect wallet.' 
      }, { status: 401 });
    }

    // 获取所有活跃任务
    const { data: tasks, error: tasksError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    // 获取用户的任务完成状态
    let userTasksQuery = supabaseAdmin
      .from('user_tasks')
      .select('task_id, status, progress, completed_at, claimed_at, metadata');

    if (userId) {
      userTasksQuery = userTasksQuery.eq('user_id', userId);
    } else if (walletAddress) {
      userTasksQuery = userTasksQuery.eq('wallet_address', walletAddress);
    }

    const { data: userTasks, error: userTasksError } = await userTasksQuery;

    if (userTasksError) {
      console.error('Error fetching user tasks:', userTasksError);
      return NextResponse.json({ error: 'Failed to fetch user task status' }, { status: 500 });
    }

    // 创建用户任务状态映射
    const userTasksMap = new Map();
    userTasks?.forEach(ut => {
      userTasksMap.set(ut.task_id, ut);
    });

    // 组合任务数据和用户状态
    const tasksWithStatus = tasks?.map(task => {
      const userTask = userTasksMap.get(task.id);
      
      return {
        id: task.id,
        taskKey: task.task_key,
        title: task.title,
        description: task.description,
        taskType: task.task_type,
        category: task.category,
        pointsReward: task.points_reward,
        requirements: task.requirements,
        status: userTask?.status || 'pending',
        progress: userTask?.progress || 0,
        completedAt: userTask?.completed_at,
        claimedAt: userTask?.claimed_at,
        metadata: userTask?.metadata
      };
    }) || [];

    // 按类别分组任务
    const tasksByCategory = {
      newbie: tasksWithStatus.filter(t => t.category === 'newbie'),
      advanced: tasksWithStatus.filter(t => t.category === 'advanced')
    };

    // 计算统计信息
    const stats = {
      totalTasks: tasksWithStatus.length,
      completedTasks: tasksWithStatus.filter(t => t.status === 'completed' || t.status === 'claimed').length,
      pendingTasks: tasksWithStatus.filter(t => t.status === 'pending').length,
      totalPointsEarned: tasksWithStatus
        .filter(t => t.status === 'claimed')
        .reduce((sum, t) => sum + t.pointsReward, 0),
      totalPointsAvailable: tasksWithStatus
        .filter(t => t.status === 'pending' || t.status === 'completed')
        .reduce((sum, t) => sum + t.pointsReward, 0)
    };

    return NextResponse.json({
      success: true,
      data: {
        tasks: tasksWithStatus,
        tasksByCategory,
        stats,
        userInfo: {
          userId,
          walletAddress: walletAddress?.slice(0, 6) + '...' + walletAddress?.slice(-4) || null
        }
      }
    });

  } catch (error) {
    console.error('Tasks API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 创建或更新用户任务状态
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    let userId: string | null = null;
    let walletAddress: string | null = null;

    const web3UserHeader = request.headers.get('X-Web3-User');
    if (web3UserHeader) {
      try {
        const web3User = JSON.parse(decodeURIComponent(atob(web3UserHeader)));
        walletAddress = web3User.walletAddress?.toLowerCase();
        if (!isAddress(walletAddress as `0x${string}`)) {
          walletAddress = null;
        }
      } catch (e) {
        console.warn('Failed to parse Web3 user header:', e);
      }
    }

    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ') && !walletAddress) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (!authError && user) {
          userId = user.id;
        }
      } catch (e) {
        console.warn('Failed to authenticate Web2 user:', e);
      }
    }

    if (!userId && !walletAddress) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { taskKey, action = 'update_progress', progress, metadata } = body;

    if (!taskKey) {
      return NextResponse.json({ 
        error: 'Task key is required' 
      }, { status: 400 });
    }

    // 获取任务信息
    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('task_key', taskKey)
      .eq('is_active', true)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ 
        error: 'Task not found or inactive' 
      }, { status: 404 });
    }

    // 查找或创建用户任务记录
    let userTaskQuery = supabaseAdmin
      .from('user_tasks')
      .select('*')
      .eq('task_id', task.id);

    if (userId) {
      userTaskQuery = userTaskQuery.eq('user_id', userId);
    } else if (walletAddress) {
      userTaskQuery = userTaskQuery.eq('wallet_address', walletAddress);
    }

    const { data: existingUserTask } = await userTaskQuery.single();

    let userTask;
    
    if (existingUserTask) {
      // 更新现有记录
      const updateData: any = { updated_at: new Date().toISOString() };
      
      if (progress !== undefined) {
        updateData.progress = progress;
      }
      
      if (metadata) {
        updateData.metadata = { ...existingUserTask.metadata, ...metadata };
      }

      // 检查是否达到完成条件
      const requirements = task.requirements as any;
      const shouldComplete = checkTaskCompletion(task, updateData.progress || existingUserTask.progress, updateData.metadata || existingUserTask.metadata);
      
      if (shouldComplete && existingUserTask.status === 'pending') {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
      }

      const { data: updatedTask, error: updateError } = await supabaseAdmin
        .from('user_tasks')
        .update(updateData)
        .eq('id', existingUserTask.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user task:', updateError);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
      }

      userTask = updatedTask;
    } else {
      // 创建新记录
      const newUserTask: any = {
        task_id: task.id,
        progress: progress || 0,
        metadata: metadata || {},
      };

      if (userId) {
        newUserTask.user_id = userId;
      } else if (walletAddress) {
        newUserTask.wallet_address = walletAddress;
      }

      // 检查是否立即完成
      const shouldComplete = checkTaskCompletion(task, newUserTask.progress, newUserTask.metadata);
      if (shouldComplete) {
        newUserTask.status = 'completed';
        newUserTask.completed_at = new Date().toISOString();
      }

      const { data: createdTask, error: createError } = await supabaseAdmin
        .from('user_tasks')
        .insert(newUserTask)
        .select()
        .single();

      if (createError) {
        console.error('Error creating user task:', createError);
        return NextResponse.json({ error: 'Failed to create task record' }, { status: 500 });
      }

      userTask = createdTask;
    }

    return NextResponse.json({
      success: true,
      data: {
        taskId: task.id,
        taskKey: task.task_key,
        status: userTask.status,
        progress: userTask.progress,
        pointsReward: task.points_reward,
        canClaim: userTask.status === 'completed',
        completedAt: userTask.completed_at
      }
    });

  } catch (error) {
    console.error('Tasks POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 检查任务完成条件的辅助函数
function checkTaskCompletion(task: any, progress: number, metadata: any): boolean {
  const requirements = task.requirements as any;
  
  if (!requirements) return false;

  switch (requirements.action) {
    case 'checkin':
      return progress >= (requirements.count || 1);
    
    case 'consecutive_checkin':
      return progress >= (requirements.days || 7);
    
    case 'create_chart':
      return progress >= (requirements.count || 1);
    
    case 'connect_wallet':
      return progress >= 1;
    
    case 'visit_link':
      return progress >= 1;
    
    case 'referral':
      return progress >= (requirements.count || 1);
    
    case 'on_chain_checkin':
      return progress >= (requirements.count || 1);
    
    default:
      return false;
  }
}
