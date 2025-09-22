import { redirect } from 'next/navigation'

export default function PrivyAuthRedirect() {
  redirect('/login')
}
