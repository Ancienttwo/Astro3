import { redirect } from 'next/navigation'

export default function WalletAuthRedirect() {
  redirect('/login')
}
