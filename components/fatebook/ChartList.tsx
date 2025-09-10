/**
 * ChartList - 高性能命盘列表组件
 * 
 * 职责：
 * - 高性能列表渲染
 * - 支持虚拟滚动（大数据量）
 * - 搜索和过滤功能
 * - 选择状态管理
 */

import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useFatebookStore, useFilteredCharts } from '@/stores/fatebook-store';
import ChartCardContainer from './ChartCardContainer';
import type { ChartRecord } from '@/types/fatebook';

// 组件Props接口
export interface ChartListProps {
  height?: number;
  itemHeight?: number;
  className?: string;
  enableVirtualization?: boolean;
  selectedChartId?: string;
  onChartSelect?: (chart: ChartRecord) => void;
}

// 列表项组件 - 用于虚拟滚动
const ChartListItem: React.FC<{
  index: number;
  style: React.CSSProperties;
  data: {
    charts: ChartRecord[];
    selectedChartId?: string;
    onChartSelect?: (chart: ChartRecord) => void;
  };
}> = React.memo(({ index, style, data }) => {
  const { charts, selectedChartId, onChartSelect } = data;
  const chart = charts[index];

  if (!chart) return null;

  const isSelected = selectedChartId === chart.id;

  const handleClick = () => {
    onChartSelect?.(chart);
  };

  return (
    <div style={style}>
      <ChartCardContainer
        chart={chart}
        isSelected={isSelected}
        onClick={handleClick}
      />
    </div>
  );
});

ChartListItem.displayName = 'ChartListItem';

// 空状态组件
const EmptyState: React.FC<{
  hasCharts: boolean;
  hasFilters: boolean;
}> = React.memo(({ hasCharts, hasFilters }) => {
  if (!hasCharts) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium mb-2">还没有命盘</h3>
        <p className="text-sm text-center max-w-md">
          点击"创建命盘"按钮来添加您的第一个命盘
        </p>
      </div>
    );
  }

  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium mb-2">没有找到匹配的命盘</h3>
        <p className="text-sm text-center max-w-md">
          尝试调整搜索条件或清除过滤器
        </p>
      </div>
    );
  }

  return null;
});

EmptyState.displayName = 'EmptyState';

// 主列表组件
export const ChartList: React.FC<ChartListProps> = React.memo(({
  height = 600,
  itemHeight = 120,
  className = "",
  enableVirtualization = true,
  selectedChartId,
  onChartSelect
}) => {
  const { charts, searchQuery, filters } = useFatebookStore();
  const filteredCharts = useFilteredCharts();

  // 检查是否有过滤条件
  const hasFilters = useMemo(() => {
    return !!(
      searchQuery ||
      filters.chartType ||
      filters.category ||
      (filters.tags && filters.tags.length > 0)
    );
  }, [searchQuery, filters]);

  // 准备虚拟滚动的数据
  const listData = useMemo(() => ({
    charts: filteredCharts,
    selectedChartId,
    onChartSelect
  }), [filteredCharts, selectedChartId, onChartSelect]);

  // 空状态检查
  if (filteredCharts.length === 0) {
    return (
      <div className={className}>
        <EmptyState 
          hasCharts={charts.length > 0} 
          hasFilters={hasFilters} 
        />
      </div>
    );
  }

  // 如果数据量小或禁用虚拟化，使用普通渲染
  if (!enableVirtualization || filteredCharts.length <= 50) {
    return (
      <div className={`space-y-1 ${className}`}>
        {filteredCharts.map((chart) => (
          <ChartCardContainer
            key={chart.id}
            chart={chart}
            isSelected={selectedChartId === chart.id}
            onClick={() => onChartSelect?.(chart)}
          />
        ))}
      </div>
    );
  }

  // 大数据量时使用虚拟滚动
  return (
    <div className={className}>
      <List
        height={height}
        itemCount={filteredCharts.length}
        itemSize={itemHeight}
        itemData={listData}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {ChartListItem}
      </List>
    </div>
  );
});

ChartList.displayName = 'ChartList';

export default ChartList; 