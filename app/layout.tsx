import type { Metadata, Viewport } from 'next'
import { DM_Sans } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://f4-goal-tracker.vercel.app')

const description =
  'Track goal-based savings with deposits, withdrawals, and archived history.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'F4 Goal Tracker',
    template: '%s · F4 Goal Tracker',
  },
  description,
  applicationName: 'F4 Goal Tracker',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'F4 Goal Tracker',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'F4 Goal Tracker',
    description,
    siteName: 'F4 Goal Tracker',
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'F4 Goal Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'F4 Goal Tracker',
    description,
    images: ['/icons/icon-512.png'],
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      {
        url: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#020617',
  viewportFit: 'cover',
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
