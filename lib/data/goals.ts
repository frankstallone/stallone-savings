import { cache } from "react"
import { getSql } from "@/lib/db"
import { groupTotalsByGoal } from "@/lib/ledger"
import type { GoalSummary, GoalTransaction } from "@/lib/types"
import {
  sampleGoalSummaries,
  sampleTransactions,
} from "@/lib/data/sample"

export const getGoals = cache(async () => {
  const sql = getSql()
  if (!sql) return sampleGoalSummaries

  const rows = await sql<
    (GoalSummary & { champions: string[] | null; balance_cents: number | null })[]
  >`
    SELECT
      g.id,
      g.slug,
      g.name,
      g.description,
      g.cover_image_url AS "coverImageUrl",
      g.champions,
      g.target_amount_cents AS "targetAmountCents",
      COALESCE(SUM(t.amount_cents), 0)::int AS balance_cents
    FROM goals g
    LEFT JOIN goal_transactions t ON t.goal_id = g.id
    GROUP BY g.id
    ORDER BY g.created_at DESC
  `

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? null,
    coverImageUrl: row.coverImageUrl ?? null,
    champions: row.champions ?? [],
    targetAmountCents: row.targetAmountCents ?? null,
    balanceCents: Number(row.balance_cents ?? 0),
  }))
})

export const getGoalBySlug = cache(async (slug: string) => {
  const sql = getSql()
  if (!sql) {
    return sampleGoalSummaries.find((goal) => goal.slug === slug) ?? null
  }

  const rows = await sql<
    (GoalSummary & { champions: string[] | null; balance_cents: number | null })[]
  >`
    SELECT
      g.id,
      g.slug,
      g.name,
      g.description,
      g.cover_image_url AS "coverImageUrl",
      g.champions,
      g.target_amount_cents AS "targetAmountCents",
      COALESCE(SUM(t.amount_cents), 0)::int AS balance_cents
    FROM goals g
    LEFT JOIN goal_transactions t ON t.goal_id = g.id
    WHERE g.slug = ${slug}
    GROUP BY g.id
    LIMIT 1
  `

  const row = rows[0]
  if (!row) return null

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? null,
    coverImageUrl: row.coverImageUrl ?? null,
    champions: row.champions ?? [],
    targetAmountCents: row.targetAmountCents ?? null,
    balanceCents: Number(row.balance_cents ?? 0),
  }
})

export const getGoalTransactions = cache(async (goalId: string) => {
  const sql = getSql()
  if (!sql) {
    return sampleTransactions.filter((transaction) => transaction.goalId === goalId)
  }

  const rows = await sql<GoalTransaction[]>`
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
  `

  return rows.map((row) => ({
    ...row,
    amountCents: Number(row.amountCents),
    transactedOn:
      typeof row.transactedOn === "string"
        ? row.transactedOn
        : new Date(row.transactedOn).toISOString().slice(0, 10),
  }))
})

export const getGoalTotals = cache(async () => {
  const sql = getSql()
  if (!sql) {
    return groupTotalsByGoal(
      sampleTransactions.map((transaction) => ({
        goalId: transaction.goalId,
        amountCents: transaction.amountCents,
      }))
    )
  }

  const rows = await sql<{ goalId: string; balance: number }[]>`
    SELECT goal_id AS "goalId", COALESCE(SUM(amount_cents), 0)::int AS balance
    FROM goal_transactions
    GROUP BY goal_id
  `

  return rows.reduce<Record<string, number>>((totals, row) => {
    totals[row.goalId] = Number(row.balance)
    return totals
  }, {})
})
