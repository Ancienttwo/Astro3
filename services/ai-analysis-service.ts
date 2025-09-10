/**
 * AI分析服务层
 * 
 * 封装所有AI分析相关的API调用逻辑，提供：
 * - AI分析的CRUD操作
 * - 分析类型管理
 * - 批量操作
 * - 数据验证和转换
 */

import { apiClient, APIError } from '@/lib/api-client';
import type {
  AIAnalysis,
  CreateAnalysisDTO,
  UpdateAnalysisDTO,
  AnalysisQueryParams,
  AnalysisListResponse,
  APIResponse,
  AnalysisType,
  ANALYSIS_TYPE_LABELS
} from '@/types/fatebook';

/**
 * AI分析服务错误类
 */
export class AIAnalysisServiceError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'AIAnalysisServiceError';
  }
}

/**
 * AI分析服务类
 */
export class AIAnalysisService {
  private readonly baseUrl = '/api/ai-analyses';

  /**
   * 获取指定命盘的AI分析列表
   */
  async getAnalysesByChartId(chartId: string, params?: AnalysisQueryParams): Promise<AIAnalysis[]> {
    try {
      console.log('🤖 加载AI分析列表:', chartId);

      let url = `${this.baseUrl}?chart_id=${chartId}`;
      
      // 构建查询参数
      if (params) {
        const searchParams = new URLSearchParams(url.split('?')[1] || '');
        
        if (params.type) searchParams.set('type', params.type);
        if (params.limit) searchParams.set('limit', params.limit.toString());
        if (params.offset) searchParams.set('offset', params.offset.toString());
        if (params.sortBy) searchParams.set('sortBy', params.sortBy);
        if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
        
        url = `${this.baseUrl}?${searchParams.toString()}`;
      }

      const response = await apiClient.get<AIAnalysis[]>(url);
      
      if (!response.success || !response.data) {
        throw new AIAnalysisServiceError('获取AI分析列表失败');
      }

      // 转换数据格式
      const analyses = response.data.map(this.transformAnalysisFromAPI);
      
      console.log(`✅ 成功加载 ${analyses.length} 个AI分析`);
      return analyses;

    } catch (error) {
      console.error('❌ 加载AI分析列表失败:', error);
      
      if (error instanceof APIError) {
        throw new AIAnalysisServiceError(`加载AI分析失败: ${error.message}`, error);
      }
      
      throw new AIAnalysisServiceError('加载AI分析时发生未知错误', error);
    }
  }

  /**
   * 根据ID获取AI分析详情
   */
  async getAnalysisById(id: string): Promise<AIAnalysis> {
    try {
      console.log('🤖 获取AI分析详情:', id);

      const response = await apiClient.get<AIAnalysis>(`${this.baseUrl}/${id}`);
      
      if (!response.success || !response.data) {
        throw new AIAnalysisServiceError('AI分析不存在或已被删除');
      }

      const analysis = this.transformAnalysisFromAPI(response.data);
      
      console.log('✅ 成功获取AI分析详情');
      return analysis;

    } catch (error) {
      console.error('❌ 获取AI分析详情失败:', error);
      
      if (error instanceof APIError) {
        if (error.status === 404) {
          throw new AIAnalysisServiceError('AI分析不存在', error);
        }
        throw new AIAnalysisServiceError(`获取AI分析失败: ${error.message}`, error);
      }
      
      throw new AIAnalysisServiceError('获取AI分析时发生未知错误', error);
    }
  }

