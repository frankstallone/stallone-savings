import Link from "next/link"
import { notFound } from "next/navigation"

import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { GoalTransactionsTable } from "@/components/goal-transactions-table"
import { Badge } from "@/components/ui/badge"
import { getGoalBySlug, getGoalTransactions } from "@/lib/data/goals"
import {
  formatCurrencyFromCents,
  formatSignedCurrencyFromCents,
} from "@/lib/format"
import { splitDepositsWithdrawals, sumAmounts } from "@/lib/ledger"

interface GoalDetailPageProps {
  params: Promise<{ goalSlug: string }>
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { goalSlug } = await params
  const goal = await getGoalBySlug(goalSlug)
  if (!goal) {
    notFound()
  }

  const transactions = await getGoalTransactions(goal.id)
  const balanceFromTransactions = sumAmounts(transactions)
  const balance = transactions.length ? balanceFromTransactions : goal.balanceCents
  const { deposits, withdrawals } = splitDepositsWithdrawals(transactions)

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute -top-32 left-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative mx-auto w-full max-w-5xl px-6 py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-sm text-slate-400 hover:text-white">
              ← Back to goals
            </Link>
            <AddTransactionDialog goalSlug={goal.slug} goalName={goal.name} />
          </div>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                  Goal
                </p>
                <h1 className="text-4xl font-semibold tracking-tight">
                  {goal.name}
                </h1>
                {goal.description ? (
                  <p className="mt-3 text-sm text-slate-400">
                    {goal.description}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {goal.champions.length ? (
                  goal.champions.map((champion) => (
                    <Badge
                      key={champion}
                      variant="secondary"
                      className="bg-white/10 text-white"
                    >
                      {champion}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary" className="bg-white/10 text-white">
                    Shared Goal
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-white/10 text-white">
                  {transactions.length} transactions
                </Badge>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Current balance
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {formatCurrencyFromCents(balance)}
                </p>
                {goal.targetAmountCents ? (
                  <p className="mt-2 text-sm text-slate-400">
                    Target: {formatCurrencyFromCents(goal.targetAmountCents)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Deposits
                </p>
                <p className="mt-2 text-2xl font-semibold text-emerald-300">
                  {formatSignedCurrencyFromCents(deposits)}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Withdrawals
                </p>
                <p className="mt-2 text-2xl font-semibold text-rose-300">
                  {withdrawals > 0
                    ? `-${formatSignedCurrencyFromCents(withdrawals)}`
                    : formatSignedCurrencyFromCents(withdrawals)}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Net movement
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatSignedCurrencyFromCents(balance)}
                </p>
              </div>
            </div>
          </section>

          <div className="mt-10">
            <GoalTransactionsTable transactions={transactions} />
          </div>
        </div>
      </div>
    </main>
  )
}
