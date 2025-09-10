import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ChevronRight, RotateCcw } from 'lucide-react';
import type { PalaceData } from '@/stores/ziwei-store';
import { useZiweiSelectors, useZiweiActions } from '@/stores/ziwei-store';
import { useZiweiCalculation } from '@/hooks/useZiweiCalculation';

interface ZiweiDecadeYearSelectorProps {
  decades: PalaceData[];
  birthYear: number;
  compact?: boolean;
}

export function ZiweiDecadeYearSelector({ decades, birthYear, compact = false }: ZiweiDecadeYearSelectorProps) {
  const { selectedDecadeIndex, selectedYearlyIndex } = useZiweiSelectors();
  const { setSelectedDecadeIndex, setSelectedYearlyIndex } = useZiweiActions();
  const { selectDecade, selectYear } = useZiweiCalculation();

  // 计算流年数据
  const yearlyData = useMemo(() => {
    if (selectedDecadeIndex === null || !decades[selectedDecadeIndex]) return [];
    
    const selectedDecade = decades[selectedDecadeIndex];
    if (!selectedDecade.decade) return [];
    
    // 解析大运年龄范围
    const ageRange = selectedDecade.decade.split('-');
    const startAge = parseInt(ageRange[0]);
    const endAge = parseInt(ageRange[1]);
    
    const years = [];
    for (let age = startAge; age <= endAge; age++) {
      const year = birthYear + age - 1;
      years.push({
        age,
        year,
        isCurrentYear: year === new Date().getFullYear()
      });
    }
    
    return years;
  }, [selectedDecadeIndex, decades, birthYear]);

  // 处理大运选择
  const handleDecadeSelect = (index: number) => {
    if (index === selectedDecadeIndex) {
      // 点击当前选中的大运，取消选择
      selectDecade(null);
    } else {
      selectDecade(index);
    }
  };

  // 处理流年选择
  const handleYearSelect = (yearIndex: number) => {
    if (yearIndex === selectedYearlyIndex) {
      // 点击当前选中的流年，取消选择
      selectYear(null);
    } else {
      selectYear(yearIndex);
    }
  };

  // 重置选择
  const handleReset = () => {
    selectDecade(null);
  };

  return (
    <div className="ziwei-decade-year-selector space-y-4">
      {/* 大运选择器 */}
      <Card className="bg-white dark:bg-slate-800 border border-purple-200 dark:border-amber-400/30 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-amber-400">
              <Calendar className="w-4 h-4" />
              大运选择
            </CardTitle>
            
            {selectedDecadeIndex !== null && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                重置
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
            {decades.map((decade, index) => {
              const isSelected = selectedDecadeIndex === index;
              const isActive = decade.decade && decade.decade.includes(new Date().getFullYear() - birthYear + 1);
              
              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDecadeSelect(index)}
                  className={`flex flex-col items-center p-3 h-auto transition-all ${
                    isSelected 
                      ? 'bg-purple-500 hover:bg-purple-600 dark:bg-amber-500 dark:hover:bg-amber-600 text-white border-purple-500 dark:border-amber-500' 
                      : 'border-purple-200 dark:border-amber-400/50 text-purple-600 dark:text-amber-400 hover:bg-purple-50 dark:hover:bg-amber-400/10'
                  } ${isActive ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''}`}
                  title={isActive ? '当前大运' : undefined}
                >
                  <span className="text-xs font-mono mb-1">
                    {decade.decade || `${index * 10 + 6}-${index * 10 + 15}`}岁
                  </span>
                  <span className="text-xs font-noto">
                    {decade.name}
                  </span>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {decade.heavenlyStem}{decade.branch}
                  </span>
                  
                  {isActive && (
                    <Badge variant="secondary" className="mt-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      当前
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
          
          {selectedDecadeIndex !== null && (
            <div className="mt-3 p-3 bg-purple-50 dark:bg-slate-700/50 rounded-lg border border-purple-200 dark:border-amber-400/30">
              <div className="text-sm font-medium text-purple-600 dark:text-amber-400 mb-1">
                已选择：{decades[selectedDecadeIndex]?.name} ({decades[selectedDecadeIndex]?.decade}岁)
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                宫位：{decades[selectedDecadeIndex]?.heavenlyStem}{decades[selectedDecadeIndex]?.branch}
                {decades[selectedDecadeIndex]?.stars && decades[selectedDecadeIndex].stars!.length > 0 && (
                  <span className="ml-2">
                    主星：{decades[selectedDecadeIndex].stars!.slice(0, 3).map(s => s.name).join('、')}
                    {decades[selectedDecadeIndex].stars!.length > 3 && '...'}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 流年选择器 */}
      {selectedDecadeIndex !== null && yearlyData.length > 0 && (
        <Card className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-400/30 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
              流年选择
              <ChevronRight className="w-3 h-3" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {decades[selectedDecadeIndex]?.name} ({decades[selectedDecadeIndex]?.decade}岁)
              </span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className={`grid gap-2 ${compact ? 'grid-cols-3' : 'grid-cols-3 sm:grid-cols-5'}`}>
              {yearlyData.map((yearData, index) => {
                const isSelected = selectedYearlyIndex === index;
                
                return (
                  <Button
                    key={index}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleYearSelect(index)}
                    className={`flex flex-col items-center p-2 h-auto transition-all ${
                      isSelected 
                        ? 'bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500' 
                        : 'border-indigo-200 dark:border-indigo-400/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-400/10'
                    } ${yearData.isCurrentYear ? 'ring-2 ring-green-400 dark:ring-green-500' : ''}`}
                    title={yearData.isCurrentYear ? '今年' : undefined}
                  >
                    <span className="text-xs font-mono">
                      {yearData.year}
                    </span>
                    <span className="text-xs">
                      {yearData.age}岁
                    </span>
                    
                    {yearData.isCurrentYear && (
                      <Badge variant="secondary" className="mt-1 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        今年
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
            
            {selectedYearlyIndex !== null && (
              <div className="mt-3 p-3 bg-indigo-50 dark:bg-slate-700/50 rounded-lg border border-indigo-200 dark:border-indigo-400/30">
                <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  已选择流年：{yearlyData[selectedYearlyIndex]?.year}年 ({yearlyData[selectedYearlyIndex]?.age}岁)
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  大运：{decades[selectedDecadeIndex]?.name} + 流年：{yearlyData[selectedYearlyIndex]?.year}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 说明信息 */}
      {!compact && (
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-200 dark:border-slate-600">
          <div className="space-y-1">
            <div>• 大运：每十年一个周期，影响人生阶段性运势</div>
            <div>• 流年：每年的具体运势，需先选择大运</div>
            <div>• 蓝圈标记当前大运，绿圈标记今年流年</div>
            <div>• 点击已选择的项目可以取消选择</div>
          </div>
        </div>
      )}
    </div>
  );
} 