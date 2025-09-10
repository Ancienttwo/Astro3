// Fix migration for last_sign_in_at column
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

async function runMigration() {
  try {
    console.log('🚀 Running migration for last_sign_in_at column...')
    
    const statements = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT'
    ]
    
    for (const stmt of statements) {
      console.log('⚡ Executing:', stmt)
      const { error } = await supabase.rpc('exec_sql', { sql: stmt })
      if (error && !error.message.includes('already exists')) {
        console.error('❌ Failed:', error)
      } else {
        console.log('✅ Success')
      }
    }
    
    console.log('🎉 Migration completed!')
  } catch (error) {
    console.error('💥 Migration failed:', error)
  }
}

runMigration()