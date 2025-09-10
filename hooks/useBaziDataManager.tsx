import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBaziActions, useBaziSelectors, type BirthData } from '@/stores/bazi-store';
import { useBaziCalculation } from './useBaziCalculation';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/api-client';

export const useBaziDataManager = (chartId?: string | null) => {
  const router = useRouter();
  const { shouldSave, birthData, baziResult } = useBaziSelectors();
  const { loadChartData, setPendingSave } = useBaziActions();
  const { performCalculation } = useBaziCalculation();
  
  // 防止重复加载的ref
  const isLoadingRef = useRef(false);
  const loadedChartIdRef = useRef<string | null>(null);
  const isFromExistingChart = useRef(false); // 新增：标记是否从已有命盘加载

  // 自动保存效果 - 只在手动创建新命盘时保存
  useEffect(() => {
    if (!shouldSave || isFromExistingChart.current) return; // 🔥 修改：从已有命盘加载时不保存

    const saveData = async () => {
      try {
        console.log('🔄 保存新建八字命盘:', birthData.username);

        const response = await apiClient.post('/api/charts', {
            name: birthData.username,
            birth_year: parseInt(birthData.year),
            birth_month: parseInt(birthData.month),
            birth_day: parseInt(birthData.day),
            birth_hour: parseInt(birthData.hour),
            gender: birthData.gender as 'male' | 'female',
            chart_type: 'bazi',
            category: birthData.category
          });

        if (response.success) {
          console.log('✅ 八字命盘已保存/更新:', response.data?.id || '未知ID');
        } else {
          throw new Error(response.error || '保存失败');
        }
      } catch (error) {
        console.error('❌ 保存八字命盘失败:', error);
      } finally {
        setPendingSave(false);
      }
    };

    saveData();
  }, [shouldSave, birthData, setPendingSave]);

  // 自动加载效果 - 使用ref来防止重复加载
  useEffect(() => {
    if (!chartId || isLoadingRef.current || loadedChartIdRef.current === chartId) return;

    isLoadingRef.current = true;
    loadedChartIdRef.current = chartId;
    isFromExistingChart.current = true; // 🔥 新增：标记为从已有命盘加载

    const loadData = async () => {
      try {
        console.log('🔄 加载已有命盘数据:', chartId);

        const result = await apiClient.get(`/api/charts/${chartId}`);

        if (result.success && result.data) {
          const chartData = result.data;
          console.log('✅ 加载命盘数据成功:', chartData);
          
          // 加载数据到状态
          loadChartData(chartData);
          
          // 🔥 修复时序问题：直接使用加载的数据进行计算，不依赖状态更新
          console.log('🔄 开始计算八字结果...');
          try {
            // 构造BirthData对象，直接传递给计算函数
            const birthDataFromChart = {
              username: chartData.name,
              year: chartData.birth_year.toString(),
              month: chartData.birth_month.toString(),
              day: chartData.birth_day.toString(),
              hour: chartData.birth_hour.toString(),
              gender: chartData.gender,
              category: chartData.category || 'others'
            };
            
            // 直接传递数据，避免时序问题
            await performCalculation(false, birthDataFromChart);
            console.log('✅ 八字计算完成');
          } catch (error) {
            console.error('❌ 八字计算失败:', error);
          }
          
          console.log('✅ 命盘数据加载完成');
        } else {
          throw new Error(result.error || '获取命盘数据失败');
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
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadData();
  }, [chartId, loadChartData, performCalculation, router]);

  // 🔥 新增：重置标记的方法，用于手动排盘
  const enableSaving = useCallback(() => {
    isFromExistingChart.current = false;
  }, []);

  return {
    enableSaving, // 导出方法供手动排盘时调用
  };
}; 