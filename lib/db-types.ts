import type { ColumnType, Generated } from 'kysely'

export type Database = {
  goals: GoalsTable
  goal_champions: GoalChampionsTable
  goal_transactions: GoalTransactionsTable
  user: UserTable
}

type GoalsTable = {
  id: Generated<string>
  slug: string
  name: string
  description: string | null
  cover_image_url: string | null
  cover_image_source: string | null
  cover_image_attribution_name: string | null
  cover_image_attribution_url: string | null
  cover_image_id: string | null
  target_amount_cents: number | null
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

type GoalChampionsTable = {
  goal_id: string
  user_id: string
  created_at: Generated<Date>
}

type GoalTransactionsTable = {
  id: Generated<string>
  goal_id: string
  description: string
  amount_cents: number
  transacted_on: ColumnType<string, string, string>
  created_by: string | null
  created_at: Generated<Date>
}

type UserTable = {
  id: string
  name: string | null
  email: string | null
  createdAt: Generated<Date>
}
