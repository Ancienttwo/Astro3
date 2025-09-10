"use client";

import { useState } from 'react';
import { Clock, Edit3, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { useRecords } from '@/contexts/RecordsContext'; // 已迁移到新架构
import type { RecordData } from '@/types/legacy';

interface TimeAdjustmentButtonProps {
  currentRecord: any; // 当前命书记录
  onTimeUpdate: (newTime: string) => void; // 时间更新回调
}

export default function TimeAdjustmentButton({ currentRecord, onTimeUpdate }: TimeAdjustmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTime, setNewTime] = useState(currentRecord?.time || '12:00');
  const [isUpdating, setIsUpdating] = useState(false);
  // const { updateRecord } = useRecords(); // 已迁移到新架构
  const updateRecord = async (id: string, updates: any) => {
    console.warn('TimeAdjustmentButton: updateRecord功能已迁移，请使用新架构');
  };

  const handleTimeChange = async () => {
    if (!currentRecord) return;
    
    setIsUpdating(true);
    
    try {
      // 更新记录中的时间
      const updates: Partial<RecordData> = {
        birthData: {
          ...currentRecord.birthData,
          time: newTime
        },
        lastModified: new Date().toISOString(),
        version: (currentRecord.version || 0) + 1
      };
      
      // 保存到记录系统
      await updateRecord(currentRecord.id, updates);
      
      // 通知父组件重新排盘
      onTimeUpdate(newTime);
      
      setIsOpen(false);
      
      // 显示成功提示
      console.log('时辰已更新，正在重新排盘...');
      
    } catch (error) {
      console.error('更新时辰失败:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '未设置';
    const [hour, minute] = time.split(':');
    return `${hour}:${minute}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 hover:bg-primary/10"
        >
          <Clock className="w-4 h-4" />
          <span>修改时辰</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-primary" />
            <span>调整出生时辰</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* 当前信息显示 */}
          <div className="p-3 bg-muted/30 rounded-lg">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">当前信息</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">姓名：</span>{currentRecord?.name}</p>
              <p><span className="text-muted-foreground">出生：</span>{currentRecord?.year}年{currentRecord?.month}月{currentRecord?.day}日</p>
              <p><span className="text-muted-foreground">时辰：</span>{formatTime(currentRecord?.time)}</p>
            </div>
          </div>
          
          {/* 时间调整 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">新的出生时间</label>
            <Input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="text-center"
            />
            <p className="text-xs text-muted-foreground">
              💡 提示：修改时辰后将重新排盘并覆盖当前存档
            </p>
          </div>
          
          {/* 时辰对照表 */}
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
            <h5 className="text-sm font-medium text-blue-800 mb-2">传统时辰对照</h5>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
              <div>子时: 23:00-01:00</div>
              <div>丑时: 01:00-03:00</div>
              <div>寅时: 03:00-05:00</div>
              <div>卯时: 05:00-07:00</div>
              <div>辰时: 07:00-09:00</div>
              <div>巳时: 09:00-11:00</div>
              <div>午时: 11:00-13:00</div>
              <div>未时: 13:00-15:00</div>
              <div>申时: 15:00-17:00</div>
              <div>酉时: 17:00-19:00</div>
              <div>戌时: 19:00-21:00</div>
              <div>亥时: 21:00-23:00</div>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex space-x-2 pt-2">
            <Button 
              onClick={handleTimeChange}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>更新中...</span>
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  确认修改
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isUpdating}
            >
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 