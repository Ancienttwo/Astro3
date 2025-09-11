import { NextRequest, NextResponse } from 'next/server'
import { supabase, getSupabaseAdmin } from '@/lib/supabase'
import { invalidateByExactPath } from '@/lib/edge/invalidate'
import { difyService } from '@/lib/services/dify-integration'

// 获取服务端管理员客户端
const supabaseAdmin = getSupabaseAdmin()

// 简化的认证函数
async function authenticateRequest(request: NextRequest) {
  try {
    // 从URL参数或Authorization头获取token
    const url = new URL(request.url)
    const tokenFromQuery = url.searchParams.get('token')
    const authHeader = request.headers.get('Authorization')
    
    let token = tokenFromQuery
    if (!token && authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
    
    if (!token) {
      return { success: false, error: '缺少认证token' }
    }
    
    // 验证token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return { success: false, error: '认证失败' }
    }
    
    return { success: true, user }
  } catch (error) {
    return { success: false, error: '认证错误' }
  }
}

// 流式分析API - 实时推送DIFY分析过程
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params
    
    if (!taskId) {
      return NextResponse.json({ error: '缺少任务ID' }, { status: 400 })
    }

    // 用户认证
    const authResult = await authenticateRequest(request)
    
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const user = authResult.user!
    console.log(`🌊 用户 ${user.email} 请求流式分析: ${taskId}`)

    // 验证任务所有权
    const { data: task, error: taskError } = await supabaseAdmin
      .from('analysis_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: '任务不存在或无权限' }, { status: 404 })
    }

    // 创建Server-Sent Events流
    const encoder = new TextEncoder()
    
    const stream = new ReadableStream({
      async start(controller) {
        console.log(`🚀 开始流式分析任务: ${taskId}`)
        
        // 发送初始状态
        const initialChunk = `data: ${JSON.stringify({
          type: 'start',
          message: '开始分析...',
          timestamp: Date.now(),
          taskId
        })}\n\n`
        controller.enqueue(encoder.encode(initialChunk))

        // 更新任务状态为processing - 🔥 修复：使用await等待结果
        const { error: processingError } = await supabaseAdmin
          .from('analysis_tasks')
          .update({
            status: 'processing',
            started_at: new Date().toISOString()
          })
          .eq('id', taskId)
          .eq('status', 'pending') // 只有pending状态的任务才能更新为processing

        if (processingError) {
          console.error(`❌ 更新任务状态为processing失败: ${taskId}`, processingError)
          // 发送错误信息并关闭流
          const errorChunk = `data: ${JSON.stringify({
            type: 'error',
            message: '任务状态更新失败',
            timestamp: Date.now(),
            taskId
          })}\n\n`
          controller.enqueue(encoder.encode(errorChunk))
          controller.close()
          return
        } else {
          console.log(`✅ 任务状态已更新为processing: ${taskId}`)
          try {
            await invalidateByExactPath('/api/analysis-tasks','astrology')
            await invalidateByExactPath(`/api/analysis-tasks/${taskId}`,'astrology')
          } catch {}
        }

        // 异步处理DIFY流式分析
        processStreamingAnalysis(task, controller, encoder)
          .catch(error => {
            console.error(`❌ 流式分析失败: ${task.id}`, error)
            
            // 发送错误信息
            const errorChunk = `data: ${JSON.stringify({
              type: 'error',
              message: error.message || '分析失败',
              timestamp: Date.now(),
              taskId: task.id
            })}\n\n`
            controller.enqueue(encoder.encode(errorChunk))
            controller.close()
          })
      },
      
      cancel() {
        console.log(`🛑 用户取消流式分析: ${taskId}`)
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    })

  } catch (error) {
    console.error('❌ 流式分析API错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 处理流式分析
async function processStreamingAnalysis(
  task: {
    id: string;
    user_id: string;
    input_data: {
      cacheKey: string;
      ziweiData?: Record<string, unknown>;
      baziData?: Record<string, unknown>;
      sihuaData?: Record<string, unknown>;
      analysisType: string;
    };
    task_type?: string;
  },
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  try {
    const { cacheKey, ziweiData, baziData, sihuaData, analysisType } = task.input_data
    let agentType = 'ziwei-master'
    let fullContent = ''
    
    console.log('🔍 任务输入数据检查:', { 
      cacheKey, 
      analysisType, 
      hasZiweiData: !!ziweiData,
      hasBaziData: !!baziData,
      hasSihuaData: !!sihuaData,
      ziweiDataKeys: ziweiData ? Object.keys(ziweiData) : [],
      baziDataKeys: baziData ? Object.keys(baziData) : [],
      sihuaDataKeys: sihuaData ? Object.keys(sihuaData) : []
    })

    // 根据分析类型选择对应的Agent
    if (analysisType === 'tiekou_zhiduan') {
      agentType = 'bazi-master'
    } else if (analysisType === 'yongshen_analysis') {
      agentType = 'yongshen-master'
    } else if (analysisType === 'sihua_reasoning') {
      agentType = 'ziwei-master'
    }

    console.log(`🤖 开始流式调用DIFY Agent: ${agentType}`)

    // 构建查询
    let query = ''
    if (analysisType === 'ziwei_reasoning') {
      query = buildZiweiQuery(ziweiData || {})
    } else if (analysisType === 'sihua_reasoning') {
      // 四化分析：直接使用前端构建的查询
      if (sihuaData && sihuaData.query) {
        query = sihuaData.query as string
        console.log('🔍 使用前端构建的四化查询:', query)
      } else {
        console.log('⚠️ 未找到前端构建的查询，回退到后端构建')
        query = buildSihuaQuery(sihuaData || {})
      }
    } else {
      // 对于八字分析，需要使用baziData而不是ziweiData
      const baziData = task.input_data.baziData || ziweiData
      query = buildBaziQuery((baziData || {}) as Record<string, unknown>, analysisType)
    }

    // 调用DIFY流式API
    const difyStream = await difyService.chatStream(query, task.user_id, agentType)
    const reader = difyStream.getReader()

    // 添加超时保护（5分钟）
    const startTime = Date.now()
    const timeoutMs = 5 * 60 * 1000 // 5分钟
    let messageCount = 0

    // 逐块读取和转发DIFY响应
    while (true) {
      // 检查超时
      if (Date.now() - startTime > timeoutMs) {
        console.log(`⏰ 流式分析超时，强制结束: ${task.id}`)
        break
      }

      const { done, value } = await reader.read()
      
      if (done) {
        console.log(`🏁 DIFY流读取完成: ${task.id}`)
        break
      }

      messageCount++
      if (messageCount % 100 === 0) {
        console.log(`📊 已处理 ${messageCount} 条消息，内容长度: ${fullContent.length}`)
      }

      // 解析DIFY流式响应
      const chunk = new TextDecoder().decode(value)
      const lines = chunk.split('\n').filter(line => line.trim())

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            
            if (data.event === 'message' && data.answer) {
              // 过滤掉Thinking部分，只保留用户应该看到的内容
              const filteredAnswer = filterThinkingContent(data.answer)
              
              if (filteredAnswer) {
                fullContent += filteredAnswer
                
                // 实时推送分析进度
                const progressChunk = `data: ${JSON.stringify({
                  type: 'progress',
                  content: filteredAnswer,
                  fullContent,
                  timestamp: Date.now(),
                  taskId: task.id
                })}\n\n`
                
                controller.enqueue(encoder.encode(progressChunk))
                
                console.log(`📝 推送分析片段: ${filteredAnswer.length}字符`)
              } else {
                console.log(`🚫 过滤掉Thinking内容: ${data.answer.length}字符`)
              }
            }
            
            if (data.event === 'message_end' || data.event === 'workflow_finished') {
              console.log(`✅ DIFY流式分析完成，总长度: ${fullContent.length}字符`)
              
              // 🔥 简化：只更新任务状态为completed，不自动保存
              // 前端收到complete通知后会主动调用保存API
              const { error: statusError } = await supabaseAdmin
                .from('analysis_tasks')
                .update({ 
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                  result: {
                    from_stream: true,
                    content_length: fullContent.length,
                    powered_by: `DIFY流式分析 - ${getAgentDisplayName(task.input_data.analysisType)}`,
                    ready_for_save: true // 标记为准备保存
                  }
                })
                .eq('id', task.id)
                .in('status', ['processing', 'pending'])
              
              if (statusError) {
                console.error(`❌ 更新任务状态失败: ${task.id}`, statusError)
                // 发送错误信息到前端
                const errorChunk = `data: ${JSON.stringify({
                  type: 'error',
                  message: `更新任务状态失败: ${statusError.message}`,
                  timestamp: Date.now(),
                  taskId: task.id
                })}\n\n`
                controller.enqueue(encoder.encode(errorChunk))
                controller.close()
                return
              }
              
              console.log(`✅ 任务状态已更新为completed: ${task.id}`)
              try {
                await invalidateByExactPath('/api/analysis-tasks','astrology')
                await invalidateByExactPath(`/api/analysis-tasks/${task.id}`,'astrology')
              } catch {}
              
              // 发送完成信号，前端收到后会主动调用保存API
              const completeChunk = `data: ${JSON.stringify({
                type: 'complete',
                fullContent,
                message: '分析完成！',
                timestamp: Date.now(),
                taskId: task.id
              })}\n\n`
              
              controller.enqueue(encoder.encode(completeChunk))
              controller.close()
              return
            }
          } catch {
            // 忽略解析错误，继续处理
            console.log('流式数据解析跳过:', line.substring(0, 100))
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ 流式分析处理失败:', error)
    throw error
  }
}

// 构建紫微查询
function buildZiweiQuery(ziweiData: Record<string, unknown>): string {
  let query = `请分析以下紫微斗数命盘：
出生时间：${ziweiData.year}年${ziweiData.month}月${ziweiData.day}日${ziweiData.hour}时
性别：${ziweiData.gender}`

  // 检查是否有命运之箭四宫数据
  if (ziweiData.mingGong || ziweiData.qianYi || ziweiData.caiPo || ziweiData.guanLu) {
    query += `\n\n命运之箭四宫详细配置：`
    
    if (ziweiData.mingGong) {
      const mingGong = ziweiData.mingGong as Record<string, unknown>
      query += `\n🎯 命宫：${mingGong.position || mingGong.name}`
      if (mingGong.stars && mingGong.stars !== '') {
        query += ` - ${mingGong.stars}`
      }
    }
    
    if (ziweiData.qianYi) {
      const qianYi = ziweiData.qianYi as Record<string, unknown>
      query += `\n🏹 迁移宫：${qianYi.position || qianYi.name}`
      if (qianYi.stars && qianYi.stars !== '') {
        query += ` - ${qianYi.stars}`
      }
    }
    
    if (ziweiData.caiPo) {
      const caiPo = ziweiData.caiPo as Record<string, unknown>
      query += `\n💰 财帛宫：${caiPo.position || caiPo.name}`
      if (caiPo.stars && caiPo.stars !== '') {
        query += ` - ${caiPo.stars}`
      }
    }
    
    if (ziweiData.guanLu) {
      const guanLu = ziweiData.guanLu as Record<string, unknown>
      query += `\n🎖️ 官禄宫：${guanLu.position || guanLu.name}`
      if (guanLu.stars && guanLu.stars !== '') {
        query += ` - ${guanLu.stars}`
      }
    }
  } else if (ziweiData.palaceData) {
    // 兼容旧的数据格式
    const palaceData = ziweiData.palaceData as Record<string, Record<string, unknown>>
    const { mingGong, qianYi, caiPo, guanLu } = palaceData
    query += `\n\n命运之箭四宫详细配置：`
    
    if (mingGong) {
      query += `\n🎯 命宫：${mingGong.heavenlyStem}${mingGong.branch}`
      if (mingGong.stars && Array.isArray(mingGong.stars) && mingGong.stars.length > 0) {
        const starInfo = (mingGong.stars as Array<Record<string, unknown>>).map((star) => {
          let result = `${star.name}(${star.brightness})`
          if (star.xiangXinSihua) result += `i${star.xiangXinSihua}`
          if (star.liXinSihua) result += `x${star.liXinSihua}`
          if (star.sihua) result += star.sihua
          return result
        }).join('、')
        query += ` - ${starInfo}`
      }
    }
    
    if (qianYi) {
      query += `\n🏹 迁移宫：${qianYi.heavenlyStem}${qianYi.branch}`
      if (qianYi.stars && Array.isArray(qianYi.stars) && qianYi.stars.length > 0) {
        const starInfo = (qianYi.stars as Array<Record<string, unknown>>).map((star) => {
          let result = `${star.name}(${star.brightness})`
          if (star.xiangXinSihua) result += `i${star.xiangXinSihua}`
          if (star.liXinSihua) result += `x${star.liXinSihua}`
          if (star.sihua) result += star.sihua
          return result
        }).join('、')
        query += ` - ${starInfo}`
      }
    }
    
    if (caiPo) {
      query += `\n💰 财帛宫：${caiPo.heavenlyStem}${caiPo.branch}`
      if (caiPo.stars && Array.isArray(caiPo.stars) && caiPo.stars.length > 0) {
        const starInfo = (caiPo.stars as Array<Record<string, unknown>>).map((star) => {
          let result = `${star.name}(${star.brightness})`
          if (star.xiangXinSihua) result += `i${star.xiangXinSihua}`
          if (star.liXinSihua) result += `x${star.liXinSihua}`
          if (star.sihua) result += star.sihua
          return result
        }).join('、')
        query += ` - ${starInfo}`
      }
    }
    
    if (guanLu) {
      query += `\n🎖️ 官禄宫：${guanLu.heavenlyStem}${guanLu.branch}`
      if (guanLu.stars && Array.isArray(guanLu.stars) && guanLu.stars.length > 0) {
        const starInfo = (guanLu.stars as Array<Record<string, unknown>>).map((star) => {
          let result = `${star.name}(${star.brightness})`
          if (star.xiangXinSihua) result += `i${star.xiangXinSihua}`
          if (star.liXinSihua) result += `x${star.liXinSihua}`
          if (star.sihua) result += star.sihua
          return result
        }).join('、')
        query += ` - ${starInfo}`
      }
    }
  }

  // 🔥 修复：添加多种生年四化数据结构的兼容性检查
  let sihuaAdded = false
  
  // 检查方式1: ziweiData.sihuaInfo（优先使用，因为包含宫位信息）
  if (ziweiData.sihuaInfo) {
    const sihuaInfo = ziweiData.sihuaInfo as Record<string, unknown>
    query += `\n\n生年四化：`
    if (sihuaInfo.lu) query += `\nA化禄：${sihuaInfo.lu}`
    if (sihuaInfo.quan) query += `\nB化权：${sihuaInfo.quan}`
    if (sihuaInfo.ke) query += `\nC化科：${sihuaInfo.ke}`
    if (sihuaInfo.ji) query += `\nD化忌：${sihuaInfo.ji}`
    sihuaAdded = true
  }
  
  // 检查方式2: ziweiData.birthYearSihua
  if (!sihuaAdded && ziweiData.birthYearSihua) {
    const birthYearSihua = ziweiData.birthYearSihua as Record<string, unknown>
    query += `\n\n生年四化：`
    if (birthYearSihua.lu) query += `\nA化禄：${birthYearSihua.lu}`
    if (birthYearSihua.quan) query += `\nB化权：${birthYearSihua.quan}`
    if (birthYearSihua.ke) query += `\nC化科：${birthYearSihua.ke}`
    if (birthYearSihua.ji) query += `\nD化忌：${birthYearSihua.ji}`
    sihuaAdded = true
  }
  
  // 检查方式3: 直接在ziweiData下的四化属性
  if (!sihuaAdded && (ziweiData.lu || ziweiData.quan || ziweiData.ke || ziweiData.ji)) {
    query += `\n\n生年四化：`
    if (ziweiData.lu) query += `\nA化禄：${ziweiData.lu}`
    if (ziweiData.quan) query += `\nB化权：${ziweiData.quan}`
    if (ziweiData.ke) query += `\nC化科：${ziweiData.ke}`
    if (ziweiData.ji) query += `\nD化忌：${ziweiData.ji}`
    sihuaAdded = true
  }
  
  // 检查方式4: 从yearStem推导生年四化
  if (!sihuaAdded && ziweiData.yearStem) {
    const yearStem = ziweiData.yearStem as string
    const sihuaMap: Record<string, Record<string, string>> = {
      '甲': { lu: '廉贞', quan: '破军', ke: '武曲', ji: '太阳' },
      '乙': { lu: '天机', quan: '天梁', ke: '紫微', ji: '太阴' },
      '丙': { lu: '天同', quan: '天机', ke: '文昌', ji: '廉贞' },
      '丁': { lu: '太阴', quan: '天同', ke: '天机', ji: '巨门' },
      '戊': { lu: '贪狼', quan: '太阴', ke: '太阳', ji: '天机' },
      '己': { lu: '武曲', quan: '贪狼', ke: '天梁', ji: '文曲' },
      '庚': { lu: '太阳', quan: '武曲', ke: '天同', ji: '天相' },
      '辛': { lu: '巨门', quan: '太阳', ke: '文曲', ji: '文昌' },
      '壬': { lu: '天梁', quan: '紫微', ke: '左辅', ji: '武曲' },
      '癸': { lu: '破军', quan: '巨门', ke: '太阴', ji: '贪狼' }
    }
    
    if (sihuaMap[yearStem]) {
      const sihua = sihuaMap[yearStem]
      query += `\n\n生年四化（${yearStem}年）：`
      query += `\nA化禄：${sihua.lu}`
      query += `\nB化权：${sihua.quan}`
      query += `\nC化科：${sihua.ke}`
      query += `\nD化忌：${sihua.ji}`
      sihuaAdded = true
    }
  }

  query += `\n\n四化符号说明：
A=化禄，B=化权，C=化科，D=化忌
i=向心自化（如iA=向心自化禄），x=离心自化（如xA=离心自化禄）

⚠️ 重要提示：如命迁财官四宫有自化（i或x标识），则须法象生年四化作解释。自化与生年四化的相互作用是分析的关键。`

  // 🔥 新增：添加来因宫位置信息
  if (ziweiData.laiYinGong) {
    const laiYinGong = ziweiData.laiYinGong as string
    query += `\n\n来因宫：${laiYinGong}`
  } else if (ziweiData.laiYin) {
    const laiYin = ziweiData.laiYin as string
    query += `\n\n来因宫：${laiYin}`
  }

  console.log('🔍 构建的紫微查询:', query.substring(0, 300) + '...')
  console.log('🔍 生年四化是否已添加:', sihuaAdded)
  return query
}

// 构建四化分析查询
function buildSihuaQuery(sihuaData: Record<string, unknown>): string {
  console.log('🔍 buildSihuaQuery 接收到的数据:', JSON.stringify(sihuaData, null, 2))
  
  let query = `请进行生年四化与来因宫分析：

数据：`

  // 添加来因宫信息
  if (sihuaData.laiYinGong) {
    const laiYinGong = sihuaData.laiYinGong as Record<string, unknown>
    query += `\n来因宫：${laiYinGong.name}`
    console.log('✅ 来因宫数据已添加:', laiYinGong)
  } else {
    console.log('❌ 没有找到laiYinGong数据，完整数据:', JSON.stringify(sihuaData, null, 2))
  }

  // 添加生年四化星与宫位信息
  if (sihuaData.sihuaPositions) {
    const positions = sihuaData.sihuaPositions as Record<string, any>
    query += `\n\n生年四化星与宫：`
    
    if (positions.lu) {
      query += `\nA化禄：${positions.lu.palace} - ${positions.lu.fullStar}`
    }
    if (positions.quan) {
      query += `\nB化权：${positions.quan.palace} - ${positions.quan.fullStar}`
    }
    if (positions.ke) {
      query += `\nC化科：${positions.ke.palace} - ${positions.ke.fullStar}`
    }
    if (positions.ji) {
      query += `\nD化忌：${positions.ji.palace} - ${positions.ji.fullStar}`
    }
    console.log('✅ 四化位置数据已添加:', positions)
  } else {
    console.log('❌ 没有找到sihuaPositions数据')
  }

  query += `\n\n解释重点：
1. 因为生年四化皆由来因宫而来，所以生年四化的解释必须结合以下的要素：四化的宫位、四化、四化星曜、来因宫与四化宫的关系（来因宫给了四化宫某个生年四化，结合星曜和宫位推断）
2. 如有自化，必须结合其生年四化解。如某宫有贪狼 xD A，则先解释A，再结合D所在的宫位来解释xD。
3. 每一个生年四化必须结合来因宫详细解释

注：ABCD是生年禄权科忌，x是离心自化（有破耗的含义），i是向心自化（有付出的含义），xA是离心禄。`

  console.log('🔍 构建的四化查询:', query)
  return query
}

// 构建八字查询
function buildBaziQuery(baziData: Record<string, unknown>, analysisType: string): string {
  const typeMap: Record<string, string> = {
    tiekou_zhiduan: '铁口直断',
    yongshen_analysis: '用神分析'
  }
  
  // 数据验证和默认值处理
  const year = baziData?.year || '未知'
  const month = baziData?.month || '未知'
  const day = baziData?.day || '未知'
  const hour = baziData?.hour || '未知'
  const gender = baziData?.gender || '未知'
  const ganzhiString = baziData?.ganzhiString || baziData?.yearPillar + ' ' + baziData?.monthPillar + ' ' + baziData?.dayPillar + ' ' + baziData?.hourPillar || '未知'
  
  console.log('🔍 buildBaziQuery 数据检查:', { year, month, day, hour, gender, ganzhiString })
  
  // 🔥 针对用神分析使用盲派做功理论的专业提示词
  if (analysisType === 'yongshen_analysis') {
    return `请进行用神分析：
出生时间：${year}年${month}月${day}日${hour}时
性别：${gender}
八字：${ganzhiString}

请严格根据盲派做功理论，深入推理出用神。`
  }
  
  // 其他分析类型保持原有逻辑
  return `请进行${typeMap[analysisType] || '八字分析'}：
出生时间：${year}年${month}月${day}日${hour}时
性别：${gender}
八字：${ganzhiString}

请提供详细的命理分析。`
}

// 过滤Thinking内容的函数 - 暂时禁用，直接返回原始内容
function filterThinkingContent(content: string): string {
  // 不再过滤，直接返回原始内容
  return content || ''
}

// 🔥 saveFinalResult函数已移除
// 新架构：后端只负责流式输出，前端收到complete后主动调用保存API


// 🔥 新增：获取Agent显示名称
function getAgentDisplayName(analysisType: string): string {
  const agentMap: Record<string, string> = {
    'tiekou_zhiduan': '铁口直断大师',
    'yongshen_analysis': '用神大师',
    'ziwei_reasoning': '紫微推理大师',
    'sihua_reasoning': '四化分析大师'
  }
  return agentMap[analysisType] || '未知Agent'
}

 
