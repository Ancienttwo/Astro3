/**
 * ChartAnalysisList - AI分析列表组件
 * 
 * 职责：
 * - 显示AI分析结果列表
 * - 处理分析查看和删除操作
 * - 支持加载状态显示
 */

import React from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/useI18n';
import type { AIAnalysis } from '@/types/fatebook';

// 组件Props接口
export interface ChartAnalysisListProps {
  analyses: AIAnalysis[];
  isLoading: boolean;
  onViewAnalysis: (analysis: AIAnalysis) => void;
  onDeleteAnalysis: (analysis: AIAnalysis) => void;
}

// 分析类型显示配置
const ANALYSIS_CONFIG = {
  'yongshen_analysis': { name: '用神大师', icon: '🎯' },
  'tiekou_zhiduan': { name: '铁口直断', icon: '⚡' },
  'ziwei_reasoning': { name: '紫微推理', icon: '🔮' },
  'sihua_reasoning': { name: '四化分析', icon: '✨' },
  'bazi_analysis': { name: '八字分析', icon: '🤖' },
  'ziwei_analysis': { name: '紫微分析', icon: '🔮' }
} as const;

// 获取分析类型配置
const getAnalysisConfig = (type: string) => {
  return ANALYSIS_CONFIG[type as keyof typeof ANALYSIS_CONFIG] || {
    name: type,
    icon: '🤖'
  };
};

// 分析项组件
const AnalysisItem: React.FC<{
  analysis: AIAnalysis;
  onView: () => void;
  onDelete: () => void;
}> = React.memo(({ analysis, onView, onDelete }) => {
  const { dict } = useI18n();
  const config = getAnalysisConfig(analysis.type);
  
  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView();
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-md p-2">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">{config.icon}</span>
            <p className="text-xs font-medium text-gray-600 dark:text-slate-300">
              {config.name}
            </p>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            {new Date(analysis.createdAt).toLocaleString('zh-CN')}
            {analysis.metadata?.characterCount && (
              <span className="ml-2">
                {analysis.metadata.characterCount}字
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-600 dark:text-slate-300 hover:text-gray-800"
            onClick={handleView}
          >
            <Eye size={12} className="mr-1" />
            {dict.charts.viewAnalysis}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
});

AnalysisItem.displayName = 'AnalysisItem';

// 主组件
export const ChartAnalysisList: React.FC<ChartAnalysisListProps> = React.memo(({
  analyses,
  isLoading,
  onViewAnalysis,
  onDeleteAnalysis
}) => {
  const { dict } = useI18n();
  
  if (isLoading) {
    return (
      <div className="ml-11 mt-2 space-y-2">
        <div className="animate-pulse bg-gray-200 dark:bg-slate-600 rounded-md h-16"></div>
        <div className="animate-pulse bg-gray-200 dark:bg-slate-600 rounded-md h-16"></div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="ml-11 mt-2 text-xs text-gray-400">
        {dict.charts.noAnalysis}
      </div>
    );
  }

  return (
    <div className="ml-11 mt-2 space-y-2">
      {analyses.map((analysis) => (
        <AnalysisItem
          key={analysis.id}
          analysis={analysis}
          onView={() => onViewAnalysis(analysis)}
          onDelete={() => onDeleteAnalysis(analysis)}
        />
      ))}
    </div>
  );
});

ChartAnalysisList.displayName = 'ChartAnalysisList';

export default ChartAnalysisList; 