import { getServerEnv, requireEnv } from '@/lib/env'

import type { StorageAdapter, StorageProvider } from '@/lib/storage/types'
import {
  createLocalAdapter,
  getLocalStorageConfig,
} from '@/lib/storage/providers/local'
import { createS3Adapter } from '@/lib/storage/providers/s3'
import { createVercelBlobAdapter } from '@/lib/storage/providers/vercel-blob'

const DEFAULT_UPLOAD_URL_TTL_SECONDS = 600

let cachedAdapter: StorageAdapter | null = null

function parseUploadUrlTtlSeconds(value?: string) {
  if (!value) {
    return DEFAULT_UPLOAD_URL_TTL_SECONDS
  }
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid STORAGE_UPLOAD_URL_TTL_SECONDS value: ${value}. Expected a positive integer.`,
    )
  }
  return parsed
}

function parseBoolean(value?: string) {
  if (!value) {
    return false
  }
  return value === '1' || value.toLowerCase() === 'true'
}

const ALLOWED_STORAGE_PROVIDERS: StorageProvider[] = ['s3', 'vercel', 'local']

function getProvider(envProvider?: string): StorageProvider {
  if (!envProvider) {
    return 's3'
  }

  if (ALLOWED_STORAGE_PROVIDERS.includes(envProvider as StorageProvider)) {
    return envProvider as StorageProvider
  }

  throw new Error(
    `Invalid STORAGE_PROVIDER value: ${envProvider}. Expected one of: ${ALLOWED_STORAGE_PROVIDERS.join(
      ', ',
    )}.`,
  )
}

export function getStorageAdapter() {
  if (!cachedAdapter || process.env.NODE_ENV === 'test') {
    const env = getServerEnv()
    const provider = getProvider(env.STORAGE_PROVIDER)
    const uploadUrlTtlSeconds = parseUploadUrlTtlSeconds(
      env.STORAGE_UPLOAD_URL_TTL_SECONDS,
    )

    if (provider === 's3') {
      const accessKeyId = env.S3_ACCESS_KEY_ID
      const secretAccessKey = env.S3_SECRET_ACCESS_KEY
      if (
        (accessKeyId && !secretAccessKey) ||
        (!accessKeyId && secretAccessKey)
      ) {
        throw new Error(
          'S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must be set together.',
        )
      }

      cachedAdapter = createS3Adapter({
        region: requireEnv('S3_REGION'),
        bucket: requireEnv('S3_BUCKET'),
        endpoint: env.S3_ENDPOINT,
        accessKeyId,
        secretAccessKey,
        publicUrlBase: env.S3_PUBLIC_URL_BASE,
        forcePathStyle: parseBoolean(env.S3_FORCE_PATH_STYLE),
        uploadUrlTtlSeconds,
      })
    }

    if (provider === 'vercel') {
      cachedAdapter = createVercelBlobAdapter({
        readWriteToken: requireEnv('BLOB_READ_WRITE_TOKEN'),
        publicUrlBase: env.BLOB_PUBLIC_URL_BASE,
        uploadUrlTtlSeconds,
      })
    }

    if (provider === 'local') {
      const localConfig = getLocalStorageConfig()
      cachedAdapter = createLocalAdapter({
        ...localConfig,
        uploadUrlTtlSeconds,
      })
    }

    if (!cachedAdapter) {
      throw new Error(`Unsupported storage provider: ${provider}`)
    }
  }

  return cachedAdapter
}

export type {
  CreateUploadTargetInput,
  StorageAdapter,
  StorageProvider,
  StorageUploadTarget,
} from '@/lib/storage/types'
