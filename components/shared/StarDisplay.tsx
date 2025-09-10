import React from 'react';
import { StarData } from '@/app/ziwei/page';

interface StarDisplayProps {
  stars: StarData[];
  size?: 'small' | 'medium' | 'large';
  showBrightness?: boolean;
  showSihua?: boolean;
  className?: string;
}

interface StarItemProps {
  star: StarData;
  size: 'small' | 'medium' | 'large';
  showBrightness: boolean;
  showSihua: boolean;
}

const StarItem: React.FC<StarItemProps> = ({ star, size, showBrightness, showSihua }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-1.5 py-0.5 text-xs';
      case 'medium':
        return 'px-2 py-1 text-sm';
      case 'large':
        return 'px-3 py-1.5 text-base';
      default:
        return 'px-2 py-1 text-sm';
    }
  };

  const getStarTypeStyles = () => {
    switch (star.type) {
      case '主星':
        return 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700';
      case '辅星':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case '煞星':
        return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-slate-700/40 text-gray-800 dark:text-slate-300 border-gray-200 dark:border-slate-600';
    }
  };

  const formatSihua = () => {
    const sihuaMarks: string[] = [];
    
    // 生年四化
    if (star.sihua) {
      sihuaMarks.push(star.sihua);
    }
    
    // 自化标记
    if (star.palaceHua && star.palaceHua.length > 0) {
      star.palaceHua.forEach(hua => {
        if (hua.startsWith('i')) {
          sihuaMarks.push(`i${hua.substring(1)}`);
        } else if (hua.startsWith('x')) {
          sihuaMarks.push(`x${hua.substring(1)}`);
        }
      });
    }
    
    return sihuaMarks.join(' ');
  };

  return (
    <span className={`
      inline-block rounded border whitespace-nowrap
      ${getSizeClasses()}
      ${getStarTypeStyles()}
    `}>
      {star.name}
      {showBrightness && star.brightness && `(${star.brightness})`}
      {showSihua && formatSihua() && (
        <span className="ml-1 font-bold text-orange-600 dark:text-orange-400">
          {formatSihua()}
        </span>
      )}
    </span>
  );
};

const StarDisplay: React.FC<StarDisplayProps> = ({
  stars,
  size = 'medium',
  showBrightness = true,
  showSihua = true,
  className = ''
}) => {
  if (!stars || stars.length === 0) {
    return (
      <span className={`text-gray-400 dark:text-slate-400 text-sm ${className}`}>
        无星曜
      </span>
    );
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {stars.map((star, index) => (
        <StarItem
          key={index}
          star={star}
          size={size}
          showBrightness={showBrightness}
          showSihua={showSihua}
        />
      ))}
    </div>
  );
};

export default StarDisplay; 