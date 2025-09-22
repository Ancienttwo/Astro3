import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type ClientVariant = 'anon' | 'admin' | 'readonly'

const cachedClients: Partial<Record<ClientVariant, SupabaseClient>> = {}

function ensureServerContext() {
  if (typeof window !== 'undefined') {
    throw new Error('Supabase admin/readonly clients must be created on the server')
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function getBaseUrl(): string {
  return requireEnv('NEXT_PUBLIC_SUPABASE_URL')
}

function getAnonKey(): string {
  return requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

function buildAnonClient(): SupabaseClient {
  const url = getBaseUrl()
  const anonKey = getAnonKey()
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

function buildAdminClient(): SupabaseClient {
  ensureServerContext()
  const url = getBaseUrl()
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function buildReadonlyClient(): SupabaseClient {
  ensureServerContext()
  const url = process.env.SUPABASE_REPLICA_URL || getBaseUrl()
  const key = process.env.SUPABASE_REPLICA_KEY || getAnonKey()
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export function getSupabaseAnonClient(): SupabaseClient {
  cachedClients.anon ||= buildAnonClient()
  return cachedClients.anon
}

export function getSupabaseAdminClient(): SupabaseClient {
  cachedClients.admin ||= buildAdminClient()
  return cachedClients.admin
}

export function getSupabaseReadonlyClient(): SupabaseClient {
  cachedClients.readonly ||= buildReadonlyClient()
  return cachedClients.readonly
}

export type { SupabaseClient }
