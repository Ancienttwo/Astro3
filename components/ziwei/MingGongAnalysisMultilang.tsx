import React from 'react';
import { User, Star } from 'lucide-react';
import { PalaceData } from '@/app/ziwei/types';
import SciencePopup from '@/components/shared/SciencePopup';
import { useTranslation, useCurrentLocale } from '@/hooks/useI18n';
import { MAIN_STARS_INTERPRETATIONS } from '@/lib/data/main-stars';
import { MAIN_STARS_INTERPRETATIONS_EN } from '@/lib/data/main-stars-en';
import { MAIN_STARS_INTERPRETATIONS_JA } from '@/lib/data/main-stars-ja';

interface StarData {
  name: string;
  brightness: string;
  type: string;
  sihua?: string;
  palaceHua?: string[];
  xiangXinSihua?: string;
  liXinSihua?: string;
}

const getStarsByType = (stars: StarData[]) => {
  const mainStars = stars.filter(s => s.type === '主星');
  const auxiliaryStars = stars.filter(s => 
    s.type === '辅星' || 
    ['左辅', '右弼', '文昌', '文曲', '天魁', '天钺', '禄存', '天马', '三台', '八座', '恩光', '天贵'].includes(s.name)
  );
  const maleficStars = stars.filter(s => 
    s.type === '煞星' || 
    ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫', '天刑', '孤辰', '寡宿'].includes(s.name)
  );
  
  return { mainStars, auxiliaryStars, maleficStars };
};

const getMainStarInterpretation = (palaces: PalaceData[], locale: string) => {
  const lifePalace = palaces.find(p => p.name === '命宫');
  const mainStars = lifePalace?.stars?.filter(s => s.type === '主星') || [];
  
  if (mainStars.length > 0) {
    const mainStar = mainStars[0];
    let interpretations;
    if (locale === 'en') {
      interpretations = MAIN_STARS_INTERPRETATIONS_EN;
    } else if (locale === 'ja') {
      interpretations = MAIN_STARS_INTERPRETATIONS_JA;
    } else {
      interpretations = MAIN_STARS_INTERPRETATIONS;
    }
    return interpretations[mainStar.name];
  } else {
    const migrationPalace = palaces.find(p => p.name === '迁移');
    const migrationMainStars = migrationPalace?.stars?.filter(s => s.type === '主星') || [];
    
    if (migrationMainStars.length > 0) {
      const mainStar = migrationMainStars[0];
      let interpretations;
      if (locale === 'en') {
        interpretations = MAIN_STARS_INTERPRETATIONS_EN;
      } else if (locale === 'ja') {
        interpretations = MAIN_STARS_INTERPRETATIONS_JA;
      } else {
        interpretations = MAIN_STARS_INTERPRETATIONS;
      }
      return interpretations[mainStar.name];
    }
  }
  
  return null;
};

interface MingGongAnalysisProps {
  palaces: PalaceData[];
  className?: string;
}

