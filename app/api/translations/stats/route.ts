import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// 获取翻译统计
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('translation_dashboard')
      .select('*');

    if (error) {
      console.error('获取翻译统计失败:', error);
      return NextResponse.json({ error: '获取翻译统计失败' }, { status: 500 });
    }

    // 计算总体统计
    const totalStats = data.reduce((acc, category) => {
      acc.total_count += category.total_count;
      acc.pending_count += category.pending_count;
      acc.translated_count += category.translated_count;
      acc.reviewed_count += category.reviewed_count;
      acc.approved_count += category.approved_count;
      return acc;
    }, {
      total_count: 0,
      pending_count: 0,
      translated_count: 0,
      reviewed_count: 0,
      approved_count: 0
    });

    const overall_completion = totalStats.total_count > 0 
      ? Math.round((totalStats.approved_count / totalStats.total_count) * 100)
      : 0;

    return NextResponse.json({
      overall: {
        ...totalStats,
        completion_percentage: overall_completion
      },
      categories: data
    });
  } catch (error) {
    console.error('获取翻译统计异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 