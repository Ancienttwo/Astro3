/**
 * AI分析服务切换器
 * 支持在Dify和原有系统之间平滑切换
 */

import { analyzeZiweiWithDify } from './dify-integration';

// 配置切换开关
const USE_DIFY = process.env.NEXT_PUBLIC_USE_DIFY === 'true';

interface AnalysisRequest {
  birthData: any;
  userId: string;
  analysisType: 'ziwei' | 'bazi';
  conversationId?: string;
}

interface AnalysisResponse {
  success: boolean;
  analysis: string;
  conversation_id?: string;
  source: 'dify' | 'legacy';
  metadata?: any;
}

/**
 * 统一的AI分析接口
 * 根据配置自动选择Dify或原有系统
 */
export async function analyzeWithAI(request: AnalysisRequest): Promise<AnalysisResponse> {
  try {
    if (USE_DIFY) {
      // 使用Dify系统
      console.log('使用Dify系统进行分析');
      
      if (request.analysisType === 'ziwei') {
        const result = await analyzeZiweiWithDify(
          request.birthData,
          request.userId,
          request.conversationId
        );
        
        return {
          success: true,
          analysis: result.answer,
          conversation_id: result.conversation_id,
          source: 'dify',
          metadata: {
            model: 'dify-deepseek-r1',
            embedding: 'openai-text-embedding-3-small'
          }
        };
      }
      
      // 其他分析类型...
      throw new Error('暂不支持的分析类型');
      
    } else {
      // 使用原有系统
      console.log('使用原有RAG系统进行分析');
      
      // 调用原有的分析API
      const response = await fetch('/api/ziwei-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      
      const result = await response.json();
      
      return {
        success: result.success,
        analysis: result.analysis,
        source: 'legacy',
        metadata: {
          model: 'deepinfra-qwen3-8b',
          embedding: 'deepinfra-qwen3-embedding-8b'
        }
      };
    }
    
  } catch (error) {
    console.error('AI分析失败:', error);
    
    // 严格模式：不进行任何降级，直接抛出错误
    throw error;
  }
}

/**
 * 批量分析接口
 */
export async function batchAnalyze(requests: AnalysisRequest[]): Promise<AnalysisResponse[]> {
  const results = await Promise.allSettled(
    requests.map(request => analyzeWithAI(request))
  );
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        success: false,
        analysis: '分析失败，请稍后重试',
        source: USE_DIFY ? 'dify' : 'legacy',
        metadata: { error: result.reason.message }
      };
    }
  });
}

/**
 * 健康检查 - 检查当前使用的AI服务状态
 */
export async function checkAIServiceHealth(): Promise<{
  dify: boolean;
  legacy: boolean;
  current: 'dify' | 'legacy';
}> {
  let difyHealth = false;
  let legacyHealth = false;
  
  try {
    // 检查Dify服务
    const { difyService } = await import('./dify-integration');
    difyHealth = await difyService.healthCheck();
  } catch (error) {
    console.error('Dify健康检查失败:', error);
  }
  
  try {
    // 检查原有服务
    const response = await fetch('/api/health');
    legacyHealth = response.ok;
  } catch (error) {
    console.error('原有系统健康检查失败:', error);
  }
  
  return {
    dify: difyHealth,
    legacy: legacyHealth,
    current: USE_DIFY ? 'dify' : 'legacy'
  };
} 