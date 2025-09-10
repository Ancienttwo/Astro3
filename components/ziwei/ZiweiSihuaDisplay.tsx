import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Info } from 'lucide-react';
import type { PalaceData } from '@/stores/ziwei-store';

// 天干四化规律表
const SIHUA_RULES = {
  '甲': { lu: '廉贞', quan: '破军', ke: '武曲', ji: '太阳' },
  '乙': { lu: '天机', quan: '天梁', ke: '紫微', ji: '太阴' },
  '丙': { lu: '天同', quan: '天机', ke: '文昌', ji: '廉贞' },
  '丁': { lu: '太阴', quan: '天同', ke: '天机', ji: '巨门' },
  '戊': { lu: '贪狼', quan: '太阴', ke: '右弼', ji: '天机' },
  '己': { lu: '武曲', quan: '贪狼', ke: '天梁', ji: '文曲' },
  '庚': { lu: '太阳', quan: '武曲', ke: '太阴', ji: '天同' },
  '辛': { lu: '巨门', quan: '太阳', ke: '文曲', ji: '文昌' },
  '壬': { lu: '天梁', quan: '紫微', ke: '左辅', ji: '武曲' },
  '癸': { lu: '破军', quan: '巨门', ke: '太阴', ji: '贪狼' }
};

// 四化含义说明
const SIHUA_MEANINGS = {
  lu: { name: '化禄', color: 'text-green-600 dark:text-green-400', desc: '主财富、福气、顺利，代表好的开始和收获' },
  quan: { name: '化权', color: 'text-red-600 dark:text-red-400', desc: '主权力、能力、主导，代表掌控和领导力' },
  ke: { name: '化科', color: 'text-blue-600 dark:text-blue-400', desc: '主名声、考试、文书，代表名誉和学识' },
  ji: { name: '化忌', color: 'text-orange-600 dark:text-orange-400', desc: '主阻碍、波折、困扰，代表困难和挑战' }
};

interface ZiweiSihuaDisplayProps {
  selectedPalace: PalaceData;
  onBack: () => void;
  showEducationalInfo?: boolean;
}

