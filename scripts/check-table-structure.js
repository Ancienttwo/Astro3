// 检查users表结构
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

async function checkTableStructure() {
  try {
    console.log('🔍 Checking users table structure...')
    
    // 通过尝试获取一个用户来了解表结构
    const { data: sampleUser, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error getting sample user:', error)
      return
    }
    
    if (sampleUser) {
      console.log('📋 Available columns in users table:')
      Object.keys(sampleUser).forEach(key => {
        console.log(`  - ${key}: ${typeof sampleUser[key]} (${sampleUser[key] === null ? 'null' : 'has value'})`)
      })
    }
    
    // 尝试创建一个测试用户，看看哪些字段会导致错误
    const testData = {
      wallet_address: '0xtest123',
      auth_type: 'web3',
      username: 'test_user',
      email: null,
      email_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      raw_user_meta_data: {
        test: true
      }
    }
    
    console.log('\n🧪 Testing minimal user creation...')
    const { data: testUser, error: createError } = await supabase
      .from('users')
      .insert(testData)
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Test creation failed:', createError)
      
      // 尝试更简单的数据
      console.log('\n🧪 Testing even simpler user creation...')
      const simpleData = {
        wallet_address: '0xtest456',
        auth_type: 'web3',
        email: null
      }
      
      const { data: simpleUser, error: simpleError } = await supabase
        .from('users')
        .insert(simpleData)
        .select()
        .single()
      
      if (simpleError) {
        console.error('❌ Simple creation also failed:', simpleError)
      } else {
        console.log('✅ Simple creation succeeded:', simpleUser.id)
        // 清理测试用户
        await supabase.from('users').delete().eq('id', simpleUser.id)
      }
    } else {
      console.log('✅ Test creation succeeded:', testUser.id)
      // 清理测试用户
      await supabase.from('users').delete().eq('id', testUser.id)
    }
    
  } catch (error) {
    console.error('💥 Error:', error)
  }
}

checkTableStructure()