import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface RouteParams {
  params: {
    id: string;
  };
}

// 获取单个翻译
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const { data, error } = await supabaseAdmin
      .from('translation_overview')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('获取翻译详情失败:', error);
      return NextResponse.json({ error: '翻译不存在' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('获取翻译详情异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 更新翻译
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const { id } = params;
    const body = await request.json();
    const { 
      key, 
      category_id, 
      chinese_text, 
      english_text, 
      japanese_text,
      context, 
      notes, 
      status, 
      is_terminology, 
      priority 
    } = body;

    // 验证必填字段
    if (!key || !category_id || !chinese_text) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 检查翻译是否存在
    const { data: existing } = await supabaseAdmin
      .from('translations')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: '翻译不存在' }, { status: 404 });
    }

    // 如果key或category_id变化，检查是否冲突
    if (key || category_id) {
      const { data: duplicate } = await supabaseAdmin
        .from('translations')
        .select('id')
        .eq('key', key)
        .eq('category_id', category_id)
        .neq('id', id)
        .single();

      if (duplicate) {
        return NextResponse.json({ error: '该翻译键已存在' }, { status: 400 });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('translations')
      .update({
        key,
        category_id,
        chinese_text,
        english_text,
        japanese_text,
        context,
        notes,
        status,
        is_terminology: is_terminology || false,
        priority: priority || 1,
        updated_by: userData.user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新翻译失败:', error);
      return NextResponse.json({ error: '更新翻译失败' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('更新翻译异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 删除翻译
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id } = params;

    // 检查翻译是否存在
    const { data: existing } = await supabaseAdmin
      .from('translations')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: '翻译不存在' }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from('translations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除翻译失败:', error);
      return NextResponse.json({ error: '删除翻译失败' }, { status: 500 });
    }

    return NextResponse.json({ message: '翻译已删除' });
  } catch (error) {
    console.error('删除翻译异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 