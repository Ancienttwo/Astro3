import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/server/db'
import { difyService } from '@/lib/services/dify-integration'

const supabaseAdmin = getSupabaseAdminClient()

// 十神英文术语映射表（基于项目字典组件的官方翻译）
const TEN_GODS_ENGLISH_MAP: Record<string, string> = {
  // 官方UI标准翻译（来自 lib/i18n/dictionaries.ts）
  'Peer God': '比肩',
  'Rival God': '劫财',
  'Prosperity God': '食神',
  'Drama God': '伤官',
  'Fortune God': '偏财',
  'Wealth God': '正财',
  'War God': '七杀',
  'Authority God': '正官',
  'Oracle God': '偏印',
  'Scholar God': '正印',
  
  // 常见的技术API标准翻译（向下兼容）
  'Peer Star': '比肩',
  'Rob Wealth': '劫财', 
  'Food God': '食神',
  'Hurt Officer': '伤官',
  'Partial Wealth': '偏财',
  'Direct Wealth': '正财',
  'Seven Killings': '七杀',
  'Direct Officer': '正官',
  'Partial Resource': '偏印',
  'Direct Resource': '正印',
  'Owl God': '枭神',
  
  // 通用分类术语
  'Officer': '官杀',
  'Wealth Star': '财星',
  'Resource Star': '印星'
}

// 替换十神英文术语为中文术语的函数
function replaceEnglishTenGods(content: string): string {
  if (!content) return ''
  
  let result = content
  
  // 替换十神英文术语
  for (const [english, chinese] of Object.entries(TEN_GODS_ENGLISH_MAP)) {
    // 匹配括号中的英文术语，如 (偏印/Partial Resource) -> (偏印)
    const bracketPattern = new RegExp(`\\([^)]*?/${english}[^)]*?\\)`, 'gi')
    result = result.replace(bracketPattern, `(${chinese})`)
    
    // 匹配独立的英文术语加括号，如 Partial Resource (偏印) -> 偏印
    const independentPattern = new RegExp(`${english}\\s*\\([^)]*?\\)`, 'gi')
    result = result.replace(independentPattern, chinese)
    
    // 匹配纯英文术语，如 Partial Resource -> 偏印
    const pureEnglishPattern = new RegExp(`\\b${english}\\b`, 'gi')
    result = result.replace(pureEnglishPattern, chinese)
  }
  
  return result
}

// 过滤思考过程的函数（只移除<think>标签内容）
function filterThinkingContent(content: string): string {
  if (!content) return ''
  
  // 移除 <think>...</think> 标签及其内容
  let filtered = content.replace(/<think>[\s\S]*?<\/think>/gi, '')
  
  // 移除可能的孤立标签
  filtered = filtered.replace(/<\/?think>/gi, '')
  
  // 清理多余的空行
  filtered = filtered.replace(/\n\s*\n\s*\n+/g, '\n\n')
  
  // 替换十神英文术语为中文术语
  filtered = replaceEnglishTenGods(filtered)
  
  // 去除markdown格式但保留内容（让结果看起来不那么AI化）
  filtered = removeMarkdownFormatting(filtered)
  
  return filtered.trim()
}

// 去除 markdown 格式的函数
function removeMarkdownFormatting(text: string): string {
  if (!text) return ''
  
  let cleaned = text
  
  // 移除标题格式 (# ## ###)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '')
  
  // 移除粗体格式 (**text** 或 __text__)
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1')
  cleaned = cleaned.replace(/__(.*?)__/g, '$1')
  
  // 移除斜体格式 (*text* 或 _text_)
  cleaned = cleaned.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1')
  cleaned = cleaned.replace(/(?<!_)_([^_]+)_(?!_)/g, '$1')
  
  // 移除代码块格式
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '')
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1')
  
  // 移除链接格式 [text](url)
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  
  // 移除引用格式 (> text)
  cleaned = cleaned.replace(/^>\s+/gm, '')
  
  // 移除列表格式 (- * +)
  cleaned = cleaned.replace(/^[\-\*\+]\s+/gm, '')
  
  // 移除有序列表格式 (1. 2.)
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '')
  
  // 移除水平线
  cleaned = cleaned.replace(/^[\-\*_]{3,}$/gm, '')
  
  // 清理多余的空行
  cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, '\n\n')
  
  return cleaned.trim()
}

