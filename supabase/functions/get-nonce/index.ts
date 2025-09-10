// supabase/functions/get-nonce/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NonceRequest {
  address: string
}

interface NonceResponse {
  nonce: string
  expires_at: string
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

    const { address }: NonceRequest = await req.json()
    
    if (!address) {
      return new Response(
        JSON.stringify({ error: 'Address is required' }),
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
    
    // Generate cryptographically secure nonce
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Set expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    // Create or update nonce table
    const { error: createTableError } = await supabaseClient.rpc('create_nonces_table_if_not_exists')
    if (createTableError) {
      console.warn('Could not create nonces table:', createTableError)
    }

    // Store nonce in database with upsert (insert or update)
    const { error: upsertError } = await supabaseClient
      .from('nonces')
      .upsert({
        address: normalizedAddress,
        nonce: nonce,
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'address'
      })

    if (upsertError) {
      console.error('Database error:', upsertError)
      return new Response(
        JSON.stringify({ error: 'Failed to store nonce' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Clean up expired nonces (async, don't wait)
    supabaseClient
      .from('nonces')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .then(({ error }) => {
        if (error) console.warn('Failed to clean up expired nonces:', error)
      })

    const response: NonceResponse = {
      nonce,
      expires_at: expiresAt
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