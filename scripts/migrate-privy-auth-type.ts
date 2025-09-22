import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()
import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

type UserRow = {
  id: string
  email: string | null
  wallet_address: string | null
  auth_type: string | null
  updated_at?: string | null
}

async function run() {
  try {
    console.log('🔄 Starting Privy auth_type migration...')

    // Fetch existing users with auth_provider privy and legacy auth_type
    const { data: users, error: fetchError } = await supabase
      .from<UserRow>('users')
      .select('id, email, wallet_address, auth_type')
      .eq('auth_type', 'web2')

    if (fetchError) {
      throw fetchError
    }

    const { data: authUsers, error: authFetchError } = await supabase.auth.admin.listUsers()
    if (authFetchError) {
      throw authFetchError
    }

    const authUsersMap = new Map(authUsers.users.map((u) => [u.email?.toLowerCase(), u]))

    if (!users || users.length === 0) {
      console.log('✅ No users found with auth_provider privy. Nothing to update.')
      return
    }

    let updated = 0
    let alreadyWeb3 = 0

    // Iterate and update where needed
    for (const user of users) {
      const currentAuthType = (user.auth_type || '').toLowerCase()
      if (currentAuthType === 'web3') {
        alreadyWeb3 += 1
        continue
      }

      const normalizedWallet = user.wallet_address?.toLowerCase() || null

      const { error: updateError } = await supabase
        .from('users')
        .update({
          auth_type: 'web3',
          wallet_address: normalizedWallet,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        console.error(`❌ Failed to update users.id=${user.id}:`, updateError.message)
        continue
      }

      // Update Supabase Auth metadata as well
      const authUser = authUsersMap.get((user.email || '').toLowerCase())
      if (!authUser) {
        console.warn(`⚠️ No matching auth user found for ${user.email}. Skipping metadata update.`)
      } else {
        const { error: authUpdateError } = await supabase.auth.admin.updateUserById(authUser.id, {
          user_metadata: {
            ...(authUser.user_metadata || {}),
            auth_type: 'web3',
            auth_provider: 'privy',
            wallet_address: normalizedWallet,
            privy_id: authUser.user_metadata?.privy_id ?? null,
          },
        })

        if (authUpdateError) {
          console.error(`❌ Failed to update auth metadata for id=${authUser.id}:`, authUpdateError.message)
          continue
        }
      }

      updated += 1
      console.log(`✅ Updated user ${user.id} -> auth_type=web3, wallet=${normalizedWallet ?? 'null'}`)
    }

    console.log('🎯 Migration summary:')
    console.log(`   Updated: ${updated}`)
    console.log(`   Already web3: ${alreadyWeb3}`)
    console.log(`   Total inspected: ${users.length}`)
    console.log('🚀 Migration complete!')
  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

run()
