import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { invalidateByExactPath } from '@/lib/edge/invalidate'
import { supabaseReadonly } from '@/lib/supabase-optimized';

// 获取所有分类
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseReadonly
      .from('translation_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('获取翻译分类失败:', error);
      return NextResponse.json({ error: '获取翻译分类失败' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('获取翻译分类异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 创建新分类
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      return NextResponse.json({ error: '认证失败' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, parent_id, sort_order } = body;

    // 验证必填字段
    if (!name) {
      return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 });
    }

    // 检查分类名是否已存在
    const { data: existing } = await supabaseAdmin
      .from('translation_categories')
      .select('id')
      .eq('name', name)
      .single();

    if (existing) {
      return NextResponse.json({ error: '分类名称已存在' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('translation_categories')
      .insert({
        name,
        description,
        parent_id,
        sort_order: sort_order || 0
      })
      .select()
      .single();

    if (error) {
      console.error('创建翻译分类失败:', error);
      return NextResponse.json({ error: '创建翻译分类失败' }, { status: 500 });
    }

    try {
      await invalidateByExactPath('/api/translations/categories','user')
      await invalidateByExactPath('/api/translations/stats','user')
      await invalidateByExactPath('/api/translations','user')
    } catch {}

    return NextResponse.json(data);
  } catch (error) {
    console.error('创建翻译分类异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 
