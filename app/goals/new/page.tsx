import Link from 'next/link'

import { NewGoalForm } from '@/components/new-goal-form'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NewGoalPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute -top-32 left-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative mx-auto w-full max-w-4xl px-6 py-12">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'border-white/10 bg-white/5 text-slate-100 hover:bg-white/10',
            )}
          >
            ← Back to goals
          </Link>

          <section className="mt-8 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
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
              <NewGoalForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