// 认证函数
async function authenticateRequest(request: NextRequest) {
  try {
    console.log('🔐 开始用户认证...')
    const authHeader = request.headers.get('Authorization')
    console.log('📝 Authorization头:', authHeader ? `${authHeader.substring(0, 20)}...` : '未提供')
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ Authorization头格式错误')
      return { success: false, error: '缺少认证token' }
    }
    
    const token = authHeader.substring(7)
    console.log('🎫 提取到token:', `${token.substring(0, 20)}...`)
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error) {
      console.error('❌ Supabase认证错误:', error)
      return { success: false, error: `认证失败: ${error.message}` }
    }
    
    if (!user) {
      console.log('❌ 未找到用户')
      return { success: false, error: '用户不存在' }
    }
    
    console.log('✅ 用户认证成功:', { id: user.id, email: user.email })
    return { success: true, user }
  } catch (error) {
    console.error('❌ 认证异常:', error)
    return { success: false, error: `认证错误: ${error instanceof Error ? error.message : '未知错误'}` }
  }
}

// 创建异步分析任务
export async function POST(request: NextRequest) {
  try {
    // 用户认证
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const user = authResult.user!
    const requestData = await request.json()

    console.log('🚀 创建异步分析任务:', {
      userId: user.id,
      analysisType: requestData.analysisType,
      enableFiltering: requestData.enableFiltering,
      skipCharging: requestData.skipCharging
    })

    // 构建任务数据，使用正式环境支持的字段
    const taskData = {
      user_id: user.id,
      user_email: user.email || '', // 正式环境需要这个字段
      task_type: (requestData.analysisType === 'tiekou_zhiduan' || requestData.analysisType === 'yongshen_analysis') ? 'bazi' : 'ziwei',
      status: 'pending',
      input_data: {
        analysisType: requestData.analysisType,
        baziData: requestData.baziData,
        ziweiData: requestData.ziweiData,
        enableFiltering: requestData.enableFiltering || false,
        skipCharging: requestData.skipCharging || false,
        language: requestData.language || 'zh', // Add language support
        cacheKey: `async_${Date.now()}`
      }
    }

    // 插入任务到数据库
    console.log('💾 准备插入任务数据:', {
      user_id: taskData.user_id,
      task_type: taskData.task_type,
      status: taskData.status,
      analysisType: taskData.input_data.analysisType
    })
    
    const { data: task, error: insertError } = await supabaseAdmin
      .from('analysis_tasks')
      .insert([taskData])
      .select()
      .single()

    if (insertError) {
      console.error('❌ 创建异步任务失败:', {
        error: insertError,
        code: insertError.code,
        message: insertError.message,
        hint: insertError.hint,
        details: insertError.details
      })
      return NextResponse.json({ 
        error: '创建任务失败', 
        details: insertError.message,
        code: insertError.code 
      }, { status: 500 })
    }

    console.log(`✅ 异步任务创建成功: ${task.id}`)

    // 立即开始后台处理（不等待结果）
    processAsyncTask(task.id).catch(error => {
      console.error(`❌ 后台处理任务失败: ${task.id}`, error)
    })

    return NextResponse.json({
      id: task.id,
      status: 'pending',
      message: '任务已创建，正在后台处理中...'
    })

  } catch (error) {
    console.error('❌ 异步分析API错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 后台异步处理函数（5分钟超时）
async function processAsyncTask(taskId: string) {
  const startTime = Date.now()
  const timeoutMs = 5 * 60 * 1000 // 5分钟超时
  
  try {
    console.log(`🔄 开始后台处理任务: ${taskId}，超时时间: 5分钟`)

    // 更新状态为processing
    await supabaseAdmin
      .from('analysis_tasks')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', taskId)

    // 获取任务详情
    const { data: task, error: taskError } = await supabaseAdmin
      .from('analysis_tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      throw new Error('任务不存在')
    }

    // 检查是否超时
    if (Date.now() - startTime > timeoutMs) {
      throw new Error('任务超时（5分钟）')
    }

    const { analysisType, baziData, ziweiData, enableFiltering, language } = task.input_data

    // 步骤1: 调用DIFY进行完整分析（带超时保护）
    console.log(`📝 开始AI完整分析: ${taskId}`)
    
    // 超时检查
    if (Date.now() - startTime > timeoutMs) {
      throw new Error('任务超时（在AI分析前）')
    }
    
    // 🔥 修复数据传递：正确解析前端传递的数据结构
    const inputData = {
      baziData: baziData || ziweiData, // 兼容性处理
      ziweiData: ziweiData || baziData, // 兼容性处理
      originalData: task.input_data     // 保留原始数据
    }
    
    const query = buildAnalysisQuery(analysisType, inputData, language || 'zh')
    const agentType = getAgentType(analysisType, language || 'zh')
    
    console.log(`🔍 构建查询，分析类型: ${analysisType}`)
    console.log(`🎯 使用Agent: ${agentType}`)
    console.log(`📝 查询长度: ${query.length}字符`)
    
    // 使用Promise.race实现DIFY API超时控制（4分钟超时）
    const analysisPromise = difyService.chatWithAgentStreaming(query, task.user_id, agentType, undefined, true)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('DIFY API调用超时（4分钟）')), 4 * 60 * 1000)
    })
    
    console.log(`⏰ 设置4分钟超时保护，开始调用DIFY API...`)
    const fullResult = await Promise.race([analysisPromise, timeoutPromise]) as { answer: string }
    console.log(`✅ AI完整分析完成，长度: ${fullResult.answer.length}字符`)
    
    // 超时检查
    if (Date.now() - startTime > timeoutMs) {
      throw new Error('任务超时（在内容过滤前）')
    }
    
    // 获取完整内容（包含思考过程）
    const completeContent = fullResult.answer

    let finalResult = completeContent

    // 步骤2: 内容过滤（如果启用）
    if (enableFiltering) {
      console.log(`🧹 开始内容过滤: ${taskId}`)
      
      // 更新状态为filtering
      await supabaseAdmin
        .from('analysis_tasks')
        .update({ status: 'filtering' })
        .eq('id', taskId)

      try {
        // 使用本地函数过滤 <think> 标签和markdown格式
        finalResult = filterThinkingContent(completeContent)
        console.log(`✅ 内容过滤完成，过滤前: ${completeContent.length}字符，过滤后: ${finalResult.length}字符`)
      } catch (filterError) {
        console.error(`❌ 内容过滤失败，使用原始结果: ${taskId}`, filterError)
        // 过滤失败时使用原始结果
        finalResult = completeContent
      }
    }

    // 步骤3: 保存到ai_analyses表 (与现有系统保持一致)
    const analysisResult = await saveToAiAnalyses(task, finalResult, analysisType)
    
    // 步骤4: 更新任务状态为完成
    const resultData = {
      status: 'completed',
      completed_at: new Date().toISOString(),
      result: {
        analysis_id: analysisResult.id, // 关联ai_analyses表的记录
        content_length: finalResult.length,
        filtering_enabled: enableFiltering,
        powered_by: `异步分析 - ${getAgentDisplayName(analysisType)}`,
        saved_to_ai_analyses: true
      }
    }

    await supabaseAdmin
      .from('analysis_tasks')
      .update(resultData)
      .eq('id', taskId)

    console.log(`✅ 异步任务完成: ${taskId}，已保存到ai_analyses表: ${analysisResult.id}`)

  } catch (error) {
    console.error(`❌ 异步处理失败: ${taskId}`, error)
    
    // 更新任务状态为失败 (使用正式环境支持的字段)
    await supabaseAdmin
      .from('analysis_tasks')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        result: {
          error: error instanceof Error ? error.message : '处理失败',
          failed_at: new Date().toISOString()
        }
      })
      .eq('id', taskId)
  }
}

