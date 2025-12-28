export function getUserLabel(user: {
  name?: string | null
  email?: string | null
}) {
  return user.name?.trim() || user.email || 'Unknown'
}
