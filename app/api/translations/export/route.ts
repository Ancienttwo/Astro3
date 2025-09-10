import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// 导出翻译
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // 'json' | 'csv'
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const terminology = searchParams.get('terminology');

    let query = supabaseAdmin
      .from('translation_overview')
      .select('*');

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

    const { data, error } = await query.order('category_name', { ascending: true });

    if (error) {
      console.error('导出翻译失败:', error);
      return NextResponse.json({ error: '导出翻译失败' }, { status: 500 });
    }

    if (format === 'csv') {
      // CSV格式导出
      const csvHeaders = [
        'Key',
        'Category',
        'Chinese Text',
        'English Text',
        'Japanese Text',
        'Context',
        'Notes',
        'Status',
        'Is Terminology',
        'Priority',
        'Created At',
        'Updated At'
      ];

      const csvRows = data.map(item => [
        item.key,
        item.category_name,
        item.chinese_text,
        item.english_text || '',
        item.japanese_text || '',
        item.context || '',
        item.notes || '',
        item.status,
        item.is_terminology ? '1' : '0',
        item.priority,
        item.created_at,
        item.updated_at
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="translations-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else {
      // JSON格式导出
      const jsonData = {
        export_date: new Date().toISOString(),
        total_count: data.length,
        filters: {
          category,
          status,
          terminology
        },
        translations: data.map(item => ({
          key: item.key,
          category_name: item.category_name,
          chinese_text: item.chinese_text,
          english_text: item.english_text,
          japanese_text: item.japanese_text,
          context: item.context,
          notes: item.notes,
          status: item.status,
          is_terminology: item.is_terminology,
          priority: item.priority,
          created_at: item.created_at,
          updated_at: item.updated_at
        }))
      };

      return new Response(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="translations-${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    }
  } catch (error) {
    console.error('导出翻译异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 