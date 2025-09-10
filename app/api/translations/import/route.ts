import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// 批量导入翻译
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
    const { translations, mode = 'skip' } = body; // mode: 'skip' | 'update' | 'replace'

    if (!Array.isArray(translations) || translations.length === 0) {
      return NextResponse.json({ error: '导入数据不能为空' }, { status: 400 });
    }

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[]
    };

    // 批量处理翻译
    for (const translation of translations) {
      try {
        const { key, category_name, chinese_text, english_text, japanese_text, context, notes, is_terminology, priority } = translation;

        // 验证必填字段
        if (!key || !category_name || !chinese_text) {
          results.failed++;
          results.errors.push(`翻译 "${key}" 缺少必填字段`);
          continue;
        }

        // 获取分类ID
        const { data: categoryData } = await supabaseAdmin
          .from('translation_categories')
          .select('id')
          .eq('name', category_name)
          .single();

        if (!categoryData) {
          results.failed++;
          results.errors.push(`分类 "${category_name}" 不存在`);
          continue;
        }

        // 检查是否已存在
        const { data: existing } = await supabaseAdmin
          .from('translations')
          .select('id')
          .eq('key', key)
          .eq('category_id', categoryData.id)
          .single();

        if (existing) {
          if (mode === 'skip') {
            results.skipped++;
            continue;
          } else if (mode === 'update') {
            // 更新现有翻译
            const { error: updateError } = await supabaseAdmin
              .from('translations')
              .update({
                chinese_text,
                english_text,
                japanese_text,
                context,
                notes,
                is_terminology: is_terminology || false,
                priority: priority || 1,
                updated_by: userData.user.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id);

            if (updateError) {
              results.failed++;
              results.errors.push(`更新翻译 "${key}" 失败: ${updateError.message}`);
            } else {
              results.success++;
            }
            continue;
          }
        }

        // 创建新翻译
        const { error: insertError } = await supabaseAdmin
          .from('translations')
          .insert({
            key,
            category_id: categoryData.id,
            chinese_text,
            english_text,
            japanese_text,
            context,
            notes,
            is_terminology: is_terminology || false,
            priority: priority || 1,
            created_by: userData.user.id,
            updated_by: userData.user.id
          });

        if (insertError) {
          results.failed++;
          results.errors.push(`创建翻译 "${key}" 失败: ${insertError.message}`);
        } else {
          results.success++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`处理翻译失败: ${error}`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('批量导入翻译异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 