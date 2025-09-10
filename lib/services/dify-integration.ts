/**
 * Dify集成服务
 * 用于替换现有的RAG系统，调用Dify API
 */

interface DifyResponse {
  answer: string;
  conversation_id?: string;
  message_id?: string;
  metadata?: any;
  event?: string;
  mode?: string;
  created_at?: number;
}

interface DifyRequest {
  inputs: Record<string, any>;
  query: string;
  response_mode: 'blocking' | 'streaming';
  conversation_id?: string;
  user: string;
  files?: unknown[];
}

class DifyService {
  private baseUrl: string;
  private agents: Record<string, string>;
  private isPro: boolean = process.env.DIFY_ACCOUNT_TYPE === 'pro';

  constructor() {
    this.baseUrl = process.env.DIFY_API_BASE_URL || 'https://api.dify.ai/v1';
    
    // DIFY API Key是app-开头的格式（从截图可以确认）
    this.agents = {
      'ziwei-master': process.env.DIFY_ZIWEI_MASTER_KEY || 'app-YaRN1xYvhHwNxZb4pafDnZE8',  // 紫微斗数大师
      'ziwei-master-en': process.env.DIFY_ZIWEI_MASTER_EN_KEY || 'app-hUI20LBx75niACo5Aas32zkM', // 英文紫微斗数大师
      'bazi-master': process.env.DIFY_BAZI_MASTER_KEY || 'app-gqcqcWHAFcAJRdhUVIRtPPUk',    // 盲派八字大师
      'ziwei-chatbot': process.env.DIFY_ZIWEI_CHATBOT_KEY || 'app-uODNIlRtgCz259cxdJMnOCUX', // 司天监正·星玄大人
      'bazi-chatbot': process.env.DIFY_BAZI_CHATBOT_KEY || 'app-kO5Cy7Uunjk8mD8mmvja3BZI',   // 玄虚道人
      'ziwei-chatbot-en': process.env.DIFY_ZIWEI_CHATBOT_EN_KEY || 'app-77b9ziNuwCqVzYXCD0q5a7kS', // ZiweiBot (English)
      'bazi-chatbot-en': process.env.DIFY_BAZI_CHATBOT_EN_KEY || 'app-Y6o71sjlXHLl1ZCibo0s5xUj',   // BaziBot (English)
      'yongshen-master': process.env.DIFY_YONGSHEN_MASTER_KEY || 'app-uEzfloiWY8XhsZheoK5r0dVo', // 用神大师
      'yongshen-master-en': process.env.DIFY_YONGSHEN_MASTER_EN_KEY || 'app-kOcz8DkKx17wHzPV4Jeg2ast', // 英文用神大师
      'tiekou-master': process.env.DIFY_TIEKOU_MASTER_KEY || 'app-tFJXiBILEY9GOGeCPEq6TAIR', // 铁口直断大师(英文版)
      'fortune-master': process.env.DIFY_FORTUNE_MASTER_KEY || 'app-PLACEHOLDER1', // 解签大师 - 专业解读传统签文
      'fortune-master-en': process.env.DIFY_FORTUNE_MASTER_EN_KEY || 'app-PLACEHOLDER2', // Fortune Oracle - Professional fortune slip interpretation
      'fortune-master-ja': process.env.DIFY_FORTUNE_MASTER_JA_KEY || 'app-PLACEHOLDER3', // 占い師 - 伝統的なおみくじの専門的解釈
    };
  }