// 保存分析结果到ai_analyses表 (复用现有系统的保存逻辑)
async function saveToAiAnalyses(task: any, content: string, analysisType: string) {
  try {
    console.log(`💾 开始保存分析结果到ai_analyses表: ${task.id}`)
    
    const { baziData, ziweiData } = task.input_data
    const inputData = baziData || ziweiData || {}
    
    // 构建birth_data用于查找或创建命盘
    const birth_data = {
      name: `${getAnalysisDisplayName(analysisType)}分析`,
      year: inputData.year || inputData.birth_year || 1990,
      month: inputData.month || inputData.birth_month || 1,
      day: inputData.day || inputData.birth_day || 1,
      hour: inputData.hour || inputData.birth_hour || 12,
      gender: inputData.gender || 'male'
    }
    
    // 确定命盘类型
    const chart_type = (analysisType === 'ziwei_reasoning' || analysisType === 'sihua_reasoning') ? 'ziwei' : 'bazi'
    
    // 查找或创建命盘
    let chart_id = null
    
    // 先尝试查找现有的命盘记录
    const { data: existingCharts } = await supabaseAdmin
      .from('user_charts')
      .select('id, name, birth_year, birth_month, birth_day')
      .eq('user_id', task.user_id)
      .eq('chart_type', chart_type)
      .eq('birth_year', birth_data.year)
      .eq('birth_month', birth_data.month)
      .eq('birth_day', birth_data.day)
      .order('created_at', { ascending: false })
      .limit(1)

    if (existingCharts && existingCharts.length > 0) {
      chart_id = existingCharts[0].id
      console.log(`✅ 找到匹配的命盘记录: ${chart_id}`)
    } else {
      // 创建新的命盘记录
      console.log('🆕 创建新的命盘记录...')
      const { data: newChart, error: createError } = await supabaseAdmin
        .from('user_charts')
        .insert({
          user_id: task.user_id,
          name: birth_data.name,
          birth_year: birth_data.year,
          birth_month: birth_data.month,
          birth_day: birth_data.day,
          birth_hour: birth_data.hour,
          gender: birth_data.gender,
          chart_type: chart_type
        })
        .select('id')
        .single()

      if (createError || !newChart) {
        throw new Error(`创建命盘记录失败: ${createError?.message}`)
      }

      chart_id = newChart.id
      console.log(`✅ 创建新命盘记录成功: ${chart_id}`)
    }

    // 🔥 实施3份限制：检查是否已有3份同类型分析
    const { data: existingAnalyses } = await supabaseAdmin
      .from('ai_analyses')
      .select('id, created_at')
      .eq('chart_id', chart_id)
      .eq('analysis_type', analysisType)
      .order('created_at', { ascending: true })

    if (existingAnalyses && existingAnalyses.length >= 3) {
      // 删除最早的分析
      const oldestAnalysis = existingAnalyses[0]
      const { error: deleteError } = await supabaseAdmin
        .from('ai_analyses')
        .delete()
        .eq('id', oldestAnalysis.id)
      
      if (deleteError) {
        console.error('❌ 删除最早分析失败:', deleteError)
      } else {
        console.log(`🗑️ 删除最早的${analysisType}分析: ${oldestAnalysis.id}`)
      }
    }

    // 保存新的分析结果
    const { data: analysisResult, error: saveError } = await supabaseAdmin
      .from('ai_analyses')
      .insert({
        chart_id: chart_id,
        analysis_type: analysisType,
        content: content,
        agent_name: getAgentDisplayName(analysisType)
      })
      .select()
      .single()

    if (saveError) {
      console.error('❌ 保存分析结果失败:', saveError)
      throw saveError
    }

    console.log(`✅ 异步分析保存成功: ${analysisResult.id} (${analysisType})`)
    return analysisResult

  } catch (error) {
    console.error(`❌ 保存到ai_analyses表失败:`, error)
    throw error
  }
}

