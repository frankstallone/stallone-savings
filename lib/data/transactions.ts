import { cache } from 'react'

import { getDb, sql } from '@/lib/db'
import type { GoalTransaction } from '@/lib/types'
import { sampleTransactions } from '@/lib/data/sample'

export const getGoalTransactionById = cache(
  async (goalId: string, transactionId: string) => {
    const db = getDb()
    if (!db) {
      return (
        sampleTransactions.find(
          (transaction) =>
            transaction.id === transactionId && transaction.goalId === goalId,
        ) ?? null
      )
    }

    const { rows } = await sql<GoalTransaction>`
      SELECT
        id,
        goal_id AS "goalId",
        description,
        amount_cents AS "amountCents",
        transacted_on AS "transactedOn",
        created_by AS "createdBy"
      FROM goal_transactions
      WHERE id = ${transactionId}
        AND goal_id = ${goalId}
      LIMIT 1
    `.execute(db)

    const row = rows[0]
    if (!row) return null

    return {
      ...row,
      amountCents: Number(row.amountCents),
      transactedOn:
        typeof row.transactedOn === 'string'
          ? row.transactedOn
          : new Date(row.transactedOn).toISOString().slice(0, 10),
    }
  },
)
