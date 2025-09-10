import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { writeFile } from 'fs/promises';
import path from 'path';

// 同步翻译到字典文件
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

    // 获取所有已批准的翻译
    const { data: translations, error } = await supabaseAdmin
      .from('translation_overview')
      .select('*')
      .eq('status', 'approved')
      .order('category_name');

    if (error) {
      console.error('获取翻译数据失败:', error);
      return NextResponse.json({ error: '获取翻译数据失败' }, { status: 500 });
    }

    // 按分类组织翻译数据
    const translationsByCategory: Record<string, Record<string, { zh: string; en: string; ja: string }>> = {};
    
    for (const translation of translations) {
      const category = translation.category_name;
      if (!translationsByCategory[category]) {
        translationsByCategory[category] = {};
      }
      
      translationsByCategory[category][translation.key] = {
        zh: translation.chinese_text,
        en: translation.english_text || translation.chinese_text,
        ja: translation.japanese_text || translation.chinese_text
      };
    }

    // 生成字典文件内容
    const dictionaryContent = generateDictionaryFile(translationsByCategory);

    // 写入字典文件
    const dictionaryPath = path.join(process.cwd(), 'lib/i18n/dictionaries.ts');
    await writeFile(dictionaryPath, dictionaryContent, 'utf8');

    // 生成备份文件
    const backupPath = path.join(process.cwd(), `lib/i18n/dictionaries-backup-${Date.now()}.ts`);
    await writeFile(backupPath, dictionaryContent, 'utf8');

    return NextResponse.json({
      message: '翻译同步成功',
      categories: Object.keys(translationsByCategory),
      total_translations: translations.length,
      backup_file: backupPath
    });
  } catch (error) {
    console.error('同步翻译失败:', error);
    return NextResponse.json({ error: '同步失败' }, { status: 500 });
  }
}

// 生成字典文件内容
function generateDictionaryFile(translationsByCategory: Record<string, Record<string, { zh: string; en: string; ja: string }>>): string {
  const now = new Date().toISOString();
  
  const content = `// 翻译字典文件
// 自动生成时间: ${now}
// 警告: 请勿手动修改此文件，所有更改将在下次同步时被覆盖

export type Dictionary = {
${Object.keys(translationsByCategory).map(category => `  ${category}: {
${Object.keys(translationsByCategory[category]).map(key => `    ${key}: string;`).join('\n')}
  };`).join('\n')}
};

export const dictionaries = {
  zh: {
${Object.keys(translationsByCategory).map(category => `    ${category}: {
${Object.keys(translationsByCategory[category]).map(key => `      ${key}: "${translationsByCategory[category][key].zh.replace(/"/g, '\\"')}",`).join('\n')}
    },`).join('\n')}
  } as Dictionary,
  
  en: {
${Object.keys(translationsByCategory).map(category => `    ${category}: {
${Object.keys(translationsByCategory[category]).map(key => `      ${key}: "${translationsByCategory[category][key].en.replace(/"/g, '\\"')}",`).join('\n')}
    },`).join('\n')}
  } as Dictionary,
  
  ja: {
${Object.keys(translationsByCategory).map(category => `    ${category}: {
${Object.keys(translationsByCategory[category]).map(key => `      ${key}: "${translationsByCategory[category][key].ja.replace(/"/g, '\\"')}",`).join('\n')}
    },`).join('\n')}
  } as Dictionary,
};

export type Locale = keyof typeof dictionaries;

export function getDictionary(locale: 'zh' | 'en' | 'ja'): Dictionary {
  switch (locale) {
    case 'en':
      return dictionaries.en;
    case 'ja':
      return dictionaries.ja;
    default:
      return dictionaries.zh;
  }
}
`;

  return content;
}

// 获取同步状态
export async function GET(request: NextRequest) {
  try {
    const { data: translations, error } = await supabaseAdmin
      .from('translation_overview')
      .select('category_name, status')
      .order('category_name');

    if (error) {
      console.error('获取翻译状态失败:', error);
      return NextResponse.json({ error: '获取翻译状态失败' }, { status: 500 });
    }

    // 统计各分类的翻译状态
    const categoryStats: Record<string, Record<string, number>> = {};
    
    for (const translation of translations) {
      const category = translation.category_name;
      if (!categoryStats[category]) {
        categoryStats[category] = {
          total: 0,
          pending: 0,
          translated: 0,
          reviewed: 0,
          approved: 0
        };
      }
      
      categoryStats[category].total++;
      categoryStats[category][translation.status]++;
    }

    return NextResponse.json({
      categories: categoryStats,
      total_translations: translations.length,
      sync_ready: translations.filter(t => t.status === 'approved').length
    });
  } catch (error) {
    console.error('获取同步状态失败:', error);
    return NextResponse.json({ error: '获取同步状态失败' }, { status: 500 });
  }
} 