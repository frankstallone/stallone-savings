import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  UNSPLASH_ACCESS_KEY: z.string().min(1).optional(),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  ALLOWED_EMAILS: z.string().optional(),
  VERCEL_URL: z.string().optional(),
  STORAGE_PROVIDER: z.enum(['s3', 'vercel', 'local']).optional(),
  STORAGE_UPLOAD_URL_TTL_SECONDS: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL_BASE: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  BLOB_PUBLIC_URL_BASE: z.string().optional(),
  LOCAL_STORAGE_PATH: z.string().optional(),
  LOCAL_STORAGE_PUBLIC_URL_BASE: z.string().optional(),
  LOCAL_STORAGE_UPLOAD_URL_BASE: z.string().optional(),
})

type ServerEnv = z.infer<typeof envSchema>

let cachedEnv: ServerEnv | null = null

function loadEnv(): ServerEnv {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${JSON.stringify(
        parsed.error.flatten().fieldErrors,
      )}`,
    )
  }
  return parsed.data
}

export function getServerEnv() {
  if (!cachedEnv || process.env.NODE_ENV === 'test') {
    cachedEnv = loadEnv()
  }
  return cachedEnv
}

export function requireEnv<Key extends keyof ServerEnv>(
  key: Key,
): NonNullable<ServerEnv[Key]> {
  const value = getServerEnv()[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}