  /**
   * 移除思考过程 - 彻底清除所有思考内容
   */
  private removeThinkingProcess(text: string): string {
    if (!text) return '';
    
    let cleaned = text;
    
    // ====== 第一阶段：处理各种标签格式 ======
    
    // 1. 处理标准的think标签（贪婪匹配，确保删除整个思考块）
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
    cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
    
    // 2. 处理未闭合的think标签（从<think>到文本结尾或下一个明显的正文）
    cleaned = cleaned.replace(/<think>[\s\S]*?(?=\n(?:[一二三四五六七八九十]、|## |### |\*\*[^思考]|\d+\.|【[^思考])|$)/gi, '');
    cleaned = cleaned.replace(/<thinking>[\s\S]*?(?=\n(?:[一二三四五六七八九十]、|## |### |\*\*[^思考]|\d+\.|【[^思考])|$)/gi, '');
    
    // 3. 处理格式错误的嵌套标签（如 <think> <think>）
    cleaned = cleaned.replace(/<think>\s*<think>[\s\S]*?(?:<\/think>\s*<\/think>|<\/think>|$)/gi, '');
    
    // 4. 清理剩余的孤立标签
    cleaned = cleaned.replace(/<\/?think>/gi, '');
    cleaned = cleaned.replace(/<\/?thinking>/gi, '');
    
    // ====== 第二阶段：处理各种文本格式的思考内容 ======
    
    // 1. 处理英文思考标记
    cleaned = cleaned.replace(/\*\*Thinking:\*\*[\s\S]*?(?=\n\n|\*\*(?!Thinking)[^*]|$)/gi, '');
    cleaned = cleaned.replace(/Thinking:[\s\S]*?(?=\n\n|[A-Z][^a-z]|$)/gi, '');
    
    // 2. 处理中文思考标记
    cleaned = cleaned.replace(/思考[:：][\s\S]*?(?=\n\n|[^思考\s]|$)/gi, '');
    cleaned = cleaned.replace(/【思考】[\s\S]*?(?=\n\n|【(?!思考)|$)/gi, '');
    cleaned = cleaned.replace(/\*\*思考\*\*[\s\S]*?(?=\n\n|\*\*(?!思考)|$)/gi, '');
    
    // 3. 处理特殊的思考内容模式
    // 删除"首先，用户提供了..."这种明显的思考开头
    cleaned = cleaned.replace(/^首先，[^。]*?。[\s\S]*?(?=\n\n|(?:[一二三四五六七八九十]、|## |### |\*\*|【))/gm, '');
    
    // 删除"我需要..."这种分析思路
    cleaned = cleaned.replace(/我需要[\s\S]*?(?=\n\n|(?:[一二三四五六七八九十]、|## |### |\*\*|【))/gi, '');
    
    // 删除"分析八字："后面跟着的明显思考内容
    cleaned = cleaned.replace(/分析八字：[\s\S]*?(?=\n\n(?:[一二三四五六七八九十]、|## |### |\*\*|【)|$)/gi, '');
    
    // ====== 第三阶段：清理和格式化 ======
    
    // 清理多余的空行和空白字符
    cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, '\n\n');
    cleaned = cleaned.replace(/^\s+|\s+$/g, '');
    
    // 如果清理后只剩下很短的内容或明显的思考残留，返回空字符串
    if (cleaned.length < 50 || 
        cleaned.includes('用户提供了') || 
        cleaned.includes('我需要') ||
        cleaned.includes('严格按照') ||
        cleaned.startsWith('分析') && cleaned.length < 200) {
      return '';
    }
    
    return cleaned.trim();
  }

  /**
   * 优化的DIFY请求处理 - 修复连接配置
   */
  private async fetchWithOptimization(url: string, options: RequestInit, isAnalysisTask = false): Promise<Response> {
    console.log(`⚡ 开始DIFY请求${isAnalysisTask ? ' (命理分析任务)' : ''}`);
    
    // DIFY性能优化配置
    const controller = new AbortController();
    
    // 分层超时策略
    const timeouts = {
      chat: 180000,      // 聊天: 3分钟
      analysis: 600000,  // 分析: 10分钟 (增加到10分钟)
      complex: 900000    // 复杂分析: 15分钟
    };
    
    // 智能检测请求复杂度
    const requestSize = JSON.stringify(options.body || '').length;
    const isComplexAnalysis = requestSize > 2000;
    const isAnalysisRequest = requestSize > 500;
    
    // 命理分析任务强制使用长超时
    const timeout = isAnalysisTask ? timeouts.analysis : 
                   isComplexAnalysis ? timeouts.complex : 
                   isAnalysisRequest ? timeouts.analysis : 
                   timeouts.chat;
    
    // console.log(`⏱️ 设置${timeout/1000}秒超时 (请求大小: ${requestSize}字节)`);
    
    const timeoutId = setTimeout(() => {
      // console.log(`⏰ DIFY请求超时 (${timeout/1000}秒)，优雅取消`);
      controller.abort();
    }, timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        // 简化HTTP配置，移除有问题的keep-alive配置
        headers: {
          ...options.headers,
          // 移除有问题的Connection和Keep-Alive配置
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        
        // 504超时特殊处理
        if (response.status === 504) {
          // console.log(`🔄 检测到504超时，请求大小: ${requestSize}字节`);
          throw new Error(`DIFY服务器处理超时 (${response.status})`);
        }
        
        throw new Error(`Dify API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // 详细错误日志
      // console.error('❌ DIFY请求失败详情:', {
      //   errorName: error instanceof Error ? error.name : 'Unknown',
      //   errorMessage: error instanceof Error ? error.message : String(error),
      //   errorStack: error instanceof Error ? error.stack : null,
      //   requestSize,
      //   timeout: timeout/1000,
      //   isAnalysisTask
      // });
      
      // 网络错误处理
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`请求超时 (${timeout/1000}秒)，请尝试简化您的问题或稍后重试`);
        }
        if (error.message.includes('504')) {
          throw new Error('AI服务暂时过载，请稍后重试 (建议简化问题内容)');
        }
        if (error.message.includes('ECONNRESET') || error.message.includes('ENOTFOUND')) {
          throw new Error(`网络连接错误: ${error.message}`);
        }
      }
      
      throw error;
    }
  }

  /**
   * 流式聊天接口 - 突破Cloudflare 60秒限制
   */
  async chatWithAgentStreaming(query: string, userId: string, agentType: string, conversationId?: string, preserveThinking = false): Promise<DifyResponse> {
    // console.log(`🔍 chatWithAgentStreaming接收到的agentType: ${agentType}`);
    const apiKey = this.agents[agentType];
    // console.log(`🔑 对应的API Key: ${apiKey}`);
    if (!apiKey) {
      throw new Error(`未找到Agent类型: ${agentType}`);
    }

    const requestBody: DifyRequest = {
      inputs: {},
      query,
      response_mode: 'streaming', // 使用流式响应
      user: userId,
    };

    if (conversationId) {
      requestBody.conversation_id = conversationId;
    }

    // console.log(`🌊 调用DIFY流式API ${agentType}，查询长度: ${query.length}字符`);

    const response = await this.fetchWithOptimization(`${this.baseUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }, true); // 标记为分析任务，使用更长的超时时间

    // 处理流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取流式响应读取器');
    }

    let fullAnswer = '';
    let conversationInfo = null;
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.event === 'message') {
                fullAnswer += data.answer || '';
              } else if (data.event === 'message_end') {
                conversationInfo = {
                  conversation_id: data.conversation_id,
                  message_id: data.id
                };
                // console.log(`✅ DIFY流式响应完成，总长度: ${fullAnswer.length}字符`);
              }
            } catch (parseError) {
              // 忽略解析错误，继续处理
              // console.log('流式数据解析跳过:', line.substring(0, 100));
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (!fullAnswer) {
      throw new Error('流式响应未收到有效内容');
    }

    // 根据参数决定是否过滤思考过程
    const finalAnswer = preserveThinking ? fullAnswer : this.removeThinkingProcess(fullAnswer);
    
    return {
      answer: finalAnswer,
      conversation_id: conversationInfo?.conversation_id,
      message_id: conversationInfo?.message_id
    };
  }

  /**
   * 指定Agent的聊天接口 - 移除重试机制，避免打断DIFY处理，支持历史消息
   */
  async chatWithAgent(query: string, userId: string, agentType: string, conversationId?: string, history?: unknown[]): Promise<DifyResponse> {
    const apiKey = this.agents[agentType];
    if (!apiKey) {
      throw new Error(`未找到Agent类型: ${agentType}`);
    }

    // 如果有历史消息，将其整合到查询中
    let finalQuery = query;
    if (history && history.length > 0) {
      const historyContext = history.map(msg => 
        `${msg.role === 'user' ? '用户' : 'AI'}：${msg.content}`
      ).join('\n\n');
      
      finalQuery = `以下是我们之前的对话记录：\n\n${historyContext}\n\n现在请回答：${query}`;
      // console.log(`📚 包含${history.length}条历史记录，总查询长度: ${finalQuery.length}字符`);
    }

    const requestBody: DifyRequest = {
      inputs: {},
      query: finalQuery,
      response_mode: 'blocking',
      user: userId,
    };

    if (conversationId) {
      requestBody.conversation_id = conversationId;
    }

    // console.log(`🤖 调用DIFY ${agentType}，查询长度: ${finalQuery.length}字符 - 优化配置`);

    // 检查是否为分析任务
    const isAnalysisTask = ['bazi-master', 'ziwei-master'].includes(agentType);

    const response = await this.fetchWithOptimization(`${this.baseUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }, isAnalysisTask);

    // 安全解析JSON响应
    let data;
    try {
      const responseText = await response.text();
      // console.log(`📡 DIFY原始响应长度: ${responseText.length}字符`);
      
      if (!responseText || responseText.trim() === '') {
        throw new Error('DIFY返回空响应');
      }
      
      data = JSON.parse(responseText);
      // console.log(`✅ DIFY ${agentType} 响应成功，答案长度: ${data.answer?.length || 0}字符`);
      
      // 验证响应格式
      if (!data.answer && !data.error) {
        // console.warn('⚠️ DIFY响应格式异常:', data);
      }

      // 过滤掉思考过程
      if (data.answer) {
        data.answer = this.removeThinkingProcess(data.answer);
      }
      
    } catch (parseError) {
      // console.error('❌ DIFY响应解析失败:', parseError);
      throw new Error(`DIFY响应格式错误: ${parseError instanceof Error ? parseError.message : '未知错误'}`);
    }
    
    return data;
  }

  /**
   * 默认聊天接口
   */
  async chat(query: string, userId: string, conversationId?: string): Promise<DifyResponse> {
    return this.chatWithAgent(query, userId, 'ziwei-master', conversationId);
  }

  /**
   * 流式调用Dify API
   */
  async chatStream(query: string, userId: string, agentType: string = 'ziwei-master', conversationId?: string): Promise<ReadableStream> {
    const apiKey = this.agents[agentType];
    if (!apiKey) {
      throw new Error(`未找到Agent类型: ${agentType}`);
    }

    const requestBody: DifyRequest = {
      inputs: {},
      query,
      response_mode: 'streaming',
      user: userId,
    };

    if (conversationId) {
      requestBody.conversation_id = conversationId;
    }

    const response = await this.fetchWithOptimization(`${this.baseUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }, false);

    if (!response.ok) {
      throw new Error(`Dify API error: ${response.status} ${response.statusText}`);
    }

    return response.body!;
  }

  /**
   * 获取对话历史
   */
  async getConversationHistory(conversationId: string, userId: string, agentType: string = 'ziwei-master') {
    const apiKey = this.agents[agentType];
    if (!apiKey) {
      throw new Error(`未找到Agent类型: ${agentType}`);
    }

    const response = await this.fetchWithOptimization(
      `${this.baseUrl}/messages?conversation_id=${conversationId}&user=${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      },
      false
    );

    if (!response.ok) {
      throw new Error(`Dify API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * 检查API连接状态
   */
  async healthCheck(agentType: string = 'ziwei-master'): Promise<boolean> {
    try {
      const apiKey = this.agents[agentType];
      if (!apiKey) {
        return false;
      }

      const response = await this.fetchWithOptimization(`${this.baseUrl}/parameters`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }, false);
      
      return response.ok;
    } catch (error) {
      // console.error('Dify健康检查失败:', error);
      return false;
    }
  }
}

export const difyService = new DifyService();

/**
 * 紫微斗数分析 - 纯DIFY流式API，突破Cloudflare限制
 */
export async function analyzeZiweiWithDify(
  birthData: any,
  userId: string,
  conversationId?: string
): Promise<DifyResponse> {
  // console.log('🔮 DIFY紫微分析开始...');
  
  // 如果有自定义查询，使用自定义查询
  if (birthData.query) {
    return await difyService.chatWithAgentStreaming(birthData.query, userId, 'ziwei-master', conversationId);
  }

  // 构建详细的命运之箭查询，包含四宫具体星曜信息
  let query = `请分析以下紫微斗数命盘：
出生时间：${birthData.year}年${birthData.month}月${birthData.day}日${birthData.hour}时
性别：${birthData.gender}`;

  // 如果有宫位数据（命运之箭），添加详细的四宫信息
  if (birthData.palaceData) {
    const { mingGong, qianYi, caiPo, guanLu } = birthData.palaceData;
    
    query += `\n\n命运之箭四宫详细配置：`;
    
    // 命宫信息
    if (mingGong) {
      query += `\n🎯 命宫：${mingGong.heavenlyStem}${mingGong.branch}`;
      if (mingGong.stars && mingGong.stars.length > 0) {
                const starInfo = mingGong.stars.map((star: unknown) => {
          let result = `${star.name}(${star.brightness})`
          if (star.xiangXinSihua) result += `i${star.xiangXinSihua}`
          if (star.liXinSihua) result += `x${star.liXinSihua}`
          if (star.sihua) result += star.sihua
          return result
        }).join('、');
        query += ` - ${starInfo}`;
      }
    }
    
    // 迁移宫信息
    if (qianYi) {
      query += `\n🏹 迁移宫：${qianYi.heavenlyStem}${qianYi.branch}`;
      if (qianYi.stars && qianYi.stars.length > 0) {
        const starInfo = qianYi.stars.map((star: unknown) => {
          let result = `${star.name}(${star.brightness})`
          if (star.xiangXinSihua) result += `i${star.xiangXinSihua}`
          if (star.liXinSihua) result += `x${star.liXinSihua}`
          if (star.sihua) result += star.sihua
          return result
        }).join('、');
        query += ` - ${starInfo}`;
      }
    }
    
    // 财帛宫信息
    if (caiPo) {
      query += `\n💰 财帛宫：${caiPo.heavenlyStem}${caiPo.branch}`;
      if (caiPo.stars && caiPo.stars.length > 0) {
        const starInfo = caiPo.stars.map((star: unknown) => {
          let result = `${star.name}(${star.brightness})`
          if (star.xiangXinSihua) result += `i${star.xiangXinSihua}`
          if (star.liXinSihua) result += `x${star.liXinSihua}`
          if (star.sihua) result += star.sihua
          return result
        }).join('、');
        query += ` - ${starInfo}`;
      }
    }
    
    // 官禄宫信息
    if (guanLu) {
      query += `\n🎖️ 官禄宫：${guanLu.heavenlyStem}${guanLu.branch}`;
      if (guanLu.stars && guanLu.stars.length > 0) {
        const starInfo = guanLu.stars.map((star: unknown) => {
          let result = `${star.name}(${star.brightness})`
          if (star.xiangXinSihua) result += `i${star.xiangXinSihua}`
          if (star.liXinSihua) result += `x${star.liXinSihua}`
          if (star.sihua) result += star.sihua
          return result
        }).join('、');
        query += ` - ${starInfo}`;
      }
    }
  }

  // 添加生年四化信息
  if (birthData.sihuaInfo) {
    query += `\n\n生年四化：`;
    if (birthData.sihuaInfo.lu) query += `\nA化禄：${birthData.sihuaInfo.lu}`;
    if (birthData.sihuaInfo.quan) query += `\nB化权：${birthData.sihuaInfo.quan}`;
    if (birthData.sihuaInfo.ke) query += `\nC化科：${birthData.sihuaInfo.ke}`;
    if (birthData.sihuaInfo.ji) query += `\nD化忌：${birthData.sihuaInfo.ji}`;
  }

  query += `\n\n四化符号说明：
A=化禄，B=化权，C=化科，D=化忌
i=向心自化（如iA=向心自化禄），x=离心自化（如xA=离心自化禄）

⚠️ 重要提示：如命迁财官四宫有自化（i或x标识），则须法象生年四化作解释。自化与生年四化的相互作用是分析的关键。`;

  // console.log('🎯 明确调用Agent: ziwei-master');
  
  return await difyService.chatWithAgentStreaming(query, userId, 'ziwei-master', conversationId, false);
}

/**
 * 八字分析 - 纯DIFY，失败时直接返回错误
 */
export async function analyzeMangpaiBaziWithDify(
  baziData: any,
  userId: string,
  conversationId?: string
): Promise<DifyResponse> {
  // console.log('🧙‍♂️ DIFY盲派八字分析开始...');
  
  // 如果有自定义查询，使用自定义查询
  if (baziData.query) {
    return await difyService.chatWithAgentStreaming(baziData.query, userId, 'bazi-master', conversationId, false);
  }

  // 简化查询 - Agent已有完整PROMPT，只需提供基础数据
  const query = `年柱：${baziData.yearPillar}
月柱：${baziData.monthPillar}
日柱：${baziData.dayPillar}
时柱：${baziData.hourPillar}
性别：${baziData.gender}
用神：${baziData.favorableElement || '未定'}`;

  return await difyService.chatWithAgentStreaming(query, userId, 'bazi-master', conversationId, false);
}

/**
 * 铁口直断分析 - 盲派八字大师进行人生四大方面分析
 */
export async function analyzeTiekouWithDify(
  baziData: any,
  userId: string,
  conversationId?: string
): Promise<DifyResponse> {
  // console.log('⚡ DIFY铁口直断分析开始...');
  
  // 构建铁口直断专用查询 - 重点关注四大方面
  const query = `请对以下八字进行铁口直断分析：

八字：${baziData.yearPillar} ${baziData.monthPillar} ${baziData.dayPillar} ${baziData.hourPillar}
性别：${baziData.gender}

请按照以下四个方面进行详细直断：

1. 性格分析：根据八字分析此人的性格特点、优缺点、处事风格
2. 学业职业：分析学业运势、适合的职业方向、事业发展趋势
3. 家庭感情：分析家庭关系、婚姻感情、子女缘分
4. 财运状况：分析财运好坏、投资理财能力、财富积累方式

请用直白明了的语言，给出具体可行的建议。`;

  return await difyService.chatWithAgentStreaming(query, userId, 'bazi-master', conversationId, false);
}

/**
 * 用神推理分析 - 专门的用神大师Agent
 */
export async function analyzeYongShenWithDify(
  baziData: any,
  userId: string,
  conversationId?: string
): Promise<DifyResponse> {
  // console.log('🧠 DIFY用神推理分析开始...');
  
  // 构建用神分析查询
  const query = `请分析以下八字的用神：

基本信息：
年柱：${baziData.yearPillar}
月柱：${baziData.monthPillar}  
日柱：${baziData.dayPillar}
时柱：${baziData.hourPillar}
性别：${baziData.gender}

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
路径可视化：强制要求用神作用三步推演`;

  return await difyService.chatWithAgentStreaming(query, userId, 'yongshen-master', conversationId, false);
}

/**
 * 通用命理咨询 - 使用Dify
 */
export async function consultFortune(
  question: string,
  userId: string,
  conversationId?: string
): Promise<DifyResponse> {
  return await difyService.chat(question, userId, conversationId);
}

/**
 * 签文深度解读 - 专业AI解签师
 */
export async function analyzeFortuneSlipWithDify(
  fortuneSlipData: any,
  userId: string,
  language: string = 'zh',
  conversationId?: string
): Promise<DifyResponse> {
  console.log('🎋 DIFY签文解读开始...', { 
    temple: fortuneSlipData.temple_name,
    slip_number: fortuneSlipData.slip_number,
    language 
  });
  
  // 选择对应语言的解签大师
  let agentType = 'fortune-master';
  switch (language) {
    case 'en':
      agentType = 'fortune-master-en';
      break;
    case 'ja':
      agentType = 'fortune-master-ja';
      break;
    default:
      agentType = 'fortune-master';
  }

  // 构建详细的解签查询
  let query = '';
  
  if (language === 'en') {
    query = `Please provide a comprehensive interpretation of this fortune slip:

**Temple:** ${fortuneSlipData.temple_name}
**Slip Number:** ${fortuneSlipData.slip_number}
**Title:** ${fortuneSlipData.display_title}
**Fortune Level:** ${fortuneSlipData.fortune_level}

**Original Text:**
${fortuneSlipData.display_content}

**User's Question:** ${fortuneSlipData.user_question || 'General guidance'}
**Categories of Interest:** ${fortuneSlipData.categories?.join(', ') || 'All aspects'}

Please provide:
1. **Overall Meaning:** What does this slip signify?
2. **Historical Context:** Explain the cultural story behind this oracle
3. **Multi-faceted Analysis:** Specific guidance for:
   - Career & Studies (功名)
   - Wealth & Business (求财)
   - Marriage & Relationships (婚姻)
   - Health & Well-being (健康)
   - Travel & Migration (出行)
   - Legal Matters (官司)
4. **Modern Application:** How to apply this ancient wisdom today
5. **Action Recommendations:** Concrete steps to take

Focus on cultural depth and practical wisdom.`;
  } else if (language === 'ja') {
    query = `この御神籤の包括的な解釈をお願いします：

**寺院:** ${fortuneSlipData.temple_name}
**籤番号:** ${fortuneSlipData.slip_number}
**題目:** ${fortuneSlipData.display_title}
**吉凶:** ${fortuneSlipData.fortune_level}

**原文:**
${fortuneSlipData.display_content}

**ユーザーの質問:** ${fortuneSlipData.user_question || '総合的な指導'}
**関心分野:** ${fortuneSlipData.categories?.join('、') || '全般'}

以下をお教えください：
1. **全体的な意味:** この籤は何を意味しているか
2. **歴史的背景:** この御神籤の文化的な物語を説明
3. **多角的分析:** 具体的な指導：
   - 仕事・学業（功名）
   - 財運・事業（求財）
   - 結婚・人間関係（婚姻）
   - 健康・福祉（健康）
   - 旅行・移住（出行）
   - 法的問題（官司）
4. **現代への応用:** この古代の知恵を今日どう活用するか
5. **行動提案:** 具体的に取るべき行動

文化的深みと実用的知恵に重点を置いてください。`;
  } else {
    // Chinese (default)
    query = `请对此签文进行全面深度解读：

**庙宇:** ${fortuneSlipData.temple_name}
**签号:** 第${fortuneSlipData.slip_number}签
**签题:** ${fortuneSlipData.display_title}
**吉凶:** ${fortuneSlipData.fortune_level}

**签文原文:**
${fortuneSlipData.display_content}

**用户问题:** ${fortuneSlipData.user_question || '求总体指导'}
**关注领域:** ${fortuneSlipData.categories?.join('、') || '各个方面'}

请提供：
1. **签文总意:** 此签整体寓意和核心信息
2. **文化典故:** 深入讲解签文背后的历史故事和文化内涵
3. **分类解读:** 针对不同事务的具体指导：
   - 功名事业: 学业考试、工作升迁、事业发展
   - 财运生意: 投资理财、经商创业、财富积累
   - 婚姻感情: 恋爱交友、婚配嫁娶、家庭和睦
   - 健康医疗: 身体状况、疾病康复、养生保健
   - 出行迁移: 旅行安全、搬迁移居、外出谋生
   - 诉讼官司: 法律纠纷、是非曲直、官非化解
4. **现代应用:** 如何将传统智慧运用到现代生活中
5. **行动建议:** 具体可行的行动指导和注意事项

请融合传统文化底蕴与现代实用智慧，提供深入而实用的解读。`;
  }

  // 调用对应语言的解签大师
  return await difyService.chatWithAgentStreaming(query, userId, agentType, conversationId, false);
}
