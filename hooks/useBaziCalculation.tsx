import { useCallback } from 'react';
import { useBaziActions, useBaziSelectors } from '@/stores/bazi-store';
import { calculateBazi, calculateFleetingYears, validateBirthData } from '@/services/bazi-calculator';
import { HeavenlyStem } from '@/lib/zodiac/stems';
import { BirthData } from '@/stores/bazi-store';

export const useBaziCalculation = () => {
  const { birthData, baziResult, isCalculating } = useBaziSelectors();
  const {
    setBaziResult,
    setIsCalculating,
    setLunarDateString,
    setLuckInfo,
    setLuckCycles,
    setSelectedLuckCycle,
    setFleetingYears,
    setPendingSave
  } = useBaziActions();

  // 执行八字计算 - 支持外部数据参数
  const performCalculation = useCallback(async (shouldSave = false, externalBirthData?: BirthData) => {
    // 🔥 优先使用外部传入的数据，避免时序问题
    const dataToUse = externalBirthData || birthData;
    
    // 🔥 添加调试信息
    console.log('🔍 验证出生数据:', dataToUse);
    console.log('🔍 数据来源:', externalBirthData ? '外部传入' : '状态获取');
    console.log('🔍 验证结果:', {
      year: !!dataToUse.year,
      month: !!dataToUse.month,
      day: !!dataToUse.day,
      hour: !!dataToUse.hour,
      gender: !!dataToUse.gender,
      username: !!dataToUse.username,
    });
    
    if (!validateBirthData(dataToUse)) {
      console.error('❌ 出生数据不完整');
      console.error('缺失的数据:', {
        year: dataToUse.year || '未设置',
        month: dataToUse.month || '未设置',
        day: dataToUse.day || '未设置',
        hour: dataToUse.hour || '未设置',
        gender: dataToUse.gender || '未设置',
        username: dataToUse.username || '未设置',
      });
      return;
    }

    setIsCalculating(true);
    
    try {
      // 使用新的计算服务
      const result = calculateBazi(dataToUse);
      
      // 更新状态
      setBaziResult(result.baziResult);
      setLunarDateString(result.lunarDateString);
      setLuckInfo(result.luckInfo);
      setLuckCycles(result.luckCycles);
      
      // 只在需要时设置保存标志
      if (shouldSave) {
      setPendingSave(true);
      }
      
      console.log('✅ 八字计算完成');
    } catch (error) {
      console.error('❌ 八字计算失败:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [
    birthData,
    setBaziResult,
    setIsCalculating,
    setLunarDateString,
    setLuckInfo,
    setLuckCycles,
    setPendingSave
  ]);

  // 选择大运周期
  const selectLuckCycle = useCallback((cycle: any) => {
    if (!baziResult) return;
    
    setSelectedLuckCycle(cycle);
    
    // 计算流年
    const dayMasterStem = baziResult.day.heavenlyStem as HeavenlyStem;
    const fleetingYears = calculateFleetingYears(cycle, dayMasterStem);
    setFleetingYears(fleetingYears);
    
    console.log('✅ 大运周期选择完成');
  }, [baziResult, setSelectedLuckCycle, setFleetingYears]);

  return {
    performCalculation,
    selectLuckCycle,
    isCalculating,
    canCalculate: validateBirthData(birthData),
  };
}; 