// 获取分析类型显示名称
function getAnalysisDisplayName(analysisType: string): string {
  const displayMap: Record<string, string> = {
    'tiekou_zhiduan': '铁口直断',
    'yongshen_analysis': '用神分析',
    'ziwei_reasoning': '紫微推理',
    'sihua_reasoning': '四化分析'
  }
  return displayMap[analysisType] || '未知分析'
}

// 构建分析查询 - 复用现有系统的INPUT构建逻辑
function buildAnalysisQuery(analysisType: string, inputData: any, language: 'zh' | 'en' = 'zh'): string {
  const { baziData, ziweiData, originalData } = inputData

  switch (analysisType) {
    case 'tiekou_zhiduan':
      return buildBaziQuery(baziData, analysisType, language)
    
    case 'yongshen_analysis':
      return buildBaziQuery(baziData, analysisType, language)
    
    case 'ziwei_reasoning':
      return buildZiweiQuery(ziweiData, originalData, language)
    
    case 'sihua_reasoning':
      return buildSihuaQuery(ziweiData, originalData, language)
    
    default:
      return buildBaziQuery(baziData, analysisType)
  }
}

// 八字分析查询构建（复用现有逻辑）
function buildBaziQuery(baziData: any, analysisType: string, language: 'zh' | 'en' = 'zh'): string {
  const yearPillar = baziData?.yearPillar || '未知'
  const monthPillar = baziData?.monthPillar || '未知'  
  const dayPillar = baziData?.dayPillar || '未知'
  const hourPillar = baziData?.hourPillar || '未知'
  const gender = baziData?.gender || '未知'

  if (analysisType === 'tiekou_zhiduan') {
    if (language === 'en') {
      return `请对以下八字进行铁口直断分析，为外国友人算命：

基本信息：
年柱：${yearPillar}
月柱：${monthPillar}
日柱：${dayPillar}
时柱：${hourPillar}
性别：${gender}

<think>
请用中文完成完整的思考和分析过程：
1. 先进行传统的八字分析，包括五行生克、格局判断、用神喜忌等
2. 运用铁口直断技法，结合四柱八字的整体格局
3. 从以下方面进行详细分析：
   - 性格特点和天赋才能
   - 事业发展方向和成就
   - 财运状况和理财能力
   - 感情婚姻和家庭关系
   - 健康状况和注意事项
   - 人际关系和社交能力
   - 重要流年运势提醒
4. 确保分析准确、实用，符合传统命理学原理
</think>

现在请用平白易懂的英文为外国友人解释分析结果：

Please provide detailed Categorical Prediction analysis in the following aspects:
1. Personality traits and natural talents
2. Career development direction and achievements
3. Wealth status and financial management ability
4. Relationships, marriage and family
5. Health conditions and precautions
6. Interpersonal relationships and social skills
7. Important fleeting year fortune reminders

IMPORTANT INSTRUCTIONS:
- First complete your full analysis and reasoning in Chinese within <think></think> tags
- Then translate and explain your conclusions in plain, simple English
- Use clear, everyday language that foreign friends can easily understand
- Avoid complex terminology - explain concepts in simple terms
- Focus on practical, actionable insights
- Maintain the accuracy of traditional Chinese metaphysics while making it accessible

Please combine the overall pattern of the BaZi, use Categorical Prediction techniques, and provide accurate and practical analysis suggestions in clear English.`
    } else {
      return `请对以下八字进行铁口直断分析：

基本信息：
年柱：${yearPillar}
月柱：${monthPillar}
日柱：${dayPillar}
时柱：${hourPillar}
性别：${gender}

请从以下方面进行详细的铁口直断分析：
1. 性格特征和天赋才能
2. 事业发展方向和成就
3. 财运状况和理财能力
4. 感情婚姻和家庭关系
5. 健康状况和注意事项
6. 人际关系和社交能力
7. 重要流年运势提醒

请结合八字的整体格局，运用铁口直断的技法，给出准确、实用的分析建议。`
    }
  }

  if (analysisType === 'yongshen_analysis') {
    if (language === 'en') {
      return `请分析以下八字的用神，为外国友人解读：

基本信息：
年柱：${yearPillar}
月柱：${monthPillar}  
日柱：${dayPillar}
时柱：${hourPillar}
性别：${gender}

<think>
请用中文完成完整的用神分析过程：
请严格依据盲派做功理论，围绕「五行流通→求财/制杀」核心目标，按以下结构分析用神：
一、干支作用（40%权重）
[天干生克] → 标注关键矛盾点（如：官杀制身/财星被劫）
[藏干联动] → 说明地支藏干如何改变天干力量对比

二、刑冲合会（30%权重）
1. 合会：注明三合六合形成的五行力量转移方向  
   - 例：寅午戌合火 → 转化官杀为财源
2. 刑冲：分析刑冲破害对用神选择的影响  
   - 例：未戌刑土旺 → 需木疏土但忌金助土

三、季节调候（20%权重）
① 当令五行：指出月令对日主支撑度（强/弱/中和）  
② 调候急务：说明季节导致的特殊需求（如：寒木需火暖）

四、透干加成（10%权重）
- 天干透出十神：标注其是否放大关键矛盾（如：双官透加重克身）

矛盾分级：将「官杀制身」「财星受阻」列为一级矛盾
动态权重：根据八字组合自动调整分析维度权重
路径可视化：强制要求用神作用三步推演
</think>

现在请用简洁清晰的英文为外国友人解释用神分析结果：

Please analyze the Yong Shen (Favorable Element) for the following BaZi chart:

Basic Information:
Year Pillar: ${yearPillar}
Month Pillar: ${monthPillar}  
Day Pillar: ${dayPillar}
Hour Pillar: ${hourPillar}
Gender: ${gender}

IMPORTANT INSTRUCTIONS:
- First complete your full Yong Shen analysis in Chinese within <think></think> tags using traditional blind school methodology
- Then explain your conclusions in clear, simple English
- Focus on practical guidance about favorable and unfavorable elements
- Explain how the Yong Shen affects daily life, career, and fortune
- Use everyday language that foreign friends can easily understand
- Avoid complex traditional terms - explain concepts simply

Please provide analysis covering:
1. Primary Yong Shen (main favorable element) and reasoning
2. Supporting elements and their roles  
3. Unfavorable elements to avoid
4. Practical applications in daily life
5. Timing considerations for major decisions`
    } else {
      return `请分析以下八字的用神：

基本信息：
年柱：${yearPillar}
月柱：${monthPillar}  
日柱：${dayPillar}
时柱：${hourPillar}
性别：${gender}

请严格依据盲派做功理论，围绕「五行流通→求财/制杀」核心目标，按以下结构分析用神：
一、干支作用（40%权重）
[天干生克] → 标注关键矛盾点（如：官杀制身/财星被劫）
[藏干联动] → 说明地支藏干如何改变天干力量对比

二、刑冲合会（30%权重）
1. 合会：注明三合六合形成的五行力量转移方向  
   - 例：寅午戌合火 → 转化官杀为财源
2. 刑冲：分析刑冲破害对用神选择的影响  
   - 例：未戌刑土旺 → 需木疏土但忌金助土

三、季节调候（20%权重）
① 当令五行：指出月令对日主支撑度（强/弱/中和）  
② 调候急务：说明季节导致的特殊需求（如：寒木需火暖）

四、透干加成（10%权重）
- 天干透出十神：标注其是否放大关键矛盾（如：双官透加重克身）

矛盾分级：将「官杀制身」「财星受阻」列为一级矛盾
动态权重：根据八字组合自动调整分析维度权重
路径可视化：强制要求用神作用三步推演`
    }
  }

  return `请进行八字命理分析：
年柱：${yearPillar}
月柱：${monthPillar}
日柱：${dayPillar}
时柱：${hourPillar}
性别：${gender}

请提供详细的命理分析。`
}

