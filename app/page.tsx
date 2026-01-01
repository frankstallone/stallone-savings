import { GoalCard } from '@/components/goal-card'
import { GoalEmptyState } from '@/components/goal-empty-state'
import { PageHeader } from '@/components/page-header'
import { RedirectToast } from '@/components/redirect-toast'
import { UserMenu } from '@/components/user-menu'
import { Button, buttonVariants } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getGoals } from '@/lib/data/goals'
import { formatCurrencyFromCents } from '@/lib/format'
import { requireServerSession } from '@/lib/auth-session'
import type { GoalSummary } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Ellipsis, PlusIcon } from 'lucide-react'
import Link from 'next/link'

export default async function HomePage() {
  const session = await requireServerSession()
  const goals = (await getGoals()) as GoalSummary[]
  const totalBalance = goals.reduce(
    (sum: number, goal: { balanceCents: number }) => sum + goal.balanceCents,
    0,
  )

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <RedirectToast />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
          <PageHeader
            title="Savings goals"
            description="Keep every dollar tagged to a purpose. As deposits and withdrawals hit the account, you can see which goals grow and which ones need attention."
            titleClassName="md:text-5xl"
            descriptionClassName="max-w-xl"
          >
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-slate-400">
                Total balance
              </p>
              <p className="text-lg font-semibold text-white">
                {formatCurrencyFromCents(totalBalance)}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <ButtonGroup>
                <Link href="/goals/new" className={cn(buttonVariants())}>
                  New goal
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
                        <Link href="/goals/archived" className="w-full" />
                      }
                    >
                      Archived goals
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ButtonGroup>
              <UserMenu user={session.user} />
            </div>
          </PageHeader>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {goals.length ? (
              <>
                {goals.map((goal, index) => (
                  <GoalCard key={goal.id} goal={goal} index={index} />
                ))}
                <Link
                  href="/goals/new"
                  className={cn(
                    'group h-full w-full rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-left text-slate-200 transition hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
                  )}
                >
                  <div className="flex h-full flex-col items-start justify-between gap-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5">
                      <PlusIcon className="h-5 w-5 text-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-widest text-slate-400">
                        New goal
                      </p>
                      <p className="text-lg font-semibold text-white">
                        Add a new bucket
                      </p>
                      <p className="text-sm text-slate-400">
                        Track a fresh savings target.
                      </p>
                    </div>
                  </div>
                </Link>
              </>
            ) : (
              <GoalEmptyState />
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
