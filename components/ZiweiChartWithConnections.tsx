"use client";

import React, { useState, useRef, useEffect } from 'react';
import { HeavenlyStem } from "@/lib/zodiac/stems";
import { EARTHLY_BRANCHES, EarthlyBranch } from "@/lib/zodiac/branches";
import { FiveElementsBureau } from "@/lib/zodiac/five-elements-bureau";
import { PalaceData } from '@/app/ziwei/page';
import { Badge } from "@/components/ui/badge";

// 定义StarData类型（基于实际使用的结构）
interface StarData {
  name: string;
  type: string;
  brightness?: string;
  sihua?: 'A' | 'B' | 'C' | 'D';
  palaceHua?: string[];
}

// Extending StarData with Sihua property for this component
interface StarWithSihua extends StarData {
  sihua?: 'A' | 'B' | 'C' | 'D';
}

// Extending PalaceData with stars that can include Sihua
interface PalaceWithSihua extends Omit<PalaceData, 'stars'> {
  stars?: StarWithSihua[];
}

// The star being used in calculations has additional properties
type ExtendedStar = NonNullable<PalaceData['stars']>[0] & StarWithSihua;

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

interface ZiweiChartWithConnectionsProps {
    result: ChartResult;
}

// 宫位关系配置 - 三合宫相互连接 + 对宫连接 (共3条线)
const PALACE_RELATIONSHIPS: Record<number, number[]> = {
  0: [4, 8, 6],     // 寅宫 -> 午宫、戌宫(三合) + 申宫(对宫) (3条线)
  1: [5, 9, 7],     // 卯宫 -> 未宫、亥宫(三合) + 酉宫(对宫) (3条线)  
  2: [6, 10, 8],    // 辰宫 -> 申宫、子宫(三合) + 戌宫(对宫) (3条线)
  3: [7, 11, 9],    // 巳宫 -> 酉宫、丑宫(三合) + 亥宫(对宫) (3条线)
  4: [0, 8, 10],    // 午宫 -> 寅宫、戌宫(三合) + 子宫(对宫) (3条线)
  5: [1, 9, 11],    // 未宫 -> 卯宫、亥宫(三合) + 丑宫(对宫) (3条线)
  6: [2, 10, 0],    // 申宫 -> 辰宫、子宫(三合) + 寅宫(对宫) (3条线)
  7: [3, 11, 1],    // 酉宫 -> 巳宫、丑宫(三合) + 卯宫(对宫) (3条线)
  8: [0, 4, 2],     // 戌宫 -> 寅宫、午宫(三合) + 辰宫(对宫) (3条线)
  9: [1, 5, 3],     // 亥宫 -> 卯宫、未宫(三合) + 巳宫(对宫) (3条线)
  10: [2, 6, 4],    // 子宫 -> 辰宫、申宫(三合) + 午宫(对宫) (3条线)
  11: [3, 7, 5],    // 丑宫 -> 巳宫、酉宫(三合) + 未宫(对宫) (3条线)
};