// 紫微斗数查询构建（复用现有逻辑）
function buildZiweiQuery(ziweiData: any, originalData: any, language: 'zh' | 'en' = 'zh'): string {
  // 处理紫微推理数据结构
  const data = ziweiData || originalData?.ziweiData || {}
  
  // 基本信息
  const year = data.year || '未知'
  const month = data.month || '未知'
  const day = data.day || '未知'
  const hour = data.hour || '未知'
  const gender = data.gender || '未知'
  const username = data.username || '未知'
  
  // 检查是否有命运之箭数据
  if (data.palaceData && data.mingGong && data.qianYi && data.caiPo && data.guanLu) {
    // 命运之箭分析
    const basePrompt = `请进行紫微斗数命运之箭分析：

基本信息：
用户名：${username}
出生年份：${year}
出生月份：${month}
出生日期：${day}
出生时辰：${hour}
性别：${gender}

命运之箭四宫配置：
1. 命宫（箭头）：${data.mingGong.position}
   星曜：${data.mingGong.stars}

2. 财帛宫（箭身）：${data.caiPo.position}
   星曜：${data.caiPo.stars}

3. 官禄宫（箭羽）：${data.guanLu.position}
   星曜：${data.guanLu.stars}

4. 迁移宫（弓弦）：${data.qianYi.position}
   星曜：${data.qianYi.stars}

请基于命运之箭理论，分析四宫联动关系，说明：
1. 命宫作为箭头的方向和目标
2. 财帛宫作为箭身的能量和资源
3. 官禄宫作为箭羽的稳定性和成就
4. 迁移宫作为弓弦的推动力和变化

请提供详细的紫微斗数推理分析。`;
    
    if (language === 'en') {
      return basePrompt + `

IMPORTANT: 请用中文完成思考过程，然后用平白易懂的英文解释结果。为外国友人算命，避免复杂术语，使用日常英语表达。`;
    }
    
    return basePrompt;
  }
  
  // 基础紫微分析
  const basePrompt = `请进行紫微斗数分析：

基本信息：
用户名：${username}
出生年份：${year}
出生月份：${month}
出生日期：${day}
出生时辰：${hour}
性别：${gender}

请提供详细的紫微斗数推理分析。`;

  if (language === 'en') {
    return basePrompt + `

IMPORTANT: 请用中文完成思考过程，然后用平白易懂的英文解释结果。为外国友人算命，避免复杂术语，使用日常英语表达。`;
  }
  
  return basePrompt;
}

