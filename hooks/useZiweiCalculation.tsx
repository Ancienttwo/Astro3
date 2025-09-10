import { useCallback } from 'react';
import { useZiweiActions, useZiweiSelectors } from '@/stores/ziwei-store';
import { calculateZiwei, validateBirthData } from '@/services/ziwei-calculator';
import { BirthData } from '@/stores/ziwei-store';

export const useZiweiCalculation = () => {
  const { birthData, ziweiResult, isCalculating, selectedDecadeIndex } = useZiweiSelectors();
  const {
    setZiweiResult,
    setCalculating,
    setCalculationError,
    setPendingSave,
    setSelectedDecadeIndex,
    setSelectedYearlyIndex,
    setSelectedPalaceForSihua
  } = useZiweiActions();

  // 执行紫微计算 - 支持外部数据参数
  const performCalculation = useCallback(async (
    shouldSave = false, 
    externalBirthData?: BirthData,
    decadeIndex: number | null = null,
    yearlyIndex: number | null = null
  ) => {
    // 优先使用外部传入的数据，避免时序问题
    const dataToUse = externalBirthData || birthData;
    
    console.log('🔍 验证紫微出生数据:', dataToUse);
    console.log('🔍 数据来源:', externalBirthData ? '外部传入' : '状态获取');
    
    // 使用validateBirthData验证数据
    const errors = validateBirthData(dataToUse);
    if (errors.length > 0) {
      console.error('❌ 紫微出生数据不完整:', errors);
      setCalculationError(errors.join(', '));
      return;
    }

    setCalculating(true);
    setCalculationError(null);
    
    try {
      // 使用新的计算服务
      const result = calculateZiwei({
        birthData: dataToUse,
        selectedDecadeIndex: decadeIndex,
        selectedYearlyIndex: yearlyIndex
      });
      
      if (result.success && result.result) {
        // 更新状态
        setZiweiResult(result.result);
        
        // 只在需要时设置保存标志
        if (shouldSave) {
          setPendingSave(true);
        }
        
        console.log('✅ 紫微计算完成');
      } else {
        throw new Error(result.error || '计算失败');
      }
    } catch (error) {
      console.error('❌ 紫微计算失败:', error);
      setCalculationError(error instanceof Error ? error.message : '计算失败');
      throw error; // 重新抛出错误，让调用者处理
    } finally {
      setCalculating(false);
    }
  }, [
    birthData,
    setZiweiResult,
    setCalculating,
    setCalculationError,
    setPendingSave
  ]);

  // 选择大运周期 - 修复错误处理
  const selectDecade = useCallback(async (index: number | null) => {
    if (!ziweiResult || !birthData.year) return;
    
    setSelectedDecadeIndex(index);
    setSelectedYearlyIndex(null);
    setSelectedPalaceForSihua(null);
    
    try {
      // 重新计算紫微结果
      await performCalculation(false, birthData, index, null);
      console.log('✅ 大运周期选择完成');
    } catch (error) {
      console.error('❌ 大运周期选择失败:', error);
      // 错误已经在 performCalculation 中处理了，这里只需要记录日志
    }
  }, [ziweiResult, birthData, setSelectedDecadeIndex, setSelectedYearlyIndex, setSelectedPalaceForSihua, performCalculation]);

  // 选择流年 - 修复错误处理
  const selectYear = useCallback(async (yearIndex: number | null) => {
    if (!ziweiResult || !birthData.year) return;
    
    setSelectedYearlyIndex(yearIndex);
    setSelectedPalaceForSihua(null);
    
    try {
      // 重新计算紫微结果
      await performCalculation(false, birthData, selectedDecadeIndex, yearIndex);
      console.log('✅ 流年选择完成');
    } catch (error) {
      console.error('❌ 流年选择失败:', error);
      // 错误已经在 performCalculation 中处理了，这里只需要记录日志
    }
  }, [ziweiResult, birthData, selectedDecadeIndex, setSelectedYearlyIndex, setSelectedPalaceForSihua, performCalculation]);

  // 简化的验证函数
  const canCalculate = useCallback(() => {
    return validateBirthData(birthData).length === 0;
  }, [birthData]);

  return {
    performCalculation,
    selectDecade,
    selectYear,
    isCalculating,
    canCalculate: canCalculate(),
  };
}; 