  /**
   * 创建新的AI分析
   */
  async createAnalysis(analysis: CreateAnalysisDTO): Promise<AIAnalysis> {
    try {
      console.log('🤖 创建AI分析:', analysis.type);

      // 验证数据
      this.validateAnalysisData(analysis);

      // 转换为API格式
      const apiData = this.transformAnalysisToAPI(analysis);

      const response = await apiClient.post<AIAnalysis>(this.baseUrl, apiData);
      
      if (!response.success || !response.data) {
        throw new AIAnalysisServiceError(response.error || '创建AI分析失败');
      }

      const newAnalysis = this.transformAnalysisFromAPI(response.data);
      
      console.log('✅ 成功创建AI分析:', newAnalysis.id);
      return newAnalysis;

    } catch (error) {
      console.error('❌ 创建AI分析失败:', error);
      
      if (error instanceof APIError) {
        throw new AIAnalysisServiceError(`创建AI分析失败: ${error.message}`, error);
      }
      
      if (error instanceof AIAnalysisServiceError) {
        throw error;
      }
      
      throw new AIAnalysisServiceError('创建AI分析时发生未知错误', error);
    }
  }

  /**
   * 更新AI分析
   */
  async updateAnalysis(id: string, updates: UpdateAnalysisDTO): Promise<AIAnalysis> {
    try {
      console.log('🤖 更新AI分析:', id);

      // 验证更新数据
      if (updates.content !== undefined && !updates.content?.trim()) {
        throw new AIAnalysisServiceError('分析内容不能为空');
      }

      // 转换为API格式
      const apiData = this.transformUpdateToAPI(updates);

      const response = await apiClient.put<AIAnalysis>(`${this.baseUrl}/${id}`, apiData);
      
      if (!response.success || !response.data) {
        throw new AIAnalysisServiceError(response.error || '更新AI分析失败');
      }

      const updatedAnalysis = this.transformAnalysisFromAPI(response.data);
      
      console.log('✅ 成功更新AI分析:', updatedAnalysis.id);
      return updatedAnalysis;

    } catch (error) {
      console.error('❌ 更新AI分析失败:', error);
      
      if (error instanceof APIError) {
        if (error.status === 404) {
          throw new AIAnalysisServiceError('AI分析不存在', error);
        }
        throw new AIAnalysisServiceError(`更新AI分析失败: ${error.message}`, error);
      }
      
      if (error instanceof AIAnalysisServiceError) {
        throw error;
      }
      
      throw new AIAnalysisServiceError('更新AI分析时发生未知错误', error);
    }
  }

  /**
   * 删除AI分析
   */
  async deleteAnalysis(id: string): Promise<void> {
    try {
      console.log('🤖 删除AI分析:', id);

      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      
      if (!response.success) {
        throw new AIAnalysisServiceError(response.error || '删除AI分析失败');
      }

      console.log('✅ 成功删除AI分析:', id);

    } catch (error) {
      console.error('❌ 删除AI分析失败:', error);
      
      if (error instanceof APIError) {
        if (error.status === 404) {
          throw new AIAnalysisServiceError('AI分析不存在', error);
        }
        throw new AIAnalysisServiceError(`删除AI分析失败: ${error.message}`, error);
      }
      
      throw new AIAnalysisServiceError('删除AI分析时发生未知错误', error);
    }
  }

  /**
   * 批量删除AI分析
   */
  async deleteAnalyses(ids: string[]): Promise<void> {
    try {
      console.log('🤖 批量删除AI分析:', ids.length);

      const response = await apiClient.delete(this.baseUrl, {
        body: { ids }
      });
      
      if (!response.success) {
        throw new AIAnalysisServiceError(response.error || '批量删除AI分析失败');
      }

      console.log('✅ 成功批量删除AI分析');

    } catch (error) {
      console.error('❌ 批量删除AI分析失败:', error);
      
      if (error instanceof APIError) {
        throw new AIAnalysisServiceError(`批量删除AI分析失败: ${error.message}`, error);
      }
      
      throw new AIAnalysisServiceError('批量删除AI分析时发生未知错误', error);
    }
  }

