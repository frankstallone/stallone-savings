import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: ReactNode
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import { GoalEmptyState } from '@/components/goal-empty-state'

describe('GoalEmptyState', () => {
  it('renders the empty state messaging and CTA', () => {
    const markup = renderToStaticMarkup(<GoalEmptyState />)

    expect(markup).toContain('No goals yet')
    expect(markup).toContain('Add your first goal')
  })
})