const gridPositions = [
    { gridArea: '4 / 1 / 5 / 2' }, // 寅 at Grid 1
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

// Standard Ziwei chart layout order, starting from Yin (寅)
const CHART_BRANCH_ORDER: EarthlyBranch[] = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

const centerPalace = { id: 0, name: '天盘', style: { gridArea: '2 / 2 / 4 / 4' } };

// 获取宫位连接点坐标 (12宫用内边中点，寅申巳亥用内角)
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

export default function ZiweiChartWithConnections({ result }: ZiweiChartWithConnectionsProps) {
    const { palaces, lunarDate, fiveElementsBureau, mingZhu, shenZhu, gender, selectedIndex, onPalaceClick, basePalaces } = result;
    
    // 连线功能状态
    const [selectedPalaceIndex, setSelectedPalaceIndex] = useState<number | null>(null);
    const [connectedPalaces, setConnectedPalaces] = useState<number[]>([]);

    const chartPalaces = CHART_BRANCH_ORDER.map((branch, index) => {
        const dynamicData = palaces?.find(p => p.branch === branch);
        return {
            id: index + 1, // Assign a unique key
            style: gridPositions[index],
            ...dynamicData
        }
    });

    // 处理宫位点击 - 既调用原有的onPalaceClick，也处理连线逻辑
    const handlePalaceClick = (palace: any, palaceIndex: number) => {
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

    // 生成连线路径 (包含三合宫互相连线)
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
        
        // 2. 三合宫之间的互相连线 (如寅午戌三合，需要午戌之间的连线)
        const tripleHarmonyPalaces = getTripleHarmonyPalaces(selectedPalaceIndex);
        if (tripleHarmonyPalaces.length === 2) {
            const [palace1, palace2] = tripleHarmonyPalaces;
            const point1 = getPalaceConnectionPoint(palace1);
            const point2 = getPalaceConnectionPoint(palace2);
            lines.push(createConnectionLine(point1, point2, `harmony-${palace1}-${palace2}`));
        }
        
        return lines;
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
    
    // 创建单条连线 (纯虚线，无箭头)
    const createConnectionLine = (startPoint: {x: number, y: number}, endPoint: {x: number, y: number}, key: string): React.JSX.Element => {
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

    return (
        <div className="relative w-full h-full">
            <div className="w-full h-full
                grid grid-cols-[repeat(4,1fr)] grid-rows-[repeat(4,1fr)] gap-0
                min-h-[520px] sm:min-h-[600px] md:min-h-[680px]">
                 {/* Center Palace */}
                <div
                    key={centerPalace.id}
                    className="bg-card flex flex-col p-0 border border-border text-foreground relative"
                    style={centerPalace.style}
                >
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
                        <div className="text-xs sm:text-sm text-muted-foreground space-y-0.5 sm:space-y-1">
                            <p>阴历: {lunarDate}</p>
                            {fiveElementsBureau && <p className="break-words">五行局: {gender === 'male' ? '乾造' : '坤造'} {fiveElementsBureau}</p>}
                            <p>命主: {mingZhu}</p>
                            <p>身主: {shenZhu}</p>
                        </div>
                    </div>
                </div>

                {/* Outer Palaces */}
                {chartPalaces.map((palace, palaceIndex) => {
                    const fullPalaceData = palaces.find(p => p.branch === palace.branch);
                    const isSelected = selectedPalaceIndex === palaceIndex;
                    const isConnected = connectedPalaces.includes(palaceIndex);
                    
                    let borderClass = 'border-border';
                    let bgClass = 'bg-card hover:bg-primary/10';
                    
                    if (isSelected) {
                        borderClass = 'border-purple-500 dark:border-purple-400 border-2';
                        bgClass = 'bg-purple-50 dark:bg-purple-950/20';
                    } else if (isConnected) {
                        borderClass = 'border-purple-300 dark:border-purple-600 border-2';
                        bgClass = 'bg-purple-50 dark:bg-purple-950/20';
                    }
                    
                    return (
                    <div
                        key={palace.id}
                        className={`${bgClass} p-0 border ${borderClass} text-foreground relative cursor-pointer hover:border-primary transition-colors duration-200`}
                        style={palace.style}
                        onClick={() => fullPalaceData && handlePalaceClick(fullPalaceData, palaceIndex)}
                    >
                        <div className="flex flex-col h-full">
                            <div className="flex flex-row flex-wrap gap-x-0 sm:gap-x-0.5 gap-y-0 justify-start items-start p-1 flex-grow">
                                {/* 按传统顺序显示星曜 */}
                                {palace.stars && (() => {
                                    // 1. 十四主星
                                    const mainStars = palace.stars.filter(s => s.type === '主星');
                                    
                                    // 2. 左右昌曲 
                                    const zuoyouchangqu = palace.stars.filter(s => 
                                        ['左辅', '右弼', '文昌', '文曲'].includes(s.name)
                                    );
                                    
                                    // 3. 禄存、天马、天钺、天魁
                                    const lucunGroup = palace.stars.filter(s => 
                                        ['禄存', '天马', '天钺', '天魁'].includes(s.name)
                                    );
                                    
                                    // 4. 六煞星
                                    const shaStars = palace.stars.filter(s => 
                                        ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫', '天刑'].includes(s.name)
                                    );
                                    
                                    // 5. 桃花星
                                    const taohuaStars = palace.stars.filter(s => 
                                        ['红鸾', '天喜', '天姚'].includes(s.name)
                                    );
                                    
                                    // 按顺序合并所有星曜
                                    const orderedStars = [
                                        ...mainStars,
                                        ...zuoyouchangqu,
                                        ...lucunGroup,
                                        ...shaStars,
                                        ...taohuaStars
                                    ];
                                    
                                    return orderedStars.map((star: StarData) => {
                                        const isMainStar = star.type === '主星';
                                        const isZuoyouchangqu = ['左辅', '右弼', '文昌', '文曲'].includes(star.name);
                                        const isLucunGroup = ['禄存', '天马', '天钺', '天魁'].includes(star.name);
                                        const isLiushaStar = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫', '天刑'].includes(star.name);
                                        const isPeachBlossom = ['红鸾', '天喜', '天姚'].includes(star.name);
                                        
                                        // 设置颜色
                                        const starColor = isMainStar
                                            ? 'text-primary'
                                            : isZuoyouchangqu || isLucunGroup
                                            ? 'text-red-500'
                                            : isPeachBlossom 
                                            ? 'text-pink-500' 
                                            : isLiushaStar
                                            ? 'text-gray-500'
                                            : 'text-accent';
                                            
                                        // 设置字体大小
                                        const starSize = isMainStar
                                            ? 'text-xs sm:text-base'
                                            : isZuoyouchangqu || isLucunGroup
                                            ? 'text-xs sm:text-[0.8125rem]'
                                            : 'text-xs sm:text-sm';
                                        
                                        const fontWeight = isMainStar ? 'font-semibold' : 'font-medium';
                                 
                                        return (
                                            <div key={star.name} className={`flex flex-col items-center ${starSize} ${fontWeight} leading-tight ${starColor} h-12 sm:h-14 justify-start`}>
                                                <div className="flex flex-col items-center">
                                                    {star.name.split('').map((char: string, i: number) => (
                                                        <span key={i} className="h-4 flex items-center">{char}</span>
                                                    ))}
                                                </div>
                                                <span className={`text-gray-500 h-3 sm:h-3 flex items-center mt-0.5 sm:mt-0.5 ${isMainStar ? 'text-xs sm:text-sm' : 'text-xs sm:text-xs'}`}>{star.brightness}</span>
                                                <div className="flex flex-col items-center h-5 justify-start">
                                                    {star.sihua && (
                                                        <span className={`text-red-500 font-bold font-serif h-4 flex items-center ${isMainStar ? 'text-xs sm:text-base' : 'text-xs sm:text-sm'}`}>{star.sihua}</span>
                                                    )}
                                                    {star.palaceHua && star.palaceHua.length > 0 && (
                                                        <div className="flex flex-col items-center">
                                                            {star.palaceHua.map((hua: string, index: number) => (
                                                                <span key={index} className={`text-orange-500 font-semibold font-sans leading-none ${isMainStar ? 'text-[10px] sm:text-sm' : 'text-[10px] sm:text-xs'}`}>
                                                                    {hua}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm leading-tight px-1 pb-1 mt-auto">
                                <div className="text-center text-foreground flex flex-col justify-end">
                                    <div className="leading-tight">{palace.heavenlyStem}</div>
                                    <div className="leading-tight">{palace.branch}</div>
                                </div>
                                <div className="text-center text-muted-foreground text-xs sm:text-sm flex-shrink min-w-0 flex flex-col justify-end">
                                    {/* 第一行：流年宫位名称 (流X) */}
                                    <div className="h-3 sm:h-4 overflow-hidden">
                                        {palace.yearlyName && palace.yearlyName.startsWith('流') && (
                                            <span className="font-semibold text-xs sm:text-sm block truncate">{palace.yearlyName}</span>
                                        )}
                                    </div>
                                    
                                    {/* 第二行：大运宫位名称 (大X) 或年份年龄信息 */}
                                    <div className="font-semibold h-auto text-xs sm:text-sm overflow-hidden">
                                        {palace.yearlyName && palace.yearlyName.startsWith('大') && palace.yearlyLuck?.flowName ? (
                                            // 同时选中大运和流年：显示流月、流年、大运
                                            <div className="flex flex-col">
                                                {palace.lunarMonth && (
                                                    <span className="block truncate text-green-600">{palace.lunarMonth}</span>
                                                )}
                                                <span className="block truncate text-blue-600">{palace.yearlyLuck.flowName}</span>
                                                <span className="block truncate">{palace.yearlyName}</span>
                                            </div>
                                        ) : palace.yearlyName && palace.yearlyName.startsWith('大') ? (
                                            // 只选中大运：显示大命和年份年龄
                                            <div className="flex flex-col">
                                                <span className="block truncate">{palace.yearlyName}</span>
                                                {palace.yearlyLuck && (
                                                    <span className="block truncate text-gray-600">
                                                        {`${palace.yearlyLuck.year} ${palace.yearlyLuck.age}岁`}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            // 未选中：只显示年岁范围
                                            <span className="block truncate">{palace.decade}</span>
                                        )}
                                    </div>
                                    
                                    {/* 第三行：年龄范围 (xx-xx) */}
                                    <div className="h-auto overflow-hidden">
                                        {/* 右侧不再显示年份年龄，因为已经在左侧显示 */}
                                    </div>
                                </div>
                                <div className="text-center text-secondary-foreground flex flex-col justify-end items-center flex-shrink-0">
                                   <div className="flex flex-col items-center">
                                     {palace.isShenGong && (
                                          <Badge variant="default" className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center p-0 mb-0.5 text-xs sm:text-sm">身</Badge>
                                     )}
                                     {palace.isLaiYinPalace && (
                                          <Badge variant="destructive" className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center p-0 mb-0.5 text-xs sm:text-sm">来</Badge>
                                     )}
                                   </div>
                                   <div className="flex flex-col items-center">
                                     {basePalaces.find(p => p.branch === palace.branch)?.name.split('').map((char: string, i: number) => (
                                          <div key={i} className="text-xs sm:text-sm leading-tight">{char}</div>
                                      ))}
                                   </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )})}
            </div>
            
            {/* SVG 连线层 */}
            <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                {generateConnectionLines()}
            </svg>
            

        </div>
    );
} 