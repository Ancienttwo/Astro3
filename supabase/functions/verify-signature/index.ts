// supabase/functions/verify-signature/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { create, verify } from 'https://deno.land/x/djwt@v2.8/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyRequest {
  message: string
  signature: string
  address: string
}

interface VerifyResponse {
  token: string
  user: {
    id: string
    email: string
    wallet_address: string
    username: string
    is_web3_user: boolean
    auth_method: string
  }
}

// Helper function to recover address from signature
async function recoverAddress(message: string, signature: string): Promise<string> {
  // Import ethers for signature verification
  const { ethers } = await import('https://esm.sh/ethers@6.15.0')
  
  try {
    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(message, signature)
    return recoveredAddress.toLowerCase()
  } catch (error) {
    console.error('Address recovery failed:', error)
    throw new Error('Invalid signature')
  }
}

// Helper function to parse SIWE message
function parseSIWEMessage(message: string): { domain: string; address: string; nonce: string; issuedAt: string } {
  const lines = message.split('\n').filter(line => line.trim())
  
  // Extract domain (first line)
  const domain = lines[0]?.split(' wants you to sign in')[0] || ''
  
  // Extract address (second line)
  const address = lines[1] || ''
  
  // Extract nonce
  const nonceLine = lines.find(line => line.startsWith('Nonce: '))
  const nonce = nonceLine?.replace('Nonce: ', '') || ''
  
  // Extract issued at
  const issuedAtLine = lines.find(line => line.startsWith('Issued At: '))
  const issuedAt = issuedAtLine?.replace('Issued At: ', '') || ''
  
  return { domain, address, nonce, issuedAt }
}

// Helper function to generate JWT token
async function generateJWT(userPayload: any): Promise<string> {
  const secret = Deno.env.get('SUPABASE_JWT_SECRET')
  if (!secret) {
    throw new Error('JWT secret not configured')
  }

  // Convert secret to CryptoKey
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )

  const payload = {
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
    sub: userPayload.id,
    email: userPayload.email,
    app_metadata: {
      provider: 'walletconnect',
      providers: ['walletconnect']
    },
    user_metadata: {
      wallet_address: userPayload.wallet_address,
      username: userPayload.username,
      is_web3_user: true,
      auth_method: 'walletconnect'
    },
    role: 'authenticated'
  }

  return await create({ alg: 'HS256', typ: 'JWT' }, payload, key)
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { message, signature, address }: VerifyRequest = await req.json()
    
    if (!message || !signature || !address) {
      return new Response(
        JSON.stringify({ error: 'Message, signature, and address are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate Ethereum address format
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
    if (!ethAddressRegex.test(address)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Ethereum address format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const normalizedAddress = address.toLowerCase()

    // 1. Verify signature
    let recoveredAddress: string
    try {
      recoveredAddress = await recoverAddress(message, signature)
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if recovered address matches provided address
    if (recoveredAddress !== normalizedAddress) {
      return new Response(
        JSON.stringify({ error: 'Signature does not match address' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 2. Parse and validate SIWE message
    const siweData = parseSIWEMessage(message)
    if (siweData.address.toLowerCase() !== normalizedAddress) {
      return new Response(
        JSON.stringify({ error: 'Message address does not match provided address' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 3. Verify nonce (if nonce table exists)
    const { data: nonceData, error: nonceError } = await supabaseClient
      .from('nonces')
      .select('nonce, expires_at')
      .eq('address', normalizedAddress)
      .single()

    if (!nonceError && nonceData) {
      // Nonce exists, verify it
      if (nonceData.nonce !== siweData.nonce) {
        return new Response(
          JSON.stringify({ error: 'Invalid nonce' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Check if nonce is expired
      if (new Date(nonceData.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Nonce expired' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Delete used nonce
      await supabaseClient
        .from('nonces')
        .delete()
        .eq('address', normalizedAddress)
    }

    // 4. Create or get user
    const email = `${normalizedAddress}@web3.astrozi.app`
    const username = `Web3User${normalizedAddress.slice(-6)}`
    
    // Check if user exists
    let { data: existingUser, error: userFetchError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('wallet_address', normalizedAddress)
      .single()

    let user: any

    if (userFetchError && userFetchError.code === 'PGRST116') {
      // User doesn't exist, create new user
      const { data: newUser, error: createError } = await supabaseClient
        .from('users')
        .insert({
          email: email,
          wallet_address: normalizedAddress,
          username: username,
          is_web3_user: true,
          auth_method: 'walletconnect',
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('User creation error:', createError)
        return new Response(
          JSON.stringify({ error: 'Failed to create user' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      user = newUser
    } else if (userFetchError) {
      console.error('User fetch error:', userFetchError)
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      // User exists, update last sign in
      const { data: updatedUser, error: updateError } = await supabaseClient
        .from('users')
        .update({
          last_sign_in_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single()

      if (updateError) {
        console.warn('Failed to update user last sign in:', updateError)
      }

      user = updatedUser || existingUser
    }

    // 5. Generate JWT token
    const token = await generateJWT(user)

    // 6. Return response
    const response: VerifyResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        wallet_address: user.wallet_address,
        username: user.username,
        is_web3_user: user.is_web3_user,
        auth_method: user.auth_method
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})