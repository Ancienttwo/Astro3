/**
 * ChartYongShenInfo - 用神信息组件
 * 
 * 职责：
 * - 显示八字用神信息
 * - 支持置信度和详细信息展示
 * - 优雅的视觉设计
 */

import React from 'react';
import type { YongShenInfo } from '@/types/fatebook';

// 组件Props接口
export interface ChartYongShenInfoProps {
  yongShenInfo: YongShenInfo;
  className?: string;
}

// 主组件
export const ChartYongShenInfo: React.FC<ChartYongShenInfoProps> = React.memo(({
  yongShenInfo,
  className = ""
}) => {
  return (
    <div className={`mt-3 pt-3 border-t border-green-200 dark:border-green-800 ${className}`}>
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
        {/* 标题和置信度 */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🎯</span>
          <h5 className="text-sm font-semibold text-green-700 dark:text-green-300">
            用神信息
          </h5>
          <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
            置信度 {Math.round(yongShenInfo.confidence * 100)}%
          </span>
        </div>
        
        {/* 详细信息 */}
        <div className="space-y-1 text-xs">
          {/* 用神忌神 2x1 分格布局 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 用神格子 */}
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md p-2">
              <div className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400 font-medium">
                  用神:
                </span>
                <span className="text-green-600 dark:text-green-400 font-bold">
                  {yongShenInfo.primaryYongShen}
                </span>
              </div>
            </div>
            
            {/* 忌神格子 */}
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md p-2">
              <div className="flex items-center gap-2">
                <span className="text-red-600 dark:text-red-400 font-medium">
                  忌神:
                </span>
                {yongShenInfo.jiShen && yongShenInfo.jiShen.length > 0 ? (
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    {yongShenInfo.jiShen.join('、')}
                  </span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    无
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* 格局 */}
          {yongShenInfo.geLu && (
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400 font-medium">
                格局:
              </span>
              <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                {yongShenInfo.geLu}
              </span>
            </div>
          )}
          
          {/* 分析时间 */}
          <div className="text-green-600 dark:text-green-400 mt-2">
            <span className="font-medium">分析时间:</span> 
            <span className="ml-1">
              {new Date(yongShenInfo.analysisDate).toLocaleDateString('zh-CN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

ChartYongShenInfo.displayName = 'ChartYongShenInfo';

export default ChartYongShenInfo; 