import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUnifiedUser } from '@/lib/auth'

// 获取现有分析结果
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 查询紫微分析结果...')
    
    const { searchParams } = new URL(request.url)
    const cacheKey = searchParams.get('cache_key')
    const analysisType = searchParams.get('analysis_type')
    
    if (!cacheKey || !analysisType) {
      console.log('❌ 缺少查询参数')
      return NextResponse.json({ message: '缺少必要参数' }, { status: 400 })
    }
    
    console.log(`🔍 查询缓存键: ${cacheKey}, 分析类型: ${analysisType}`)
    
    // 获取当前用户（可选）
    const user = await getCurrentUnifiedUser()
    console.log('🔍 当前用户状态:', user ? `${user.email} (${user.id})` : '未登录')
    
    // 查询数据库 - 对于未登录用户，只通过缓存键查询
    let query = supabase
      .from('ziwei_analyses')
      .select('*')
      .eq('cache_key', cacheKey)
      .eq('analysis_type', analysisType)
    
    // 如果用户已登录，添加用户ID过滤
    if (user?.id) {
      query = query.eq('user_id', user.id)
    }
    
    const { data, error } = await query.single()
    
    if (error) {
      console.log('❌ 数据库查询错误:', error.message)
      return NextResponse.json({ message: '未找到分析结果' }, { status: 404 })
    }
    
    if (!data) {
      console.log('📭 未找到匹配的分析结果')
      return NextResponse.json({ message: '未找到分析结果' }, { status: 404 })
    }
    
    // 检查分析结果是否完整
    if (!data.analysis_result || data.analysis_result.trim() === '') {
      console.log('⚠️ 找到不完整的分析记录，将删除并重新生成')
      
      // 删除不完整的记录
      if (user?.id) {
        await supabase
          .from('ziwei_analyses')
          .delete()
          .eq('id', data.id)
        console.log('🗑️ 已删除不完整的分析记录')
      }
      
      return NextResponse.json({ message: '分析记录不完整，请重新生成' }, { status: 404 })
    }
    
    console.log('✅ 找到已保存的分析结果')
    return NextResponse.json({
      analysis_result: data.analysis_result,
      created_at: data.created_at,
      from_cache: true
    })

  } catch (error) {
    console.error('❌ 获取分析结果错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 创建新的分析结果 - 使用DIFY紫微斗数大师
export async function POST(request: NextRequest) {
  try {
    console.log('🤖 开始创建DIFY紫微分析...')
    
    const body = await request.json()
    const { cacheKey, palaceData, analysisType } = body
    
    if (!cacheKey || !palaceData || !analysisType) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    console.log(`🤖 创建 ${analysisType} 分析 (使用DIFY)`)

    // 获取当前用户（可选）
    const user = await getCurrentUnifiedUser()
    console.log('🔍 当前用户状态:', user ? `${user.email} (${user.id})` : '未登录')

    // 检查用户使用次数（仅对登录用户）
    if (user?.id) {
      console.log('📊 检查用户使用次数...')
      
      // 先消费一次使用次数
      const usageResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3007'}/api/user-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}` // 传递用户ID用于内部调用
        },
        body: JSON.stringify({
          reportType: 'ziwei',
          useFreeTrial: true
        })
      })

      if (!usageResponse.ok) {
        const usageError = await usageResponse.json()
        console.log('❌ 使用次数不足:', usageError.error)
        return NextResponse.json({ 
          error: usageError.error || '使用次数不足，请购买更多次数',
          needsPurchase: usageResponse.status === 403
        }, { status: usageResponse.status })
      }

      const usageData = await usageResponse.json()
      console.log(`✅ 使用次数检查通过，使用${usageData.usedFree ? '免费' : '付费'}次数`)
    }

    // 检查是否已有不完整的记录，如果有则先删除
    if (user?.id) {
      const { data: existingData } = await supabase
        .from('ziwei_analyses')
        .select('*')
        .eq('user_id', user.id)
        .eq('cache_key', cacheKey)
        .eq('analysis_type', analysisType)
        .single()

      if (existingData && (!existingData.analysis_result || existingData.analysis_result.trim() === '')) {
        console.log('🗑️ 删除之前不完整的分析记录')
        await supabase
          .from('ziwei_analyses')
          .delete()
          .eq('id', existingData.id)
      }
    }

    // 使用DIFY分析
    console.log('🧠 调用DIFY紫微斗数大师进行分析...')
    const analysisResult = await callDifyZiweiAnalysis(palaceData, analysisType, user?.id || 'anonymous')
    
    if (!analysisResult) {
      throw new Error('DIFY分析返回空结果')
    }

    // 保存到数据库（只有登录用户才保存）
    if (user?.id) {
      console.log('💾 保存分析结果到数据库...')
      const { error } = await supabase
        .from('ziwei_analyses')
        .insert({
          user_id: user.id,
          cache_key: cacheKey,
          analysis_type: analysisType,
          palace_data: palaceData,
          analysis_result: analysisResult,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('❌ 数据库保存失败:', error)
        console.log('⚠️ 数据库保存失败，但仍返回分析结果')
      } else {
        console.log('✅ 分析结果已保存到数据库')
      }
    } else {
      console.log('🔍 未登录用户，跳过数据库保存')
    }

    console.log('✅ DIFY分析结果创建成功')
    return NextResponse.json({ 
      result: analysisResult,
      from_cache: false,
      created_at: new Date().toISOString(),
      powered_by: 'DIFY'
    })

  } catch (error) {
    console.error('❌ 创建DIFY分析错误:', error)
    // 显示具体错误信息用于调试
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json({ 
      error: '分析失败，请稍后重试',
      debug: errorMessage,
      type: 'DIFY_ERROR'
    }, { status: 500 })
  }
}

