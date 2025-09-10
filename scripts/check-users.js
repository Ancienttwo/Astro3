// 检查数据库中的用户记录
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

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...')
    
    // 查看所有用户
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('id, email, wallet_address, auth_type, created_at')
      .order('created_at', { ascending: false })
    
    if (allError) {
      console.error('❌ Error fetching all users:', allError)
      return
    }
    
    console.log(`📊 Total users: ${allUsers.length}`)
    
    // 分类统计
    const emailUsers = allUsers.filter(u => u.auth_type === 'supabase' || u.email)
    const web3Users = allUsers.filter(u => u.auth_type === 'web3' || u.wallet_address)
    
    console.log(`📧 Email users: ${emailUsers.length}`)
    console.log(`🔗 Web3 users: ${web3Users.length}`)
    
    // 显示最近的几个用户
    console.log('\n📋 Recent users:')
    allUsers.slice(0, 10).forEach(user => {
      console.log(`- ID: ${user.id}`)
      console.log(`  Email: ${user.email || 'null'}`)
      console.log(`  Wallet: ${user.wallet_address || 'null'}`)
      console.log(`  Auth Type: ${user.auth_type || 'null'}`)
      console.log(`  Created: ${user.created_at}`)
      console.log('')
    })
    
    // 检查是否有没有auth_type的用户
    const noAuthType = allUsers.filter(u => !u.auth_type)
    if (noAuthType.length > 0) {
      console.log(`⚠️  Users without auth_type: ${noAuthType.length}`)
    }
    
  } catch (error) {
    console.error('💥 Error:', error)
  }
}

checkUsers()