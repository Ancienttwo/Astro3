import { redirect } from 'next/navigation'

export default function AuthSelectRedirect() {
  redirect('/login')
}
