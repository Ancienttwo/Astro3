"use client";

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, BarChart3, Target, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { calculateWuxingScore } from '@/lib/zodiac/wuxing-scoring';

interface IntegratedWuxingAnalysisProps {
  elements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  bazi: string[];
  dayMaster?: string;
  yongShenInfo?: {
    primaryYongShen: string;
    jiShen: string[];
  };
  isEnglish?: boolean;
}

// 条形图组件
const BarChartView: React.FC<{ elements: any; bazi: string[] }> = ({ elements, bazi }) => {
  let wuxingScores = null;
  if (bazi && bazi.length === 8) {
    try {
      wuxingScores = calculateWuxingScore(bazi);
    } catch (error) {
      console.error('计算五行评分失败:', error);
    }
  }

  if (!wuxingScores) {
    return <div className="text-center py-8 text-gray-500">无法计算五行评分</div>;
  }

  const wuxingElements = [
    { key: 'wood', name: '木', color: 'bg-emerald-500', textColor: 'text-emerald-600' },
    { key: 'fire', name: '火', color: 'bg-rose-500', textColor: 'text-rose-600' },
    { key: 'earth', name: '土', color: 'bg-amber-600', textColor: 'text-amber-700' },
    { key: 'metal', name: '金', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    { key: 'water', name: '水', color: 'bg-sky-500', textColor: 'text-sky-600' }
  ];

  const maxScore = Math.max(...wuxingElements.map(el => wuxingScores[el.key as keyof typeof wuxingScores] || 0));

  return (
    <div className="space-y-3">
      {/* 条形图 */}
      {wuxingElements.map(element => {
        const score = wuxingScores[element.key as keyof typeof wuxingScores] || 0;
        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
        
        return (
          <div key={element.key} className="flex items-center gap-3">
            <div className="w-8 text-center">
              <span className={`font-bold ${element.textColor}`}>{element.name}</span>
            </div>
            <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-6 relative">
              <div 
                className={`${element.color} h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                style={{ width: `${Math.max(percentage, 5)}%` }}
              >
                <span className="text-white text-sm font-medium">
                  {Math.round(score)}
                </span>
              </div>
            </div>
            <div className="w-12 text-right text-sm text-gray-600 dark:text-gray-400">
              {Math.round(score)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 雷达图组件
const RadarChartView: React.FC<{ elements: any; dayMaster?: string; yongShenInfo?: { primaryYongShen: string; jiShen: string[] }; isEnglish?: boolean }> = ({ elements, dayMaster, yongShenInfo, isEnglish = false }) => {
  const centerX = 160;
  const centerY = 160;
  const radius = 100;
  
  const wuxingOrder = ['wood', 'fire', 'earth', 'metal', 'water'];
  const positions = wuxingOrder.map((element, index) => {
    const angle = (index * 72 - 90) * (Math.PI / 180);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { element, x, y, angle: angle * (180 / Math.PI) };
  });

  const colors = {
    wood: '#10b981',
    fire: '#f43f5e',
    earth: '#d97706',
    metal: '#eab308',
    water: '#0ea5e9'
  };

  const elementNames = {
    wood: isEnglish ? 'Wood' : '木',
    fire: isEnglish ? 'Fire' : '火',
    earth: isEnglish ? 'Earth' : '土',
    metal: isEnglish ? 'Metal' : '金',
    water: isEnglish ? 'Water' : '水'
  };

  const getTenGod = (element: string): string => {
    if (!dayMaster) return '';
    
    const dayMasterElement = (() => {
      if (['甲', '乙'].includes(dayMaster)) return 'wood';
      if (['丙', '丁'].includes(dayMaster)) return 'fire';
      if (['戊', '己'].includes(dayMaster)) return 'earth';
      if (['庚', '辛'].includes(dayMaster)) return 'metal';
      if (['壬', '癸'].includes(dayMaster)) return 'water';
      return '';
    })();

    const tenGodMap: { [key: string]: { [key: string]: string } } = {
      wood: { wood: '比劫', fire: '食伤', earth: '财才', metal: '官杀', water: '印枭' },
      fire: { wood: '印枭', fire: '比劫', earth: '食伤', metal: '财才', water: '官杀' },
      earth: { wood: '官杀', fire: '印枭', earth: '比劫', metal: '食伤', water: '财才' },
      metal: { wood: '财才', fire: '官杀', earth: '印枭', metal: '比劫', water: '食伤' },
      water: { wood: '食伤', fire: '财才', earth: '官杀', metal: '印枭', water: '比劫' }
    };

    return tenGodMap[dayMasterElement]?.[element] || '';
  };

  // 判断五行的用神属性
  const getYongShenType = (elementKey: string): string => {
    if (!yongShenInfo) return '';
    
    const elementName = elementNames[elementKey as keyof typeof elementNames];
    
    if (yongShenInfo.primaryYongShen === elementName) {
      return 'yongshen'; // 用神
    }
    
    if (yongShenInfo.jiShen.includes(elementName)) {
      return 'jishen'; // 忌神
    }
    
    return ''; // 普通五行
  };

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 320 320" className="w-full h-auto max-w-sm">
        {(() => {
          const maxValue = Math.max(...Object.values(elements) as number[], 1);
          const centerRadius = 80;
          
          const gridPoints = wuxingOrder.map((element, index) => {
            const angle = (index * 72 - 90) * (Math.PI / 180);
            return {
              x: centerX + centerRadius * Math.cos(angle),
              y: centerY + centerRadius * Math.sin(angle),
              angle
            };
          });
          
          const pentagonPoints = wuxingOrder.map((element, index) => {
            const angle = (index * 72 - 90) * (Math.PI / 180);
            const elementKey = element as keyof typeof elements;
            const value = elements[elementKey];
            const normalizedValue = value / maxValue;
            const r = centerRadius * normalizedValue;
            
            return {
              x: centerX + r * Math.cos(angle),
              y: centerY + r * Math.sin(angle),
              value,
              color: colors[elementKey]
            };
          });
          
          const pathData = pentagonPoints.map((point, index) => 
            `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
          ).join(' ') + ' Z';
          
          return (
            <g>
              {/* 网格线 */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, scaleIndex) => {
                const scaledPoints = gridPoints.map(point => ({
                  x: centerX + (point.x - centerX) * scale,
                  y: centerY + (point.y - centerY) * scale
                }));
                const gridPath = scaledPoints.map((point, index) => 
                  `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                ).join(' ') + ' Z';
                
                return (
                  <path
                    key={`grid-${scaleIndex}`}
                    d={gridPath}
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                );
              })}
              
              {gridPoints.map((point, index) => (
                <line
                  key={`ray-${index}`}
                  x1={centerX}
                  y1={centerY}
                  x2={point.x}
                  y2={point.y}
                  stroke="#d1d5db"
                  strokeWidth="1"
                  opacity="0.5"
                />
              ))}
              
              {/* 数值区域 */}
              <path
                d={pathData}
                fill="rgba(139, 92, 246, 0.3)"
                stroke="rgba(139, 92, 246, 0.8)"
                strokeWidth="3"
              />
              
              {/* 数值点 */}
              {pentagonPoints.map((point, index) => (
                <g key={index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    fill={point.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                  {point.value > 0 && (
                    <text
                      x={point.x}
                      y={point.y - 12}
                      textAnchor="middle"
                      className="text-sm font-bold"
                      style={{ 
                        fontSize: '14px',
                        fill: point.color,
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}
                    >
                      {point.value}
                    </text>
                  )}
                </g>
              ))}
            </g>
          );
        })()}

        {/* 五行元素圆圈 */}
        {positions.map(({ element, x, y }) => {
          const elementKey = element as keyof typeof elements;
          const yongShenType = getYongShenType(elementKey as string);
          
          return (
            <g key={element}>
              <circle
                cx={x}
                cy={y}
                r="30"
                fill={colors[elementKey as keyof typeof colors]}
                stroke={yongShenType === 'yongshen' ? '#ffd700' : yongShenType === 'jishen' ? '#ff4444' : colors[elementKey as keyof typeof colors]}
                strokeWidth={yongShenType ? "4" : "2"}
                opacity="0.9"
              />
              
              {/* 用神/忌神特殊标识环 */}
              {yongShenType && (
                <circle
                  cx={x}
                  cy={y}
                  r="35"
                  fill="none"
                  stroke={yongShenType === 'yongshen' ? '#ffd700' : '#ff4444'}
                  strokeWidth="2"
                  strokeDasharray={yongShenType === 'yongshen' ? "4,2" : "2,2"}
                  opacity="0.8"
                />
              )}
              
              <text
                x={x}
                y={yongShenType ? y - 3 : y}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-bold select-none"
                style={{ 
                  fontSize: '20px',
                  fill: 'white',
                  opacity: 1,
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                {elementNames[elementKey as keyof typeof elementNames]}
              </text>

              {/* 用神/忌神标识文字 */}
              {yongShenType && (
                <text
                  x={x}
                  y={y + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-bold select-none"
                  style={{ 
                    fontSize: '10px',
                    fill: yongShenType === 'yongshen' ? '#ffd700' : '#ffaaaa',
                    opacity: 1,
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                >
                  {yongShenType === 'yongshen' ? '用神' : '忌神'}
                </text>
              )}

            </g>
          );
        })}
      </svg>
    </div>
  );
};

const IntegratedWuxingAnalysis: React.FC<IntegratedWuxingAnalysisProps> = ({ elements, bazi, dayMaster, yongShenInfo, isEnglish = false }) => {
  const [activeView, setActiveView] = useState<'bar' | 'radar'>('bar');
  const [showScienceModal, setShowScienceModal] = useState(false);
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);

  // 计算wuxingScore用于显示数值
  let wuxingScores = null;
  if (bazi && bazi.length === 8) {
    try {
      wuxingScores = calculateWuxingScore(bazi);
    } catch (error) {
      console.error('计算五行评分失败:', error);
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg relative">
      {/* 头部 */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{isEnglish ? 'Five Elements Analysis' : '五行分析'}</h3>
          
          {/* 知识下拉按钮 */}
          <Collapsible open={isKnowledgeOpen} onOpenChange={setIsKnowledgeOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {isEnglish ? 'Knowledge' : '科普知识'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-orange-500 transition-transform ${isKnowledgeOpen ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
        
        {/* 知识下拉内容 */}
        <Collapsible open={isKnowledgeOpen} onOpenChange={setIsKnowledgeOpen}>
          <CollapsibleContent className="mt-4">
            <div className="space-y-4">
              {/* 简介卡片 */}
              <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 dark:text-orange-400 text-sm">📊</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {isEnglish ? 'What is Five Elements Analysis?' : '什么是五行分析？'}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {isEnglish 
                        ? 'Five Elements Analysis evaluates the strength and balance of Wood, Fire, Earth, Metal, and Water in your BaZi chart. It reveals your elemental constitution and helps identify areas that need strengthening or balancing.'
                        : '五行分析评估您八字中木、火、土、金、水的强弱平衡。它揭示您的五行体质，帮助识别需要加强或平衡的方面。'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* 五行平衡原理 */}
              <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  🌟 {isEnglish ? 'Five Elements Balance Theory' : '五行平衡原理'}
                </h4>
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { 
                        element: isEnglish ? 'Wood' : '木', 
                        color: 'text-emerald-600', 
                        trait: isEnglish ? 'Growth & Creativity' : '生长与创造力' 
                      },
                      { 
                        element: isEnglish ? 'Fire' : '火', 
                        color: 'text-rose-600', 
                        trait: isEnglish ? 'Energy & Passion' : '能量与热情' 
                      },
                      { 
                        element: isEnglish ? 'Earth' : '土', 
                        color: 'text-amber-700', 
                        trait: isEnglish ? 'Stability & Support' : '稳定与支撑' 
                      },
                      { 
                        element: isEnglish ? 'Metal' : '金', 
                        color: 'text-yellow-600', 
                        trait: isEnglish ? 'Structure & Logic' : '结构与逻辑' 
                      },
                      { 
                        element: isEnglish ? 'Water' : '水', 
                        color: 'text-sky-600', 
                        trait: isEnglish ? 'Flow & Wisdom' : '流动与智慧' 
                      }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className={`font-medium ${item.color}`}>{item.element}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{item.trait}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 计算方法 */}
              <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  ⚡ {isEnglish ? 'Calculation Method' : '计算方法'}
                </h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="space-y-1">
                    <div>• {isEnglish ? 'Basic Score: Heavenly Stems + Hidden Stems contribution' : '基础分：天干 + 地支藏干贡献'}</div>
                    <div>• {isEnglish ? 'Generation/Restraint: Mutual support and control effects' : '生克分：相生相克影响'}</div>
                    <div>• {isEnglish ? 'Seasonal Adjustment: Strength varies by season' : '季节调整：根据季节强弱变化'}</div>
                    <div>• {isEnglish ? 'Final Score: Comprehensive element strength rating' : '最终得分：综合五行强度评分'}</div>
                  </div>
                </div>
              </div>

              {/* 实用指南 */}
              <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  💡 {isEnglish ? 'Practical Applications' : '实用指南'}
                </h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div><strong>{isEnglish ? 'Strong Elements (>80):' : '偏强 (>80)：'}</strong> {isEnglish ? 'Dominant traits that may need balancing' : '主导特质，可能需要平衡'}</div>
                  <div><strong>{isEnglish ? 'Balanced Elements (40-80):' : '适中 (40-80)：'}</strong> {isEnglish ? 'Well-balanced, good foundation for growth' : '平衡良好，成长基础佳'}</div>
                  <div><strong>{isEnglish ? 'Weak Elements (<40):' : '偏弱 (<40)：'}</strong> {isEnglish ? 'Areas needing support and strengthening' : '需要支持和加强的方面'}</div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        {/* 切换标签 - 另起一行并居中 */}
        <div className="flex justify-center gap-2 mt-3">
          <Button
            variant={activeView === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('bar')}
            className={`flex items-center gap-2 ${
              activeView === 'bar' 
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white' 
                : 'border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            {isEnglish ? 'Bar Chart' : '条形图'}
          </Button>
          <Button
            variant={activeView === 'radar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('radar')}
            className={`flex items-center gap-2 ${
              activeView === 'radar' 
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white' 
                : 'border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20'
            }`}
          >
            <Target className="w-4 h-4" />
            {isEnglish ? 'Radar Chart' : '雷达图'}
          </Button>
        </div>
      </div>

      {/* 内容区域 */}
      {activeView === 'bar' ? (
        <BarChartView elements={elements} bazi={bazi} />
      ) : (
        <RadarChartView elements={elements} dayMaster={dayMaster} yongShenInfo={yongShenInfo} isEnglish={isEnglish} />
      )}

      {/* 科普弹窗 */}
      {showScienceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-orange-500" />
                五行分析算法说明
              </h3>
              <button
                onClick={() => setShowScienceModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              {/* 详细评分表格 */}
              {wuxingScores && (
                <div>
                  <h4 className="font-semibold mb-2">📊 五行详细评分表</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 dark:border-slate-600 rounded-lg">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700">
                          <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-slate-300">分类</th>
                          {[
                            { key: 'wood', name: '木', textColor: 'text-emerald-600' },
                            { key: 'fire', name: '火', textColor: 'text-rose-600' },
                            { key: 'earth', name: '土', textColor: 'text-amber-700' },
                            { key: 'metal', name: '金', textColor: 'text-yellow-600' },
                            { key: 'water', name: '水', textColor: 'text-sky-600' }
                          ].map(element => (
                            <th key={element.key} className={`text-center py-2 px-3 font-medium ${element.textColor}`}>
                              {element.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: 'basic', name: '基础分', desc: '天干+地支藏干' },
                          { key: 'shengke', name: '生克', desc: '相生相克影响' },
                          { key: 'combination', name: '合会', desc: '三合六合影响' },
                          { key: 'conflict', name: '刑冲', desc: '刑冲害破穿绝' },
                          { key: 'transparency', name: '透干', desc: '天干透出加分' },
                          { key: 'seasonal', name: '季节', desc: '当令休囚影响' }
                        ].map((category) => (
                          <tr key={category.key} className="border-b border-gray-100 dark:border-slate-700">
                            <td className="py-2 px-3">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900 dark:text-slate-100">{category.name}</span>
                                <span className="text-xs text-gray-500 dark:text-slate-400">{category.desc}</span>
                              </div>
                            </td>
                            {['wood', 'fire', 'earth', 'metal', 'water'].map(elementKey => {
                              const details = wuxingScores.details?.[elementKey as keyof typeof wuxingScores.details];
                              const value = details && typeof details === 'object' ? details[category.key as keyof typeof details] || 0 : 0;

                              return (
                                <td key={elementKey} className="text-center py-2 px-3">
                                  <span className={`${
                                    value > 0 ? 'text-green-600 dark:text-green-400' 
                                    : value < 0 ? 'text-red-500 dark:text-red-400'
                                    : 'text-gray-500 dark:text-slate-400'
                                  }`}>
                                    {value.toFixed(1)}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        {/* 总分行 */}
                        <tr className="border-t-2 border-gray-300 dark:border-slate-500 bg-gray-50 dark:bg-slate-700 font-bold">
                          <td className="py-2 px-3 text-gray-900 dark:text-slate-100">总分</td>
                          {['wood', 'fire', 'earth', 'metal', 'water'].map(elementKey => {
                            const score = wuxingScores[elementKey as keyof typeof wuxingScores] || 0;
                            return (
                              <td key={elementKey} className="text-center py-2 px-3">
                                <span className="text-blue-600 dark:text-blue-400 font-bold">
                                  {Math.round(score)}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold mb-2">📊 评分算法参数</h4>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <p><strong>基础分：</strong>天干每个+基础分，地支藏干本气权重1.0，中气0.5，余气0.3</p>
                  <p><strong>生克影响：</strong>相生+2×季节强度，相克-1.5×季节强度</p>
                  <p><strong>合会影响：</strong>三合+3分，六合+2分（只给合成五行），三会+4分</p>
                  <p><strong>刑冲影响：</strong>相冲-3分×季节抗性，相刑-2分，相害穿-1.5到2.5分</p>
                  <p><strong>透干加分：</strong>本气透干+2分，中气+1分，余气+0.5-1分</p>
                  <p><strong>季节影响：</strong>当令+50%，相生+25%，休囚-25%，死绝-50%</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">🌟 显示模式</h4>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <p><strong>条形图：</strong>显示详细的五行评分和分类明细，适合深入分析</p>
                  <p><strong>雷达图：</strong>显示五行力量的整体分布，直观了解平衡状态</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">🔍 分析要点</h4>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <p><strong>平衡性：</strong>五行分数接近表示命理平衡</p>
                  <p><strong>偏强偏弱：</strong>某个五行特别高或低需要调和</p>
                  <p><strong>十神关系：</strong>结合日主分析各五行的十神属性</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegratedWuxingAnalysis; 