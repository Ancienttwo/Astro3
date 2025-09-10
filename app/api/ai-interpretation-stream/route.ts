import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

export const runtime = 'edge';

interface GuandiInterpretationRequest {
  fortuneSlip: {
    slip_number: number;
    historical_reference: string;
    fortune_grade: string;
    poem_verses: string;
    classical_overview: string;
    modern_explanation: string;
    historical_story: string;
    fortune_predictions: any;
    language: string;
  };
  inquiryType: {
    id: string;
    key: string;
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
  };
  language: string;
}

export async function POST(request: NextRequest) {
  try {
    // 检查用户认证状态
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body: GuandiInterpretationRequest = await request.json();
    const { fortuneSlip, inquiryType, language } = body;

    if (!fortuneSlip || !inquiryType) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // 检查用户使用配额
    try {
      const quotaResponse = await apiClient.get('/api/user-usage', {
        headers: { authorization: authHeader }
      });

      if (!quotaResponse.success || !quotaResponse.data?.hasQuota) {
        return NextResponse.json({ 
          error: language === 'en-US' 
            ? 'Insufficient quota. Please check in daily or upgrade subscription.' 
            : '使用配额不足，请先签到或升级订阅。',
          needsQuota: true 
        }, { status: 403 });
      }
    } catch (quotaError) {
      console.error('配额检查失败:', quotaError);
      // 继续执行，但记录错误
    }
    
    // 构建AI提示词
    const { systemPrompt, userPrompt } = generatePrompt(fortuneSlip, inquiryType, language);
    
    // 生成AI响应（目前使用模拟，后续可接入真实AI服务）
    const aiResponse = await generateAIResponse(systemPrompt, userPrompt, language);
    
    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 分块发送AI响应，模拟流式效果
          const words = aiResponse.split('');
          for (let i = 0; i < words.length; i++) {
            const chunk = words[i];
            const data = JSON.stringify({ 
              content: chunk, 
              done: i === words.length - 1 
            });
            
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            
            // 模拟延迟以创建流式效果
            await new Promise(resolve => setTimeout(resolve, 30));
          }
          
          // 更新用户使用配额
          try {
            await apiClient.post('/api/user-usage', 
              { action: 'decrement', amount: 1 },
              { headers: { authorization: authHeader } }
            );
          } catch (usageError) {
            console.error('配额更新失败:', usageError);
          }
          
          // 发送完成信号
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('AI解读流式响应错误:', error);
          const errorData = JSON.stringify({ 
            error: language === 'en-US' 
              ? 'AI service temporarily unavailable' 
              : 'AI服务暂时不可用',
            done: true 
          });
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('AI解读API错误:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 生成AI提示词
function generatePrompt(fortuneSlip: any, inquiryType: any, language: string): { systemPrompt: string, userPrompt: string } {
  const isEnglish = language === 'en-US';
  
  const systemPrompt = isEnglish
    ? "You are a professional Chinese fortune teller specializing in Guandi oracle interpretation. Provide wise, culturally authentic guidance based on traditional Chinese wisdom."
    : "你是一位专业的关帝灵签解读师，具有深厚的中华传统文化底蕴。请基于传统智慧提供真诚、实用的人生指导。";

  const userPrompt = isEnglish
    ? `Fortune Slip #${fortuneSlip.slip_number}: ${fortuneSlip.historical_reference}
Oracle Grade: ${fortuneSlip.fortune_grade}
Poem: ${fortuneSlip.poem_verses}
Classical Overview: ${fortuneSlip.classical_overview || 'N/A'}
Modern Explanation: ${fortuneSlip.modern_explanation || 'N/A'}
Historical Story: ${fortuneSlip.historical_story || 'N/A'}

User's Inquiry Focus: ${inquiryType.nameEn} (${inquiryType.descriptionEn})
Specific Fortune Prediction: ${fortuneSlip.fortune_predictions[inquiryType.key] || 'N/A'}

Please provide a personalized interpretation focusing on the user's specific inquiry. Include:
1. Analysis of the oracle's relevance to their situation
2. Practical wisdom and actionable advice
3. Traditional cultural insights with modern applications
4. Encouraging and hopeful guidance

Response should be 200-400 words, culturally authentic, and personally meaningful.`
    : `第${fortuneSlip.slip_number}签：${fortuneSlip.historical_reference}
吉凶等级：${fortuneSlip.fortune_grade}
签诗：${fortuneSlip.poem_verses}
古典概述：${fortuneSlip.classical_overview || '未提供'}
白话解说：${fortuneSlip.modern_explanation || '未提供'}
历史典故：${fortuneSlip.historical_story || '未提供'}

用户关注的问题：${inquiryType.name}（${inquiryType.description}）
具体运势预测：${fortuneSlip.fortune_predictions[inquiryType.key] || '未提供'}

请为用户提供个性化的解读，内容包括：
1. 分析此签与用户所求之事的关联性
2. 结合传统智慧给出实用建议
3. 融合历史典故与现代应用
4. 给予积极正面的人生指引

回答应在200-400字之间，体现传统文化内涵，具有个人针对性。`;

  return { systemPrompt, userPrompt };
}

// 生成AI响应（使用真实的AI服务）
async function generateAIResponse(systemPrompt: string, userPrompt: string, language: string): Promise<string> {
  // 使用SiliconFlow API调用Qwen模型
  try {
    const response = await fetch(`${process.env.SILICONFLOW_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.SILICONFLOW_MODEL || 'Qwen/Qwen2.5-7B-Instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`AI API 错误: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '解读生成失败，请重试。';
  } catch (error) {
    console.error('AI服务调用失败:', error);
    
    // 降级到预设响应
    const isEnglish = language === 'en-US';
    
    if (isEnglish) {
      return `Based on your oracle and specific inquiry, here's your personalized guidance:

The fortune slip you drew carries profound wisdom from traditional Chinese culture. The historical reference and poem verses speak directly to your current situation, suggesting that patience and perseverance will be key to your success.

Looking at your specific concern, the oracle indicates favorable conditions ahead. The traditional wisdom embedded in this reading suggests that maintaining harmony while pursuing your goals will yield the best results.

The historical allusion reminds us that great achievements often require time and steady effort. Your current path, though it may seem challenging, is leading toward positive outcomes.

Recommendation: Trust in the process, stay committed to your values, and remain open to opportunities that align with your authentic self. The timing appears favorable for taking measured steps forward.

Remember, these insights serve as gentle guidance on your journey. The true power lies in your own wisdom and actions.`;
    } else {
      return `根据您抽到的签文和所关注的问题，为您提供以下个性化指引：

此签蕴含着深厚的传统智慧，签诗与历史典故都在向您传达重要信息。当前的情况虽有挑战，但整体运势向好，关键在于把握时机和方法。

从您关注的具体问题来看，签文显示前路光明。传统文化告诉我们，真正的成功往往需要内心的平和与外在的坚持并重。历史典故提醒我们，先贤的智慧在于知进退、懂变通。

此时此刻，最重要的是保持初心，踏实前行。签文暗示的机遇即将到来，但需要您以诚待人、以德服人的品格去把握。

建议：相信自己的判断，保持耐心和毅力，在人际关系中多一些包容与理解。时运正逐渐转好，适合采取稳健的步骤向前推进。

请记住，签文只是人生路上的一盏明灯，真正的力量源于您内心的智慧与行动的勇气。愿您前程似锦，心想事成。`;
    }
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}