  /**
   * 删除指定命盘的所有AI分析
   */
  async deleteAnalysesByChartId(chartId: string): Promise<void> {
    try {
      console.log('🤖 删除命盘的所有AI分析:', chartId);

      const response = await apiClient.delete(`${this.baseUrl}/chart/${chartId}`);
      
      if (!response.success) {
        throw new AIAnalysisServiceError(response.error || '删除命盘AI分析失败');
      }

      console.log('✅ 成功删除命盘的所有AI分析');

    } catch (error) {
      console.error('❌ 删除命盘AI分析失败:', error);
      
      if (error instanceof APIError) {
        throw new AIAnalysisServiceError(`删除命盘AI分析失败: ${error.message}`, error);
      }
      
      throw new AIAnalysisServiceError('删除命盘AI分析时发生未知错误', error);
    }
  }

  /**
   * 根据类型获取AI分析
   */
  async getAnalysesByType(type: AnalysisType): Promise<AIAnalysis[]> {
    try {
      const response = await apiClient.get<AIAnalysis[]>(`${this.baseUrl}?type=${type}`);
      
      if (!response.success || !response.data) {
        throw new AIAnalysisServiceError('获取AI分析列表失败');
      }

      return response.data.map(this.transformAnalysisFromAPI);

    } catch (error) {
      console.error('❌ 根据类型获取AI分析失败:', error);
      
      if (error instanceof APIError) {
        throw new AIAnalysisServiceError(`获取AI分析失败: ${error.message}`, error);
      }
      
      throw new AIAnalysisServiceError('获取AI分析时发生未知错误', error);
    }
  }

  /**
   * 获取AI分析统计信息
   */
  async getAnalysisStats(chartId?: string): Promise<{
    total: number;
    byType: Record<AnalysisType, number>;
    averageCharacterCount: number;
    totalCharacterCount: number;
  }> {
    try {
      let url = `${this.baseUrl}/stats`;
      if (chartId) {
        url += `?chart_id=${chartId}`;
      }

      const response = await apiClient.get<any>(url);
      
      if (!response.success || !response.data) {
        throw new AIAnalysisServiceError('获取统计信息失败');
      }

      return response.data;

    } catch (error) {
      console.error('❌ 获取AI分析统计信息失败:', error);
      
      if (error instanceof APIError) {
        throw new AIAnalysisServiceError(`获取统计信息失败: ${error.message}`, error);
      }
      
      throw new AIAnalysisServiceError('获取统计信息时发生未知错误', error);
    }
  }

  /**
   * 清理过期的AI分析
   */
  async cleanupExpiredAnalyses(daysOld: number = 30): Promise<number> {
    try {
      console.log('🤖 清理过期AI分析:', daysOld);

      const response = await apiClient.delete(`${this.baseUrl}/cleanup?days=${daysOld}`);
      
      if (!response.success) {
        throw new AIAnalysisServiceError(response.error || '清理过期分析失败');
      }

      const deletedCount = response.data?.deletedCount || 0;
      console.log('✅ 成功清理过期AI分析:', deletedCount);
      
      return deletedCount;

    } catch (error) {
      console.error('❌ 清理过期AI分析失败:', error);
      
      if (error instanceof APIError) {
        throw new AIAnalysisServiceError(`清理过期分析失败: ${error.message}`, error);
      }
      
      throw new AIAnalysisServiceError('清理过期分析时发生未知错误', error);
    }
  }

  // ========== 私有方法 ==========

  /**
   * 验证AI分析数据
   */
  private validateAnalysisData(analysis: CreateAnalysisDTO): void {
    if (!analysis.chartId?.trim()) {
      throw new AIAnalysisServiceError('命盘ID不能为空');
    }

    if (!analysis.content?.trim()) {
      throw new AIAnalysisServiceError('分析内容不能为空');
    }

    if (analysis.content.length > 100000) {
      throw new AIAnalysisServiceError('分析内容长度不能超过100000个字符');
    }

    this.validateAnalysisType(analysis.type);
    this.validateAnalysisMetadata(analysis.metadata);
  }

  /**
   * 验证分析类型
   */
  private validateAnalysisType(type: AnalysisType): void {
    const validTypes: AnalysisType[] = [
      'yongshen_analysis',
      'tiekou_zhiduan',
      'ziwei_reasoning',
      'sihua_reasoning',
      'bazi_analysis',
      'ziwei_analysis'
    ];

    if (!validTypes.includes(type)) {
      throw new AIAnalysisServiceError('无效的分析类型');
    }
  }