// DIFY紫微分析函数
async function callDifyZiweiAnalysis(palaceData: unknown, analysisType: string, userId: string): Promise<string> {
  try {
    if (analysisType === 'destiny_arrow') {
      return await analyzeDestinyArrowWithDify(palaceData, userId)
    }
    
    throw new Error(`不支持的分析类型: ${analysisType}`)
  } catch (error) {
    console.error('DIFY分析失败:', error)
    throw error
  }
}

// 命运之箭DIFY分析
async function analyzeDestinyArrowWithDify(arrowData: { mingGong?: unknown; caiPo?: unknown; guanLu?: unknown; qianYi?: unknown }, userId: string): Promise<string> {
  const formatPalaceForDify = (palace: { name?: string; heavenlyStem?: string; branch?: string; stars?: { name?: string; brightness?: string; xiangXinSihua?: string; liXinSihua?: string; sihua?: string }[] } | null | undefined, role: string) => {
    if (!palace) return `${role}：信息缺失`
    
    const stars = palace.stars || []
    const starInfo = stars.map((star: { name?: string; brightness?: string; xiangXinSihua?: string; liXinSihua?: string; sihua?: string }) => {
      let info = `${star.name}(${star.brightness})`
      if (star.xiangXinSihua) info += `i${star.xiangXinSihua}`
      if (star.liXinSihua) info += `x${star.liXinSihua}`
      if (star.sihua) {
        const sihuaMap: Record<string, string> = { 'A': '禄', 'B': '权', 'C': '科', 'D': '忌' }
        info += `化${sihuaMap[star.sihua] || star.sihua}`
      }
      return info
    }).join('、') || '无星曜'
    
    return `${palace.name}：${palace.heavenlyStem}${palace.branch} ${starInfo}`
  }

  // 构建简化的DIFY查询内容 - 减少复杂度避免超时
  const difyQuery = `分析紫微斗数四宫：
命宫：${formatPalaceForDify(arrowData.mingGong, '命宫')}
财帛：${formatPalaceForDify(arrowData.caiPo, '财帛宫')}
官禄：${formatPalaceForDify(arrowData.guanLu, '官禄宫')}
迁移：${formatPalaceForDify(arrowData.qianYi, '迁移宫')}

请提供简要分析。`

  // 使用紫微斗数大师Agent
  console.log('🔮 调用紫微斗数大师进行专业分析...')
  
  const { difyService } = await import('@/lib/services/dify-integration')
  const difyResult = await difyService.chatWithAgent(difyQuery, userId, 'ziwei-master')

  return difyResult.answer || '分析结果生成失败'
}

// 删除不完整的分析记录
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ 开始清理不完整的分析记录...')
    
    const { searchParams } = new URL(request.url)
    const cacheKey = searchParams.get('cache_key')
    const analysisType = searchParams.get('analysis_type')
    
    if (!cacheKey || !analysisType) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 获取当前用户
    const user = await getCurrentUnifiedUser()
    if (!user?.id) {
      return NextResponse.json({ error: '需要登录' }, { status: 401 })
    }

    console.log(`🗑️ 清理用户 ${user.email} 的分析记录: ${cacheKey}-${analysisType}`)

    // 删除指定的分析记录
    const { error } = await supabase
      .from('ziwei_analyses')
      .delete()
      .eq('user_id', user.id)
      .eq('cache_key', cacheKey)
      .eq('analysis_type', analysisType)

    if (error) {
      console.error('❌ 删除记录失败:', error)
      return NextResponse.json({ error: '删除失败' }, { status: 500 })
    }

    console.log('✅ 分析记录已清理')
    return NextResponse.json({ message: '记录已清理，可以重新生成' })

  } catch (error) {
    console.error('❌ 清理记录错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 