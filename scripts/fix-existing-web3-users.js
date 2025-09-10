// 为现有Web3用户补齐Auth记录
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

async function fixExistingWeb3Users() {
  try {
    console.log('🔧 Fixing existing Web3 users...')
    
    // 1. 获取所有Auth用户
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const authUserIds = new Set(authUsers.users.map(u => u.id))
    
    // 2. 获取所有自定义用户
    const { data: customUsers, error: customError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_type', 'web3')
    
    if (customError) {
      console.error('❌ Error fetching custom users:', customError)
      return
    }
    
    console.log(`📊 Found ${customUsers.length} Web3 users in custom table`)
    console.log(`📊 Found ${authUsers.users.length} users in Auth table`)
    
    // 3. 找出没有Auth记录的Web3用户
    const usersWithoutAuth = customUsers.filter(user => !authUserIds.has(user.id))
    
    console.log(`🔍 Found ${usersWithoutAuth.length} Web3 users without Auth records:`)
    usersWithoutAuth.forEach(user => {
      console.log(`  - ${user.id}: ${user.email} (${user.wallet_address})`)
    })
    
    if (usersWithoutAuth.length === 0) {
      console.log('✅ All Web3 users already have Auth records!')
      return
    }
    
    console.log('⚠️ These users will not be able to login properly or save charts.')
    console.log('💡 Recommended solution: Delete and recreate these users when they next login.')
    console.log('')
    console.log('🔧 Alternative: Create a user migration script to:')
    console.log('   1. Export user data')
    console.log('   2. Delete custom user record') 
    console.log('   3. Let them re-register to create proper Auth + custom records')
    console.log('   4. Re-import their data')
    
    // 可选：为用户提供具体的修复命令
    console.log('')
    console.log('🛠️ Manual fix commands:')
    usersWithoutAuth.forEach(user => {
      console.log(`# Fix user ${user.wallet_address}:`)
      console.log(`# 1. Delete custom record: DELETE FROM users WHERE id = '${user.id}';`)
      console.log(`# 2. User re-login will create proper records`)
      console.log('')
    })
    
  } catch (error) {
    console.error('💥 Error:', error)
  }
}

fixExistingWeb3Users()