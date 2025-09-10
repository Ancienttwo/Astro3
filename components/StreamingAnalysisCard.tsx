'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Play, Square, RotateCcw, CheckCircle, Eye, Copy, Target, Save } from 'lucide-react'
import { SIHUA_MAP } from '@/lib/zodiac/sihua'
import type { PalaceData, HeavenlyStem } from '@/app/ziwei/page'
import { useStreamingAnalysis } from '@/hooks/useStreamingAnalysis'
import { supabase } from '@/lib/supabase'
import { extractYongShenFromReport, generateYongShenSummary, type YongShenData } from '@/lib/services/yongshen-extractor'

// 🔥 构建完整的四化分析查询
const buildCompleteSihuaQuery = (palaces: PalaceData[], yearGan: HeavenlyStem) => {
  console.log('🚀 开始构建四化查询 (在Agent内部)');
  console.log('🔍 传入参数:', { yearGan, palacesCount: palaces.length });
  
  // 获取生年四化映射
  const sihuaMap = SIHUA_MAP[yearGan];
  if (!sihuaMap) {
    console.error('❌ 无法获取生年四化映射:', yearGan, 'SIHUA_MAP键:', Object.keys(SIHUA_MAP));
    return `生年四化查询构建失败：无法找到年干${yearGan}的四化映射`;
  }

  // 查找来因宫
  const laiYinPalace = palaces.find(p => p.isLaiYinPalace);
  const laiYinGongName = laiYinPalace ? laiYinPalace.name : '未知';

  // 构建查询字符串
  let query = `请进行生年四化与来因宫分析：

数据：
来因宫：${laiYinGongName}

生年四化星与宫：`;

  // 遍历ABCD四化
  const sihuaTypes = [
    { key: '禄', letter: 'A', name: '化禄' },
    { key: '权', letter: 'B', name: '化权' },
    { key: '科', letter: 'C', name: '化科' },
    { key: '忌', letter: 'D', name: '化忌' }
  ] as const;

  sihuaTypes.forEach(({ key, letter, name }) => {
    const sihuaStar = sihuaMap[key];
    if (!sihuaStar) return;

    // 查找四化星所在的宫位
    let foundPalace: PalaceData | null = null;
    for (const palace of palaces) {
      const foundStar = palace.stars?.find(star => star.name === sihuaStar);
      if (foundStar) {
        foundPalace = palace;
        break;
      }
    }

    if (foundPalace) {
      // 构建该宫位所有星曜的信息
      const allStarsInfo = foundPalace.stars?.map(star => {
        let starInfo = `${star.name}(${star.brightness})`;
        
        // 先收集所有四化标记
        const sihuaMarks: string[] = [];
        
        // 添加生年四化标记
        if (star.sihua) {
          sihuaMarks.push(star.sihua);
        }
        
        // 添加自化标记（从palaceHua中获取）
        if (star.palaceHua && star.palaceHua.length > 0) {
          star.palaceHua.forEach(hua => {
            if (hua.startsWith('i')) {
              sihuaMarks.push(`i${hua.substring(1)}`); // 向心自化
            } else if (hua.startsWith('x')) {
              sihuaMarks.push(`x${hua.substring(1)}`); // 离心自化
            }
          });
        }
        
        // 用空格连接所有四化标记，在星曜名称后先加空格
        if (sihuaMarks.length > 0) {
          starInfo += ' ' + sihuaMarks.join(' ');
        }
        
        return starInfo;
      }).join('、') || '无星曜';

      query += `\n${letter}${name}：${foundPalace.name} - ${allStarsInfo}`;
    } else {
      query += `\n${letter}${name}：${sihuaStar}未入盘`;
    }
  });

  query += `\n\n解释重点：
1. 因为生年四化皆由来因宫而来，所以生年四化的解释必须结合以下的要素：四化的宫位、四化、四化星曜、来因宫与四化宫的关系（来因宫给了四化宫某个生年四化，结合星曜和宫位推断）
2. 如有自化，必须结合其生年四化解。如某宫有贪狼 xD A，则先解释A，再结合D所在的宫位来解释xD。
3. 每一个生年四化必须结合来因宫详细解释

注：ABCD是生年禄权科忌，x是离心自化（有破耗的含义），i是向心自化（有付出的含义），xA是离心禄。`;

  console.log('✅ 四化查询构建完成');
  return query;
};

