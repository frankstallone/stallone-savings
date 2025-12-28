import { cache } from 'react'

import { getAllowedEmails } from '@/lib/access-control'
import { getSql } from '@/lib/db'
import { sampleUsers } from '@/lib/data/sample'
import type { UserSummary } from '@/lib/types'

export const getAllowedUsers = cache(async () => {
  const sql = getSql()
  if (!sql) return sampleUsers

  const allowedEmails = getAllowedEmails()
  const rows = allowedEmails.length
    ? ((await sql`
        SELECT id, name, email
        FROM "user"
        WHERE email = ANY(${allowedEmails}::text[])
        ORDER BY "createdAt" ASC
      `) as UserSummary[])
    : ((await sql`
        SELECT id, name, email
        FROM "user"
        ORDER BY "createdAt" ASC
      `) as UserSummary[])

  return rows.map((row) => ({
    id: row.id,
    name: row.name ?? null,
    email: row.email ?? null,
  }))
})
