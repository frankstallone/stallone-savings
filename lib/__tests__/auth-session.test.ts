import { describe, expect, it, vi, beforeEach } from 'vitest'

import { getServerSession, isEmailAllowed } from '@/lib/auth-session'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

describe('getServerSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the session from Better Auth using request headers', async () => {
    const mockHeaders = new Headers()
    vi.mocked(headers).mockResolvedValue(mockHeaders)
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: '1' } })

    const session = await getServerSession()

    expect(headers).toHaveBeenCalledTimes(1)
    expect(auth.api.getSession).toHaveBeenCalledWith({ headers: mockHeaders })
    expect(session).toEqual({ user: { id: '1' } })
  })
})

describe('isEmailAllowed', () => {
  const original = process.env.ALLOWED_EMAILS

  beforeEach(() => {
    if (original === undefined) {
      delete process.env.ALLOWED_EMAILS
    } else {
      process.env.ALLOWED_EMAILS = original
    }
  })

  it('allows any email when the allowlist is empty', () => {
    delete process.env.ALLOWED_EMAILS
    expect(isEmailAllowed('anyone@example.com')).toBe(true)
  })

  it('only allows emails in the allowlist', () => {
    process.env.ALLOWED_EMAILS = 'first@example.com, second@example.com'
    expect(isEmailAllowed('first@example.com')).toBe(true)
    expect(isEmailAllowed('second@example.com')).toBe(true)
    expect(isEmailAllowed('other@example.com')).toBe(false)
  })
})
