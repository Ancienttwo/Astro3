// 测试修复后的Web3用户创建
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

async function testFixedWeb3Creation() {
  try {
    console.log('🧪 Testing fixed Web3 user creation...')
    
    // 使用修复后的数据结构直接创建用户
    const testWallet = `0x${Date.now().toString(16).padStart(40, '0')}`
    console.log(`🔗 Testing with wallet: ${testWallet}`)
    
    const newUserData = {
      wallet_address: testWallet.toLowerCase(),
      auth_type: 'web3',
      username: `web3_${testWallet.slice(0, 6)}_${testWallet.slice(-4)}`,
      email: `${testWallet.toLowerCase()}@web3.local`,
      user_type: 'regular',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        wallet_address: testWallet.toLowerCase(),
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
      .insert(newUserData)
      .select()
      .single()
    
    if (createError) {
      console.error('❌ User creation failed:', createError)
    } else {
      console.log('✅ User created successfully:', {
        id: newUser.id,
        email: newUser.email,
        wallet_address: newUser.wallet_address,
        auth_type: newUser.auth_type,
        username: newUser.username
      })
      
      // 清理测试用户
      console.log('🧹 Cleaning up test user...')
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', newUser.id)
      
      if (deleteError) {
        console.error('⚠️ Failed to delete test user:', deleteError)
      } else {
        console.log('✅ Test user cleaned up')
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testFixedWeb3Creation()