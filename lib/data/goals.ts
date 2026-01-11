import { cache } from 'react'

import { getDb } from '@/lib/db'
import { goalProjection, type GoalRow } from '@/lib/data/projections'
import { groupTotalsByGoal } from '@/lib/ledger'
import type { GoalSummary } from '@/lib/types'
import { sampleGoalSummaries, sampleTransactions } from '@/lib/data/sample'

function formatTimestamp(value: unknown) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function mapGoalRow(row: GoalRow): GoalSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? null,
    coverImageUrl: row.coverImageUrl ?? null,
    coverImageSource: row.coverImageSource ?? null,
    coverImageAttributionName: row.coverImageAttributionName ?? null,
    coverImageAttributionUrl: row.coverImageAttributionUrl ?? null,
    coverImageId: row.coverImageId ?? null,
    champions: Array.isArray(row.champions) ? row.champions : [],
    targetAmountCents: row.targetAmountCents ?? null,
    isArchived: Boolean(row.isArchived),
    archivedAt: formatTimestamp(row.archivedAt),
    archivedBy: row.archivedBy ?? null,
    unarchivedAt: formatTimestamp(row.unarchivedAt),
    unarchivedBy: row.unarchivedBy ?? null,
    balanceCents: Number(row.balance_cents ?? 0),
  }
}

export const getGoals = cache(async () => {
  const db = getDb()
  if (!db) {
    return sampleGoalSummaries.filter((goal) => !goal.isArchived)
  }

  const rows = (await db
    .selectFrom('goals as g')
    .select((eb) => goalProjection(eb))
    .where('g.is_archived', '=', false)
    .orderBy('g.created_at', 'desc')
    .execute()) as unknown as GoalRow[]

  return rows.map(mapGoalRow)
})

export const getGoalBySlug = cache(async (slug: string) => {
  const db = getDb()
  if (!db) {
    const active =
      sampleGoalSummaries.find(
        (goal) => goal.slug === slug && !goal.isArchived,
      ) ?? null
    if (active) return active
    return sampleGoalSummaries.find((goal) => goal.slug === slug) ?? null
  }

  const rows = (await db
    .selectFrom('goals as g')
    .select((eb) => goalProjection(eb))
    .where('g.slug', '=', slug)
    .orderBy('g.is_archived', 'asc')
    .orderBy('g.created_at', 'desc')
    .limit(1)
    .execute()) as unknown as GoalRow[]

  const row = rows[0]
  if (!row) return null

  return mapGoalRow(row)
})

export const getArchivedGoals = cache(async () => {
  const db = getDb()
  if (!db) {
    return sampleGoalSummaries.filter((goal) => goal.isArchived)
  }

  const rows = (await db
    .selectFrom('goals as g')
    .select((eb) => goalProjection(eb))
    .where('g.is_archived', '=', true)
    .orderBy('g.archived_at', 'desc')
    .orderBy('g.created_at', 'desc')
    .execute()) as unknown as GoalRow[]

  return rows.map(mapGoalRow)
})

export const getArchivedGoalById = cache(async (goalId: string) => {
  const db = getDb()
  if (!db) {
    return (
      sampleGoalSummaries.find(
        (goal) => goal.id === goalId && goal.isArchived,
      ) ?? null
    )
  }

  const rows = (await db
    .selectFrom('goals as g')
    .select((eb) => goalProjection(eb))
    .where('g.id', '=', goalId)
    .limit(1)
    .execute()) as unknown as GoalRow[]

  const row = rows[0]
  if (!row) return null
  return mapGoalRow(row)
})

export const getGoalTransactions = cache(async (goalId: string) => {
  const db = getDb()
  if (!db) {
    return sampleTransactions.filter(
      (transaction) => transaction.goalId === goalId,
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
    .where('goal_id', '=', goalId)
    .orderBy('transacted_on', 'desc')
    .orderBy('created_at', 'desc')
    .execute()

  return rows.map((row) => ({
    ...row,
    amountCents: Number(row.amountCents),
    transactedOn:
      typeof row.transactedOn === 'string'
        ? row.transactedOn
        : new Date(row.transactedOn).toISOString().slice(0, 10),
  }))
})

export const getGoalTotals = cache(async () => {
  const db = getDb()
  if (!db) {
    return groupTotalsByGoal(
      sampleTransactions.map((transaction) => ({
        goalId: transaction.goalId,
        amountCents: transaction.amountCents,
      })),
    )
  }

  const rows = await db
    .selectFrom('goal_transactions')
    .select((eb) => [
      'goal_id as goalId',
      eb.fn
        .coalesce(eb.fn.sum('amount_cents'), eb.val(0))
        .$castTo<number>()
        .as('balance'),
    ])
    .groupBy('goal_id')
    .execute()

  return rows.reduce<Record<string, number>>((totals, row) => {
    totals[row.goalId] = Number(row.balance)
    return totals
  }, {})
})
