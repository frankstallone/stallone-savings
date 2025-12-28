import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrencyFromCents } from '@/lib/format'
import type { GoalSummary } from '@/lib/types'
import { cn } from '@/lib/utils'

const FALLBACK_GRADIENTS = [
  'from-emerald-500/30 via-emerald-500/10 to-transparent',
  'from-sky-500/30 via-sky-500/10 to-transparent',
  'from-amber-500/30 via-amber-500/10 to-transparent',
  'from-rose-500/30 via-rose-500/10 to-transparent',
  'from-indigo-500/30 via-indigo-500/10 to-transparent',
]

type GoalCardProps = {
  goal: GoalSummary
  index: number
}

export function GoalCard({ goal, index }: GoalCardProps) {
  const gradient = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length]

  return (
    <Card className="group relative h-full overflow-hidden border-white/10 bg-slate-900/60 text-slate-100 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)]">
      <Link
        href={`/goals/${goal.slug}`}
        aria-label={`View ${goal.name}`}
        className="absolute inset-0 z-10"
      />
      <div className="absolute inset-0">
        {goal.coverImageUrl ? (
          <Image
            src={goal.coverImageUrl}
            alt={`${goal.name} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover opacity-70 transition duration-700 group-hover:scale-105"
          />
        ) : null}
        <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.15),rgba(15,23,42,0.65)_45%,rgba(15,23,42,0.9))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_60%)]" />
      </div>
      <div className="relative z-20 pointer-events-none">
        <div className="h-40 w-full" />
        <CardHeader className="space-y-2 px-6 pb-2 pt-2">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Goal
          </p>
          <CardTitle className="text-2xl font-semibold leading-tight tracking-tight text-white">
            {goal.name}
          </CardTitle>
          {goal.description ? (
            <CardDescription className="text-sm leading-relaxed text-slate-300">
              {goal.description}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-4 pt-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Balance
            </p>
            <p className="text-3xl font-semibold text-white">
              {formatCurrencyFromCents(goal.balanceCents)}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center gap-2 px-6 pb-5 pt-2">
          {goal.champions.length ? (
            goal.champions.map((champion) => (
              <Badge
                key={champion}
                variant="secondary"
                className="bg-white/10 text-white"
              >
                {champion}
              </Badge>
            ))
          ) : (
            <Badge variant="secondary" className="bg-white/10 text-white">
              Shared Goal
            </Badge>
          )}
          {goal.coverImageAttributionName ? (
            <span className="text-xs text-slate-400">
              Photo by {goal.coverImageAttributionName}
            </span>
          ) : null}
          <Badge variant="secondary" className="ml-auto bg-white/10 text-white">
            View
          </Badge>
        </CardFooter>
      </div>
    </Card>
  )
}
