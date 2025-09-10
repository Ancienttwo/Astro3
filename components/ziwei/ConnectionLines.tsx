import React from 'react';

interface ConnectionLinesProps {
  selectedPalaceIndex: number | null;
  connectedPalaces: number[];
  className?: string;
}

// 宫位关系配置 - 三合宫相互连接 + 对宫连接
const PALACE_RELATIONSHIPS: Record<number, number[]> = {
  0: [4, 8, 6],     // 寅宫 -> 午宫、戌宫(三合) + 申宫(对宫)
  1: [5, 9, 7],     // 卯宫 -> 未宫、亥宫(三合) + 酉宫(对宫)
  2: [6, 10, 8],    // 辰宫 -> 申宫、子宫(三合) + 戌宫(对宫)
  3: [7, 11, 9],    // 巳宫 -> 酉宫、丑宫(三合) + 亥宫(对宫)
  4: [0, 8, 10],    // 午宫 -> 寅宫、戌宫(三合) + 子宫(对宫)
  5: [1, 9, 11],    // 未宫 -> 卯宫、亥宫(三合) + 丑宫(对宫)
  6: [2, 10, 0],    // 申宫 -> 辰宫、子宫(三合) + 寅宫(对宫)
  7: [3, 11, 1],    // 酉宫 -> 巳宫、丑宫(三合) + 卯宫(对宫)
  8: [0, 4, 2],     // 戌宫 -> 寅宫、午宫(三合) + 辰宫(对宫)
  9: [1, 5, 3],     // 亥宫 -> 卯宫、未宫(三合) + 巳宫(对宫)
  10: [2, 6, 4],    // 子宫 -> 辰宫、申宫(三合) + 午宫(对宫)
  11: [3, 7, 5],    // 丑宫 -> 巳宫、酉宫(三合) + 未宫(对宫)
};

// 获取宫位连接点坐标
const getPalaceConnectionPoint = (palaceIndex: number): { x: number, y: number } => {
  const positions = [
    { x: 25, y: 75 },     // 寅宫 - 使用内角 (右上角)
    { x: 25, y: 62.5 },   // 卯宫 - 右边中点
    { x: 25, y: 37.5 },   // 辰宫 - 右边中点
    { x: 25, y: 25 },     // 巳宫 - 使用内角 (右下角)
    { x: 37.5, y: 25 },   // 午宫 - 下边中点
    { x: 62.5, y: 25 },   // 未宫 - 下边中点
    { x: 75, y: 25 },     // 申宫 - 使用内角 (左下角)
    { x: 75, y: 37.5 },   // 酉宫 - 左边中点
    { x: 75, y: 62.5 },   // 戌宫 - 左边中点
    { x: 75, y: 75 },     // 亥宫 - 使用内角 (左上角)
    { x: 62.5, y: 75 },   // 子宫 - 上边中点
    { x: 37.5, y: 75 },   // 丑宫 - 上边中点
  ];
  return positions[palaceIndex] || { x: 50, y: 50 };
};

// 获取三合宫位 (除了对宫)
const getTripleHarmonyPalaces = (palaceIndex: number): number[] => {
  const related = PALACE_RELATIONSHIPS[palaceIndex] || [];
  // 对宫关系：寅申、卯酉、辰戌、巳亥、午子、未丑
  const opposites: Record<number, number> = {
    0: 6, 1: 7, 2: 8, 3: 9, 4: 10, 5: 11,
    6: 0, 7: 1, 8: 2, 9: 3, 10: 4, 11: 5
  };
  const oppositePalace = opposites[palaceIndex];
  // 返回非对宫的宫位 (即三合宫)
  return related.filter(p => p !== oppositePalace);
};

// 创建单条连线
const createConnectionLine = (
  startPoint: { x: number, y: number }, 
  endPoint: { x: number, y: number }, 
  key: string
): React.JSX.Element => {
  return (
    <line
      key={`connection-${key}`}
      x1={`${startPoint.x}%`}
      y1={`${startPoint.y}%`}
      x2={`${endPoint.x}%`}
      y2={`${endPoint.y}%`}
      stroke="#8b5cf6"
      strokeWidth="0.2"
      strokeDasharray="3,2"
      opacity="0.9"
    />
  );
};

const ConnectionLines: React.FC<ConnectionLinesProps> = ({
  selectedPalaceIndex,
  connectedPalaces,
  className = ''
}) => {
  // 生成连线路径
  const generateConnectionLines = () => {
    if (selectedPalaceIndex === null || connectedPalaces.length === 0) {
      return [];
    }

    const lines: React.JSX.Element[] = [];
    const selectedPoint = getPalaceConnectionPoint(selectedPalaceIndex);
    
    // 1. 从选中宫位到其他宫位的连线
    connectedPalaces.forEach((palaceIndex, index) => {
      const targetPoint = getPalaceConnectionPoint(palaceIndex);
      lines.push(createConnectionLine(selectedPoint, targetPoint, `${selectedPalaceIndex}-${palaceIndex}`));
    });
    
    // 2. 三合宫之间的互相连线
    const tripleHarmonyPalaces = getTripleHarmonyPalaces(selectedPalaceIndex);
    if (tripleHarmonyPalaces.length === 2) {
      const [palace1, palace2] = tripleHarmonyPalaces;
      const point1 = getPalaceConnectionPoint(palace1);
      const point2 = getPalaceConnectionPoint(palace2);
      lines.push(createConnectionLine(point1, point2, `harmony-${palace1}-${palace2}`));
    }
    
    return lines;
  };

  return (
    <svg
      className={`absolute top-0 left-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {generateConnectionLines()}
    </svg>
  );
};

export { PALACE_RELATIONSHIPS };
export default ConnectionLines; 