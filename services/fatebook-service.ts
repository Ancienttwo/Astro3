/**
 * 命书服务层
 * 
 * 封装所有命书相关的API调用逻辑，提供：
 * - 命盘的CRUD操作
 * - 查询和过滤功能
 * - 数据验证和转换
 * - 错误处理
 */

import { apiClient, APIError } from '@/lib/api-client';
import type {
  ChartRecord,
  CreateChartDTO,
  UpdateChartDTO,
  ChartQueryParams,
  ChartListResponse,
  APIResponse,
  BirthInfo,
  ChartType,
  ChartCategory,
  CATEGORY_LABELS,
  CHART_TYPE_LABELS
} from '@/types/fatebook';

/**
 * 服务错误类
 */
export class FatebookServiceError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'FatebookServiceError';
  }
}

/**
 * 命书服务类
 */
export class FatebookService {
  private readonly baseUrl = '/api/charts';

  /**
   * 获取所有命盘
   */
  async loadCharts(params?: ChartQueryParams): Promise<ChartRecord[]> {
    try {
      console.log('📋 加载命盘列表', params);

      let url = this.baseUrl;
      
      // 构建查询参数
      if (params) {
        const searchParams = new URLSearchParams();
        
        if (params.chartType) searchParams.set('chartType', params.chartType);
        if (params.category) searchParams.set('category', params.category);
        if (params.search) searchParams.set('search', params.search);
        if (params.limit) searchParams.set('limit', params.limit.toString());
        if (params.offset) searchParams.set('offset', params.offset.toString());
        if (params.sortBy) searchParams.set('sortBy', params.sortBy);
        if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
        
        if (searchParams.toString()) {
          url += `?${searchParams.toString()}`;
        }
      }

      const response = await apiClient.get<ChartRecord[]>(url);
      
      if (!response.success || !response.data) {
        throw new FatebookServiceError('获取命盘列表失败');
      }

      // 转换数据格式
      const charts = response.data.map(this.transformChartFromAPI);
      
      console.log(`✅ 成功加载 ${charts.length} 个命盘`);
      return charts;

    } catch (error) {
      console.error('❌ 加载命盘列表失败:', error);
      
      if (error instanceof APIError) {
        throw new FatebookServiceError(`加载命盘失败: ${error.message}`, error);
      }
      
      throw new FatebookServiceError('加载命盘时发生未知错误', error);
    }
  }

  /**
   * 根据ID获取命盘
   */
  async getChartById(id: string): Promise<ChartRecord> {
    try {
      console.log('📋 获取命盘详情:', id);

      const response = await apiClient.get<ChartRecord>(`${this.baseUrl}/${id}`);
      
      if (!response.success || !response.data) {
        throw new FatebookServiceError('命盘不存在或已被删除');
      }

      const chart = this.transformChartFromAPI(response.data);
      
      console.log('✅ 成功获取命盘详情');
      return chart;

    } catch (error) {
      console.error('❌ 获取命盘详情失败:', error);
      
      if (error instanceof APIError) {
        if (error.status === 404) {
          throw new FatebookServiceError('命盘不存在', error);
        }
        throw new FatebookServiceError(`获取命盘失败: ${error.message}`, error);
      }
      
      throw new FatebookServiceError('获取命盘时发生未知错误', error);
    }
  }

  /**
   * 创建新命盘
   */
  async createChart(chart: CreateChartDTO): Promise<ChartRecord> {
    try {
      console.log('📋 创建新命盘:', chart.name);

      // 验证数据
      this.validateChartData(chart);

      // 转换为API格式
      const apiData = this.transformChartToAPI(chart);

      const response = await apiClient.post<ChartRecord>(this.baseUrl, apiData);
      
      if (!response.success || !response.data) {
        throw new FatebookServiceError(response.error || '创建命盘失败');
      }

      const newChart = this.transformChartFromAPI(response.data);
      
      console.log('✅ 成功创建命盘:', newChart.id);
      return newChart;

    } catch (error) {
      console.error('❌ 创建命盘失败:', error);
      
      if (error instanceof APIError) {
        throw new FatebookServiceError(`创建命盘失败: ${error.message}`, error);
      }
      
      if (error instanceof FatebookServiceError) {
        throw error;
      }
      
      throw new FatebookServiceError('创建命盘时发生未知错误', error);
    }
  }

