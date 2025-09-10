import React from 'react';
import { FiveElementsBureau } from '@/lib/zodiac/five-elements-bureau';

interface CenterPalaceProps {
  lunarDate: string;
  fiveElementsBureau?: FiveElementsBureau;
  mingZhu: string;
  shenZhu: string;
  gender: 'male' | 'female';
  className?: string;
}

const CenterPalace: React.FC<CenterPalaceProps> = ({
  lunarDate,
  fiveElementsBureau,
  mingZhu,
  shenZhu,
  gender,
  className = ''
}) => {
  const centerPalaceStyle = { gridArea: '2 / 2 / 4 / 4' };

  return (
    <div
      className={`bg-card flex flex-col p-1 sm:p-2 border border-border text-foreground relative ${className}`}
      style={centerPalaceStyle}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 space-y-0.5 sm:space-y-1">
          <p>阴历: {lunarDate}</p>
          {fiveElementsBureau && (
            <p className="break-words">
              五行局: {gender === 'male' ? '乾造' : '坤造'} {fiveElementsBureau}
            </p>
          )}
          <p>命主: {mingZhu}</p>
          <p>身主: {shenZhu}</p>
        </div>
      </div>
    </div>
  );
};

export default CenterPalace; 