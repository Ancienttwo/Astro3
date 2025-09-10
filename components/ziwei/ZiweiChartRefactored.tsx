import React, { useState, useMemo } from 'react';
import { EarthlyBranch } from '@/lib/zodiac/branches';
import { FiveElementsBureau } from '@/lib/zodiac/five-elements-bureau';
import { PalaceData } from '@/app/ziwei/types';

import ChartGrid from './ChartGrid';
import PalaceCard from './PalaceCard';
import CenterPalace from './CenterPalace';
import ConnectionLines, { PALACE_RELATIONSHIPS } from './ConnectionLines';

export interface ChartResult {
  palaces: PalaceData[];
  basePalaces: PalaceData[];
  decadePalaces: PalaceData[];
  lunarDate: string;
  fiveElementsBureau?: FiveElementsBureau;
  mingZhu: string;
  shenZhu: string;
  gender: 'male' | 'female';
  selectedIndex: number | null;
  onPalaceClick: (palace: PalaceData) => void;
}

interface ZiweiChartRefactoredProps {
  result: ChartResult;
  className?: string;
}

// 星盘地支顺序，从寅开始
const CHART_BRANCH_ORDER: EarthlyBranch[] = [
  '寅', '卯', '辰', '巳', '午', '未', 
  '申', '酉', '戌', '亥', '子', '丑'
];

// 宫位网格位置
const gridPositions = [
  { gridArea: '4 / 1 / 5 / 2' }, // 寅
  { gridArea: '3 / 1 / 4 / 2' }, // 卯
  { gridArea: '2 / 1 / 3 / 2' }, // 辰
  { gridArea: '1 / 1 / 2 / 2' }, // 巳
  { gridArea: '1 / 2 / 2 / 3' }, // 午
  { gridArea: '1 / 3 / 2 / 4' }, // 未
  { gridArea: '1 / 4 / 2 / 5' }, // 申
  { gridArea: '2 / 4 / 3 / 5' }, // 酉
  { gridArea: '3 / 4 / 4 / 5' }, // 戌
  { gridArea: '4 / 4 / 5 / 5' }, // 亥
  { gridArea: '4 / 3 / 5 / 4' }, // 子
  { gridArea: '4 / 2 / 5 / 3' }, // 丑
];

const ZiweiChartRefactored: React.FC<ZiweiChartRefactoredProps> = ({
  result,
  className = ''
}) => {
  const {
    palaces,
    basePalaces,
    lunarDate,
    fiveElementsBureau,
    mingZhu,
    shenZhu,
    gender,
    onPalaceClick
  } = result;

  // 连线功能状态
  const [selectedPalaceIndex, setSelectedPalaceIndex] = useState<number | null>(null);
  const [connectedPalaces, setConnectedPalaces] = useState<number[]>([]);

  // 构建星盘宫位数据
  const chartPalaces = useMemo(() => {
    return CHART_BRANCH_ORDER.map((branch, index) => {
      const dynamicData = palaces?.find(p => p.branch === branch);
      return {
        id: index + 1,
        style: gridPositions[index],
        ...dynamicData
      };
    });
  }, [palaces]);

  // 处理宫位点击
  const handlePalaceClick = (palace: PalaceData, palaceIndex: number) => {
    // 调用原有的点击处理
    onPalaceClick(palace);
    
    // 处理连线逻辑
    if (selectedPalaceIndex === palaceIndex) {
      // 如果点击的是已选中的宫位，则取消选择
      setSelectedPalaceIndex(null);
      setConnectedPalaces([]);
    } else {
      // 选择新的宫位并显示连线
      setSelectedPalaceIndex(palaceIndex);
      const relatedPalaces = PALACE_RELATIONSHIPS[palaceIndex] || [];
      setConnectedPalaces(relatedPalaces);
    }
  };

  return (
    <ChartGrid className={className}>
      {/* 中心宫位 */}
      <CenterPalace
        lunarDate={lunarDate}
        fiveElementsBureau={fiveElementsBureau}
        mingZhu={mingZhu}
        shenZhu={shenZhu}
        gender={gender}
      />

      {/* 外围宫位 */}
      {chartPalaces.map((palace, palaceIndex) => {
        const fullPalaceData = palaces.find(p => p.branch === palace.branch);
        
        if (!fullPalaceData) return null;

        const isSelected = selectedPalaceIndex === palaceIndex;
        const isConnected = connectedPalaces.includes(palaceIndex);

        return (
          <PalaceCard
            key={palace.id}
            palace={fullPalaceData}
            palaceIndex={palaceIndex}
            isSelected={isSelected}
            isConnected={isConnected}
            basePalaces={basePalaces}
            onClick={handlePalaceClick}
            style={palace.style}
          />
        );
      })}

      {/* 连线层 */}
      <ConnectionLines
        selectedPalaceIndex={selectedPalaceIndex}
        connectedPalaces={connectedPalaces}
      />
    </ChartGrid>
  );
};

export default ZiweiChartRefactored; 