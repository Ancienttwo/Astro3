// Fortune Slips Repository
const { getDatabase } = require('../services/database');

class FortuneSlipsRepository {
  constructor() {
    this.db = getDatabase();
    this.table = 'fortune_slips';
  }

  /**
   * Get fortune slip by number and temple system
   */
  async getBySlipNumber(slipNumber, templeSystemId) {
    const { data } = await this.db.findMany(this.table, {
      slip_number: slipNumber,
      temple_system_id: templeSystemId
    });
    
    return data[0] || null;
  }

  /**
   * Get all fortune slips for a temple system
   */
  async getAllByTempleSystem(templeSystemId, options = {}) {
    return await this.db.findMany(this.table, {
      temple_system_id: templeSystemId
    }, {
      orderBy: { field: 'slip_number', ascending: true },
      ...options
    });
  }

  /**
   * Get random fortune slip
   */
  async getRandomSlip(templeSystemId) {
    const { data } = await this.db.adminClient
      .from(this.table)
      .select('*')
      .eq('temple_system_id', templeSystemId)
      .order('slip_number');
    
    if (!data || data.length === 0) {
      throw new Error('No fortune slips found for temple system');
    }
    
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  }

  /**
   * Search fortune slips by content
   */
  async searchByContent(query, templeSystemId, options = {}) {
    const { data, error } = await this.db.publicClient
      .from(this.table)
      .select('*')
      .eq('temple_system_id', templeSystemId)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,basic_interpretation.ilike.%${query}%`)
      .order('slip_number')
      .limit(options.limit || 10);
    
    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
    
    return data;
  }

  /**
   * Get fortune slip with translations
   */
  async getWithTranslations(slipNumber, templeSystemId, language = 'zh-TW') {
    const slip = await this.getBySlipNumber(slipNumber, templeSystemId);
    
    if (!slip) {
      return null;
    }
    
    // Add language-specific content
    const translatedSlip = {
      ...slip,
      displayTitle: this.getLocalizedContent(slip, 'title', language),
      displayContent: this.getLocalizedContent(slip, 'content', language),
      displayInterpretation: this.getLocalizedContent(slip, 'basic_interpretation', language),
      displayHistoricalContext: this.getLocalizedContent(slip, 'historical_context', language),
      displaySymbolism: this.getLocalizedContent(slip, 'symbolism', language),
    };
    
    return translatedSlip;
  }

  /**
   * Get localized content based on language
   */
  getLocalizedContent(slip, field, language) {
    const languageMap = {
      'zh-TW': '',        // Default Chinese
      'zh-CN': '_cn',     // Simplified Chinese
      'en': '_en',        // English
      'ja': '_ja'         // Japanese
    };
    
    const suffix = languageMap[language] || '';
    const localizedField = `${field}${suffix}`;
    
    return slip[localizedField] || slip[field] || '';
  }

  /**
   * Get categories with translations
   */
  getCategoriesWithTranslations(slip, language = 'zh-TW') {
    if (!slip.categories || !Array.isArray(slip.categories)) {
      return [];
    }
    
    return slip.categories.map(categoryStr => {
      try {
        const category = typeof categoryStr === 'string' ? JSON.parse(categoryStr) : categoryStr;
        
        return {
          ...category,
          displayCategory: this.getCategoryTranslation(category.category, language),
          displayJudgment: this.getJudgmentTranslation(category, language)
        };
      } catch (error) {
        console.warn('Failed to parse category:', categoryStr);
        return null;
      }
    }).filter(Boolean);
  }

  /**
   * Get category name translation
   */
  getCategoryTranslation(category, language) {
    const translations = {
      '功名': { en: 'Career & Fame', ja: '功名・名声', cn: '功名' },
      '六甲': { en: 'Pregnancy & Birth', ja: '懐妊・出産', cn: '六甲' },
      '求財': { en: 'Wealth & Fortune', ja: '財運', cn: '求财' },
      '婚姻': { en: 'Marriage & Romance', ja: '結婚・恋愛', cn: '婚姻' },
      '農牧': { en: 'Agriculture & Livestock', ja: '農業・畜産', cn: '农牧' },
      '失物': { en: 'Lost Items', ja: '紛失物', cn: '失物' },
      '生意': { en: 'Business & Trade', ja: '商売・取引', cn: '生意' },
      '丁口': { en: 'Family & Population', ja: '家族・人口', cn: '丁口' },
      '出行': { en: 'Travel & Journey', ja: '旅行・外出', cn: '出行' },
      '疾病': { en: 'Health & Illness', ja: '健康・病気', cn: '疾病' },
      '官司': { en: 'Legal Matters', ja: '法的問題', cn: '官司' },
      '時運': { en: 'Current Fortune', ja: '運勢', cn: '时运' }
    };
    
    const languageCode = language.split('-')[0]; // 'zh-TW' -> 'zh'
    return translations[category]?.[languageCode] || category;
  }

  /**
   * Get judgment translation
   */
  getJudgmentTranslation(category, language) {
    if (language.startsWith('en') && category.judgment_en) {
      return category.judgment_en;
    }
    if (language === 'ja' && category.judgment_ja) {
      return category.judgment_ja;
    }
    if (language === 'zh-CN' && category.judgment_cn) {
      return category.judgment_cn;
    }
    
    return category.judgment; // Default to original
  }

  /**
   * Update fortune slip
   */
  async updateSlip(id, data) {
    return await this.db.update(this.table, id, data, true); // Use admin client
  }

  /**
   * Batch update fortune slips
   */
  async batchUpdate(updates) {
    const operations = updates.map(({ id, data }) => 
      async (client) => {
        const { data: result, error } = await client
          .from(this.table)
          .update(data)
          .eq('id', id)
          .select();
        
        if (error) throw error;
        return result[0];
      }
    );
    
    return await this.db.transaction(operations);
  }

  /**
   * Get statistics
   */
  async getStatistics(templeSystemId) {
    const totalSlips = await this.db.count(this.table, { temple_system_id: templeSystemId });
    
    // Count translated slips
    const { data: translatedSlips } = await this.db.adminClient
      .from(this.table)
      .select('title_en, basic_interpretation_en, historical_context_en, symbolism_en')
      .eq('temple_system_id', templeSystemId)
      .not('title_en', 'is', null);
    
    const translatedCount = translatedSlips?.length || 0;
    
    return {
      total: totalSlips,
      translated: translatedCount,
      translationProgress: totalSlips > 0 ? (translatedCount / totalSlips * 100).toFixed(1) : 0
    };
  }
}

module.exports = { FortuneSlipsRepository };