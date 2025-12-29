import { Pool } from '@neondatabase/serverless'
import { Kysely, PostgresDialect } from 'kysely'

import { getServerEnv } from '@/lib/env'
import type { Database } from '@/lib/db-types'

let db: Kysely<Database> | null = null

export function getDb() {
  if (process.env.NODE_ENV === 'test') return null
  const databaseUrl = getServerEnv().DATABASE_URL
  if (!databaseUrl) return null
  if (!db) {
    db = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: new Pool({ connectionString: databaseUrl }),
      }),
    })
  }
  return db
}

export { sql } from 'kysely'
