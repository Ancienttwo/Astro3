import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { PalaceData, StarData } from '@/app/ziwei/types';
import StarDisplay from '@/components/shared/StarDisplay';
import SciencePopup from '@/components/shared/SciencePopup';
import { MAIN_STARS_INTERPRETATIONS } from '@/lib/data/main-stars';

interface MingGongAnalysisProps {
  palaces: PalaceData[];
  className?: string;
}

// 按类型分组星曜的工具函数
const getStarsByType = (stars: StarData[]) => {
  const mainStars = stars.filter(s => s.type === '主星');
  const auxiliaryStars = stars.filter(s => s.type === '辅星');
  const maleficStars = stars.filter(s => s.type === '煞星' || ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫', '天刑'].includes(s.name));
  const peachBlossomStars = stars.filter(s => ['天喜', '红鸾', '天姚'].includes(s.name));
  
  return { mainStars, auxiliaryStars, maleficStars, peachBlossomStars };
};

// 获取主星解释
const getMainStarInterpretation = (palaces: PalaceData[]) => {
  // 首先查找命宫主星
  const lifePalace = palaces.find(p => p.name === '命宫');
  const mainStars = lifePalace?.stars?.filter(s => s.type === '主星') || [];
  
  if (mainStars.length > 0) {
    // 如果命宫有主星，取第一个主星
    const mainStar = mainStars[0];
    return MAIN_STARS_INTERPRETATIONS[mainStar.name];
  } else {
    // 如果命宫无主星，查找迁移宫主星
    const migrationPalace = palaces.find(p => p.name === '迁移');
    const migrationMainStars = migrationPalace?.stars?.filter(s => s.type === '主星') || [];
    
    if (migrationMainStars.length > 0) {
      const mainStar = migrationMainStars[0];
      return MAIN_STARS_INTERPRETATIONS[mainStar.name];
    }
  }
  
  return null;
};

const MingGongAnalysis: React.FC<MingGongAnalysisProps> = ({ palaces, className = '' }) => {
  const mingGongPalace = palaces.find(p => p.name === '命宫');
  const qianYiPalace = palaces.find(p => p.name === '迁移');
  
  if (!mingGongPalace || !qianYiPalace) {
    return null;
  }

  const mingGongStars = getStarsByType(mingGongPalace.stars || []);
  const qianYiStars = getStarsByType(qianYiPalace.stars || []);
  const hasMainStarsInMing = mingGongStars.mainStars.length > 0;

  const scienceContent = (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
          什么是命宫？
        </h4>
        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed pl-4">
          命宫是紫微斗数中最重要的宫位，代表一个人的基本性格、天赋能力和人生格局。命宫的星曜配置直接影响个人的行为模式和发展潜力。
        </p>
      </div>
      
      <div>
        <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          什么是迁移宫？
        </h4>
        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed pl-4">
          迁移宫代表外出运势、环境变化、与外界的关系，以及他人对你的看法。当命宫无主星时，需要借用迁移宫的主星来判断性格特质。
        </p>
      </div>
    </div>
  );

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Star className="w-5 h-5 text-purple-500" />
          我的命宫
        </h3>
      </div>

      {/* 科普知识 */}
      <SciencePopup
        title="什么是命宫？"
        content={scienceContent}
        className="mb-6"
      />

      <div className="space-y-6">
        {/* 提示信息 */}
        <div className="border-b border-gray-200 dark:border-slate-600 pb-4">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0 w-3 h-3 bg-purple-500 rounded-full mt-1"></div>
            <div className="text-gray-700 dark:text-slate-300 text-sm space-y-2 ml-6">
              {hasMainStarsInMing ? (
                <p>
                  以下为你的命宫与迁移宫配置。命宫为您人生之太极位，迁移宫为你在外的气运与外界是怎么看待您的。
                </p>
              ) : (
                <>
                  <p>
                    您命宫无主星，则借迁移宫主星。迁移宫为你在外的气运与外界是怎么看待您的。
                  </p>
                  <p className="text-sm leading-relaxed pl-4 border-l-2 border-purple-300 bg-gray-50/50 dark:bg-slate-800/30 py-2">
                    <strong>注：</strong>命宫无主星的人，具有高度的适应性和灵活性，他们情感丰富，对环境变化敏感，这使他们能够灵活应对生活中的各种变化。他们的成长过程往往充满动态，这反而培养了强大的环境适应能力和潜力激发特质（遇强则强）。童年时期，由于家庭环境的变化，他们可能与父母相聚的时间相对较少，或随着父母的生活而迁移，这样的经历让他们从小就学会了独立和适应。在健康方面，他们需要更加注重日常的调养和保健，通过积极的生活方式来维持良好的状态。
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* 命宫 */}
          <div className="border-b border-gray-200 dark:border-slate-600 pb-4">
            <h5 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
              命宫 ({mingGongPalace.branch})
            </h5>
            
            <div className="space-y-2 w-full ml-6">
              <div className="space-y-3">
                <div className="border-b border-gray-100 dark:border-slate-700 pb-2">
                  <h6 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    主星
                  </h6>
                  <div className="ml-6">
                    {mingGongStars.mainStars.length > 0 ? (
                      <StarDisplay stars={mingGongStars.mainStars} size="small" />
                    ) : (
                      <span className="text-gray-400 dark:text-slate-400 text-xs">无主星</span>
                    )}
                  </div>
                </div>
                
                {mingGongStars.auxiliaryStars.length > 0 && (
                  <div className="border-b border-gray-100 dark:border-slate-700 pb-2">
                    <h6 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      辅星
                    </h6>
                    <div className="ml-6">
                      <StarDisplay stars={mingGongStars.auxiliaryStars} size="small" />
                    </div>
                  </div>
                )}
                
                {mingGongStars.maleficStars.length > 0 && (
                  <div className="border-b border-gray-100 dark:border-slate-700 pb-2">
                    <h6 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      煞星
                    </h6>
                    <div className="ml-6">
                      <StarDisplay stars={mingGongStars.maleficStars} size="small" />
                    </div>
                  </div>
                )}
                
                {mingGongStars.peachBlossomStars.length > 0 && (
                  <div className="border-b border-gray-100 dark:border-slate-700 pb-2">
                    <h6 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                      <span className="w-3 h-3 bg-pink-500 rounded-full"></span>
                      桃花星
                    </h6>
                    <div className="ml-6">
                      <StarDisplay stars={mingGongStars.peachBlossomStars} size="small" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 迁移宫 */}
          <div className="border-b border-gray-200 dark:border-slate-600 pb-4">
            <h5 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              迁移宫 ({qianYiPalace.branch})
              {!hasMainStarsInMing && qianYiStars.mainStars.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-200 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                  借用
                </span>
              )}
            </h5>
            
            <div className="space-y-2 w-full ml-6">
              <div className="space-y-3">
                <div className="border-b border-gray-100 dark:border-slate-700 pb-2">
                  <h6 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    主星
                  </h6>
                  <div className="ml-6">
                    {qianYiStars.mainStars.length > 0 ? (
                      <StarDisplay stars={qianYiStars.mainStars} size="small" />
                    ) : (
                      <span className="text-gray-400 dark:text-slate-400 text-xs">无主星</span>
                    )}
                  </div>
                </div>
                
                {qianYiStars.auxiliaryStars.length > 0 && (
                  <div className="border-b border-gray-100 dark:border-slate-700 pb-2">
                    <h6 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      辅星
                    </h6>
                    <div className="ml-6">
                      <StarDisplay stars={qianYiStars.auxiliaryStars} size="small" />
                    </div>
                  </div>
                )}
                
                {qianYiStars.maleficStars.length > 0 && (
                  <div className="border-b border-gray-100 dark:border-slate-700 pb-2">
                    <h6 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      煞星
                    </h6>
                    <div className="ml-6">
                      <StarDisplay stars={qianYiStars.maleficStars} size="small" />
                    </div>
                  </div>
                )}
                
                {qianYiStars.peachBlossomStars.length > 0 && (
                  <div className="border-b border-gray-100 dark:border-slate-700 pb-2">
                    <h6 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                      <span className="w-3 h-3 bg-pink-500 rounded-full"></span>
                      桃花星
                    </h6>
                    <div className="ml-6">
                      <StarDisplay stars={qianYiStars.peachBlossomStars} size="small" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* 主星化身解释 */}
        {(() => {
          const starInterpretation = getMainStarInterpretation(palaces);
          
          if (!starInterpretation) {
            return null;
          }
          
          return (
            <div className="mt-6 p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-700/60 dark:to-slate-800/60 rounded-lg border border-amber-200 dark:border-slate-600">
              <h5 className="text-base sm:text-lg font-semibold text-amber-800 dark:text-amber-400 mb-3 flex items-center justify-center">
                <Star className="w-4 h-4 mr-2" />
                我的主星化身
              </h5>
              
              <div className="text-center mb-4">
                <div className="mb-2">
                  <h6 className="text-lg sm:text-xl font-bold text-amber-800 dark:text-amber-300 mb-2">
                    {starInterpretation.name}
                  </h6>
                  <div className="flex justify-center">
                    <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium">
                      {starInterpretation.title}
                    </span>
                  </div>
                </div>
                <div className="flex justify-center items-center mb-3">
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium">
                    代表人物：{starInterpretation.character}
                  </span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-800/60 rounded-lg p-3 sm:p-4 border border-amber-100 dark:border-slate-600">
                <p className="text-gray-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                  {starInterpretation.description}
                </p>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default MingGongAnalysis; 