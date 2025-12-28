'use server'

import { revalidatePath } from 'next/cache'

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
  const rawPayload = {
    name: String(formData.get('name') ?? ''),
    description: String(formData.get('description') ?? ''),
    targetAmount: String(formData.get('targetAmount') ?? ''),
    coverImageUrl: String(formData.get('coverImageUrl') ?? ''),
    champions: String(formData.get('champions') ?? ''),
  }

  const { data, errors } = normalizeGoalPayload(rawPayload)
  if (errors) {
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
  const existingSlugs = await sql<{ slug: string }[]>`
    SELECT slug
    FROM goals
    WHERE slug LIKE ${baseSlug + '%'}
  `

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

  await sql`
    INSERT INTO goals (slug, name, description, cover_image_url, champions, target_amount_cents)
    VALUES (
      ${slug},
      ${data.name},
      ${data.description},
      ${data.coverImageUrl},
      ${data.champions},
      ${data.targetAmountCents}
    )
  `

  revalidatePath('/')

  return { status: 'success', message: 'Goal created.' }
}
