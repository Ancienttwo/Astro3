/**
 * 命书状态管理Store
 * 
 * 使用Zustand提供清晰、高性能的状态管理，包含：
 * - 命盘数据状态
 * - 加载和错误状态
 * - CRUD操作方法
 * - 计算属性和选择器
 * - 缓存和优化策略
 */

import { useMemo } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  fatebookService, 
  FatebookServiceError 
} from '@/services/fatebook-service';
import type {
  ChartRecord,
  CreateChartDTO,
  UpdateChartDTO,
  ChartQueryParams,
  ChartType,
  ChartCategory,
  LoadingState
} from '@/types/fatebook';

/**
 * 命书Store状态接口
 */
interface FatebookState extends LoadingState {
  // ========== 数据状态 ==========
  charts: ChartRecord[];
  selectedChart: ChartRecord | null;
  
  // ========== 搜索和过滤状态 ==========
  searchQuery: string;
  filters: {
    chartType?: ChartType;
    category?: ChartCategory;
  };
  
  // ========== UI状态 ==========
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // ========== 统计状态 ==========
  stats: {
    total: number;
    byType: Record<ChartType, number>;
    byCategory: Record<ChartCategory, number>;
  } | null;
  
  // ========== 基础操作 ==========
  loadCharts: (params?: ChartQueryParams) => Promise<void>;
  refreshCharts: () => Promise<void>;
  selectChart: (chart: ChartRecord | null) => void;
  
  // ========== CRUD操作 ==========
  createChart: (chart: CreateChartDTO) => Promise<ChartRecord>;
  updateChart: (id: string, updates: UpdateChartDTO) => Promise<ChartRecord>;
  deleteChart: (id: string) => Promise<void>;
  deleteCharts: (ids: string[]) => Promise<void>;
  
  // ========== 查询操作 ==========
  getChartById: (id: string) => ChartRecord | undefined;
  searchCharts: (query: string) => void;
  setFilters: (filters: Partial<FatebookState['filters']>) => void;
  clearFilters: () => void;
  
  // ========== 统计操作 ==========
  loadStats: () => Promise<void>;
  
  // ========== 工具方法 ==========
  clearError: () => void;
  reset: () => void;
}

/**
 * 初始状态
 */
const initialState = {
  // 数据状态
  charts: [],
  selectedChart: null,
  
  // 加载状态
  loading: false,
  error: null,
  
  // 搜索和过滤
  searchQuery: '',
  filters: {},
  
  // UI状态
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  
  // 统计状态
  stats: null,
};

/**
 * 创建命书Store
 */
