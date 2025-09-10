'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { ScrollArea } from './ui/scroll-area'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { 
  Zap, 
  CheckCircle, 
  Eye,
  Loader2,
  Square,
  RotateCcw,
  Save
} from 'lucide-react'
import { useStreamingAnalysis } from '@/hooks/useStreamingAnalysis'
import { supabase } from '@/lib/supabase'
import { getElement, Element as WuxingElement } from '@/lib/zodiac/elements'

const getElementColor = (element: WuxingElement | undefined): string => {
  if (!element) return 'text-muted-foreground dark:text-slate-400';
  switch (element) {
    case '木': return 'text-emerald-500 dark:text-emerald-400';
    case '火': return 'text-rose-500 dark:text-rose-400';
    case '土': return 'text-amber-700 dark:text-stone-400';
    case '金': return 'text-yellow-600 dark:text-yellow-400';
    case '水': return 'text-sky-500 dark:text-sky-400';
    default: return 'text-muted-foreground dark:text-slate-400';
  }
};

interface BaziData {
  yearPillar: string
  monthPillar: string
  dayPillar: string
  hourPillar: string
  gender: '男' | '女'
}

interface TiekouZhiduanAgentProps {
  baziData: BaziData
  userId: string
  selectedRecord?: any
  updateRecord?: (id: string, updates: any) => void
  onAnalysisComplete?: (result: string) => void
}

