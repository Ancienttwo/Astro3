// 测试在 Auth 用户表中创建Web3用户
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

async function testAuthCreation() {
  try {
    console.log('🧪 Testing Web3 user creation in both tables...')
    
    const walletAddress = `0xtest${Date.now().toString(16).padStart(36, '0')}`
    console.log(`🔗 Testing with wallet: ${walletAddress}`)
    
    // 1. 创建 Auth 用户
    console.log('🔐 Creating Auth user...')
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: `${walletAddress.toLowerCase()}@web3.local`,
      password: `web3_${walletAddress.toLowerCase()}_${Date.now()}`,
      email_confirm: true,
      user_metadata: {
        wallet_address: walletAddress.toLowerCase(),
        auth_type: 'web3',
        wallet_type: 'test_wallet',
        network: 'bsc'
      }
    })
    
    if (authError) {
      console.error('❌ Auth user creation failed:', authError)
      return
    }
    
    console.log('✅ Auth user created:', authUser.user.id)
    
    // 2. 创建自定义用户
    console.log('📊 Creating custom user...')
    const customUserData = {
      id: authUser.user.id, // 使用相同的 UUID
      wallet_address: walletAddress.toLowerCase(),
      auth_type: 'web3',
      username: `web3_${walletAddress.slice(0, 6)}_${walletAddress.slice(-4)}`,
      email: `${walletAddress.toLowerCase()}@web3.local`,
      user_type: 'regular',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        wallet_address: walletAddress.toLowerCase(),
        wallet_type: 'test_wallet',
        network: 'bsc',
        connection_ip: '127.0.0.1',
        connection_user_agent: 'test',
        connection_timestamp: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString()
      }
    }
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(customUserData)
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Custom user creation failed:', createError)
      // 清理 Auth 用户
      await supabase.auth.admin.deleteUser(authUser.user.id)
      return
    }
    
    console.log('✅ Custom user created:', newUser.id)
    
    // 3. 验证两个表中都有用户
    console.log('🔍 Verifying users in both tables...')
    
    // 检查 Auth 用户
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const foundAuthUser = authUsers.users.find(u => u.id === authUser.user.id)
    
    // 检查自定义用户
    const { data: customUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.user.id)
      .single()
    
    if (foundAuthUser && customUser) {
      console.log('✅ User found in both tables!')
      console.log('Auth user email:', foundAuthUser.email)
      console.log('Custom user email:', customUser.email)
      console.log('Wallet address:', customUser.wallet_address)
    }
    
    // 清理测试用户
    console.log('🧹 Cleaning up test user...')
    await supabase.auth.admin.deleteUser(authUser.user.id)
    await supabase.from('users').delete().eq('id', authUser.user.id)
    console.log('✅ Test user cleaned up')
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testAuthCreation()