export const useFatebookStore = create<FatebookState>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      // ========== 基础操作 ==========

      /**
       * 加载命盘列表
       */
      loadCharts: async (params?: ChartQueryParams) => {
        const state = get();
        
        // 防止重复加载
        if (state.loading) {
          console.log('⏭️ 跳过重复加载请求');
          return;
        }

        set((draft) => {
          draft.loading = true;
          draft.error = null;
        });

        try {
          console.log('📋 开始加载命盘列表', params);
          
          const charts = await fatebookService.loadCharts(params);
          
          set((draft) => {
            draft.charts = charts;
            draft.loading = false;
            draft.error = null;
          });

          console.log(`✅ 成功加载 ${charts.length} 个命盘`);

        } catch (error) {
          console.error('❌ 加载命盘列表失败:', error);
          
          const errorMessage = error instanceof FatebookServiceError 
            ? error.message 
            : '加载命盘时发生未知错误';

          set((draft) => {
            draft.loading = false;
            draft.error = errorMessage;
          });
        }
      },

      /**
       * 刷新命盘列表
       */
      refreshCharts: async () => {
        const state = get();
        const { searchQuery, filters } = state;
        
        const params: ChartQueryParams = {};
        if (searchQuery) params.search = searchQuery;
        if (filters.chartType) params.chartType = filters.chartType;
        if (filters.category) params.category = filters.category;
        
        await state.loadCharts(params);
      },

      /**
       * 选择命盘
       */
      selectChart: (chart: ChartRecord | null) => {
        set((draft) => {
          draft.selectedChart = chart;
        });
        
        console.log('🎯 选择命盘:', chart?.name || '无');
      },

      // ========== CRUD操作 ==========

      /**
       * 创建命盘
       */
      createChart: async (chartData: CreateChartDTO): Promise<ChartRecord> => {
        set((draft) => {
          draft.isCreating = true;
          draft.error = null;
        });

        try {
          console.log('📋 开始创建命盘:', chartData.name);
          
          const newChart = await fatebookService.createChart(chartData);
          
          set((draft) => {
            // 添加到列表开头
            draft.charts.unshift(newChart);
            draft.selectedChart = newChart;
            draft.isCreating = false;
            draft.error = null;
            
            // 更新统计信息
            if (draft.stats) {
              draft.stats.total += 1;
              draft.stats.byType[newChart.chartType] = 
                (draft.stats.byType[newChart.chartType] || 0) + 1;
              draft.stats.byCategory[newChart.category] = 
                (draft.stats.byCategory[newChart.category] || 0) + 1;
            }
          });

          console.log('✅ 成功创建命盘:', newChart.id);
          return newChart;

        } catch (error) {
          console.error('❌ 创建命盘失败:', error);
          
          const errorMessage = error instanceof FatebookServiceError 
            ? error.message 
            : '创建命盘时发生未知错误';

          set((draft) => {
            draft.isCreating = false;
            draft.error = errorMessage;
          });
          
          throw error;
        }
      },

      /**
       * 更新命盘
       */
      updateChart: async (id: string, updates: UpdateChartDTO): Promise<ChartRecord> => {
        set((draft) => {
          draft.isUpdating = true;
          draft.error = null;
        });

        try {
          console.log('📋 开始更新命盘:', id);
          
          const updatedChart = await fatebookService.updateChart(id, updates);
          
          set((draft) => {
            // 更新列表中的命盘
            const index = draft.charts.findIndex(chart => chart.id === id);
            if (index !== -1) {
              draft.charts[index] = updatedChart;
            }
            
            // 更新选中的命盘
            if (draft.selectedChart?.id === id) {
              draft.selectedChart = updatedChart;
            }
            
            draft.isUpdating = false;
            draft.error = null;
          });

          console.log('✅ 成功更新命盘:', updatedChart.id);
          return updatedChart;

        } catch (error) {
          console.error('❌ 更新命盘失败:', error);
          
          const errorMessage = error instanceof FatebookServiceError 
            ? error.message 
            : '更新命盘时发生未知错误';

          set((draft) => {
            draft.isUpdating = false;
            draft.error = errorMessage;
          });
          
          throw error;
        }
      },

      /**
       * 删除命盘
       */
      deleteChart: async (id: string): Promise<void> => {
        const state = get();
        const chartToDelete = state.charts.find(chart => chart.id === id);
        
        if (!chartToDelete) {
          throw new Error('命盘不存在');
        }

        set((draft) => {
          draft.isDeleting = true;
          draft.error = null;
        });

        try {
          console.log('📋 开始删除命盘:', id);
          
          await fatebookService.deleteChart(id);
          
          set((draft) => {
            // 从列表中移除
            draft.charts = draft.charts.filter(chart => chart.id !== id);
            
            // 清除选中状态
            if (draft.selectedChart?.id === id) {
              draft.selectedChart = null;
            }
            
            draft.isDeleting = false;
            draft.error = null;
            
            // 更新统计信息
            if (draft.stats) {
              draft.stats.total -= 1;
              draft.stats.byType[chartToDelete.chartType] = 
                Math.max(0, (draft.stats.byType[chartToDelete.chartType] || 0) - 1);
              draft.stats.byCategory[chartToDelete.category] = 
                Math.max(0, (draft.stats.byCategory[chartToDelete.category] || 0) - 1);
            }
          });

          console.log('✅ 成功删除命盘:', id);

        } catch (error) {
          console.error('❌ 删除命盘失败:', error);
          
          const errorMessage = error instanceof FatebookServiceError 
            ? error.message 
            : '删除命盘时发生未知错误';

          set((draft) => {
            draft.isDeleting = false;
            draft.error = errorMessage;
          });
          
          throw error;
        }
      },

      /**
       * 批量删除命盘
       */
      deleteCharts: async (ids: string[]): Promise<void> => {
        const state = get();
        const chartsToDelete = state.charts.filter(chart => ids.includes(chart.id));

        set((draft) => {
          draft.isDeleting = true;
          draft.error = null;
        });

        try {
          console.log('📋 开始批量删除命盘:', ids.length);
          
          await fatebookService.deleteCharts(ids);
          
          set((draft) => {
            // 从列表中移除
            draft.charts = draft.charts.filter(chart => !ids.includes(chart.id));
            
            // 清除选中状态
            if (draft.selectedChart && ids.includes(draft.selectedChart.id)) {
              draft.selectedChart = null;
            }
            
            draft.isDeleting = false;
            draft.error = null;
            
            // 更新统计信息
            if (draft.stats) {
              draft.stats.total -= chartsToDelete.length;
              chartsToDelete.forEach(chart => {
                draft.stats!.byType[chart.chartType] = 
                  Math.max(0, (draft.stats!.byType[chart.chartType] || 0) - 1);
                draft.stats!.byCategory[chart.category] = 
                  Math.max(0, (draft.stats!.byCategory[chart.category] || 0) - 1);
              });
            }
          });

          console.log('✅ 成功批量删除命盘:', ids.length);

        } catch (error) {
          console.error('❌ 批量删除命盘失败:', error);
          
          const errorMessage = error instanceof FatebookServiceError 
            ? error.message 
            : '批量删除命盘时发生未知错误';

          set((draft) => {
            draft.isDeleting = false;
            draft.error = errorMessage;
          });
          
          throw error;
        }
      },

      // ========== 查询操作 ==========

      /**
       * 根据ID获取命盘
       */
      getChartById: (id: string): ChartRecord | undefined => {
        const state = get();
        return state.charts.find(chart => chart.id === id);
      },

      /**
       * 搜索命盘
       */
      searchCharts: (query: string) => {
        set((draft) => {
          draft.searchQuery = query;
        });

        // 触发重新加载
        const state = get();
        state.refreshCharts();
      },

      /**
       * 设置过滤器
       */
      setFilters: (filters: Partial<FatebookState['filters']>) => {
        set((draft) => {
          draft.filters = { ...draft.filters, ...filters };
        });

        // 触发重新加载
        const state = get();
        state.refreshCharts();
      },

      /**
       * 清除过滤器
       */
      clearFilters: () => {
        set((draft) => {
          draft.searchQuery = '';
          draft.filters = {};
        });

        // 触发重新加载
        const state = get();
        state.loadCharts();
      },

      // ========== 统计操作 ==========

      /**
       * 加载统计信息
       */
      loadStats: async () => {
        try {
          console.log('📊 开始加载统计信息');
          
          const stats = await fatebookService.getChartsStats();
          
          set((draft) => {
            draft.stats = stats;
          });

          console.log('✅ 成功加载统计信息');

        } catch (error) {
          console.error('❌ 加载统计信息失败:', error);
          
          const errorMessage = error instanceof FatebookServiceError 
            ? error.message 
            : '加载统计信息时发生未知错误';

          set((draft) => {
            draft.error = errorMessage;
          });
        }
      },

      // ========== 工具方法 ==========

      /**
       * 清除错误
       */
      clearError: () => {
        set((draft) => {
          draft.error = null;
        });
      },

      /**
       * 重置状态
       */
      reset: () => {
        set((draft) => {
          Object.assign(draft, initialState);
        });
      },
    })),
    {
      name: 'fatebook-store', // Redux DevTools中的名称
    }
  )
);

