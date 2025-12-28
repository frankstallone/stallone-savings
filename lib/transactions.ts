export type TransactionPayload = {
  description: string
  amount: string
  direction: string
  transactedOn: string
  createdBy?: string
}

export type NormalizedTransaction = {
  description: string
  amountCents: number
  transactedOn: string
  createdBy: string | null
}

export type TransactionValidationResult = {
  data?: NormalizedTransaction
  errors?: Record<string, string>
}

export function normalizeTransactionPayload(
  payload: TransactionPayload
): TransactionValidationResult {
  const errors: Record<string, string> = {}
  const description = payload.description.trim()

  if (!description) {
    errors.description = "Add a description for this entry."
  }

  const amountValue = Number(payload.amount)
  if (!payload.amount || Number.isNaN(amountValue) || amountValue <= 0) {
    errors.amount = "Enter a positive dollar amount."
  }

  if (payload.direction !== "deposit" && payload.direction !== "withdrawal") {
    errors.direction = "Choose deposit or withdrawal."
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.transactedOn)) {
    errors.transactedOn = "Use a valid date."
  }

  if (Object.keys(errors).length) {
    return { errors }
  }

  const amountCents = Math.round(amountValue * 100)
  const signedAmount =
    payload.direction === "withdrawal" ? -amountCents : amountCents

  return {
    data: {
      description,
      amountCents: signedAmount,
      transactedOn: payload.transactedOn,
      createdBy: payload.createdBy?.trim() || null,
    },
  }
}