export function ZiweiSihuaDisplay({ selectedPalace, onBack, showEducationalInfo = false }: ZiweiSihuaDisplayProps) {
  const palaceStem = selectedPalace.heavenlyStem;
  const sihuaRule = SIHUA_RULES[palaceStem as keyof typeof SIHUA_RULES];

  if (!sihuaRule) {
    return (
      <Card className="bg-white dark:bg-slate-800 border border-red-200 dark:border-red-500/30">
        <CardContent className="p-6 text-center">
          <div className="text-red-600 dark:text-red-400">
            无法找到 {palaceStem} 的四化规律
          </div>
          <Button variant="outline" onClick={onBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800 border border-purple-200 dark:border-amber-400/30 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-amber-400 font-noto">
            <Sparkles className="w-5 h-5" />
            {selectedPalace.name} 宫干四化
          </CardTitle>
          <Button variant="ghost" onClick={onBack} size="sm" className="text-purple-600 dark:text-amber-400">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {selectedPalace.heavenlyStem}{selectedPalace.branch} 宫的天干四化规律
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 四化规律表 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(sihuaRule).map(([type, starName]) => {
            const meaning = SIHUA_MEANINGS[type as keyof typeof SIHUA_MEANINGS];
            return (
              <div 
                key={type}
                className="p-4 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    variant="outline" 
                    className={`border-current ${meaning.color}`}
                  >
                    {meaning.name}
                  </Badge>
                  <span className={`font-bold text-lg ${meaning.color}`}>
                    {starName}
                  </span>
                </div>
                
                {showEducationalInfo && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {meaning.desc}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 宫内星曜四化状态 */}
        {selectedPalace.stars && selectedPalace.stars.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              本宫星曜四化状态
            </h4>
            
            <div className="grid grid-cols-1 gap-2">
              {selectedPalace.stars.map((star, index) => {
                // 检查这个星曜是否被本宫四化
                const isLuStar = star.name === sihuaRule.lu;
                const isQuanStar = star.name === sihuaRule.quan;
                const isKeStar = star.name === sihuaRule.ke;
                const isJiStar = star.name === sihuaRule.ji;
                
                const hasGongGanSihua = isLuStar || isQuanStar || isKeStar || isJiStar;
                
                return (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      hasGongGanSihua 
                        ? 'border-purple-300 dark:border-amber-400/50 bg-purple-50 dark:bg-slate-600/50'
                        : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {star.name}
                      </span>
                      
                      {/* 显示星曜亮度 */}
                      <Badge variant="outline" className="text-xs">
                        {star.brightness}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* 生年四化 */}
                      {star.sihua && (
                        <Badge className={`text-xs ${
                          star.sihua === 'A' ? 'bg-green-500' :
                          star.sihua === 'B' ? 'bg-red-500' :
                          star.sihua === 'C' ? 'bg-blue-500' : 'bg-orange-500'
                        } text-white`}>
                          生年{star.sihua === 'A' ? '禄' : star.sihua === 'B' ? '权' : star.sihua === 'C' ? '科' : '忌'}
                        </Badge>
                      )}
                      
                      {/* 宫干四化 */}
                      {hasGongGanSihua && (
                        <Badge className={`text-xs ${
                          isLuStar ? 'bg-green-600' :
                          isQuanStar ? 'bg-red-600' :
                          isKeStar ? 'bg-blue-600' : 'bg-orange-600'
                        } text-white`}>
                          自化{isLuStar ? '禄' : isQuanStar ? '权' : isKeStar ? '科' : '忌'}
                        </Badge>
                      )}
                      
                      {/* 宫干四化标记 */}
                      {star.palaceHua && star.palaceHua.length > 0 && (
                        <div className="flex gap-1">
                          {star.palaceHua.map((hua, huaIndex) => (
                            <Badge 
                              key={huaIndex}
                              variant="outline" 
                              className="text-xs border-pink-400 text-pink-600 dark:text-pink-400"
                            >
                              {hua}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {!star.sihua && !hasGongGanSihua && (!star.palaceHua || star.palaceHua.length === 0) && (
                        <span className="text-xs text-gray-400">无四化</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 四化飞星说明 */}
        {showEducationalInfo && (
          <div className="mt-6 p-4 bg-purple-50 dark:bg-slate-700/50 rounded-lg border border-purple-200 dark:border-amber-400/30">
            <h4 className="text-sm font-semibold text-purple-600 dark:text-amber-400 mb-3">
              四化飞星说明
            </h4>
            
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div><strong>宫干四化：</strong>每个宫位的天干都会产生四化，影响相应的星曜</div>
              <div><strong>自化：</strong>宫内星曜被本宫天干四化，称为自化</div>
              <div><strong>飞化：</strong>本宫四化飞到其他宫位的星曜</div>
              <div><strong>来化：</strong>其他宫位四化飞到本宫的星曜</div>
            </div>
            
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
              * 四化是紫微斗数的核心，通过四化可以看出星曜的动态变化和相互影响
            </div>
          </div>
        )}

        {/* 完整天干四化表 */}
        {showEducationalInfo && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              完整天干四化表
            </h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-200 dark:border-slate-600">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700">
                    <th className="border border-gray-200 dark:border-slate-600 p-2">天干</th>
                    <th className="border border-gray-200 dark:border-slate-600 p-2 text-green-600 dark:text-green-400">化禄</th>
                    <th className="border border-gray-200 dark:border-slate-600 p-2 text-red-600 dark:text-red-400">化权</th>
                    <th className="border border-gray-200 dark:border-slate-600 p-2 text-blue-600 dark:text-blue-400">化科</th>
                    <th className="border border-gray-200 dark:border-slate-600 p-2 text-orange-600 dark:text-orange-400">化忌</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(SIHUA_RULES).map(([gan, rule]) => (
                    <tr 
                      key={gan}
                      className={gan === palaceStem ? 'bg-purple-100 dark:bg-purple-900/30' : ''}
                    >
                      <td className="border border-gray-200 dark:border-slate-600 p-2 font-mono font-bold">
                        {gan}
                        {gan === palaceStem && <span className="text-purple-600 dark:text-amber-400 ml-1">←</span>}
                      </td>
                      <td className="border border-gray-200 dark:border-slate-600 p-2">{rule.lu}</td>
                      <td className="border border-gray-200 dark:border-slate-600 p-2">{rule.quan}</td>
                      <td className="border border-gray-200 dark:border-slate-600 p-2">{rule.ke}</td>
                      <td className="border border-gray-200 dark:border-slate-600 p-2">{rule.ji}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 