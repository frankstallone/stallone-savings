import { del } from '@vercel/blob'

import { joinUrl, normalizeStorageKey } from '@/lib/storage/utils'
import type {
  CreateUploadTargetInput,
  StorageAdapter,
} from '@/lib/storage/types'

export type VercelBlobAdapterConfig = {
  readWriteToken: string
  publicUrlBase?: string
  uploadUrlBase?: string
  uploadUrlTtlSeconds: number
}

function buildUploadHeaders(input: CreateUploadTargetInput) {
  const headers: Record<string, string> = {
    'Content-Type': input.contentType,
  }
  if (input.cacheControl) {
    headers['Cache-Control'] = input.cacheControl
  }
  return headers
}

export function createVercelBlobAdapter(
  config: VercelBlobAdapterConfig,
): StorageAdapter {
  const uploadUrlBase = config.uploadUrlBase ?? '/api/storage/vercel-upload'

  return {
    provider: 'vercel',
    async createUploadTarget(input: CreateUploadTargetInput) {
      const key = normalizeStorageKey(input.key)
      if (!config.publicUrlBase) {
        throw new Error(
          'BLOB_PUBLIC_URL_BASE is required to compute public blob URLs.',
        )
      }
      return {
        provider: 'vercel',
        kind: 'proxy-put',
        key,
        url: joinUrl(uploadUrlBase, key),
        headers: buildUploadHeaders(input),
        publicUrl: joinUrl(config.publicUrlBase, normalizeStorageKey(key)),
        expiresAt: new Date(
          Date.now() + config.uploadUrlTtlSeconds * 1000,
        ).toISOString(),
      }
    },
    getPublicUrl(key) {
      if (!config.publicUrlBase) {
        throw new Error(
          'BLOB_PUBLIC_URL_BASE is required to compute public blob URLs.',
        )
      }
      return joinUrl(config.publicUrlBase, normalizeStorageKey(key))
    },
    async deleteObject(key) {
      await del(normalizeStorageKey(key), { token: config.readWriteToken })
    },
  }
}
