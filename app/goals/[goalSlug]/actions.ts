"use server"

import { revalidatePath } from "next/cache"

import { getSql } from "@/lib/db"
import { normalizeTransactionPayload } from "@/lib/transactions"

export type AddTransactionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: Record<string, string>
}

export async function addTransactionAction(
  goalSlug: string,
  prevState: AddTransactionState,
  formData: FormData
): Promise<AddTransactionState> {
  const rawPayload = {
    description: String(formData.get("description") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    direction: String(formData.get("direction") ?? ""),
    transactedOn: String(formData.get("transactedOn") ?? ""),
    createdBy: String(formData.get("createdBy") ?? ""),
  }

  const { data, errors } = normalizeTransactionPayload({
    description: rawPayload.description,
    amount: rawPayload.amount,
    direction: rawPayload.direction,
    transactedOn: rawPayload.transactedOn,
    createdBy: rawPayload.createdBy,
  })

  if (errors) {
    return {
      status: "error",
      message: "Fix the highlighted fields before saving.",
      fieldErrors: errors,
    }
  }

  const sql = getSql()
  if (!sql) {
    return {
      status: "error",
      message: "DATABASE_URL is not configured yet.",
    }
  }

  const goalRows = await sql<{ id: string }[]>`
    SELECT id FROM goals WHERE slug = ${goalSlug} LIMIT 1
  `

  const goal = goalRows[0]
  if (!goal) {
    return { status: "error", message: "Goal not found." }
  }

  await sql`
    INSERT INTO goal_transactions (goal_id, description, amount_cents, transacted_on, created_by)
    VALUES (
      ${goal.id},
      ${data.description},
      ${data.amountCents},
      ${data.transactedOn},
      ${data.createdBy}
    )
  `

  revalidatePath("/")
  revalidatePath(`/goals/${goalSlug}`)

  return {
    status: "success",
    message: "Transaction added.",
  }
}
