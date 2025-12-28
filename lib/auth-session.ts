import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { isEmailAllowed } from '@/lib/access-control'

export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function getAuthorizedSession() {
  const session = await getServerSession()
  if (!session) return null
  if (!isEmailAllowed(session.user?.email)) return null
  return session
}

export async function requireServerSession() {
  const session = await getServerSession()
  if (!session) {
    redirect('/sign-in')
  }
  if (!isEmailAllowed(session.user?.email)) {
    redirect('/sign-in?error=unauthorized')
  }
  return session
}
