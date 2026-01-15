import Link from 'next/link'

import { NewGoalForm } from '@/components/new-goal-form'
import { PageHeader } from '@/components/page-header'
import { UserMenu } from '@/components/user-menu'
import { buttonVariants } from '@/components/ui/button'
import { requireServerSession } from '@/lib/auth-session'
import { getAllowedUsers } from '@/lib/users'
import { cn } from '@/lib/utils'

export default async function NewGoalPage() {
  const sessionPromise = requireServerSession()
  const championOptionsPromise = getAllowedUsers()
  const [session, championOptions] = await Promise.all([
    sessionPromise,
    championOptionsPromise,
  ])
  const defaultChampionIds = session?.user?.id ? [session.user.id] : []
  const user = {
    name: session.user?.name ?? null,
    email: session.user?.email ?? null,
    image: session.user?.image ?? null,
  }
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute -top-32 left-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative mx-auto w-full max-w-4xl px-6 py-12">
          <PageHeader
            title="Create a savings goal"
            description="Set up a new bucket and attach a target, champions, and a cover image from Unsplash or your own upload."
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

          <section className="mt-8">
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
