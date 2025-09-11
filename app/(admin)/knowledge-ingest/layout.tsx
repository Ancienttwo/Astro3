import { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  const role = (user as any)?.app_metadata?.role
  if (!user || role !== 'admin') {
    redirect('/')
  }
  return <>{children}</>
}

