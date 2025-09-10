import React, { useState, useMemo } from 'react';
import { PalaceData, StarData, EarthlyBranch } from '@/lib/types';

// 定义缺失常量 (从搜索结果复制)
const CHART_BRANCH_ORDER: EarthlyBranch[] = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
const gridPositions = [
  { gridArea: '4 / 1 / 5 / 2' },
  { gridArea: '3 / 1 / 4 / 2' },
  { gridArea: '2 / 1 / 3 / 2' },
  { gridArea: '1 / 1 / 2 / 2' },
  { gridArea: '1 / 2 / 2 / 3' },
  { gridArea: '1 / 3 / 2 / 4' },
  { gridArea: '1 / 4 / 2 / 5' },
  { gridArea: '2 / 4 / 3 / 5' },
  { gridArea: '3 / 4 / 4 / 5' },
  { gridArea: '4 / 4 / 5 / 5' },
  { gridArea: '4 / 3 / 5 / 4' },
  { gridArea: '4 / 2 / 5 / 3' },
];
const opposites = { 0: 6, 1: 7, 2: 8, 3: 9, 4: 10, 5: 11, 6: 0, 7: 1, 8: 2, 9: 3, 10: 4, 11: 5 };

// 假设函数定义 (从搜索结果)
const getPalaceConnectionPoint = (index) => ({ x: (index % 4) * 25 + 12.5, y: Math.floor(index / 4) * 25 + 12.5 });
const createConnectionLine = (start, end, key, color, width, arrow) => (
  <line key={key} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={color} strokeWidth={width} markerEnd={arrow ? 'url(#arrow)' : ''} />
);

export default function ZiweiChartWithConnections({ result }) {
  const [selectedPalaceIndex, setSelectedPalaceIndex] = useState(null);
  const chartPalaces = useMemo(() => CHART_BRANCH_ORDER.map((branch, index) => ({ id: index + 1, style: gridPositions[index], ...result.palaces?.find(p => p.branch === branch) })), [result.palaces]);

  const generateConnectionLines = () => {
    const lines = [];
    const centerPoint = { x: 50, y: 50 };
    chartPalaces.forEach((palace, palaceIndex) => {
      if (palace.stars) {
        palace.stars.forEach((star) => {
          if (star.xiangXinSihua) {
            const palacePoint = getPalaceConnectionPoint(palaceIndex);
            const oppositeIndex = opposites[palaceIndex];
            const oppositePoint = getOppositeEdgeMidpoint(palaceIndex, oppositeIndex);
            lines.push(createConnectionLine(palacePoint, oppositePoint, `i-${palaceIndex}-${star.name}`, '#ef4444', 2, true));
          }
          if (star.liXinSihua) {
            const palacePoint = getPalaceConnectionPoint(palaceIndex);
            const directionAdjust = { x: palacePoint.x, y: palacePoint.y };
            if (palaceIndex < 4) directionAdjust.y += 10;
            else if (palaceIndex >= 4 && palaceIndex < 8) directionAdjust.x += (palaceIndex % 2 === 0 ? 10 : -10);
            else directionAdjust.y -= 10;
            lines.push(createConnectionLine(centerPoint, directionAdjust, `x-${palaceIndex}-${star.name}`, '#ef4444', 2, true));
          }
        });
      }
    });
    // 添加测试线条确保渲染
    lines.push(createConnectionLine({x: 0, y: 0}, {x: 100, y: 100}, 'test', 'red', 2, false));
    return lines;
  };

  const getOppositeEdgeMidpoint = (currentIndex, oppositeIndex) => {
    const oppositePoint = getPalaceConnectionPoint(oppositeIndex);
    if ([0, 3, 8, 11].includes(oppositeIndex)) {
      return { x: oppositePoint.x + (oppositePoint.x > 50 ? -5 : 5), y: oppositePoint.y + (oppositePoint.y > 50 ? -5 : 5) };
    }
    return { x: (getPalaceConnectionPoint(currentIndex).x + oppositePoint.x) / 2, y: (getPalaceConnectionPoint(currentIndex).y + oppositePoint.y) / 2 };
  };

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full grid grid-cols-[repeat(4,1fr)] grid-rows-[repeat(4,1fr)] gap-0 min-h-[520px] sm:min-h-[600px] md:min-h-[680px]">
        {/* 中心宫位代码 (假设现有) */}
        {chartPalaces.map((palace, palaceIndex) => (
          <div key={palace.id} style={palace.style} onClick={() => setSelectedPalaceIndex(palaceIndex)}>
            {/* 宫位内容 */}
          </div>
        ))}
      </div>
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* 箭头marker 定义 (假设现有) */}
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
          </marker>
        </defs>
        {generateConnectionLines()}
      </svg>
    </div>
  );
}