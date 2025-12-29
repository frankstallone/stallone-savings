'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

const TOAST_MESSAGES: Record<string, string> = {
  'goal-deleted': 'Goal deleted.',
  'goal-updated': 'Goal updated.',
  'transaction-added': 'Transaction added.',
  'transaction-updated': 'Transaction updated.',
  'transaction-deleted': 'Transaction deleted.',
}

export function RedirectToast() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const toastKey = searchParams.get('toast')
    if (!toastKey) return

    const message = TOAST_MESSAGES[toastKey]
    if (message) {
      toast.success(message)
    }

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('toast')
    const next = nextParams.toString()
    router.replace(next ? `${pathname}?${next}` : pathname)
  }, [pathname, router, searchParams])

  return null
}
