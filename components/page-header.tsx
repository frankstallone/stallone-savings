import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}

export function PageHeader({
  title,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col-reverse gap-6 lg:flex-row lg:items-start lg:justify-between',
        className,
      )}
    >
      <div className="space-y-3">
        <h1
          className={cn(
            'text-4xl font-semibold tracking-tight',
            titleClassName,
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              'max-w-2xl text-sm text-slate-400',
              descriptionClassName,
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {children ? (
        <div className="flex flex-wrap items-center justify-end gap-4">
          {children}
        </div>
      ) : null}
    </header>
  )
}
