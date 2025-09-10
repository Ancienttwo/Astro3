"use client";

import { HeavenlyStem } from "@/lib/zodiac/stems";
import { EARTHLY_BRANCHES, EarthlyBranch } from "@/lib/zodiac/branches";
import { FiveElementsBureau } from "@/lib/zodiac/five-elements-bureau";
import { PalaceData } from "@/app/ziwei/page";
import { Badge } from "@/components/ui/badge";

// Extend the star type to include sihua
interface StarWithSihua {
  sihua?: 'A' | 'B' | 'C' | 'D';
  palaceHua?: string[];
}

// Combine with the original star type from PalaceData
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

interface ZiweiChartProps {
    result: ChartResult;
}

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

export default function ZiweiChart({ result }: ZiweiChartProps) {
    const { palaces, lunarDate, fiveElementsBureau, mingZhu, shenZhu, gender, selectedIndex, onPalaceClick, basePalaces } = result;

    const chartPalaces = CHART_BRANCH_ORDER.map((branch, index) => {
        const dynamicData = palaces?.find(p => p.branch === branch);
        return {
            id: index + 1, // Assign a unique key
            style: gridPositions[index],
            ...dynamicData
        }
    });

    return (
        <div className="w-full h-full
            grid grid-cols-[repeat(4,1fr)] grid-rows-[repeat(4,1fr)] gap-0 
            min-h-[480px] sm:min-h-[560px] md:min-h-[640px]">
             {/* Center Palace */}
            <div
                key={centerPalace.id}
                className="bg-card flex flex-col p-1 sm:p-2 border border-border text-foreground relative"
                style={centerPalace.style}
            >
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg sm:text-xl font-bold text-primary">天盘</h3>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 space-y-0.5 sm:space-y-1">
                        <p>阴历: {lunarDate}</p>
                        {fiveElementsBureau && <p className="break-words">五行局: {gender === 'male' ? '乾造' : '坤造'} {fiveElementsBureau}</p>}
                        <p>命主: {mingZhu}</p>
                        <p>身主: {shenZhu}</p>
                    </div>
                </div>
            </div>

            {/* Outer Palaces */}
            {chartPalaces.map((palace) => {
                const fullPalaceData = palaces.find(p => p.branch === palace.branch);
                return (
                <div
                    key={palace.id}
                    className="bg-card p-1 sm:p-2 border border-border text-foreground relative cursor-pointer hover:border-primary hover:bg-primary/10 transition-colors duration-200"
                    style={palace.style}
                    onClick={() => fullPalaceData && onPalaceClick(fullPalaceData)}
                >
                    <div className="flex flex-row flex-wrap gap-x-0 sm:gap-x-0.5 gap-y-0 justify-start items-start">
                        {palace.stars?.filter(s => s.type === '主星').map(star => (
                            <div key={star.name} className="flex flex-col items-center text-xs sm:text-base font-semibold text-primary leading-none h-12 sm:h-14 justify-start">
                                <div className="flex flex-col items-center">
                                    {star.name.split('').map((char, i) => (
                                        <span key={i} className="h-4 flex items-center">{char}</span>
                                    ))}
                                </div>
                                <span className="text-gray-500 text-xs sm:text-sm h-3 sm:h-4 flex items-center mt-0.5 sm:mt-1">{star.brightness}</span>
                                <div className="flex flex-col items-center h-5 justify-start">
                                    {star.sihua && (
                                        <span className="text-red-500 font-bold text-xs sm:text-base font-serif h-4 flex items-center">{star.sihua}</span>
                                    )}
                                    {star.palaceHua && star.palaceHua.length > 0 && (
                                        <div className="flex flex-col items-center">
                                            {star.palaceHua.map((hua, index) => (
                                                <span key={index} className="text-red-500 font-semibold text-[10px] sm:text-sm font-sans leading-none">
                                                    {hua}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                         {palace.stars?.filter(s => s.type !== '主星').map(star => {
                            const isPeachBlossom = ['天喜', '红鸾', '天姚'].includes(star.name);
                            const isSpecialStar = ['文昌', '文曲', '左辅', '右弼'].includes(star.name);
                            const isMaleficStar = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫', '天刑'].includes(star.name);
                            const starColor = isSpecialStar
                                ? 'text-red-500'
                                : isPeachBlossom 
                                ? 'text-pink-500' 
                                : isMaleficStar
                                ? 'text-gray-500'
                                : 'text-accent';
                            const starSize = isSpecialStar ? 'text-xs sm:text-[0.8125rem]' : 'text-xs sm:text-sm';

                            return (
                                <div key={star.name} className={`flex flex-col items-center ${starSize} font-medium leading-tight ${starColor} h-12 sm:h-14 justify-start`}>
                                    <div className="flex flex-col items-center">
                                        {star.name.split('').map((char, i) => (
                                            <span key={i} className="h-4 flex items-center">{char}</span>
                                        ))}
                                    </div>
                                    <span className={`text-gray-500 h-3 sm:h-3 flex items-center mt-0.5 sm:mt-0.5 ${isSpecialStar ? 'text-xs sm:text-xs' : 'text-xs sm:text-xs'}`}>{star.brightness}</span>
                                    <div className="flex flex-col items-center h-5 justify-start">
                                        {star.sihua && (
                                            <span className={`text-red-500 font-bold font-serif h-4 flex items-center ${isSpecialStar ? 'text-xs sm:text-[0.8125rem]' : 'text-xs sm:text-sm'}`}>{star.sihua}</span>
                                        )}
                                        {star.palaceHua && star.palaceHua.length > 0 && (
                                            <div className="flex flex-col items-center">
                                                {star.palaceHua.map((hua, index) => (
                                                    <span key={index} className={`text-red-500 font-semibold font-sans leading-none ${isSpecialStar ? 'text-[10px] sm:text-xs' : 'text-[10px] sm:text-xs'}`}>
                                                        {hua}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                         })}
                    </div>

                    <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2 flex justify-between items-end text-xs sm:text-sm leading-tight">
                        <div className="text-center text-foreground">
                            <div>{palace.heavenlyStem}</div>
                            <div>{palace.branch}</div>
                        </div>
                        <div className="text-center text-muted-foreground text-xs sm:text-sm flex-shrink min-w-0">
                            <div className="h-3 sm:h-4 overflow-hidden">
                                {palace.yearlyName ? (
                                    <span className="font-semibold text-xs sm:text-sm block truncate">{palace.yearlyName}</span>
                                ) : palace.yearlyLuck && (
                                    <span className="text-xs sm:text-sm block whitespace-nowrap">
                                        <span className="hidden sm:inline">{palace.yearlyLuck.year} {palace.yearlyLuck.age}岁</span>
                                        <span className="sm:hidden">{palace.yearlyLuck.age}岁</span>
                                    </span>
                                )}
                            </div>
                            <div className="font-semibold h-3 sm:h-4 text-xs sm:text-sm overflow-hidden">
                                {result.selectedIndex !== null ? (
                                    <span className="block truncate">{palace.name}</span>
                                ) : ''}
                            </div>
                            <div className="text-xs sm:text-sm truncate">{palace.decade}</div>
                        </div>
                        <div className="text-center text-secondary-foreground flex flex-col justify-end items-center flex-shrink-0">
                           {palace.isShenGong && (
                                <Badge variant="default" className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center p-0 mb-0.5 sm:mb-1 text-xs sm:text-sm">身</Badge>
                           )}
                           {palace.isLaiYinPalace && (
                                <Badge variant="destructive" className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center p-0 mb-0.5 sm:mb-1 text-xs sm:text-sm">来</Badge>
                           )}
                           {basePalaces.find(p => p.branch === palace.branch)?.name.split('').map((char, i) => (
                                <div key={i} className="text-xs sm:text-sm">{char}</div>
                            ))}
                        </div>
                    </div>
                </div>
            )})}
        </div>
    );
} 