import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const registrationCode = body.registrationCode || body.code

    if (!registrationCode) {
      return NextResponse.json({ success: false, error: "请输入注册码" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('验证注册码:', registrationCode.toUpperCase())

    // 使用生产环境的实际字段结构
    const { data, error } = await supabase
      .from("registration_codes")
      .select("*")
      .eq("code", registrationCode.toUpperCase())
      .eq("is_used", false)
      .single()

    if (error) {
      console.error('查询注册码失败:', error)
      return NextResponse.json({ success: false, error: "注册码无效或已使用", valid: false }, { status: 400 })
    }

    if (!data) {
      console.log('注册码不存在:', registrationCode.toUpperCase())
      return NextResponse.json({ success: false, error: "注册码无效或已使用", valid: false }, { status: 400 })
    }

    console.log('找到注册码:', data)

    // 检查是否过期
    if (data.expires_at) {
      const now = new Date()
      const expiresAt = new Date(data.expires_at)
      if (now > expiresAt) {
        console.log('注册码已过期:', expiresAt)
        return NextResponse.json({ success: false, error: "注册码已过期", valid: false }, { status: 400 })
      }
    }

    console.log('注册码验证成功:', registrationCode.toUpperCase())
    return NextResponse.json({ success: true, valid: true, message: "注册码有效" })
  } catch (error) {
    console.error("验证注册码失败:", error)
    return NextResponse.json({ success: false, error: "验证失败，请重试", valid: false }, { status: 500 })
  }
}
