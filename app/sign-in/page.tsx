import { redirect } from 'next/navigation'

import { GoogleSignInButton } from '@/components/auth-buttons'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getServerSession } from '@/lib/auth-session'

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: { error?: string }
}) {
  const session = await getServerSession()
  if (session) {
    redirect('/')
  }
  const isUnauthorized = searchParams?.error === 'unauthorized'

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-12">
          <Card className="w-full border-white/10 bg-white/5 text-slate-100">
            <CardHeader className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-slate-400">
                Welcome back
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">
                Sign in to F4 Goal Tracker
              </h1>
              <p className="text-sm text-slate-400">
                Use your Google account to access the goal ledger.
              </p>
            </CardHeader>
            <CardContent>
              {isUnauthorized ? (
                <p className="mb-4 text-sm text-rose-200">
                  This Google account is not authorized to access this app.
                </p>
              ) : null}
              <GoogleSignInButton className="w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
