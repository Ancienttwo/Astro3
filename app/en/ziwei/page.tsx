"use client";
// @ts-expect-error next-dynamic-flag
export const dynamic = 'force-dynamic'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Solar } from '@/lib/lunar';
import { User, Sparkles, Save, BarChart, Eye, Star, Clock, Bot, RefreshCw, Brain, Home, Book, ArrowLeft, Menu, Lightbulb, ChevronDown } from 'lucide-react';
import Logo from '@/components/Logo';
import type { RecordData } from '@/types/legacy';
import ZiweiChartWithConnections from '@/components/ZiweiChartWithConnections';
import { FIVE_TIGER_DUN } from '@/lib/zodiac/five-tiger-dun';
import { HeavenlyStem, HEAVENLY_STEMS, STEM_YIN_YANG } from '@/lib/zodiac/stems';
import { EARTHLY_BRANCHES, EarthlyBranch } from '@/lib/zodiac/branches';
import { getFiveElementsBureau, FiveElementsBureau, BUREAU_TO_NUMBER } from '@/lib/zodiac/five-elements-bureau';
import DecadeSelector from '@/components/DecadeSelector';
import YearlyLuckSelector from '@/components/YearlyLuckSelector';
import { getZiweiPosition } from '@/lib/zodiac/ziwei-position';
import { StarName, StarBrightness, StarType, STARS, getStarBrightness } from '@/lib/zodiac/stars';
import { SIHUA_MAP, HUA_TO_LETTER } from '@/lib/zodiac/sihua';
// @ts-ignore - Suppress module not found error for next/navigation
import { useRouter, useSearchParams } from 'next/navigation';
import { useDailyCheckin } from '@/hooks/useDailyCheckin';
import TimeAdjustmentButton from '@/components/TimeAdjustmentButton';
import { MAIN_STARS_INTERPRETATIONS } from '@/lib/data/main-stars';
import { getSihuaInterpretation } from '@/lib/data/sihua-interpretations-complete';
import { getSihuaInterpretationEn, translateStarName, translatePalaceName } from '@/lib/data/sihua-interpretations-complete-en';
import { PurchaseDialog } from '@/components/PurchaseDialog';
import { StreamingAnalysisCard } from '@/components/StreamingAnalysisCard';
import SimpleAsyncAnalysis from '@/components/SimpleAsyncAnalysis';
import { supabase } from '@/lib/supabase';
import LaiYinAnalysis from '@/components/ziwei/LaiYinAnalysis';
import MingGongAnalysisMultilang from '@/components/ziwei/MingGongAnalysisMultilang';
import { useZiweiStore, useZiweiActions, selectIsFormValid, selectHasResult, selectShowMenu, selectIsCalculating, selectCalculationError } from '@/stores/ziwei-store';
import EnglishLayout from '@/components/EnglishLayout';
import { DisclaimerCard } from '@/components/DisclaimerCard';
import { apiClient } from '@/lib/api-client';
import { 
  PALACE_NAMES, 
  CATEGORIES as categories 
} from '@/lib/ziwei/utils';


const ENGLISH_PALACE_NAMES = [
  "Life", "Siblings", "Marriage", "Children", "Wealth", "Health",
  "Travel", "Friends", "Career", "Property", "Fortune", "Parents"
];

const ENGLISH_DECADE_PALACE_NAMES = ["大命", "大兄", "大夫", "大子", "大财", "大疾", "大迁", "大友", "大官", "大田", "大福", "大父"];

const ENGLISH_YEARLY_PALACE_NAMES = ["流命", "流兄", "流夫", "流子", "流财", "流疾", "流迁", "流友", "流官", "流田", "流福", "流父"];

const LUNAR_MONTH_NAMES = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"];

// 流月计算：通过地支动态查找寅宫，无需固定索引

export interface StarData {
  name: StarName;
  brightness: StarBrightness;
  type: StarType;
  sihua?: 'A' | 'B' | 'C' | 'D';
  palaceHua?: string[];
  xiangXinSihua?: string; // 向心自化
  liXinSihua?: string; // 离心自化
}

export interface PalaceData {
  id: number;
  name: string;
  branch: EarthlyBranch;
  heavenlyStem: HeavenlyStem;
  isLaiYinPalace: boolean;
  isShenGong: boolean;
  decade: string; // e.g., "6-15"
  decadeIndex: number;
  fiveElementsBureau?: FiveElementsBureau;
  yearlyLuck?: { year: number; age: number; flowName?: string };
  yearlyName?: string;
  stars?: StarData[];
  lunarMonth?: string;
  isCurrentMonth?: boolean;
}

interface ZiweiResult {
  palaces: PalaceData[];
  basePalaces: PalaceData[];
  decadePalaces: PalaceData[];
  lunarDate: string;
  fiveElementsBureau?: FiveElementsBureau;
  mingZhu: string;
  shenZhu: string;
  gender: 'male' | 'female';
  selectedIndex: number | null;
  yearGan: HeavenlyStem; // 添加年干字段
  sihuaInfo?: { // 🔥 添加预计算的生年四化信息
    lu: string;
    quan: string;
    ke: string;
    ji: string;
  } | null;
}

interface BirthData {
  username: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  gender: 'male' | 'female' | '';
  category: string;
}

const getMingZhu = (lifePalaceBranch: EarthlyBranch): StarName => {
  const map: Record<EarthlyBranch, StarName> = {
    '子': '贪狼', '丑': '巨门', '寅': '禄存', '卯': '文曲',
    '辰': '廉贞', '巳': '武曲', '午': '破军', '未': '武曲',
    '申': '廉贞', '酉': '文曲', '戌': '禄存', '亥': '巨门',
  };
  return map[lifePalaceBranch];
};

const getShenZhu = (birthYearBranch: EarthlyBranch): StarName => {
  const map: Record<EarthlyBranch, StarName> = {
    '子': '火星', '丑': '天相', '寅': '天梁', '卯': '天同',
    '辰': '文昌', '巳': '天机', '午': '铃星', '未': '天相',
    '申': '天梁', '酉': '天同', '戌': '文昌', '亥': '天机',
  };
  return map[birthYearBranch];
};

