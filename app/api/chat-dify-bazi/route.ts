import { NextRequest } from 'next/server'
import { difyService } from '@/lib/services/dify-integration'

export async function POST(request: NextRequest) {
  try {
    const { message, userId, language } = await request.json()
    
    if (!message || !userId) {
      return new Response(
        `data: ${JSON.stringify({ error: '缺少必要参数' })}\n\n`,
        {
          status: 400,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    // 根据语言选择agent
    const agentType = language === 'en' ? 'bazi-chatbot-en' : 'bazi-chatbot'
    
    console.log('🎯 收到八字对话请求 (真正流式输出):', { message, userId, language, agentType })

    // 获取Dify的原始流式响应
    const difyStream = await difyService.chatStream(message, userId, agentType)
    
    // 创建转换流，将Dify的SSE格式转换为我们的格式
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk)
        const lines = text.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.event === 'message' && data.answer) {
                // 发送文本块到前端
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({
                    type: 'content',
                    content: data.answer
                  })}\n\n`)
                )
              } else if (data.event === 'message_end') {
                // 发送完成信号
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({
                    type: 'end',
                    conversationId: data.conversation_id,
                    messageId: data.id
                  })}\n\n`)
                )
              } else if (data.event === 'error') {
                // 发送错误信息
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({
                    type: 'error',
                    error: data.message || '对话失败'
                  })}\n\n`)
                )
              }
            } catch (parseError) {
              // 忽略解析错误，继续处理下一行
            }
          }
        }
      }
    })

    // 将Dify流传输到转换流
    const transformedStream = difyStream.pipeThrough(transformStream)

    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    console.error('❌ 八字对话失败:', error)
    return new Response(
      `data: ${JSON.stringify({
        type: 'error',
        error: '对话失败',
        details: error instanceof Error ? error.message : '未知错误'
      })}\n\n`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
} 