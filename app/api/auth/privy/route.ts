import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PrivyClient } from '@privy-io/server-auth'

// Initialize Supabase Admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Initialize Privy server client
function getPrivyClient() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  const appSecret = process.env.PRIVY_APP_SECRET
  if (!appId || !appSecret) {
    throw new Error('Missing Privy configuration: NEXT_PUBLIC_PRIVY_APP_ID or PRIVY_APP_SECRET')
  }
  return new PrivyClient(appId, appSecret)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { privyToken } = body || {}

    console.log('🔐 Privy auth request:', {
      hasToken: !!privyToken,
      tokenLength: privyToken?.length,
      tokenPrefix: privyToken?.substring(0, 30),
      tokenType: typeof privyToken,
    })

    if (!privyToken) {
      return NextResponse.json({ error: 'Missing privyToken' }, { status: 400 })
    }

    if (typeof privyToken !== 'string') {
      console.error('❌ Invalid token type:', typeof privyToken)
      return NextResponse.json({ error: 'Token must be a string' }, { status: 400 })
    }

    let privy
    try {
      privy = getPrivyClient()
      console.log('✅ Privy client created')
    } catch (error) {
      console.error('❌ Failed to create Privy client:', error)
      return NextResponse.json({
        error: 'Server configuration error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    // Verify Privy access token and get user
    let verification: any
    try {
      console.log('🔍 Attempting to verify token...')
      verification = await privy.verifyAuthToken(privyToken as any)
      console.log('✅ Token verified successfully:', {
        hasUser: !!verification?.user,
        userId: verification?.user?.id,
        hasWallet: !!verification?.user?.wallet,
      })
    } catch (error) {
      console.error('❌ Token verification failed:', {
        error: error instanceof Error ? error.message : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
        tokenPreview: privyToken.substring(0, 50) + '...',
      })
      return NextResponse.json({
        error: 'Invalid Privy token',
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'The token may be expired or invalid. Please try logging in again.'
      }, { status: 401 })
    }

    const user = verification?.user
    if (!user) {
      console.error('❌ No user in verification response')
      return NextResponse.json({ error: 'Invalid Privy token' }, { status: 401 })
    }

    // Extract user info
    const privyId: string = user.id
    const email: string | null = Array.isArray(user.email?.addresses) && user.email.addresses.length > 0
      ? user.email.addresses[0]
      : (typeof (user as any).email === 'string' ? (user as any).email : null)
    const walletAddress: string | undefined = user.wallet?.address || undefined
    const normalizedWalletAddress = walletAddress?.toLowerCase() || null

    // Build a stable email for Supabase Auth if missing
    const effectiveEmail = email || `${privyId.replace(':', '_')}@privy.astrozi.app`

    // Ensure a Supabase Auth user exists for this Privy user
    // Supabase Admin API does not provide direct getUserByEmail, so list and search
    const { data: listed, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) {
      console.warn('Supabase listUsers failed:', listError.message)
    }
    const existing = (listed as any)?.users?.find((u: any) => u.email === effectiveEmail)

    let supabaseUser = existing || null
    if (!supabaseUser) {
      // Create Supabase user with confirmed email
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: effectiveEmail,
        email_confirm: true,
        user_metadata: {
          auth_type: 'web3',
          auth_provider: 'privy',
          privy_id: privyId,
          wallet_address: normalizedWalletAddress,
        },
      })
      if (createErr || !created?.user) {
        console.error('Failed to create Supabase user for Privy:', createErr)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }
      supabaseUser = created.user
    } else {
      // Keep metadata up to date
      await supabaseAdmin.auth.admin.updateUserById(supabaseUser.id, {
        user_metadata: {
          ...(supabaseUser.user_metadata || {}),
          auth_type: 'web3',
          auth_provider: 'privy',
          privy_id: privyId,
          wallet_address: normalizedWalletAddress || (supabaseUser.user_metadata as any)?.wallet_address,
        },
      }).catch((e) => console.warn('Update supabase user metadata failed:', e?.message))
    }

    // Upsert into application users table
    const { data: existingAppUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', effectiveEmail.toLowerCase())
      .single()

    if (!existingAppUser) {
      await supabaseAdmin
        .from('users')
        .insert({
          email: effectiveEmail.toLowerCase(),
          username: (user?.google?.name || user?.twitter?.username || user?.discord?.username || 'PrivyUser'),
          wallet_address: normalizedWalletAddress,
          auth_type: 'web3',
          auth_provider: 'privy',
          privy_did: privyId,
        })
        .throwOnError()
    } else {
      await supabaseAdmin
        .from('users')
        .update({
          wallet_address: normalizedWalletAddress || existingAppUser.wallet_address || null,
          auth_type: 'web3',
          auth_provider: 'privy',
          updated_at: new Date().toISOString(),
          privy_did: privyId,
        })
        .eq('email', effectiveEmail.toLowerCase())
        .throwOnError()
    }

    // Generate a standard Supabase session (access_token) via magic link to acquire real JWT
    let accessToken: string | null = null
    let refreshToken: string | null = null

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: effectiveEmail,
    })
    if (linkError || !(linkData as any)?.action_link) {
      // Fallback to recovery link
      const { data: recData, error: recErr } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: effectiveEmail,
      })
      if (recErr || !(recData as any)?.action_link) {
        console.error('Failed to generate auth link for Supabase session:', linkError?.message || recErr?.message)
        return NextResponse.json({ error: 'Failed to generate session' }, { status: 500 })
      }
      const u = new URL((recData as any).action_link)
      accessToken = u.searchParams.get('access_token')
      refreshToken = u.searchParams.get('refresh_token')
    } else {
      const u = new URL((linkData as any).action_link)
      accessToken = u.searchParams.get('access_token')
      refreshToken = u.searchParams.get('refresh_token')
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'Session token missing' }, { status: 500 })
    }

    const now = new Date()
    const expiresAt = Math.floor((now.getTime() + 24 * 60 * 60 * 1000) / 1000)
    const session = {
      access_token: accessToken,
      refresh_token: refreshToken || accessToken,
      expires_in: 86400,
      expires_at: expiresAt,
      token_type: 'bearer',
      user: {
        id: supabaseUser.id,
        aud: 'authenticated',
        role: 'authenticated',
        email: effectiveEmail,
        email_confirmed_at: supabaseUser.email_confirmed_at || now.toISOString(),
        phone: '',
        confirmed_at: supabaseUser.confirmed_at || now.toISOString(),
        last_sign_in_at: now.toISOString(),
        app_metadata: {
          provider: 'privy',
          providers: ['privy'],
        },
        user_metadata: {
          ...(supabaseUser.user_metadata || {}),
          auth_type: 'web3',
          auth_provider: 'privy',
          privy_id: privyId,
          wallet_address: normalizedWalletAddress,
        },
        identities: [],
        created_at: supabaseUser.created_at,
        updated_at: now.toISOString(),
      },
    }

    return NextResponse.json({
      success: true,
      session,
      jwt: accessToken, // backward compatibility for clients expecting jwt
      isPremium: false,
      credits: 0,
      lastSignIn: now.toISOString(),
    })
  } catch (error) {
    console.error('Privy auth failed:', error)
    const message = error instanceof Error ? error.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
