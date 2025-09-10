// 检查 Supabase Auth 用户表
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function checkAuthUsers() {
  try {
    console.log('🔍 Checking Supabase Auth users...')
    
    // 查看 Auth 用户
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }
    
    console.log(`📊 Total Auth users: ${authUsers.users.length}`)
    
    console.log('\n📋 Auth users:')
    authUsers.users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`)
      console.log(`   Email: ${user.email || 'null'}`)
      console.log(`   Created: ${user.created_at}`)
      console.log(`   Provider: ${user.app_metadata?.provider || 'unknown'}`)
      console.log(`   Metadata: ${JSON.stringify(user.user_metadata || {})}`)
      console.log('')
    })
    
    // 对比自定义用户表
    console.log('🔍 Checking custom users table...')
    const { data: customUsers, error: customError } = await supabase
      .from('users')
      .select('id, email, wallet_address, auth_type, created_at')
      .order('created_at', { ascending: false })
    
    if (customError) {
      console.error('❌ Error fetching custom users:', customError)
      return
    }
    
    console.log(`📊 Total custom users: ${customUsers.length}`)
    
    // 检查是否有匹配的 UUID
    console.log('\n🔗 Checking UUID matches...')
    const authUserIds = new Set(authUsers.users.map(u => u.id))
    const customUserIds = new Set(customUsers.map(u => u.id))
    
    const matchingIds = [...authUserIds].filter(id => customUserIds.has(id))
    const authOnlyIds = [...authUserIds].filter(id => !customUserIds.has(id))
    const customOnlyIds = [...customUserIds].filter(id => !authUserIds.has(id))
    
    console.log(`✅ Matching UUIDs: ${matchingIds.length}`)
    console.log(`🔵 Auth-only UUIDs: ${authOnlyIds.length}`)
    console.log(`🟡 Custom-only UUIDs: ${customOnlyIds.length}`)
    
    if (customOnlyIds.length > 0) {
      console.log('\n⚠️ Custom users without Auth records:')
      customOnlyIds.forEach(id => {
        const user = customUsers.find(u => u.id === id)
        console.log(`- ${id}: ${user.email}, ${user.auth_type}, ${user.wallet_address || 'no wallet'}`)
      })
    }
    
  } catch (error) {
    console.error('💥 Error:', error)
  }
}

checkAuthUsers()