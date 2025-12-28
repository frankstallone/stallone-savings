export type UserSummary = {
  id: string
  name: string | null
  email: string | null
}

export type Champion = UserSummary

export type Goal = {
  id: string
  slug: string
  name: string
  description: string | null
  coverImageUrl: string | null
  coverImageSource: string | null
  coverImageAttributionName: string | null
  coverImageAttributionUrl: string | null
  coverImageId: string | null
  champions: Champion[]
  targetAmountCents: number | null
}

export type GoalSummary = Goal & {
  balanceCents: number
}

export type GoalTransaction = {
  id: string
  goalId: string
  description: string
  amountCents: number
  transactedOn: string
  createdBy: string | null
}
