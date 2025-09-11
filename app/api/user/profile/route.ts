import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { invalidateByExactPath } from '@/lib/edge/invalidate'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// 获取用户档案
export async function GET(request: NextRequest) {
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

    console.log(`获取用户档案: ${user.email} (${user.id})`)

    // 查询用户档案
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('查询用户档案失败:', profileError)
      return NextResponse.json({ error: '查询档案失败' }, { status: 500 })
    }

    // 如果档案不存在，创建默认档案
    if (!profile) {
      console.log('用户档案不存在，创建默认档案')
      
      // 使用 upsert 避免并发创建导致的重复key错误
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          profile_edit_count: 0,
          profile_complete: false
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (createError) {
        console.error('创建默认档案失败:', createError)
        // 如果还是失败，尝试再次查询（可能其他请求已经创建了）
        const { data: existingProfile, error: retryError } = await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
          
        if (retryError) {
          console.error('重试查询档案失败:', retryError)
          return NextResponse.json({ error: '创建档案失败' }, { status: 500 })
        }
        
        return NextResponse.json({
          success: true,
          profile: existingProfile
        })
      }

      return NextResponse.json({
        success: true,
        profile: newProfile
      })
    }

    return NextResponse.json({
      success: true,
      profile: profile
    })

  } catch (error) {
    console.error('获取用户档案错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 更新用户档案
export async function PUT(request: NextRequest) {
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

    // 解析请求数据
    const { birth_date, birth_time, birth_location, nickname, gender, is_date_changed, is_gender_changed } = await request.json()

    // 灵活验证：只验证提供的字段是否有效
    if (birth_date && (!birth_date.match(/^\d{4}-\d{2}-\d{2}$/))) {
      return NextResponse.json({ 
        error: '出生日期格式无效，请使用YYYY-MM-DD格式' 
      }, { status: 400 })
    }

    if (gender && !['male', 'female'].includes(gender)) {
      return NextResponse.json({ 
        error: '性别值无效，必须是male或female' 
      }, { status: 400 })
    }

    console.log(`更新用户档案: ${user.email} (${user.id})，日期是否变更: ${is_date_changed}，性别是否变更: ${is_gender_changed}`)

    // 查询当前档案
    const { data: currentProfile, error: queryError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (queryError && queryError.code !== 'PGRST116') {
      console.error('查询当前档案失败:', queryError)
      return NextResponse.json({ error: '查询档案失败' }, { status: 500 })
    }

    const currentEditCount = currentProfile?.profile_edit_count || 0
    const currentGenderEditCount = currentProfile?.gender_edit_count || 0
    const isFirstEdit = currentEditCount === 0

    // 检查出生日期修改限制
    if (is_date_changed && !isFirstEdit && currentEditCount >= 1) {
      return NextResponse.json({ 
        error: '您已使用过免费修改出生日期的机会，继续修改日期需要付费服务。时辰修改不受限制。',
        code: 'EDIT_LIMIT_EXCEEDED',
        edit_count: currentEditCount
      }, { status: 403 })
    }

    // 检查性别修改限制：首次保存后只能免费修改一次
    if (is_gender_changed && currentProfile && currentGenderEditCount >= 1) {
      return NextResponse.json({ 
        error: '您已使用过免费修改性别的机会，继续修改性别需要付费服务。',
        code: 'GENDER_EDIT_LIMIT_EXCEEDED',
        gender_edit_count: currentGenderEditCount
      }, { status: 403 })
    }

    // 记录编辑历史
    const historyData = {
      user_id: user.id,
      profile_id: currentProfile?.id,
      edit_type: currentProfile ? 'update' : 'create',
      old_data: currentProfile ? {
        birth_date: currentProfile.birth_date,
        birth_time: currentProfile.birth_time,
        birth_location: currentProfile.birth_location,
        nickname: currentProfile.nickname || null,
        gender: currentProfile.gender || null
      } : null,
      new_data: {
        birth_date,
        birth_time,
        birth_location,
        nickname: nickname || null,
        gender: gender || null
      },
      edit_reason: is_date_changed ? '修改出生日期' : is_gender_changed ? '修改性别' : '修改档案信息',
      is_free_edit: isFirstEdit || (!is_date_changed && !is_gender_changed) // 首次编辑或只修改时辰/昵称等都是免费的
    }

    // 保存编辑历史
    const { error: historyError } = await supabaseAdmin
      .from('user_profile_history')
      .insert(historyData)

    if (historyError) {
      console.error('保存编辑历史失败:', historyError)
      // 历史记录失败不影响主要功能，继续执行
    }

    // 构建档案数据，只更新提供的字段
    const profileData: any = {
      user_id: user.id,
      profile_edit_count: is_date_changed ? currentEditCount + 1 : currentEditCount, // 只有修改日期才增加计数
      gender_edit_count: is_gender_changed ? currentGenderEditCount + 1 : currentGenderEditCount, // 性别修改计数
      last_edit_at: new Date().toISOString()
    }

    // 只更新提供的字段
    if (birth_date !== undefined && birth_date !== '') {
      profileData.birth_date = birth_date
    }
    if (birth_time !== undefined && birth_time !== '') {
      profileData.birth_time = birth_time
    }
    if (birth_location !== undefined) {
      profileData.birth_location = birth_location || null
    }
    if (nickname !== undefined) {
      profileData.nickname = nickname || null
    }
    if (gender !== undefined && gender !== '') {
      profileData.gender = gender
    }

    // 检查档案是否完整（用于确定 profile_complete 状态）
    const finalProfile = currentProfile ? { ...currentProfile, ...profileData } : profileData
    const isComplete = finalProfile.birth_date && finalProfile.birth_time && finalProfile.gender
    profileData.profile_complete = isComplete

    let updatedProfile
    if (currentProfile) {
      // 更新现有档案
      const { data, error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('更新档案失败:', updateError)
        return NextResponse.json({ error: '更新档案失败' }, { status: 500 })
      }
      updatedProfile = data
    } else {
      // 创建新档案
      const { data, error: createError } = await supabaseAdmin
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      if (createError) {
        console.error('创建档案失败:', createError)
        return NextResponse.json({ error: '创建档案失败' }, { status: 500 })
      }
      updatedProfile = data
    }

    console.log(`档案${currentProfile ? '更新' : '创建'}成功:`, updatedProfile.id)
    try {
      await invalidateByExactPath('/api/user/profile', 'user')
      await invalidateByExactPath('/api/user/profile-unified', 'user')
    } catch {}

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: isFirstEdit ? '档案创建成功！' : '档案更新成功！',
      is_first_edit: isFirstEdit,
      remaining_free_edits: Math.max(0, 1 - updatedProfile.profile_edit_count),
      remaining_free_gender_edits: Math.max(0, 1 - (updatedProfile.gender_edit_count || 0))
    })

  } catch (error) {
    console.error('更新用户档案错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 
