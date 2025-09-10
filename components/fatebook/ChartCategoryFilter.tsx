/**
 * ChartCategoryFilter - 命盘分类过滤组件
 * 
 * 职责：
 * - 显示分类标签按钮
 * - 处理分类选择逻辑
 * - 与状态管理集成
 */

import React from 'react';
import { useFatebookStore } from '@/stores/fatebook-store';
import { useI18n } from '@/lib/i18n/useI18n';
import { type ChartCategory } from '@/types/fatebook';

// 组件Props接口
export interface ChartCategoryFilterProps {
  className?: string;
}

// 分类配置（简洁文字版本）
const CATEGORY_CONFIG = {
  all: {
    label: '全部',
    activeColor: 'bg-yellow-500 text-white border-yellow-500',
    defaultColor: 'bg-transparent text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700'
  },
  friends: {
    label: '朋友',
    activeColor: 'bg-yellow-500 text-white border-yellow-500',
    defaultColor: 'bg-transparent text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700'
  },
  family: {
    label: '家人',
    activeColor: 'bg-yellow-500 text-white border-yellow-500',
    defaultColor: 'bg-transparent text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700'
  },
  clients: {
    label: '客户',
    activeColor: 'bg-yellow-500 text-white border-yellow-500',
    defaultColor: 'bg-transparent text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700'
  },
  favorites: {
    label: '最爱',
    activeColor: 'bg-yellow-500 text-white border-yellow-500',
    defaultColor: 'bg-transparent text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700'
  },
  others: {
    label: '其他',
    activeColor: 'bg-yellow-500 text-white border-yellow-500',
    defaultColor: 'bg-transparent text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700'
  }
} as const;

// 主组件
export const ChartCategoryFilter: React.FC<ChartCategoryFilterProps> = React.memo(({
  className = ""
}) => {
  const { filters, setFilters, charts } = useFatebookStore();
  const { dict } = useI18n();
  const currentCategory = filters.category;

  // 计算每个分类的数量
  const categoryCounts = React.useMemo(() => {
    const counts = {
      all: charts.length,
      friends: 0,
      family: 0,
      clients: 0,
      favorites: 0,
      others: 0
    };

    charts.forEach(chart => {
      if (chart.category && counts.hasOwnProperty(chart.category)) {
        counts[chart.category as keyof typeof counts]++;
      }
    });

    return counts;
  }, [charts]);

  // 处理分类选择
  const handleCategorySelect = (category: ChartCategory | null) => {
    if (category === null) {
      // 选择"全部"，清除分类过滤
      setFilters({ category: undefined });
    } else {
      // 选择特定分类
      setFilters({ category });
    }
  };

  // 检查分类是否被选中
  const isSelected = (category: ChartCategory | null) => {
    if (category === null) {
      return !currentCategory; // "全部"被选中当没有分类过滤时
    }
    return currentCategory === category;
  };

  // 分类配置数组（使用字典翻译）
  const allCategories = [
    { key: null, label: dict.common.all },
    { key: 'friends' as ChartCategory, label: dict.categories.friends },
    { key: 'family' as ChartCategory, label: dict.categories.family },
    { key: 'clients' as ChartCategory, label: dict.categories.clients },
    { key: 'favorites' as ChartCategory, label: dict.categories.favorites },
    { key: 'others' as ChartCategory, label: dict.categories.others }
  ];

  return (
    <div className={`w-full ${className}`}>
      {/* 完全匹配旧版本Tab导航样式 */}
      <div className="flex w-full">
        {allCategories.map((category) => {
          const isActive = isSelected(category.key);
          
          return (
            <button
              key={category.key || 'all'}
              onClick={() => handleCategorySelect(category.key)}
              className={`flex-1 py-2 text-xs font-medium border-b-2 transition-all duration-200 ${
                isActive 
                  ? "border-yellow-400 dark:border-amber-400 text-yellow-600 dark:text-amber-400 bg-yellow-50 dark:bg-amber-400/10" 
                  : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-500"
              }`}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});

ChartCategoryFilter.displayName = 'ChartCategoryFilter';

export default ChartCategoryFilter; 