import React from 'react';
import { Badge } from "@/components/ui/badge";
import { PalaceData } from '@/app/ziwei/types';

interface StarData {
  name: string;
  type: string;
  brightness?: string;
  sihua?: 'A' | 'B' | 'C' | 'D';
  palaceHua?: string[];
}

interface PalaceCardProps {
  palace: PalaceData;
  palaceIndex: number;
  isSelected: boolean;
  isConnected: boolean;
  basePalaces: PalaceData[];
  onClick: (palace: PalaceData, palaceIndex: number) => void;
  style?: React.CSSProperties;
}

const PalaceCard: React.FC<PalaceCardProps> = ({
  palace,
  palaceIndex,
  isSelected,
  isConnected,
  basePalaces,
  onClick,
  style
}) => {
  // 设置边框和背景样式
  let borderClass = 'border-border';
  let bgClass = 'bg-card hover:bg-primary/10';
  
  if (isSelected) {
    borderClass = 'border-purple-500 dark:border-purple-400 border-2';
    bgClass = 'bg-purple-50 dark:bg-purple-950/20';
  } else if (isConnected) {
    borderClass = 'border-purple-300 dark:border-purple-600 border-2';
    bgClass = 'bg-purple-50 dark:bg-purple-950/20';
  }

  // 按传统顺序排列星曜
  const getOrderedStars = (stars: StarData[]) => {
    // 1. 十四主星
    const mainStars = stars.filter(s => s.type === '主星');
    
    // 2. 左右昌曲 
    const zuoyouchangqu = stars.filter(s => 
      ['左辅', '右弼', '文昌', '文曲'].includes(s.name)
    );
    
    // 3. 禄存、天马、天钺、天魁
    const lucunGroup = stars.filter(s => 
      ['禄存', '天马', '天钺', '天魁'].includes(s.name)
    );
    
    // 4. 六煞星
    const shaStars = stars.filter(s => 
      ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫', '天刑'].includes(s.name)
    );
    
    // 5. 桃花星
    const taohuaStars = stars.filter(s => 
      ['红鸾', '天喜', '天姚'].includes(s.name)
    );
    
    // 按顺序合并所有星曜
    return [
      ...mainStars,
      ...zuoyouchangqu,
      ...lucunGroup,
      ...shaStars,
      ...taohuaStars
    ];
  };

  // 渲染单个星曜
  const renderStar = (star: StarData) => {
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
        <span className={`text-gray-500 h-3 sm:h-3 flex items-center mt-0.5 sm:mt-0.5 ${isMainStar ? 'text-xs sm:text-sm' : 'text-xs sm:text-xs'}`}>
          {star.brightness}
        </span>
        <div className="flex flex-col items-center h-5 justify-start">
          {star.sihua && (
            <span className={`text-red-500 font-bold font-serif h-4 flex items-center ${isMainStar ? 'text-xs sm:text-base' : 'text-xs sm:text-sm'}`}>
              {star.sihua}
            </span>
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
  };

  return (
    <div
      className={`${bgClass} p-1 sm:p-2 border ${borderClass} text-foreground relative cursor-pointer hover:border-primary transition-colors duration-200`}
      style={style}
      onClick={() => onClick(palace, palaceIndex)}
    >
      {/* 星曜显示区域 */}
      <div className="flex flex-row flex-wrap gap-x-0 sm:gap-x-0.5 gap-y-0 justify-start items-start">
        {palace.stars && getOrderedStars(palace.stars).map(renderStar)}
      </div>

      {/* 底部信息区域 */}
      <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2 flex justify-between text-xs sm:text-sm leading-tight">
        {/* 天干地支 */}
        <div className="text-center text-foreground flex flex-col justify-end">
          <div className="leading-tight">{palace.heavenlyStem}</div>
          <div className="leading-tight">{palace.branch}</div>
        </div>

        {/* 大运流年信息 */}
        <div className="text-center text-muted-foreground text-xs sm:text-sm flex-shrink min-w-0 flex flex-col justify-end">
          {/* 第一行：流年宫位名称 (流X) */}
          <div className="h-3 sm:h-4 overflow-hidden">
            {palace.yearlyName && palace.yearlyName.startsWith('流') && (
              <span className="font-semibold text-xs sm:text-sm block truncate">{palace.yearlyName}</span>
            )}
          </div>
          
          {/* 第二行：大运宫位名称 (大X) 或年份年龄信息 */}
          <div className="font-semibold h-3 sm:h-4 text-xs sm:text-sm overflow-hidden">
            {palace.yearlyName && palace.yearlyName.startsWith('大') ? (
              // 显示大运宫位名称
              <span className="block truncate">{palace.yearlyName}</span>
            ) : palace.yearlyLuck ? (
              // 显示年份年龄
              <span className="text-xs sm:text-sm block whitespace-nowrap">
                <span className="hidden sm:inline">{palace.yearlyLuck.year} {palace.yearlyLuck.age}岁</span>
                <span className="sm:hidden">{palace.yearlyLuck.age}岁</span>
              </span>
            ) : null}
          </div>
          
          {/* 第三行：年龄范围 (xx-xx) */}
          <div className="text-xs sm:text-sm truncate">{palace.decade}</div>
        </div>

        {/* 宫位标识 */}
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
  );
};

export default PalaceCard; 