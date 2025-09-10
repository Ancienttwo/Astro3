"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SmartLayout from '@/components/SmartLayout';
import { useI18n } from '@/hooks/useI18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Calendar, 
  Clock,
  MapPin,
  Edit,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/api-client'

// 时辰选项
const TIME_OPTIONS_ZH = [
  { value: '23:00-01:00', label: '子时 (23:00-01:00)' },
  { value: '01:00-03:00', label: '丑时 (01:00-03:00)' },
  { value: '03:00-05:00', label: '寅时 (03:00-05:00)' },
  { value: '05:00-07:00', label: '卯时 (05:00-07:00)' },
  { value: '07:00-09:00', label: '辰时 (07:00-09:00)' },
  { value: '09:00-11:00', label: '巳时 (09:00-11:00)' },
  { value: '11:00-13:00', label: '午时 (11:00-13:00)' },
  { value: '13:00-15:00', label: '未时 (13:00-15:00)' },
  { value: '15:00-17:00', label: '申时 (15:00-17:00)' },
  { value: '17:00-19:00', label: '酉时 (17:00-19:00)' },
  { value: '19:00-21:00', label: '戌时 (19:00-21:00)' },
  { value: '21:00-23:00', label: '亥时 (21:00-23:00)' }
];

const TIME_OPTIONS_EN = [
  { value: '23:00-01:00', label: 'Zi Hour (23:00-01:00)' },
  { value: '01:00-03:00', label: 'Chou Hour (01:00-03:00)' },
  { value: '03:00-05:00', label: 'Yin Hour (03:00-05:00)' },
  { value: '05:00-07:00', label: 'Mao Hour (05:00-07:00)' },
  { value: '07:00-09:00', label: 'Chen Hour (07:00-09:00)' },
  { value: '09:00-11:00', label: 'Si Hour (09:00-11:00)' },
  { value: '11:00-13:00', label: 'Wu Hour (11:00-13:00)' },
  { value: '13:00-15:00', label: 'Wei Hour (13:00-15:00)' },
  { value: '15:00-17:00', label: 'Shen Hour (15:00-17:00)' },
  { value: '17:00-19:00', label: 'You Hour (17:00-19:00)' },
  { value: '19:00-21:00', label: 'Xu Hour (19:00-21:00)' },
  { value: '21:00-23:00', label: 'Hai Hour (21:00-23:00)' }
];

// 年份选项（1900-2030）
const YEAR_OPTIONS = Array.from({ length: 131 }, (_, i) => 1900 + i);

// 月份选项（中文）
const MONTH_OPTIONS_ZH = [
  { value: '01', label: '一月' },
  { value: '02', label: '二月' },
  { value: '03', label: '三月' },
  { value: '04', label: '四月' },
  { value: '05', label: '五月' },
  { value: '06', label: '六月' },
  { value: '07', label: '七月' },
  { value: '08', label: '八月' },
  { value: '09', label: '九月' },
  { value: '10', label: '十月' },
  { value: '11', label: '十一月' },
  { value: '12', label: '十二月' }
];

const MONTH_OPTIONS_EN = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

// 日期选项（1-31）
const DAY_OPTIONS_ZH = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: `${i + 1}日`
}));

const DAY_OPTIONS_EN = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: `${i + 1}`
}));

interface UserProfile {
  birth_date?: string;
  birth_time?: string;
  birth_location?: string;
  gender?: 'male' | 'female';
  profile_edit_count?: number;
  gender_edit_count?: number;
  profile_complete?: boolean;
  nickname?: string;
}

interface CurrentUser {
  id: string;
  email: string;
  access_token: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  
  // 语言检测
  const langParam = searchParams.get('lang');
  const isEnglish = langParam === 'en';
  const language = isEnglish ? 'en' : 'zh';
  const t = useI18n(language);
  
