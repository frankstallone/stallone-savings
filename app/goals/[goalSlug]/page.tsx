import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  ArchiveGoalDialog,
  UnarchiveGoalDialog,
} from '@/components/archive-goal-dialog'
import { DeleteGoalDialog } from '@/components/delete-goal-dialog'
import { GoalTransactionsTable } from '@/components/goal-transactions-table'
import { PageHeader } from '@/components/page-header'
import { RedirectToast } from '@/components/redirect-toast'
import { UserMenu } from '@/components/user-menu'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { requireServerSession } from '@/lib/auth-session'
import { getGoalBySlug, getGoalTransactions } from '@/lib/data/goals'
import {
  formatCurrencyFromCents,
  formatSignedCurrencyFromCents,
} from '@/lib/format'
import { splitDepositsWithdrawals, sumAmounts } from '@/lib/ledger'
import { getUserLabel } from '@/lib/user-label'
import { cn } from '@/lib/utils'
import { Ellipsis } from 'lucide-react'

interface GoalDetailPageProps {
  params: Promise<{ goalSlug: string }>
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { goalSlug } = await params
  const sessionPromise = requireServerSession()
  const goalPromise = getGoalBySlug(goalSlug)
  const [session, goal] = await Promise.all([sessionPromise, goalPromise])
  if (!goal) {
    notFound()
  }

  const transactions = await getGoalTransactions(goal.id)
  const balanceFromTransactions = sumAmounts(transactions)
  const balance = transactions.length
    ? balanceFromTransactions
    : goal.balanceCents
  const { deposits, withdrawals } = splitDepositsWithdrawals(transactions)
  const isArchived = goal.isArchived
  const user = {
    name: session.user?.name ?? null,
    email: session.user?.email ?? null,
    image: session.user?.image ?? null,
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <RedirectToast />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute -top-32 left-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative mx-auto w-full max-w-5xl px-6 py-12">
          <PageHeader
            title={goal.name}
            description={goal.description || undefined}
          >
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'border-white/10 bg-white/5 text-slate-100 hover:bg-white/10',
              )}
            >
              Back
            </Link>
            <div className="flex gap-2 items-center">
              {isArchived ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                        aria-label="Open goal actions"
                      />
                    }
                  >
                    <Ellipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="border-white/10 bg-slate-950 text-slate-100"
                  >
                    <UnarchiveGoalDialog
                      goalId={goal.id}
                      goalSlug={goal.slug}
                      goalName={goal.name}
                      trigger={<DropdownMenuItem />}
                    />
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DeleteGoalDialog
                      goalId={goal.id}
                      goalName={goal.name}
                      trigger={<DropdownMenuItem variant="destructive" />}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <ButtonGroup>
                  <Link
                    href={`/goals/${goal.slug}/transactions/new`}
                    className={cn(buttonVariants())}
                  >
                    Add transaction
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="default"
                          size="icon"
                          aria-label="Open goal actions"
                        />
                      }
                    >
                      <Ellipsis />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="border-white/10 bg-slate-950 text-slate-100"
                    >
                      <DropdownMenuItem
                        render={
                          <Link
                            href={`/goals/${goal.slug}/edit`}
                            className="w-full"
                          />
                        }
                      >
                        Edit goal
                      </DropdownMenuItem>
                      <ArchiveGoalDialog
                        goalSlug={goal.slug}
                        goalName={goal.name}
                        trigger={<DropdownMenuItem />}
                      />
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DeleteGoalDialog
                        goalId={goal.id}
                        goalName={goal.name}
                        trigger={<DropdownMenuItem variant="destructive" />}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ButtonGroup>
              )}
              <UserMenu user={user} />
            </div>
          </PageHeader>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
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
                {isArchived ? (
                  <Badge
                    variant="secondary"
                    className="bg-amber-500/20 text-amber-100"
                  >
                    Archived
                  </Badge>
                ) : null}
              </div>

              {isArchived ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  This goal is archived and read-only.
                </div>
              ) : null}

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

          <div className="mt-10">
            <GoalTransactionsTable
              goalSlug={goal.slug}
              transactions={transactions}
              readOnly={isArchived}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
