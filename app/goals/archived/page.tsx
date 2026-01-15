import Link from 'next/link'

import { GoalCard } from '@/components/goal-card'
import { PageHeader } from '@/components/page-header'
import { RedirectToast } from '@/components/redirect-toast'
import { UserMenu } from '@/components/user-menu'
import { buttonVariants } from '@/components/ui/button'
import { requireServerSession } from '@/lib/auth-session'
import { getArchivedGoals } from '@/lib/data/goals'
import { cn } from '@/lib/utils'

export default async function ArchivedGoalsPage() {
  const sessionPromise = requireServerSession()
  const goalsPromise = getArchivedGoals()
  const [session, goals] = await Promise.all([sessionPromise, goalsPromise])
  const user = {
    name: session.user?.name ?? null,
    email: session.user?.email ?? null,
    image: session.user?.image ?? null,
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <RedirectToast />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_55%)]" />
        <div className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
          <PageHeader
            title="Archived goals"
            description="Read-only goals kept for reference, transfers, and history."
            titleClassName="md:text-5xl"
            descriptionClassName="max-w-xl"
          >
            <div className="flex gap-2 items-center">
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'border-white/10 bg-white/5 text-slate-100 hover:bg-white/10',
                )}
              >
                Back
              </Link>
              <UserMenu user={user} />
            </div>
          </PageHeader>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {goals.length ? (
              goals.map((goal, index) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  index={index}
                  href={`/goals/archived/${goal.id}`}
                />
              ))
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-slate-300">
                No archived goals yet.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
