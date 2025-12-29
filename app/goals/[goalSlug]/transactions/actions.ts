'use server'

import { revalidatePath } from 'next/cache'

import { getAuthorizedSession } from '@/lib/auth-session'
import { getDb } from '@/lib/db'
import { normalizeTransactionPayload } from '@/lib/transactions'

export type TransactionFormState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Record<string, string>
}

export type DeleteTransactionState = {
  status: 'idle' | 'success' | 'error'
  message?: string
}

export async function addTransactionAction(
  goalSlug: string,
  prevState: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  void prevState
  const session = await getAuthorizedSession()
  if (!session) {
    return { status: 'error', message: 'Sign in required.' }
  }

  const rawPayload = {
    description: String(formData.get('description') ?? ''),
    amount: String(formData.get('amount') ?? ''),
    direction: String(formData.get('direction') ?? ''),
    transactedOn: String(formData.get('transactedOn') ?? ''),
    createdBy: String(formData.get('createdBy') ?? ''),
  }

  const { data, errors } = normalizeTransactionPayload({
    description: rawPayload.description,
    amount: rawPayload.amount,
    direction: rawPayload.direction,
    transactedOn: rawPayload.transactedOn,
    createdBy: rawPayload.createdBy,
  })

  if (errors || !data) {
    return {
      status: 'error',
      message: 'Fix the highlighted fields before saving.',
      fieldErrors: errors,
    }
  }

  const db = getDb()
  if (!db) {
    return {
      status: 'error',
      message: 'DATABASE_URL is not configured yet.',
    }
  }

  const goal = await db
    .selectFrom('goals')
    .select(['id'])
    .where('slug', '=', goalSlug)
    .executeTakeFirst()
  if (!goal) {
    return { status: 'error', message: 'Goal not found.' }
  }

  await db
    .insertInto('goal_transactions')
    .values({
      goal_id: goal.id,
      description: data.description,
      amount_cents: data.amountCents,
      transacted_on: data.transactedOn,
      created_by: data.createdBy,
    })
    .execute()

  revalidatePath('/')
  revalidatePath(`/goals/${goalSlug}`)

  return {
    status: 'success',
    message: 'Transaction added.',
  }
}

export async function updateTransactionAction(
  goalSlug: string,
  transactionId: string,
  prevState: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  void prevState
  const session = await getAuthorizedSession()
  if (!session) {
    return { status: 'error', message: 'Sign in required.' }
  }

  const rawPayload = {
    description: String(formData.get('description') ?? ''),
    amount: String(formData.get('amount') ?? ''),
    direction: String(formData.get('direction') ?? ''),
    transactedOn: String(formData.get('transactedOn') ?? ''),
    createdBy: String(formData.get('createdBy') ?? ''),
  }

  const { data, errors } = normalizeTransactionPayload({
    description: rawPayload.description,
    amount: rawPayload.amount,
    direction: rawPayload.direction,
    transactedOn: rawPayload.transactedOn,
    createdBy: rawPayload.createdBy,
  })

  if (errors || !data) {
    return {
      status: 'error',
      message: 'Fix the highlighted fields before saving.',
      fieldErrors: errors,
    }
  }

  const db = getDb()
  if (!db) {
    return {
      status: 'error',
      message: 'DATABASE_URL is not configured yet.',
    }
  }

  const transaction = await db
    .selectFrom('goal_transactions as t')
    .innerJoin('goals as g', 'g.id', 't.goal_id')
    .select(['t.id'])
    .where('g.slug', '=', goalSlug)
    .where('t.id', '=', transactionId)
    .executeTakeFirst()

  if (!transaction) {
    return { status: 'error', message: 'Transaction not found.' }
  }

  await db
    .updateTable('goal_transactions')
    .set({
      description: data.description,
      amount_cents: data.amountCents,
      transacted_on: data.transactedOn,
      created_by: data.createdBy,
    })
    .where('id', '=', transactionId)
    .execute()

  revalidatePath('/')
  revalidatePath(`/goals/${goalSlug}`)

  return { status: 'success', message: 'Transaction updated.' }
}

export async function deleteTransactionAction(
  goalSlug: string,
  transactionId: string,
  prevState: DeleteTransactionState,
  formData: FormData,
): Promise<DeleteTransactionState> {
  void prevState
  void formData

  const session = await getAuthorizedSession()
  if (!session) {
    return { status: 'error', message: 'Sign in required.' }
  }

  const db = getDb()
  if (!db) {
    return {
      status: 'error',
      message: 'DATABASE_URL is not configured yet.',
    }
  }

  const transaction = await db
    .selectFrom('goal_transactions as t')
    .innerJoin('goals as g', 'g.id', 't.goal_id')
    .select(['t.id'])
    .where('g.slug', '=', goalSlug)
    .where('t.id', '=', transactionId)
    .executeTakeFirst()

  if (!transaction) {
    return { status: 'error', message: 'Transaction not found.' }
  }

  await db
    .deleteFrom('goal_transactions')
    .where('id', '=', transactionId)
    .execute()

  revalidatePath('/')
  revalidatePath(`/goals/${goalSlug}`)

  return { status: 'success', message: 'Transaction deleted.' }
}
