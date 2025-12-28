import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'

function getAllowedEmails() {
  const raw = process.env.ALLOWED_EMAILS ?? ''
  if (!raw.trim()) return []
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isEmailAllowed(email?: string | null) {
  const allowed = getAllowedEmails()
  if (!allowed.length) return true
  if (!email) return false
  return allowed.includes(email.toLowerCase())
}

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
