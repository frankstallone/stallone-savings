import type { NextConfig } from 'next'
import withPWA from 'next-pwa'

const isDev = process.env.NODE_ENV === 'development'

type ImageRemotePattern = {
  protocol?: 'http' | 'https'
  hostname: string
  port?: string
  pathname?: string
}

const storageRemotePatterns: ImageRemotePattern[] = []
const seenPatterns = new Set<string>()

const addRemotePattern = (pattern: ImageRemotePattern | null) => {
  if (!pattern) return
  const key = `${pattern.protocol ?? ''}://${pattern.hostname}${pattern.port ?? ''}`
  if (seenPatterns.has(key)) return
  seenPatterns.add(key)
  storageRemotePatterns.push(pattern)
}

const urlToPattern = (value?: string): ImageRemotePattern | null => {
  if (!value) return null
  try {
    const parsed = new URL(value)
    const protocol = parsed.protocol.replace(':', '')
    if (protocol !== 'http' && protocol !== 'https') {
      return null
    }
    return {
      protocol,
      hostname: parsed.hostname,
    }
  } catch {
    return null
  }
}

addRemotePattern(urlToPattern(process.env.S3_PUBLIC_URL_BASE))
addRemotePattern(urlToPattern(process.env.S3_ENDPOINT))
addRemotePattern(urlToPattern(process.env.BLOB_PUBLIC_URL_BASE))
addRemotePattern(urlToPattern(process.env.LOCAL_STORAGE_PUBLIC_URL_BASE))

if (
  !process.env.S3_PUBLIC_URL_BASE &&
  process.env.S3_BUCKET &&
  process.env.S3_REGION
) {
  addRemotePattern({
    protocol: 'https',
    hostname: `${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`,
  })
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh5.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh6.googleusercontent.com',
      },
      ...storageRemotePatterns,
    ],
  },
}

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: isDev,
})

export default pwaConfig(nextConfig as NextConfig)
