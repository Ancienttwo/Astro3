import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// 获取翻译列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const terminology = searchParams.get('terminology');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('translation_overview')
      .select('*', { count: 'exact' });

    // 筛选条件
    if (category) {
      query = query.eq('category_name', category);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (terminology) {
      query = query.eq('is_terminology', terminology === 'true');
    }
    if (search) {
      query = query.or(`key.ilike.%${search}%,chinese_text.ilike.%${search}%,english_text.ilike.%${search}%,japanese_text.ilike.%${search}%`);
    }

    query = query
      .order('priority', { ascending: false })
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('获取翻译列表失败:', error);
      return NextResponse.json({ error: '获取翻译列表失败' }, { status: 500 });
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('获取翻译列表异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 创建新翻译
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
    const { 
      key, 
      category_id, 
      chinese_text, 
      english_text, 
      japanese_text,
      context, 
      notes, 
      is_terminology, 
      priority 
    } = body;

    // 验证必填字段
    if (!key || !category_id || !chinese_text) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 检查key是否已存在
    const { data: existing } = await supabaseAdmin
      .from('translations')
      .select('id')
      .eq('key', key)
      .eq('category_id', category_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: '该翻译键已存在' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('translations')
      .insert({
        key,
        category_id,
        chinese_text,
        english_text,
        japanese_text,
        context,
        notes,
        is_terminology: is_terminology || false,
        priority: priority || 1,
        created_by: userData.user.id,
        updated_by: userData.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('创建翻译失败:', error);
      return NextResponse.json({ error: '创建翻译失败' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('创建翻译异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 