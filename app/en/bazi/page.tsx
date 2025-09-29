"use client";
// @ts-expect-error next-dynamic-flag
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useDailyCheckin } from '@/hooks/useDailyCheckin';

import IntegratedWuxingAnalysis from '@/components/IntegratedWuxingAnalysis';
import DayMasterAnalysis from '@/components/DayMasterAnalysis';
import { useBaziStore } from '@/stores/bazi-store';
import { useBaziCalculation } from '@/hooks/useBaziCalculation';
import { useBaziDataManager } from '@/hooks/useBaziDataManager';
import { calculateWuxingScore } from '@/lib/zodiac/wuxing-scoring';
import { getElement, Element } from '@/lib/zodiac/elements';
import { apiClient } from '@/lib/api-client';
import { TEN_GODS_RELATIONS } from '@/lib/zodiac/ten-gods';
import { HIDDEN_STEMS } from '@/lib/zodiac/hidden-stems';
import { type HeavenlyStem } from '@/lib/zodiac/stems';
import { Clock, Target, Book, BarChart3, Sparkles, Lightbulb, Settings, Save, CheckCircle, Eye, Download } from 'lucide-react';
import { SafeCrown } from '@/components/ui/safe-icon';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';
import MobileAsyncAnalysis from '@/components/MobileAsyncAnalysis';
import { analyzeBaziRelations, type BaziRelations } from '@/lib/zodiac/bazi-relations';
import { EnglishPageWrapper } from '@/components/EnglishLayout';
import { DisclaimerCard } from '@/components/DisclaimerCard';

