export type AmountRecord = {
  amountCents: number
}

export type GoalAmountRecord = AmountRecord & {
  goalId: string
}

export function sumAmounts(records: AmountRecord[]) {
  return records.reduce((total, record) => total + record.amountCents, 0)
}

export function groupTotalsByGoal(records: GoalAmountRecord[]) {
  return records.reduce<Record<string, number>>((totals, record) => {
    totals[record.goalId] = (totals[record.goalId] ?? 0) + record.amountCents
    return totals
  }, {})
}

export function splitDepositsWithdrawals(records: AmountRecord[]) {
  return records.reduce(
    (totals, record) => {
      if (record.amountCents >= 0) {
        totals.deposits += record.amountCents
      } else {
        totals.withdrawals += Math.abs(record.amountCents)
      }
      return totals
    },
    { deposits: 0, withdrawals: 0 }
  )
}
