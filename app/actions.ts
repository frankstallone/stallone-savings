'use server'

import { revalidatePath } from 'next/cache'

import { getAllowedEmails } from '@/lib/access-control'
import { getAuthorizedSession } from '@/lib/auth-session'
import { getSql } from '@/lib/db'
import { normalizeGoalPayload, slugifyGoalName } from '@/lib/goals'

export type AddGoalState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Record<string, string>
}

export async function addGoalAction(
  prevState: AddGoalState,
  formData: FormData,
): Promise<AddGoalState> {
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
    return { status: 'error', message: 'DATABASE_URL is not configured yet.' }
  }

  const baseSlug = slugifyGoalName(data.name)
  const existingSlugs = (await sql`
    SELECT slug
    FROM goals
    WHERE slug LIKE ${baseSlug + '%'}
  `) as { slug: string }[]

  let slug = baseSlug
  if (existingSlugs.length) {
    const suffixes = existingSlugs
      .map((row) => row.slug)
      .filter((value) => value.startsWith(baseSlug))
      .map((value) => value.replace(baseSlug, ''))
      .map((value) => value.replace(/^-/, ''))
      .map((value) => (value ? Number(value) : 0))
      .filter((value) => !Number.isNaN(value))
    const maxSuffix = suffixes.length ? Math.max(...suffixes) : 0
    slug = `${baseSlug}-${maxSuffix + 1}`
  }

  const goalRows = (await sql`
    INSERT INTO goals (
      slug,
      name,
      description,
      cover_image_url,
      cover_image_source,
      cover_image_attribution_name,
      cover_image_attribution_url,
      cover_image_id,
      target_amount_cents
    )
    VALUES (
      ${slug},
      ${data.name},
      ${data.description},
      ${data.coverImageUrl},
      ${data.coverImageSource},
      ${data.coverImageAttributionName},
      ${data.coverImageAttributionUrl},
      ${data.coverImageId},
      ${data.targetAmountCents}
    )
    RETURNING id
  `) as { id: string }[]

  const goalId = goalRows[0]?.id
  if (goalId && data.champions.length) {
    const allowedEmails = getAllowedEmails()
    if (allowedEmails.length) {
      await sql`
        INSERT INTO goal_champions (goal_id, user_id)
        SELECT ${goalId}::uuid, u.id
        FROM "user" u
        WHERE u.id = ANY(${data.champions}::text[])
          AND u.email = ANY(${allowedEmails}::text[])
        ON CONFLICT DO NOTHING
      `
    } else {
      await sql`
        INSERT INTO goal_champions (goal_id, user_id)
        SELECT ${goalId}::uuid, u.id
        FROM "user" u
        WHERE u.id = ANY(${data.champions}::text[])
        ON CONFLICT DO NOTHING
      `
    }
  }

  revalidatePath('/')

  return { status: 'success', message: 'Goal created.' }
}