export function TiekouZhiduanAgent({ 
  baziData, 
  userId, 
  selectedRecord,
  updateRecord,
  onAnalysisComplete 
}: TiekouZhiduanAgentProps) {
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [existingAnalysis, setExistingAnalysis] = useState<any>(null)
  
  // 流式分析状态
  const [taskId, setTaskId] = useState<string | null>(null)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)
  
  // 保存状态
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // 使用流式分析Hook
  const streaming = useStreamingAnalysis({
    taskId,
    enabled: true,
    onComplete: (fullContent) => {
      console.log('✅ 铁口直断分析完成，总内容长度:', fullContent.length)
      
      // 保存结果到本地记录（兼容离线浏览）
      if (selectedRecord && updateRecord) {
        const cacheKey = generateCacheKey();
        const analysisKey = `tiekou_${cacheKey}`;
        
        const aiAnalyses = selectedRecord.aiAnalyses || {};
        aiAnalyses[analysisKey] = {
          result: fullContent,
          timestamp: new Date().toISOString(),
          type: 'tiekou',
          powered_by: 'DIFY流式分析',
          character_count: streaming.characterCount,
          analysis_duration: streaming.elapsedTime
        };
        
        updateRecord(selectedRecord.id, {
          aiAnalyses,
          lastModified: new Date().toISOString()
        });
        
        // 更新existingAnalysis状态
        setExistingAnalysis(aiAnalyses[analysisKey]);
      }
      
      if (onAnalysisComplete) {
        onAnalysisComplete(fullContent);
      }
    },
    onError: (error) => {
      console.error('❌ 铁口直断分析错误:', error)
      setTaskError(error)
    }
  })

  // 生成缓存键
  const generateCacheKey = useCallback(() => {
    const baziString = `${(baziData as any).yearPillar}_${(baziData as any).monthPillar}_${(baziData as any).dayPillar}_${(baziData as any).hourPillar}`;
    return `${baziString}_${baziData.gender}`;
  }, [baziData]);

  // 检查现有分析结果
  const checkExistingAnalysis = useCallback(() => {
    if (!selectedRecord) return null;
    
    const cacheKey = generateCacheKey();
    const analysisKey = `tiekou_${cacheKey}`;
    
    if (selectedRecord.aiAnalyses && selectedRecord.aiAnalyses[analysisKey]) {
      return selectedRecord.aiAnalyses[analysisKey];
    }
    
    return null;
  }, [selectedRecord, generateCacheKey]);

  // 初始化时检查现有分析
  useEffect(() => {
    const existing = checkExistingAnalysis();
    setExistingAnalysis(existing);
  }, [checkExistingAnalysis]);

  // 重置分析状态
  const resetAnalysis = () => {
    setTaskId(null)
    setTaskError(null)
    streaming.resetStream()
  }

  // 创建流式分析任务
  const createStreamingTask = useCallback(async () => {
    if (!(baziData as any).yearPillar || !(baziData as any).dayPillar) {
      console.error('请先排出完整的八字');
      return;
    }

    try {
      setIsCreatingTask(true)
      setTaskError(null)
      console.log('🔥 创建铁口直断流式分析任务...')

      // 获取认证头
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('用户未登录，请先登录后再进行分析')
      }

      // 🛡️ 安全检查：余额、并发、频率等
      console.log('🛡️ 执行安全检查...')
      const guardResponse = await fetch('/api/analysis-guard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          analysisType: 'tiekou_zhiduan'
        })
      })

      const guardData = await guardResponse.json()

      if (!guardResponse.ok || !guardData.success) {
        // 根据错误类型显示不同的提示
        const errorType = guardData.details?.type
        let userMessage = guardData.error

        if (errorType === 'INSUFFICIENT_BALANCE') {
          userMessage = `报告点数不足！当前余额：${guardData.details.balance.totalRemaining}次，需要：1次。请购买更多点数后再试。`
        } else if (errorType === 'CONCURRENCY_LIMIT') {
          userMessage = `同时运行的分析已达上限（${guardData.details.runningTasks.length}/2个）。请等待当前分析完成后再试。`
        } else if (errorType === 'RATE_LIMIT') {
          userMessage = `请求过于频繁，请1分钟后再试。`
        }

        throw new Error(userMessage)
      }

      console.log('✅ 安全检查通过，可以启动分析')

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }

      // 创建分析任务 - 直接存入analysis_tasks表
      const cacheKey = generateCacheKey();
      const taskData = {
        user_id: session.user.id,
        task_type: 'bazi',
        status: 'pending',
        input_data: {
          cacheKey: `tiekou_${Date.now()}`,
          baziData: {
            yearPillar: (baziData as any).yearPillar,
            monthPillar: (baziData as any).monthPillar,
            dayPillar: (baziData as any).dayPillar,
            hourPillar: (baziData as any).hourPillar,
            gender: baziData.gender,
            year: (baziData as any).year || '未知',
            month: (baziData as any).month || '未知',
            day: (baziData as any).day || '未知',
            hour: (baziData as any).hour || (baziData as any).hourPillar,
            ganzhiString: `${(baziData as any).yearPillar} ${(baziData as any).monthPillar} ${(baziData as any).dayPillar} ${(baziData as any).hourPillar}`
          },
          analysisType: 'tiekou_zhiduan'
        },
        created_at: new Date().toISOString()
      }

      // 插入任务到数据库
      const { data: task, error: insertError } = await supabase
        .from('analysis_tasks')
        .insert([taskData])
        .select()
        .single()

      if (insertError) {
        throw new Error(`创建任务失败: ${insertError.message}`)
      }

      console.log('✅ 铁口直断流式任务创建成功:', task.id)
      setTaskId(task.id)

    } catch (error) {
      console.error('❌ 创建铁口直断流式任务失败:', error)
      setTaskError(error instanceof Error ? error.message : '未知错误')
    } finally {
      setIsCreatingTask(false)
    }
  }, [baziData, generateCacheKey]);

  // 显示分析结果
  const handleShowResult = (result: string) => {
    setShowResultDialog(true);
  };

  // 获取进度百分比
  const getProgress = () => {
    if (!streaming.isStreaming && !streaming.isCompleted) return 0
    if (streaming.isCompleted) return 100
    
    const timeProgress = Math.min(streaming.elapsedTime * 2, 80)
    const contentProgress = Math.min(streaming.characterCount / 20, 20)
    return timeProgress + contentProgress
  }

  return (
    <>
      <div className="w-full space-y-4">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            💡 <strong>铁口直断</strong>：盲派八字的核心技法，通过分析四柱干支关系，直接断出性格、事业、财运、感情等关键人生信息。
          </p>
        </div>

        {/* 显示现有分析结果提示 */}
        {existingAnalysis && !streaming.isStreaming && !isCreatingTask && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-blue-800 dark:text-blue-200 text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              已有铁口直断报告 (生成于 {new Date(existingAnalysis.timestamp).toLocaleString()})
            </div>
          </div>
        )}

        {/* 流式分析进度显示 */}
        {(streaming.isStreaming || streaming.isCompleted) && (
          <div className="space-y-4">
            {/* 进度条 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>分析进度</span>
                <span>{streaming.isCompleted ? '100%' : '进行中...'}</span>
              </div>
              <Progress 
                value={getProgress()} 
                className="w-full" 
              />
            </div>

            {/* 统计信息 */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium text-foreground text-xs">用时</div>
                <div className="text-muted-foreground text-xs">{streaming.formattedElapsedTime}</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium text-foreground text-xs">字符数</div>
                <div className="text-muted-foreground text-xs">{streaming.characterCount}</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium text-foreground text-xs">速度</div>
                <div className="text-muted-foreground text-xs">{streaming.elapsedTime > 0 ? Math.round(streaming.characterCount / streaming.elapsedTime) : 0} 字符/秒</div>
              </div>
            </div>

            {/* 实时内容显示 */}
            {streaming.content && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className={`w-4 h-4 ${streaming.isStreaming ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-medium">实时分析内容</span>
                  </div>
                  {streaming.isCompleted && (
                    <Badge variant="default" className="bg-green-600">已完成</Badge>
                  )}
                </div>
                <div 
                  ref={streaming.setContentRef}
                  className="max-h-80 sm:max-h-96 md:max-h-[28rem] lg:max-h-[32rem] overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900 rounded-md scroll-smooth"
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {streaming.content}
                    {streaming.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-yellow-500 animate-pulse ml-1" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 错误信息 */}
        {(taskError || streaming.error || saveError) && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-300">
              <span className="font-medium">错误: </span>
              {taskError || streaming.error || saveError}
            </p>
          </div>
        )}

        {/* 保存成功信息 */}
        {saveSuccess && (
          <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-sm text-green-700 dark:text-green-300">
              <span className="font-medium">✅ 保存成功! </span>
              分析结果已保存到您的命书中。
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col gap-3 pt-4">
          {/* 第一行：查看已有报告或开始分析 */}
          <div className="flex gap-2 flex-wrap">
            {/* 显示现有分析结果按钮 */}
            {existingAnalysis && !streaming.isStreaming && !isCreatingTask && (
              <Button 
                onClick={() => handleShowResult(existingAnalysis.result)}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white border-0"
              >
                <Eye className="h-4 w-4" />
                查看已有报告
              </Button>
            )}

            {/* 开始分析按钮 */}
            {!streaming.isStreaming && !isCreatingTask && (
              <Button 
                onClick={createStreamingTask}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white border-0"
                disabled={!(baziData as any).yearPillar || !(baziData as any).dayPillar}
                variant={existingAnalysis ? "outline" : "default"}
              >
                <Zap className="h-4 w-4" />
                {existingAnalysis ? "重新直断" : "开始铁口直断"}
              </Button>
            )}

            {/* 创建任务中按钮 */}
            {isCreatingTask && (
              <Button disabled className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                创建任务中...
              </Button>
            )}
          </div>

          {/* 第二行：停止分析和重置（同行） */}
          {streaming.isStreaming && (
            <div className="flex gap-2">
              <Button 
                onClick={streaming.stopStreaming}
                variant="destructive"
                className="flex items-center gap-2 flex-1"
              >
                <Square className="h-4 w-4" />
                停止分析
              </Button>
              {(taskId || streaming.error || taskError) && (
                <Button 
                  onClick={resetAnalysis}
                  variant="outline"
                  className="flex items-center gap-2 flex-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  重置
                </Button>
              )}
            </div>
          )}

          {/* 第三行：查看完整报告、重置、保存（三个按钮） */}
          {streaming.isCompleted && streaming.fullContent && (
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={() => setShowResultDialog(true)}
                variant="outline"
                className="flex items-center gap-2 flex-1 min-w-0 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <Eye className="w-4 h-4" />
                查看报告
              </Button>
              {(taskId || streaming.error || taskError) && (
                <Button 
                  onClick={resetAnalysis}
                  variant="outline"
                  className="flex items-center gap-2 flex-1 min-w-0 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  <RotateCcw className="w-4 h-4" />
                  重置
                </Button>
              )}
              <Button 
                onClick={() => {/* TODO: 实现保存功能 */}}
                variant="outline"
                className="flex items-center gap-2 flex-1 min-w-0 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <Save className="w-4 h-4" />
                保存
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 分析结果对话框 */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              铁口直断分析报告
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="mt-4 max-h-96">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-slate-300 leading-relaxed">
                {existingAnalysis?.result || streaming.fullContent || '暂无分析结果'}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
} 