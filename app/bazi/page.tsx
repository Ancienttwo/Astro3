"use client"

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
import { TEN_GODS_RELATIONS } from '@/lib/zodiac/ten-gods';
import { HIDDEN_STEMS } from '@/lib/zodiac/hidden-stems';
import { type HeavenlyStem } from '@/lib/zodiac/stems';
import { Clock, Target, Book, BarChart3, Sparkles, Lightbulb, Settings, Save, CheckCircle, Eye, Download, User, Calendar } from 'lucide-react';
import { SafeCrown } from '@/components/ui/safe-icon';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';
import MobileAsyncAnalysis from '@/components/MobileAsyncAnalysis';
import { analyzeBaziRelations, type BaziRelations } from '@/lib/zodiac/bazi-relations';
import SmartLayout from '@/components/SmartLayout';
import { apiClient } from '@/lib/api-client'

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

// 十神简称映射
const getShortTenGod = (tenGod: string): string => {
  const shortMap: { [key: string]: string } = {
    '比肩': '比',
    '劫财': '劫',
    '食神': '食',
    '伤官': '伤',
    '偏财': '才',
    '正财': '财',
    '七杀': '杀',
    '正官': '官',
    '偏印': '枭',
    '枭神': '枭',
    '正印': '印'
  };
  return shortMap[tenGod] || tenGod;
};

