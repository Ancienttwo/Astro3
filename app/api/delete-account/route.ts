import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function DELETE(request: NextRequest) {
  try {
    // 获取认证信息
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未提供认证信息' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('用户认证失败:', authError)
      return NextResponse.json({ error: '认证失败' }, { status: 401 })
    }

    console.log(`开始删除账号: ${user.email} (${user.id})`)

    // 1. 删除用户的所有数据表记录
    const tables = [
      'ai_analyses',      // AI分析结果
      'user_charts',      // 命盘记录
      'analysis_tasks',   // 分析任务
      'user_usage',       // 使用统计
      'chat_history',     // 聊天历史
      'users',           // 用户资料
      'memberships',     // 会员记录
      'purchase_history', // 购买历史
      'promo_code_usage', // 促销码使用记录
    ]

    for (const table of tables) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', user.id)
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          console.warn(`删除表 ${table} 的数据时出错:`, error)
        } else {
          console.log(`✅ 已删除表 ${table} 中用户 ${user.id} 的数据`)
        }
      } catch (tableError) {
        console.warn(`删除表 ${table} 时出错:`, tableError)
      }
    }

    // 2. 删除以邮箱为标识的记录
    const emailTables = [
      { table: 'users', column: 'email' },
      { table: 'user_usage', column: 'user_email' }
    ]

    for (const { table, column } of emailTables) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq(column, user.email)
        
        if (error && error.code !== 'PGRST116') {
          console.warn(`删除表 ${table} (按邮箱) 的数据时出错:`, error)
        } else {
          console.log(`✅ 已删除表 ${table} 中邮箱 ${user.email} 的数据`)
        }
      } catch (tableError) {
        console.warn(`删除表 ${table} (按邮箱) 时出错:`, tableError)
      }
    }

    // 3. 最后删除 Supabase Auth 用户
    try {
      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      
      if (deleteUserError) {
        console.error('删除 Auth 用户失败:', deleteUserError)
        return NextResponse.json({ error: '删除用户认证信息失败' }, { status: 500 })
      }

      console.log(`✅ 已删除 Auth 用户: ${user.email} (${user.id})`)
    } catch (authDeleteError) {
      console.error('删除 Auth 用户时出错:', authDeleteError)
      return NextResponse.json({ error: '删除用户认证信息失败' }, { status: 500 })
    }

    console.log(`🎯 账号删除完成: ${user.email}`)

    return NextResponse.json({ 
      success: true, 
      message: '账号删除成功' 
    })

  } catch (error) {
    console.error('删除账号过程中出错:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '删除账号失败' 
    }, { status: 500 })
  }
} 