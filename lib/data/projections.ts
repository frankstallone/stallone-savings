import { sql, type ExpressionBuilder } from 'kysely'

import type { Database } from '@/lib/db-types'
import type { Champion } from '@/lib/types'

export type GoalRow = {
  id: string
  slug: string
  name: string
  description: string | null
  coverImageUrl: string | null
  coverImageSource: string | null
  coverImageAttributionName: string | null
  coverImageAttributionUrl: string | null
  coverImageId: string | null
  targetAmountCents: number | null
  isArchived: boolean
  archivedAt: Date | string | null
  archivedBy: string | null
  unarchivedAt: Date | string | null
  unarchivedBy: string | null
  balance_cents: number | null
  champions: Champion[] | null
}

type GoalsExpressionBuilder = ExpressionBuilder<
  Database & { g: Database['goals'] },
  'g'
>

export const goalFieldSelections = [
  'g.id',
  'g.slug',
  'g.name',
  'g.description',
  sql`g.cover_image_url`.as('coverImageUrl'),
  sql`g.cover_image_source`.as('coverImageSource'),
  sql`g.cover_image_attribution_name`.as('coverImageAttributionName'),
  sql`g.cover_image_attribution_url`.as('coverImageAttributionUrl'),
  sql`g.cover_image_id`.as('coverImageId'),
  sql`g.target_amount_cents`.as('targetAmountCents'),
  sql`g.is_archived`.as('isArchived'),
  sql`g.archived_at`.as('archivedAt'),
  sql`g.archived_by`.as('archivedBy'),
  sql`g.unarchived_at`.as('unarchivedAt'),
  sql`g.unarchived_by`.as('unarchivedBy'),
] as const

export function goalBalanceSelect(eb: GoalsExpressionBuilder) {
  void eb
  return sql`(
    SELECT COALESCE(SUM(t.amount_cents), 0)::int
    FROM goal_transactions t
    WHERE t.goal_id = g.id
  )`.as('balance_cents')
}

export function goalChampionsSelect(eb: GoalsExpressionBuilder) {
  void eb
  return sql`(
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
  )`.as('champions')
}

export function goalProjection(eb: GoalsExpressionBuilder) {
  return [
    ...goalFieldSelections,
    goalBalanceSelect(eb),
    goalChampionsSelect(eb),
  ]
}
