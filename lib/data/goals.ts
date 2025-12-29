import { cache } from 'react'
import { getDb, sql } from '@/lib/db'
import { groupTotalsByGoal } from '@/lib/ledger'
import type { Champion, GoalSummary, GoalTransaction } from '@/lib/types'
import { sampleGoalSummaries, sampleTransactions } from '@/lib/data/sample'

type GoalRow = Omit<GoalSummary, 'champions' | 'balanceCents'> & {
  champions: Champion[] | null
  balance_cents: number | null
}

export const getGoals = cache(async () => {
  const db = getDb()
  if (!db) return sampleGoalSummaries

  const { rows } = await sql<GoalRow>`
    SELECT
      g.id,
      g.slug,
      g.name,
      g.description,
      g.cover_image_url AS "coverImageUrl",
      g.cover_image_source AS "coverImageSource",
      g.cover_image_attribution_name AS "coverImageAttributionName",
      g.cover_image_attribution_url AS "coverImageAttributionUrl",
      g.cover_image_id AS "coverImageId",
      g.target_amount_cents AS "targetAmountCents",
      (
        SELECT COALESCE(SUM(t.amount_cents), 0)::int
        FROM goal_transactions t
        WHERE t.goal_id = g.id
      ) AS balance_cents,
      (
        SELECT COALESCE(
          jsonb_agg(
            jsonb_build_object('id', u.id, 'name', u.name, 'email', u.email)
            ORDER BY u.name NULLS LAST, u.email
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'::jsonb
        )
        FROM goal_champions gc
        JOIN "user" u ON u.id = gc.user_id
        WHERE gc.goal_id = g.id
      ) AS champions
    FROM goals g
    ORDER BY g.created_at DESC
  `.execute(db)

  return rows.map((row) => ({
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
    balanceCents: Number(row.balance_cents ?? 0),
  }))
})

export const getGoalBySlug = cache(async (slug: string) => {
  const db = getDb()
  if (!db) {
    return sampleGoalSummaries.find((goal) => goal.slug === slug) ?? null
  }

  const { rows } = await sql<GoalRow>`
    SELECT
      g.id,
      g.slug,
      g.name,
      g.description,
      g.cover_image_url AS "coverImageUrl",
      g.cover_image_source AS "coverImageSource",
      g.cover_image_attribution_name AS "coverImageAttributionName",
      g.cover_image_attribution_url AS "coverImageAttributionUrl",
      g.cover_image_id AS "coverImageId",
      g.target_amount_cents AS "targetAmountCents",
      (
        SELECT COALESCE(SUM(t.amount_cents), 0)::int
        FROM goal_transactions t
        WHERE t.goal_id = g.id
      ) AS balance_cents,
      (
        SELECT COALESCE(
          jsonb_agg(
            jsonb_build_object('id', u.id, 'name', u.name, 'email', u.email)
            ORDER BY u.name NULLS LAST, u.email
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'::jsonb
        )
        FROM goal_champions gc
        JOIN "user" u ON u.id = gc.user_id
        WHERE gc.goal_id = g.id
      ) AS champions
    FROM goals g
    WHERE g.slug = ${slug}
    LIMIT 1
  `.execute(db)

  const row = rows[0]
  if (!row) return null

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
    balanceCents: Number(row.balance_cents ?? 0),
  }
})

export const getGoalTransactions = cache(async (goalId: string) => {
  const db = getDb()
  if (!db) {
    return sampleTransactions.filter(
      (transaction) => transaction.goalId === goalId,
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
    WHERE goal_id = ${goalId}
    ORDER BY transacted_on DESC, created_at DESC
  `.execute(db)

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

  const { rows } = await sql<{ goalId: string; balance: number }>`
    SELECT goal_id AS "goalId", COALESCE(SUM(amount_cents), 0)::int AS balance
    FROM goal_transactions
    GROUP BY goal_id
  `.execute(db)

  return rows.reduce<Record<string, number>>((totals, row) => {
    totals[row.goalId] = Number(row.balance)
    return totals
  }, {})
})