interface StreamingAnalysisCardProps {
  title: string
  analysisType: 'tiekou' | 'yongshen' | 'ziwei' | 'sihua' | 'sihua_reasoning'
  analysisData: any
  agentName: string
  icon?: React.ComponentType<{ className?: string }>
  onYongShenExtracted?: (yongShenData: YongShenData) => void
}

export function StreamingAnalysisCard({
  title,
  analysisType,
  analysisData,
  agentName,
  icon: Icon,
  onYongShenExtracted
}: StreamingAnalysisCardProps) {
  // 流式分析状态
  const [taskId, setTaskId] = useState<string | null>(null)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)
  
  // 保存状态
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  
  // 报告查看状态
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  
  // 用神信息状态
  const [yongShenData, setYongShenData] = useState<YongShenData | null>(null)

  // 使用流式分析Hook
  const streaming = useStreamingAnalysis({
    taskId,
    enabled: true,
    onComplete: (fullContent) => {
      console.log(`✅ ${title}分析完成，总内容长度:`, fullContent.length)
      
      // 如果是用神分析，立即提取用神信息
      if (analysisType === 'yongshen' && fullContent) {
        const extractedYongShen = extractYongShenFromReport(fullContent)
        if (extractedYongShen) {
          console.log('🎯 流式分析完成，提取到用神信息:', extractedYongShen)
          setYongShenData(extractedYongShen)
          if (onYongShenExtracted) {
            onYongShenExtracted(extractedYongShen)
          }
          
          // 🔥 新增：将用神信息保存到命书记录中
          saveYongShenToRecord(extractedYongShen)
        } else {
          console.warn('⚠️ 流式分析完成，但未能提取到用神信息')
        }
      }
    },
    onError: (error) => {
      console.error(`❌ ${title}分析错误:`, error)
      setTaskError(error)
    }
  })

  // 重置状态
  const resetAnalysis = () => {
    setTaskId(null)
    setTaskError(null)
    setSaveSuccess(false)
    setSaveError(null)
    streaming.resetStream()
  }

  // 🔥 新增：保存用神信息到命书记录
  const saveYongShenToRecord = async (yongShenData: YongShenData) => {
    try {
      // 获取当前用户session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.warn('⚠️ 用户未登录，无法保存用神信息到命书')
        return
      }

      // 构建用神保存数据
      const yongShenInfo = {
        primaryYongShen: yongShenData.primaryYongShen,
        secondaryYongShen: yongShenData.secondaryYongShen,
        jiShen: yongShenData.jiShen,
        geLu: yongShenData.geLu,
        analysisDate: yongShenData.analysisDate,
        confidence: yongShenData.confidence,
        summary: generateYongShenSummary(yongShenData)
      }

      console.log('💾 准备保存用神信息到命书:', yongShenInfo)

      // 调用API保存用神信息到命书记录
      const response = await fetch('/api/charts/save-yongshen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          birth_data: {
            name: analysisData.username || analysisData.name || '',
            year: analysisData.year || new Date().getFullYear(),
            month: analysisData.month || 1,
            day: analysisData.day || 1,
            hour: analysisData.hour || 12,
            gender: analysisData.gender || 'male'
          },
          chart_type: 'bazi',
          yongshen_info: yongShenInfo
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '保存用神信息失败')
      }

      const result = await response.json()
      if (result.success) {
        console.log('✅ 用神信息已保存到命书:', result.chart_id)
      } else {
        throw new Error(result.error || '保存用神信息失败')
      }

    } catch (error) {
      console.error('❌ 保存用神信息到命书失败:', error)
      // 不影响主流程，只记录错误
    }
  }

  // 启动分析
  const startAnalysis = async () => {
    try {
      setIsCreatingTask(true)
      setTaskError(null)
      console.log(`🚀 创建${title}流式分析任务...`)

      // 获取认证头
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('用户未登录，请先登录后再进行分析')
      }

      // 创建分析任务 - 直接存入analysis_tasks表
      let requestData: any
      let analysis_type: string

      switch (analysisType) {
        case 'tiekou':
          analysis_type = 'tiekou_zhiduan'
          requestData = {
            cacheKey: `tiekou_${Date.now()}`,
            baziData: {
              ...analysisData,
              year: analysisData.year || '未知',
              month: analysisData.month || '未知',
              day: analysisData.day || '未知',
              hour: analysisData.hour || analysisData.hourPillar || '未知',
              ganzhiString: analysisData.ganzhiString || `${analysisData.yearPillar} ${analysisData.monthPillar} ${analysisData.dayPillar} ${analysisData.hourPillar}`
            },
            analysisType: analysis_type
          }
          break
        case 'yongshen':
          analysis_type = 'yongshen_analysis'
          requestData = {
            cacheKey: `yongshen_${Date.now()}`,
            baziData: {
              ...analysisData,
              year: analysisData.year || '未知',
              month: analysisData.month || '未知',
              day: analysisData.day || '未知',
              hour: analysisData.hour || analysisData.hourPillar || '未知',
              ganzhiString: analysisData.ganzhiString || `${analysisData.yearPillar} ${analysisData.monthPillar} ${analysisData.dayPillar} ${analysisData.hourPillar}`
            },
            analysisType: analysis_type
          }
          break
        case 'ziwei':
          analysis_type = 'ziwei_reasoning'
          requestData = {
            cacheKey: `ziwei_${Date.now()}`,
            ziweiData: analysisData,
            analysisType: analysis_type
          }
          break
        case 'sihua':
        case 'sihua_reasoning':
          analysis_type = 'sihua_reasoning'
          // 🔥 在这里构建完整的四化查询
          const sihuaQuery = analysisData.palaces && analysisData.yearGan ? 
            buildCompleteSihuaQuery(analysisData.palaces, analysisData.yearGan) : 
            `请进行生年四化与来因宫分析：\n\n数据：\n来因宫：未知\n\n生年四化星与宫：\n数据不完整\n\n解释重点：\n请根据提供的数据进行分析。`;
            
          requestData = {
            cacheKey: `sihua_${Date.now()}`,
            sihuaData: { ...analysisData, query: sihuaQuery },
            analysisType: analysis_type
          }
          break
        default:
          throw new Error('未知的分析类型')
      }

      const taskData = {
        user_id: session.user.id,
        user_email: session.user.email || '',
        task_type: (analysisType === 'ziwei' || analysisType === 'sihua' || analysisType === 'sihua_reasoning') ? 'ziwei' : 'bazi',
        status: 'pending',
        input_data: requestData,
        created_at: new Date().toISOString()
      }

      // 插入任务到数据库 - 使用API路由以避免RLS限制
      const response = await fetch('/api/analysis-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(taskData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '创建任务失败')
      }

      const task = await response.json()

      console.log(`✅ ${title}流式任务创建成功:`, task.id)
      setTaskId(task.id)
      
      // 🔥 任务创建成功，自动启动机制会在useEffect中处理启动逻辑

    } catch (error) {
      console.error(`❌ ${title}分析失败:`, error)
      setTaskError(error instanceof Error ? error.message : '未知错误')
    } finally {
      setIsCreatingTask(false)
    }
  }

  // 手动保存分析结果（简化版）
  const saveAnalysisResult = async () => {
    if (!streaming.fullContent) {
      setSaveError('没有可保存的分析结果')
      return
    }

    console.log('💾 开始手动保存分析结果...')
    await performManualSave()
  }

  // 执行手动保存的函数
  const performManualSave = async () => {
    try {
      setIsSaving(true)
      setSaveError(null)
      console.log('💾 开始手动保存分析结果...')

      // 获取认证头
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('用户未登录，无法保存')
      }

      // 调用保存API
      const response = await fetch('/api/ai-analyses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          analysis_type: getAnalysisType(),
          content: streaming.fullContent,
          agent_name: agentName,
          birth_data: {
            name: analysisData.username || analysisData.name || '',
            year: analysisData.year || new Date().getFullYear(),
            month: analysisData.month || 1,
            day: analysisData.day || 1,
            hour: analysisData.hour || 12,
            gender: analysisData.gender || 'male'
          },
          chart_type: analysisType === 'ziwei' || analysisType === 'sihua' || analysisType === 'sihua_reasoning' ? 'ziwei' : 'bazi'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // 特殊处理命盘不存在的错误
        if (errorData.error && 
            (errorData.error.includes('命盘不存在') || 
             errorData.error.includes('无权限访问') || 
             response.status === 404)) {
          console.log('⚠️ 命盘不存在或无权限访问，取消保存操作');
          setSaveError('相关命盘已被删除，无法保存分析结果');
          return;
        }
        
        throw new Error(errorData.error || '手动保存失败')
      }

      const result = await response.json()
      console.log('✅ 手动保存成功:', result)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)

    } catch (error) {
      console.error('❌ 手动保存失败:', error)
      
      // 如果是命盘不存在相关错误，提供友好提示
      if (error instanceof Error && 
          (error.message.includes('命盘不存在') || 
           error.message.includes('无权限访问') || 
           error.message.includes('HTTP 404'))) {
        setSaveError('相关命盘已被删除，无法保存分析结果');
        return;
      }
      
      setSaveError(error instanceof Error ? error.message : '手动保存失败')
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  // 获取分析类型的辅助函数
  const getAnalysisType = () => {
    switch (analysisType) {
      case 'tiekou':
        return 'tiekou_zhiduan'
      case 'yongshen':
        return 'yongshen_analysis'
      case 'ziwei':
        return 'ziwei_reasoning'
      case 'sihua':
      case 'sihua_reasoning':
        return 'sihua_reasoning'
      default:
        return 'unknown'
    }
  }

  // 复制报告内容
  const copyReportContent = async () => {
    try {
      const content = streaming.fullContent || streaming.content || ''
      await navigator.clipboard.writeText(content)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* 用神解释说明 - 仅在用神分析时显示 */}
      {analysisType === 'yongshen' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-4 sm:p-6 border border-amber-200 dark:border-amber-800">
          <div className="space-y-4">
            {/* 标题部分 */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <h3 className="text-lg sm:text-xl font-bold text-amber-800 dark:text-amber-300">
                什么是用神？
              </h3>
            </div>
            
            {/* 核心定义 */}
            <p className="text-sm sm:text-base text-amber-700 dark:text-amber-200 leading-relaxed">
              用神是八字命理学的核心概念，指八字命局中能平衡五行、调和矛盾、增强有利因素的关键元素。
              其作用类似"药方"，通过补足日干（命主）的五行短板或抑制过旺能量，使命局达到动态平衡。
            </p>
            
            {/* 实际意义 - 响应式网格布局 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-amber-300 dark:border-amber-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🧭</span>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300">命运指导</h4>
                </div>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-200">
                  用神决定命主适合的行业、方位、颜色等（如用神为火→宜南方/红色/能源行业）
                </p>
              </div>
              
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-amber-300 dark:border-amber-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📅</span>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300">大运流年</h4>
                </div>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-200">
                  当大运或流年强化用神时，运势上升；克制用神则易遇坎坷
                </p>
              </div>
              
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-amber-300 dark:border-amber-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⚖️</span>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300">化解冲突</h4>
                </div>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-200">
                  用神能缓解八字中的刑冲克害（如子午相冲，取木通关）
                </p>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* 铁口直断解释说明 - 仅在铁口直断分析时显示 */}
      {analysisType === 'tiekou' && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-lg p-4 sm:p-6 border border-purple-200 dark:border-purple-800">
          <div className="space-y-4">
            {/* 标题部分 */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">👁️</span>
              <h3 className="text-lg sm:text-xl font-bold text-purple-800 dark:text-purple-300">
                什么是盲派铁口直断？
              </h3>
            </div>
            
            {/* 核心定义 */}
                          <p className="text-sm sm:text-base text-purple-700 dark:text-yellow-400 leading-relaxed">
              盲派八字是中国传统命理学中一个独特分支，起源于古代盲人为谋生而发展的算命技术。
              其核心特点是弃用传统八字的五行旺衰分析和用神选取，转而通过口诀化规则和生活化象征快速断命。
            </p>
            
            {/* 特色方法 - 响应式布局 */}
            <div className="space-y-3">
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-purple-300 dark:border-purple-700">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                      <span className="text-lg">📖</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">口诀直断</h4>
                    <p className="text-xs sm:text-sm text-purple-700 dark:text-yellow-400">
                      盲师依赖秘传口诀（如"财藏官库，蓄稀世之宝"），像查字典一样对照八字组合直接得出结论，3分钟内可断人生大事。
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-purple-300 dark:border-purple-700">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                      <span className="text-lg">🔮</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">象法解读</h4>
                    <p className="text-xs sm:text-sm text-purple-700 dark:text-yellow-400">
                      将抽象干支转化为生活符号——比如"子午冲"象征南北奔波、"卯酉冲"代表婚姻变动，类似用"密码本"翻译八字中的故事。
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 传承提示 */}
            <div className="bg-purple-100/50 dark:bg-purple-900/20 rounded-md p-3 border border-purple-300/50 dark:border-purple-700/50">
              <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 italic">
                💡 这种方法虽精准高效，但因依赖师徒口传心授，普通人难以自学掌握精髓。本系统融合了盲派精华，让您也能体验铁口直断的神奇。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 分析进度 */}
      {(streaming.isStreaming || streaming.isCompleted) && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>分析进度</span>
            <span>{streaming.isCompleted ? '100%' : '进行中...'}</span>
          </div>
          <Progress 
            value={streaming.isCompleted ? 100 : (streaming.characterCount > 0 ? 50 : 10)} 
            className="w-full" 
          />
        </div>
      )}

      {/* 统计信息 */}
      {(streaming.isStreaming || streaming.isCompleted) && (
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
      )}

      {/* 用神信息显示 */}
      {yongShenData && analysisType === 'yongshen' && (
        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-700 dark:text-green-300">用神信息</span>
            <Badge variant="outline" className="text-xs">
              置信度 {Math.round(yongShenData.confidence * 100)}%
            </Badge>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            {generateYongShenSummary(yongShenData)}
          </p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex flex-col gap-3">
        {/* 第一行：开始分析或创建任务中 */}
        {!streaming.isStreaming && !streaming.isCompleted && (
          <Button 
            onClick={startAnalysis}
            disabled={isCreatingTask}
            className="flex items-center gap-2 w-full"
          >
            {isCreatingTask ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                创建任务中...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                开始分析
              </>
            )}
          </Button>
        )}

        {/* 第二行：停止分析和重置（同行） */}
        {streaming.isStreaming && (
          <div className="flex gap-2">
            <Button 
              onClick={streaming.stopStreaming}
              variant="destructive"
              className="flex items-center gap-2 flex-1"
            >
              <Square className="w-4 h-4" />
              停止分析
            </Button>
            {(taskId || streaming.error || taskError) && (
              <Button 
                onClick={resetAnalysis}
                variant="outline"
                className="flex items-center gap-2 flex-1"
              >
                <RotateCcw className="w-4 h-4" />
                重置
              </Button>
            )}
          </div>
        )}

        {/* 第三行：查看完整报告、重置、保存（三个按钮） */}
        {streaming.isCompleted && streaming.fullContent && (
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => setShowReportDialog(true)}
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
              onClick={saveAnalysisResult}
              disabled={isSaving}
              variant="outline"
              className="flex items-center gap-2 flex-1 min-w-0 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  保存中
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  已保存
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  保存
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* 错误信息 */}
      {(taskError || streaming.error || saveError) && (
        <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-700 dark:text-red-300">
            <span className="font-medium">错误: </span>
            {taskError || streaming.error || saveError}
          </p>
        </div>
      )}

      {/* 实时分析内容 */}
      {(streaming.isStreaming || streaming.isCompleted) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">实时分析内容</h4>
            <Badge variant="outline">
              {streaming.isCompleted ? '已完成' : '实时输出中...'}
            </Badge>
          </div>
          <div 
            ref={streaming.setContentRef}
            className="max-h-80 sm:max-h-96 md:max-h-[28rem] lg:max-h-[32rem] overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900 rounded-md scroll-smooth"
          >
            <div className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
              {streaming.content}
              {streaming.isStreaming && (
                <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1" />
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 报告查看对话框 */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-white dark:bg-slate-800 flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold text-purple-600 dark:text-amber-400">
                  <Eye className="w-6 h-6" />
                  {title} - 完整分析报告
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  由{agentName}提供的专业分析 • {streaming.characterCount}字符 • 用时{streaming.formattedElapsedTime}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={copyReportContent}
                className="flex items-center gap-2"
              >
                {copySuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制报告
                  </>
                )}
              </Button>
            </div>
          </DialogHeader>
          
          <div className="mt-4 flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              <div className="whitespace-pre-wrap text-gray-800 dark:text-slate-200 leading-relaxed text-sm">
                {streaming.fullContent || streaming.content || '暂无分析内容'}
              </div>
              
              {/* 分析完成提示 */}
              {streaming.isCompleted && streaming.fullContent && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-600">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                    <span>✨ 专业{title}分析完成</span>
                    <span>• 基于传统命理学理论</span>
                    <span>• {new Date().toLocaleString('zh-CN')}</span>
                    <span>• 已自动保存到命书</span>
                  </div>
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded text-xs text-green-700 dark:text-green-300">
                    📚 分析结果已自动保存到您的命书中，您可以在命书页面查看和管理所有分析报告（每种分析类型最多保存3份）
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 