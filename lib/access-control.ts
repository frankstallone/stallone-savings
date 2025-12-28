function normalizeEmails(value: string) {
  return value
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function getAllowedEmails() {
  const raw = process.env.ALLOWED_EMAILS ?? ''
  if (!raw.trim()) return []
  return normalizeEmails(raw)
}

export function isEmailAllowed(email?: string | null) {
  const allowed = getAllowedEmails()
  if (!allowed.length) return true
  if (!email) return false
  return allowed.includes(email.toLowerCase())
}