const getStarsByType = (stars: StarData[]) => {
  const mainStars = stars.filter(s => s.type === '主星');
  const auxiliaryStars = stars.filter(s => s.type === '辅星');
  const maleficStars = stars.filter(s => s.type === '煞星' || ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫', '天刑'].includes(s.name));
  const peachBlossomStars = stars.filter(s => ['天喜', '红鸾', '天姚'].includes(s.name));
  
  return { mainStars, auxiliaryStars, maleficStars, peachBlossomStars };
};

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

const getShenGongAnalysis = (palaceName: string, locale: string = 'zh') => {
  if (locale === 'en') {
    // English version of Body Palace analysis
    const analysisMap: Record<string, { description: string; condition: string; characteristics: string }> = {
      '命宫': {
        description: 'Body Palace in Life Palace',
        condition: 'Born during Zi (11pm-1am) or Wu (11am-1pm) hours - Life and Body Palace merge',
        characteristics: `Life's trajectory becomes exceptionally clear, with a remarkably strong sense of self and independence. These individuals are rarely swayed by external circumstances and tend to take full responsibility for their actions, making transformation more challenging.

When the Body Palace resides in the Life Palace, it creates a "Life-Body Unity" configuration. This manifests as strong subjective consciousness, resilience against external influences, and the courage to be authentically oneself. Such individuals resist change but possess tremendous consistency.

For those with Life-Body Unity, the stars in their Life Palace have amplified effects. If the Life Palace has auspicious stars, both innate nature and acquired development flourish, leading to easier success. However, if the Life Palace has challenging stars, there's no Body Palace to provide balance, creating a pattern of extreme highs and lows.

People with Life-Body Unity pursue "living authentically" as their life's primary goal. They think from a self-centered perspective and can be described as "selectively stubborn." They know precisely what they want to achieve and aren't afraid to spend a lifetime pursuing it.

These individuals prefer doing only what they love. Life is built step by step through personal accumulation. To others, they may seem overly rigid, uninfluenced by external opinions, and unable to compromise or cater to others. This personality trait can create loneliness, but once they understand themselves, they learn to appreciate their uniqueness.

If their innate personality aligns with "social values," their growth path encounters less resistance and internal conflict.

Everything has two sides. While maintaining authenticity, those with Life-Body Unity must also learn to adapt to reality. Absorbing qualities absent from their original chart, while persisting in being true to themselves, they should try to release some stubbornness and embrace learning from others' strengths - this offers another avenue for transforming destiny.`
      },
      '夫妻': {
        description: 'Body Palace in Marriage Palace',
        condition: 'Experienced emotional pain or relationship difficulties',
        characteristics: 'Deeply emotional individuals who prioritize family atmosphere and home life. They have strong family responsibilities and are significantly influenced by marriage and spouse relationships.'
      },
      '财帛': {
        description: 'Body Palace in Wealth Palace',
        condition: 'Experienced financial setbacks or economic challenges',
        characteristics: 'Money-oriented individuals who pursue financial gain as their primary goal. Their actions and decisions are heavily influenced by economic considerations and financial circumstances.'
      },
      '迁移': {
        description: 'Body Palace in Travel Palace',
        condition: 'Faced difficulties due to relocation or major life changes',
        characteristics: 'Highly susceptible to environmental changes and transitions. They experience frequent career or residential relocations and are often involved in travel or external activities.'
      },
      '官禄': {
        description: 'Body Palace in Career Palace',
        condition: 'Experienced professional setbacks or career challenges',
        characteristics: 'Career-focused individuals who pursue professional achievement as their life\'s primary objective. They are strongly influenced by their work environment and professional circumstances, with a notable attraction to status and recognition.'
      },
      '福德': {
        description: 'Body Palace in Fortune Palace',
        condition: 'Experienced periods of emotional distress or spiritual challenges',
        characteristics: 'Individuals who appreciate comfort and good living, focusing on life quality and personal enjoyment. They may lack aggressive drive and can appear somewhat self-centered, being influenced by ancestral karma, spiritual life, and cause-and-effect relationships, though this doesn\'t necessarily indicate extravagance.'
      }
    };
    
    return analysisMap[palaceName] || {
      description: 'Body Palace influence varies based on specific palace position.',
      condition: 'Body Palace activates after specific life experiences',
      characteristics: 'Significantly impacts personal development after age 28.'
    };
  } else {
    // Chinese version (existing)
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
  }
};

const getDestinyArrowAnalysis = (palaces: PalaceData[]) => {
  // 获取命迁财官四宫的数据并处理向心自化/离心自化
  const processPalaceStars = (palace: PalaceData | undefined) => {
    if (!palace) return palace;
    
    const processedStars = palace.stars?.map(star => {
      // 从palaceHua中提取向心自化和离心自化信息
      let xiangXinSihua: string | undefined;
      let liXinSihua: string | undefined;
      
      if (star.palaceHua && star.palaceHua.length > 0) {
        star.palaceHua.forEach(hua => {
          // 解析宫位四化格式，如 "iA", "xB", "iC", "xD"
          if (hua.startsWith('i')) {
            xiangXinSihua = hua.substring(1); // 取i后面的字符
          } else if (hua.startsWith('x')) {
            liXinSihua = hua.substring(1); // 取x后面的字符
          }
        });
      }
      
      return {
        ...star,
        xiangXinSihua,
        liXinSihua
      };
    });
    
    return {
      ...palace,
      stars: processedStars
    };
  };

  const mingGong = processPalaceStars(palaces.find(p => p.name === '命宫'));
  const qianYi = processPalaceStars(palaces.find(p => p.name === '迁移'));
  const caiPo = processPalaceStars(palaces.find(p => p.name === '财帛'));
  const guanLu = processPalaceStars(palaces.find(p => p.name === '官禄'));
  
  return {
    mingGong,
    qianYi,
    caiPo,
    guanLu,
    description: `在紫微斗数的星盘上，命宫、财帛宫、官禄宫、迁移宫这四宫，就像一支蓄势待发的箭。

命宫是箭头，决定我们天生的性格和人生方向，它如同箭尖刺破迷雾的力量；
财帛宫是箭身，提供前进所需的物质支撑，没有厚实的箭身，箭头再利也飞不远；
官禄宫是箭羽，掌控飞行的稳定性，事业成就如同羽毛调节着人生轨迹的平衡；
迁移宫则是弓弦，赋予我们突破现状的动能，机遇和适应力决定了这支箭能射向多远的天地。

当四宫能量和谐时，人生便如离弦之箭，带着破空之势奔向目标；若某一宫位薄弱，就像箭身弯曲或箭羽缺损，纵有万钧之力也难以命中靶心。这种环环相扣的联动，正是紫微斗数洞察命运的精妙之处。`
  };
};



// 🔥 新增：构建完整的四化分析查询
const buildCompleteSihuaQuery = (palaces: PalaceData[], yearGan: HeavenlyStem) => {
  console.log('🚀 开始构建四化查询');
  console.log('🔍 传入参数:', { yearGan, palacesCount: palaces.length });
  
  // 获取生年四化映射
  const sihuaMap = SIHUA_MAP[yearGan];
  if (!sihuaMap) {
    console.error('❌ 无法获取生年四化映射:', yearGan, 'SIHUA_MAP键:', Object.keys(SIHUA_MAP));
    return `生年四化查询构建失败：无法找到年干${yearGan}的四化映射`;
  }

  // 调试信息：输出四化映射
  console.log('✅ 生年四化映射:', sihuaMap);
  console.log('🔍 宫位数据:', palaces.map(p => ({ 
    name: p.name, 
    stars: p.stars?.map(s => s.name) || [] 
  })));

  // 查找来因宫
  const laiYinPalace = palaces.find(p => p.isLaiYinPalace);
  const laiYinGongName = laiYinPalace ? laiYinPalace.name : '未知';

  // 构建查询字符串
  let query = `请进行生年四化与来因宫分析：

数据：
来因宫：${laiYinGongName}

生年四化星与宫：`;

  // 遍历ABCD四化 - 修复键名
  const sihuaTypes = [
    { key: '禄', letter: 'A', name: '化禄' },
    { key: '权', letter: 'B', name: '化权' },
    { key: '科', letter: 'C', name: '化科' },
    { key: '忌', letter: 'D', name: '化忌' }
  ] as const;

  sihuaTypes.forEach(({ key, letter, name }) => {
    const sihuaStar = sihuaMap[key];
    if (!sihuaStar) {
      console.warn(`🚫 未找到${key}星:`, key, sihuaMap);
      return;
    }

    console.log(`🔍 查找四化星: ${sihuaStar} (${letter}${name})`);

    // 查找四化星所在的宫位
    let foundPalace: PalaceData | null = null;
    for (const palace of palaces) {
      const foundStar = palace.stars?.find(star => star.name === sihuaStar);
      if (foundStar) {
        foundPalace = palace;
        console.log(`✅ 找到${sihuaStar}在${palace.name}`);
        break;
      }
    }

    if (foundPalace) {
      // 构建该宫位所有星曜的信息
      const allStarsInfo = foundPalace.stars?.map(star => {
        let starInfo = `${star.name}(${star.brightness})`;
        
        // 先收集所有四化标记
        const sihuaMarks: string[] = [];
        
        // 添加生年四化标记
        if (star.sihua) {
          sihuaMarks.push(star.sihua);
        }
        
        // 添加自化标记（从palaceHua中获取）
        if (star.palaceHua && star.palaceHua.length > 0) {
          star.palaceHua.forEach(hua => {
            if (hua.startsWith('i')) {
              sihuaMarks.push(`i${hua.substring(1)}`); // 向心自化
            } else if (hua.startsWith('x')) {
              sihuaMarks.push(`x${hua.substring(1)}`); // 离心自化
            }
          });
        }
        
        // 用空格连接所有四化标记，在星曜名称后先加空格
        if (sihuaMarks.length > 0) {
          starInfo += ' ' + sihuaMarks.join(' ');
        }
        
        return starInfo;
      }).join('、') || '无星曜';

      query += `\n${letter}${name}：${foundPalace.name} - ${allStarsInfo}`;
    } else {
      console.warn(`❌ 未找到${sihuaStar}在星盘中`);
      query += `\n${letter}${name}：${sihuaStar}(未入盘) - 无星曜`;
    }
  });

  query += `

解释重点：
1. 因为生年四化皆由来因宫而来，所以生年四化的解释必须结合以下的要素：四化的宫位、四化、四化星曜、来因宫与四化宫的关系（来因宫给了四化宫某个生年四化，结合星曜和宫位推断）
2. 如有自化，必须结合其生年四化解。如某宫有贪狼 xD A，则先解释A，再结合D所在的宫位来解释xD。
3. 每一个生年四化必须结合来因宫详细解释

注：ABCD是生年禄权科忌，x是离心自化（有破耗的含义），i是向心自化（有付出的含义），xA是离心禄。`;

  return query;
};

// 添加缺失的checkExistingAnalysis函数定义

const checkExistingAnalysis = () => {
  return null; // 暂时禁用本地AI分析缓存，由新架构的API系统处理
};

// 计算流月排布
const calculateLunarMonth = (palaces: PalaceData[], currentMonth: number = new Date().getMonth() + 1) => {
  console.log('🌙 开始计算流月排布');
  
  // 调试：查看palaces数组的排序
  console.log('🔍 palaces数组排序:');
  palaces.forEach((palace, index) => {
    console.log(`索引${index}: ${palace.branch}宫 -> ${palace.name}`);
  });
  
  // 1. 找到寅宫（通过地支查找）
  const yinPalace = palaces.find(palace => palace.branch === '寅');
  if (!yinPalace) {
    console.log('❌ 未找到寅宫');
    return palaces;
  }
  console.log('🔍 步骤1 - 找到寅宫:', yinPalace.branch, '对应宫位:', yinPalace.name);
  
  // 2. 找到寅宫的本命宫位名称
  const yinBasePalaceName = yinPalace.name; // 如"财帛"
  console.log('🔍 步骤2 - 寅宫的本命宫位:', yinBasePalaceName);
  
  // 3. 将本命宫位名称映射到流年宫位名称
  const palaceNameMap: { [key: string]: string } = {
    '命宫': '流命',
    '兄弟': '流兄', 
    '夫妻': '流夫',
    '子女': '流子',
    '财帛': '流财',
    '疾厄': '流疾',
    '迁移': '流迁',
    '交友': '流友',
    '官禄': '流官',
    '田宅': '流田',
    '福德': '流福',
    '父母': '流父'
  };
  
  const targetFlowName = palaceNameMap[yinBasePalaceName];
  if (!targetFlowName) {
    console.log('❌ 未找到宫位映射:', yinBasePalaceName);
    return palaces;
  }
  
  console.log('🔍 步骤3 - 寻找流年宫位:', targetFlowName);
  
  // 4. 找到流年宫位在哪个位置
  let yearlyPalaceIndex = -1;
  palaces.forEach((palace, index) => {
    if (palace.yearlyLuck && palace.yearlyLuck.flowName === targetFlowName) {
      yearlyPalaceIndex = index;
      console.log('✅ 步骤4 - 找到流年宫位:', targetFlowName, '位置:', index, '对应宫位:', palace.name);
    }
  });
  
  if (yearlyPalaceIndex === -1) {
    console.log('❌ 未找到流年宫位:', targetFlowName);
    return palaces;
  }
  
  // 5. 从流年宫位起正月，顺时针排布12个月
  const updatedPalaces = palaces.map((palace, index) => {
    // 从找到的流年宫位(如"流财")起正月，直接计算月份
    const monthOffset = (index - yearlyPalaceIndex + 12) % 12;
    const lunarMonthName = LUNAR_MONTH_NAMES[monthOffset];
    console.log(`🔍 步骤5 - 宫位${index}: ${palace.name} -> 从${targetFlowName}开始第${monthOffset}个月 -> ${lunarMonthName}`);
    
    return {
      ...palace,
      lunarMonth: lunarMonthName,
      isCurrentMonth: monthOffset === (currentMonth - 1)
    };
  });
  
  console.log('✅ 流月排布完成');
  return updatedPalaces;
};

function ZiweiPage() {
  const router = useRouter();
  const { canCheckinToday, performCheckin } = useDailyCheckin();
  const searchParams = useSearchParams();
  const chartId = searchParams.get('chartId');
  
  const store = useZiweiStore();
  const actions = useZiweiActions();
  
  const birthData = store.birthData;
  const ziweiResult = store.ziweiResult;
  const isCalculating = useZiweiStore(selectIsCalculating);
  const selectedDecadeIndex = store.selectedDecadeIndex;
  const selectedYearlyIndex = store.selectedYearlyIndex;
  const selectedPalaceForSihua = store.selectedPalaceForSihua;
  // 添加其他所需状态
  
  const isFormValid = useZiweiStore(selectIsFormValid);
  const hasResult = useZiweiStore(selectHasResult);
  
  // 使用actions替换setters
  const setBirthData = actions.setBirthData;
  const { calculateZiwei, setSelectedDecadeIndex, setSelectedYearlyIndex, setSelectedPalaceForSihua, setZiweiResult } = useZiweiActions();
  
  const DRAFT_KEY = 'ziweiFormDraft';

  // 科学弹窗状态 - 使用本地状态管理
  const [showLaiYinScience, setShowLaiYinScience] = useState(false);
  const [showMingGongScience, setShowMingGongScience] = useState(false);
  const [showSihuaScience, setShowSihuaScience] = useState(false);
  const [showShenGongScience, setShowShenGongScience] = useState(false);
  const [showZiweiVsBaziModal, setShowZiweiVsBaziModal] = useState(false);
  
  // 获取URL参数 (使用上面已声明的searchParams)
  const autoLoad = searchParams.get('autoLoad');
  const urlName = searchParams.get('name');
  const urlYear = searchParams.get('year');
  const urlMonth = searchParams.get('month');
  const urlDay = searchParams.get('day');
  const urlHour = searchParams.get('hour');
  const urlGender = searchParams.get('gender');
  const urlSource = searchParams.get('source');
  // 移除不再需要的菜单相关代码

  // 处理URL参数自动加载
  useEffect(() => {
    if (autoLoad === 'true' && urlName && urlYear && urlMonth && urlDay && urlHour && urlGender) {
      console.log('🔄 自动加载用户绑定的出生信息:', {
        name: urlName,
        year: urlYear,
        month: urlMonth,
        day: urlDay,
        hour: urlHour,
        gender: urlGender,
        source: urlSource
      });

      // 填入用户的出生信息
      const birthDataForCalculation = {
        username: urlName,
        year: urlYear,
        month: urlMonth,
        day: urlDay,
        hour: urlHour,
        gender: urlGender as 'male' | 'female',
        category: 'personal' // 来自个人档案的命盘
      };

      setBirthData(birthDataForCalculation);

      // 延迟自动计算，确保数据已更新
      setTimeout(() => {
        calculateZiwei();
      }, 100);
    }
  }, [autoLoad, urlName, urlYear, urlMonth, urlDay, urlHour, urlGender, urlSource]);

  // AI分析相关状态
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [ziweiAnalysisStatus, setZiweiAnalysisStatus] = useState<{
    isLoading: boolean;
    isCompleted: boolean;
    isFailed: boolean;
    elapsedTime: number;
    formattedElapsedTime: string;
    error: string | null;
  } | null>(null);
  

  
  // 购买对话框状态
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const handleDecadeSelect = (index: number | null) => {
    setSelectedDecadeIndex(index);
    setSelectedYearlyIndex(null);
    setSelectedPalaceForSihua(null);
    if (ziweiResult && ziweiResult.basePalaces && ziweiResult.decadePalaces) {
      const { basePalaces, decadePalaces } = ziweiResult;
      let updatedPalaces = [...basePalaces];
      if (index !== null) {
        const selectedDecadePalace = decadePalaces[index];
        const yearGan = ziweiResult.yearGan;
        const yearStemYinYang = STEM_YIN_YANG[yearGan];
        const isYangManOrYinWoman = (yearStemYinYang === '阳' && birthData.gender === 'male') || (yearStemYinYang === '阴' && birthData.gender === 'female');
        const clickedPalaceBranch = selectedDecadePalace.branch;
        const clickedPalaceIndex = EARTHLY_BRANCHES.indexOf(clickedPalaceBranch);
        updatedPalaces = updatedPalaces.map(palace => {
          const branchIndex = EARTHLY_BRANCHES.indexOf(palace.branch);
          let stepsFromClicked;
          if (isYangManOrYinWoman) {
            stepsFromClicked = (branchIndex - clickedPalaceIndex + 12) % 12;
          } else {
            stepsFromClicked = (clickedPalaceIndex - branchIndex + 12) % 12;
          }
          const decadeNameIndex = stepsFromClicked;
          const decadeName = ENGLISH_DECADE_PALACE_NAMES[decadeNameIndex];
          return { ...palace, yearlyName: decadeName, yearlyLuck: undefined };
        });
        if (selectedDecadePalace.decade) {
          const startAge = parseInt(selectedDecadePalace.decade.split('-')[0], 10);
          const startYear = parseInt(birthData.year, 10) + startAge - 1;
          const yearlyLuckMap = new Map<EarthlyBranch, { year: number, age: number }>();
          for (let i = 0; i < 10; i++) {
            const currentYear = startYear + i;
            const currentAge = startAge + i;
            const yearBranch = Solar.fromYmd(currentYear, 6, 30).getLunar().getYearZhi() as EarthlyBranch;
            yearlyLuckMap.set(yearBranch, { year: currentYear, age: currentAge });
          }
          updatedPalaces = updatedPalaces.map(palace => ({
            ...palace,
            yearlyLuck: yearlyLuckMap.get(palace.branch)
          }));
        }
      } else {
        updatedPalaces = updatedPalaces.map(palace => ({
          ...palace,
          yearlyName: undefined,
          yearlyLuck: undefined
        }));
      }
      setZiweiResult({
        ...ziweiResult,
        palaces: updatedPalaces,
        basePalaces: updatedPalaces,
        selectedIndex: index
      });
    }
  };

  const handleYearlySelect = (index: number | null) => {
    setSelectedYearlyIndex(index);
    setSelectedPalaceForSihua(null);
    if (ziweiResult && selectedDecadeIndex !== null && ziweiResult.decadePalaces[selectedDecadeIndex] && index !== null) {
      const selectedDecadePalace = ziweiResult.decadePalaces[selectedDecadeIndex];
      const startAge = parseInt(selectedDecadePalace.decade.split('-')[0], 10);
      const startYear = parseInt(birthData.year, 10) + startAge - 1;
      const yearlyDataForSelector: { year: number; branch: EarthlyBranch }[] = [];
      for (let i = 0; i < 10; i++) {
        const currentYear = startYear + i;
        const yearBranch = Solar.fromYmd(currentYear, 6, 30).getLunar().getYearZhi() as EarthlyBranch;
        yearlyDataForSelector.push({ year: currentYear, branch: yearBranch });
      }
      const selectedYearBranch = yearlyDataForSelector[index].branch;
      const yearlyLifePalaceBranchIndex = EARTHLY_BRANCHES.indexOf(selectedYearBranch);
      
      console.log('🔍 流年计算调试:');
      console.log('选中流年地支:', selectedYearBranch);
      console.log('流年命宫地支索引:', yearlyLifePalaceBranchIndex);
      console.log('EARTHLY_BRANCHES:', EARTHLY_BRANCHES);
      console.log('ENGLISH_YEARLY_PALACE_NAMES:', ENGLISH_YEARLY_PALACE_NAMES);
      
      // 添加本命盘宫位分配调试
      console.log('🔍 本命盘宫位分配调试:');
      ziweiResult.palaces.forEach((palace, index) => {
        console.log(`索引${index}: ${palace.branch}宫 -> ${palace.name}`);
      });
      
      let updatedPalaces = [...ziweiResult.palaces];
      
      updatedPalaces = updatedPalaces.map(palace => {
        const selectedYear = yearlyDataForSelector[index].year;
        const age = selectedYear - parseInt(birthData.year, 10) + 1;
        
        // 正确的流年十二宫排布：根据流年地支定位
        // 流年地支所在的宫位起流命，逆时针排布
        const palaceBranchIndex = EARTHLY_BRANCHES.indexOf(palace.branch);
        const yearlyFlowNameIndex = (palaceBranchIndex - yearlyLifePalaceBranchIndex + 12) % 12;
        const yearlyFlowName = ENGLISH_YEARLY_PALACE_NAMES[yearlyFlowNameIndex];
        
        console.log(`🔍 流年宫位计算: ${palace.name}(${palace.branch}) 索引${palaceBranchIndex}, 流年命宫索引${yearlyLifePalaceBranchIndex}, 差值${yearlyFlowNameIndex} -> ${yearlyFlowName}`);
        
        return {
          ...palace,
          // 保留原有的yearlyName（大运宫位名称）
          // 在yearlyLuck中显示流年信息
          yearlyLuck: {
            year: selectedYear,
            age: age,
            flowName: yearlyFlowName // 将流年宫位名称存储在这里
          }
        };
      });
      
      // 计算流月排布
      updatedPalaces = calculateLunarMonth(updatedPalaces);
      
      setZiweiResult({ ...ziweiResult, palaces: updatedPalaces });
    }
  };

  const handleCalculate = () => {
    setSelectedDecadeIndex(null);
    setSelectedYearlyIndex(null);
    setSelectedPalaceForSihua(null);
    calculateZiwei();  // 调整为无参数调用

    if (birthData.username && birthData.gender) {
      const birthday = `${birthData.year}-${birthData.month.padStart(2, '0')}-${birthData.day.padStart(2, '0')}`;
      
      // 使用统一的charts API和Bearer token认证
      (async () => {
        try {
          // WalletConnect认证由apiClient自动处理，无需手动检查
          console.log('🔄 开始保存紫微命盘:', birthData.username);

          const response = await apiClient.post('/api/charts', {
            name: birthData.username,
            birth_year: parseInt(birthData.year),
            birth_month: parseInt(birthData.month),
            birth_day: parseInt(birthData.day),
            birth_hour: parseInt(birthData.hour),
            gender: birthData.gender as 'male' | 'female',
            chart_type: 'ziwei',
            category: birthData.category
          });

          if (response.success) {
            const result = response.data;
            if (result.success) {
              console.log('✅ 紫微命盘已保存/更新:', result.record.id);
            } else {
              throw new Error(result.error || '保存失败');
            }
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.error('❌ 保存紫微命盘失败:', error);
        }
      })();
    }
  }

  // Effect for auto-saving form progress
  useEffect(() => {
    // Only save a draft if we are creating a new chart
    if (typeof window !== 'undefined' && !chartId) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(birthData));
    }
  }, [birthData, chartId]);

  // Effect for initializing the page from saved draft (only when creating new chart)
  useEffect(() => {
    if (!chartId && typeof window !== 'undefined') {
      // Try to load saved draft when creating new chart
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          if (parsedDraft && typeof parsedDraft === 'object') {
            setBirthData(parsedDraft);
            if (parsedDraft.year && parsedDraft.month && parsedDraft.day && parsedDraft.hour && parsedDraft.gender) {
              setBirthData(parsedDraft);
              calculateZiwei();
            }
          }
        } catch (error) {
          console.error("Failed to load draft from localStorage", error);
          localStorage.removeItem(DRAFT_KEY);
        }
      }
    }
  }, [chartId, calculateZiwei]);

  const handlePalaceClick = (palace: PalaceData) => {
    setSelectedPalaceForSihua(palace);
  };

  let sihuaDisplay: string[] | undefined;
  if (selectedPalaceForSihua && ziweiResult) {
      const sourcePalace = selectedPalaceForSihua;
      const gongGan = sourcePalace.heavenlyStem;
      const sihuaByGan = SIHUA_MAP[gongGan];
      const allPalaces = ziweiResult.palaces;
      const basePalaces = ziweiResult.basePalaces;

      if (sihuaByGan) {
          sihuaDisplay = Object.entries(sihuaByGan).map(([hua, starName]) => {
              const isYearlyActive = selectedYearlyIndex !== null;
              const sourcePalaceName = (isYearlyActive && sourcePalace.yearlyName) ? sourcePalace.yearlyName : sourcePalace.name;

              const targetPalace = allPalaces.find(p => p.stars?.some(s => s.name === starName));
              if (!targetPalace) {
                  return `[${sourcePalaceName}] 化[${starName}][${hua}] 未入盘`;
              }

              let targetPalaceDisplayName: string | undefined;
              let oppositePalaceDisplayName: string | undefined;

              if (isYearlyActive) {
                  // Yearly active: target/clash are Decade palaces
                  targetPalaceDisplayName = targetPalace.name; // This is the Decade name, e.g., "大官"
                  if (hua === '忌') {
                      const oppositeBranch = EARTHLY_BRANCHES[(EARTHLY_BRANCHES.indexOf(targetPalace.branch) + 6) % 12];
                      const oppositePalace = allPalaces.find(p => p.branch === oppositeBranch);
                      oppositePalaceDisplayName = oppositePalace?.name;
                  }
              } else {
                  // Decade or Base active: target/clash are Base palaces
                  const baseTargetPalace = basePalaces.find(p => p.branch === targetPalace.branch);
                  targetPalaceDisplayName = baseTargetPalace?.name; // e.g., "官禄"
                  if (hua === '忌') {
                      const oppositeBranch = EARTHLY_BRANCHES[(EARTHLY_BRANCHES.indexOf(targetPalace.branch) + 6) % 12];
                      const oppositePalace = basePalaces.find(p => p.branch === oppositeBranch);
                      oppositePalaceDisplayName = oppositePalace?.name;
                  }
              }

              if (!targetPalaceDisplayName) {
                  return `[${sourcePalaceName}] 化[${starName}][${hua}] 入未知宫位`;
              }

              let output = `[${sourcePalaceName}] 化[${starName}][${hua}] 入[${targetPalaceDisplayName}]`;
              
              if (hua === '忌' && oppositePalaceDisplayName) {
                  output += ` 冲[${oppositePalaceDisplayName}]`;
              }
              return output;
          }).filter(Boolean) as string[];
      }
  }

  const handleSave = () => {
    if (birthData.username && birthData.year) {
      // 使用统一的charts API和Bearer token认证
      (async () => {
        try {
          // WalletConnect认证由apiClient自动处理，无需手动检查
          console.log('🔄 开始保存紫微命盘:', birthData.username);

          const response = await apiClient.post('/api/charts', {
            name: birthData.username,
            birth_year: parseInt(birthData.year),
            birth_month: parseInt(birthData.month),
            birth_day: parseInt(birthData.day),
            birth_hour: parseInt(birthData.hour),
            gender: birthData.gender as 'male' | 'female',
            chart_type: 'ziwei',
            category: birthData.category
          });

          if (response.success) {
            const result = response.data;
            console.log('🔍 API返回结果:', result);
            
            if (result.success) {
              console.log('✅ 紫微命盘已保存/更新:', result.record?.id || result.id || '未知ID');
            } else {
              throw new Error(result.error || '保存失败');
            }
          } else {
            const errorText = await response.text();
            console.error('❌ HTTP错误响应:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
        } catch (error) {
          console.error('❌ 保存紫微命盘失败:', error);
          // 检查是否是认证错误
          if (error.message?.includes('未认证') || error.message?.includes('AuthError')) {
            alert('请先登录后再保存命盘');
            window.location.href = '/en/auth';
            return;
          }
          alert('保存失败: ' + (error.message || '未知错误'));
        }
      })();
    }
  };

  // 当有chartId时，自动加载对应的命盘数据
  useEffect(() => {
    if (chartId) {
      const loadChartData = async () => {
        try {
          // WalletConnect认证由apiClient自动处理
          console.log('🔄 加载命盘数据');

          const response = await apiClient.get(`/api/charts/${chartId}`);

          if (response.success) {
            const chartData = response.data;
            console.log('✅ 加载命盘数据成功:', chartData);
              
              // 设置birthData状态
              const birthDataForCalculation = {
                username: chartData.name,
                year: chartData.birth_year.toString(),
                month: chartData.birth_month.toString(),
                day: chartData.birth_day.toString(),
                hour: chartData.birth_hour.toString(),
                gender: chartData.gender,
                category: chartData.category || 'others'
              };
              
              setBirthData(birthDataForCalculation);
              
              // 自动计算紫微结果
              setBirthData(birthDataForCalculation);
              calculateZiwei();
              

          } else {
            throw new Error(response.error || '获取命盘数据失败');
          }
        } catch (error) {
          console.error('❌ 加载命盘数据失败:', error);
          
          // 如果是命盘不存在相关错误，重定向到命书页面
          if (error instanceof Error && 
              (error.message.includes('命盘不存在') || 
               error.message.includes('无权限访问') || 
               error.message.includes('HTTP 404'))) {
            console.log('命盘已被删除或无权限访问，重定向到命书页面');
            router.replace('/charts');
            return;
          }
          
          // 其他错误显示提示
          alert('加载命盘失败：' + error.message);
        }
      };

      loadChartData();
    }
  }, [chartId, calculateZiwei, router]);

  // 使用useCallback避免无限循环
  const handleZiweiStatusChange = useCallback((status: {
    isLoading: boolean;
    isCompleted: boolean;
    isFailed: boolean;
    elapsedTime: number;
    formattedElapsedTime: string;
    error: string | null;
  }) => {
    setZiweiAnalysisStatus(status);
  }, []);

  // 定义loadChartData函数
  const loadChartData = async (chartId: string) => {
    try {
      // WalletConnect认证由apiClient自动处理
      console.log('🔄 加载命盘数据 ID:', chartId);

      const response = await apiClient.get(`/api/charts/${chartId}`);

      if (response.success) {
        const chartData = response.data;
        console.log('✅ 加载命盘数据成功:', chartData);
        
        // 设置birthData状态
        const birthDataForCalculation = {
          username: chartData.name,
          year: chartData.birth_year.toString(),
          month: chartData.birth_month.toString(),
          day: chartData.birth_day.toString(),
          hour: chartData.birth_hour.toString(),
          gender: chartData.gender,
          category: chartData.category || 'others'
        };
        
        setBirthData(birthDataForCalculation);
        calculateZiwei();
      } else {
        throw new Error(response.error || '获取命盘数据失败');
      }
    } catch (error) {
      console.error('❌ 加载命盘数据失败:', error);
      if (error instanceof Error && 
          (error.message.includes('命盘不存在') || 
           error.message.includes('无权限访问') || 
           error.message.includes('HTTP 404'))) {
        console.log('命盘已被删除或无权限访问，重定向到命书页面');
        router.replace('/en/charts');
        return;
      }
      alert('加载命盘失败：' + error.message);
    }
  };

  useEffect(() => {
    const chartId = searchParams.get('chartId');
    if (chartId) {
      loadChartData(chartId);
    }
  }, [searchParams]);

  return (
    <EnglishLayout showNavigation={true}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* 主要内容 - 使用EnglishLayout统一导航 */}
        <div className="pb-0 md:pb-4 px-1 md:px-4 w-full">
        {ziweiResult ? (
          <div>
            <div className="flex justify-between items-start mb-6 gap-4">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-purple-600 dark:text-amber-400 font-noto">{birthData.username} 的星盘</h2>
                <div className="text-sm text-gray-300 mt-2 space-y-1">
                  <p>公历: {birthData.year}-{birthData.month}-{birthData.day} {birthData.hour}:00</p>
                  <p>阴历: {ziweiResult.lunarDate}</p>
                </div>
              </div>
              

              
              <div className="flex flex-col gap-2">

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 hover:bg-primary/10 dark:hover:bg-amber-400/10 text-purple-600 dark:text-amber-400 border-purple-300 dark:border-amber-400/50"
                  onClick={() => {
                    // 临时简化版本
                    const newHour = prompt('请输入新的出生时辰(0-23):', birthData.hour);
                    if (newHour && !isNaN(Number(newHour)) && Number(newHour) >= 0 && Number(newHour) <= 23) {
                      setBirthData({ hour: newHour });
                      setTimeout(() => {
                        handleCalculate();
                      }, 100);
                    }
                  }}
                >
                  <Clock className="w-4 h-4" />
                  <span>Adjust Birth Time</span>
                </Button>
              </div>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Birth Time Accuracy Notice */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                      Important: Birth Time Accuracy
                    </h3>
                    <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed mb-3">
                      Note: BaZi only requires knowing the year, month, and day for about 75% accuracy, but ZiWei is different from BaZi - you must know which two-hour period you were born in to create an accurate chart.
                    </p>
                    <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
                      Since people often don't remember their exact birth time clearly, please try charts with times 2 hours before or after, and see if the stars in the Life Palace and Health Palace match your personality to determine your correct chart.
                    </p>
                  </div>
                </div>
              </div>

              <div id="ziwei-chart" className="bg-white dark:bg-slate-800 md:rounded-lg md:shadow-lg mt-0 md:mt-4 p-0 md:p-4">
                <div className="flex items-center justify-between mb-3 p-4 pb-0 xl:pr-0">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-500" />
                    Zi Wei Chart
                  </h3>
                  <button
                    onClick={() => setShowZiweiVsBaziModal(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    title="Zi Wei vs BaZi Comparison"
                  >
                    💡
                  </button>
                </div>
                {/* 🔥 新布局方案：左侧统一容器 + 右侧信息区域 (3:2比例) */}
                <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-0 md:gap-4 items-start">
                  {/* 左侧：星盘+选择器的统一容器 (桌面端占3/5) */}
                  <div className="w-full max-w-full bg-white dark:bg-slate-800 md:rounded-lg md:border md:border-gray-200 dark:md:border-slate-600 md:shadow-sm overflow-hidden xl:flex-[3]">
                    {/* 统一容器：星盘+选择器整体，内部无边距 */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
                      {/* 星盘区域 */}
                      <div>
                        <ZiweiChartWithConnections result={{...ziweiResult, onPalaceClick: handlePalaceClick} as any} />
                      </div>
                      
                      {/* 选择器区域 - 无间距紧密连接 */}
                      <div className="border-t border-gray-200 dark:border-slate-600">
                        <div className="space-y-0">
                          {/* 第一排：大运选择器 */}
                          <div className="border-b border-gray-200 dark:border-slate-600">
                        <DecadeSelector 
                          decades={ziweiResult.decadePalaces}
                          selectedIndex={selectedDecadeIndex}
                          onSelect={handleDecadeSelect}
                        />
                      </div>
                      
                          {/* 第二排：流年选择器 */}
                          <div>
                      {selectedDecadeIndex !== null && ziweiResult.decadePalaces[selectedDecadeIndex] && (
                          <YearlyLuckSelector
                            birthYear={Number(birthData.year)}
                            selectedDecade={ziweiResult.decadePalaces[selectedDecadeIndex]}
                            selectedIndex={selectedYearlyIndex}
                            onSelect={handleYearlySelect}
                          />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 右侧：星盘信息提示区域 (桌面端占2/5) */}
                  <div className="w-full xl:flex-[2]">
                    <div className="bg-gray-50 dark:bg-slate-700/60 md:rounded-lg md:border md:border-gray-200 dark:md:border-slate-600 p-2 md:p-4 min-h-[200px]">
                      <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-purple-600 dark:text-amber-400">
                          {selectedPalaceForSihua ? `${selectedPalaceForSihua.name} (${selectedPalaceForSihua.heavenlyStem}${selectedPalaceForSihua.branch}) Four Transformations` : "Chart Information:"}
                          </h4>
                          {selectedPalaceForSihua && (
                          <Button variant="ghost" size="sm" onClick={() => setSelectedPalaceForSihua(null)} className="text-purple-600 dark:text-amber-400 hover:bg-purple-50 dark:hover:bg-amber-400/10 hover:text-purple-700 dark:hover:text-amber-300 h-7">Back</Button>
                          )}
                        </div>
                      <div className="text-sm text-gray-700 dark:text-slate-300">
                        {selectedPalaceForSihua && sihuaDisplay ? (
                          <ul className="space-y-1 font-mono">
                            {sihuaDisplay.map((line, index) => <li key={index}>{line}</li>)}
                          </ul>
                        ) : (
                          <div className="space-y-4">
                            <ul className="list-disc list-inside space-y-2 text-sm">
                              <li>Click any palace to view its Four Transformations.</li>
                              <li>Click the Decade selection below to switch ten-year fortune.</li>
                              <li>Click on Annual Fortune to view specific year's fortune.</li>
                              <li>Red letters in the chart represent Four Transformations.</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 宿世因缘 */}
              <div id="lai-yin-analysis" className="mt-2 md:mt-4">
                {ziweiResult && (
                  <LaiYinAnalysis 
                    basePalaces={ziweiResult.basePalaces}
                    className="mt-4"
                  />
                    )}
                  </div>
                  
                <div id="ming-gong-analysis" className="mt-2 md:mt-4">
                  {ziweiResult && (
                    <MingGongAnalysisMultilang palaces={ziweiResult.palaces} className="mt-4" />
                  )}
                </div>

                <div id="birth-year-sihua" className="bg-white dark:bg-slate-800 md:rounded-lg md:shadow-lg mt-2 md:mt-4 p-2 md:p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Birth Year Four Transformations
                  </h3>
                  
                  {/* Educational Knowledge Section */}
                  <div className="mb-6">
                    <button
                      onClick={() => setShowSihuaScience(!showSihuaScience)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/40 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-purple-500" />
                        <span className="font-medium text-gray-700 dark:text-slate-300">Educational Knowledge</span>
                      </div>
                      <ChevronDown 
                        className={`w-4 h-4 text-gray-500 dark:text-slate-400 transition-transform duration-200 ${
                          showSihuaScience ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    
                    {showSihuaScience && (
                      <div className="mt-3 p-4 border-l-4 border-purple-500 bg-gray-50/50 dark:bg-slate-800/30 space-y-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-100 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                              What are the Birth Year Four Transformations?
                            </h4>
                            <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed pl-4">
                        The Birth Year Four Transformations are Flying Stars determined by the heavenly stem of your birth year, operating across three dimensions simultaneously: Karmic Dimension (Events), Emotional Dimension (People), and Material Dimension (Resources). The four transformations - Affluence, Authority, Merit, and Adversity - follow the Four Seasons Financial Cycle, affecting all aspects of life through precise timing analysis.
                      </p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-100 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                              Meaning of Four Transformations
                            </h4>
                            <div className="space-y-2 pl-4">
                              <div className="border-l-4 border-green-500 pl-3 py-1">
                                <h6 className="font-semibold text-green-600 dark:text-green-400 text-xs mb-1">A Affluence Transformation - Autumn Harvest</h6>
                                <p className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed">Natural flow of wealth and resources, money comes easily like autumn harvest</p>
                              </div>
                              <div className="border-l-4 border-purple-500 pl-3 py-1">
                                <h6 className="font-semibold text-purple-600 dark:text-purple-400 text-xs mb-1">B Authority Transformation - Summer Storm</h6>
                                <p className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed">Sudden wealth and rapid changes, money comes like summer storms - intense and volatile</p>
                              </div>
                              <div className="border-l-4 border-blue-500 pl-3 py-1">
                                <h6 className="font-semibold text-blue-600 dark:text-blue-400 text-xs mb-1">C Merit Transformation - Spring Growth</h6>
                                <p className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed">Steady accumulation and genuine appreciation, money flows like spring rain - consistent growth</p>
                              </div>
                              <div className="border-l-4 border-red-500 pl-3 py-1">
                                <h6 className="font-semibold text-red-600 dark:text-red-400 text-xs mb-1">D Adversity Transformation - Winter Storage</h6>
                                <p className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed">Final accumulation through endings, like bears storing for winter - lasting wealth through challenges</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border-l-2 border-purple-300 pl-4 py-2 bg-white/50 dark:bg-slate-800/50">
                            <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed flex items-start gap-2">
                              <span className="text-purple-500 mt-0.5">💡</span>
                              <span>Flying Stars analysis operates across three dimensions simultaneously, requiring multiple star confirmations to ensure prediction accuracy.</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    
                                         {ziweiResult && (() => {
                       const birthYear = Number(birthData.year);
                       // 从ziweiResult中获取正确的年干
                       const yearStem = ziweiResult.yearGan;
                      
                      // 🔥 修复：直接使用lib中的标准SIHUA_MAP
                      const sihua = SIHUA_MAP[yearStem];
                      if (!sihua) return null;
                      
                      // 计算生年四化影响到哪个宫位 - 修复：使用basePalaces确保宫位名称正确
                      const calculateSihuaPalaces = () => {
                        const sihuaPalaces: { [key: string]: { palace: string; star: string } | null } = {
                          lu: null,
                          quan: null,
                          ke: null,
                          ji: null
                        };

                        // 🔥 修复：直接使用预计算的四化信息
                        if (ziweiResult.sihuaInfo) {
                          console.log('🔍 使用预计算的四化信息:', ziweiResult.sihuaInfo);
                          
                          // 解析预计算的四化信息
                          const parseInfo = (info: string) => {
                            if (info.includes('：')) {
                              const [palace, starWithSuffix] = info.split('：');
                              const star = starWithSuffix.replace(/[禄权科忌]$/, ''); // 移除后缀
                              return { palace, star };
                            }
                            return null;
                          };

                          sihuaPalaces.lu = parseInfo(ziweiResult.sihuaInfo.lu);
                          sihuaPalaces.quan = parseInfo(ziweiResult.sihuaInfo.quan);
                          sihuaPalaces.ke = parseInfo(ziweiResult.sihuaInfo.ke);
                          sihuaPalaces.ji = parseInfo(ziweiResult.sihuaInfo.ji);
                          
                          console.log('✅ 解析后的四化宫位:', sihuaPalaces);
                        } else {
                          console.warn('⚠️ 没有预计算的四化信息，使用star.sihua属性查找');
                          
                          // 遍历所有宫位，查找四化 - 备用方案
                          for (const palace of ziweiResult.basePalaces) {
                            if (palace.stars) {
                              for (const star of palace.stars) {
                                if (star.sihua) {
                                  switch (star.sihua) {
                                    case 'A':
                                      sihuaPalaces.lu = { palace: palace.name, star: star.name };
                                      break;
                                    case 'B':
                                      sihuaPalaces.quan = { palace: palace.name, star: star.name };
                                      break;
                                    case 'C':
                                      sihuaPalaces.ke = { palace: palace.name, star: star.name };
                                      break;
                                    case 'D':
                                      sihuaPalaces.ji = { palace: palace.name, star: star.name };
                                      break;
                                  }
                                }
                              }
                            }
                          }
                        }

                        return sihuaPalaces;
                      };

                      const sihuaPalaces = calculateSihuaPalaces();
                      const luInfo = sihuaPalaces.lu;
                      const quanInfo = sihuaPalaces.quan;
                      const keInfo = sihuaPalaces.ke;
                      const jiInfo = sihuaPalaces.ji;
                      
                                             return (
                         <div className="space-y-6">
                                                      {/* Your Birth Year Four Transformations Positions */}
                           <div className="space-y-0">
                               {/* 化禄位置 */}
                               <div className="py-4 border-b border-gray-100 dark:border-slate-700">
                                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                   <h6 className="font-semibold text-green-600 dark:text-green-400 text-sm flex items-center gap-3">
                                     <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                     A Affluence Transformation
                                   </h6>
                                   <div className="sm:text-right">
                                     {luInfo ? (
                                       <span className="font-medium text-gray-800 dark:text-slate-200 text-sm">
                                         {translatePalaceName(luInfo.palace)}: {translateStarName(luInfo.star)} Affluence
                                       </span>
                                     ) : (
                                       <span className="text-gray-500 dark:text-slate-400 text-sm">{sihua['禄']} not found in chart</span>
                                     )}
                                   </div>
                                 </div>
                                 {luInfo && (() => {
                                   const palaceNumberMap: Record<string, number> = {
                                     '命宫': 1, '兄弟': 2, '夫妻': 3, '子女': 4, '财帛': 5, '疾厄': 6,
                                     '迁移': 7, '交友': 8, '官禄': 9, '田宅': 10, '福德': 11, '父母': 12,
                                     // 添加可能的其他宫位名称变体
                                     '兄弟宫': 2, '夫妻宫': 3, '子女宫': 4, '财帛宫': 5, '疾厄宫': 6,
                                     '迁移宫': 7, '交友宫': 8, '官禄宫': 9, '田宅宫': 10, '福德宫': 11, '父母宫': 12
                                   };
                                   const palaceNumber = palaceNumberMap[luInfo.palace];
                                   const interpretation = palaceNumber ? getSihuaInterpretationEn(palaceNumber, translateStarName(luInfo.star), 'A') : null;
                                   const queryKey = palaceNumber ? `${palaceNumber}=${translateStarName(luInfo.star)}A` : `Unknown Palace=${translateStarName(luInfo.star)}A`;
                                   
                                   return (
                                     <div className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed ml-6">
                                       {interpretation ? (
                                         interpretation
                                       ) : (
                                         <div>
                                           <div className="text-gray-500 dark:text-slate-400 mb-1">
                                             Actual Palace Name: "{translatePalaceName(luInfo.palace)}"
                                           </div>
                                           <div className="text-gray-500 dark:text-slate-400 mb-1">
                                             Query Key: {queryKey}
                                           </div>
                                           <div className="text-gray-500 dark:text-slate-400">
                                             {palaceNumber ? 'No Affluence Transformation interpretation record for this star' : 'Palace name not recognized, please check data'}
                                           </div>
                                         </div>
                                       )}
                                     </div>
                                   );
                                 })()}
                               </div>
                               
                               {/* 化权位置 */}
                               <div className="py-4 border-b border-gray-100 dark:border-slate-700">
                                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                   <h6 className="font-semibold text-purple-600 dark:text-purple-400 text-sm flex items-center gap-3">
                                     <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                                     B Authority Transformation
                                   </h6>
                                   <div className="sm:text-right">
                                     {quanInfo ? (
                                       <span className="font-medium text-gray-800 dark:text-slate-200 text-sm">
                                         {translatePalaceName(quanInfo.palace)}: {translateStarName(quanInfo.star)} Authority
                                       </span>
                                     ) : (
                                       <span className="text-gray-500 dark:text-slate-400 text-sm">{sihua['权']} not found in chart</span>
                                     )}
                                   </div>
                                 </div>
                                 {quanInfo && (() => {
                                   const palaceNumberMap: Record<string, number> = {
                                     '命宫': 1, '兄弟': 2, '夫妻': 3, '子女': 4, '财帛': 5, '疾厄': 6,
                                     '迁移': 7, '交友': 8, '官禄': 9, '田宅': 10, '福德': 11, '父母': 12,
                                     // 添加可能的其他宫位名称变体
                                     '兄弟宫': 2, '夫妻宫': 3, '子女宫': 4, '财帛宫': 5, '疾厄宫': 6,
                                     '迁移宫': 7, '交友宫': 8, '官禄宫': 9, '田宅宫': 10, '福德宫': 11, '父母宫': 12
                                   };
                                   const palaceNumber = palaceNumberMap[quanInfo.palace];
                                   const interpretation = palaceNumber ? getSihuaInterpretationEn(palaceNumber, translateStarName(quanInfo.star), 'B') : null;
                                   const queryKey = palaceNumber ? `${palaceNumber}=${translateStarName(quanInfo.star)}B` : `Unknown Palace=${translateStarName(quanInfo.star)}B`;
                                   
                                   return (
                                     <div className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed ml-6">
                                       {interpretation ? (
                                         interpretation
                                       ) : (
                                         <div>
                                           <div className="text-gray-500 dark:text-slate-400 mb-1">
                                             Actual Palace Name: "{translatePalaceName(quanInfo.palace)}"
                                           </div>
                                           <div className="text-gray-500 dark:text-slate-400 mb-1">
                                             Query Key: {queryKey}
                                           </div>
                                           <div className="text-gray-500 dark:text-slate-400">
                                             {palaceNumber ? 'No Authority Transformation interpretation record for this star' : 'Palace name not recognized, please check data'}
                                           </div>
                                         </div>
                                       )}
                                     </div>
                                   );
                                 })()}
                               </div>
                               
                               {/* 化科位置 */}
                               <div className="py-4 border-b border-gray-100 dark:border-slate-700">
                                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                   <h6 className="font-semibold text-blue-600 dark:text-blue-400 text-sm flex items-center gap-3">
                                     <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                     C Merit Transformation
                                   </h6>
                                   <div className="sm:text-right">
                                     {keInfo ? (
                                       <span className="font-medium text-gray-800 dark:text-slate-200 text-sm">
                                         {translatePalaceName(keInfo.palace)}: {translateStarName(keInfo.star)} Merit
                                       </span>
                                     ) : (
                                       <span className="text-gray-500 dark:text-slate-400 text-sm">{sihua['科']} not found in chart</span>
                                     )}
                                   </div>
                                 </div>
                                 {keInfo && (() => {
                                   const palaceNumberMap: Record<string, number> = {
                                     '命宫': 1, '兄弟': 2, '夫妻': 3, '子女': 4, '财帛': 5, '疾厄': 6,
                                     '迁移': 7, '交友': 8, '官禄': 9, '田宅': 10, '福德': 11, '父母': 12,
                                     // 添加可能的其他宫位名称变体
                                     '兄弟宫': 2, '夫妻宫': 3, '子女宫': 4, '财帛宫': 5, '疾厄宫': 6,
                                     '迁移宫': 7, '交友宫': 8, '官禄宫': 9, '田宅宫': 10, '福德宫': 11, '父母宫': 12
                                   };
                                   const palaceNumber = palaceNumberMap[keInfo.palace];
                                   const interpretation = palaceNumber ? getSihuaInterpretationEn(palaceNumber, translateStarName(keInfo.star), 'C') : null;
                                   const queryKey = palaceNumber ? `${palaceNumber}=${translateStarName(keInfo.star)}C` : `Unknown Palace=${translateStarName(keInfo.star)}C`;
                                   
                                   return (
                                     <div className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed ml-6">
                                       {interpretation ? (
                                         interpretation
                                       ) : (
                                         <div>
                                           <div className="text-gray-500 dark:text-slate-400 mb-1">
                                             Actual Palace Name: "{translatePalaceName(keInfo.palace)}"
                                           </div>
                                           <div className="text-gray-500 dark:text-slate-400 mb-1">
                                             Query Key: {queryKey}
                                           </div>
                                           <div className="text-gray-500 dark:text-slate-400">
                                             {palaceNumber ? 'No Merit Transformation interpretation record for this star' : 'Palace name not recognized, please check data'}
                                           </div>
                                         </div>
                                       )}
                                     </div>
                                   );
                                 })()}
                               </div>
                               
                               {/* 化忌位置 */}
                               <div className="py-4 border-b border-gray-100 dark:border-slate-700">
                                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                   <h6 className="font-semibold text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
                                     <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                     D Adversity Transformation
                                   </h6>
                                   <div className="sm:text-right">
                                     {jiInfo ? (
                                       <span className="font-medium text-gray-800 dark:text-slate-200 text-sm">
                                         {translatePalaceName(jiInfo.palace)}: {translateStarName(jiInfo.star)} Adversity
                                       </span>
                                     ) : (
                                       <span className="text-gray-500 dark:text-slate-400 text-sm">{sihua['忌']} not found in chart</span>
                                     )}
                                   </div>
                                 </div>
                                 {jiInfo && (() => {
                                   const palaceNumberMap: Record<string, number> = {
                                     '命宫': 1, '兄弟': 2, '夫妻': 3, '子女': 4, '财帛': 5, '疾厄': 6,
                                     '迁移': 7, '交友': 8, '官禄': 9, '田宅': 10, '福德': 11, '父母': 12,
                                     // 添加可能的其他宫位名称变体
                                     '兄弟宫': 2, '夫妻宫': 3, '子女宫': 4, '财帛宫': 5, '疾厄宫': 6,
                                     '迁移宫': 7, '交友宫': 8, '官禄宫': 9, '田宅宫': 10, '福德宫': 11, '父母宫': 12
                                   };
                                   const palaceNumber = palaceNumberMap[jiInfo.palace];
                                   const interpretation = palaceNumber ? getSihuaInterpretationEn(palaceNumber, translateStarName(jiInfo.star), 'D') : null;
                                   const queryKey = palaceNumber ? `${palaceNumber}=${translateStarName(jiInfo.star)}D` : `Unknown Palace=${translateStarName(jiInfo.star)}D`;
                                   
                                   return (
                                     <div className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed ml-6">
                                       {interpretation ? (
                                         interpretation
                                       ) : (
                                         <div>
                                           <div className="text-gray-500 dark:text-slate-400 mb-1">
                                             Actual Palace Name: "{translatePalaceName(jiInfo.palace)}"
                                           </div>
                                           <div className="text-gray-500 dark:text-slate-400 mb-1">
                                             Query Key: {queryKey}
                                           </div>
                                           <div className="text-gray-500 dark:text-slate-400">
                                             {palaceNumber ? 'No Adversity Transformation interpretation record for this star' : 'Palace name not recognized, please check data'}
                                           </div>
                                         </div>
                                       )}
                                     </div>
                                   );
                                 })()}
                               </div>
                           </div>

                           {/* AI推理分析 - 生年四化与来因宫解析 */}
                           <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-600">
                             {(() => {
                               const sihuaAnalysisData = (() => {
                                 // 1. 根据生年天干确定四化星曜 - 使用lib中的标准映射
                                 const sihuaStars = SIHUA_MAP[yearStem];
                                 if (!sihuaStars) {
                                   console.error('无法获取生年四化星曜:', yearStem);
                                   return null;
                                 }
                                 
                                 // ✅ 只传递基础数据，查询构建在Agent内部进行
                                 const analysisData = {
                                   cacheKey: `sihua_${birthData.year}_${birthData.month}_${birthData.day}_${birthData.hour}_${birthData.gender}`,
                                   palaces: ziweiResult.basePalaces, // 🔥 修复：使用basePalaces确保四化数据正确
                                   yearGan: ziweiResult.yearGan,
                                   ...birthData
                                 };

                                 return analysisData;
                               })();
                               
                               // 只有数据完整时才渲染四化分析组件
                               return sihuaAnalysisData ? (
                                 <SimpleAsyncAnalysis
                                   title="Four Transformations Analysis Master"
                                   analysisType="sihua"
                                   analysisData={sihuaAnalysisData}
                                 />
                               ) : null;
                             })()}
                           </div>
                         </div>
                       );
                    })()}
                  </div>
                </div>

                {/* 我的身宫 */}
                <div id="shen-gong-analysis" className="bg-white dark:bg-slate-800 md:rounded-lg md:shadow-lg mt-2 md:mt-4 p-2 md:p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    My Body Palace
                  </h3>
                  
                  {/* 科普知识下拉区域 */}
                  <div className="mb-6">
                    <button
                      onClick={() => setShowShenGongScience(!showShenGongScience)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/40 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-purple-500" />
                        <span className="font-medium text-gray-700 dark:text-slate-300">Knowledge Base</span>
                      </div>
                      <ChevronDown 
                        className={`w-4 h-4 text-gray-500 dark:text-slate-400 transition-transform duration-200 ${
                          showShenGongScience ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    
                    {showShenGongScience && (
                      <div className="mt-3 p-4 border-l-4 border-purple-500 bg-gray-50/50 dark:bg-slate-800/30 space-y-4">
                    <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-100 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                              What is the Body Palace?
                            </h4>
                            <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed pl-4">
                              The Body Palace represents acquired destiny, often capable of transforming fate through post-natal efforts. It serves as an auxiliary palace to the Life Palace. The Body Palace must coincide with one of six palaces: Life, Marriage, Wealth, Travel, Career, or Fortune.
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-100 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                              Importance of Body Palace
                            </h4>
                            <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed pl-4">
                              After age 28, the Body Palace activates, and its star combinations significantly influence your acquired destiny. Your career and appearance will gradually shift from Life Palace characteristics toward Body Palace traits.
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-100 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                              Possible Body Palace Positions
                            </h4>
                            <div className="pl-4 space-y-2">
                              <div className="text-sm text-gray-600 dark:text-slate-400 grid grid-cols-2 gap-2">
                                <div className="border-l-2 border-purple-300 pl-2">Life Palace</div>
                                <div className="border-l-2 border-purple-300 pl-2">Marriage Palace</div>
                                <div className="border-l-2 border-purple-300 pl-2">Wealth Palace</div>
                                <div className="border-l-2 border-purple-300 pl-2">Travel Palace</div>
                                <div className="border-l-2 border-purple-300 pl-2">Career Palace</div>
                                <div className="border-l-2 border-purple-300 pl-2">Fortune Palace</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border-l-2 border-purple-300 pl-4 py-2 bg-white/50 dark:bg-slate-800/50">
                            <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed flex items-start gap-2">
                              <span className="text-purple-500 mt-0.5">💡</span>
                              <span>The Body Palace works with the Life Palace to determine life's trajectory and acquired achievements.</span>
                        </p>
                      </div>
                        </div>
                      </div>
                    )}
                    </div>
                  
                  <div className="space-y-6">



                    {/* 用户的身宫分析 */}
                    {ziweiResult && (() => {
                      const shenGongPalace = ziweiResult.basePalaces.find(p => p.isShenGong);
                      if (!shenGongPalace) return null;
                      
                      const palaceName = shenGongPalace.name;
                      const shenGongAnalysis = getShenGongAnalysis(palaceName, 'en');
                      const stars = getStarsByType(shenGongPalace.stars || []);
                      
                      return (
                        <div className="space-y-0">
                          {/* 身宫位置 */}
                          <div className="py-4 border-b border-gray-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                                <h6 className="font-semibold text-purple-700 dark:text-purple-400 text-sm">Body Palace Position</h6>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-slate-400">
                                {shenGongPalace.heavenlyStem}{shenGongPalace.branch}
                              </div>
                            </div>
                            <div className="ml-6">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-800 dark:text-slate-200 text-sm">
                                  Your Body Palace is in {translatePalaceName(palaceName)}
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
                              <h6 className="font-semibold text-amber-700 dark:text-amber-400 text-sm">Activation Condition</h6>
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
                              <h6 className="font-semibold text-blue-700 dark:text-blue-400 text-sm">Personality Traits & Destiny Influence</h6>
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
                                    <h6 className="font-semibold text-green-700 dark:text-green-400 text-sm">Main Star Configuration</h6>
                                  </div>
                                  <div className="ml-6">
                                    <div className="flex flex-wrap gap-1">
                                      {stars.mainStars.map((star, index) => (
                                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-slate-700/40 text-gray-800 dark:text-slate-300 rounded text-xs">
                                          {translateStarName(star.name)}({star.brightness})
                                          {star.sihua && <span className="ml-1 text-orange-600 dark:text-orange-400 font-bold">{star.sihua}</span>}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {stars.auxiliaryStars.length > 0 && (
                                <div className="py-4 border-b border-gray-100 dark:border-slate-700">
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                    <h6 className="font-semibold text-blue-700 dark:text-blue-400 text-sm">Auxiliary Star Configuration</h6>
                                  </div>
                                  <div className="ml-6">
                                    <div className="flex flex-wrap gap-1">
                                      {stars.auxiliaryStars.map((star, index) => (
                                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-slate-700/40 text-gray-800 dark:text-slate-300 rounded text-xs">
                                          {translateStarName(star.name)}({star.brightness})
                                          {star.sihua && <span className="ml-1 text-orange-600 dark:text-orange-400 font-bold">{star.sihua}</span>}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* 命运之箭分析 */}
                <div id="destiny-arrow-analysis" className="bg-white dark:bg-slate-800 md:rounded-lg md:shadow-lg mt-2 md:mt-4 p-2 md:p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-purple-500" />
                    Destiny Arrow
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Four-Palace Synergy Analysis: Life, Wealth, Career, and Travel Palaces</p>
                  <div className="p-6">
                    {(() => {
                      const arrowAnalysis = getDestinyArrowAnalysis(ziweiResult.basePalaces);
                      
                      return (
                                                <div className="space-y-0">
                          {/* 命运之箭理论介绍 */}
                          <div className="py-4 border-b border-gray-100 dark:border-slate-700">
                            <div className="mb-4">
                              <h6 className="font-semibold text-purple-700 dark:text-purple-400 text-sm">Destiny Arrow Theory</h6>
                            </div>
                            
                            {/* 理论方块区域 - 居中显示 */}
                            <div className="flex justify-center">
                              <div className="max-w-md mx-auto space-y-4">
                                {/* 理论概述 */}
                                <div className="p-3 bg-gray-50 dark:bg-slate-800/30 rounded-lg border border-gray-200 dark:border-slate-600">
                                  <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed text-center">
                                    In Zi Wei Dou Shu astrology, four specific palaces - Life, Wealth, Career, and Travel - work together like a powerful arrow ready to be released toward your destiny.
                                  </p>
                                </div>
                                
                                {/* 四宫方块介绍 */}
                                <div className="grid grid-cols-2 gap-3">
                                  {/* 命宫 - 箭头 */}
                                  <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                      <h6 className="font-semibold text-red-700 dark:text-red-400 text-xs">Life Palace - Arrow Tip</h6>
                                    </div>
                                    <p className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed text-center">
                                      Determines your innate character and life direction, like the sharp arrow tip that pierces through the fog of uncertainty
                                    </p>
                                  </div>

                                  {/* 迁移宫 - 弓弦 */}
                                  <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                      <h6 className="font-semibold text-green-700 dark:text-green-400 text-xs">Travel Palace - Bow String</h6>
                                    </div>
                                    <p className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed text-center">
                                      Provides the dynamic force to break through current situations. Your adaptability and opportunities determine how far this arrow can reach
                                    </p>
                                  </div>

                                  {/* 财帛宫 - 箭身 */}
                                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                      <h6 className="font-semibold text-yellow-700 dark:text-yellow-400 text-xs">Wealth Palace - Arrow Shaft</h6>
                                    </div>
                                    <p className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed text-center">
                                      Provides the material foundation needed for progress. Without a sturdy shaft, even the sharpest arrow tip cannot fly far
                                    </p>
                                  </div>

                                  {/* 官禄宫 - 箭羽 */}
                                  <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                      <h6 className="font-semibold text-blue-700 dark:text-blue-400 text-xs">Career Palace - Arrow Fletching</h6>
                                    </div>
                                    <p className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed text-center">
                                      Controls flight stability and accuracy. Career achievements act like feathers, maintaining balance throughout your life's trajectory
                                    </p>
                                  </div>
                                </div>
                                
                                {/* 总结 */}
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/30 rounded-lg">
                                  <p className="text-gray-700 dark:text-slate-300 text-xs leading-relaxed text-center">
                                    <span className="font-semibold text-purple-600 dark:text-purple-400">Perfect Synergy:</span>
                                    When these four palaces work in harmony, your life flies like an arrow released from the bow, cutting through obstacles toward your goals. If any palace is weak, it's like having a bent shaft or damaged fletching - even tremendous force cannot hit the target. This intricate interconnection reveals the profound wisdom of Zi Wei Dou Shu astrology.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 命宫 - 箭头 */}
                          <div className="py-4 border-b border-gray-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                <h6 className="font-semibold text-red-700 dark:text-red-400 text-sm">Life Palace (Arrow Tip)</h6>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-slate-400">
                                {arrowAnalysis.mingGong?.heavenlyStem}{arrowAnalysis.mingGong?.branch}
                              </div>
                            </div>
                            <div className="ml-6">
                              {arrowAnalysis.mingGong?.stars && arrowAnalysis.mingGong.stars.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {arrowAnalysis.mingGong.stars.map((star, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-slate-700/40 text-gray-800 dark:text-slate-300 rounded text-xs">
                                      {translateStarName(star.name)}({star.brightness})
                                      {star.xiangXinSihua && <span className="ml-1 text-blue-600 dark:text-blue-400 font-bold">i{star.xiangXinSihua}</span>}
                                      {star.liXinSihua && <span className="ml-1 text-purple-600 dark:text-purple-400 font-bold">x{star.liXinSihua}</span>}
                                      {star.sihua && <span className="ml-1 text-orange-600 dark:text-orange-400 font-bold">{star.sihua}</span>}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500 dark:text-slate-400">No Stars</span>
                              )}
                            </div>
                          </div>

                          {/* 迁移宫 - 弓弦 */}
                          <div className="py-4 border-b border-gray-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                <h6 className="font-semibold text-green-700 dark:text-green-400 text-sm">Travel Palace (Bow String)</h6>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-slate-400">
                                {arrowAnalysis.qianYi?.heavenlyStem}{arrowAnalysis.qianYi?.branch}
                              </div>
                            </div>
                            <div className="ml-6">
                              {arrowAnalysis.qianYi?.stars && arrowAnalysis.qianYi.stars.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {arrowAnalysis.qianYi.stars.map((star, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-slate-700/40 text-gray-800 dark:text-slate-300 rounded text-xs">
                                      {translateStarName(star.name)}({star.brightness})
                                      {star.xiangXinSihua && <span className="ml-1 text-blue-600 dark:text-blue-400 font-bold">i{star.xiangXinSihua}</span>}
                                      {star.liXinSihua && <span className="ml-1 text-purple-600 dark:text-purple-400 font-bold">x{star.liXinSihua}</span>}
                                      {star.sihua && <span className="ml-1 text-orange-600 dark:text-orange-400 font-bold">{star.sihua}</span>}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500 dark:text-slate-400">No Stars</span>
                              )}
                            </div>
                          </div>

                          {/* 财帛宫 - 箭身 */}
                          <div className="py-4 border-b border-gray-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                                <h6 className="font-semibold text-yellow-700 dark:text-yellow-400 text-sm">Wealth Palace (Arrow Shaft)</h6>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-slate-400">
                                {arrowAnalysis.caiPo?.heavenlyStem}{arrowAnalysis.caiPo?.branch}
                              </div>
                            </div>
                            <div className="ml-6">
                              {arrowAnalysis.caiPo?.stars && arrowAnalysis.caiPo.stars.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {arrowAnalysis.caiPo.stars.map((star, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-slate-700/40 text-gray-800 dark:text-slate-300 rounded text-xs">
                                      {translateStarName(star.name)}({star.brightness})
                                      {star.xiangXinSihua && <span className="ml-1 text-blue-600 dark:text-blue-400 font-bold">i{star.xiangXinSihua}</span>}
                                      {star.liXinSihua && <span className="ml-1 text-purple-600 dark:text-purple-400 font-bold">x{star.liXinSihua}</span>}
                                      {star.sihua && <span className="ml-1 text-orange-600 dark:text-orange-400 font-bold">{star.sihua}</span>}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500 dark:text-slate-400">No Stars</span>
                              )}
                            </div>
                          </div>

                          {/* 官禄宫 - 箭羽 */}
                          <div className="py-4 border-b border-gray-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                <h6 className="font-semibold text-blue-700 dark:text-blue-400 text-sm">Career Palace (Arrow Fletching)</h6>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-slate-400">
                                {arrowAnalysis.guanLu?.heavenlyStem}{arrowAnalysis.guanLu?.branch}
                              </div>
                            </div>
                            <div className="ml-6">
                              {arrowAnalysis.guanLu?.stars && arrowAnalysis.guanLu.stars.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {arrowAnalysis.guanLu.stars.map((star, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-slate-700/40 text-gray-800 dark:text-slate-300 rounded text-xs">
                                      {translateStarName(star.name)}({star.brightness})
                                      {star.xiangXinSihua && <span className="ml-1 text-blue-600 dark:text-blue-400 font-bold">i{star.xiangXinSihua}</span>}
                                      {star.liXinSihua && <span className="ml-1 text-purple-600 dark:text-purple-400 font-bold">x{star.liXinSihua}</span>}
                                      {star.sihua && <span className="ml-1 text-orange-600 dark:text-orange-400 font-bold">{star.sihua}</span>}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500 dark:text-slate-400">No Stars</span>
                              )}
                            </div>
                          </div>
                            
                            {/* 紫微推理AI分析 */}
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-600">
                              <SimpleAsyncAnalysis
                                title="Zi Wei Astrology Master"
                                analysisType="ziwei"
                                analysisData={{
                                  ...birthData,
                                  cacheKey: `ziwei_${birthData.year}_${birthData.month}_${birthData.day}_${birthData.hour}_${birthData.gender}`,
                                  palaceData: arrowAnalysis,
                                  sihuaInfo: ziweiResult.sihuaInfo, // 🔥 直接使用预计算的四化信息
                                  mingGong: {
                                    name: '命宫',
                                    position: `${arrowAnalysis.mingGong?.heavenlyStem}${arrowAnalysis.mingGong?.branch}`,
                                    stars: arrowAnalysis.mingGong?.stars?.map(star => {
                                      let result = `${star.name}(${star.brightness})`
                                      if (star.xiangXinSihua) result += `i${star.xiangXinSihua}`
                                      if (star.liXinSihua) result += `x${star.liXinSihua}`
                                      if (star.sihua) result += star.sihua
                                      return result
                                    }).join('、') || '无星曜'
                                  },
                                  qianYi: {
                                    name: '迁移宫',
                                    position: `${arrowAnalysis.qianYi?.heavenlyStem}${arrowAnalysis.qianYi?.branch}`,
                                    stars: arrowAnalysis.qianYi?.stars?.map(star => {
                                      let result = `${star.name}(${star.brightness})`
                                      if (star.xiangXinSihua) result += `i${star.xiangXinSihua}`
                                      if (star.liXinSihua) result += `x${star.liXinSihua}`
                                      if (star.sihua) result += star.sihua
                                      return result
                                    }).join('、') || '无星曜'
                                  },
                                  caiPo: {
                                    name: '财帛宫',
                                    position: `${arrowAnalysis.caiPo?.heavenlyStem}${arrowAnalysis.caiPo?.branch}`,
                                    stars: arrowAnalysis.caiPo?.stars?.map(star => {
                                      let result = `${star.name}(${star.brightness})`
                                      if (star.xiangXinSihua) result += `i${star.xiangXinSihua}`
                                      if (star.liXinSihua) result += `x${star.liXinSihua}`
                                      if (star.sihua) result += star.sihua
                                      return result
                                    }).join('、') || '无星曜'
                                  },
                                  guanLu: {
                                    name: '官禄宫',
                                    position: `${arrowAnalysis.guanLu?.heavenlyStem}${arrowAnalysis.guanLu?.branch}`,
                                    stars: arrowAnalysis.guanLu?.stars?.map(star => {
                                      let result = `${star.name}(${star.brightness})`
                                      if (star.xiangXinSihua) result += `i${star.xiangXinSihua}`
                                      if (star.liXinSihua) result += `x${star.liXinSihua}`
                                      if (star.sihua) result += star.sihua
                                      return result
                                    }).join('、') || '无星曜'
                                  }
                                }}
                              />
                            </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-amber-400 mb-6 font-noto text-center">Zi Wei Dou Shu Chart</h2>
              <p className="text-lg text-purple-600/80 dark:text-slate-300 font-light">Enter your birth information to get professional Zi Wei astrology analysis</p>
            </div>



            <div className="bg-white dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-4 lg:p-6 relative">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 items-center mb-6 lg:mb-8">
                <div>
                  <Label htmlFor="username" className="text-purple-600 dark:text-amber-400 text-base lg:text-lg font-semibold font-noto text-center">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={birthData.username}
                    onChange={(e) => setBirthData({ ...birthData, username: e.target.value })}
                    className="mt-2 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 focus:border-purple-500 dark:focus:border-amber-400 focus:ring-purple-500 dark:focus:ring-amber-400"
                  />
                </div>
                <div>
                  <Label className="text-purple-600 dark:text-amber-400 text-base lg:text-lg font-semibold font-noto text-center">Gender</Label>
                  <div className="flex space-x-2 lg:space-x-4 mt-2">
                    <Button
                      variant={birthData.gender === "male" ? "default" : "outline"}
                      onClick={() => setBirthData({ ...birthData, gender: "male" })}
                      className={`${birthData.gender === "male" ? "bg-purple-600 dark:bg-amber-500 hover:bg-purple-700 dark:hover:bg-amber-600 text-white" : "border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/60"}`}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Male
                    </Button>
                    <Button
                      variant={birthData.gender === "female" ? "default" : "outline"}
                      onClick={() => setBirthData({ ...birthData, gender: "female" })}
                      className={`${birthData.gender === "female" ? "bg-purple-600 dark:bg-amber-500 hover:bg-purple-700 dark:hover:bg-amber-600 text-white" : "border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/60"}`}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Female
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-purple-600 dark:text-amber-400 text-base lg:text-lg font-semibold font-noto text-center">Category</Label>
                  <Select value={birthData.category} onValueChange={(value) => setBirthData({ ...birthData, category: value })}>
                    <SelectTrigger className="mt-2 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 focus:border-purple-500 dark:focus:border-amber-400 focus:ring-purple-500 dark:focus:ring-amber-400">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                      {categories.map((category) => (
                        <SelectItem 
                          key={category.key} 
                          value={category.key} 
                          className="text-gray-900 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <div>
                  <Label htmlFor="year" className="text-purple-600 dark:text-amber-400 text-base lg:text-lg font-semibold font-noto text-center">
                    Birth Year
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="1990"
                    value={birthData.year}
                    onChange={(e) => setBirthData({ ...birthData, year: e.target.value })}
                    className="mt-2 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 focus:border-purple-500 dark:focus:border-amber-400 focus:ring-purple-500 dark:focus:ring-amber-400"
                  />
                </div>
                <div>
                  <Label htmlFor="month" className="text-purple-600 dark:text-amber-400 text-base lg:text-lg font-semibold font-noto text-center">
                    Birth Month
                  </Label>
                  <Select value={birthData.month} onValueChange={(value) => setBirthData({ ...birthData, month: value })}>
                  <SelectTrigger className="mt-2 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 focus:border-purple-500 dark:focus:border-amber-400 focus:ring-purple-500 dark:focus:ring-amber-400">
                      <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()} className="text-gray-900 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700">
                          Month {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="day" className="text-purple-600 dark:text-amber-400 text-base lg:text-lg font-semibold font-noto text-center">
                    Birth Day
                  </Label>
                  <Select value={birthData.day} onValueChange={(value) => setBirthData({ ...birthData, day: value })}>
                  <SelectTrigger className="mt-2 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 focus:border-purple-500 dark:focus:border-amber-400 focus:ring-purple-500 dark:focus:ring-amber-400">
                      <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                    {Array.from({ length: 31 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()} className="text-gray-900 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700">
                          Day {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hour" className="text-purple-600 dark:text-amber-400 text-base lg:text-lg font-semibold font-noto text-center">
                    Birth Hour
                  </Label>
                  <Select value={birthData.hour} onValueChange={(value) => setBirthData({ ...birthData, hour: value })}>
                  <SelectTrigger className="mt-2 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 focus:border-purple-500 dark:focus:border-amber-400 focus:ring-purple-500 dark:focus:ring-amber-400">
                      <SelectValue placeholder="Select hour" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()} className="text-gray-900 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700">
                          {i}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleCalculate} disabled={isCalculating || !birthData.username || !birthData.year || !birthData.month || !birthData.day || !birthData.hour || !birthData.gender} className="w-full bg-purple-600 dark:bg-amber-500 hover:bg-purple-700 dark:hover:bg-amber-600">
                    <Save className="mr-2 h-4 w-4" />
                    {isCalculating ? 'Calculating...' : 'Save & Create Chart'}
                  </Button>
                  {ziweiResult && (
                    <Button onClick={handleSave} className="w-full bg-green-600 dark:bg-emerald-600 hover:bg-green-700 dark:hover:bg-emerald-700">
                      <Save className="mr-2 h-4 w-4" />
                      Save Record
                    </Button>
                  )}
              </div>
            </div>
          </div>
              )}
      </div>
      
      {/* AI分析结果弹窗 */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-white dark:bg-slate-800 flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold text-purple-600 dark:text-amber-400">
              <Bot className="w-6 h-6" />
              Destiny Arrow - AI Pattern Analysis
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              <div className="whitespace-pre-wrap text-gray-800 dark:text-slate-200 leading-relaxed text-sm">
                {(() => {
                  // 显示本地缓存的分析结果
                  const existingAnalysis = checkExistingAnalysis();
                  if (existingAnalysis) {
                    return existingAnalysis.result;
                  }
                  return 'Please click the Zi Wei Astrology Master button below to start analysis';
                })()}
              </div>
              
              {/* 分析完成提示 */}
              {checkExistingAnalysis() && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-600">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                    <span>✨ Professional Zi Wei analysis complete</span>
                    <span>• Based on traditional Zi Wei Dou Shu theory</span>
                    <span>• From cache</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 购买次数对话框 */}
      <PurchaseDialog 
        open={showPurchaseDialog} 
        onOpenChange={setShowPurchaseDialog}
      />

      {/* 紫微VS八字对比弹窗 */}
      <Dialog open={showZiweiVsBaziModal} onOpenChange={setShowZiweiVsBaziModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-white dark:bg-slate-800 flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold text-purple-600 dark:text-amber-400">
              💡 Zi Wei Dou Shu VS BaZi Astrology
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 flex-1 overflow-y-auto pr-2">
            <div className="space-y-6">
              {/* 基本介绍 */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400 mb-3">两大命理体系的智慧对比</h3>
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                  紫微斗数和八字命理都是中华传统文化中的瑰宝，它们从不同角度揭示人生的奥秘。了解两者的特点，有助于您更全面地认识自己的命运。
                </p>
              </div>

              {/* 对比表格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 紫微斗数 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    紫微斗数
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-semibold text-purple-700 dark:text-purple-300 text-sm mb-2">📊 Analysis Method</h4>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">
                        Chart-centered approach using the combination of 12 palaces and 108 stars for intuitive visual analysis
                      </p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-semibold text-purple-700 dark:text-purple-300 text-sm mb-2">🎯 Analysis Focus</h4>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">
                        Focuses on life patterns, personality traits, relationships, and career development from a macro perspective
                      </p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-semibold text-purple-700 dark:text-purple-300 text-sm mb-2">⭐ Unique Advantages</h4>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">
                        Intuitive star chart, clear palace concepts, deep Four Transformations analysis, suitable for comprehensive life understanding
                      </p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-semibold text-purple-700 dark:text-purple-300 text-sm mb-2">📈 Prediction Features</h4>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">
                        Decade and yearly luck analysis, Four Transformations flying stars prediction, specializes in medium to long-term fortune analysis and life planning guidance
                      </p>
                    </div>
                  </div>
                </div>

                {/* 八字命理 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    八字命理
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <h4 className="font-semibold text-amber-700 dark:text-amber-300 text-sm mb-2">📊 分析方式</h4>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">
                        基于四柱八字（年月日时），通过五行生克制化关系进行精密推算
                      </p>
                    </div>
                    
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <h4 className="font-semibold text-amber-700 dark:text-amber-300 text-sm mb-2">🎯 分析重点</h4>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">
                        专注五行平衡、用神分析、财官印食的具体运用和细致的时间预测
                      </p>
                    </div>
                    
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <h4 className="font-semibold text-amber-700 dark:text-amber-300 text-sm mb-2">⭐ 独特优势</h4>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">
                        理论严谨，逻辑性强，五行分析深入，擅长精确的命运推算和趋势判断
                      </p>
                    </div>
                    
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <h4 className="font-semibold text-amber-700 dark:text-amber-300 text-sm mb-2">📈 预测特色</h4>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">
                        大运流年细致分析，五行旺衰变化，擅长具体事件的时间预测和吉凶判断
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 应用建议 */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-3">💡 使用建议</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 text-sm mb-2">适合选择紫微斗数</h4>
                    <ul className="text-gray-600 dark:text-slate-400 text-sm space-y-1">
                      <li>• 希望全面了解人生格局</li>
                      <li>• 关注人际关系和事业发展</li>
                      <li>• 喜欢直观的星盘分析</li>
                      <li>• 需要中长期人生规划</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-600 dark:text-amber-400 text-sm mb-2">适合选择八字命理</h4>
                    <ul className="text-gray-600 dark:text-slate-400 text-sm space-y-1">
                      <li>• 追求精确的时间预测</li>
                      <li>• 关注五行平衡调理</li>
                      <li>• 喜欢逻辑性强的分析</li>
                      <li>• 需要具体事件的吉凶判断</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 结合使用 */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-purple-50 dark:from-green-900/20 dark:to-purple-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-3">🌟 最佳实践</h3>
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed mb-3">
                  两个体系各有优势，结合使用效果更佳：
                </p>
                <ul className="text-gray-600 dark:text-slate-400 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>用紫微斗数了解整体格局和性格特质</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>用八字命理进行精确的时间预测</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>互相验证，提高预测的准确性</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>从多角度获得更全面的人生指导</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 免责声明 */}
      <DisclaimerCard className="mt-8" />
    </div>
    </EnglishLayout>
  );
}

export default React.memo(ZiweiPage);