  /**
   * 更新命盘
   */
  async updateChart(id: string, updates: UpdateChartDTO): Promise<ChartRecord> {
    try {
      console.log('📋 更新命盘:', id);

      // 验证更新数据
      if (updates.birthInfo) {
        this.validateBirthInfo(updates.birthInfo);
      }

      // 转换为API格式
      const apiData = this.transformUpdateToAPI(updates);

      const response = await apiClient.put<ChartRecord>(`${this.baseUrl}/${id}`, apiData);
      
      if (!response.success || !response.data) {
        throw new FatebookServiceError(response.error || '更新命盘失败');
      }

      const updatedChart = this.transformChartFromAPI(response.data);
      
      console.log('✅ 成功更新命盘:', updatedChart.id);
      return updatedChart;

    } catch (error) {
      console.error('❌ 更新命盘失败:', error);
      
      if (error instanceof APIError) {
        if (error.status === 404) {
          throw new FatebookServiceError('命盘不存在', error);
        }
        throw new FatebookServiceError(`更新命盘失败: ${error.message}`, error);
      }
      
      if (error instanceof FatebookServiceError) {
        throw error;
      }
      
      throw new FatebookServiceError('更新命盘时发生未知错误', error);
    }
  }

  /**
   * 删除命盘
   */
  async deleteChart(id: string): Promise<void> {
    try {
      console.log('📋 删除命盘:', id);

      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      
      if (!response.success) {
        throw new FatebookServiceError(response.error || '删除命盘失败');
      }

      console.log('✅ 成功删除命盘:', id);

    } catch (error) {
      console.error('❌ 删除命盘失败:', error);
      
      if (error instanceof APIError) {
        if (error.status === 404) {
          throw new FatebookServiceError('命盘不存在', error);
        }
        throw new FatebookServiceError(`删除命盘失败: ${error.message}`, error);
      }
      
      throw new FatebookServiceError('删除命盘时发生未知错误', error);
    }
  }

  /**
   * 批量删除命盘
   */
  async deleteCharts(ids: string[]): Promise<void> {
    try {
      console.log('📋 批量删除命盘:', ids.length);

      const response = await apiClient.delete(this.baseUrl, {
        body: { ids }
      });
      
      if (!response.success) {
        throw new FatebookServiceError(response.error || '批量删除命盘失败');
      }

      console.log('✅ 成功批量删除命盘');

    } catch (error) {
      console.error('❌ 批量删除命盘失败:', error);
      
      if (error instanceof APIError) {
        throw new FatebookServiceError(`批量删除命盘失败: ${error.message}`, error);
      }
      
      throw new FatebookServiceError('批量删除命盘时发生未知错误', error);
    }
  }

  /**
   * 根据类型获取命盘
   */
  async getChartsByType(chartType: ChartType): Promise<ChartRecord[]> {
    return this.loadCharts({ chartType });
  }

  /**
   * 根据分类获取命盘
   */
  async getChartsByCategory(category: ChartCategory): Promise<ChartRecord[]> {
    return this.loadCharts({ category });
  }

  /**
   * 搜索命盘
   */
  async searchCharts(query: string, filters?: {
    chartType?: ChartType;
    category?: ChartCategory;
  }): Promise<ChartRecord[]> {
    return this.loadCharts({
      search: query,
      ...filters
    });
  }

  /**
   * 获取命盘统计信息
   */
  async getChartsStats(): Promise<{
    total: number;
    byType: Record<ChartType, number>;
    byCategory: Record<ChartCategory, number>;
  }> {
    try {
      const response = await apiClient.get<any>(`${this.baseUrl}/stats`);
      
      if (!response.success || !response.data) {
        throw new FatebookServiceError('获取统计信息失败');
      }

      return response.data;

    } catch (error) {
      console.error('❌ 获取统计信息失败:', error);
      
      if (error instanceof APIError) {
        throw new FatebookServiceError(`获取统计信息失败: ${error.message}`, error);
      }
      
      throw new FatebookServiceError('获取统计信息时发生未知错误', error);
    }
  }

  // ========== 私有方法 ==========

  /**
   * 验证命盘数据
   */
  private validateChartData(chart: CreateChartDTO): void {
    if (!chart.name?.trim()) {
      throw new FatebookServiceError('姓名不能为空');
    }

    if (chart.name.length > 50) {
      throw new FatebookServiceError('姓名长度不能超过50个字符');
    }

    this.validateBirthInfo(chart.birthInfo);
    this.validateChartType(chart.chartType);
    this.validateCategory(chart.category);
  }

