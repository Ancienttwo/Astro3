// 测试Web3用户创建
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

async function testWeb3Creation() {
  try {
    console.log('🧪 Testing Web3 user creation...')
    
    // 1. 先查看现有用户数量
    const { data: beforeUsers, error: beforeError } = await supabase
      .from('users')
      .select('count')
      .single()
    
    if (beforeError) {
      console.log('📊 Before count - getting actual records...')
      const { data: actualBefore } = await supabase
        .from('users')
        .select('id')
      console.log(`📊 Users before test: ${actualBefore?.length || 0}`)
    } else {
      console.log(`📊 Users before test: ${beforeUsers?.count || 0}`)
    }
    
    // 2. 调用simple-connect API
    const testWallet = `0x${Date.now().toString(16).padStart(40, '0')}`
    console.log(`🔗 Testing with wallet: ${testWallet}`)
    
    const response = await fetch('http://localhost:3007/api/auth/web3/simple-connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: testWallet,
        network: 'bsc',
        wallet_type: 'test_wallet'
      })
    })
    
    const result = await response.json()
    console.log('📄 API Response:', {
      status: response.status,
      success: result.success,
      message: result.message,
      error: result.error,
      user_id: result.user?.id
    })
    
    if (result.success) {
      // 3. 验证用户是否真的被创建
      const { data: newUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('id', result.user.id)
        .single()
      
      if (findError) {
        console.error('❌ Failed to find created user in database:', findError)
      } else {
        console.log('✅ User found in database:', {
          id: newUser.id,
          wallet_address: newUser.wallet_address,
          auth_type: newUser.auth_type,
          email: newUser.email,
          created_at: newUser.created_at
        })
      }
      
      // 4. 查看更新后的用户数量
      const { data: afterUsers } = await supabase
        .from('users')
        .select('id')
      console.log(`📊 Users after test: ${afterUsers?.length || 0}`)
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testWeb3Creation()