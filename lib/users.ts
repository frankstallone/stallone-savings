import { cache } from 'react'

import { getAllowedEmails } from '@/lib/access-control'
import { getDb } from '@/lib/db'
import { sampleUsers } from '@/lib/data/sample'

export const getAllowedUsers = cache(async () => {
  const db = getDb()
  if (!db) return sampleUsers

  const allowedEmails = getAllowedEmails()
  const rows = allowedEmails.length
    ? await db
        .selectFrom('user')
        .select(['id', 'name', 'email'])
        .where('email', 'in', allowedEmails)
        .orderBy('createdAt', 'asc')
        .execute()
    : await db
        .selectFrom('user')
        .select(['id', 'name', 'email'])
        .orderBy('createdAt', 'asc')
        .execute()

  return rows.map((row) => ({
    id: row.id,
    name: row.name ?? null,
    email: row.email ?? null,
  }))
})
