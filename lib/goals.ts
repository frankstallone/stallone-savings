export type GoalPayload = {
  name: string
  description?: string
  targetAmount?: string
  coverImageUrl?: string
  coverImageSource?: string
  coverImageAttributionName?: string
  coverImageAttributionUrl?: string
  coverImageId?: string
  champions?: string
}

export type NormalizedGoalPayload = {
  name: string
  description: string | null
  targetAmountCents: number | null
  coverImageUrl: string | null
  coverImageSource: string | null
  coverImageAttributionName: string | null
  coverImageAttributionUrl: string | null
  coverImageId: string | null
  champions: string[]
}

export type GoalValidationResult = {
  data?: NormalizedGoalPayload
  errors?: Record<string, string>
}

export function normalizeGoalPayload(
  payload: GoalPayload,
): GoalValidationResult {
  const errors: Record<string, string> = {}
  const name = payload.name.trim()

  if (!name) {
    errors.name = 'Enter a goal name.'
  }

  let targetAmountCents: number | null = null
  if (payload.targetAmount?.trim()) {
    const amountValue = Number(payload.targetAmount)
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      errors.targetAmount = 'Enter a positive target amount.'
    } else {
      targetAmountCents = Math.round(amountValue * 100)
    }
  }

  if (Object.keys(errors).length) {
    return { errors }
  }

  const champions = payload.champions
    ? Array.from(
        new Set(
          payload.champions
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      )
    : []

  return {
    data: {
      name,
      description: payload.description?.trim() || null,
      targetAmountCents,
      coverImageUrl: payload.coverImageUrl?.trim() || null,
      coverImageSource: payload.coverImageSource?.trim() || null,
      coverImageAttributionName:
        payload.coverImageAttributionName?.trim() || null,
      coverImageAttributionUrl:
        payload.coverImageAttributionUrl?.trim() || null,
      coverImageId: payload.coverImageId?.trim() || null,
      champions,
    },
  }
}

export function slugifyGoalName(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

  return slug || 'goal'
}
