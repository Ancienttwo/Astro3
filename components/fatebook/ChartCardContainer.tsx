/**
 * ChartCardContainer - 容器组件
 * 
 * 职责：
 * - 整合所有子组件
 * - 处理状态管理和数据获取
 * - 管理AI分析相关逻辑
 * - 提供统一的事件处理
 */

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFatebookStore } from '@/stores/fatebook-store';
import { aiAnalysisService } from '@/services/ai-analysis-service';
import { useI18n } from '@/lib/i18n/useI18n';
import ChartCard from './ChartCard';
import ChartAnalysisList from './ChartAnalysisList';
import ChartYongShenInfo from './ChartYongShenInfo';
import type { ChartRecord, AIAnalysis } from '@/types/fatebook';

// 组件Props接口
export interface ChartCardContainerProps {
  chart: ChartRecord;
  isSelected: boolean;
  onClick: () => void;
  isEnglish?: boolean;
}

// Hook: AI分析管理
const useAnalysisManagement = (chartId: string, isEnglish: boolean = false) => {
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const [showAnalysisList, setShowAnalysisList] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysis | null>(null);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  
  // 获取当前charts列表，用于检查命盘是否还存在
  const { charts } = useFatebookStore();

  // 加载AI分析
  const loadAnalyses = useCallback(async () => {
    try {
      setIsLoadingAnalysis(true);
      const result = await aiAnalysisService.getAnalysesByChartId(chartId);
      setAnalyses(result);
    } catch (error) {
      console.error('❌ 加载AI分析失败:', error);
      setAnalyses([]);
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [chartId]);

  // 删除分析
  const handleDeleteAnalysis = useCallback(async (analysisId: string) => {
    const analysis = analyses.find(a => a.id === analysisId);
    if (!analysis) return;

    const confirmMessage = isEnglish 
      ? `Are you sure you want to delete this analysis report?\n\nThis action cannot be undone.`
      : `确定要删除这份分析报告吗？\n\n此操作不可撤销。`;
    
    const confirmed = confirm(confirmMessage);
    if (!confirmed) return;

    try {
      await aiAnalysisService.deleteAnalysis(analysisId);
      setAnalyses(prev => prev.filter(a => a.id !== analysisId));
      console.log('✅ 分析报告已删除');
    } catch (error) {
      console.error('❌ 删除分析失败:', error);
      const errorMessage = isEnglish 
        ? 'Delete failed, please try again later'
        : '删除失败，请稍后重试';
      alert(errorMessage);
    }
  }, [analyses, isEnglish]);

  // 查看分析
  const handleViewAnalysis = useCallback((analysis: AIAnalysis) => {
    setSelectedAnalysis(analysis);
    setAnalysisDialogOpen(true);
  }, []);

  // 切换分析列表显示
  const toggleAnalysisList = useCallback(() => {
    setShowAnalysisList(prev => !prev);
  }, []);

  // 初始化加载
  React.useEffect(() => {
    if (!chartId) return;
    
    const timer = setTimeout(() => {
      loadAnalyses();
    }, 100); // 简单的防抖
    
    return () => clearTimeout(timer);
  }, [loadAnalyses]);

  return {
    analyses,
    isLoadingAnalysis,
    showAnalysisList,
    selectedAnalysis,
    analysisDialogOpen,
    handleDeleteAnalysis,
    handleViewAnalysis,
    toggleAnalysisList,
    setAnalysisDialogOpen
  };
};

// 主容器组件
export const ChartCardContainer: React.FC<ChartCardContainerProps> = React.memo(({
  chart,
  isSelected,
  onClick,
  isEnglish = false
}) => {
  const { deleteChart } = useFatebookStore();
  const { dict } = useI18n();
  
  const {
    analyses,
    isLoadingAnalysis,
    showAnalysisList,
    selectedAnalysis,
    analysisDialogOpen,
    handleDeleteAnalysis,
    handleViewAnalysis,
    toggleAnalysisList,
    setAnalysisDialogOpen
  } = useAnalysisManagement(chart.id, isEnglish);

  // 删除命盘
  const handleDeleteChart = useCallback(async () => {
    const confirmMessage = `${dict.charts.confirmDeleteChart}\n\n${dict.charts.deleteChartWarning}`;
    
    const confirmed = confirm(confirmMessage);
    if (!confirmed) return;

    try {
      await deleteChart(chart.id);
      console.log(`✅ 命盘"${chart.name}"已删除`);
    } catch (error) {
      console.error('❌ 删除失败:', error);
      alert(`${dict.charts.deleteFailed}\n${dict.charts.deleteFailedMessage}`);
    }
  }, [chart.id, chart.name, deleteChart, dict]);

  return (
    <>
      {/* 主卡片 */}
      <ChartCard
        chart={chart}
        isSelected={isSelected}
        analysisCount={analyses.length}
        showAnalysisList={showAnalysisList}
        isLoadingAnalysis={isLoadingAnalysis}
        onClick={onClick}
        onDelete={handleDeleteChart}
        onToggleAnalysisList={toggleAnalysisList}
        isEnglish={isEnglish}
      />

      {/* AI分析列表 */}
      {showAnalysisList && (
        <ChartAnalysisList
          analyses={analyses}
          isLoading={isLoadingAnalysis}
          onViewAnalysis={handleViewAnalysis}
          onDeleteAnalysis={handleDeleteAnalysis}
        />
      )}

      {/* AI分析结果对话框 */}
      <Dialog open={analysisDialogOpen} onOpenChange={setAnalysisDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {`${dict.charts.aiAnalysisResult} - ${chart.name}`}
            </DialogTitle>
          </DialogHeader>
          {selectedAnalysis && (
            <div className="mt-4">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-slate-300 leading-relaxed">
                  {selectedAnalysis.content}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});

ChartCardContainer.displayName = 'ChartCardContainer';

export default ChartCardContainer; 