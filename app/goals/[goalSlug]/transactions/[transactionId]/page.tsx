import Link from 'next/link'
import { notFound } from 'next/navigation'

import { updateTransactionAction } from '@/app/goals/[goalSlug]/transactions/actions'
import { DeleteTransactionDialog } from '@/components/delete-transaction-dialog'
import { TransactionForm } from '@/components/transaction-form'
import { buttonVariants } from '@/components/ui/button'
import { UserMenu } from '@/components/user-menu'
import { requireServerSession } from '@/lib/auth-session'
import { getGoalBySlug } from '@/lib/data/goals'
import { getGoalTransactionById } from '@/lib/data/transactions'
import { cn } from '@/lib/utils'

interface EditTransactionPageProps {
  params: Promise<{ goalSlug: string; transactionId: string }>
}

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { goalSlug, transactionId } = await params
  const session = await requireServerSession()
  const goal = await getGoalBySlug(goalSlug)
  if (!goal) {
    notFound()
  }

  const transaction = await getGoalTransactionById(goal.id, transactionId)
  if (!transaction) {
    notFound()
  }

  const direction = transaction.amountCents < 0 ? 'withdrawal' : 'deposit'
  const amountValue = (Math.abs(transaction.amountCents) / 100).toFixed(2)

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute -top-32 left-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative mx-auto w-full max-w-4xl px-6 py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/goals/${goal.slug}`}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'border-white/10 bg-white/5 text-slate-100 hover:bg-white/10',
              )}
            >
              ← Back to goal
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <DeleteTransactionDialog
                goalSlug={goal.slug}
                transactionId={transaction.id}
                description={transaction.description}
              />
              <UserMenu user={session.user} />
            </div>
          </div>

          <section className="mt-8 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">
                Edit transaction
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                Update {goal.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-400">
                Make adjustments to the ledger entry and save the changes.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
              <TransactionForm
                action={updateTransactionAction.bind(
                  null,
                  goal.slug,
                  transaction.id,
                )}
                successRedirect={`/goals/${goal.slug}`}
                successToastKey="transaction-updated"
                cancelHref={`/goals/${goal.slug}`}
                initialValues={{
                  description: transaction.description,
                  amount: amountValue,
                  direction,
                  transactedOn: transaction.transactedOn,
                  createdBy: transaction.createdBy ?? '',
                }}
                submitLabel="Save changes"
                pendingLabel="Saving..."
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
