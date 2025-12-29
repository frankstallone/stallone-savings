import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DeleteGoalDialog } from '@/components/delete-goal-dialog'
import { EditGoalForm } from '@/components/edit-goal-form'
import { GoalTransactionsTable } from '@/components/goal-transactions-table'
import { RedirectToast } from '@/components/redirect-toast'
import { UserMenu } from '@/components/user-menu'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { requireServerSession } from '@/lib/auth-session'
import { getGoalBySlug, getGoalTransactions } from '@/lib/data/goals'
import {
  formatCurrencyFromCents,
  formatSignedCurrencyFromCents,
} from '@/lib/format'
import { splitDepositsWithdrawals, sumAmounts } from '@/lib/ledger'
import { getAllowedUsers } from '@/lib/users'
import { getUserLabel } from '@/lib/user-label'
import { cn } from '@/lib/utils'

interface GoalDetailPageProps {
  params: Promise<{ goalSlug: string }>
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { goalSlug } = await params
  const session = await requireServerSession()
  const goal = await getGoalBySlug(goalSlug)
  if (!goal) {
    notFound()
  }
  const championOptions = await getAllowedUsers()
  const defaultChampionIds = goal.champions.map((champion) => champion.id)

  const transactions = await getGoalTransactions(goal.id)
  const balanceFromTransactions = sumAmounts(transactions)
  const balance = transactions.length
    ? balanceFromTransactions
    : goal.balanceCents
  const { deposits, withdrawals } = splitDepositsWithdrawals(transactions)

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <RedirectToast />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute -top-32 left-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative mx-auto w-full max-w-5xl px-6 py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'border-white/10 bg-white/5 text-slate-100 hover:bg-white/10',
              )}
            >
              ← Back to goals
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <DeleteGoalDialog goalSlug={goal.slug} goalName={goal.name} />
              <Link
                href={`/goals/${goal.slug}/transactions/new`}
                className={cn(buttonVariants())}
              >
                Add transaction
              </Link>
              <UserMenu user={session.user} />
            </div>
          </div>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">
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
                      key={champion.id}
                      variant="secondary"
                      className="bg-white/10 text-white"
                    >
                      {getUserLabel(champion)}
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

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 w-fit">
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Current balance
                </p>
                <p className="text-3xl font-semibold text-white">
                  {formatCurrencyFromCents(balance)}
                </p>
                {goal.targetAmountCents ? (
                  <p className="text-sm text-slate-400">
                    Target: {formatCurrencyFromCents(goal.targetAmountCents)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 flex flex-col gap-4 justify-between">
              <div className="flex flex-col">
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Deposits
                </p>
                <p className=" text-xl font-semibold">
                  {formatSignedCurrencyFromCents(deposits)}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Withdrawals
                </p>
                <p className="text-xl font-semibold">
                  {withdrawals > 0
                    ? `-${formatSignedCurrencyFromCents(withdrawals)}`
                    : formatSignedCurrencyFromCents(withdrawals)}
                </p>
              </div>

              <div className="flex flex-col">
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Net movement
                </p>
                <p className="text-xl font-semibold text-white">
                  {formatSignedCurrencyFromCents(balance)}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">
                Edit goal
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Update goal details
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-400">
                Adjust the goal name, target, champions, or cover image without
                leaving this page.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
              <EditGoalForm
                goal={goal}
                championOptions={championOptions}
                defaultChampionIds={defaultChampionIds}
              />
            </div>
          </section>

          <div className="mt-10">
            <GoalTransactionsTable
              goalSlug={goal.slug}
              transactions={transactions}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
