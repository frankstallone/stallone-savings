import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'F4 Goal Tracker',
  description: 'Goal-based savings tracking for the F4 household.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} dark`}>
      <body className="antialiased font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
