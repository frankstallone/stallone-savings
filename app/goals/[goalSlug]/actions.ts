'use server'

import { revalidatePath } from 'next/cache'

import { getAuthorizedSession } from '@/lib/auth-session'
import { getAllowedEmails } from '@/lib/access-control'
import { getSql } from '@/lib/db'
import { normalizeGoalPayload } from '@/lib/goals'
export type DeleteGoalState = {
  status: 'idle' | 'success' | 'error'
  message?: string
}

export type UpdateGoalState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Record<string, string>
}

export async function deleteGoalAction(
  goalSlug: string,
  prevState: DeleteGoalState,
  formData: FormData,
): Promise<DeleteGoalState> {
  void prevState
  void formData

  const session = await getAuthorizedSession()
  if (!session) {
    return { status: 'error', message: 'Sign in required.' }
  }

  const sql = getSql()
  if (!sql) {
    return {
      status: 'error',
      message: 'DATABASE_URL is not configured yet.',
    }
  }

  const goalRows = (await sql`
    SELECT id FROM goals WHERE slug = ${goalSlug} LIMIT 1
  `) as { id: string }[]

  const goal = goalRows[0]
  if (!goal) {
    return { status: 'error', message: 'Goal not found.' }
  }

  await sql`
    DELETE FROM goals WHERE id = ${goal.id}
  `

  revalidatePath('/')
  return { status: 'success', message: 'Goal deleted.' }
}

export async function updateGoalAction(
  goalSlug: string,
  prevState: UpdateGoalState,
  formData: FormData,
): Promise<UpdateGoalState> {
  void prevState
  const session = await getAuthorizedSession()
  if (!session) {
    return { status: 'error', message: 'Sign in required.' }
  }

  const rawPayload = {
    name: String(formData.get('name') ?? ''),
    description: String(formData.get('description') ?? ''),
    targetAmount: String(formData.get('targetAmount') ?? ''),
    coverImageUrl: String(formData.get('coverImageUrl') ?? ''),
    coverImageSource: String(formData.get('coverImageSource') ?? ''),
    coverImageAttributionName: String(
      formData.get('coverImageAttributionName') ?? '',
    ),
    coverImageAttributionUrl: String(
      formData.get('coverImageAttributionUrl') ?? '',
    ),
    coverImageId: String(formData.get('coverImageId') ?? ''),
    champions: String(formData.get('champions') ?? ''),
  }

  const { data, errors } = normalizeGoalPayload(rawPayload)
  if (errors || !data) {
    return {
      status: 'error',
      message: 'Fix the highlighted fields before saving.',
      fieldErrors: errors,
    }
  }

  const sql = getSql()
  if (!sql) {
    return {
      status: 'error',
      message: 'DATABASE_URL is not configured yet.',
    }
  }

  const goalRows = (await sql`
    SELECT id FROM goals WHERE slug = ${goalSlug} LIMIT 1
  `) as { id: string }[]

  const goal = goalRows[0]
  if (!goal) {
    return { status: 'error', message: 'Goal not found.' }
  }

  await sql`
    UPDATE goals
    SET
      name = ${data.name},
      description = ${data.description},
      cover_image_url = ${data.coverImageUrl},
      cover_image_source = ${data.coverImageSource},
      cover_image_attribution_name = ${data.coverImageAttributionName},
      cover_image_attribution_url = ${data.coverImageAttributionUrl},
      cover_image_id = ${data.coverImageId},
      target_amount_cents = ${data.targetAmountCents},
      updated_at = now()
    WHERE id = ${goal.id}
  `

  await sql`
    DELETE FROM goal_champions WHERE goal_id = ${goal.id}
  `

  if (data.champions.length) {
    const allowedEmails = getAllowedEmails()
    if (allowedEmails.length) {
      await sql`
        INSERT INTO goal_champions (goal_id, user_id)
        SELECT ${goal.id}::uuid, u.id
        FROM "user" u
        WHERE u.id = ANY(${data.champions}::text[])
          AND u.email = ANY(${allowedEmails}::text[])
        ON CONFLICT DO NOTHING
      `
    } else {
      await sql`
        INSERT INTO goal_champions (goal_id, user_id)
        SELECT ${goal.id}::uuid, u.id
        FROM "user" u
        WHERE u.id = ANY(${data.champions}::text[])
        ON CONFLICT DO NOTHING
      `
    }
  }

  revalidatePath('/')
  revalidatePath(`/goals/${goalSlug}`)

  return { status: 'success', message: 'Goal updated.' }
}