// 创建supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 样式定义
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
`;

// 子卡片导航组件
const BaziSubCardNavigation = ({ hasBaziResult, scrollToCard }: { hasBaziResult: boolean, scrollToCard: (cardId: string) => void }) => {
  const navItems = [
    { id: 'bazi-chart', name: '八字命盘', icon: '📊', description: '四柱干支排盘' },
    { id: 'day-master-analysis', name: '日主五行', icon: '🌟', description: '五行个性分析' },
    { id: 'wuxing-analysis', name: '五行分析', icon: '⚖️', description: '五行力量对比' },
    { id: 'yongshen-master', name: '用神推理', icon: '✨', description: '用神喜忌分析' },
    { id: 'tiekou-zhiduan', name: '铁口直断', icon: '🎯', description: '命运直断预测' },
  ];

  if (!hasBaziResult) {
    return null;
  }

  return (
    <div className="bg-white/95 dark:bg-[#1A2242]/90 backdrop-blur-sm border border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 rounded-xl p-4 shadow-lg mb-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-slate-100">分析导航</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToCard(item.id)}
            className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-800 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-800/30 dark:hover:to-amber-800/30 transition-all duration-200 hover:shadow-md hover:scale-105 group"
          >
            <div className="text-center">
              <div className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
                {item.name}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {item.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default function BaziAnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chartId = searchParams.get('chartId');
  const lang = searchParams.get('lang');
  const isEnglish = lang === 'en';
  
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
    showMenu,
    setShowMenu,
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
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
    
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

  const menuRef = useRef<HTMLDivElement>(null);

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
      setShowMenu(false); // 关闭菜单
    }
  }, [setShowMenu]);

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
          const result = response.data;
          const chartData = result.data;

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

  // 处理点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowMenu]);

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
          throw new Error('认证失败');
        }
        
        // 调用API更新数据库记录
          const response = await apiClient.put(`/api/charts/${chartId}`, {
            birth_hour: tempHour
          });
        
        if (!response.success) {
          throw new Error('数据库保存失败');
        }
      }
      
      // 重新计算八字并保存修改
      await performCalculation(true);
      
      toast({
        title: '时辰修改成功',
        description: '已自动重新计算八字',
        variant: 'default'
      });
      
      setShowTimeEditModal(false);
      } catch (error) {
      console.error('时辰修改失败:', error);
      toast({
        title: '修改失败',
        description: chartId ? '数据库保存失败，请稍后重试' : '重新计算失败，请稍后重试',
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
          console.log('🔄 提取用神信息');

      // 调用后端API提取用神信息
      const response = await apiClient.post('/api/charts/extract-yongshen', {
          chartId
        });

      if (!response.success) {
        const errorData = response.data;
        throw new Error(errorData.error || '提取用神信息失败');
      }

            const result = response.data;
      const extractedData = result.data;

      // 更新UI显示
      setStoredYongShen(extractedData);
              
      // 显示提取成功信息
      const isUpdate = !!storedYongShen;
      const description = isUpdate 
        ? `已更新用神信息：${extractedData.primaryYongShen}${extractedData.jiShen.length > 0 ? `，忌神：${extractedData.jiShen.join('、')}` : ''}`
        : `已提取用神信息：${extractedData.primaryYongShen}${extractedData.jiShen.length > 0 ? `，忌神：${extractedData.jiShen.join('、')}` : ''}`;
      
      toast({
        title: isUpdate ? '更新成功！' : '提取成功！',
        description,
        variant: 'default'
      });

        } catch (error) {
      console.error('提取用神失败:', error);
      toast({
        title: '提取失败',
        description: error instanceof Error ? error.message : '用神信息提取失败，请稍后重试',
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
        throw new Error('认证失败');
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
        throw new Error(errorData.error || '保存用神信息失败');
      }

      response.data;
      
      // 更新本地状态
      const newYongShenData = {
        primaryYongShen: selectedElement,
        jiShen: [],
        confidence: 1.0,
        manual: true,
        createdAt: new Date().toISOString()
      };
      
      setStoredYongShen(newYongShenData);
      
      toast({
        title: '用神保存成功',
        description: `您的用神（${selectedElement}）已成功保存！`,
        variant: 'default'
      });

    } catch (error) {
      console.error('保存用神失败:', error);
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '用神保存失败，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsExtractingYongShen(false);
    }
  }, [chartId, urlName, urlYear, urlMonth, urlDay, urlHour, urlGender, birthData]);

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
      <div className="pillar-frame bg-white/95 dark:bg-[#1A2242]/80 backdrop-blur-sm rounded-xl border border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 p-2 sm:p-3 md:p-4 shadow-sm min-h-[180px] sm:min-h-[200px] flex flex-col relative">
        {/* 时柱的修改时辰按钮 - 降低显示条件 */}
        {pillarName === '时柱' && (
          <button
            onClick={() => setShowTimeEditModal(true)}
            className="absolute top-1 right-1 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 z-10 group"
            title="修改时辰重新排盘"
          >
            <Clock className="w-3 h-3" />
            <span className="absolute top-6 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              修改时辰
            </span>
          </button>
        )}
        
        <div className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1 sm:mb-2 font-noto text-center">{pillarName}</div>
        <div className="text-xs text-center text-gray-700 dark:text-slate-300 mb-1 sm:mb-2 min-h-[16px]">
            {pillarName === '日元' ? 
                <span className="text-red-500 dark:text-rose-400 font-bold">{birthData.gender === 'male' ? '乾造' : '坤造'}</span> :
                <span className="text-xs">{TEN_GODS_RELATIONS[baziResult?.day.heavenlyStem as HeavenlyStem]?.[pillarData.heavenlyStem as HeavenlyStem] || ''}</span>
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
                <span className="text-gray-700 dark:text-slate-300 text-xs">{TEN_GODS_RELATIONS[baziResult?.day.heavenlyStem as HeavenlyStem][stem as HeavenlyStem]}</span>
              </div>
            ));
          })()}
        </div>
      </div>
    );
  };

  return (
    <SmartLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isEnglish ? 'BaZi Natal' : '八字分析'}
          </h1>
          <p className="text-gray-600 dark:text-slate-300">
            {isEnglish ? 'Four Pillars of Destiny analysis' : '四柱八字命理分析'}
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-6">
        {/* Birth Information Form */}
        {!hasBaziResult && !chartId && (
          <div>
            <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-4">
              {isEnglish ? 'Birth Information' : '出生信息'}
            </h2>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  <User className="w-4 h-4 mr-2" />
                  {isEnglish ? 'Name' : '姓名'}
                </label>
                <Input
                  value={birthData.username}
                  onChange={(e) => updateBirthDataField('username', e.target.value)}
                  placeholder={isEnglish ? "Enter name" : "请输入姓名"}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-800 dark:border-slate-600"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  {isEnglish ? 'Gender' : '性别'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateBirthDataField('gender', 'male')}
                    className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      birthData.gender === 'male'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isEnglish ? 'Male' : '男'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateBirthDataField('gender', 'female')}
                    className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      birthData.gender === 'female'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isEnglish ? 'Female' : '女'}
                  </button>
                </div>
              </div>

              {/* Birth Time */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  {isEnglish ? 'Birth Time' : '出生时间'}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Year */}
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      {isEnglish ? 'Year' : '年'}
                    </label>
                    <Input
                      value={birthData.year}
                      onChange={(e) => updateBirthDataField('year', e.target.value)}
                      placeholder={isEnglish ? "1990" : "1990"}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-800 dark:border-slate-600"
                    />
                  </div>
                  
                  {/* Month */}
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      {isEnglish ? 'Month' : '月'}
                    </label>
                    <Input
                      value={birthData.month}
                      onChange={(e) => updateBirthDataField('month', e.target.value)}
                      placeholder={isEnglish ? "6" : "6"}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-800 dark:border-slate-600"
                    />
                  </div>
                  
                  {/* Day */}
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      {isEnglish ? 'Day' : '日'}
                    </label>
                    <Input
                      value={birthData.day}
                      onChange={(e) => updateBirthDataField('day', e.target.value)}
                      placeholder={isEnglish ? "15" : "15"}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-800 dark:border-slate-600"
                    />
                  </div>
                  
                  {/* Hour */}
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      {isEnglish ? 'Hour' : '时'}
                    </label>
                    <Input
                      value={birthData.hour}
                      onChange={(e) => updateBirthDataField('hour', e.target.value)}
                      placeholder={isEnglish ? "14" : "14"}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-800 dark:border-slate-600"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="pt-2 mt-6">
              <Button
                onClick={() => {
                  enableSaving();
                  performCalculation(true);
                }}
                disabled={!canCalculate || isCalculating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2.5 disabled:opacity-50"
              >
                {isCalculating 
                  ? (isEnglish ? 'Calculating...' : '正在计算...') 
                  : (isEnglish ? 'Save and Start Analysis' : '保存并开始分析')
                }
              </Button>
            </div>
          </div>
        )}

        {/* 结果展示 */}
        {hasBaziResult && (
          <div className="mt-4">
            {/* 八字四柱展示 */}
            <div id="bazi-chart" className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm mb-4 relative border border-gray-200 dark:border-slate-700">
              {/* 命盘卡片的干支关系按钮 */}
              {baziRelations && (
                <button
                  onClick={() => setShowRelationModal(true)}
                  className="absolute top-4 left-4 px-3 py-1 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-800 transition-colors text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 z-10 text-sm font-medium border border-orange-500 dark:border-orange-600"
                  title="天干地支关系"
                >
                  干支关系
                </button>
              )}
              
              {/* 命盘卡片的右上角科普按钮 */}
              <button
                onClick={() => setShowScienceModal(true)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-800/40 transition-colors text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 z-10"
                title="八字科普知识"
              >
                <Lightbulb className="w-4 h-4" />
              </button>
              
              <h3 className="text-lg font-semibold mb-4 text-center">{birthData.username} 的八字命盘</h3>
              
              {/* 八字四柱 */}
                <div className="w-full max-w-6xl mx-auto overflow-x-auto">
                <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-2 min-w-[320px]">
                                    {renderPillar("年柱", baziResult.year)}
                  {renderPillar("月柱", baziResult.month)}
                  {renderPillar("日元", baziResult.day)}
                    {renderPillar("时柱", baziResult.hour)}
                  </div>
                </div>

              {/* 大运滑动展示 - 取消外边框ring */}
              {luckCycles && luckCycles.length > 0 && (
                <div className="mt-1.5">
                  <h4 className="text-sm font-semibold mb-1.5 text-gray-900 dark:text-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>🔄</span> 大运周期
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {luckInfo ? luckInfo.split('，')[0] : ''}
                      </span>
                    </div>
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full">
                      滑动查看
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
                          className={`flex-shrink-0 cursor-pointer transition-all duration-200 ${
                            selectedLuckCycle?.ganZhi === cycle.ganZhi
                              ? 'transform scale-105 z-50 origin-center'
                              : 'hover:transform hover:scale-102 z-20'
                          }`}
                          onClick={() => handleSelectLuckCycle(cycle)}
                          style={{
                            position: 'relative',
                            transformOrigin: 'center',
                            zIndex: selectedLuckCycle?.ganZhi === cycle.ganZhi ? 50 : 20
                          }}
                        >
                          <div className={`w-14 sm:w-16 p-1.5 sm:p-2 rounded text-center relative text-xs ${
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
                                {cycle.age}岁
                              </div>
                              <div className="text-xs text-gray-500 dark:text-slate-400">
                                {cycle.year}
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center justify-center gap-0.5">
                              <span className={getElementColor(getElement(cycle.gan as HeavenlyStem))}>{cycle.gan}</span>
                                  <span className="text-xs text-gray-400 dark:text-slate-500">{getShortTenGod(cycle.ganTenGod)}</span>
                            </div>
                                <div className="flex items-center justify-center gap-0.5">
                                  <span className={getElementColor(getElement(cycle.zhi as HeavenlyStem))}>{cycle.zhi}</span>
                                  <span className="text-xs text-gray-400 dark:text-slate-500">{getShortTenGod(cycle.zhiTenGod)}</span>
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
                  <h4 className="text-sm font-semibold mb-1.5 text-gray-900 dark:text-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>📅</span> 流年详情
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                        {selectedLuckCycle.ganZhi} 大运
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        共 {fleetingYears.length} 年
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
                          className={`flex-shrink-0 w-12 sm:w-14 p-1 sm:p-1.5 rounded border cursor-pointer text-xs transition-all duration-200 hover:shadow-sm relative ${
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
                                <span className="text-xs text-gray-400 dark:text-slate-500">{getShortTenGod(yearInfo.ganTenGod)}</span>
                              </div>
                              <div className="flex items-center justify-center gap-0.5">
                                <span className={getElementColor(getElement(yearInfo.zhi as HeavenlyStem))}>{yearInfo.zhi}</span>
                                <span className="text-xs text-gray-400 dark:text-slate-500">{getShortTenGod(yearInfo.zhiTenGod)}</span>
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
                  <h4 className="text-sm font-semibold mb-1.5 text-gray-900 dark:text-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>📅</span> 流月详情
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                        {selectedFleetingYear.year}年
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
                                <span className="text-xs text-gray-400 dark:text-slate-500">{getShortTenGod(monthInfo.ganTenGod)}</span>
                              </div>
                              <div className="flex items-center justify-center gap-0.5">
                                <span className={getElementColor(getElement(monthInfo.zhi as HeavenlyStem))}>{monthInfo.zhi}</span>
                                <span className="text-xs text-gray-400 dark:text-slate-500">{getShortTenGod(monthInfo.zhiTenGod)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 铁口直断 */}
        {hasBaziResult && (
          <div className="mt-4">
            <div id="tiekou-zhiduan" className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <SafeCrown className="w-5 h-5 text-orange-500" />
                铁口直断
              </h3>
              <MobileAsyncAnalysis
                title="铁口直断"
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
            />
          </div>
        )}

        {/* 用神推理大师 */}
        {hasBaziResult && (
          <div id="yongshen-master" className="mt-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                用神推理大师
              </h3>
              
              {/* 已存储的用神信息显示 */}
              {isLoadingYongShen ? (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span className="text-sm">正在查询已存储的用神信息...</span>
                          </div>
                          </div>
              ) : storedYongShen ? (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <h4 className="font-semibold text-green-800 dark:text-green-300">已分析的用神信息</h4>
                          </div>
                    
                    {/* 提取用神按钮 */}
                    {chartId && (
                      <Button
                        onClick={handleExtractYongShen}
                        disabled={isExtractingYongShen}
                        size="sm"
                        variant="outline"
                        className="border-[#3D0B5B]/50 dark:border-[#FBCB0A]/50 text-[#3D0B5B] dark:text-[#FBCB0A] hover:bg-[#FBCB0A]/10 dark:hover:bg-black/25 font-rajdhani"
                      >
                        {isExtractingYongShen ? (
                          <>
                            <Clock className="w-3 h-3 mr-1 animate-spin" />
                            提取中
                          </>
                        ) : (
                          <>
                            <Download className="w-3 h-3 mr-1" />
                            重新提取
                          </>
                        )}
                      </Button>
                    )}
                          </div>
                  
                  {/* 用神忌神 2x1 布局 - 两个独立格子 */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {/* 用神格子 */}
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border-2 border-green-300 dark:border-green-700 text-center">
                      <div className="text-gray-600 dark:text-gray-400 font-medium mb-2">用神</div>
                      <div className={`font-bold text-xl ${getElementColor(storedYongShen.primaryYongShen as any)}`}>
                        {storedYongShen.primaryYongShen}
                        </div>
                      </div>

                    {/* 忌神格子 */}
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border-2 border-red-300 dark:border-red-700 text-center">
                      <div className="text-gray-600 dark:text-gray-400 font-medium mb-2">忌神</div>
                      <div className={`font-bold text-xl ${storedYongShen.jiShen && storedYongShen.jiShen.length > 0 
                        ? getElementColor(storedYongShen.jiShen[0] as any)
                        : 'text-gray-500'
                      }`}>
                        {storedYongShen.jiShen && storedYongShen.jiShen.length > 0 
                          ? storedYongShen.jiShen.join('、') 
                          : '无'
                        }
                        </div>
                        </div>
                      </div>

                  {/* 其他信息 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {storedYongShen.secondaryYongShen && (
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-md border border-green-300 dark:border-green-700">
                        <span className="text-gray-600 dark:text-gray-400">辅用神：</span>
                        <span className="font-semibold text-green-700 dark:text-green-300 ml-1">
                          {storedYongShen.secondaryYongShen}
                        </span>
                          </div>
                    )}
                    
                    {storedYongShen.geLu && (
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-md border border-green-300 dark:border-green-700">
                        <span className="text-gray-600 dark:text-gray-400">格局：</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400 ml-1">
                          {storedYongShen.geLu}
                        </span>
                    </div>
                    )}
                      </div>


                  
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    分析时间：{new Date(storedYongShen.analysisDate).toLocaleString()}
                    {storedYongShen.confidence && (
                      <span className="ml-3">
                        置信度：{Math.round(storedYongShen.confidence * 100)}%
                      </span>
                    )}
                    </div>
                </div>
              ) : hasValidBirthData && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">未找到用神信息</h4>
                  </div>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    您还没有分析过用神信息，请点击下方"开始分析"按钮进行用神推理分析。
                  </p>
                </div>
              )}

              <MobileAsyncAnalysis
                  title="用神推理大师"
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
                  <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-amber-600 dark:text-amber-400">🎯</span>
                      <h4 className="font-medium text-amber-800 dark:text-amber-300">
                        选择您的用神
                      </h4>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                      阅读完上方分析报告后，请选择最适合的用神以提高准确率：
                    </p>
                    
                    {/* 五行选择按钮 */}
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {[
                        { element: '木', color: 'emerald', emoji: '🌳' },
                        { element: '火', color: 'rose', emoji: '🔥' },
                        { element: '土', color: 'amber', emoji: '🏔️' },
                        { element: '金', color: 'yellow', emoji: '⚒️' },
                        { element: '水', color: 'sky', emoji: '💧' }
                      ].map((item) => (
                        <button
                          key={item.element}
                          onClick={() => handleManualYongShenSelect(item.element)}
                          disabled={isExtractingYongShen}
                          className={`p-3 rounded-lg border transition-all hover:scale-105 active:scale-95 
                            bg-white dark:bg-slate-800 border-${item.color}-200 dark:border-${item.color}-700 
                            hover:bg-${item.color}-50 dark:hover:bg-${item.color}-900/20
                            text-${item.color}-600 dark:text-${item.color}-400
                            disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <div className="text-xl mb-1">{item.emoji}</div>
                          <div className="text-sm font-medium">{item.element}</div>
                        </button>
                      ))}
                    </div>
                    
                    <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 p-2 rounded">
                      💡 <strong>提示：</strong>用神通常是您命盘中最需要的五行，基于平衡和人生目标而定。
                    </div>
                  </div>
                )}
                    </div>
                  </div>
        )}
      </div>

      {/* 科普知识弹窗 */}
      {showScienceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-orange-500" />
                八字科普知识
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
                <h4 className="font-semibold mb-2">🔮 什么是八字？</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  八字是根据一个人出生的年、月、日、时四个时间点，用天干地支表示的八个字。
                  每个时间点用一个天干和一个地支表示，共八个字，所以叫"八字"。
                </p>
          </div>
              
              <div>
                <h4 className="font-semibold mb-2">🌟 十神是什么？</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  十神是八字中的重要概念，根据日主（出生日的天干）与其他天干的关系划分：
                  比肩、劫财、食神、伤官、偏财、正财、七杀、正官、偏印、正印。
                </p>
            </div>

                <div>
                <h4 className="font-semibold mb-2">🔄 大运和流年</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  大运是人生中每10年一个周期的运势变化，流年是指每一年的运势。
                  通过分析大运和流年与八字的关系，可以了解不同时期的运势特点。
                </p>
                  </div>
              
              <div>
                <h4 className="font-semibold mb-2">🌈 五行相生相克</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  五行包括金、木、水、火、土。相生：木生火、火生土、土生金、金生水、水生木。
                  相克：木克土、土克水、水克火、火克金、金克木。
                </p>
            </div>
              
              <div>
                <h4 className="font-semibold mb-2">⚖️ 五行平衡</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  通过计算八字中五行的强弱，可以了解命理的平衡状态。
                  五行平衡的人通常运势较为平稳，五行偏颇则需要在生活中注意调和。
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
            <div className="flex justify-between items-center mb-4">
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
                  className="flex-1 bg-[#FBCB0A]/10 dark:bg-black/25 text-[#3D0B5B] dark:text-[#FBCB0A] border border-[#FBCB0A] hover:bg-[#FBCB0A] hover:text-[#420868] dark:hover:text-[#1A2242] font-rajdhani font-bold transition-all"
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
                  className="flex-1 border-[#3D0B5B]/50 dark:border-[#FBCB0A]/50 text-[#3D0B5B] dark:text-[#FBCB0A] hover:bg-[#3D0B5B]/10 dark:hover:bg-[#FBCB0A]/10 font-rajdhani font-bold transition-all"
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
            <div className="flex justify-between items-center mb-4">
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
    </div>
    
    {/* Disclaimer for English version */}
    {isEnglish && (
      <div className="mt-8 p-6 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 font-rajdhani">
          Disclaimer
        </h3>
        <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed font-rajdhani">
          This website shares information for learning and entertainment purposes only. Any advice here is just a suggestion and shouldn't be your sole guide for decisions. Your future rests in your hands, and it is your choices and actions that sculpt it. Use your judgment wisely and consult experts for major decisions.
        </p>
      </div>
    )}
    </SmartLayout>
  );
} 