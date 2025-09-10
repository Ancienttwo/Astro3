import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, Compass, Calendar, Info, Lightbulb } from 'lucide-react';
import type { ZiweiResult, PalaceData } from '@/stores/ziwei-store';
import { useZiweiSelectors } from '@/stores/ziwei-store';

interface ZiweiInfoCardsProps {
  result: ZiweiResult;
  showEducationalInfo?: boolean;
  onEducationalToggle?: () => void;
}

// 五行局说明
const BUREAU_DESCRIPTIONS = {
  '水二局': '水性聪明，善变通，但易波动不定',
  '木三局': '木性仁慈，有创造力，但易固执',
  '金四局': '金性刚强，有决断力，但易急躁',
  '土五局': '土性厚重，稳重踏实，但易保守',
  '火六局': '火性热情，积极进取，但易急躁'
};

// 命主身主说明
const MASTER_DESCRIPTIONS = {
  '贪狼': '机智聪明，多才多艺，善于交际',
  '巨门': '口才好，适合文教工作，但易口舌是非',
  '禄存': '财运佳，善理财，为人厚道',
  '文曲': '聪明好学，文采出众，适合文化工作',
  '廉贞': '性格刚烈，有正义感，适合执法工作',
  '武曲': '意志坚强，有领导才能，适合武职',
  '破军': '勇于开创，但易破坏现状，变动较大',
  '文昌': '文采出众，学习能力强，适合教育文化',
  '天机': '机智敏捷，善于谋略，但易多虑',
  '天相': '为人忠厚，有辅佐才能，人际关系好',
  '天梁': '有长者风范，善于调解，德高望重',
  '天同': '性格温和，享受生活，但易安逸',
  '火星': '性格急躁，行动力强，但易冲动',
  '铃星': '内敛深沉，有韧性，但易孤独'
};

