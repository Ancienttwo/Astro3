import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createServerSupabaseClient } from '@/lib/auth-server'

/**
 * 用户偏好设置API
 * 基于完整会员系统架构的示例实现
 */

// GET /api/user/preferences - 获取用户偏好设置
export async function GET() {
  try {
    // 1. 认证检查
    const user = await requireAuth()
    
    // 2. 创建服务器端客户端
    const supabase = await createServerSupabaseClient()
    
    // 3. 查询用户偏好设置
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = 未找到记录
      console.error('查询用户偏好失败:', error)
      return NextResponse.json(
        { success: false, error: '查询用户偏好失败' },
        { status: 500 }
      )
    }

    // 4. 如果没有偏好记录，返回默认值
    if (!preferences) {
      const defaultPreferences = {
        theme: 'light',
        language: 'zh',
        personal_info: {}
      }
      
      return NextResponse.json({
        success: true,
        data: defaultPreferences
      })
    }

    // 5. 返回用户偏好设置
    return NextResponse.json({
      success: true,
      data: {
        theme: preferences.theme,
        language: preferences.language,
        personal_info: preferences.personal_info || {}
      }
    })

  } catch (error) {
    console.error('获取用户偏好API错误:', error)
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// PUT /api/user/preferences - 更新用户偏好设置
export async function PUT(request: NextRequest) {
  try {
    // 1. 认证检查
    const user = await requireAuth()
    
    // 2. 解析请求体
    const body = await request.json()
    const { theme, language, personal_info } = body

    // 3. 数据验证
    if (theme && !['light', 'dark'].includes(theme)) {
      return NextResponse.json(
        { success: false, error: '主题设置无效' },
        { status: 400 }
      )
    }

    if (language && !['zh', 'en'].includes(language)) {
      return NextResponse.json(
        { success: false, error: '语言设置无效' },
        { status: 400 }
      )
    }

    // 4. 创建服务器端客户端
    const supabase = await createServerSupabaseClient()

    // 5. 准备更新数据
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (theme !== undefined) updateData.theme = theme
    if (language !== undefined) updateData.language = language
    if (personal_info !== undefined) updateData.personal_info = personal_info

    // 6. 使用 UPSERT 操作（插入或更新）
    const { data: updatedPreferences, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        ...updateData
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      console.error('更新用户偏好失败:', error)
      return NextResponse.json(
        { success: false, error: '更新用户偏好失败' },
        { status: 500 }
      )
    }

    // 7. 返回更新后的偏好设置
    return NextResponse.json({
      success: true,
      data: {
        theme: updatedPreferences.theme,
        language: updatedPreferences.language,
        personal_info: updatedPreferences.personal_info || {}
      },
      message: '偏好设置更新成功'
    })

  } catch (error) {
    console.error('更新用户偏好API错误:', error)
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// DELETE /api/user/preferences - 重置用户偏好设置
export async function DELETE() {
  try {
    // 1. 认证检查
    const user = await requireAuth()
    
    // 2. 创建服务器端客户端
    const supabase = await createServerSupabaseClient()

    // 3. 重置为默认偏好设置
    const { data: resetPreferences, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        theme: 'light',
        language: 'zh',
        personal_info: {},
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      console.error('重置用户偏好失败:', error)
      return NextResponse.json(
        { success: false, error: '重置用户偏好失败' },
        { status: 500 }
      )
    }

    // 4. 返回重置后的偏好设置
    return NextResponse.json({
      success: true,
      data: {
        theme: resetPreferences.theme,
        language: resetPreferences.language,
        personal_info: resetPreferences.personal_info || {}
      },
      message: '偏好设置已重置为默认值'
    })

  } catch (error) {
    console.error('重置用户偏好API错误:', error)
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }
} 