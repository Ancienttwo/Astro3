"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { UnifiedUser } from '@/lib/auth';

interface ProfileData {
  id: string;
  email: string;
  username?: string;
  created_at: string;
  updated_at: string;
}

interface ProfileSettingsProps {
  initialUser?: UnifiedUser;
}

export default function ProfileSettings({ initialUser }: ProfileSettingsProps) {
  const [currentUser, setCurrentUser] = useState<UnifiedUser | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 获取用户信息
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // 如果有初始用户信息，直接使用
        if (initialUser) {
          setCurrentUser(initialUser);
          setProfileData({
            id: initialUser.id,
            email: initialUser.email,
            username: initialUser.username,
            created_at: initialUser.created_at,
            updated_at: initialUser.updated_at
          });
          const userUsername = initialUser.username || '';
          setUsername(userUsername);
          setOriginalUsername(userUsername);
          setIsLoading(false);
          return;
        }
        
        // 否则从API获取用户信息
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setMessage({ type: 'error', text: '用户未登录' });
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/update-profile', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        const result = await response.json();

        if (result.success) {
          setProfileData(result.data);
          setCurrentUser({
            id: result.data.id,
            email: result.data.email,
            username: result.data.username,
            created_at: result.data.created_at,
            updated_at: result.data.updated_at
          });
          const userUsername = result.data.username || '';
          setUsername(userUsername);
          setOriginalUsername(userUsername);
        } else {
          setMessage({ type: 'error', text: result.error || '获取用户信息失败' });
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        setMessage({ type: 'error', text: '获取用户信息失败' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [initialUser]);

  // 保存昵称
  const handleSave = async () => {
    if (!username.trim()) {
      setMessage({ type: 'error', text: '昵称不能为空' });
      return;
    }

    if (username.trim() === originalUsername) {
      setMessage({ type: 'error', text: '昵称没有变化' });
      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage({ type: 'error', text: '用户未登录，请重新登录' });
        return;
      }

      const response = await fetch('/api/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          username: username.trim()
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: '昵称更新成功！' });
        setOriginalUsername(username.trim());
        // 更新用户数据
        if (profileData) {
          setProfileData({
            ...profileData,
            username: result.data.username,
            updated_at: result.data.updated_at
          });
        }
      } else {
        setMessage({ type: 'error', text: result.error || '更新失败' });
      }
    } catch (error) {
      console.error('更新昵称失败:', error);
      setMessage({ type: 'error', text: '网络错误，请稍后重试' });
    } finally {
      setIsSaving(false);
    }
  };

  // 重置昵称
  const handleReset = () => {
    setUsername(originalUsername);
    setMessage(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>加载中...</span>
      </div>
    );
  }

  if (!currentUser || !profileData) {
    return (
      <div className="py-4">
        <Alert>
          <AlertDescription>
            无法获取用户信息，请刷新页面重试
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasChanges = username.trim() !== originalUsername;

  return (
    <div className="space-y-3">
      {/* 消息提示 */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : 'border-red-200 bg-red-50 dark:bg-red-900/10'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* 邮箱显示（只读） */}
      <div className="space-y-1">
        <Label htmlFor="email" className="text-sm">邮箱地址</Label>
        <Input
          id="email"
          type="email"
          value={profileData.email}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          邮箱地址不可修改
        </p>
      </div>

      {/* 昵称设置 */}
      <div className="space-y-1">
        <Label htmlFor="username" className="text-sm">用户昵称</Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="请输入您的昵称"
          maxLength={20}
          className="max-w-md"
        />
        <p className="text-xs text-muted-foreground">
          昵称长度为1-20个字符，支持中文、英文和数字
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="flex space-x-3 pt-2">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="min-w-[100px]"
          size="sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              保存中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              保存更改
            </>
          )}
        </Button>
        
        {hasChanges && (
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
            size="sm"
          >
            重置
          </Button>
        )}
      </div>
    </div>
  );
} 