import { cache } from 'react'

import { getDb } from '@/lib/db'
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

    const rows = await db
      .selectFrom('goal_transactions')
      .select([
        'id',
        'goal_id as goalId',
        'description',
        'amount_cents as amountCents',
        'transacted_on as transactedOn',
        'created_by as createdBy',
      ])
      .where('id', '=', transactionId)
      .where('goal_id', '=', goalId)
      .limit(1)
      .execute()

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
