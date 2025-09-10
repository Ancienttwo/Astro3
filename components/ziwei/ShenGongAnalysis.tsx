import React from 'react';
import { Clock } from 'lucide-react';
import { PalaceData, StarData } from '@/app/ziwei/types';
import StarDisplay from '@/components/shared/StarDisplay';
import SciencePopup from '@/components/shared/SciencePopup';

interface ShenGongAnalysisProps {
  basePalaces: PalaceData[];
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

// 身宫分析数据
const getShenGongAnalysis = (palaceName: string) => {
  const analysisMap: Record<string, { description: string; condition: string; characteristics: string }> = {
    '命宫': {
      description: '与命宫同宫',
      condition: '子、午时生的人，身、命同宫',
      characteristics: `行运的趋向最为明朗，为人自我主观强烈，不易受外在环境影响，行事之功过大都自己作为承担，较不容易改命。

『身宫』坐命宫，为『命身同宫』。主观意识强，不容易受外界影响，勇于做自己，不容易改变。身、命同宫之人，对命运有加成作用，若命宫星曜吉，代表命好、身好，能提升自己，容易成功。若命宫太凶，此时已无身宫可扭转，命运可谓大好大坏。

『命身同宫』的人「活出自己」是他们人生所追求的目标，也是依循及托附的重点。容易以自己为出发点思考，可以说是「择善固执」。很清楚自己要做什么的人，也不怕用一辈子的时间去完成。

只喜欢做自己喜欢的事。人生是靠着一步一脚印累积，在别人眼里这样的人有时过于固执，不受别人的影响，无法勉强自己去迎合他人。这样的个性难免显得孤独，唯有他们看懂自己之后才懂得欣赏自己。

如果先天的性格是「社会价值」认同的，那么在成长的过程中就会减少阻力，不会因此与自己的内在抗衡。

凡事都是一体两面的，『命身同宫』的人。在做自己的同时，也要学习顺应现实。吸取自己原命盘中所没有的性格，在坚持做自己及活出自己的同时，试着放下自己的坚持，用更开放的心去学习吸收别人的优势，也是另一种扭转命运的机会。`
    },
    '夫妻': {
      description: '与夫妻宫同宫',
      condition: '经历过感情上的伤痛或困扰',
      characteristics: '较重感情之人，注重家庭生活气氛，对家庭有责任心，受婚姻及配偶的影响很大。'
    },
    '财帛': {
      description: '与财帛宫同宫',
      condition: '经历过经济上的波折或损失',
      characteristics: '偏重钱财价值观，行事以赚钱为目标，易受经济左右行为。'
    },
    '迁移': {
      description: '与迁移宫同宫',
      condition: '曾因外出或变动而遇到困难',
      characteristics: '易受环境变迁的影响，比较容易有职业或居住环境的变迁，也经常外出。'
    },
    '官禄': {
      description: '与官禄宫同宫',
      condition: '经历过工作或事业上的挫折',
      characteristics: '是事业心较重之人，一生行事以追求事业成就为目标，易受职业与工作环境影响，有热衷于名位的现象。'
    },
    '福德': {
      description: '与福德宫同宫',
      condition: '曾有过情绪低落或心情不佳的时期',
      characteristics: '比较爱享受，享福之人，较注重生活质量，似乎有些缺乏积极进取，稍嫌自私，易受祖德、因果、精神生活影响命运，但不一定表示挥霍。'
    }
  };
  
  return analysisMap[palaceName] || {
    description: '身宫位置的影响需要根据具体宫位来分析。',
    condition: '特定的人生经历后开启身宫',
    characteristics: '28岁后会对个人发展产生重要影响。'
  };
};

const ShenGongAnalysis: React.FC<ShenGongAnalysisProps> = ({ basePalaces, className = '' }) => {
  const shenGongPalace = basePalaces.find(p => p.isShenGong);
  
  if (!shenGongPalace) {
    return null;
  }
  
  const palaceName = shenGongPalace.name;
  const shenGongAnalysis = getShenGongAnalysis(palaceName);
  const stars = getStarsByType(shenGongPalace.stars || []);

  const scienceContent = (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
          什么是身宫？
        </h4>
        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed pl-4">
          身宫是紫微斗数中的重要概念，代表一个人28岁以后的人生发展轨迹。身宫通常在经历特定的人生事件后开启，影响个人的价值观和行为模式。
        </p>
      </div>
      
      <div>
        <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
          身宫的重要性
        </h4>
        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed pl-4">
          身宫被称为"后天之宫"，它不像命宫那样代表先天特质，而是反映人生历练后的成长和变化。身宫的位置和配置会影响一个人中年以后的人生方向。
        </p>
      </div>

      <div>
        <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          身宫的可能位置
        </h4>
        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed pl-4">
          身宫只会出现在命宫、夫妻、财帛、迁移、官禄、福德这六个宫位中。不同位置的身宫代表不同的人生重心和发展方向。
        </p>
      </div>
    </div>
  );

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-500" />
          我的身宫
        </h3>
      </div>

      {/* 科普知识 */}
      <SciencePopup
        title="什么是身宫？"
        content={scienceContent}
        className="mb-6"
      />

      <div className="space-y-0">
        {/* 身宫位置 */}
        <div className="py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              <h6 className="font-semibold text-purple-700 dark:text-purple-400 text-sm">身宫位置</h6>
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400">
              {shenGongPalace.heavenlyStem}{shenGongPalace.branch}
            </div>
          </div>
          <div className="ml-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-gray-800 dark:text-slate-200 text-sm">
                您的身宫在{palaceName}
              </span>
            </div>
            <p className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed">
              {shenGongAnalysis.description}
            </p>
          </div>
        </div>

        {/* 开启条件 */}
        <div className="py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
            <h6 className="font-semibold text-amber-700 dark:text-amber-400 text-sm">开启条件</h6>
          </div>
          <div className="ml-6">
            <p className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed">
              {shenGongAnalysis.condition}
            </p>
          </div>
        </div>

        {/* 性格特质与运势影响 */}
        <div className="py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <h6 className="font-semibold text-blue-700 dark:text-blue-400 text-sm">性格特质与运势影响</h6>
          </div>
          <div className="ml-6">
            <div className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed whitespace-pre-line">
              {shenGongAnalysis.characteristics}
            </div>
          </div>
        </div>

        {/* 身宫星曜配置 */}
        {(stars.mainStars.length > 0 || stars.auxiliaryStars.length > 0) && (
          <>
            {stars.mainStars.length > 0 && (
              <div className="py-4 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <h6 className="font-semibold text-green-700 dark:text-green-400 text-sm">主星配置</h6>
                </div>
                <div className="ml-6">
                  <StarDisplay stars={stars.mainStars} size="small" />
                </div>
              </div>
            )}
            
            {stars.auxiliaryStars.length > 0 && (
              <div className="py-4 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <h6 className="font-semibold text-blue-700 dark:text-blue-400 text-sm">辅星配置</h6>
                </div>
                <div className="ml-6">
                  <StarDisplay stars={stars.auxiliaryStars} size="small" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShenGongAnalysis; 