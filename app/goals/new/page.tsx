import Link from 'next/link'

import { NewGoalForm } from '@/components/new-goal-form'
import { UserMenu } from '@/components/user-menu'
import { buttonVariants } from '@/components/ui/button'
import { requireServerSession } from '@/lib/auth-session'
import { getAllowedUsers } from '@/lib/users'
import { cn } from '@/lib/utils'

export default async function NewGoalPage() {
  const session = await requireServerSession()
  const championOptions = await getAllowedUsers()
  const defaultChampionIds = session?.user?.id ? [session.user.id] : []
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute -top-32 left-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative mx-auto w-full max-w-4xl px-6 py-12">
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
            <UserMenu user={session.user} />
          </div>

          <section className="mt-8 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">
                New goal
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                Create a savings goal
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-400">
                Set up a new bucket and attach a target, champions, and a cover
                image. You can wire in Unsplash search once we add the picker.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
              <NewGoalForm
                championOptions={championOptions}
                defaultChampionIds={defaultChampionIds}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