// ========== 选择器辅助函数 ==========

/**
 * 获取八字命盘
 */
export const useBaziCharts = () => {
  const charts = useFatebookStore((state) => state.charts);
  return useMemo(
    () => charts.filter(chart => chart.chartType === 'bazi'),
    [charts]
  );
};

/**
 * 获取紫微命盘
 */
export const useZiweiCharts = () => {
  const charts = useFatebookStore((state) => state.charts);
  return useMemo(
    () => charts.filter(chart => chart.chartType === 'ziwei'),
    [charts]
  );
};

/**
 * 根据分类获取命盘
 */
export const useChartsByCategory = (category: ChartCategory) => {
  const charts = useFatebookStore((state) => state.charts);
  return useMemo(
    () => charts.filter(chart => chart.category === category),
    [charts, category]
  );
};

/**
 * 获取过滤后的命盘
 */
export const useFilteredCharts = () => {
  const charts = useFatebookStore((state) => state.charts);
  const searchQuery = useFatebookStore((state) => state.searchQuery);
  const filters = useFatebookStore((state) => state.filters);

  return useMemo(() => {
    let filteredCharts = charts;

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredCharts = filteredCharts.filter(chart =>
        chart.name.toLowerCase().includes(query)
      );
    }

    // 类型过滤
    if (filters.chartType) {
      filteredCharts = filteredCharts.filter(chart =>
        chart.chartType === filters.chartType
      );
    }

    // 分类过滤
    if (filters.category) {
      filteredCharts = filteredCharts.filter(chart =>
        chart.category === filters.category
      );
    }

    return filteredCharts;
  }, [charts, searchQuery, filters]);
};

/**
 * 获取加载状态
 */
export const useFatebookLoading = () => {
  const loading = useFatebookStore((state) => state.loading);
  const isCreating = useFatebookStore((state) => state.isCreating);
  const isUpdating = useFatebookStore((state) => state.isUpdating);
  const isDeleting = useFatebookStore((state) => state.isDeleting);
  
  return useMemo(() => ({
    loading,
    isCreating,
    isUpdating,
    isDeleting,
  }), [loading, isCreating, isUpdating, isDeleting]);
};

/**
 * 获取错误状态
 */
export const useFatebookError = () => {
  return useFatebookStore((state) => state.error);
}; 