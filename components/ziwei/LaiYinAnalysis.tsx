import React from 'react';
import { Eye } from 'lucide-react';
import { PalaceData } from '@/app/ziwei/types';
import SciencePopup from '@/components/shared/SciencePopup';
import { useTranslation, useCurrentLocale } from '@/hooks/useI18n';
import { LAI_YIN_DATA } from '@/lib/data/lai-yin-data';
import { LAI_YIN_DATA_EN } from '@/lib/data/lai-yin-data-en';

interface LaiYinAnalysisProps {
  basePalaces: PalaceData[];
  className?: string;
}

const LaiYinAnalysis: React.FC<LaiYinAnalysisProps> = ({ 
  basePalaces, 
  className = ''
}) => {
  const dict = useTranslation();
  const locale = useCurrentLocale();
  const laiYinPalace = basePalaces.find(p => p.isLaiYinPalace);
  
  if (!laiYinPalace) {
    return null;
  }
  
  const palaceName = laiYinPalace.name;
  
  // 根据语言选择数据源
  const laiYinData = locale === 'en' ? LAI_YIN_DATA_EN : LAI_YIN_DATA;
  const laiYinAnalysis = laiYinData[palaceName];
  
  if (!laiYinAnalysis) {
    return null;
  }

  // 创建宫位参考表内容 - 根据语言动态生成
  const getPalaceReferenceContent = () => {
    if (locale === 'en') {
      return [
        ['Self: Personality & Abilities', 'Siblings: Friends & Peers', 'Spouse: Marriage & Love', 'Children: Kids & Creativity', 'Wealth: Money & Values', 'Health: Body & Illness'],
        ['Travel: Journeys & Opportunities', 'Friends: Social & Cooperation', 'Career: Work & Status', 'Property: Home & Family', 'Fortune: Spirituality & Joy', 'Parents: Elders & Authority']
      ];
    } else {
      return [
        ['命宫：个性能力', '兄弟：手足朋友', '夫妻：配偶感情', '子女：子女创意', '财帛：金钱价值', '疾厄：健康疾病'],
        ['迁移：外出贵人', '交友：社交合作', '官禄：事业地位', '田宅：家庭环境', '福德：精神享受', '父母：长辈权威']
      ];
    }
  };

  const palaceReferenceContent = getPalaceReferenceContent();

  const renderScienceContent = () => (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
          {dict.karmaPalace.whatIsKarmaPalace}
        </h4>
        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed pl-4">
          {dict.karmaPalace.whatIsKarmaPalaceDesc}
        </p>
      </div>
      
      <div>
        <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
          {dict.karmaPalace.importanceOfKarmaPalace}
        </h4>
        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed pl-4">
          {dict.karmaPalace.importanceOfKarmaPalaceDesc}
        </p>
      </div>

      <div>
        <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
          {dict.karmaPalace.palaceReference}
        </h4>
        <div className="pl-4 grid grid-cols-1 gap-2 text-xs">
          <div className="space-y-1">
            {palaceReferenceContent[0].map((item, index) => (
              <div key={index} className="text-gray-600 dark:text-slate-400">{item}</div>
            ))}
          </div>
          <div className="space-y-1">
            {palaceReferenceContent[1].map((item, index) => (
              <div key={index} className="text-gray-600 dark:text-slate-400">{item}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-l-2 border-purple-300 pl-4 py-2 bg-white/50 dark:bg-slate-800/50">
        <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed flex items-start gap-2">
          <span className="text-purple-500 mt-0.5">💡</span>
          <span>
            {dict.karmaPalace.palaceReferenceDesc}
          </span>
        </p>
      </div>
    </div>
  );

  // 获取显示的宫位名称
  const getDisplayPalaceName = () => {
    if (locale === 'en') {
      const palaceNameMap: Record<string, string> = {
        '命宫': 'Self Palace',
        '兄弟': 'Siblings Palace',
        '夫妻': 'Spouse Palace',
        '子女': 'Children Palace',
        '财帛': 'Wealth Palace',
        '疾厄': 'Health Palace',
        '迁移': 'Travel Palace',
        '交友': 'Friends Palace',
        '官禄': 'Career Palace',
        '田宅': 'Property Palace',
        '福德': 'Fortune Palace',
        '父母': 'Parents Palace'
      };
      return palaceNameMap[palaceName] || palaceName;
    }
    return palaceName;
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-500" />
          {dict.karmaPalace.title}
        </h3>
      </div>

      {/* 科普知识 */}
      <SciencePopup
        title={dict.karmaPalace.whatIsKarmaPalace}
        content={renderScienceContent()}
        className="mb-6"
      />

      <div className="space-y-4">
        <div className="mt-6 border-l-4 border-purple-500 pl-4 py-2 bg-gray-50 dark:bg-slate-800/50 rounded-r-lg">
          <h5 className="text-md font-semibold text-purple-700 dark:text-purple-400 mb-3">
            {dict.karmaPalace.yourKarmaPalaceIn} {getDisplayPalaceName()}
          </h5>
          <div className="space-y-3">
            {laiYinAnalysis.description.map((desc, index) => (
              <p key={index} className="text-gray-700 dark:text-slate-300 leading-relaxed text-sm">
                {desc}
              </p>
            ))}
            
            <div className="space-y-3 mt-6">
              <div className="py-2 border-b border-gray-100 dark:border-slate-700">
                <h6 className="font-semibold text-purple-600 dark:text-purple-400 text-sm mb-1 flex items-center gap-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  {dict.karmaPalace.peopleAspect}
                </h6>
                <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed ml-6">
                  {laiYinAnalysis.ren}
                </p>
              </div>
              
              <div className="py-2 border-b border-gray-100 dark:border-slate-700">
                <h6 className="font-semibold text-purple-600 dark:text-purple-400 text-sm mb-1 flex items-center gap-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  {dict.karmaPalace.mattersAspect}
                </h6>
                <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed ml-6">
                  {laiYinAnalysis.shi}
                </p>
              </div>
              
              <div className="py-2 border-b border-gray-100 dark:border-slate-700">
                <h6 className="font-semibold text-purple-600 dark:text-purple-400 text-sm mb-1 flex items-center gap-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  {dict.karmaPalace.materialAspect}
                </h6>
                <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed ml-6">
                  {laiYinAnalysis.wu}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaiYinAnalysis; 