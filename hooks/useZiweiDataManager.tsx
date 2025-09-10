import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useZiweiActions, useZiweiSelectors, type BirthData } from '@/stores/ziwei-store';
import { useZiweiCalculation } from './useZiweiCalculation';
import { supabase } from '@/lib/supabase';

export const useZiweiDataManager = (chartId?: string | null) => {
  const router = useRouter();
  const { shouldSave, birthData, ziweiResult } = useZiweiSelectors();
  const { loadChartData, setPendingSave } = useZiweiActions();
  const { performCalculation } = useZiweiCalculation();
  
  // 防止重复加载的ref
  const isLoadingRef = useRef(false);
  const loadedChartIdRef = useRef<string | null>(null);
  const isFromExistingChart = useRef(false); // 标记是否从已有命盘加载

  // 自动保存效果 - 只在手动创建新命盘时保存
  useEffect(() => {
    if (!shouldSave || isFromExistingChart.current) return; // 从已有命盘加载时不保存

    const saveData = async () => {
      try {
        // 优先检查Web3钱包用户
        let authToken = null;
        const currentUser = typeof window !== 'undefined' ? localStorage.getItem('current_user') : null;
        
        if (currentUser) {
          try {
            const userData = JSON.parse(currentUser);
            if (userData.wallet_address && (userData.auth_method === 'web3_jwt' || userData.auth_method === 'walletconnect')) {
              console.log('🔍 检测到Web3钱包用户，使用钱包认证保存:', userData.wallet_address);
              authToken = userData.authToken || userData.token;
            }
          } catch (e) {
            console.log('解析Web3用户数据失败:', e);
          }
        }

        // 如果不是钱包用户，检查Supabase session
        if (!authToken) {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) {
            throw new Error('用户未登录');
          }
          authToken = session.access_token;
        }

        // 🔥 验证数据完整性，避免400错误
        const year = parseInt(birthData.year);
        const month = parseInt(birthData.month);
        const day = parseInt(birthData.day);
        const hour = parseInt(birthData.hour);

        if (!birthData.username || !birthData.username.trim()) {
          console.log('❌ 用户名为空，跳过保存');
          setPendingSave(false);
          return;
        }

        if (isNaN(year) || year < 1900 || year > 2100 ||
            isNaN(month) || month < 1 || month > 12 ||
            isNaN(day) || day < 1 || day > 31 ||
            isNaN(hour) || hour < 0 || hour > 23) {
          console.log('❌ 出生日期时间格式无效，跳过保存:', { year, month, day, hour });
          setPendingSave(false);
          return;
        }

        if (!birthData.gender || !['male', 'female'].includes(birthData.gender)) {
          console.log('❌ 性别字段无效，跳过保存:', birthData.gender);
          setPendingSave(false);
          return;
        }

        console.log('🔄 保存新建紫微命盘:', birthData.username);

        const response = await fetch('/api/charts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: birthData.username,
            birth_year: year,
            birth_month: month,
            birth_day: day,
            birth_hour: hour,
            gender: birthData.gender as 'male' | 'female',
            chart_type: 'ziwei',
            category: birthData.category || 'others'
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('✅ 紫微命盘已保存/更新:', result.record?.id || result.id || '未知ID');
          } else {
            throw new Error(result.error || '保存失败');
          }
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('❌ 保存紫微命盘失败:', error);
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
    isFromExistingChart.current = true; // 标记为从已有命盘加载

    const loadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('用户未登录');
        }

        console.log('🔄 加载已有紫微命盘数据:', chartId);

        const response = await fetch(`/api/charts/${chartId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const chartData = result.data;
            console.log('✅ 加载紫微命盘数据成功:', chartData);
            
            // 加载数据到状态
            loadChartData(chartData);
            
            // 修复时序问题：直接使用加载的数据进行计算
            console.log('🔄 开始计算紫微结果...');
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
              console.log('✅ 紫微计算完成');
            } catch (error) {
              console.error('❌ 紫微计算失败:', error);
            }
            
            console.log('✅ 紫微命盘数据加载完成');
          } else {
            throw new Error(result.error || '获取命盘数据失败');
          }
        } else if (response.status === 404) {
          console.log('命盘不存在，重定向到命书页面');
          router.replace('/charts');
          return;
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('❌ 加载紫微命盘数据失败:', error);
        
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

  // 重置标记的方法，用于手动排盘
  const enableSaving = useCallback(() => {
    isFromExistingChart.current = false;
  }, []);

  // 手动保存命盘
  const saveChart = useCallback(async () => {
    if (!ziweiResult || !birthData.username || !birthData.year) {
      console.log('❌ 数据不完整，无法保存');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('用户未登录');
      }

      // 🔥 验证数据完整性，避免400错误
      const year = parseInt(birthData.year);
      const month = parseInt(birthData.month);
      const day = parseInt(birthData.day);
      const hour = parseInt(birthData.hour);

      if (!birthData.username || !birthData.username.trim()) {
        throw new Error('用户名不能为空');
      }

      if (isNaN(year) || year < 1900 || year > 2100 ||
          isNaN(month) || month < 1 || month > 12 ||
          isNaN(day) || day < 1 || day > 31 ||
          isNaN(hour) || hour < 0 || hour > 23) {
        throw new Error('出生日期时间格式无效');
      }

      if (!birthData.gender || !['male', 'female'].includes(birthData.gender)) {
        throw new Error('请选择性别');
      }

      console.log('🔄 手动保存紫微命盘:', birthData.username);

      const response = await fetch('/api/charts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: birthData.username,
          birth_year: year,
          birth_month: month,
          birth_day: day,
          birth_hour: hour,
          gender: birthData.gender as 'male' | 'female',
          chart_type: 'ziwei',
          category: birthData.category || 'others'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('✅ 紫微命盘手动保存成功:', result.record?.id || result.id || '未知ID');
          return result.record?.id || result.id;
        } else {
          throw new Error(result.error || '保存失败');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ HTTP错误响应:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ 手动保存紫微命盘失败:', error);
      throw error;
    }
  }, [birthData, ziweiResult]);

  return {
    enableSaving, // 导出方法供手动排盘时调用
    saveChart,    // 手动保存方法
  };
}; 