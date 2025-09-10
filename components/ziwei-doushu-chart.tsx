"use client"

import type React from "react"
import { useState, useMemo } from "react"

// Assuming BirthInfo is exported from a relevant file
export interface BirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: '男' | '女';
  lunar: {
    year: number;
    month: number;
    day: number;
    hour: number;
    yearGanZhi: string;
    monthGanZhi: string;
    dayGanZhi: string;
    hourGanZhi: string;
    isLeap: boolean;
  }
  palaces: PalaceData[];
}

interface StarWithDignity {
  name: string
  dignity?: string
  sihua?: string // 生年四化标记: 禄, 权, 科, 忌
  liXinSihua?: string // 离心四化标记: 禄, 权, 科, 忌
  xiangXinSihua?: string // 向心四化标记: 禄, 权, 科, 忌
}

interface PalaceData {
  name: string
  ganZhi: string
  isLifePalace: boolean
  isBodyPalace: boolean
  isLaiYinPalace?: boolean // 来因宫标记
  stars: StarWithDignity[]
  dayunAgeRange?: string // e.g., "6-15"
  dayunPalaceName?: string // e.g., "大运命宫"
  yearInfo?: string // 年份信息，如 "1997年 2岁" 或 "年命"
}

interface PalaceCellProps extends PalaceData {
  className?: string
  hideYearInfo?: boolean
  isSelected?: boolean
  isConnected?: boolean
  onClick?: () => void
  highlightedKePalaceIndex?: number | null
  highlightedKeStarName?: string | null
  highlightedLuStarName?: string | null
  highlightedQuanStarName?: string | null
  highlightedJiStarName?: string | null
  palaceIndex?: number
}

// 宫位关系配置 - 三合宫和对宫关系
const PALACE_RELATIONSHIPS: Record<number, number[]> = {
  0: [4, 8],    // 命宫 -> 官禄宫、财帛宫 (三合)
  1: [5, 9],    // 兄弟宫 -> 田宅宫、子女宫 (三合)
  2: [6, 10],   // 夫妻宫 -> 交友宫、疾厄宫 (三合)
  3: [7, 11],   // 子女宫 -> 迁移宫、父母宫 (三合)
  4: [8, 0],    // 财帛宫 -> 官禄宫、命宫 (三合)
  5: [9, 1],    // 疾厄宫 -> 子女宫、兄弟宫 (三合)
  6: [10, 2],   // 迁移宫 -> 交友宫、夫妻宫 (三合)
  7: [11, 3],   // 交友宫 -> 父母宫、子女宫 (三合)
  8: [0, 4],    // 官禄宫 -> 命宫、财帛宫 (三合)
  9: [1, 5],    // 田宅宫 -> 兄弟宫、疾厄宫 (三合)
  10: [2, 6],   // 福德宫 -> 夫妻宫、迁移宫 (三合)
  11: [3, 7],   // 父母宫 -> 子女宫、交友宫 (三合)
};

// 获取宫位在网格中的坐标
const getPalaceGridPosition = (palaceIndex: number): { row: number, col: number } => {
  const gridMapping = [4, 3, 2, 1, 5, -1, -1, 0, 6, 7, 8, 9];
  const gridIndex = gridMapping.indexOf(palaceIndex);
  return {
    row: Math.floor(gridIndex / 4),
    col: gridIndex % 4
  };
};

// 获取宫位中心点坐标
const getPalaceCenterPoint = (palaceIndex: number): { x: number, y: number } => {
  const { row, col } = getPalaceGridPosition(palaceIndex);
  const cellWidth = 300; // 1200px / 4
  const cellHeight = 300; // 900px / 3
  return {
    x: col * cellWidth + cellWidth / 2,
    y: row * cellHeight + cellHeight / 2
  };
};

