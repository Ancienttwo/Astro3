// 简化版 Edge Function 用于测试 CORS
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  try {
    console.log(`🔧 收到请求: ${req.method} ${req.url}`)
    
    // 处理 CORS 预检请求
    if (req.method === 'OPTIONS') {
      console.log('🔧 处理 CORS 预检请求')
      return new Response(null, { 
        status: 200,
        headers: corsHeaders 
      })
    }

    // 处理 POST 请求
    if (req.method === 'POST') {
      console.log('🔧 处理 POST 请求')
      return new Response(JSON.stringify({
        success: true,
        message: 'CORS 测试成功',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 其他请求
    return new Response(JSON.stringify({
      success: false,
      error: '不支持的请求方法'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Edge Function执行失败:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : '服务器错误'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})