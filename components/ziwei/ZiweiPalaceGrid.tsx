import React, { useMemo, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from 'lucide-react';
import type { ZiweiResult, PalaceData, StarData } from '@/stores/ziwei-store';
import { EARTHLY_BRANCHES } from '@/lib/zodiac/branches';
import { useTranslation, useCurrentLocale } from '@/hooks/useI18n';

// 地支到网格位置的映射 (固定不变的十二地支物理位置)
const GRID_TO_BRANCH_MAPPING = {
  0: '巳', 1: '午', 2: '未', 3: '申',
  4: '辰', 5: '', 6: '', 7: '酉',
  8: '卯', 9: '', 10: '', 11: '戌',
  12: '寅', 13: '丑', 14: '子', 15: '亥'
};

// 四化颜色映射
const SIHUA_COLORS = {
  'A': 'text-green-600 dark:text-green-400', // 禄
  'B': 'text-red-600 dark:text-red-400',     // 权 
  'C': 'text-blue-600 dark:text-blue-400',   // 科
  'D': 'text-orange-600 dark:text-orange-400' // 忌
};

// 四化标记
const SIHUA_LABELS = {
  'A': '禄',
  'B': '权', 
  'C': '科',
  'D': '忌'
};

// 星曜亮度颜色
const BRIGHTNESS_COLORS = {
  '庙': 'text-purple-700 dark:text-purple-300 font-bold',
  '旺': 'text-purple-600 dark:text-purple-400 font-semibold',
  '得': 'text-purple-500 dark:text-purple-500',
  '利': 'text-gray-700 dark:text-gray-300',
  '平': 'text-gray-600 dark:text-gray-400',
  '不': 'text-gray-500 dark:text-gray-500',
  '陷': 'text-gray-400 dark:text-gray-600'
};

interface ZiweiPalaceGridProps {
  result: ZiweiResult;
  onPalaceClick?: (palace: PalaceData) => void;
  onTimeAdjust?: () => void;
  compact?: boolean;
}

interface PalaceCellProps {
  palace: PalaceData | null;
  branch: string;
  isCenter?: boolean;
  compact?: boolean;
  onClick?: () => void;
  translatePalaceName?: (name: string) => string;
}

// 单个宫位格子组件
function PalaceCell({ palace, branch, isCenter, compact, onClick, translatePalaceName }: PalaceCellProps) {
  if (isCenter) {
    return (
      <div className="palace-cell center-cell flex items-center justify-center bg-gradient-to-br from-purple-50 to-amber-50 dark:from-slate-700 dark:to-slate-600 border border-purple-200 dark:border-amber-400/30">
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600 dark:text-amber-400 font-noto">紫微斗数</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">命盘</div>
        </div>
      </div>
    );
  }

  if (!palace) {
    return (
      <div className="palace-cell empty-cell border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800">
        <div className="text-xs text-gray-400 dark:text-slate-500 font-noto">{branch}</div>
      </div>
    );
  }

  return (
    <div 
      className={`palace-cell cursor-pointer transition-all duration-200 bg-white dark:bg-slate-700 border border-purple-200 dark:border-amber-400/30 hover:bg-purple-50 dark:hover:bg-slate-600 hover:border-purple-300 dark:hover:border-amber-400/50 shadow-sm hover:shadow-md ${
        palace.isShenGong ? 'ring-2 ring-amber-400 dark:ring-amber-500' : ''
      }`}
      onClick={onClick}
    >
      {/* 宫位标题区 */}
      <div className="palace-header p-1 border-b border-gray-200 dark:border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start gap-0.5">
            <span className={`text-xs font-bold h-3 flex items-center ${
              palace.name === '命宫' 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-purple-600 dark:text-amber-400'
            } font-noto`}>
              {translatePalaceName ? translatePalaceName(palace.name) : palace.name}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-noto h-3 flex items-center">
              {palace.heavenlyStem}{palace.branch}
            </span>
          </div>
          
          {/* 特殊标记 */}
          <div className="flex flex-col items-end gap-1">
            {palace.isShenGong && (
              <Badge variant="outline" className="text-xs px-1 py-0 border-amber-400 text-amber-600 dark:text-amber-400">
                身
              </Badge>
            )}
            {palace.isLaiYinPalace && (
              <Badge variant="outline" className="text-xs px-1 py-0 border-blue-400 text-blue-600 dark:text-blue-400">
                来
              </Badge>
            )}
          </div>
        </div>
        
        {/* 大运信息 */}
        {palace.decade && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 h-3 flex items-center font-noto">
            {palace.decade}岁
          </div>
        )}
      </div>

      {/* 星曜区域 */}
      <div className="palace-stars p-1 flex-1 min-h-0">
        <div className="flex flex-wrap gap-1 text-xs">
          {palace.stars?.map((star, index) => (
            <div key={index} className="star-item flex items-center">
              <span 
                className={`star-name ${
                  BRIGHTNESS_COLORS[star.brightness] || 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {star.name}
              </span>
              
              {/* 生年四化标记 */}
              {star.sihua && (
                <span className={`sihua-mark ml-1 ${SIHUA_COLORS[star.sihua]}`}>
                  {SIHUA_LABELS[star.sihua]}
                </span>
              )}
              
              {/* 宫干四化标记 */}
              {star.palaceHua && star.palaceHua.length > 0 && (
                <span className="palace-hua-marks ml-1 text-xs">
                  {star.palaceHua.map((hua, huaIndex) => (
                    <span key={huaIndex} className="text-pink-500 dark:text-pink-400">
                      {hua}
                    </span>
                  ))}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ZiweiPalaceGrid({ result, onPalaceClick, onTimeAdjust, compact = false }: ZiweiPalaceGridProps) {
  const dict = useTranslation();
  const locale = useCurrentLocale();
  
  // 宫位名称翻译函数
  const translatePalaceName = useCallback((palaceName: string) => {
    if (locale === 'en') {
      const palaceNameMap: Record<string, string> = {
        '命宫': 'Life Palace',
        '兄弟': 'Siblings Palace', 
        '夫妻': 'Marriage Palace',
        '子女': 'Children Palace',
        '财帛': 'Wealth Palace',
        '疾厄': 'Health Palace',
        '迁移': 'Travel Palace',
        '交友': 'Friends Palace',
        '官禄': 'Career Palace',
        '田宅': 'Property Palace',
        '福德': 'Fortune Palace',
        '父母': 'Parents Palace'
      };
      return palaceNameMap[palaceName] || palaceName;
    }
    return palaceName;
  }, [locale]);
  
  // 创建地支到宫位的映射
  const branchToPalaceMap = useMemo(() => {
    const map = new Map<string, PalaceData>();
    result.palaces.forEach(palace => {
      map.set(palace.branch, palace);
    });
    return map;
  }, [result.palaces]);

  // 处理宫位点击
  const handlePalaceClick = useCallback((palace: PalaceData) => {
    if (onPalaceClick) {
      onPalaceClick(palace);
    }
  }, [onPalaceClick]);

  // 渲染网格
  const renderGrid = () => {
    const cells = [];
    
    for (let i = 0; i < 16; i++) {
      const branch = GRID_TO_BRANCH_MAPPING[i as keyof typeof GRID_TO_BRANCH_MAPPING];
      
      if (branch === '') {
        // 中心区域
        cells.push(
          <PalaceCell
            key={i}
            palace={null}
            branch=""
            isCenter={true}
            compact={compact}
            translatePalaceName={translatePalaceName}
          />
        );
      } else {
        // 宫位格子
        const palace = branchToPalaceMap.get(branch) || null;
        cells.push(
          <PalaceCell
            key={i}
            palace={palace}
            branch={branch}
            compact={compact}
            onClick={palace ? () => handlePalaceClick(palace) : undefined}
            translatePalaceName={translatePalaceName}
          />
        );
      }
    }
    
    return cells;
  };

  return (
    <Card className="ziwei-palace-grid bg-white dark:bg-slate-800 border border-purple-200 dark:border-amber-400/30 shadow-lg overflow-hidden">
      {/* 顶部信息栏 */}
      <div className="grid-header p-3 bg-gradient-to-r from-purple-50 to-amber-50 dark:from-slate-700 dark:to-slate-600 border-b border-purple-200 dark:border-amber-400/30">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-purple-600 dark:text-amber-400 font-noto">
              {result.lunarDate}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-x-4">
              <span>五行局：{result.fiveElementsBureau}</span>
              <span>命主：{result.mingZhu}</span>
              <span>身主：{result.shenZhu}</span>
            </div>
          </div>
          
          {onTimeAdjust && (
            <button
              onClick={onTimeAdjust}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 dark:bg-amber-500 dark:hover:bg-amber-600 text-white text-sm transition-colors"
              title="修改时辰重新排盘"
            >
              <Clock className="w-4 h-4" />
              <span>修改时辰</span>
            </button>
          )}
        </div>
        
        {/* 四化信息 */}
        {result.sihuaInfo && (
          <div className="sihua-info mt-2 text-sm text-gray-600 dark:text-gray-300 font-mono">
            <span className="text-green-600 dark:text-green-400">禄：{result.sihuaInfo.lu}</span>
            <span className="ml-4 text-red-600 dark:text-red-400">权：{result.sihuaInfo.quan}</span>
            <span className="ml-4 text-blue-600 dark:text-blue-400">科：{result.sihuaInfo.ke}</span>
            <span className="ml-4 text-orange-600 dark:text-orange-400">忌：{result.sihuaInfo.ji}</span>
          </div>
        )}
      </div>

      {/* 星盘网格 */}
      <div className="grid-container p-4">
        <div 
          className={`palace-grid grid grid-cols-4 gap-1 ${
            compact ? 'w-80 h-80' : 'w-96 h-96'
          } mx-auto aspect-square`}
          style={{
            gridTemplateRows: 'repeat(4, 1fr)',
          }}
        >
          {renderGrid()}
        </div>
      </div>

      {/* 说明文字 */}
      <div className="grid-footer p-3 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-200 dark:border-slate-600 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex flex-wrap gap-4">
          <span>• 点击宫位查看详细信息</span>
          <span>• 红框为身宫</span>
          <span>• 蓝标为来因宫</span>
          <span className="text-green-600 dark:text-green-400">禄</span>
          <span className="text-red-600 dark:text-red-400">权</span>
          <span className="text-blue-600 dark:text-blue-400">科</span>
          <span className="text-orange-600 dark:text-orange-400">忌</span>
        </div>
      </div>

      {/* 样式定义 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .palace-cell {
            display: flex;
            flex-direction: column;
            min-height: 0;
            font-size: ${compact ? '10px' : '11px'};
            position: relative;
          }
          
          .center-cell {
            grid-column: 2 / 4;
            grid-row: 2 / 4;
          }
          
          .palace-header {
            flex-shrink: 0;
          }
          
          .palace-stars {
            overflow: hidden;
          }
          
          .star-item {
            flex-shrink: 0;
            line-height: 1.2;
          }
          
          .star-name {
            font-weight: 500;
          }
          
          .sihua-mark {
            font-weight: bold;
            font-size: 10px;
          }
          
          .palace-hua-marks {
            font-family: monospace;
          }
        `
      }} />
    </Card>
  );
} 