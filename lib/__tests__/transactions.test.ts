import { describe, expect, it } from "vitest"

import { normalizeTransactionPayload } from "@/lib/transactions"

describe("normalizeTransactionPayload", () => {
  it("returns errors for missing required fields", () => {
    const result = normalizeTransactionPayload({
      description: "",
      amount: "",
      direction: "deposit",
      transactedOn: "",
      createdBy: "",
    })

    expect(result.errors).toMatchObject({
      description: "Add a description for this entry.",
      amount: "Enter a positive dollar amount.",
      transactedOn: "Use a valid date.",
    })
  })

  it("normalizes deposit payloads", () => {
    const result = normalizeTransactionPayload({
      description: "Monthly transfer",
      amount: "1500",
      direction: "deposit",
      transactedOn: "2025-12-01",
      createdBy: "Frank",
    })

    expect(result.data).toEqual({
      description: "Monthly transfer",
      amountCents: 150000,
      transactedOn: "2025-12-01",
      createdBy: "Frank",
    })
  })

  it("normalizes withdrawal payloads", () => {
    const result = normalizeTransactionPayload({
      description: "Transfer",
      amount: "25.50",
      direction: "withdrawal",
      transactedOn: "2025-12-02",
      createdBy: "",
    })

    expect(result.data?.amountCents).toBe(-2550)
    expect(result.data?.createdBy).toBeNull()
  })
})
