"use client";

import React, { useState } from 'react';
import { getElement } from '@/lib/zodiac/elements';
import { tianganPersonalities } from '@/lib/data/tiangan-personalities';
import { tianganPersonalitiesEn } from '@/lib/data/tiangan-personalities-en';
import type { HeavenlyStem } from '@/lib/zodiac/stems';
import { ChevronDown, ChevronUp, Lightbulb, User } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useI18n } from '@/lib/i18n/useI18n';

interface DayMasterAnalysisProps {
  dayMasterStem: string;
  gender: 'male' | 'female';
}

const getElementColor = (element: string | undefined): string => {
  if (!element) return 'text-muted-foreground dark:text-slate-400';
  switch (element) {
    case '木': return 'text-emerald-500 dark:text-emerald-400';
    case '火': return 'text-rose-500 dark:text-rose-400';
    case '土': return 'text-amber-700 dark:text-stone-400';
    case '金': return 'text-yellow-600 dark:text-yellow-400';
    case '水': return 'text-sky-500 dark:text-sky-400';
    default: return 'text-muted-foreground dark:text-slate-400';
  }
};

const DayMasterAnalysis: React.FC<DayMasterAnalysisProps> = ({ dayMasterStem, gender }) => {
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const { dict, isEnglish } = useI18n();
  const personality = dayMasterStem ? (isEnglish ? tianganPersonalitiesEn[dayMasterStem] : tianganPersonalities[dayMasterStem]) : null;
  
  // 格式化五行元素显示（中文+拼音+英文）
  const formatElement = (stem: string): string => {
    const elementMap: { [key: string]: string } = {
      '甲': isEnglish ? '甲(Jia, Yang Wood)' : '甲(阳木)',
      '乙': isEnglish ? '乙(Yi, Yin Wood)' : '乙(阴木)',
      '丙': isEnglish ? '丙(Bing, Yang Fire)' : '丙(阳火)',
      '丁': isEnglish ? '丁(Ding, Yin Fire)' : '丁(阴火)',
      '戊': isEnglish ? '戊(Wu, Yang Earth)' : '戊(阳土)',
      '己': isEnglish ? '己(Ji, Yin Earth)' : '己(阴土)',
      '庚': isEnglish ? '庚(Geng, Yang Metal)' : '庚(阳金)',
      '辛': isEnglish ? '辛(Xin, Yin Metal)' : '辛(阴金)',
      '壬': isEnglish ? '壬(Ren, Yang Water)' : '壬(阳水)',
      '癸': isEnglish ? '癸(Gui, Yin Water)' : '癸(阴水)'
    };
    return elementMap[stem] || stem;
  };
  
  if (!personality) {
    return <div className="text-center py-8 text-gray-500">
      {isEnglish ? 'Unable to retrieve Day Master information' : '无法获取日主信息'}
    </div>;
  }

  // 获取简介内容（显示在科普和主区域之间）
  const getIntroContent = () => {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <User className="w-6 h-6 text-orange-500" />
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {isEnglish ? 'What is Day Master Five Elements?' : '什么是日主五行？'}
          </h4>
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            {isEnglish 
              ? 'Day Master is the core of BaZi chart, representing the personality traits and life attitude of the chart owner.'
              : '日主是八字命盘的核心，代表命主本人的性格特质和人生态度。'
            }
          </p>
        </div>
      </div>
    );
  };

  // 获取知识科普内容（详细内容）
  const getKnowledgeContent = () => {
    return (
      <div className="space-y-4">
        {/* 日主五行的含义 */}
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {isEnglish 
            ? 'Day Master (Day Element, Day Stem) is the Heavenly Stem of the birth day in BaZi Four Pillars, representing the chart owner. It is the central point of the entire BaZi analysis, with all other stems and branches judged for fortune and misfortune around the Day Master. The Five Elements attribute of the Day Master determines a person\'s basic personality characteristics.'
            : '日主（日元、日干）是八字四柱中出生日天干，代表命主本人。它是整个八字分析的中心点，所有其他干支都围绕日主来判断吉凶祸福。日主的五行属性决定了一个人的基本性格特征。'
          }
        </p>
        
        {/* 天干特性解析 */}
        <div className="space-y-3">
          <div className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 border border-gray-300 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-lg">🌟</span>
                </div>
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {isEnglish ? 'Yin-Yang Attribute' : '阴阳属性'}
                </h5>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {isEnglish ? (
                    <>
                      {['甲', '丙', '戊', '庚', '壬'].includes(dayMasterStem) ? 'Yang Stem' : 'Yin Stem'} traits: 
                      {['甲', '丙', '戊', '庚', '壬'].includes(dayMasterStem) 
                        ? ' Active, extroverted, strong, progressive' 
                        : ' Introverted, gentle, flexible, delicate'}
                    </>
                  ) : (
                    <>
                      {['甲', '丙', '戊', '庚', '壬'].includes(dayMasterStem) ? '阳干' : '阴干'}特质：
                      {['甲', '丙', '戊', '庚', '壬'].includes(dayMasterStem) 
                        ? '主动、外向、刚强、进取' 
                        : '内敛、温和、柔韧、细腻'}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 border border-gray-300 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-lg">⚡</span>
                </div>
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {isEnglish ? 'Five Elements Energy' : '五行能量'}
                </h5>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {isEnglish 
                    ? `${getElement(dayMasterStem as HeavenlyStem)} element energy: Influences personality tendencies, career choices, interpersonal relationships, and all aspects of life`
                    : `${getElement(dayMasterStem as HeavenlyStem)}行能量：影响性格倾向、职业选择、人际关系等人生各个方面`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 应用价值 */}
        <div className="bg-gray-100/50 dark:bg-gray-800/50 rounded-md p-3 border border-gray-300/50 dark:border-gray-700/50">
          <p className="text-xs text-gray-700 dark:text-gray-300 italic">
            {isEnglish 
              ? '💡 Understanding Day Master characteristics helps: Recognize self-nature, choose suitable development directions, improve interpersonal relationships, find life balance.'
              : '💡 了解日主特性有助于：认识自我本性、选择适合的发展方向、改善人际关系、找到人生平衡点。'
            }
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-3">
        {isEnglish ? 'Day Master Five Elements' : '日主五行'}
      </h3>
      
      <div className="space-y-3">
        {/* 知识科普 - 可折叠 */}
        <Collapsible open={isKnowledgeOpen} onOpenChange={setIsKnowledgeOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {isEnglish ? 'Knowledge' : '科普知识'}
                </span>
              </div>
              {isKnowledgeOpen ? 
                <ChevronUp className="w-4 h-4 text-orange-500" /> : 
                <ChevronDown className="w-4 h-4 text-orange-500" />
              }
            </div>
          </CollapsibleTrigger>
                      <CollapsibleContent className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 border-t-0">
            {getKnowledgeContent()}
          </CollapsibleContent>
        </Collapsible>

        {/* 简介内容 */}
        {getIntroContent()}

        {/* 日主信息展示 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
          {/* 基础日主信息 */}
          <div className="text-center mb-4">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              {isEnglish ? 'Your Day Master: ' : '你的日主: '}
              <span className={`font-bold text-xl sm:text-2xl ${getElementColor(getElement(dayMasterStem as HeavenlyStem))}`}>
                {formatElement(dayMasterStem)}
              </span>
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {isEnglish 
                ? 'Day Master represents the core of you, the center of the entire BaZi chart'
                : '日主代表了最核心的你，是整个八字命盘的中心'
              }
            </p>
          </div>
          
          {/* 天干性格信息 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl sm:text-3xl">{personality.emoji}</span>
              <h4 className="text-base sm:text-lg font-bold">
                {personality.title}
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mb-2">
                  {isEnglish ? 'Symbol: ' : '象征：'}{personality.symbol}
                </p>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 italic">
                  🎋 {personality.humanImage}
                </p>
              </div>
              
              {/* 滴天髓诗句 - 保持原文不翻译 */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1">
                  <span>📜</span> 滴天髓
                  {isEnglish && <span className="text-xs text-gray-500 ml-1">(Classic Text)</span>}
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {personality.ditiansuiVerse}
                </p>
              </div>
            </div>
          </div>

          {/* 核心特质与相处建议 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* 核心特质 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1">
                <span>⭐</span> {isEnglish ? 'Core Traits' : '核心特质'}
              </h5>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {personality.traits.map((trait, index) => {
                  const element = getElement(dayMasterStem as HeavenlyStem);
                  const colorClass = (() => {
                    switch (element) {
                      case '木': return 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-500';
                      case '火': return 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-500';
                      case '土': return 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-500';
                      case '金': return 'border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-500';
                      case '水': return 'border-sky-400 bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-500';
                      default: return 'border-gray-300 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
                    }
                  })();
                  
                  return (
                    <span 
                      key={index}
                      className={`px-2 py-1 text-xs rounded-full border-2 ${colorClass}`}
                    >
                      {trait}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* 相处建议 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1">
                <span>💡</span> {isEnglish ? 'Relationship Advice' : '相处建议'}
              </h5>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                {personality.advice}
              </p>
            </div>
          </div>

          {/* 性格描述 */}
          <div className="bg-white dark:bg-slate-800/60 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-slate-600 mt-4">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1">
              <span>💭</span> {isEnglish ? 'Personality Description' : '性格描述'}
            </h5>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              {personality.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayMasterAnalysis; 