// 四化分析查询构建（复用现有逻辑）
function buildSihuaQuery(ziweiData: any, originalData: any, language: 'zh' | 'en' = 'zh'): string {
  const data = originalData?.ziweiData || ziweiData || {}
  
  // 检查是否有前端构建的查询（优先使用）
  if (data.query) {
    console.log('🔍 使用前端构建的四化查询')
    let query = data.query;
    if (language === 'en') {
      query += `

IMPORTANT: 请用中文完成思考过程，然后用平白易懂的英文解释结果。为外国友人算命，避免复杂术语，使用日常英语表达。`;
    }
    return query;
  }
  
  // 如果有完整的宫位数据和年干，使用完整的四化查询构建逻辑
  if (data.palaces && data.yearGan) {
    console.log('🔍 使用完整宫位数据构建四化查询', { yearGan: data.yearGan, palacesCount: data.palaces.length })
    return buildCompleteSihuaQuery(data.palaces, data.yearGan, language)
  }
  
  // 使用简化的四化查询构建（兜底）
  let query = `请进行生年四化与来因宫分析：

数据：`

  // 添加来因宫信息
  if (data.laiYinGong) {
    const laiYinGong = data.laiYinGong as any
    query += `\n来因宫：${laiYinGong.name || '未知'}`
  } else {
    query += `\n来因宫：未知`
  }

  // 添加生年四化星与宫位信息
  if (data.sihuaPositions) {
    const positions = data.sihuaPositions as any
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
  } else {
    query += `\n\n生年四化星与宫：数据不完整`
  }

  query += `\n\n解释重点：
1. 因为生年四化皆由来因宫而来，所以生年四化的解释必须结合以下的要素：四化的宫位、四化、四化星曜、来因宫与四化宫的关系
2. 如有自化，必须结合其生年四化解
3. 每一个生年四化必须结合来因宫详细解释

注：ABCD是生年禄权科忌，x是离心自化（有破耗的含义），i是向心自化（有付出的含义），xA是离心禄。`

  // 添加英文输出指令
  if (language === 'en') {
    query += `

IMPORTANT: 请用中文完成思考过程，然后用平白易懂的英文解释结果。为外国友人算命，避免复杂术语，使用日常英语表达。`;
  }

  return query
}

