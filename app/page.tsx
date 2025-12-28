import { GoalCard } from '@/components/goal-card'
import { GoalEmptyState } from '@/components/goal-empty-state'
import { getGoals } from '@/lib/data/goals'
import { formatCurrencyFromCents } from '@/lib/format'
import { cn } from '@/lib/utils'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'

export default async function HomePage() {
  const goals = await getGoals()
  const totalBalance = goals.reduce((sum, goal) => sum + goal.balanceCents, 0)

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
          <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                Preferred Deposit
              </p>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Savings goals, sorted by intent
              </h1>
              <p className="max-w-xl text-sm text-slate-400">
                Keep every dollar tagged to a purpose. As deposits and
                withdrawals hit the account, you can see which goals grow and
                which ones need attention.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200">
                Main
              </div>
              <div className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                Sum
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-right">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Total balance
                </p>
                <p className="text-2xl font-semibold text-white">
                  {formatCurrencyFromCents(totalBalance)}
                </p>
              </div>
            </div>
          </header>

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
                      <p className="text-[0.65rem] uppercase tracking-[0.45em] text-slate-400">
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