const MingGongAnalysisMultilang: React.FC<MingGongAnalysisProps> = ({ palaces, className = '' }) => {
  const dict = useTranslation();
  const locale = useCurrentLocale();
  
  const mingGongPalace = palaces.find(p => p.name === '命宫');
  const qianYiPalace = palaces.find(p => p.name === '迁移');
  
  if (!mingGongPalace || !qianYiPalace) {
    return null;
  }

  const mingGongStars = getStarsByType(mingGongPalace.stars || []);
  const qianYiStars = getStarsByType(qianYiPalace.stars || []);
  const hasMainStarsInMing = mingGongStars.mainStars.length > 0;
  
  const getStarDisplayName = (starName: string) => {
    if (locale === 'en') {
      const starNameMap: Record<string, string> = {
        // Main Stars
        '紫微': dict.ziwei.primaryStars.ziwei,
        '天机': dict.ziwei.primaryStars.tianji,
        '太阳': dict.ziwei.primaryStars.taiyang,
        '武曲': dict.ziwei.primaryStars.wuqu,
        '天同': dict.ziwei.primaryStars.tiantong,
        '廉贞': dict.ziwei.primaryStars.lianzhou,
        '天府': dict.ziwei.primaryStars.tianfu,
        '太阴': dict.ziwei.primaryStars.taiyin,
        '贪狼': dict.ziwei.primaryStars.tanlang,
        '巨门': dict.ziwei.primaryStars.jumen,
        '天相': dict.ziwei.primaryStars.tianxiang,
        '天梁': dict.ziwei.primaryStars.tianliang,
        '七杀': dict.ziwei.primaryStars.qisha,
        '破军': dict.ziwei.primaryStars.pojun,
        // Supporting Stars
        '左辅': dict.ziwei.supportingStars.zuofu,
        '右弼': dict.ziwei.supportingStars.youbi,
        '文昌': dict.ziwei.supportingStars.wenchang,
        '文曲': dict.ziwei.supportingStars.wenqu,
        '天魁': 'Heavenly Leader',
        '天钺': 'Heavenly Halberd',
        '禄存': 'Wealth Storage',
        '天马': 'Heavenly Horse',
        '化禄': 'Transformation of Wealth',
        '化权': 'Transformation of Power',
        '化科': 'Transformation of Fame',
        '化忌': 'Transformation of Adversity',
        // Malefic Stars
        '擎羊': 'Blade',
        '陀罗': 'Spinning Top',
        '火星': 'Fire Star',
        '铃星': 'Bell Star',
        '地空': 'Earthly Void',
        '地劫': 'Earthly Robbery',
        '天刑': 'Heavenly Punishment',
        // Other Stars
        '天喜': 'Heavenly Joy',
        '红鸾': 'Red Phoenix',
        '天姚': 'Heavenly Beauty',
        '咸池': 'Sensual Pool',
        '孤辰': 'Lonely Star',
        '寡宿': 'Widow Star',
        '三台': 'Three Platforms',
        '八座': 'Eight Seats',
        '恩光': 'Gracious Light',
        '天贵': 'Heavenly Noble',
      };
      return starNameMap[starName] || starName;
    }
    return starName;
  };

  const scienceContent = (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
          {locale === 'en' ? 'What is the Life Palace?' : '什么是命宫？'}
        </h4>
        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed pl-4">
          {locale === 'en' 
            ? 'The Life Palace represents innate fortune, the main axis of destiny, and the source of life fortune. It symbolizes multiple aspects and represents both positive and negative personality traits and underlying thought concepts. Wealth, status, appearance, personality, talents, diseases, temperament, characteristics, family background, and even life experiences and keys to success or failure can all be inferred from the Life Palace. It is the center of the entire destiny chart.'
            : '命宫为先天运势、命运的主轴、行运的源头。象征多方面。代表人格的正、负特质与潜在的思想观念。诸如财富、地位、相貌、个性、才能、疾病、脾气、性情、特质、家世等，甚至一生之境遇与成败关键，都可命宫推之，是整个命盘的重心。'
          }
        </p>
        <div className="space-y-2 mt-3 pl-4">
          <div className="border-l-4 border-purple-500 pl-3 py-1">
            <h6 className="font-semibold text-purple-600 dark:text-purple-400 text-xs mb-1">
              {locale === 'en' ? 'People' : '人'}
            </h6>
            <p className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed">
              {locale === 'en' 
                ? 'Myself including personality, talents, orientation, career aptitude, life planning'
                : '我本人含个性、才华、性向、职业适性、生涯规划'
              }
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-3 py-1">
            <h6 className="font-semibold text-purple-600 dark:text-purple-400 text-xs mb-1">
              {locale === 'en' ? 'Events' : '事'}
            </h6>
            <p className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed">
              {locale === 'en' 
                ? 'From the Life Palace we can see the ups and downs of personal fortune, including wealth luck, career luck, health luck, etc.'
                : '从命宫可以看出我这个人运势的起伏荣枯，包括财运、事业运、身体健康运等'
              }
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-3 py-1">
            <h6 className="font-semibold text-purple-600 dark:text-purple-400 text-xs mb-1">
              {locale === 'en' ? 'Material' : '物'}
            </h6>
            <p className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed">
              {locale === 'en' 
                ? 'Material refers to wealth'
                : '物就是财'
              }
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
          {locale === 'en' ? 'What is the Travel Palace?' : '什么是迁移宫？'}
        </h4>
        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed pl-4">
          {locale === 'en' 
            ? 'The Travel Palace represents adaptability to environmental changes, situations and encounters when going out, transportation conditions abroad, and interpersonal relationships. It can also predict encounters during travel, immigration status, whether suitable for foreign investment, or engaging in trade-related businesses. It has a close relationship with the Life Palace. Whether going abroad, traveling, long journeys, or moving, or whether one is destined to leave home, can all be understood through the stars in this palace.'
            : '迁移宫代表对环境改变的适应能力，出外的状况与际遇，在外的交通状况，人际关系。亦可推断旅行中的遭遇。移民状况如何。是否适合对外投资，或者从事与贸易有关的事业。其与命宫有密切关系。举凡出国、旅游、远行或搬家，或者是否离乡背井之命等，都可由本宫星曜去了解。'
          }
        </p>
        <div className="space-y-2 mt-3 pl-4">
          <div className="border-l-4 border-purple-500 pl-3 py-1">
            <h6 className="font-semibold text-purple-600 dark:text-purple-400 text-xs mb-1">
              {locale === 'en' ? 'People' : '人'}
            </h6>
            <p className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed">
              {locale === 'en' 
                ? 'The self revealed to others'
                : '表露在人前的我'
              }
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-3 py-1">
            <h6 className="font-semibold text-purple-600 dark:text-purple-400 text-xs mb-1">
              {locale === 'en' ? 'Events' : '事'}
            </h6>
            <p className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed">
              {locale === 'en' 
                ? 'Represents life opportunities, whether one can encounter benefactors when going out'
                : '代表人生的机遇，出外是否能逢遇贵人'
              }
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-3 py-1">
            <h6 className="font-semibold text-purple-600 dark:text-purple-400 text-xs mb-1">
              {locale === 'en' ? 'Material' : '物'}
            </h6>
            <p className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed">
              {locale === 'en' 
                ? 'Represents the trend of old age fortune and enjoyment of blessings in later years'
                : '代表老运的走势，老运及享福为基'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="w-5 h-5 text-purple-500" />
          {locale === 'en' ? 'My Life Palace' : '我的命宫'}
        </h3>
      </div>

      <SciencePopup
        title={locale === 'en' ? 'Educational Knowledge' : '科普知识'}
        content={scienceContent}
        className="mb-6"
      />

      <div className="space-y-6">
        <div className="border-b border-gray-200 dark:border-slate-600 pb-4">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0 w-3 h-3 bg-purple-500 rounded-full mt-1"></div>
            <div className="text-gray-700 dark:text-slate-300 text-sm space-y-2 ml-6">
              <p>
                {locale === 'en' 
                  ? 'Below are your Life Palace and Travel Palace configurations. The Life Palace represents your core identity, while the Travel Palace represents how the outside world perceives you.'
                  : '以下为你的命宫与迁移宫配置。命宫为您人生之太极位，迁移宫为你在外的气运与外界是怎么看待您的。'
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-b border-gray-200 dark:border-slate-600 pb-4">
          <h5 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            {locale === 'en' ? `Life Palace (${mingGongPalace.branch})` : `命宫 (${mingGongPalace.branch})`}
          </h5>
          
          <div className="space-y-2 w-full ml-6">
            <div className="space-y-3">
              <div className="border-b border-gray-100 dark:border-slate-700 pb-2">
                <h6 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  {locale === 'en' ? 'Main Stars' : '主星'}
                </h6>
                <div className="ml-6">
                  {mingGongStars.mainStars.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {mingGongStars.mainStars.map((star, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs rounded inline-block whitespace-nowrap">
                          {getStarDisplayName(star.name)}({star.brightness})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-slate-400 text-xs">
                      {locale === 'en' ? 'No Main Stars' : '无主星'}
                    </span>
                  )}
                </div>
              </div>
              
              {mingGongStars.auxiliaryStars.length > 0 && (
                <div className="border-b border-gray-100 dark:border-slate-700 pb-2">
                  <h6 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    {locale === 'en' ? 'Supporting Stars' : '辅星'}
                  </h6>
                  <div className="ml-6">
                    <div className="flex flex-wrap gap-1">
                      {mingGongStars.auxiliaryStars.map((star, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded inline-block whitespace-nowrap">
                          {getStarDisplayName(star.name)}({star.brightness})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {mingGongStars.maleficStars.length > 0 && (
                <div className="pb-2">
                  <h6 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    {locale === 'en' ? 'Malefic Stars' : '煞星'}
                  </h6>
                  <div className="ml-6">
                    <div className="flex flex-wrap gap-1">
                      {mingGongStars.maleficStars.map((star, index) => (
                        <span key={index} className="px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded inline-block whitespace-nowrap">
                          {getStarDisplayName(star.name)}({star.brightness})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-slate-600 pb-4">
          <h5 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            {locale === 'en' ? `Travel Palace (${qianYiPalace.branch})` : `迁移宫 (${qianYiPalace.branch})`}
          </h5>
          
          <div className="space-y-2 w-full ml-6">
            <div className="space-y-3">
              <div className="border-b border-gray-100 dark:border-slate-700 pb-2">
                <h6 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  {locale === 'en' ? 'Main Stars' : '主星'}
                </h6>
                <div className="ml-6">
                  {qianYiStars.mainStars.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {qianYiStars.mainStars.map((star, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs rounded inline-block whitespace-nowrap">
                          {getStarDisplayName(star.name)}({star.brightness})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-slate-400 text-xs">
                      {locale === 'en' ? 'No Main Stars' : '无主星'}
                    </span>
                  )}
                </div>
              </div>
              
              {qianYiStars.auxiliaryStars.length > 0 && (
                <div className="border-b border-gray-100 dark:border-slate-700 pb-2">
                  <h6 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    {locale === 'en' ? 'Supporting Stars' : '辅星'}
                  </h6>
                  <div className="ml-6">
                    <div className="flex flex-wrap gap-1">
                      {qianYiStars.auxiliaryStars.map((star, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded inline-block whitespace-nowrap">
                          {getStarDisplayName(star.name)}({star.brightness})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {qianYiStars.maleficStars.length > 0 && (
                <div className="pb-2">
                  <h6 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    {locale === 'en' ? 'Malefic Stars' : '煞星'}
                  </h6>
                  <div className="ml-6">
                    <div className="flex flex-wrap gap-1">
                      {qianYiStars.maleficStars.map((star, index) => (
                        <span key={index} className="px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded inline-block whitespace-nowrap">
                          {getStarDisplayName(star.name)}({star.brightness})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {(() => {
          const starInterpretation = getMainStarInterpretation(palaces, locale);
          
          if (!starInterpretation) {
            return null;
          }
          
          return (
            <div className="mt-6 p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-700/60 dark:to-slate-800/60 rounded-lg border border-amber-200 dark:border-slate-600">
              <h5 className="text-base sm:text-lg font-semibold text-amber-800 dark:text-amber-400 mb-3 flex items-center justify-center">
                <Star className="w-4 h-4 mr-2" />
                {locale === 'en' ? 'My Star Avatar' : '我的主星化身'}
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
                    {locale === 'en' ? `Archetype: ${starInterpretation.character}` : `代表人物：${starInterpretation.character}`}
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

export default MingGongAnalysisMultilang; 