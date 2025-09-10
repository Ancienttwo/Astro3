'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, AlertCircle, Plus, Search, Download, Upload } from 'lucide-react';

interface Translation {
  id: number;
  key: string;
  category_name: string;
  chinese_text: string;
  english_text: string;
  status: 'pending' | 'translated' | 'reviewed' | 'approved';
  is_terminology: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Stats {
  category_name: string;
  total_count: number;
  pending_count: number;
  translated_count: number;
  reviewed_count: number;
  approved_count: number;
  completion_percentage: number;
}

export default function TranslationManagement() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 编辑对话框状态
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 新建翻译状态
  const [newTranslation, setNewTranslation] = useState({
    key: '',
    category_id: '',
    chinese_text: '',
    english_text: '',
    context: '',
    notes: '',
    is_terminology: false,
    priority: 1
  });

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const [translationsRes, categoriesRes, statsRes] = await Promise.all([
        fetch(`/api/translations?page=${currentPage}&limit=20&search=${searchTerm}&category=${selectedCategory}&status=${selectedStatus}`),
        fetch('/api/translations/categories'),
        fetch('/api/translations/stats')
      ]);

      if (translationsRes.ok) {
        const translationsData = await translationsRes.json();
        setTranslations(translationsData.translations || []);
        setTotalPages(translationsData.totalPages || 1);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData || []);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, searchTerm, selectedCategory, selectedStatus]);

  // 获取状态显示
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'secondary',
      translated: 'outline',
      reviewed: 'default',
      approved: 'default'
    };
    
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      translated: 'bg-blue-500',
      reviewed: 'bg-purple-500',
      approved: 'bg-green-500'
    };

    return (
      <Badge variant={variants[status] as any} className={colors[status]}>
        {status === 'pending' && '待翻译'}
        {status === 'translated' && '已翻译'}
        {status === 'reviewed' && '已审核'}
        {status === 'approved' && '已批准'}
      </Badge>
    );
  };

  // 保存翻译
  const saveTranslation = async (translation: Partial<Translation>) => {
    try {
      const url = translation.id ? `/api/translations/${translation.id}` : '/api/translations';
      const method = translation.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(translation)
      });

      if (response.ok) {
        await loadData();
        setDialogOpen(false);
        setEditingTranslation(null);
        setNewTranslation({
          key: '',
          category_id: '',
          chinese_text: '',
          english_text: '',
          context: '',
          notes: '',
          is_terminology: false,
          priority: 1
        });
      } else {
        const error = await response.json();
        alert(`保存失败：${error.error}`);
      }
    } catch (error) {
      console.error('保存翻译失败:', error);
      alert('保存失败，请重试');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">翻译系统管理</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTranslation(null)}>
              <Plus className="h-4 w-4 mr-2" />
              新建翻译
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTranslation ? '编辑翻译' : '新建翻译'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>键名</Label>
                  <Input
                    value={editingTranslation?.key || newTranslation.key}
                    onChange={(e) => {
                      if (editingTranslation) {
                        setEditingTranslation({...editingTranslation, key: e.target.value});
                      } else {
                        setNewTranslation({...newTranslation, key: e.target.value});
                      }
                    }}
                    placeholder="例如：login, logout"
                  />
                </div>
                <div>
                  <Label>分类</Label>
                  <Select
                    value={editingTranslation?.category_name || newTranslation.category_id}
                    onValueChange={(value) => {
                      if (editingTranslation) {
                        const category = categories.find(c => c.name === value);
                        setEditingTranslation({...editingTranslation, category_name: value});
                      } else {
                        setNewTranslation({...newTranslation, category_id: value});
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>中文文本</Label>
                <Textarea
                  value={editingTranslation?.chinese_text || newTranslation.chinese_text}
                  onChange={(e) => {
                    if (editingTranslation) {
                      setEditingTranslation({...editingTranslation, chinese_text: e.target.value});
                    } else {
                      setNewTranslation({...newTranslation, chinese_text: e.target.value});
                    }
                  }}
                  placeholder="输入中文文本"
                />
              </div>
              
              <div>
                <Label>英文文本</Label>
                <Textarea
                  value={editingTranslation?.english_text || newTranslation.english_text}
                  onChange={(e) => {
                    if (editingTranslation) {
                      setEditingTranslation({...editingTranslation, english_text: e.target.value});
                    } else {
                      setNewTranslation({...newTranslation, english_text: e.target.value});
                    }
                  }}
                  placeholder="输入英文文本"
                />
              </div>
              
                             <div className="flex gap-4 pt-4">
                 <Button 
                                        onClick={() => {
                       if (editingTranslation) {
                         saveTranslation(editingTranslation);
                       } else {
                         const category = categories.find(c => c.id === parseInt(newTranslation.category_id));
                         const { category_id, ...translationData } = newTranslation;
                         saveTranslation({
                           ...translationData,
                           category_name: category?.name || ''
                         });
                       }
                     }}
                   className="flex-1"
                 >
                   保存
                 </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="translations" className="w-full">
        <TabsList>
          <TabsTrigger value="translations">翻译列表</TabsTrigger>
          <TabsTrigger value="statistics">统计概览</TabsTrigger>
        </TabsList>
        
        <TabsContent value="translations" className="space-y-4">
          {/* 筛选器 */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="搜索翻译..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有分类</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="pending">待翻译</SelectItem>
                <SelectItem value="translated">已翻译</SelectItem>
                <SelectItem value="reviewed">已审核</SelectItem>
                <SelectItem value="approved">已批准</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 翻译列表 */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">加载中...</div>
            ) : translations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无翻译数据
              </div>
            ) : (
              translations.map((translation) => (
                <Card key={translation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {translation.key}
                          </code>
                          <Badge variant="outline">{translation.category_name}</Badge>
                          {getStatusBadge(translation.status)}
                          {translation.is_terminology && (
                            <Badge variant="secondary">术语</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">中文</div>
                            <div>{translation.chinese_text}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">英文</div>
                            <div>{translation.english_text || '未翻译'}</div>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingTranslation(translation);
                          setDialogOpen(true);
                        }}
                      >
                        编辑
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                上一页
              </Button>
              <span className="flex items-center px-3">
                第 {currentPage} 页，共 {totalPages} 页
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <Card key={stat.category_name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{stat.category_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>总计</span>
                      <span className="font-bold">{stat.total_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>已完成</span>
                      <span className="text-green-600">{stat.approved_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>待处理</span>
                      <span className="text-yellow-600">{stat.pending_count}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <div className="flex justify-between text-sm font-medium">
                        <span>完成度</span>
                        <span>{stat.completion_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${stat.completion_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 