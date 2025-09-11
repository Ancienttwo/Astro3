/**
 * 多语言签文测试API端点
 * 测试第7-8签的多语言数据
 * 路径: /api/fortune/test-multilingual
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { 
  withMultilingualSupport, 
  MultilingualAPIMiddleware
} from '@/lib/middleware/multilingual-api';

type SupportedLanguage = 'zh-CN' | 'zh-TW' | 'en-US';

// 测试数据结构
interface TestResult {
  slip_number: number;
  language: string;
  has_translation: boolean;
  data_quality: {
    title_present: boolean;
    content_present: boolean;
    interpretation_present: boolean;
    historical_context_present: boolean;
    symbolism_present: boolean;
    keywords_count: number;
  };
  sample_content: {
    title: string;
    content_preview: string;
  };
}

/**
 * 测试指定签文的多语言数据
 */
async function testSlipMultilingualData(
  slipNumber: number,
  language: SupportedLanguage
): Promise<TestResult | null> {
  try {
    // 查询多语言数据
    const { data, error } = await supabase
      .from('v_fortune_slips_complete')
      .select('*')
      .eq('slip_number', slipNumber)
      .eq('temple_code', 'guandi')
      .eq('language_code', language)
      .single();

    if (error || !data) {
      return {
        slip_number: slipNumber,
        language,
        has_translation: false,
        data_quality: {
          title_present: false,
          content_present: false,
          interpretation_present: false,
          historical_context_present: false,
          symbolism_present: false,
          keywords_count: 0
        },
        sample_content: {
          title: 'Not found',
          content_preview: 'Not found'
        }
      };
    }

    // 分析数据质量
    const dataQuality = {
      title_present: !!data.title && data.title.length > 0,
      content_present: !!data.content && data.content.length > 0,
      interpretation_present: !!data.basic_interpretation && data.basic_interpretation.length > 0,
      historical_context_present: !!data.historical_context && data.historical_context.length > 0,
      symbolism_present: !!data.symbolism && data.symbolism.length > 0,
      keywords_count: data.keywords ? data.keywords.length : 0
    };

    return {
      slip_number: slipNumber,
      language,
      has_translation: true,
      data_quality: dataQuality,
      sample_content: {
        title: data.title || 'No title',
        content_preview: data.content ? data.content.substring(0, 100) + '...' : 'No content'
      }
    };

  } catch (error) {
    console.error(`Error testing slip ${slipNumber} in ${language}:`, error);
    return null;
  }
}

/**
 * GET 请求处理器
 */
async function handleGetRequest(
  request: NextRequest,
  language: SupportedLanguage
): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl;
    const testSlipNumbers = searchParams.get('slips')?.split(',').map(n => parseInt(n)) || [7, 8];
    const testLanguages = searchParams.get('languages')?.split(',') as SupportedLanguage[] || ['zh-CN', 'zh-TW', 'en-US'];

    console.log(`🧪 Testing slips: ${testSlipNumbers.join(', ')} in languages: ${testLanguages.join(', ')}`);

    const testResults: TestResult[] = [];
    
    // 测试每个签文的每种语言
    for (const slipNumber of testSlipNumbers) {
      for (const testLang of testLanguages) {
        const result = await testSlipMultilingualData(slipNumber, testLang as SupportedLanguage);
        if (result) {
          testResults.push(result);
        }
      }
    }

    // 生成测试摘要
    const summary: {
      total_tests: number;
      successful_translations: number;
      failed_translations: number;
      average_data_quality: {
        title_coverage: string;
        content_coverage: string;
        interpretation_coverage: string;
        historical_context_coverage: string;
        symbolism_coverage: string;
      };
      recommendations: string[];
    } = {
      total_tests: testResults.length,
      successful_translations: testResults.filter(r => r.has_translation).length,
      failed_translations: testResults.filter(r => !r.has_translation).length,
      average_data_quality: {
        title_coverage: (testResults.filter(r => r.data_quality.title_present).length / testResults.length * 100).toFixed(1) + '%',
        content_coverage: (testResults.filter(r => r.data_quality.content_present).length / testResults.length * 100).toFixed(1) + '%',
        interpretation_coverage: (testResults.filter(r => r.data_quality.interpretation_present).length / testResults.length * 100).toFixed(1) + '%',
        historical_context_coverage: (testResults.filter(r => r.data_quality.historical_context_present).length / testResults.length * 100).toFixed(1) + '%',
        symbolism_coverage: (testResults.filter(r => r.data_quality.symbolism_present).length / testResults.length * 100).toFixed(1) + '%'
      },
      recommendations: []
    };

    // 生成建议
    if (summary.failed_translations > 0) {
      summary.recommendations.push('Some translations are missing - consider running the data processing script');
    }
    if (summary.successful_translations === summary.total_tests) {
      summary.recommendations.push('All translations are present - multilingual system is ready');
    }

    const response = MultilingualAPIMiddleware.createResponse({
      test_metadata: {
        tested_slips: testSlipNumbers,
        tested_languages: testLanguages,
        test_timestamp: new Date().toISOString(),
        api_version: '2.0-test'
      },
      summary,
      detailed_results: testResults,
      next_steps: [
        'Run the data processing script if translations are missing',
        'Test the v2 API endpoints with the processed data',
        'Verify the demo page functionality',
        'Proceed with AI interpretation system development'
      ]
    }, language, {
      translationAvailable: true,
      fallbackUsed: false
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-API-Version': '2.0-test',
        'X-Test-Type': 'multilingual-data-validation',
        'X-Tested-Slips': testSlipNumbers.join(','),
        'X-Tested-Languages': testLanguages.join(',')
      }
    });

  } catch (error) {
    console.error('Test API error:', error);
    return MultilingualAPIMiddleware.createErrorResponse(
      'Test execution failed',
      language,
      500
    );
  }
}

// 使用多语言中间件包装处理器
export const GET = withMultilingualSupport(handleGetRequest, {
  enableAutoDetection: true,
  fallbackLanguage: 'zh-CN',
  setCookies: false, // 测试端点不设置cookies
  trackUsage: false, // 测试端点不记录使用统计
  cacheHeaders: false
});

// 设置运行时
export const runtime = 'edge';
