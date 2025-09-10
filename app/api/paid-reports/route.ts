import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUnifiedUser } from '@/lib/auth'

// 检查用户是否已为特定生日+性别付费
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const birthYear = parseInt(url.searchParams.get('birth_year') || '0')
    const birthMonth = parseInt(url.searchParams.get('birth_month') || '0')
    const birthDay = parseInt(url.searchParams.get('birth_day') || '0')
    const gender = url.searchParams.get('gender')
    const reportType = url.searchParams.get('report_type') || 'ziwei'

    if (!birthYear || !birthMonth || !birthDay || !gender) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数：birth_year, birth_month, birth_day, gender'
      }, { status: 400 })
    }

    // 获取当前用户
    const currentUser = await getCurrentUnifiedUser()
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        error: '用户未登录'
      }, { status: 401 })
    }

    // 查询付费记录
    const { data: paidReport, error } = await supabase
      .from('paid_reports')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('birth_year', birthYear)
      .eq('birth_month', birthMonth)
      .eq('birth_day', birthDay)
      .eq('gender', gender)
      .eq('report_type', reportType)
      .eq('payment_status', 'paid')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('查询付费记录失败:', error)
      return NextResponse.json({
        success: false,
        error: '查询付费状态失败'
      }, { status: 500 })
    }

    const isPaid = !!paidReport
    const isExpired = paidReport && paidReport.expires_at && new Date(paidReport.expires_at) < new Date()

    return NextResponse.json({
      success: true,
      isPaid: isPaid && !isExpired,
      isExpired,
      paidReport: isPaid ? {
        id: paidReport.id,
        reportType: paidReport.report_type,
        accessLevel: paidReport.access_level,
        unlockedFeatures: paidReport.unlocked_features,
        paymentTime: paidReport.payment_time,
        expiresAt: paidReport.expires_at,
        isLifetime: paidReport.is_lifetime
      } : null
    })

  } catch (error: unknown) {
    console.error('检查付费状态失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 创建付费记录（支付成功后调用）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      birthYear,
      birthMonth,
      birthDay,
      gender,
      reportType = 'ziwei',
      paymentAmount,
      paymentMethod,
      transactionId,
      unlockedFeatures = [],
      accessLevel = 'premium'
    } = body

    // 验证必要参数
    if (!birthYear || !birthMonth || !birthDay || !gender || !paymentAmount || !transactionId) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 })
    }

    // 获取当前用户
    const currentUser = await getCurrentUnifiedUser()
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        error: '用户未登录'
      }, { status: 401 })
    }

    // 检查是否已存在付费记录
    const { data: existingRecord } = await supabase
      .from('paid_reports')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('birth_year', birthYear)
      .eq('birth_month', birthMonth)
      .eq('birth_day', birthDay)
      .eq('gender', gender)
      .eq('report_type', reportType)
      .eq('payment_status', 'paid')
      .single()

    if (existingRecord) {
      return NextResponse.json({
        success: false,
        error: '该生日已有付费记录，无需重复购买'
      }, { status: 409 })
    }

    // 创建付费记录
    const { data: paidReport, error: insertError } = await supabase
      .from('paid_reports')
      .insert({
        user_id: currentUser.id,
        birth_year: birthYear,
        birth_month: birthMonth,
        birth_day: birthDay,
        gender,
        report_type: reportType,
        payment_amount: paymentAmount,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        unlocked_features: unlockedFeatures,
        access_level: accessLevel,
        payment_status: 'paid',
        is_lifetime: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('创建付费记录失败:', insertError)
      return NextResponse.json({
        success: false,
        error: '创建付费记录失败'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '付费记录创建成功',
      paidReport: {
        id: paidReport.id,
        reportType: paidReport.report_type,
        accessLevel: paidReport.access_level,
        unlockedFeatures: paidReport.unlocked_features,
        paymentTime: paidReport.payment_time
      }
    })

  } catch (error: unknown) {
    console.error('处理付费记录失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

