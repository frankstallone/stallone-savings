import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { Pool } from 'pg'

import { getServerEnv, requireEnv } from '@/lib/env'

const env = getServerEnv()
const baseURL =
  env.BETTER_AUTH_URL ??
  (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : 'http://localhost:3000')
const isProd = process.env.NODE_ENV === 'production'

export const auth = betterAuth({
  baseURL,
  secret: requireEnv('BETTER_AUTH_SECRET'),
  database: new Pool({
    connectionString: requireEnv('DATABASE_URL'),
  }),
  plugins: [nextCookies()],
  socialProviders: {
    google: {
      clientId: requireEnv('GOOGLE_CLIENT_ID'),
      clientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
    },
  },
  advanced: {
    useSecureCookies: isProd,
    trustedOrigins: [baseURL],
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip'],
    },
  },
})
