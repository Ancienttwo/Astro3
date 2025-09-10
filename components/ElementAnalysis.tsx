"use client";

import { calculateWuxingScore } from '@/lib/zodiac/wuxing-scoring';

interface ElementAnalysisProps {
  elements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  bazi?: string[]; // 八字数组，用于计算详细评分
}

export default function ElementAnalysis({ elements, bazi }: ElementAnalysisProps) {
  // 如果有八字数据，计算详细评分
  let wuxingScores = null;
  if (bazi && bazi.length === 8) {
    try {
      wuxingScores = calculateWuxingScore(bazi);
    } catch (error) {
      console.error('计算五行评分失败:', error);
    }
  }

  if (wuxingScores) {
    // 显示详细的五行评分表格
    const scoreCategories = [
      { key: 'basic', name: '基础分', desc: '天干+地支藏干' },
      { key: 'shengke', name: '生克', desc: '相生相克影响' },
      { key: 'combination', name: '合会', desc: '三合六合影响' },
      { key: 'conflict', name: '刑冲', desc: '刑冲害破穿绝' },
      { key: 'transparency', name: '透干', desc: '天干透出加分' },
      { key: 'seasonal', name: '季节', desc: '当令休囚影响' },
      { key: 'total', name: '总分', desc: '最终评分结果' }
    ];

    const wuxingElements = [
      { key: 'wood', name: '木', color: 'text-emerald-500 dark:text-emerald-400' },
      { key: 'fire', name: '火', color: 'text-rose-500 dark:text-rose-400' },
      { key: 'earth', name: '土', color: 'text-amber-700 dark:text-stone-400' },
      { key: 'metal', name: '金', color: 'text-yellow-600 dark:text-yellow-400' },
      { key: 'water', name: '水', color: 'text-sky-500 dark:text-sky-400' }
    ];

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-purple-500/30 dark:border-amber-400/30">
              <th className="text-left py-2 px-3 font-medium text-purple-600 dark:text-amber-400">分类</th>
              {wuxingElements.map(element => (
                <th key={element.key} className={`text-center py-2 px-3 font-medium ${element.color}`}>
                  {element.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scoreCategories.map((category, index) => (
              <tr key={category.key} className={`border-b border-gray-200/20 dark:border-slate-600/20 ${
                category.key === 'total' ? 'bg-purple-50/50 dark:bg-amber-400/5 font-semibold' : ''
              }`}>
                <td className="py-2 px-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-slate-100">{category.name}</span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{category.desc}</span>
                  </div>
                </td>
                {wuxingElements.map(element => {
                  const score = wuxingScores[element.key as keyof typeof wuxingScores];
                  let value = 0;
                  
                  if (category.key === 'total') {
                    // 总分直接使用最终评分
                    value = typeof score === 'number' ? score : 0;
                  } else {
                    // 其他分类从details中获取
                    const details = wuxingScores.details?.[element.key as keyof typeof wuxingScores.details];
                    if (details && typeof details === 'object') {
                      value = details[category.key as keyof typeof details] || 0;
                    }
                  }

                  return (
                    <td key={element.key} className="text-center py-2 px-3">
                      <span className={`${
                        category.key === 'total' 
                          ? `font-bold ${element.color}` 
                          : value > 0 ? 'text-green-600 dark:text-green-400' 
                          : value < 0 ? 'text-red-500 dark:text-red-400'
                          : 'text-gray-500 dark:text-slate-400'
                      }`}>
                        {category.key === 'total' ? Math.round(value) : value.toFixed(1)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 如果没有八字数据，显示简单的五行数量
  return (
    <div>
      <div className="grid grid-cols-5 gap-3">
        {[
          { name: "木", count: elements.wood, color: "from-green-400 to-green-500" },
          { name: "火", count: elements.fire, color: "from-red-400 to-red-500" },
          { name: "土", count: elements.earth, color: "from-yellow-400 to-yellow-500" },
          { name: "金", count: elements.metal, color: "from-gray-300 to-gray-400" },
          { name: "水", count: elements.water, color: "from-blue-400 to-blue-500" },
        ].map((element, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-full h-24 bg-purple-900/50 rounded-lg overflow-hidden mb-2 border border-yellow-500/20">
              <div
                className={`w-full bg-gradient-to-t ${element.color} rounded-b-lg transition-all duration-500`}
                style={{ height: `${(element.count / 8) * 100}%` }} // Assuming max count is around 8 for scaling
              ></div>
            </div>
            <span className="text-sm font-medium text-yellow-200 font-noto">{element.name}</span>
            <span className="text-xs text-yellow-300">{element.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 