function InfoCard({ title, icon: Icon, children, className = "" }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`bg-white dark:bg-slate-800 border border-purple-200 dark:border-amber-400/30 shadow-sm ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-amber-400">
          <Icon className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
}

export function ZiweiInfoCards({ result, showEducationalInfo = false, onEducationalToggle }: ZiweiInfoCardsProps) {
  const { selectedDecadeIndex, selectedYearlyIndex } = useZiweiSelectors();
  
  // 获取当前选中的大运
  const currentDecade = selectedDecadeIndex !== null ? result.decadePalaces[selectedDecadeIndex] : null;
  
  // 获取命宫信息
  const lifePalace = result.palaces.find(p => p.name === '命宫');
  
  return (
    <div className="ziwei-info-cards space-y-4">
      {/* 基本信息卡片 */}
      <InfoCard title="基本信息" icon={Info}>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">农历：</span>
              <span className="font-mono text-purple-600 dark:text-amber-400">{result.lunarDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">性别：</span>
              <span className="font-medium">{result.gender === 'male' ? '男' : '女'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">五行局：</span>
              <Badge variant="outline" className="border-purple-300 dark:border-amber-400/50 text-purple-600 dark:text-amber-400">
                {result.fiveElementsBureau}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">年干：</span>
              <span className="font-mono text-purple-600 dark:text-amber-400">{result.yearGan}</span>
            </div>
          </div>
          
          {showEducationalInfo && result.fiveElementsBureau && (
            <div className="mt-3 p-3 bg-purple-50 dark:bg-slate-700/50 rounded-lg border border-purple-200 dark:border-amber-400/30">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">五行局特质：</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {BUREAU_DESCRIPTIONS[result.fiveElementsBureau as keyof typeof BUREAU_DESCRIPTIONS] || '五行局特质说明'}
              </div>
            </div>
          )}
        </div>
      </InfoCard>

      {/* 命主身主卡片 */}
      <InfoCard title="命主身主" icon={Crown}>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-3 h-3 text-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">命主：</span>
              </div>
              <Badge variant="outline" className="border-red-300 dark:border-red-500 text-red-600 dark:text-red-400 w-fit">
                {result.mingZhu}
              </Badge>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-3 h-3 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">身主：</span>
              </div>
              <Badge variant="outline" className="border-blue-300 dark:border-blue-500 text-blue-600 dark:text-blue-400 w-fit">
                {result.shenZhu}
              </Badge>
            </div>
          </div>
          
          {showEducationalInfo && (
            <div className="mt-3 space-y-2">
              <div className="p-3 bg-red-50 dark:bg-slate-700/50 rounded-lg border border-red-200 dark:border-red-500/30">
                <div className="text-xs text-red-600 dark:text-red-400 mb-1 font-semibold">命主特质：</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {MASTER_DESCRIPTIONS[result.mingZhu as keyof typeof MASTER_DESCRIPTIONS] || '命主特质说明'}
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-slate-700/50 rounded-lg border border-blue-200 dark:border-blue-500/30">
                <div className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-semibold">身主特质：</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {MASTER_DESCRIPTIONS[result.shenZhu as keyof typeof MASTER_DESCRIPTIONS] || '身主特质说明'}
                </div>
              </div>
            </div>
          )}
        </div>
      </InfoCard>

      {/* 命宫信息卡片 */}
      {lifePalace && (
        <InfoCard title="命宫信息" icon={Compass}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">宫位：</span>
                <span className="font-mono text-purple-600 dark:text-amber-400">
                  {lifePalace.heavenlyStem}{lifePalace.branch}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">大运：</span>
                <span className="font-medium">{lifePalace.decade || '未定'}</span>
              </div>
            </div>
            
            {lifePalace.stars && lifePalace.stars.length > 0 && (
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">主要星曜：</div>
                <div className="flex flex-wrap gap-1">
                  {lifePalace.stars.slice(0, 6).map((star, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs border-purple-300 dark:border-amber-400/50 text-purple-600 dark:text-amber-400"
                    >
                      {star.name}
                      {star.sihua && (
                        <span className="ml-1 text-red-500">
                          {star.sihua === 'A' ? '禄' : star.sihua === 'B' ? '权' : star.sihua === 'C' ? '科' : '忌'}
                        </span>
                      )}
                    </Badge>
                  ))}
                  {lifePalace.stars.length > 6 && (
                    <Badge variant="outline" className="text-xs text-gray-500">
                      +{lifePalace.stars.length - 6}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </InfoCard>
      )}

      {/* 生年四化卡片 */}
      {result.sihuaInfo && (
        <InfoCard title="生年四化" icon={Star}>
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-green-600 dark:text-green-400 font-semibold">化禄：</span>
                <span className="font-mono text-green-600 dark:text-green-400">{result.sihuaInfo.lu}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600 dark:text-red-400 font-semibold">化权：</span>
                <span className="font-mono text-red-600 dark:text-red-400">{result.sihuaInfo.quan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">化科：</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{result.sihuaInfo.ke}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-600 dark:text-orange-400 font-semibold">化忌：</span>
                <span className="font-mono text-orange-600 dark:text-orange-400">{result.sihuaInfo.ji}</span>
              </div>
            </div>
            
            {showEducationalInfo && (
              <div className="mt-3 p-3 bg-purple-50 dark:bg-slate-700/50 rounded-lg border border-purple-200 dark:border-amber-400/30">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">四化含义：</div>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <div><span className="text-green-600 dark:text-green-400 font-semibold">禄</span> - 财富、福气、顺利</div>
                  <div><span className="text-red-600 dark:text-red-400 font-semibold">权</span> - 权力、能力、主导</div>
                  <div><span className="text-blue-600 dark:text-blue-400 font-semibold">科</span> - 名声、考试、文书</div>
                  <div><span className="text-orange-600 dark:text-orange-400 font-semibold">忌</span> - 阻碍、波折、困扰</div>
                </div>
              </div>
            )}
          </div>
        </InfoCard>
      )}

      {/* 大运信息卡片 */}
      {currentDecade && (
        <InfoCard title="当前大运" icon={Calendar}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">运限：</span>
                <span className="font-medium text-purple-600 dark:text-amber-400">{currentDecade.decade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">宫位：</span>
                <span className="font-mono text-purple-600 dark:text-amber-400">
                  {currentDecade.heavenlyStem}{currentDecade.branch}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">大运宫：</span>
              <Badge variant="outline" className="border-purple-300 dark:border-amber-400/50 text-purple-600 dark:text-amber-400">
                {currentDecade.name}
              </Badge>
            </div>
            
            {currentDecade.stars && currentDecade.stars.length > 0 && (
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">大运星曜：</div>
                <div className="flex flex-wrap gap-1">
                  {currentDecade.stars.slice(0, 4).map((star, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs border-indigo-300 dark:border-indigo-400/50 text-indigo-600 dark:text-indigo-400"
                    >
                      {star.name}
                    </Badge>
                  ))}
                  {currentDecade.stars.length > 4 && (
                    <Badge variant="outline" className="text-xs text-gray-500">
                      +{currentDecade.stars.length - 4}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </InfoCard>
      )}

      {/* 科普信息开关 */}
      {onEducationalToggle && (
        <Card className="bg-gradient-to-r from-purple-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 border border-purple-200 dark:border-amber-400/30">
          <CardContent className="p-4">
            <button
              onClick={onEducationalToggle}
              className="flex items-center gap-2 text-sm text-purple-600 dark:text-amber-400 hover:text-purple-700 dark:hover:text-amber-300 transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              <span>{showEducationalInfo ? '隐藏' : '显示'}科普信息</span>
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 