import Link from 'next/link'
import { SparklesIcon, PlusIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function GoalEmptyState() {
  return (
    <Card className="col-span-full border-white/10 bg-white/5 text-slate-100 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)]">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-400">
            <SparklesIcon className="h-3.5 w-3.5" />
            Ready to start
          </div>
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight text-white">
          No goals yet
        </CardTitle>
        <CardDescription className="max-w-2xl text-sm text-slate-300">
          Create your first savings bucket to track deposits, withdrawals, and
          progress toward a shared goal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-slate-400">
        <p>
          Each goal gets a ledger, champions, and a balance so you always know
          where the money should land.
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Get started
        </p>
        <Link
          href="/goals/new"
          className={cn(buttonVariants({ variant: 'default' }), 'gap-2')}
        >
          <PlusIcon className="h-4 w-4" />
          Add your first goal
        </Link>
      </CardFooter>
    </Card>
  )
}