  // 根据语言选择选项
  const TIME_OPTIONS = isEnglish ? TIME_OPTIONS_EN : TIME_OPTIONS_ZH;
  const MONTH_OPTIONS = isEnglish ? MONTH_OPTIONS_EN : MONTH_OPTIONS_ZH;
  const DAY_OPTIONS = isEnglish ? DAY_OPTIONS_EN : DAY_OPTIONS_ZH;
  
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditingGender, setIsEditingGender] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({});
  const [editForm, setEditForm] = useState({
    birth_date: '',
    birth_time: '',
    birth_location: '',
    nickname: '',
    gender: '' as 'male' | 'female' | ''
  });
  // 分离的日期选择器状态
  const [dateForm, setDateForm] = useState({
    year: '',
    month: '',
    day: ''
  });

  // 检查档案是否完整，如果完整且有returnTo参数，则跳转
  const checkAndRedirect = (updatedProfile: UserProfile) => {
    if (updatedProfile.profile_complete && returnTo) {
      console.log('档案已完善，返回到:', returnTo);
      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        router.push(returnTo);
      }, 1500);
    }
  };

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        // 获取当前session和用户信息
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          console.error('获取用户session失败:', sessionError);
          setLoading(false);
          return;
        }

        const user = {
          id: session.user.id,
          email: session.user.email || '',
          access_token: session.access_token
        };
        
        setCurrentUser(user);
        
        // 获取用户档案数据 - 使用统一API
        const response = await apiClient.get('/api/user/profile-unified');
        
        if (response?.success) {
          if (response.data?.success && response.data.profile) {
            setProfile(response.data?.profile);
            setEditForm({
              birth_date: response.data?.profile?.birth_date || '',
              birth_time: response.data?.profile?.birth_time || '',
              birth_location: response.data?.profile?.birth_location || '',
              nickname: response.data?.profile?.nickname || '',
              gender: response.data?.profile?.gender || ''
            });
            
            // 初始化日期选择器
            if (response.data?.profile?.birth_date) {
              const [year, month, day] = response.data.profile.birth_date.split('-');
              setDateForm({ year, month, day });
            }
          }
        } else {
          console.error('获取用户档案失败:', response.status);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();
  }, []);

  const handleEditDate = () => {
    setIsEditingDate(true);
    if (profile.birth_date) {
      const [year, month, day] = profile.birth_date.split('-');
      setDateForm({ year, month, day });
    }
  };

  const handleEditTime = () => {
    setIsEditingTime(true);
  };

  const handleEditNickname = () => {
    setIsEditingNickname(true);
  };

  const handleEditGender = () => {
    setIsEditingGender(true);
  };

  const handleCancelDate = () => {
    setIsEditingDate(false);
    if (profile.birth_date) {
      const [year, month, day] = profile.birth_date.split('-');
      setDateForm({ year, month, day });
    } else {
      setDateForm({ year: '', month: '', day: '' });
    }
  };

  const handleCancelTime = () => {
    setIsEditingTime(false);
    setEditForm({
      ...editForm,
      birth_time: profile.birth_time || '',
      birth_location: profile.birth_location || ''
    });
  };

  const handleCancelNickname = () => {
    setIsEditingNickname(false);
    setEditForm({
      ...editForm,
      nickname: profile.nickname || ''
    });
  };

  const handleCancelGender = () => {
    setIsEditingGender(false);
    setEditForm({
      ...editForm,
      gender: profile.gender || ''
    });
  };

  const handleSaveDate = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    
    try {
      // 构建日期字符串
      const newDate = `${dateForm.year}-${dateForm.month}-${dateForm.day}`;
      
      // 检查是否修改了出生日期
      const isDateChanged = newDate !== profile.birth_date;
      const isFirstEdit = !profile.birth_date; // 如果没有出生日期，说明是第一次设置
      
      // 只有修改出生日期时才检查次数限制（首次设置不算修改）
      if (isDateChanged && !isFirstEdit && (profile.profile_edit_count || 0) >= 1) {
        const confirmed = window.confirm(
          '重要提醒：\n\n您已经使用过一次免费修改出生日期的机会。\n\n继续修改日期将需要付费服务。\n\n确定要继续吗？'
        );
        
        if (!confirmed) {
          setSaving(false);
          return;
        }
      }

      // 调用API更新档案 - 使用统一API
      const response = await apiClient.put('/api/user/profile-unified', {
        birth_date: newDate,
        birth_time: profile.birth_time || '',
        birth_location: editForm.birth_location || profile.birth_location || '',
        is_date_changed: isDateChanged
      });

      if (response?.success && response.data?.success) {
        // 更新本地状态
        setProfile(response.data?.profile);
        setEditForm({
          ...editForm,
          birth_date: newDate
        });
        setIsEditingDate(false);
        
        // 显示成功消息
        alert('出生日期保存成功！');
        checkAndRedirect(response.data?.profile); // 调用检查并跳转
      } else {
        // 处理错误
        if (response.data?.code === 'EDIT_LIMIT_EXCEEDED') {
          alert('您已使用过免费修改出生日期的机会，继续修改日期需要付费服务。');
        } else {
          alert(response.data?.error || '保存失败，请重试');
        }
      }
      
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTime = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    
    try {
      // 调用API更新档案（只更新时辰和地点）
      const response = await apiClient.put('/api/user/profile', {
        birth_date: profile.birth_date || '',
        birth_time: editForm.birth_time,
        birth_location: editForm.birth_location,
        is_date_changed: false // 明确标记没有修改日期
      });

      if (response?.success && response.data?.success) {
        // 更新本地状态
        setProfile(response.data?.profile);
        setIsEditingTime(false);
        
        // 显示成功消息
        alert('时辰信息保存成功！');
        checkAndRedirect(response.data?.profile); // 调用检查并跳转
      } else {
        alert(response.data?.error || '保存失败，请重试');
      }
      
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGender = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    
    try {
      // 检查是否修改了性别
      const isGenderChanged = editForm.gender !== profile.gender;
      const isFirstEdit = !profile.gender; // 如果没有性别，说明是第一次设置
      
      // 只有修改性别时才检查次数限制（首次设置不算修改）
      if (isGenderChanged && !isFirstEdit && (profile.gender_edit_count || 0) >= 1) {
        const confirmed = window.confirm(
          '重要提醒：\n\n您已经使用过一次免费修改性别的机会。\n\n继续修改性别将需要付费服务。\n\n确定要继续吗？'
        );
        
        if (!confirmed) {
          setSaving(false);
          return;
        }
      }

      // 调用API更新档案 - 使用统一API
      const response = await apiClient.put('/api/user/profile-unified', {
        birth_date: profile.birth_date || '',
        birth_time: profile.birth_time || '',
        birth_location: profile.birth_location || '',
        nickname: profile.nickname || '',
        gender: editForm.gender,
        is_gender_changed: isGenderChanged
      });

      if (response?.success && response.data?.success) {
        // 更新本地状态
        setProfile(response.data?.profile);
        setIsEditingGender(false);
        
        // 显示成功消息
        alert('性别信息保存成功！');
        checkAndRedirect(response.data?.profile); // 调用检查并跳转
      } else {
        // 处理错误
        if (response.data?.code === 'GENDER_EDIT_LIMIT_EXCEEDED') {
          alert('您已使用过免费修改性别的机会，继续修改性别需要付费服务。');
        } else {
          alert(response.data?.error || '保存失败，请重试');
        }
      }
      
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNickname = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    
    try {
      // 临时处理：如果数据库还没有昵称字段，先在本地保存
      // 调用API更新昵称
      const response = await apiClient.put('/api/user/profile', {
        birth_date: profile.birth_date || '',
        birth_time: profile.birth_time || '',
        birth_location: profile.birth_location || '',
        nickname: editForm.nickname,
        is_date_changed: false // 明确标记没有修改日期
      });

      if (response?.success && response.data?.success) {
        // 更新本地状态
        setProfile({
          ...response.data?.profile,
          nickname: editForm.nickname // 确保昵称被保存
        });
        setIsEditingNickname(false);
        
        // 显示成功消息
        alert('昵称保存成功！');
        checkAndRedirect(response.data?.profile); // 调用检查并跳转
      } else {
        // 如果是数据库字段不存在的错误，临时在本地保存
        if (response.data?.error && response.data.error.includes('column')) {
          console.log('数据库昵称字段尚未添加，临时在本地保存');
          const updatedProfile = {
            ...profile,
            nickname: editForm.nickname
          };
          setProfile(updatedProfile);
          setIsEditingNickname(false);
          alert('昵称保存成功！（临时保存，数据库字段待添加）');
          checkAndRedirect(updatedProfile); // 调用检查并跳转
        } else {
          alert(response.data?.error || '保存失败，请重试');
        }
      }
      
    } catch (error) {
      console.error('保存失败:', error);
      // 临时在本地保存
      const updatedProfile = {
        ...profile,
        nickname: editForm.nickname
      };
      setProfile(updatedProfile);
      setIsEditingNickname(false);
      alert('昵称保存成功！（临时保存）');
      checkAndRedirect(updatedProfile); // 调用检查并跳转
    } finally {
      setSaving(false);
    }
  };

  // 自定义返回处理
  const handleBackClick = () => {
    if (returnTo) {
      router.push(returnTo);
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <SmartLayout forceLayout={isEnglish ? 'english' : undefined}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
        </div>
      </SmartLayout>
    );
  }

  if (!currentUser) {
    return (
      <SmartLayout forceLayout={isEnglish ? 'english' : undefined}>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <User className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">{isEnglish ? 'Please login first' : '请先登录'}</h2>
          <p className="text-gray-500 mb-6">{isEnglish ? 'Login to manage your profile' : '登录后即可管理个人档案'}</p>
          <Button 
            onClick={() => window.location.href = '/auth'}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isEnglish ? 'Go to Login' : '前往登录'}
          </Button>
        </div>
      </SmartLayout>
    );
  }

  return (
    <SmartLayout forceLayout={isEnglish ? 'english' : undefined}>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            我的档案
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            管理您的出生信息，为专家级报告做准备
            {returnTo && (
              <span className="block mt-1 text-sm text-purple-600 font-medium">
                完成设置后将返回到{returnTo === '/my-charts' ? '我的星盘' : '上一页'}
              </span>
            )}
          </p>
        </div>

        {/* 提醒信息 */}
        <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            <strong>重要提醒：</strong> 您有一次免费修改出生日期和性别的机会。时辰可以无限次修改。修改后的信息将用于生成更精确的专家级报告。
          </AlertDescription>
        </Alert>

        {/* 档案状态 - 优化排版 */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-purple-600" />
              档案状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 完善状态 */}
              <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <div className="flex items-center gap-3">
                  {profile.profile_complete ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  )}
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {profile.profile_complete ? '档案已完善' : '档案待完善'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {profile.profile_complete ? '所有信息已填写完整' : '请完善出生信息和性别'}
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={profile.profile_complete ? "default" : "secondary"}
                  className={profile.profile_complete ? "bg-green-100 text-green-800 border-green-200" : ""}
                >
                  {profile.profile_complete ? '已激活' : '未激活'}
                </Badge>
              </div>
              
              {/* 日期修改次数 */}
              <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <div className="flex items-center gap-3">
                  <Edit className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      日期修改：{profile.profile_edit_count || 0}/1
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      免费修改绑定日期
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-white/50">
                  {(profile.profile_edit_count || 0) === 0 ? '免费修改一次' : '已使用'}
                </Badge>
              </div>

              {/* 性别修改次数 */}
              <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      性别修改：{profile.gender_edit_count || 0}/1
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      免费修改性别信息
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-white/50">
                  {(profile.gender_edit_count || 0) === 0 ? '免费修改一次' : '已使用'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 用户昵称 - 独立编辑 */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                用户昵称
              </div>
              {!isEditingNickname && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleEditNickname}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  编辑昵称
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingNickname ? (
              <div className="space-y-4">
                {/* 昵称输入框 */}
                <div className="space-y-2">
                  <Label htmlFor="nickname" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    显示昵称
                  </Label>
                  <Input
                    id="nickname"
                    placeholder="请输入您的昵称"
                    value={editForm.nickname}
                    onChange={(e) => setEditForm({...editForm, nickname: e.target.value})}
                    className="w-full"
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500">
                    昵称将在系统中显示，最多20个字符
                  </p>
                </div>

                {/* 提醒信息 */}
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    昵称可以随时修改，用于在系统中更好地识别您的身份。
                  </AlertDescription>
                </Alert>

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSaveNickname}
                    disabled={saving}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? '保存中...' : '保存昵称'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancelNickname}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {profile.nickname ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-lg">{profile.nickname}</span>
                  </div>
                ) : (
                  <span className="text-gray-500">未设置昵称</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 性别选择 - 独立编辑 */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                性别
              </div>
              {!isEditingGender && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleEditGender}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  编辑性别
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingGender ? (
              <div className="space-y-4">
                {/* 性别选择器 */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    选择性别
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setEditForm({...editForm, gender: 'male'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        editForm.gender === 'male'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <User className="h-5 w-5" />
                        <span className="font-medium">男性</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setEditForm({...editForm, gender: 'female'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        editForm.gender === 'female'
                          ? 'border-pink-500 bg-pink-50 text-pink-700 dark:border-pink-400 dark:bg-pink-900/20 dark:text-pink-300'
                          : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <User className="h-5 w-5" />
                        <span className="font-medium">女性</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 提醒信息 */}
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                  <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-amber-700 dark:text-amber-300">
                    <strong>重要提醒：</strong> 首次保存性别后，您有一次免费修改的机会。性别信息将用于生成更精确的专家级报告。
                  </AlertDescription>
                </Alert>

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSaveGender}
                    disabled={saving || !editForm.gender}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? '保存中...' : '保存性别'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancelGender}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {profile.gender ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-lg">
                      {profile.gender === 'male' ? '男性' : '女性'}
                    </span>
                    {(profile.gender_edit_count || 0) < 1 && (
                      <Badge variant="secondary" className="ml-2">
                        可免费修改一次
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">未设置性别</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 出生日期 - 独立编辑 */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                出生日期
              </div>
              {!isEditingDate && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleEditDate}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  编辑日期
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingDate ? (
              <div className="space-y-4">
                {/* 中文日期选择器 */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>年份</Label>
                    <Select 
                      value={dateForm.year} 
                      onValueChange={(value) => setDateForm({...dateForm, year: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择年份" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {YEAR_OPTIONS.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}年
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>月份</Label>
                    <Select 
                      value={dateForm.month} 
                      onValueChange={(value) => setDateForm({...dateForm, month: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择月份" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTH_OPTIONS.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>日期</Label>
                    <Select 
                      value={dateForm.day} 
                      onValueChange={(value) => setDateForm({...dateForm, day: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择日期" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {DAY_OPTIONS.map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 重要提醒 */}
                {!profile.birth_date && (
                  <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      这是您第一次设置出生日期，请仔细核对信息后保存。
                    </AlertDescription>
                  </Alert>
                )}
                
                {profile.birth_date && (profile.profile_edit_count || 0) === 0 && (
                  <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-amber-700 dark:text-amber-300">
                      这是您的免费修改出生日期机会，请仔细核对信息后保存。
                    </AlertDescription>
                  </Alert>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSaveDate}
                    disabled={saving || !dateForm.year || !dateForm.month || !dateForm.day}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? '保存中...' : '保存日期'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancelDate}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {profile.birth_date ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-lg">{profile.birth_date}</span>
                  </div>
                ) : (
                  <span className="text-gray-500">未设置出生日期</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 时辰和地点 - 独立编辑 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                时辰与地点
              </div>
              {!isEditingTime && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleEditTime}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  编辑时辰
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingTime ? (
              <div className="space-y-4">
                {/* 出生时辰 */}
                <div className="space-y-2">
                  <Label htmlFor="birth_time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    出生时辰
                  </Label>
                  <Select 
                    value={editForm.birth_time} 
                    onValueChange={(value) => setEditForm({...editForm, birth_time: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择出生时辰" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 出生地点 */}
                <div className="space-y-2">
                  <Label htmlFor="birth_location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    出生地点
                  </Label>
                  <Input
                    id="birth_location"
                    placeholder="请输入出生城市，如：北京市"
                    value={editForm.birth_location}
                    onChange={(e) => setEditForm({...editForm, birth_location: e.target.value})}
                    className="w-full"
                  />
                </div>

                {/* 提醒信息 */}
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    时辰和地点信息可以随时修改，不受次数限制。
                  </AlertDescription>
                </Alert>

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSaveTime}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? '保存中...' : '保存时辰'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancelTime}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">出生时辰</span>
                  </div>
                  {profile.birth_time ? (
                    <span className="font-medium">
                      {TIME_OPTIONS.find(opt => opt.value === profile.birth_time)?.label || profile.birth_time}
                    </span>
                  ) : (
                    <span className="text-gray-500">未设置时辰</span>
                  )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">出生地点</span>
                  </div>
                  {profile.birth_location ? (
                    <span className="font-medium">{profile.birth_location}</span>
                  ) : (
                    <span className="text-gray-500">未设置地点</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>



        {/* 专家级报告预告 */}
        <Card className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                专家级报告即将推出
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                完善档案后，您将获得基于精确出生信息的深度分析报告
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="bg-white/50 whitespace-nowrap">
                  精准时辰分析
                </Badge>
                <Badge variant="outline" className="bg-white/50 whitespace-nowrap">
                  地理位置修正
                </Badge>
                <Badge variant="outline" className="bg-white/50 whitespace-nowrap">
                  个性化报告
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SmartLayout>
  );
} 