// 五行颜色映射
const getElementColor = (element: Element | undefined): string => {
  switch (element) {
    case '木': return 'text-green-600 dark:text-green-400';
    case '火': return 'text-red-600 dark:text-red-400';
    case '土': return 'text-amber-700 dark:text-amber-500';
    case '金': return 'text-yellow-600 dark:text-yellow-400';
    case '水': return 'text-blue-600 dark:text-blue-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
};

// Ten Gods English translation mapping
const getTenGodTranslation = (tenGod: string): string => {
  const translationMap: { [key: string]: string } = {
    '比肩': 'Peer',
    '劫财': 'Rival',
    '食神': 'Prosperity',
    '伤官': 'Drama',
    '偏财': 'Fortune',
    '正财': 'Wealth',
    '七杀': 'War',
    '正官': 'Authority',
    '偏印': 'Oracle',
    '枭神': 'Oracle',
    '正印': 'Scholar'
  };
  return translationMap[tenGod] || tenGod;
};

// 创建supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Enhanced styling for modern BaZi interface
const styles = `
  .bazi-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x pan-y;
  }
  
  .bazi-scroll::-webkit-scrollbar {
    height: 6px;
  }
  
  .bazi-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .bazi-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }
  
  .bazi-scroll::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.8);
  }
  
  .bazi-pillar {
    transition: all 0.2s ease-in-out;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  
  .dark .bazi-pillar {
    background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
    border: 1px solid #475569;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .bazi-pillar:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .dark .bazi-pillar:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  
  .cycle-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(226, 232, 240, 0.8);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .dark .cycle-card {
    background: rgba(51, 65, 85, 0.9);
    border: 1px solid rgba(71, 85, 105, 0.8);
  }
  
  .cycle-card:hover {
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
  
  .dark .cycle-card:hover {
    box-shadow: 0 8px 25px rgba(0,0,0,0.4);
  }
`;

const yongShenOptions = [
  {
    element: 'Wood',
    chinese: '木',
    emoji: '🌳',
    className: 'border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
  },
  {
    element: 'Fire',
    chinese: '火',
    emoji: '🔥',
    className: 'border-rose-200 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400'
  },
  {
    element: 'Earth',
    chinese: '土',
    emoji: '🏔️',
    className: 'border-amber-200 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400'
  },
  {
    element: 'Metal',
    chinese: '金',
    emoji: '⚒️',
    className: 'border-yellow-200 dark:border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
  },
  {
    element: 'Water',
    chinese: '水',
    emoji: '💧',
    className: 'border-sky-200 dark:border-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 text-sky-600 dark:text-sky-400'
  }
] as const;

export default function BaziAnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chartId = searchParams.get('chartId');
  
  // 获取URL参数
  const autoLoad = searchParams.get('autoLoad');
  const urlName = searchParams.get('name');
  const urlYear = searchParams.get('year');
  const urlMonth = searchParams.get('month');
  const urlDay = searchParams.get('day');
  const urlHour = searchParams.get('hour');
  const urlGender = searchParams.get('gender');
  const urlSource = searchParams.get('source');
  
  const [showScienceModal, setShowScienceModal] = useState(false);
  const [showTimeEditModal, setShowTimeEditModal] = useState(false);
  const [showRelationModal, setShowRelationModal] = useState(false);
  const [tempHour, setTempHour] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFleetingYear, setSelectedFleetingYear] = useState<any>(null);
  const [storedYongShen, setStoredYongShen] = useState<any>(null);
  const [isLoadingYongShen, setIsLoadingYongShen] = useState(false);
  const [isExtractingYongShen, setIsExtractingYongShen] = useState(false);

  
  // 从store获取状态
  const {
    birthData,
    baziResult,
    isCalculating,
    luckInfo,
    luckCycles,
    selectedLuckCycle,
    fleetingYears,
    updateBirthDataField,
  } = useBaziStore();



  // 五虎遁法则计算流月
  const calculateFleetingMonths = useMemo(() => {
    if (!selectedFleetingYear || !baziResult) return [];
    
    const yearGan = selectedFleetingYear.gan;
    
    // 五虎遁法则：甲己起丙寅，乙庚起戊寅，丙辛起庚寅，丁壬起壬寅，戊癸起甲寅
    const wuhuDunMap: { [key: string]: string } = {
      '甲': '丙', '己': '丙',
      '乙': '戊', '庚': '戊',
      '丙': '庚', '辛': '庚',
      '丁': '壬', '壬': '壬',
      '戊': '甲', '癸': '甲'
    };
    
    const startGan = wuhuDunMap[yearGan];
    if (!startGan) return [];
    
    // 天干序列
    const tiangans = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    // 地支序列（月份对应）
    const dizhis = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
    // 月份名称
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const startIndex = tiangans.indexOf(startGan);
    const months = [];
    
    for (let i = 0; i < 12; i++) {
      const ganIndex = (startIndex + i) % 10;
      const gan = tiangans[ganIndex];
      const zhi = dizhis[i];
      const monthName = monthNames[i];
      
      // 计算十神关系
      const dayMaster = baziResult.day.heavenlyStem;
      const ganTenGod = TEN_GODS_RELATIONS[dayMaster as HeavenlyStem]?.[gan as HeavenlyStem] || '';
      
      // 地支十神关系应该使用地支藏干的本气
      const zhiHiddenStem = HIDDEN_STEMS[zhi as keyof typeof HIDDEN_STEMS]?.primary;
      const zhiTenGod = zhiHiddenStem ? TEN_GODS_RELATIONS[dayMaster as HeavenlyStem]?.[zhiHiddenStem] || '' : '';
      
      months.push({
        monthName,
        gan,
        zhi,
        ganZhi: gan + zhi,
        ganTenGod,
        zhiTenGod,
        monthNumber: i + 1
      });
    }
    
    return months;
  }, [selectedFleetingYear, baziResult]);
  
  // 获取每日签到状态
  const { canCheckinToday, performCheckin } = useDailyCheckin();

  // 天干地支关系检测函数
  const baziRelations = useMemo(() => {
    if (!baziResult) return null;
    
    const bazi = [
      baziResult.year.heavenlyStem, baziResult.year.earthlyBranch,
      baziResult.month.heavenlyStem, baziResult.month.earthlyBranch,
      baziResult.day.heavenlyStem, baziResult.day.earthlyBranch,
      baziResult.hour.heavenlyStem, baziResult.hour.earthlyBranch
    ];
    
    return analyzeBaziRelations(bazi);
  }, [baziResult]);
  
  // 衍生状态
  const hasValidBirthData = birthData.year && birthData.month && 
                           birthData.day && birthData.hour && 
                           birthData.gender && birthData.username;
  const hasBaziResult = !!baziResult;
  const dayMaster = baziResult?.day?.heavenlyStem || '';
  const shouldSave = false; // 简化版暂时不需要保存

  // 使用自定义hooks
  const { performCalculation, selectLuckCycle, canCalculate } = useBaziCalculation();
  const { enableSaving } = useBaziDataManager(chartId);

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
      updateBirthDataField('username', urlName);
      updateBirthDataField('year', urlYear);
      updateBirthDataField('month', urlMonth);
      updateBirthDataField('day', urlDay);
      updateBirthDataField('hour', urlHour);
      updateBirthDataField('gender', urlGender);

      // 延迟自动计算，确保数据已更新
      setTimeout(() => {
        performCalculation(false);
      }, 100);
    }
  }, [autoLoad, urlName, urlYear, urlMonth, urlDay, urlHour, urlGender, urlSource, updateBirthDataField, performCalculation]);

  // 滚动到指定卡片的函数
  const scrollToCard = useCallback((cardId: string) => {
    const element = document.getElementById(cardId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      // 菜单已移除
    }
  }, []);

  // 获取已存储的用神信息 - 支持外部数据参数，解决时序问题
  const loadStoredYongShen = useCallback(async (externalBirthData?: any) => {
    setIsLoadingYongShen(true);
    try {
          const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      // 如果有chartId，直接查询该命盘的用神信息
      if (chartId) {
        const response = await apiClient.get(`/api/charts/${chartId}`);

          if (response.success) {
          const chartData = response.data;

          if (chartData?.yongshen_info) {
            setStoredYongShen(chartData.yongshen_info);
            return;
          }
        }
          }

      // 如果没有chartId或chartId查询失败，使用姓名匹配查询
      const dataToUse = externalBirthData || birthData;
      
      // 验证数据完整性
      if (!dataToUse.username || !dataToUse.year || !dataToUse.month || 
          !dataToUse.day || !dataToUse.hour || !dataToUse.gender) {
        setStoredYongShen(null);
        return;
      }

      // 查询用户命盘记录中的用神信息
          const response = await apiClient.get('/api/charts');

          if (response.success) {
        const data = response.data;
        const charts = data.data || [];
        
        // 查找匹配的命盘记录
        const matchingChart = charts.find((chart: any) => 
          chart.name === dataToUse.username &&
          chart.birth_year === parseInt(dataToUse.year) &&
          chart.birth_month === parseInt(dataToUse.month) &&
          chart.birth_day === parseInt(dataToUse.day) &&
          chart.birth_hour === parseInt(dataToUse.hour) &&
          chart.gender === dataToUse.gender &&
          chart.chart_type === 'bazi' &&
          chart.yongshen_info
        );

        if (matchingChart && matchingChart.yongshen_info) {
          setStoredYongShen(matchingChart.yongshen_info);
            } else {
          setStoredYongShen(null);
            }
          }
        } catch (error) {
      console.error('获取用神信息失败:', error);
      setStoredYongShen(null);
        } finally {
      setIsLoadingYongShen(false);
    }
  }, [birthData, chartId]);

  // 当八字结果完成后，加载用神信息
  useEffect(() => {
    if (hasBaziResult && hasValidBirthData) {
      loadStoredYongShen();
    }
  }, [hasBaziResult, hasValidBirthData, loadStoredYongShen, chartId, birthData.username, birthData.year, birthData.month, birthData.day, birthData.hour, birthData.gender]);



  // 初始化时辰修改弹窗
  useEffect(() => {
    if (showTimeEditModal) {
      setTempHour(birthData.hour);
    }
  }, [showTimeEditModal, birthData.hour]);

  // 处理横向滚动的鼠标滚轮事件
  const handleHorizontalScroll = useCallback((e: React.WheelEvent) => {
    // 只有在事件可取消时才尝试阻止默认行为
    if (e.cancelable) {
      e.preventDefault();
    }
    const container = e.currentTarget as HTMLDivElement;
    container.scrollLeft += e.deltaY;
  }, []);

  // 处理时辰修改
  const handleTimeEdit = useCallback(async () => {
    if (!tempHour) return;
    
    setIsSaving(true);
    try {
      // 更新本地状态
      updateBirthDataField('hour', tempHour);
      
      // 如果有chartId，则同时更新数据库
      if (chartId) {
        // 获取当前session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error('Authentication failed');
        }
        
        // 调用API更新数据库记录
          const response = await apiClient.put(`/api/charts/${chartId}`, {
            birth_hour: tempHour
          });
        
        if (!response.success) {
          throw new Error('Database save failed');
        }
      }
      
      // 重新计算八字并保存修改
      await performCalculation(true);
      
      toast({
        title: 'Birth hour updated successfully',
        description: 'BaZi automatically recalculated',
        variant: 'default'
      });
      
      setShowTimeEditModal(false);
      } catch (error) {
      console.error('时辰修改失败:', error);
      toast({
        title: 'Update failed',
        description: chartId ? 'Database save failed, please try again' : 'Recalculation failed, please try again',
        variant: 'destructive'
      });
      } finally {
      setIsSaving(false);
    }
  }, [tempHour, updateBirthDataField, chartId, performCalculation]);

  // 手动提取用神信息
  const handleExtractYongShen = useCallback(async () => {
    if (!chartId) return;
    
    setIsExtractingYongShen(true);
        try {
          // WalletConnect认证由apiClient自动处理
          console.log('🔄 Extracting YongShen info');

      // 调用后端API提取用神信息
      const response = await apiClient.post('/api/charts/extract-yongshen', {
        chartId
      });

      if (!response.success) {
        const errorData = response.data;
        throw new Error(errorData.error || 'Failed to extract focal element information');
      }

            const result = response.data;
      const extractedData = result.data;

      // 更新UI显示
      setStoredYongShen(extractedData);
              
      // 显示提取成功信息
      const isUpdate = !!storedYongShen;
      const description = isUpdate 
        ? `Updated focal element: ${extractedData.primaryYongShen}${extractedData.jiShen.length > 0 ? `, harmful: ${extractedData.jiShen.join(', ')}` : ''}`
        : `Extracted focal element: ${extractedData.primaryYongShen}${extractedData.jiShen.length > 0 ? `, harmful: ${extractedData.jiShen.join(', ')}` : ''}`;
      
      toast({
        title: isUpdate ? 'Update successful!' : 'Extraction successful!',
        description,
        variant: 'default'
      });

        } catch (error) {
      console.error('提取用神失败:', error);
      toast({
        title: 'Extraction failed',
        description: error instanceof Error ? error.message : 'Focal element extraction failed, please try again',
        variant: 'destructive'
      });
    } finally {
      setIsExtractingYongShen(false);
    }
  }, [chartId, storedYongShen]);

  // 手动选择用神
  const handleManualYongShenSelect = useCallback(async (selectedElement: string) => {
    if (!chartId) return;
    
    setIsExtractingYongShen(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication failed');
      }

      // 获取当前的birth_data用于API调用
      const currentBirthData = {
        name: urlName || birthData.username || 'User',
        year: parseInt(urlYear || '') || parseInt(birthData.year || '') || new Date().getFullYear(),
        month: parseInt(urlMonth || '') || parseInt(birthData.month || '') || 1,
        day: parseInt(urlDay || '') || parseInt(birthData.day || '') || 1,
        hour: parseInt(urlHour || '') || parseInt(birthData.hour || '') || 0,
        gender: urlGender || birthData.gender || '男'
      };

      // 构造用神信息
      const yongShenInfo = {
        primaryYongShen: selectedElement,
        jiShen: [],
        confidence: 1.0,
        manual: true,
        analysisDate: new Date().toISOString()
      };

      // 调用保存用神API
      const response = await apiClient.post('/api/charts/save-yongshen', {
        birth_data: currentBirthData,
        chart_type: 'bazi',
        yongshen_info: yongShenInfo
      });

      if (!response.success) {
        const errorData = response.data;
        throw new Error(errorData.error || 'Failed to save focal element information');
      }

      response.data;
      
      // 更新本地状态
      const newYongShenData = {
        yongShen: selectedElement,
        jiShen: [],
        confidence: 1.0,
        manual: true,
        createdAt: new Date().toISOString()
      };
      
      setStoredYongShen(newYongShenData);
      
      toast({
        title: 'Focal Element Saved',
        description: `Your focal element (${selectedElement}) has been saved successfully!`,
        variant: 'default'
      });

    } catch (error) {
      console.error('保存用神失败:', error);
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Failed to save focal element, please try again',
        variant: 'destructive'
      });
    } finally {
      setIsExtractingYongShen(false);
    }
  }, [chartId]);

  // 缓存的计算结果
  const wuxingScore = useMemo(() => {
    if (!hasBaziResult) return null;
    const bazi = [
      baziResult.year.heavenlyStem, baziResult.year.earthlyBranch,
      baziResult.month.heavenlyStem, baziResult.month.earthlyBranch,
      baziResult.day.heavenlyStem, baziResult.day.earthlyBranch,
      baziResult.hour.heavenlyStem, baziResult.hour.earthlyBranch
    ];
    return calculateWuxingScore(bazi);
  }, [baziResult, hasBaziResult]);

  // 大运选择处理函数
  const handleSelectLuckCycle = useCallback((cycle: any) => {
    selectLuckCycle(cycle);
  }, [selectLuckCycle]);

  const renderPillar = (pillarName: string, pillarData: any) => {
    if (!pillarData) {
      return null;
    }
    return (
      <div className="pillar-frame bazi-pillar rounded-xl border border-gray-200 dark:border-slate-600 p-3 sm:p-4 md:p-5 shadow-sm min-h-[180px] sm:min-h-[200px] flex flex-col relative hover:shadow-lg transition-all duration-300">
        {/* Hour Pillar edit button */}
        {pillarName === 'Hour Pillar' && (
          <button
            onClick={() => setShowTimeEditModal(true)}
            className="absolute top-1 right-1 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 z-10 group"
            title="Edit birth hour"
          >
            <Clock className="w-3 h-3" />
            <span className="absolute top-6 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Edit Hour
            </span>
          </button>
        )}
        
        <div className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1 sm:mb-2 font-noto text-center">{pillarName}</div>
        <div className="text-xs text-center text-gray-700 dark:text-slate-300 mb-1 sm:mb-2 min-h-[16px]">
            {pillarName === 'Day Master' ? 
                <span className="text-red-500 dark:text-rose-400 font-bold">{birthData.gender === 'male' ? 'Male Chart' : 'Female Chart'}</span> :
                <span className="text-xs">{getTenGodTranslation(TEN_GODS_RELATIONS[baziResult?.day.heavenlyStem as HeavenlyStem]?.[pillarData.heavenlyStem as HeavenlyStem] || '')}</span>
            }
        </div>
        <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 font-noto flex flex-col items-center">
          <span className={getElementColor(getElement(pillarData.heavenlyStem as HeavenlyStem))}>{pillarData.heavenlyStem}</span>
        </div>
        <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 font-noto flex flex-col items-center">
          <span className={getElementColor(getElement(pillarData.earthlyBranch as HeavenlyStem))}>{pillarData.earthlyBranch}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-start text-xs space-y-1">
          {(() => {
            const hiddenStems = HIDDEN_STEMS[pillarData.earthlyBranch as keyof typeof HIDDEN_STEMS];
            const stems = [hiddenStems?.primary, hiddenStems?.secondary, hiddenStems?.tertiary].filter(stem => stem !== undefined);
            return stems.map(stem => (
              <div key={stem} className="flex items-center justify-center gap-1 w-full">
                <span className="text-gray-900 dark:text-slate-100 text-xs font-medium">{stem}</span>
                <span className="text-xs text-gray-500 dark:text-slate-400">|</span>
                <span className="text-gray-700 dark:text-slate-300 text-xs">{getTenGodTranslation(TEN_GODS_RELATIONS[baziResult?.day.heavenlyStem as HeavenlyStem][stem as HeavenlyStem])}</span>
              </div>
            ));
          })()}
        </div>
      </div>
    );
  };

  return (
    <EnglishPageWrapper title="BaZi Natal" showNavigation={true}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <style dangerouslySetInnerHTML={{__html: styles}} />
        

        
        {/* 主要内容 */}
        <div className="mx-auto flex w-full max-w-page flex-col gap-section-stack px-page-inline pb-0 md:pb-4">
        {/* 输入表单 - 只在没有八字结果且没有chartId时显示 */}
        {!hasBaziResult && !chartId && (
          <Card className="mt-6 rounded-section border border-slate-200 bg-gradient-to-br from-white to-blue-50 p-card-padding shadow-soft dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Birth Information</CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-300">
                Provide birth details to calculate your BaZi chart.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
                <Label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</Label>
                <Input
                  id="username"
                  value={birthData.username}
                  onChange={(e) => updateBirthDataField('username', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="year" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Birth Year</Label>
                <Input
                  id="year"
                  value={birthData.year}
                  onChange={(e) => updateBirthDataField('year', e.target.value)}
                  placeholder="e.g.: 1990"
                />
                </div>
              <div>
                <Label htmlFor="month" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Birth Month</Label>
                <Input
                  id="month"
                  value={birthData.month}
                  onChange={(e) => updateBirthDataField('month', e.target.value)}
                  placeholder="e.g.: 6"
                />
              </div>
              <div>
                <Label htmlFor="day" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Birth Day</Label>
                <Input
                  id="day"
                  value={birthData.day}
                  onChange={(e) => updateBirthDataField('day', e.target.value)}
                  placeholder="e.g.: 15"
                />
              </div>
              <div>
                <Label htmlFor="hour">Birth Hour</Label>
                <Input
                  id="hour"
                  value={birthData.hour}
                  onChange={(e) => updateBirthDataField('hour', e.target.value)}
                  placeholder="e.g.: 14"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gender</Label>
                <Select value={birthData.gender} onValueChange={(value) => updateBirthDataField('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
              <div className="mt-6">
              <Button
                onClick={() => {
                  enableSaving(); // 🔥 新增：启用保存功能，用于手动排盘
                  performCalculation(true);
                }}
                disabled={!canCalculate || isCalculating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {isCalculating ? 'Calculating...' : 'Calculate BaZi'}
              </Button>
            </div>
            </CardContent>
          </Card>
        )}

        {/* 结果展示 */}
        {hasBaziResult && (
          <div className="mt-4">
            {/* 八字四柱展示 */}
            <Card
              id="bazi-chart"
              className="relative mb-6 border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50 p-card-padding shadow-soft dark:border-slate-700 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900"
            >
              {/* 命盘卡片的干支关系按钮 */}
              {baziRelations && (
                <button
                  onClick={() => setShowRelationModal(true)}
                  className="absolute top-4 left-4 px-3 py-1 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-800 transition-colors text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 z-10 text-sm font-medium border border-orange-500 dark:border-orange-600"
                  title="Heavenly Stems and Earthly Branches Relationships"
                >
                  Stem-Branch Relations
                </button>
              )}
              
              {/* 命盘卡片的右上角科普按钮 */}
              <button
                onClick={() => setShowScienceModal(true)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-800/40 transition-colors text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 z-10"
                title="BaZi Knowledge"
              >
                <Lightbulb className="w-4 h-4" />
              </button>
              
              <h3 className="mb-6 text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {birthData.username ? `${birthData.username}'s` : 'Your'} BaZi Chart
              </h3>
              
              {/* 八字四柱 */}
                <div className="w-full max-w-6xl mx-auto overflow-x-auto px-2 sm:px-0">
                {/* Mobile: Display four pillars in responsive grid */}
                <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:hidden mb-4">
                  {renderPillar("Year Pillar", baziResult.year)}
                  {renderPillar("Month Pillar", baziResult.month)}
                </div>
                <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:hidden mb-4">
                  {renderPillar("Day Master", baziResult.day)}
                  {renderPillar("Hour Pillar", baziResult.hour)}
                </div>
                {/* Desktop: Display four pillars in single row */}
                <div className="hidden sm:grid sm:grid-cols-4 sm:gap-4 md:gap-6 mb-4">
                  {renderPillar("Year Pillar", baziResult.year)}
                  {renderPillar("Month Pillar", baziResult.month)}
                  {renderPillar("Day Master", baziResult.day)}
                  {renderPillar("Hour Pillar", baziResult.hour)}
                </div>
              </div>

              {/* 大运滑动展示 - 取消外边框ring */}
              {luckCycles && luckCycles.length > 0 && (
                <div className="mt-1.5">
                  <h4 className="text-sm font-semibold mb-1.5 text-gray-900 dark:text-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span>🔄</span> Luck Cycles
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {luckInfo ? luckInfo.split('，')[0] : ''}
                      </span>
                    </div>
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full">
                      Scroll to view
                    </span>
                  </h4>
                  
                  {/* 删除单独的起运信息 */}
                  <div className="relative group">
                    {/* 左侧渐变遮罩 */}
                    <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white dark:from-slate-800 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {/* 右侧渐变遮罩 */}
                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-slate-800 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div 
                      className="flex overflow-x-auto gap-2 pb-2 bazi-scroll"
                      onWheel={handleHorizontalScroll}
                    >
                      {luckCycles.map((cycle, index) => (
                        <div
                          key={index}
                          className={`relative flex-shrink-0 cursor-pointer transition-all duration-200 origin-center ${
                            selectedLuckCycle?.ganZhi === cycle.ganZhi
                              ? 'transform scale-105 z-50 origin-center'
                              : 'hover:transform hover:scale-102 z-20'
                          }`}
                          onClick={() => handleSelectLuckCycle(cycle)}
                        >
                          <div className={`w-16 sm:w-18 p-2 sm:p-3 rounded-lg text-center relative text-xs transition-all duration-300 hover:shadow-lg transform hover:scale-105 cycle-card ${
                            selectedLuckCycle?.ganZhi === cycle.ganZhi
                              ? 'bg-yellow-100 dark:bg-amber-400/20 shadow-lg'
                              : 'bg-white dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/80 hover:shadow-sm'
                          }`}>
                            {/* 选中指示器 */}
                            {selectedLuckCycle?.ganZhi === cycle.ganZhi && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 dark:bg-amber-400 rounded-full border-2 border-white dark:border-slate-800 z-10"></div>
                            )}
                            <div className="space-y-0.5">
                              <div className="font-bold text-xs text-gray-900 dark:text-slate-100">
                                Age {cycle.age}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-slate-400">
                                {cycle.year}
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center justify-center gap-0.5">
                              <span className={getElementColor(getElement(cycle.gan as HeavenlyStem))}>{cycle.gan}</span>
                                  <span className="text-xs text-gray-400 dark:text-slate-500">{getTenGodTranslation(cycle.ganTenGod)}</span>
                            </div>
                                <div className="flex items-center justify-center gap-0.5">
                                  <span className={getElementColor(getElement(cycle.zhi as HeavenlyStem))}>{cycle.zhi}</span>
                                  <span className="text-xs text-gray-400 dark:text-slate-500">{getTenGodTranslation(cycle.zhiTenGod)}</span>
                                </div>
                              </div>
                            </div>
                            </div>
                        </div>
                      ))}
                      </div>
                    </div>
                  </div>
                )}
                
              {/* 流年滑动展示 */}
                {fleetingYears && selectedLuckCycle && (
                <div className="mt-1.5">
                  <h4 className="text-sm font-semibold mb-1.5 text-gray-900 dark:text-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span>📅</span> Fleeting Years
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                        {selectedLuckCycle.ganZhi} Cycle
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {fleetingYears.length} years total
                      </span>
                    </div>
                    </h4>
                  <div className="relative group">
                    {/* 左侧渐变遮罩 */}
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-white dark:from-slate-800 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {/* 右侧渐变遮罩 */}
                    <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-white dark:from-slate-800 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div 
                      className="flex overflow-x-auto gap-1.5 pb-2 bazi-scroll"
                      onWheel={handleHorizontalScroll}
                    >
                      {fleetingYears.map((yearInfo, index) => (
                        <div
                          key={yearInfo.year}
                          className={`flex-shrink-0 w-14 sm:w-16 p-1.5 sm:p-2 rounded-lg border cursor-pointer text-xs transition-all duration-300 hover:shadow-lg relative transform hover:scale-105 cycle-card ${
                            selectedFleetingYear?.year === yearInfo.year
                              ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-600 shadow-md'
                              : 'bg-white dark:bg-slate-700/60 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/80'
                          }`}
                          onClick={() => setSelectedFleetingYear(yearInfo)}
                          title={`${yearInfo.year}年 - ${yearInfo.gan}${yearInfo.zhi}`}
                        >
                          {/* 选中指示器 */}
                          {selectedFleetingYear?.year === yearInfo.year && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 dark:bg-blue-400 rounded-full border border-white dark:border-slate-800 z-10"></div>
                          )}
                          <div className="text-center space-y-0.5">
                            <div className="font-bold text-xs text-gray-900 dark:text-slate-100">
                              {yearInfo.year}
                          </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center justify-center gap-0.5">
                                <span className={getElementColor(getElement(yearInfo.gan as HeavenlyStem))}>{yearInfo.gan}</span>
                                <span className="text-xs text-gray-400 dark:text-slate-500">{getTenGodTranslation(yearInfo.ganTenGod)}</span>
                              </div>
                              <div className="flex items-center justify-center gap-0.5">
                                <span className={getElementColor(getElement(yearInfo.zhi as HeavenlyStem))}>{yearInfo.zhi}</span>
                                <span className="text-xs text-gray-400 dark:text-slate-500">{getTenGodTranslation(yearInfo.zhiTenGod)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>
                  </div>
                )}
              
              {/* 流月滑动展示 */}
              {selectedFleetingYear && calculateFleetingMonths.length > 0 && (
                <div className="mt-1.5">
                  <h4 className="text-sm font-semibold mb-1.5 text-gray-900 dark:text-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span>📅</span> Fleeting Months
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                        {selectedFleetingYear.year}
                      </span>
                    </div>
                  </h4>
                  <div className="relative group">
                    {/* 左侧渐变遮罩 */}
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-white dark:from-slate-800 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {/* 右侧渐变遮罩 */}
                    <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-white dark:from-slate-800 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div 
                      className="flex overflow-x-auto gap-1.5 pb-2 bazi-scroll"
                      onWheel={handleHorizontalScroll}
                    >
                      {calculateFleetingMonths.map((monthInfo, index) => (
                        <div
                          key={monthInfo.monthNumber}
                          className="flex-shrink-0 w-12 sm:w-14 p-1 sm:p-1.5 rounded bg-white dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/80 transition-all duration-200 hover:shadow-sm text-xs"
                          title={`${monthInfo.monthName} - ${monthInfo.gan}${monthInfo.zhi}`}
                        >
                          <div className="text-center space-y-0.5">
                            <div className="font-bold text-xs text-gray-900 dark:text-slate-100">
                              {monthInfo.monthName}
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center justify-center gap-0.5">
                                <span className={getElementColor(getElement(monthInfo.gan as HeavenlyStem))}>{monthInfo.gan}</span>
                                <span className="text-xs text-gray-400 dark:text-slate-500">{getTenGodTranslation(monthInfo.ganTenGod)}</span>
                              </div>
                              <div className="flex items-center justify-center gap-0.5">
                                <span className={getElementColor(getElement(monthInfo.zhi as HeavenlyStem))}>{monthInfo.zhi}</span>
                                <span className="text-xs text-gray-400 dark:text-slate-500">{getTenGodTranslation(monthInfo.zhiTenGod)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* 铁口直断 */}
        {hasBaziResult && (
          <div className="mt-4">
            <div id="tiekou-zhiduan" className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <SafeCrown className="w-5 h-5 text-orange-500" />
                Categorical Prediction
              </h3>
              <MobileAsyncAnalysis
                title="Categorical Prediction"
                  analysisType="tiekou"
                  analysisData={{
                    cacheKey: `bazi_${birthData.year}_${birthData.month}_${birthData.day}_${birthData.hour}_${birthData.gender}`,
                    yearPillar: `${baziResult.year.heavenlyStem}${baziResult.year.earthlyBranch}`,
                    monthPillar: `${baziResult.month.heavenlyStem}${baziResult.month.earthlyBranch}`,
                    dayPillar: `${baziResult.day.heavenlyStem}${baziResult.day.earthlyBranch}`,
                    hourPillar: `${baziResult.hour.heavenlyStem}${baziResult.hour.earthlyBranch}`,
                    gender: birthData.gender === 'male' ? '男' : '女',
                    username: birthData.username,
                    year: birthData.year,
                    month: birthData.month,
                    day: birthData.day,
                    hour: birthData.hour
                  }}
                />
                            </div>
                                </div>
        )}

        {/* 日主五行分析 */}
        {hasBaziResult && (
          <div id="day-master-analysis" className="mt-4">
            <DayMasterAnalysis
              dayMasterStem={dayMaster}
              gender={birthData.gender as 'male' | 'female'}
            />
                              </div>
        )}

        {/* 五行分析 */}
        {hasBaziResult && wuxingScore && (
          <div id="wuxing-analysis" className="mt-4 pt-6">
            <IntegratedWuxingAnalysis
              elements={{
                wood: Math.round(wuxingScore.wood),
                fire: Math.round(wuxingScore.fire),
                earth: Math.round(wuxingScore.earth),
                metal: Math.round(wuxingScore.metal),
                water: Math.round(wuxingScore.water)
              }}
              bazi={[
                    baziResult.year.heavenlyStem, baziResult.year.earthlyBranch,
                    baziResult.month.heavenlyStem, baziResult.month.earthlyBranch,
                    baziResult.day.heavenlyStem, baziResult.day.earthlyBranch,
                    baziResult.hour.heavenlyStem, baziResult.hour.earthlyBranch
              ]}
              dayMaster={dayMaster}
              yongShenInfo={storedYongShen ? {
                primaryYongShen: storedYongShen.primaryYongShen,
                jiShen: storedYongShen.jiShen
              } : undefined}
              isEnglish={true}
            />
          </div>
        )}

        {/* 用神推理大师 */}
        {hasBaziResult && (
          <div id="yongshen-master" className="mt-4">
            <Card className="rounded-section border border-slate-200 bg-gradient-to-br from-white to-purple-50 p-card-padding shadow-soft dark:border-slate-700 dark:from-slate-800 dark:to-purple-900/20">
              <CardHeader className="flex flex-row items-center gap-2 p-0 pb-3">
                <Sparkles className="h-6 w-6 text-purple-500" />
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Focal Element Master
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-0">
              {/* 已存储的用神信息显示 */}
              {isLoadingYongShen ? (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading stored focal element information...</span>
                          </div>
                          </div>
              ) : storedYongShen ? (
                <Card className="mb-4 border border-green-200 bg-green-50 p-card-padding shadow-soft dark:border-green-800 dark:bg-green-900/20">
                  <CardHeader className="gap-3 p-0 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-green-800 dark:text-green-300">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      Analyzed Focal Element Information
                    </CardTitle>
                    {chartId && (
                      <Button
                        onClick={handleExtractYongShen}
                        disabled={isExtractingYongShen}
                        size="sm"
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-800"
                      >
                        {isExtractingYongShen ? (
                          <>
                            <Clock className="mr-1 h-3 w-3 animate-spin" />
                            Extracting
                          </>
                        ) : (
                          <>
                            <Download className="mr-1 h-3 w-3" />
                            Re-extract
                          </>
                        )}
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 p-0">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-md border-2 border-green-300 bg-green-50 p-card-padding text-center dark:border-green-700 dark:bg-green-900/20">
                        <div className="mb-2 text-gray-600 dark:text-gray-400 font-medium">Beneficial</div>
                        <div className={`text-xl font-bold ${getElementColor(storedYongShen.primaryYongShen as any)}`}>
                          {storedYongShen.primaryYongShen}
                        </div>
                      </div>
                      <div className="rounded-md border-2 border-red-300 bg-red-50 p-card-padding text-center dark:border-red-700 dark:bg-red-900/20">
                        <div className="mb-2 text-gray-600 dark:text-gray-400 font-medium">Harmful</div>
                        <div className={`text-xl font-bold ${storedYongShen.jiShen && storedYongShen.jiShen.length > 0 ? getElementColor(storedYongShen.jiShen[0] as any) : 'text-gray-500'}`}>
                          {storedYongShen.jiShen && storedYongShen.jiShen.length > 0 ? storedYongShen.jiShen.join('、') : '无'}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      {storedYongShen.secondaryYongShen && (
                        <div className="rounded-md border border-green-300 bg-white p-3 dark:border-green-700 dark:bg-slate-800">
                          <span className="text-gray-600 dark:text-gray-400">Secondary:</span>
                          <span className="ml-1 font-semibold text-green-700 dark:text-green-300">
                            {storedYongShen.secondaryYongShen}
                          </span>
                        </div>
                      )}
                      {storedYongShen.geLu && (
                        <div className="rounded-md border border-green-300 bg-white p-3 dark:border-green-700 dark:bg-slate-800">
                          <span className="text-gray-600 dark:text-gray-400">格局：</span>
                          <span className="ml-1 font-semibold text-purple-600 dark:text-purple-400">
                            {storedYongShen.geLu}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      分析时间：{new Date(storedYongShen.analysisDate).toLocaleString()}
                      {storedYongShen.confidence && (
                        <span className="ml-3">置信度：{Math.round(storedYongShen.confidence * 100)}%</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : hasValidBirthData && (
                <Card className="mb-4 border border-yellow-200 bg-yellow-50 p-card-padding shadow-soft dark:border-yellow-800 dark:bg-yellow-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">No Focal Element Information Found</h4>
                  </div>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    You have not analyzed focal element information yet. Please click "Start Analysis" below to begin focal element analysis.
                  </p>
                </Card>
              )}

              <MobileAsyncAnalysis
                  title="Focal Element Master"
                  analysisType="yongshen"
                  analysisData={{
                    cacheKey: `bazi_${birthData.year}_${birthData.month}_${birthData.day}_${birthData.hour}_${birthData.gender}`,
                    yearPillar: `${baziResult.year.heavenlyStem}${baziResult.year.earthlyBranch}`,
                    monthPillar: `${baziResult.month.heavenlyStem}${baziResult.month.earthlyBranch}`,
                    dayPillar: `${baziResult.day.heavenlyStem}${baziResult.day.earthlyBranch}`,
                    hourPillar: `${baziResult.hour.heavenlyStem}${baziResult.hour.earthlyBranch}`,
                    gender: birthData.gender === 'male' ? '男' : '女',
                    username: birthData.username,
                    year: birthData.year,
                    month: birthData.month,
                    day: birthData.day,
                    hour: birthData.hour
                  }}
                onComplete={(result) => {
                  // 分析完成后重新加载用神信息
                  setTimeout(() => {
                    loadStoredYongShen();
                  }, 2000); // 增加延迟，确保数据已保存
                                  }}
                />
                
                {/* 用神手动选择界面 */}
                {chartId && !storedYongShen && (
                  <Card className="mt-4 border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-card-padding shadow-soft dark:border-amber-800 dark:from-amber-900/20 dark:to-orange-900/20">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-amber-600 dark:text-amber-400">🎯</span>
                      <h4 className="font-medium text-amber-800 dark:text-amber-300">
                        Select Your Focal Element (Yong Shen)
                      </h4>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                      After reading the analysis report above, please select the most suitable focal element for better accuracy:
                    </p>
                    
                    {/* 五行选择按钮 */}
                    <div className="grid grid-cols-2 min-[480px]:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
                      {yongShenOptions.map((item) => (
                        <button
                          key={item.element}
                          onClick={() => handleManualYongShenSelect(item.chinese)}
                          disabled={isExtractingYongShen}
                          className={`p-3 rounded-lg border transition-all hover:scale-105 active:scale-95 bg-white dark:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 ${item.className}`}
                        >
                          <div className="text-xl mb-1">{item.emoji}</div>
                          <div className="text-xs font-medium">{item.element}</div>
                          <div className="text-xs opacity-70">{item.chinese}</div>
                        </button>
                      ))}
                    </div>
                    
                    <div className="rounded bg-amber-100 p-2 text-xs text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                      💡 <strong>Tip:</strong> The focal element is usually what you need most based on your chart's balance and life goals.
                    </div>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* 科普知识弹窗 */}
      {showScienceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-orange-500" />
                BaZi Knowledge
              </h3>
              <button
                onClick={() => setShowScienceModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">🔮 What is BaZi?</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  BaZi is based on a person's birth year, month, day, and hour, represented by eight characters using Heavenly Stems and Earthly Branches.
                  Each time point is represented by one Heavenly Stem and one Earthly Branch, totaling eight characters, hence called "BaZi" (Eight Characters).
                </p>
          </div>
              
              <div>
                <h4 className="font-semibold mb-2">🌟 The Ten Gods (十神) Explained</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  The Ten Gods are fundamental concepts in BaZi, representing different energy relationships between the Day Master and other Heavenly Stems. Each Ten God carries unique meanings and influences:
                </p>
                
                <div className="grid gap-3">
                  {/* Same Element Gods */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Same Element as Day Master</h5>
                    <div className="space-y-2">
                      <div><strong>比肩 (Peer):</strong> <span className="text-gray-600 dark:text-gray-400">Self-confidence, independence, competition with equals</span></div>
                      <div><strong>劫财 (Rival):</strong> <span className="text-gray-600 dark:text-gray-400">Competitiveness, financial risks, brotherhood challenges</span></div>
                    </div>
                  </div>

                  {/* Generated by Day Master */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2">Generated by Day Master</h5>
                    <div className="space-y-2">
                      <div><strong>食神 (Prosperity):</strong> <span className="text-gray-600 dark:text-gray-400">Creativity, talent expression, peaceful wealth generation</span></div>
                      <div><strong>伤官 (Drama):</strong> <span className="text-gray-600 dark:text-gray-400">Innovation, rebellion, emotional expression, artistic talent</span></div>
                    </div>
                  </div>

                  {/* Restrained by Day Master */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <h5 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Restrained by Day Master</h5>
                    <div className="space-y-2">
                      <div><strong>偏财 (Fortune):</strong> <span className="text-gray-600 dark:text-gray-400">Flexible wealth, business opportunities, father relationship</span></div>
                      <div><strong>正财 (Wealth):</strong> <span className="text-gray-600 dark:text-gray-400">Stable income, traditional wealth, wife/spouse relationship</span></div>
                    </div>
                  </div>

                  {/* Restraining Day Master */}
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <h5 className="font-semibold text-red-700 dark:text-red-300 mb-2">Restraining Day Master</h5>
                    <div className="space-y-2">
                      <div><strong>七杀 (War):</strong> <span className="text-gray-600 dark:text-gray-400">Aggressive power, challenges, pressure, potential for great achievement</span></div>
                      <div><strong>正官 (Authority):</strong> <span className="text-gray-600 dark:text-gray-400">Legitimate power, career advancement, social status, leadership</span></div>
                    </div>
                  </div>

                  {/* Generating Day Master */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <h5 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Generating Day Master</h5>
                    <div className="space-y-2">
                      <div><strong>偏印 (Oracle):</strong> <span className="text-gray-600 dark:text-gray-400">Unconventional learning, spiritual insight, irregular support</span></div>
                      <div><strong>正印 (Scholar):</strong> <span className="text-gray-600 dark:text-gray-400">Academic achievement, mother relationship, traditional knowledge</span></div>
                    </div>
                  </div>
                </div>
            </div>

                <div>
                <h4 className="font-semibold mb-2">🔄 Luck Cycles and Annual Influences</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Luck Cycles are 10-year periods of fortune changes in life, while Annual Influences refer to each year's fortune.
                  By analyzing the relationship between Luck Cycles, Annual Influences, and BaZi, we can understand fortune characteristics in different periods.
                </p>
                  </div>
              
              <div>
                <h4 className="font-semibold mb-2">🌈 Five Elements Generation and Restraint</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  The Five Elements include Metal, Wood, Water, Fire, Earth. Generation: Wood generates Fire, Fire generates Earth, Earth generates Metal, Metal generates Water, Water generates Wood.
                  Restraint: Wood restrains Earth, Earth restrains Water, Water restrains Fire, Fire restrains Metal, Metal restrains Wood.
                </p>
            </div>
              
              <div>
                <h4 className="font-semibold mb-2">⚖️ Five Elements Balance</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  By calculating the strength and weakness of the Five Elements in BaZi, we can understand the balance state of destiny.
                  People with balanced Five Elements usually have stable fortune, while those with imbalanced elements need to pay attention to harmony in life.
                </p>
          </div>
            </div>
          </div>
        </div>
      )}

      {/* 时辰修改弹窗 */}
      {showTimeEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                修改时辰
              </h3>
              <button
                onClick={() => setShowTimeEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
                <div>
                <Label htmlFor="tempHour">时辰（24小时制）</Label>
                  <Input
                  id="tempHour"
                  type="number"
                  min="0"
                  max="23"
                  value={tempHour}
                  onChange={(e) => setTempHour(e.target.value)}
                  placeholder="例如：14"
                />
                <p className="text-xs text-gray-500 mt-1">
                  请输入0-23的数字，例如：14表示下午2点
                </p>
                </div>
              
              <div className="flex gap-2">
                    <Button
                  onClick={handleTimeEdit}
                  disabled={!tempHour || isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    '保存修改'
                  )}
                    </Button>
                    <Button
                  variant="outline"
                  onClick={() => setShowTimeEditModal(false)}
                  className="flex-1"
                >
                  取消
                    </Button>
                  </div>
                </div>
                          </div>
                </div>
      )}

      {/* 天干地支关系弹窗 */}
      {showRelationModal && baziRelations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-orange-500 font-bold">干支关系</span>
                提示：
              </h3>
              <button
                onClick={() => setShowRelationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
                </div>
            
            {/* 整合显示存在的关系 */}
            <div className="space-y-4 text-sm">
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">🔍 命盘中的干支关系：</h4>
                
                {/* 收集所有存在的关系 */}
                {(() => {
                  const existingRelations = [];
                  
                  if (baziRelations.tianganWuhe.length > 0) {
                    existingRelations.push({
                      category: '天干五合',
                      items: baziRelations.tianganWuhe,
                      color: 'text-amber-700 dark:text-amber-400',
                      bg: 'bg-amber-50 dark:bg-amber-900/20'
                    });
                  }
                  
                  if (baziRelations.dizhiLiuhe.length > 0) {
                    existingRelations.push({
                      category: '地支六合',
                      items: baziRelations.dizhiLiuhe,
                      color: 'text-blue-700 dark:text-blue-400',
                      bg: 'bg-blue-50 dark:bg-blue-900/20'
                    });
                  }
                  
                  if (baziRelations.dizhiSanhui.length > 0) {
                    existingRelations.push({
                      category: '地支三会',
                      items: baziRelations.dizhiSanhui,
                      color: 'text-green-700 dark:text-green-400',
                      bg: 'bg-green-50 dark:bg-green-900/20'
                    });
                  }
                  
                  if (baziRelations.dizhiSanhe.length > 0) {
                    existingRelations.push({
                      category: '地支三合',
                      items: baziRelations.dizhiSanhe,
                      color: 'text-purple-700 dark:text-purple-400',
                      bg: 'bg-purple-50 dark:bg-purple-900/20'
                    });
                  }
                  
                  if (baziRelations.dizhiBanhe.length > 0) {
                    existingRelations.push({
                      category: '地支半合',
                      items: baziRelations.dizhiBanhe,
                      color: 'text-teal-700 dark:text-teal-400',
                      bg: 'bg-teal-50 dark:bg-teal-900/20'
                    });
                  }
                  
                  if (baziRelations.dizhiGonghe.length > 0) {
                    existingRelations.push({
                      category: '地支拱合',
                      items: baziRelations.dizhiGonghe,
                      color: 'text-indigo-700 dark:text-indigo-400',
                      bg: 'bg-indigo-50 dark:bg-indigo-900/20'
                    });
                  }
                  
                  if (baziRelations.dizhiChong.length > 0) {
                    existingRelations.push({
                      category: '地支相冲',
                      items: baziRelations.dizhiChong,
                      color: 'text-red-700 dark:text-red-400',
                      bg: 'bg-red-50 dark:bg-red-900/20'
                    });
                  }
                  
                  if (baziRelations.dizhiChuanhai.length > 0) {
                    existingRelations.push({
                      category: '地支相穿',
                      items: baziRelations.dizhiChuanhai,
                      color: 'text-orange-700 dark:text-orange-400',
                      bg: 'bg-orange-50 dark:bg-orange-900/20'
                    });
                  }
                  
                  if (baziRelations.dizhiXing.length > 0) {
                    existingRelations.push({
                      category: '地支相刑',
                      items: baziRelations.dizhiXing,
                      color: 'text-purple-700 dark:text-purple-400',
                      bg: 'bg-purple-50 dark:bg-purple-900/20'
                    });
                  }
                  
                  if (baziRelations.dizhiPo.length > 0) {
                    existingRelations.push({
                      category: '地支相破',
                      items: baziRelations.dizhiPo,
                      color: 'text-red-700 dark:text-red-400',
                      bg: 'bg-red-50 dark:bg-red-900/20'
                    });
                  }
                  
                  if (baziRelations.dizhiJue.length > 0) {
                    existingRelations.push({
                      category: '地支相绝',
                      items: baziRelations.dizhiJue,
                      color: 'text-blue-700 dark:text-blue-400',
                      bg: 'bg-blue-50 dark:bg-blue-900/20'
                    });
                  }
                  
                  if (baziRelations.angong.length > 0) {
                    existingRelations.push({
                      category: '暗拱',
                      items: baziRelations.angong,
                      color: 'text-purple-700 dark:text-purple-400',
                      bg: 'bg-purple-50 dark:bg-purple-900/20'
                    });
                  }
                  
                  if (existingRelations.length === 0) {
                    return (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        此命盘中未发现特殊的干支关系
                      </p>
                    );
                  }
                  
                  return (
                    <div className="space-y-3">
                      {existingRelations.map((relation, index) => (
                        <div key={index} className={`p-3 rounded-lg ${relation.bg}`}>
                          <h5 className={`font-medium mb-2 ${relation.color}`}>
                            {relation.category}：
                          </h5>
                          <div className="space-y-1">
                            {relation.items.map((item, itemIndex) => (
                              <span key={itemIndex} className={`inline-block px-2 py-1 rounded text-sm mr-2 mb-1 ${relation.color} ${relation.bg}`}>
                                {item}
                              </span>
                            ))}
                </div>
                </div>
                      ))}
                </div>
                  );
                })()}
              </div>
              
              {/* 问AI大师按钮 */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    // 生成干支关系总结文本
                    const allRelations = [
                      ...baziRelations.tianganWuhe,
                      ...baziRelations.dizhiLiuhe,
                      ...baziRelations.dizhiSanhui,
                      ...baziRelations.dizhiSanhe,
                      ...baziRelations.dizhiBanhe,
                      ...baziRelations.dizhiGonghe,
                      ...baziRelations.dizhiChong,
                      ...baziRelations.dizhiChuanhai,
                      ...baziRelations.dizhiXing,
                      ...baziRelations.dizhiPo,
                      ...baziRelations.dizhiJue,
                      ...baziRelations.angong
                    ];
                    
                    const relationText = allRelations.length > 0 
                      ? `干支关系提示：${allRelations.join('、')}`
                      : '干支关系提示：此命盘中未发现特殊的干支关系';
                    
                    // 跳转到聊天页面并预设问题
                    const encodedText = encodeURIComponent(relationText + '。请分析这些干支关系对命主的影响。');
                    router.push(`/chatbot?preset=${encodedText}`);
                    setShowRelationModal(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>🤖</span> 问AI大师
                </button>
                <button
                  onClick={() => setShowRelationModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  关闭
                </button>
              </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 免责声明 */}
        <DisclaimerCard className="mt-8" />
    </div>
    </EnglishPageWrapper>
  );
} 
