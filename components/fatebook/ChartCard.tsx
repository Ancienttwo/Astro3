/**
 * ChartCard - 纯展示组件
 * 
 * 职责：
 * - 纯UI渲染，无状态逻辑
 * - 接收所有必要的props
 * - 高性能，支持React.memo优化
 */

import React from 'react';
import { FaMars, FaVenus } from 'react-icons/fa';
import { Brain, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n/useI18n';
import type { ChartRecord } from '@/types/fatebook';

// 组件Props接口
export interface ChartCardProps {
  // 基础数据
  chart: ChartRecord;
  isSelected: boolean;
  
  // AI分析相关
  analysisCount: number;
  showAnalysisList: boolean;
  isLoadingAnalysis: boolean;
  
  // 事件处理
  onClick: () => void;
  onDelete: () => void;
  onToggleAnalysisList: () => void;
  
  // 语言设置 (保持向后兼容)
  isEnglish?: boolean;
}

// 样式计算hooks
const useChartCardStyles = (chart: ChartRecord, isSelected: boolean) => {
  const gender = chart.birthInfo.gender;
  const isZiwei = chart.chartType === 'ziwei';
  
  const cardClasses = isSelected
    ? isZiwei 
      ? "bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-500"
      : "bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500"
    : isZiwei
      ? "hover:bg-purple-50/50 dark:hover:bg-purple-900/20"
      : "hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20";
  
  const genderColor = isZiwei
    ? (gender === 'male' ? "text-purple-600" : "text-purple-500")
    : (gender === 'male' ? "text-yellow-600" : "text-yellow-500");
  
  const typeColor = isZiwei 
    ? 'text-purple-600 dark:text-purple-300' 
    : 'text-yellow-700 dark:text-yellow-300';
    
  const typeBg = isZiwei 
    ? 'bg-purple-50 dark:bg-purple-900/30' 
    : 'bg-yellow-100 dark:bg-yellow-900/30';

  return { cardClasses, genderColor, typeColor, typeBg };
};

// 主组件
export const ChartCard: React.FC<ChartCardProps> = React.memo(({
  chart,
  isSelected,
  analysisCount,
  showAnalysisList,
  isLoadingAnalysis,
  onClick,
  onDelete,
  onToggleAnalysisList,
  isEnglish = false // 保持向后兼容，但使用字典为主
}) => {
  const { dict, isEnglish: dictIsEnglish } = useI18n();
  // 优先使用字典判断，fallback到props
  const useEnglish = dictIsEnglish || isEnglish;
  
  const { cardClasses, genderColor, typeColor, typeBg } = useChartCardStyles(chart, isSelected);
  
  // 格式化生日
  const birthday = `${chart.birthInfo.year}-${String(chart.birthInfo.month).padStart(2, '0')}-${String(chart.birthInfo.day).padStart(2, '0')}`;
  
  // 阻止事件冒泡的处理器
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };
  
  const handleToggleAnalysis = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleAnalysisList();
  };

  return (
    <div 
      className={`px-2 py-1.5 w-full transition-all duration-200 cursor-pointer ${cardClasses}`}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* 性别图标 */}
        <div className="flex items-center justify-center w-8 flex-shrink-0 self-center">
          {chart.birthInfo.gender === 'male' 
            ? <FaMars size={18} className={genderColor} /> 
            : <FaVenus size={18} className={genderColor} />
          }
        </div>
        
        {/* 主要内容 */}
        <div className="flex-1 space-y-0.5 flex flex-col justify-center">
          {/* 第一行：基本信息 */}
          <div className="flex justify-between items-center">
            <div className="flex-1 flex justify-start">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900 dark:text-slate-100 hover:text-yellow-600 transition-colors">
                  {chart.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  {birthday}
                </p>
              </div>
            </div>
            
            {/* 类型标签和删除按钮 */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`${typeBg} ${typeColor}`}>
                {chart.chartType === 'bazi' 
                  ? dict.charts.chartTypes.bazi
                  : dict.charts.chartTypes.ziwei
                }
              </Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-6 h-6 text-gray-400 hover:text-red-500 hover:bg-red-50" 
                onClick={handleDelete}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
          
          {/* 第二行：分析报告状态 */}
          <div className="flex justify-between items-center">
            <div className="flex-1 flex justify-start">
              <div className="flex items-center">
                {isLoadingAnalysis ? (
                  <span className="text-xs text-gray-500 flex items-center">
                    <Brain size={12} className="animate-pulse mr-1" />
                    {dict.charts.loadingAnalysis}
                  </span>
                ) : analysisCount > 0 ? (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-5 px-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    onClick={handleToggleAnalysis}
                  >
                    <Brain size={12} />
                    <span className="ml-1 text-xs">
                      {showAnalysisList 
                        ? dict.charts.collapse
                        : `${analysisCount}${dict.charts.reports}`
                      }
                    </span>
                    {showAnalysisList 
                      ? <ChevronUp size={12} className="ml-1" /> 
                      : <ChevronDown size={12} className="ml-1" />
                    }
                  </Button>
                ) : (
                  <span className="text-xs text-gray-400">
                    {dict.charts.noAnalysis}
                  </span>
                )}
              </div>
            </div>
            
            {/* 更新时间 */}
            <div className="text-right">
              <p className="text-xs text-gray-400">
                {new Date(chart.timestamps.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// 设置显示名称用于调试
ChartCard.displayName = 'ChartCard';

export default ChartCard; 