import { useState, useCallback, useEffect } from 'react';

interface BirthData {
  username: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  gender: 'male' | 'female' | '';
  category: string;
}

interface UseZiweiFormProps {
  draftKey?: string;
  onCalculate?: (data: BirthData) => void;
}

export const useZiweiForm = ({ draftKey = 'ziweiFormDraft', onCalculate }: UseZiweiFormProps = {}) => {
  const [birthData, setBirthData] = useState<BirthData>({
    username: "",
    year: "",
    month: "",
    day: "",
    hour: "",
    gender: "",
    category: "others",
  });

  const [isCalculating, setIsCalculating] = useState(false);

  // 从本地存储加载草稿
  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsedData = JSON.parse(savedDraft);
        setBirthData(parsedData);
      } catch (error) {
        console.error('解析草稿数据失败:', error);
      }
    }
  }, [draftKey]);

  // 保存草稿到本地存储
  const saveDraft = useCallback((data: BirthData) => {
    localStorage.setItem(draftKey, JSON.stringify(data));
  }, [draftKey]);

  // 更新表单数据
  const updateField = useCallback((field: keyof BirthData, value: string) => {
    setBirthData(prev => {
      const newData = { ...prev, [field]: value };
      saveDraft(newData);
      return newData;
    });
  }, [saveDraft]);

  // 批量更新表单数据
  const updateData = useCallback((data: Partial<BirthData>) => {
    setBirthData(prev => {
      const newData = { ...prev, ...data };
      saveDraft(newData);
      return newData;
    });
  }, [saveDraft]);

  // 验证表单数据
  const validateForm = useCallback(() => {
    const errors: string[] = [];
    
    if (!birthData.username.trim()) {
      errors.push('请输入姓名');
    }
    
    if (!birthData.year || !birthData.month || !birthData.day || !birthData.hour) {
      errors.push('请完整填写出生日期时间');
    }
    
    if (!birthData.gender) {
      errors.push('请选择性别');
    }
    
    // 验证年份范围
    const yearNum = parseInt(birthData.year);
    if (yearNum < 1900 || yearNum > 2100) {
      errors.push('年份应在1900-2100之间');
    }
    
    // 验证月份范围
    const monthNum = parseInt(birthData.month);
    if (monthNum < 1 || monthNum > 12) {
      errors.push('月份应在1-12之间');
    }
    
    // 验证日期范围
    const dayNum = parseInt(birthData.day);
    if (dayNum < 1 || dayNum > 31) {
      errors.push('日期应在1-31之间');
    }
    
    // 验证时辰范围
    const hourNum = parseInt(birthData.hour);
    if (hourNum < 0 || hourNum > 23) {
      errors.push('时辰应在0-23之间');
    }
    
    return errors;
  }, [birthData]);

  // 处理计算
  const handleCalculate = useCallback(async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    setIsCalculating(true);
    try {
      if (onCalculate) {
        await onCalculate(birthData);
      }
    } catch (error) {
      console.error('计算失败:', error);
      alert('计算失败，请重试');
    } finally {
      setIsCalculating(false);
    }
  }, [birthData, validateForm, onCalculate]);

  // 重置表单
  const resetForm = useCallback(() => {
    const emptyData: BirthData = {
      username: "",
      year: "",
      month: "",
      day: "",
      hour: "",
      gender: "",
      category: "others",
    };
    setBirthData(emptyData);
    localStorage.removeItem(draftKey);
  }, [draftKey]);

  // 检查表单是否完整
  const isFormComplete = useCallback(() => {
    return !!(
      birthData.username.trim() &&
      birthData.year &&
      birthData.month &&
      birthData.day &&
      birthData.hour &&
      birthData.gender
    );
  }, [birthData]);

  return {
    birthData,
    isCalculating,
    setIsCalculating,
    updateField,
    updateData,
    validateForm,
    handleCalculate,
    resetForm,
    isFormComplete,
  };
};

export default useZiweiForm; 