  /**
   * 验证出生信息
   */
  private validateBirthInfo(birthInfo: Partial<BirthInfo>): void {
    const currentYear = new Date().getFullYear();

    if (birthInfo.year !== undefined) {
      if (birthInfo.year < 1900 || birthInfo.year > currentYear) {
        throw new FatebookServiceError('出生年份必须在1900年到当前年份之间');
      }
    }

    if (birthInfo.month !== undefined) {
      if (birthInfo.month < 1 || birthInfo.month > 12) {
        throw new FatebookServiceError('出生月份必须在1到12之间');
      }
    }

    if (birthInfo.day !== undefined) {
      if (birthInfo.day < 1 || birthInfo.day > 31) {
        throw new FatebookServiceError('出生日期必须在1到31之间');
      }
    }

    if (birthInfo.hour !== undefined) {
      if (birthInfo.hour < 0 || birthInfo.hour > 23) {
        throw new FatebookServiceError('出生时辰必须在0到23之间');
      }
    }

    if (birthInfo.gender !== undefined) {
      if (!['male', 'female'].includes(birthInfo.gender)) {
        throw new FatebookServiceError('性别必须是男性或女性');
      }
    }
  }

  /**
   * 验证命盘类型
   */
  private validateChartType(chartType: ChartType): void {
    if (!['bazi', 'ziwei'].includes(chartType)) {
      throw new FatebookServiceError('命盘类型必须是八字或紫微');
    }
  }

  /**
   * 验证分类
   */
  private validateCategory(category: ChartCategory): void {
    const validCategories: ChartCategory[] = ['friends', 'family', 'clients', 'favorites', 'others'];
    if (!validCategories.includes(category)) {
      throw new FatebookServiceError('分类无效');
    }
  }

  /**
   * 转换API响应为内部格式
   */
  private transformChartFromAPI(apiChart: any): ChartRecord {
    return {
      id: apiChart.id,
      userId: apiChart.user_id,
      name: apiChart.name,
      birthInfo: {
        year: apiChart.birth_year,
        month: apiChart.birth_month,
        day: apiChart.birth_day,
        hour: apiChart.birth_hour,
        gender: apiChart.gender
      },
      chartType: apiChart.chart_type,
      category: apiChart.category || 'others',
      metadata: {
        yongShenInfo: apiChart.yongshen_info,
        tags: apiChart.tags || [],
        notes: apiChart.notes,
        customFields: apiChart.custom_fields
      },
      timestamps: {
        createdAt: new Date(apiChart.created_at),
        updatedAt: new Date(apiChart.updated_at)
      }
    };
  }

  /**
   * 转换内部格式为API格式
   */
  private transformChartToAPI(chart: CreateChartDTO): any {
    return {
      name: chart.name,
      birth_year: chart.birthInfo.year,
      birth_month: chart.birthInfo.month,
      birth_day: chart.birthInfo.day,
      birth_hour: chart.birthInfo.hour,
      gender: chart.birthInfo.gender,
      chart_type: chart.chartType,
      category: chart.category,
      yongshen_info: chart.metadata?.yongShenInfo,
      tags: chart.metadata?.tags,
      notes: chart.metadata?.notes,
      custom_fields: chart.metadata?.customFields
    };
  }

  /**
   * 转换更新数据为API格式
   */
  private transformUpdateToAPI(updates: UpdateChartDTO): any {
    const apiUpdates: any = {};

    if (updates.name !== undefined) {
      apiUpdates.name = updates.name;
    }

    if (updates.birthInfo) {
      if (updates.birthInfo.year !== undefined) apiUpdates.birth_year = updates.birthInfo.year;
      if (updates.birthInfo.month !== undefined) apiUpdates.birth_month = updates.birthInfo.month;
      if (updates.birthInfo.day !== undefined) apiUpdates.birth_day = updates.birthInfo.day;
      if (updates.birthInfo.hour !== undefined) apiUpdates.birth_hour = updates.birthInfo.hour;
      if (updates.birthInfo.gender !== undefined) apiUpdates.gender = updates.birthInfo.gender;
    }

    if (updates.category !== undefined) {
      apiUpdates.category = updates.category;
    }

    if (updates.metadata) {
      if (updates.metadata.yongShenInfo !== undefined) {
        apiUpdates.yongshen_info = updates.metadata.yongShenInfo;
      }
      if (updates.metadata.tags !== undefined) {
        apiUpdates.tags = updates.metadata.tags;
      }
      if (updates.metadata.notes !== undefined) {
        apiUpdates.notes = updates.metadata.notes;
      }
      if (updates.metadata.customFields !== undefined) {
        apiUpdates.custom_fields = updates.metadata.customFields;
      }
    }

    return apiUpdates;
  }
}

/**
 * 默认命书服务实例
 */
export const fatebookService = new FatebookService(); 