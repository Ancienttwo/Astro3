// 清理没有Auth记录的Web3用户
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

async function cleanupWeb3Users() {
  try {
    console.log('🧹 Cleaning up Web3 users without Auth records...')
    
    // 1. 获取所有Auth用户ID
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const authUserIds = new Set(authUsers.users.map(u => u.id))
    
    // 2. 获取所有Web3用户
    const { data: web3Users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_type', 'web3')
    
    if (fetchError) {
      console.error('❌ Error fetching Web3 users:', fetchError)
      return
    }
    
    // 3. 找出没有Auth记录的Web3用户
    const usersToDelete = web3Users.filter(user => !authUserIds.has(user.id))
    
    console.log(`📊 Total Web3 users: ${web3Users.length}`)
    console.log(`🔍 Users without Auth records: ${usersToDelete.length}`)
    
    if (usersToDelete.length === 0) {
      console.log('✅ All Web3 users have proper Auth records!')
      return
    }
    
    console.log('🗑️ Will delete these users:')
    usersToDelete.forEach(user => {
      console.log(`  - ${user.wallet_address} (${user.email})`)
    })
    
    // 4. 删除这些用户
    for (const user of usersToDelete) {
      console.log(`🗑️ Deleting user: ${user.wallet_address}`)
      
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)
      
      if (deleteError) {
        console.error(`❌ Failed to delete user ${user.id}:`, deleteError)
      } else {
        console.log(`✅ Deleted user: ${user.wallet_address}`)
      }
    }
    
    console.log('🎉 Cleanup completed!')
    console.log('💡 Users can now re-login to create proper Auth + custom records')
    
  } catch (error) {
    console.error('💥 Error:', error)
  }
}

cleanupWeb3Users()