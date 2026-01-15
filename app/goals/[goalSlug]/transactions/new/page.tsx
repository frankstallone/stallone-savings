import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { addTransactionAction } from '@/app/goals/[goalSlug]/transactions/actions'
import { PageHeader } from '@/components/page-header'
import { TransactionForm } from '@/components/transaction-form'
import { buttonVariants } from '@/components/ui/button'
import { UserMenu } from '@/components/user-menu'
import { requireServerSession } from '@/lib/auth-session'
import { getGoalBySlug } from '@/lib/data/goals'
import { getAllowedUsers } from '@/lib/users'
import { cn } from '@/lib/utils'

interface NewTransactionPageProps {
  params: Promise<{ goalSlug: string }>
}

export default async function NewTransactionPage({
  params,
}: NewTransactionPageProps) {
  const { goalSlug } = await params
  const sessionPromise = requireServerSession()
  const goalPromise = getGoalBySlug(goalSlug)
  const userOptionsPromise = getAllowedUsers()
  const [session, goal, userOptions] = await Promise.all([
    sessionPromise,
    goalPromise,
    userOptionsPromise,
  ])
  if (!goal) {
    notFound()
  }
  if (goal.isArchived) {
    redirect(`/goals/${goal.slug}`)
  }
  const user = {
    name: session.user?.name ?? null,
    email: session.user?.email ?? null,
    image: session.user?.image ?? null,
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute -top-32 left-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative mx-auto w-full max-w-4xl px-6 py-12">
          <PageHeader
            title={`Add movement for ${goal.name}`}
            description="Log a deposit or withdrawal to keep the ledger current."
          >
            <div className="flex gap-2 items-center">
              <Link
                href={`/goals/${goal.slug}`}
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
              <TransactionForm
                action={addTransactionAction.bind(null, goal.slug)}
                successRedirect={`/goals/${goal.slug}`}
                successToastKey="transaction-added"
                cancelHref={`/goals/${goal.slug}`}
                userOptions={userOptions}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