// 🔥 从现有系统复制完整的四化查询构建逻辑
function buildCompleteSihuaQuery(palaces: any[], yearGan: string, language: 'zh' | 'en' = 'zh'): string {
  console.log('🚀 开始构建完整四化查询');
  console.log('🔍 传入参数:', { yearGan, palacesCount: palaces.length });
  
  // 生年四化映射
  const SIHUA_MAP: Record<string, Record<string, string>> = {
    '甲': { '禄': '廉贞', '权': '破军', '科': '武曲', '忌': '太阳' },
    '乙': { '禄': '天机', '权': '天梁', '科': '紫微', '忌': '太阴' },
    '丙': { '禄': '天同', '权': '天机', '科': '文昌', '忌': '廉贞' },
    '丁': { '禄': '太阴', '权': '天同', '科': '天机', '忌': '巨门' },
    '戊': { '禄': '贪狼', '权': '太阴', '科': '太阳', '忌': '天机' },
    '己': { '禄': '武曲', '权': '贪狼', '科': '天梁', '忌': '文曲' },
    '庚': { '禄': '太阳', '权': '武曲', '科': '天同', '忌': '天相' },
    '辛': { '禄': '巨门', '权': '太阳', '科': '文曲', '忌': '文昌' },
    '壬': { '禄': '天梁', '权': '紫微', '科': '左辅', '忌': '武曲' },
    '癸': { '禄': '破军', '权': '巨门', '科': '太阴', '忌': '贪狼' }
  };

  // 获取生年四化映射
  const sihuaMap = SIHUA_MAP[yearGan];
  if (!sihuaMap) {
    console.error('❌ 无法获取生年四化映射:', yearGan);
    return `生年四化查询构建失败：无法找到年干${yearGan}的四化映射`;
  }

  // 查找来因宫
  const laiYinPalace = palaces.find((p: any) => p.isLaiYinPalace);
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
    let foundPalace: any = null;
    for (const palace of palaces) {
      const foundStar = palace.stars?.find((star: any) => star.name === sihuaStar);
      if (foundStar) {
        foundPalace = palace;
        break;
      }
    }

    if (foundPalace) {
      // 构建该宫位所有星曜的信息
      const allStarsInfo = foundPalace.stars?.map((star: any) => {
        let starInfo = `${star.name}(${star.brightness})`;
        
        // 先收集所有四化标记
        const sihuaMarks: string[] = [];
        
        // 添加生年四化标记
        if (star.sihua) {
          sihuaMarks.push(star.sihua);
        }
        
        // 添加自化标记（从palaceHua中获取）
        if (star.palaceHua && star.palaceHua.length > 0) {
          star.palaceHua.forEach((hua: string) => {
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

  // 添加英文输出指令
  if (language === 'en') {
    query += `

IMPORTANT: 请用中文完成思考过程，然后用平白易懂的英文解释结果。为外国友人算命，避免复杂术语，使用日常英语表达。`;
  }

  console.log('✅ 完整四化查询构建完成');
  return query;
}

// 获取Agent类型
function getAgentType(analysisType: string, language: 'zh' | 'en' = 'zh'): string {
  switch (analysisType) {
    case 'tiekou_zhiduan':
      // 中文用中文的，英文用英文的Agent API
      return language === 'en' ? 'tiekou-master' : 'bazi-master'
    case 'yongshen_analysis':
      // 中文用中文的，英文用英文的Agent API
      return language === 'en' ? 'yongshen-master-en' : 'yongshen-master'
    case 'ziwei_reasoning':
      // 中文用中文的，英文用英文的Agent API
      return language === 'en' ? 'ziwei-master-en' : 'ziwei-master'
    case 'sihua_reasoning':
      // 中文用中文的，英文用英文的Agent API
      return language === 'en' ? 'ziwei-master-en' : 'ziwei-master'
    default:
      return 'bazi-master'
  }
}

// 获取Agent显示名称
function getAgentDisplayName(analysisType: string): string {
  const agentMap: Record<string, string> = {
    'tiekou_zhiduan': '铁口直断大师',
    'yongshen_analysis': '用神大师',
    'ziwei_reasoning': '紫微推理大师',
    'sihua_reasoning': '四化分析大师'
  }
  return agentMap[analysisType] || '未知Agent'
} 