  /**
   * 验证分析元数据
   */
  private validateAnalysisMetadata(metadata: any): void {
    if (!metadata) {
      throw new AIAnalysisServiceError('分析元数据不能为空');
    }

    if (typeof metadata.characterCount !== 'number' || metadata.characterCount < 0) {
      throw new AIAnalysisServiceError('字符数必须是非负数');
    }

    if (typeof metadata.confidence !== 'number' || metadata.confidence < 0 || metadata.confidence > 1) {
      throw new AIAnalysisServiceError('置信度必须在0到1之间');
    }

    if (!metadata.poweredBy?.trim()) {
      throw new AIAnalysisServiceError('分析引擎信息不能为空');
    }
  }

  /**
   * 转换API响应为内部格式
   */
  private transformAnalysisFromAPI(apiAnalysis: any): AIAnalysis {
    return {
      id: apiAnalysis.id,
      chartId: apiAnalysis.chart_id,
      type: apiAnalysis.analysis_type,
      content: apiAnalysis.content,
      metadata: {
        characterCount: apiAnalysis.character_count || apiAnalysis.content?.length || 0,
        confidence: apiAnalysis.confidence || 1.0,
        poweredBy: apiAnalysis.powered_by || 'AI系统',
        processingTime: apiAnalysis.processing_time,
        version: apiAnalysis.version
      },
      createdAt: new Date(apiAnalysis.created_at),
      updatedAt: new Date(apiAnalysis.updated_at || apiAnalysis.created_at)
    };
  }

  /**
   * 转换内部格式为API格式
   */
  private transformAnalysisToAPI(analysis: CreateAnalysisDTO): any {
    return {
      chart_id: analysis.chartId,
      analysis_type: analysis.type,
      content: analysis.content,
      character_count: analysis.metadata.characterCount,
      confidence: analysis.metadata.confidence,
      powered_by: analysis.metadata.poweredBy,
      processing_time: analysis.metadata.processingTime,
      version: analysis.metadata.version
    };
  }

  /**
   * 转换更新数据为API格式
   */
  private transformUpdateToAPI(updates: UpdateAnalysisDTO): any {
    const apiUpdates: any = {};

    if (updates.content !== undefined) {
      apiUpdates.content = updates.content;
    }

    if (updates.metadata) {
      if (updates.metadata.characterCount !== undefined) {
        apiUpdates.character_count = updates.metadata.characterCount;
      }
      if (updates.metadata.confidence !== undefined) {
        apiUpdates.confidence = updates.metadata.confidence;
      }
      if (updates.metadata.poweredBy !== undefined) {
        apiUpdates.powered_by = updates.metadata.poweredBy;
      }
      if (updates.metadata.processingTime !== undefined) {
        apiUpdates.processing_time = updates.metadata.processingTime;
      }
      if (updates.metadata.version !== undefined) {
        apiUpdates.version = updates.metadata.version;
      }
    }

    return apiUpdates;
  }

  /**
   * 获取分析类型的显示名称
   */
  getAnalysisTypeLabel(type: AnalysisType): string {
    return ANALYSIS_TYPE_LABELS[type] || type;
  }

  /**
   * 获取分析类型的图标
   */
  getAnalysisTypeIcon(type: AnalysisType): string {
    const iconMap: Record<AnalysisType, string> = {
      'yongshen_analysis': '🎯',
      'tiekou_zhiduan': '⚡',
      'ziwei_reasoning': '🔮',
      'sihua_reasoning': '✨',
      'bazi_analysis': '📊',
      'ziwei_analysis': '🌟'
    };
    
    return iconMap[type] || '🤖';
  }
}

/**
 * 默认AI分析服务实例
 */
export const aiAnalysisService = new AIAnalysisService(); 