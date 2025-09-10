import { supabaseAdmin } from '@/lib/supabase';
import { writeFile, readFile, readdir } from 'fs/promises';
import path from 'path';

interface BackupMetadata {
  version: string;
  timestamp: string;
  total_translations: number;
  categories: string[];
  description?: string;
}

export class TranslationBackupManager {
  private backupDir: string;

  constructor() {
    this.backupDir = path.join(process.cwd(), 'lib/i18n/backups');
  }

  // 创建完整备份
  async createFullBackup(description?: string): Promise<string> {
    try {
      const { data: translations, error } = await supabaseAdmin
        .from('translation_overview')
        .select('*')
        .order('category_name');

      if (error) {
        throw new Error(`获取翻译数据失败: ${error.message}`);
      }

      const timestamp = new Date().toISOString();
      const version = `v${Date.now()}`;
      const backupFileName = `backup-${version}.json`;
      const backupPath = path.join(this.backupDir, backupFileName);

      const backupData = {
        metadata: {
          version,
          timestamp,
          total_translations: translations.length,
          categories: [...new Set(translations.map(t => t.category_name))],
          description
        } as BackupMetadata,
        translations,
        categories: await this.getCategories()
      };

      await writeFile(backupPath, JSON.stringify(backupData, null, 2), 'utf8');

      return backupPath;
    } catch (error) {
      console.error('创建备份失败:', error);
      throw error;
    }
  }

  // 恢复备份
  async restoreBackup(backupVersion: string): Promise<void> {
    try {
      const backupPath = path.join(this.backupDir, `backup-${backupVersion}.json`);
      const backupContent = await readFile(backupPath, 'utf8');
      const backupData = JSON.parse(backupContent);

      // 清空当前翻译数据
      await supabaseAdmin.from('translations').delete().neq('id', 0);

      // 恢复分类
      for (const category of backupData.categories) {
        await supabaseAdmin
          .from('translation_categories')
          .upsert(category, { onConflict: 'name' });
      }

      // 恢复翻译数据
      for (const translation of backupData.translations) {
        // 获取分类ID
        const { data: categoryData } = await supabaseAdmin
          .from('translation_categories')
          .select('id')
          .eq('name', translation.category_name)
          .single();

        if (categoryData) {
          await supabaseAdmin
            .from('translations')
            .insert({
              key: translation.key,
              category_id: categoryData.id,
              chinese_text: translation.chinese_text,
              english_text: translation.english_text,
              context: translation.context,
              notes: translation.notes,
              status: translation.status,
              is_terminology: translation.is_terminology,
              priority: translation.priority
            });
        }
      }

      console.log(`备份 ${backupVersion} 恢复成功`);
    } catch (error) {
      console.error('恢复备份失败:', error);
      throw error;
    }
  }

  // 获取备份列表
  async getBackupList(): Promise<BackupMetadata[]> {
    try {
      const files = await readdir(this.backupDir);
      const backupFiles = files.filter(file => file.startsWith('backup-') && file.endsWith('.json'));
      
      const backups: BackupMetadata[] = [];
      
      for (const file of backupFiles) {
        try {
          const backupPath = path.join(this.backupDir, file);
          const content = await readFile(backupPath, 'utf8');
          const data = JSON.parse(content);
          backups.push(data.metadata);
        } catch (error) {
          console.error(`读取备份文件 ${file} 失败:`, error);
        }
      }
      
      return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('获取备份列表失败:', error);
      return [];
    }
  }

  // 导出字典格式
  async exportDictionary(format: 'json' | 'typescript' = 'json'): Promise<string> {
    try {
      const { data: translations, error } = await supabaseAdmin
        .from('translation_overview')
        .select('*')
        .eq('status', 'approved')
        .order('category_name');

      if (error) {
        throw new Error(`获取翻译数据失败: ${error.message}`);
      }

      // 按分类组织翻译数据
      const translationsByCategory: Record<string, Record<string, { zh: string; en: string }>> = {};
      
      for (const translation of translations) {
        const category = translation.category_name;
        if (!translationsByCategory[category]) {
          translationsByCategory[category] = {};
        }
        
        translationsByCategory[category][translation.key] = {
          zh: translation.chinese_text,
          en: translation.english_text || translation.chinese_text
        };
      }

      const timestamp = new Date().toISOString();
      const exportPath = path.join(this.backupDir, `export-${Date.now()}.${format}`);

      if (format === 'json') {
        const exportData = {
          export_timestamp: timestamp,
          categories: translationsByCategory
        };
        await writeFile(exportPath, JSON.stringify(exportData, null, 2), 'utf8');
      } else {
        const tsContent = this.generateTypescriptDictionary(translationsByCategory, timestamp);
        await writeFile(exportPath, tsContent, 'utf8');
      }

      return exportPath;
    } catch (error) {
      console.error('导出字典失败:', error);
      throw error;
    }
  }

  // 生成TypeScript字典文件
  private generateTypescriptDictionary(
    translationsByCategory: Record<string, Record<string, { zh: string; en: string }>>,
    timestamp: string
  ): string {
    const categories = Object.keys(translationsByCategory);
    
    const content = `// 翻译字典文件
// 导出时间: ${timestamp}

export type Dictionary = {
${categories.map(category => `  ${category}: {
${Object.keys(translationsByCategory[category]).map(key => `    ${key}: string;`).join('\n')}
  };`).join('\n')}
};

export const dictionaries = {
  zh: {
${categories.map(category => `    ${category}: {
${Object.keys(translationsByCategory[category]).map(key => `      ${key}: "${translationsByCategory[category][key].zh.replace(/"/g, '\\"')}",`).join('\n')}
    },`).join('\n')}
  } as Dictionary,
  
  en: {
${categories.map(category => `    ${category}: {
${Object.keys(translationsByCategory[category]).map(key => `      ${key}: "${translationsByCategory[category][key].en.replace(/"/g, '\\"')}",`).join('\n')}
    },`).join('\n')}
  } as Dictionary,
};

export type Locale = keyof typeof dictionaries;
`;

    return content;
  }

  // 获取分类列表
  private async getCategories() {
    const { data: categories, error } = await supabaseAdmin
      .from('translation_categories')
      .select('*')
      .order('sort_order');

    if (error) {
      console.error('获取分类失败:', error);
      return [];
    }

    return categories;
  }
}

// 单例实例
export const translationBackupManager = new TranslationBackupManager(); 