const PalaceCell: React.FC<PalaceCellProps> = ({
  name,
  ganZhi,
  isBodyPalace,
  isLifePalace,
  isLaiYinPalace,
  stars = [],
  className,
  yearInfo,
  hideYearInfo,
  isSelected,
  isConnected,
  onClick,
  highlightedLuStarName,
  highlightedQuanStarName,
  highlightedKeStarName,
  highlightedJiStarName,
}) => {
  let borderClass = 'border border-slate-200 dark:border-slate-700';
  if (isSelected) {
    borderClass = 'border-2 border-purple-500 dark:border-purple-400';
  } else if (isConnected) {
    borderClass = 'border-2 border-purple-300 dark:border-purple-600';
  }

  return (
    <div
      className={`h-full flex flex-col ${borderClass} ${className || ''} relative p-1 ${isSelected || isConnected ? 'bg-purple-50 dark:bg-purple-950/20' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="flex justify-between items-center">
        <div className="text-sm font-bold">{name}</div>
        <div className="text-xs text-slate-500">{ganZhi}</div>
      </div>
      <div className="flex-grow relative mt-1">
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs leading-tight">
            {stars.map((star, index) => {
                const mainStars = ["紫微", "天机", "太阳", "武曲", "天同", "廉贞", "天府", "太阴", "贪狼", "巨门", "天相", "天梁", "七杀", "破军"];
                const auxiliaryStars = ["左辅", "右弼", "文曲", "文昌"];
                const lucunStars = ["禄存", "天魁", "天钺", "天马"];
                const maleficStars = ["擎羊", "陀罗", "地劫", "地空", "火星", "铃星", "天刑"];
                const marriageStars = ["红鸾", "天喜", "天姚"];
                let colorClass = "text-slate-700 dark:text-slate-300";
                if (mainStars.includes(star.name)) colorClass = "text-red-600 dark:text-red-400 font-bold";
                else if (auxiliaryStars.includes(star.name)) colorClass = "text-blue-600 dark:text-blue-400 font-medium";
                else if (lucunStars.includes(star.name)) colorClass = "text-green-700 dark:text-green-500 font-medium";
                else if (maleficStars.includes(star.name)) colorClass = "text-gray-500 dark:text-gray-400 font-normal";
                else if (marriageStars.includes(star.name)) colorClass = "text-pink-500 dark:text-pink-400 font-medium";

                let sihuaColorClass = "", sihuaChar = "";
                if (star.sihua === "禄") { sihuaColorClass = "text-green-600"; sihuaChar = "A"; }
                else if (star.sihua === "权") { sihuaColorClass = "text-purple-600"; sihuaChar = "B"; }
                else if (star.sihua === "科") { sihuaColorClass = "text-blue-600"; sihuaChar = "C"; }
                else if (star.sihua === "忌") { sihuaColorClass = "text-red-700"; sihuaChar = "D"; }

                let highlightClass = "";
                if (highlightedLuStarName === star.name) highlightClass = "bg-green-200 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded px-1";
                if (highlightedQuanStarName === star.name) highlightClass = "bg-purple-200 dark:bg-amber-900/30 text-purple-800 dark:text-amber-300 rounded px-1";
                if (highlightedKeStarName === star.name) highlightClass = "bg-blue-200 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded px-1";
                if (highlightedJiStarName === star.name) highlightClass = "bg-red-200 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded px-1";

              return (
                <div key={index} className={`flex items-center gap-0.5 ${highlightClass}`}>
                  <span className={`${colorClass}`}>{star.name}</span>
                  {star.dignity && <span className="text-xs text-gray-400">({star.dignity})</span>}
                  {sihuaChar && <span className={`${sihuaColorClass} font-bold text-xs`} style={{ fontFamily: "Times New Roman, serif" }}>{sihuaChar}</span>}
                </div>
              );
            })}
          </div>
      </div>
       <div className="absolute bottom-1 right-1 flex flex-col items-end">
            {isLaiYinPalace && <div className="text-xs font-bold text-white bg-red-600 px-1 rounded mb-0.5">来</div>}
            {isBodyPalace && <div className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-white/70 dark:bg-slate-800/70 px-1 rounded">身</div>}
        </div>
        {yearInfo && <div className="absolute bottom-1 left-1 text-xs text-slate-500">{yearInfo}</div>}
    </div>
  )
}

interface ZiweiDoushuChartProps {
  birthInfo: BirthInfo;
}

const ZiweiDoushuChart: React.FC<ZiweiDoushuChartProps> = ({ birthInfo }) => {
  const [selectedPalaceIndex, setSelectedPalaceIndex] = useState<number | null>(null);
  const [connectedPalaces, setConnectedPalaces] = useState<number[]>([]);
  const [highlightedLuStarName, setHighlightedLuStarName] = useState<string | null>(null);
  const [highlightedQuanStarName, setHighlightedQuanStarName] = useState<string | null>(null);
  const [highlightedKeStarName, setHighlightedKeStarName] = useState<string | null>(null);
  const [highlightedJiStarName, setHighlightedJiStarName] = useState<string | null>(null);
  
  const chartData = useMemo(() => {
    // THIS SECTION IS NOW REMOVED.
    // The component will now directly use the `birthInfo` prop
    // which already contains all the necessary pre-calculated chart data.
    // Logic for calculating palaces, stars, etc., is assumed to be handled
    // before being passed into this component.
    // For example:
    const palaces = birthInfo.palaces; // Assuming palaces are passed in birthInfo

    return { palaces };
  }, [birthInfo]);

  const handlePalaceClick = (palaceIndex: number) => {
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

  // 生成连线路径
  const generateConnectionLines = () => {
    if (selectedPalaceIndex === null || connectedPalaces.length === 0) {
      return [];
    }

    const selectedCenter = getPalaceCenterPoint(selectedPalaceIndex);
    return connectedPalaces.map((palaceIndex, index) => {
      const targetCenter = getPalaceCenterPoint(palaceIndex);
      return (
        <line
          key={`line-${selectedPalaceIndex}-${palaceIndex}`}
          x1={selectedCenter.x}
          y1={selectedCenter.y}
          x2={targetCenter.x}
          y2={targetCenter.y}
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeDasharray="8,4"
          opacity="0.8"
        />
      );
    });
  };

  return (
    <div className="w-full h-full p-4 bg-gray-50 dark:bg-gray-900">
      <div className="relative">
        <div className="grid grid-cols-4 grid-rows-3 w-[1200px] h-[900px] border-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-2xl rounded-lg mx-auto">
          {[4, 3, 2, 1, 5, -1, -1, 0, 6, 7, 8, 9].map((pos, gridIndex) => {
            if (pos === -1) {
              return (
                <div key={gridIndex} className="flex flex-col items-center justify-center p-2 border border-slate-200 dark:border-slate-700">
                  <div className="text-lg font-bold">天盘</div>
                  <div>{`${birthInfo.year}-${birthInfo.month}-${birthInfo.day} ${birthInfo.hour.toString().padStart(2, '0')}:${birthInfo.minute.toString().padStart(2, '0')}`}</div>
                  <div>{`${birthInfo.lunar.yearGanZhi} ${birthInfo.lunar.monthGanZhi} ${birthInfo.lunar.dayGanZhi} ${birthInfo.lunar.hourGanZhi}`}</div>
                </div>
              );
            }
            const palace = chartData.palaces[pos];
            if (!palace) return <div key={gridIndex} className="border border-slate-200 dark:border-slate-700" />;
            
            return (
              <PalaceCell
                key={pos}
                {...palace}
                onClick={() => handlePalaceClick(pos)}
                isSelected={selectedPalaceIndex === pos}
                isConnected={connectedPalaces.includes(pos)}
                highlightedLuStarName={highlightedLuStarName}
                highlightedQuanStarName={highlightedQuanStarName}
                highlightedKeStarName={highlightedKeStarName}
                highlightedJiStarName={highlightedJiStarName}
              />
            );
          })}
        </div>
        
        {/* SVG 连线层 */}
        <svg
          className="absolute top-0 left-0 w-[1200px] h-[900px] pointer-events-none mx-auto"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          {generateConnectionLines()}
        </svg>
        
        {/* 使用说明 */}
        <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          点击任意宫位查看三合宫连线关系 • 再次点击取消选择
        </div>
      </div>
    </div>
  );
};

export const sihuaTable: Record<string, { 禄: string; 权: string; 科: string; 忌: string }> = {
    甲: { 禄: "廉贞", 权: "破军", 科: "武曲", 忌: "太阳" },
    乙: { 禄: "天机", 权: "天梁", 科: "紫微", 忌: "太阴" },
    丙: { 禄: "天同", 权: "天机", 科: "文昌", 忌: "廉贞" },
    丁: { 禄: "太阴", 权: "天同", 科: "天机", 忌: "巨门" },
    戊: { 禄: "贪狼", 权: "太阴", 科: "右弼", 忌: "天机" },
    己: { 禄: "武曲", 权: "贪狼", 科: "天梁", 忌: "文曲" },
    庚: { 禄: "太阳", 权: "武曲", 科: "太阴", 忌: "天同" },
    辛: { 禄: "巨门", 权: "太阳", 科: "文曲", 忌: "文昌" },
    壬: { 禄: "天梁", 权: "紫微", 科: "左辅", 忌: "武曲" },
    癸: { 禄: "破军", 权: "天同", 科: "右弼", 忌: "天梁" },
};

export default ZiweiDoushuChart;