import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface CompleteGuandiSlip {
  slip_number: number;
  title: string;
  is_traditional: boolean;
  historical_reference: string;
  fortune_grade: string;
  poem_verses: string;
  classical_overview: string;
  modern_explanation: string;
  historical_story: string;
  fortune_predictions: {
    功名: string;
    六甲: string;
    求財: string;
    婚姻: string;
    農牧: string;
    失物: string;
    生意: string;
    丁口: string;
    出行: string;
    疾病: string;
    官司: string;
    時運: string;
  };
  raw_content: string;
}

// 加载完整的签文数据
function loadCompleteSignsData(): CompleteGuandiSlip[] {
  try {
    const dataPath = path.join(process.cwd(), 'complete_guandi_signs_structured.json');
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('加载完整签文数据失败:', error);
    return [];
  }
}

// 语言验证函数
function validateLanguage(language: string | null): string {
  const supportedLanguages = ['zh-CN', 'zh-TW', 'en-US'];
  return supportedLanguages.includes(language || '') ? language! : 'zh-TW';
}

// 获取多语言签文内容
function getLocalizedContent(slip: any, language: string) {
  switch (language) {
    case 'en-US':
      return {
        title: slip.title_en || slip.title,
        content: slip.content, // 签诗始终保持中文
        basic_interpretation: slip.basic_interpretation_en || slip.basic_interpretation,
        historical_context: slip.historical_context_en || slip.historical_context,
        symbolism: slip.symbolism_en || slip.symbolism
      };
    case 'zh-TW':
      // 繁体中文使用主字段（因为我们已经更新为繁体）
      return {
        title: slip.title,
        content: slip.content,
        basic_interpretation: slip.basic_interpretation,
        historical_context: slip.historical_context,
        symbolism: slip.symbolism
      };
    case 'zh-CN':
    default:
      // 简体中文也使用主字段
      return {
        title: slip.title,
        content: slip.content,
        basic_interpretation: slip.basic_interpretation,
        historical_context: slip.historical_context,
        symbolism: slip.symbolism
      };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slipNumber: string } }
) {
  try {
    const slipNumber = parseInt(params.slipNumber);
    const searchParams = request.nextUrl.searchParams;
    const language = validateLanguage(searchParams.get('language'));

    // 验证签号
    if (isNaN(slipNumber) || slipNumber < 1 || slipNumber > 100) {
      return NextResponse.json({
        success: false,
        error: '签号必须在1-100之间'
      }, { status: 400 });
    }

    // 首先尝试从完整数据文件加载
    const completeData = loadCompleteSignsData();
    
    // 查找基本签信息和解签概述信息
    const basicSlip = completeData.find(slip => 
      slip.slip_number === slipNumber && 
      !slip.title.includes('解籤概述') && !slip.title.includes('解签概述') &&
      slip.historical_reference &&
      slip.fortune_grade
    );
    
    const detailedSlip = completeData.find(slip => 
      slip.slip_number === slipNumber && 
      (slip.title.includes('解籤概述') || slip.title.includes('解签概述')) &&
      slip.fortune_predictions &&
      Object.keys(slip.fortune_predictions).length > 0
    );
    
    // 合并基本信息和详细信息
    const completeSlip = basicSlip && detailedSlip ? {
      ...detailedSlip,
      historical_reference: basicSlip.historical_reference,
      fortune_grade: basicSlip.fortune_grade,
      poem_verses: basicSlip.poem_verses || detailedSlip.poem_verses
    } : (detailedSlip || basicSlip);

    if (completeSlip) {
      // 尝试从数据库获取原有的故事内容用于AI Prompt
      let databaseStory = null;
      let databaseSymbolism = null;
      let dbSlip = null;
      
      try {
        const { data: temple, error: templeError } = await supabase
          .from('temple_systems')
          .select('id')
          .eq('temple_code', 'guandi')
          .single();

        if (!templeError && temple) {
          const { data: dbSlipData, error: dbSlipError } = await supabase
            .from('fortune_slips')
            .select(`
              title, title_en,
              historical_context, historical_context_en,
              symbolism, symbolism_en,
              basic_interpretation, basic_interpretation_en
            `)
            .eq('temple_system_id', temple.id)
            .eq('slip_number', slipNumber)
            .eq('is_active', true)
            .single();

          if (!dbSlipError && dbSlipData) {
            dbSlip = dbSlipData;
            databaseStory = dbSlipData.historical_context;
            databaseSymbolism = dbSlipData.symbolism;
          }
        }
      } catch (dbError) {
        console.log('数据库故事内容获取失败，使用完整数据:', dbError);
      }

      // 根据语言决定使用的内容
      const getLocalizedTitle = () => {
        if (language === 'en-US' && dbSlip?.title_en) {
          return `Slip ${slipNumber}: ${dbSlip.title_en}`;
        }
        return `第${slipNumber}签 ${completeSlip.historical_reference}`;
      };
      
      const getLocalizedInterpretation = () => {
        if (language === 'en-US' && dbSlip?.basic_interpretation_en) {
          return dbSlip.basic_interpretation_en;
        }
        return completeSlip.modern_explanation || completeSlip.classical_overview || '解签内容加载中...';
      };
      
      const getLocalizedContext = () => {
        if (language === 'en-US' && dbSlip?.historical_context_en) {
          return dbSlip.historical_context_en;
        }
        return completeSlip.classical_overview;
      };
      
      const getLocalizedSymbolism = () => {
        if (language === 'en-US' && dbSlip?.symbolism_en) {
          return dbSlip.symbolism_en;
        }
        return databaseSymbolism || completeSlip.historical_story;
      };

      // 使用完整数据
      const responseData = {
        id: `guandi-${slipNumber}`,
        slip_number: slipNumber,
        title: getLocalizedTitle(),
        content: completeSlip.poem_verses || '签诗内容加载中...', // 签诗始终保持中文
        basic_interpretation: getLocalizedInterpretation(),
        categories: ['求签', '指导'],
        fortune_level: completeSlip.fortune_grade.includes('大吉') ? 'excellent' :
                      completeSlip.fortune_grade.includes('上吉') ? 'good' :
                      completeSlip.fortune_grade.includes('中吉') ? 'good' :
                      completeSlip.fortune_grade.includes('中平') ? 'average' :
                      completeSlip.fortune_grade.includes('下吉') ? 'caution' : 'warning',
        historical_context: getLocalizedContext(),
        symbolism: getLocalizedSymbolism(),
        
        // 保留数据库中的原有故事内容用于AI Prompt
        database_story: databaseStory,
        database_symbolism: databaseSymbolism,
        language: language,
        
        // 完整的签文信息
        complete_data: {
          historical_reference: completeSlip.historical_reference,
          fortune_grade: completeSlip.fortune_grade,
          poem_verses: completeSlip.poem_verses,
          classical_overview: completeSlip.classical_overview,
          modern_explanation: completeSlip.modern_explanation,
          historical_story: completeSlip.historical_story,
          fortune_predictions: completeSlip.fortune_predictions,
          language: language === 'zh-TW' ? 'zh-TW' : 'zh-CN',
          
          // AI Prompt工程需要的所有素材
          ai_prompt_materials: {
            database_story: databaseStory, // 数据库原有故事
            database_symbolism: databaseSymbolism, // 数据库原有象征意义
            docx_story: completeSlip.historical_story, // docx文件中的历史典故
            modern_examples: completeSlip.modern_explanation, // 包含现代实例的解说
            classical_wisdom: completeSlip.classical_overview, // 古典智慧概述
            fortune_predictions: completeSlip.fortune_predictions // 12类具体判断
          }
        }
      };

      return NextResponse.json({
        success: true,
        data: responseData
      });
    }

    // 备用：从数据库获取（原有逻辑）
    const { data: temple, error: templeError } = await supabase
      .from('temple_systems')
      .select('id')
      .eq('temple_code', 'guandi')
      .single();

    if (templeError || !temple) {
      return NextResponse.json({
        success: false,
        error: '找不到关帝庙数据'
      }, { status: 404 });
    }

    // 获取签文数据
    const { data: slip, error: slipError } = await supabase
      .from('fortune_slips')
      .select(`
        id,
        slip_number,
        title,
        title_en,
        content,
        content_en,
        basic_interpretation,
        basic_interpretation_en,
        categories,
        fortune_level,
        historical_context,
        historical_context_en,
        symbolism,
        symbolism_en,
        created_at,
        updated_at
      `)
      .eq('temple_system_id', temple.id)
      .eq('slip_number', slipNumber)
      .eq('is_active', true)
      .single();

    if (slipError || !slip) {
      return NextResponse.json({
        success: false,
        error: `找不到第${slipNumber}签`
      }, { status: 404 });
    }

    // 获取本地化内容
    const localizedContent = getLocalizedContent(slip, language);

    // 构建响应数据
    const responseData = {
      id: slip.id,
      slip_number: slip.slip_number,
      title: localizedContent.title,
      content: localizedContent.content,
      basic_interpretation: localizedContent.basic_interpretation,
      categories: slip.categories || [],
      fortune_level: slip.fortune_level,
      historical_context: localizedContent.historical_context,
      symbolism: localizedContent.symbolism,
      language: language,
      created_at: slip.created_at,
      updated_at: slip.updated_at
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('获取签文详情失败:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}