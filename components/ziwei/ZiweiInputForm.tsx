import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Calendar, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { useZiweiSelectors, useZiweiActions } from '@/stores/ziwei-store';
import { useZiweiCalculation } from '@/hooks/useZiweiCalculation';
import { validateBirthData } from '@/services/ziwei-calculator';

// 分类选项
const categories = [
  { key: 'friends', label: '朋友', icon: '👥' },
  { key: 'family', label: '家人', icon: '❤️' },
  { key: 'clients', label: '客户', icon: '💼' },
  { key: 'favorites', label: '最爱', icon: '⭐' },
  { key: 'others', label: '其他', icon: '📁' },
];

// 年份选项 (1900-2100)
const yearOptions = Array.from(
  { length: 201 }, 
  (_, i) => (1900 + i).toString()
);

// 月份选项
const monthOptions = Array.from(
  { length: 12 }, 
  (_, i) => ({ value: (i + 1).toString(), label: `${i + 1}月` })
);

// 日期选项
const dayOptions = Array.from(
  { length: 31 }, 
  (_, i) => ({ value: (i + 1).toString(), label: `${i + 1}日` })
);

// 时辰选项
const hourOptions = Array.from(
  { length: 24 }, 
  (_, i) => ({ value: i.toString(), label: `${i}:00` })
);

interface ZiweiInputFormProps {
  onCalculateSuccess?: () => void;
}

export function ZiweiInputForm({ onCalculateSuccess }: ZiweiInputFormProps) {
  const { birthData, isCalculating, calculationError } = useZiweiSelectors();
  const { updateBirthData, setCalculationError } = useZiweiActions();
  const { performCalculation, canCalculate } = useZiweiCalculation();
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 更新出生数据字段
  const handleFieldChange = useCallback((field: string, value: string) => {
    updateBirthData(field, value);
    
    // 清除之前的错误
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
    if (calculationError) {
      setCalculationError(null);
    }
  }, [updateBirthData, validationErrors.length, calculationError, setCalculationError]);

  // 处理表单提交
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证数据
    const errors = validateBirthData(birthData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      // 执行计算
      await performCalculation(true); // shouldSave = true
      
      // 计算成功回调
      if (onCalculateSuccess) {
        onCalculateSuccess();
      }
    } catch (error) {
      console.error('紫微计算失败:', error);
    }
  }, [birthData, performCalculation, onCalculateSuccess]);

  return (
    <Card className="w-full bg-white dark:bg-slate-800/95 backdrop-blur-md border border-purple-200 dark:border-amber-400/30 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-amber-400 font-noto">
          <Sparkles className="w-5 h-5" />
          紫微斗数排盘
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 姓名输入 */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-slate-300">
              <User className="w-4 h-4 inline mr-1" />
              姓名
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="请输入姓名"
              value={birthData.username}
              onChange={(e) => handleFieldChange('username', e.target.value)}
              className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-amber-400"
            />
          </div>

          {/* 出生日期 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                <Calendar className="w-4 h-4 inline mr-1" />
                年份
              </Label>
              <Select
                value={birthData.year}
                onValueChange={(value) => handleFieldChange('year', value)}
              >
                <SelectTrigger className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-amber-400">
                  <SelectValue placeholder="年" />
                </SelectTrigger>
                <SelectContent className="max-h-40">
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}年
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">月份</Label>
              <Select
                value={birthData.month}
                onValueChange={(value) => handleFieldChange('month', value)}
              >
                <SelectTrigger className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-amber-400">
                  <SelectValue placeholder="月" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">日期</Label>
              <Select
                value={birthData.day}
                onValueChange={(value) => handleFieldChange('day', value)}
              >
                <SelectTrigger className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-amber-400">
                  <SelectValue placeholder="日" />
                </SelectTrigger>
                <SelectContent className="max-h-40">
                  {dayOptions.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 出生时辰和性别 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                <Clock className="w-4 h-4 inline mr-1" />
                时辰
              </Label>
              <Select
                value={birthData.hour}
                onValueChange={(value) => handleFieldChange('hour', value)}
              >
                <SelectTrigger className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-amber-400">
                  <SelectValue placeholder="时" />
                </SelectTrigger>
                <SelectContent className="max-h-40">
                  {hourOptions.map((hour) => (
                    <SelectItem key={hour.value} value={hour.value}>
                      {hour.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">性别</Label>
              <Select
                value={birthData.gender}
                onValueChange={(value) => handleFieldChange('gender', value)}
              >
                <SelectTrigger className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-amber-400">
                  <SelectValue placeholder="性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 分类选择 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">分类</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category.key}
                  variant={birthData.category === category.key ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    birthData.category === category.key
                      ? 'bg-purple-500 hover:bg-purple-600 dark:bg-amber-500 dark:hover:bg-amber-600 text-white'
                      : 'border-purple-300 dark:border-amber-400/50 text-purple-600 dark:text-amber-400 hover:bg-purple-50 dark:hover:bg-amber-400/10'
                  }`}
                  onClick={() => handleFieldChange('category', category.key)}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* 错误提示 */}
          {validationErrors.length > 0 && (
            <Alert className="border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* 计算错误提示 */}
          {calculationError && (
            <Alert className="border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                {calculationError}
              </AlertDescription>
            </Alert>
          )}

          {/* 提交按钮 */}
          <Button
            type="submit"
            disabled={!canCalculate || isCalculating}
            className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                正在排盘...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                开始排盘
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 