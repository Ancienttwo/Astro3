import React from 'react';
import { PalaceData, StarData, AnalysisType } from '@/app/ziwei/types';
import StarDisplay from './StarDisplay';
import SciencePopup from './SciencePopup';

interface PalaceAnalysisProps {
  palace: PalaceData;
  analysisType: AnalysisType;
  title: string;
  showScience?: boolean;
  scienceContent?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

// 按类型分组星曜的工具函数
const getStarsByType = (stars: StarData[]) => {
  const mainStars = stars.filter(s => s.type === '主星');
  const auxiliaryStars = stars.filter(s => s.type === '辅星');
  const maleficStars = stars.filter(s => s.type === '煞星' || ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫', '天刑'].includes(s.name));
  const peachBlossomStars = stars.filter(s => ['天喜', '红鸾', '天姚'].includes(s.name));
  
  return { mainStars, auxiliaryStars, maleficStars, peachBlossomStars };
};

// 星曜分组显示组件
const StarGroup: React.FC<{ 
  stars: StarData[], 
  title: string, 
  emptyText?: string,
  className?: string 
}> = ({ stars, title, emptyText = '无', className = '' }) => (
  <div className={`py-2 border-b border-gray-100 dark:border-slate-700 ${className}`}>
    <div className="flex items-center justify-between mb-2">
      <h6 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1">
        <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
        {title}
      </h6>
    </div>
    <div className="ml-6">
      {stars.length > 0 ? (
        <StarDisplay stars={stars} size="small" />
      ) : (
        <span className="text-gray-400 dark:text-slate-400 text-xs">{emptyText}</span>
      )}
    </div>
  </div>
);

const PalaceAnalysis: React.FC<PalaceAnalysisProps> = ({
  palace,
  analysisType,
  title,
  showScience = false,
  scienceContent,
  className = '',
  children
}) => {
  const stars = getStarsByType(palace.stars || []);
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* 科普知识 */}
      {showScience && scienceContent && (
        <SciencePopup
          title={`什么是${title}？`}
          content={scienceContent}
          className="mb-4"
        />
      )}
      
      {/* 宫位标题 */}
      <div className="border-b border-gray-200 dark:border-slate-600 pb-4">
        <h5 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
          <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
          {title} ({palace.branch})
        </h5>
        
        {/* 宫位位置信息 */}
        <div className="text-xs text-gray-500 dark:text-slate-400 mb-3">
          {palace.heavenlyStem}{palace.branch}
        </div>
        
        {/* 星曜分组显示 */}
        <div className="space-y-0 w-full ml-6">
          <StarGroup stars={stars.mainStars} title="主星" />
          
          {stars.auxiliaryStars.length > 0 && (
            <StarGroup stars={stars.auxiliaryStars} title="辅星" />
          )}
          
          {stars.maleficStars.length > 0 && (
            <StarGroup stars={stars.maleficStars} title="煞星" />
          )}
          
          {stars.peachBlossomStars.length > 0 && (
            <StarGroup stars={stars.peachBlossomStars} title="桃花星" />
          )}
        </div>
      </div>
      
      {/* 自定义内容 */}
      {children}
    </div>
  );
};

export default PalaceAnalysis; 