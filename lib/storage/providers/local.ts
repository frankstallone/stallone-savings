import { promises as fs } from 'node:fs'
import path from 'node:path'

import { getServerEnv } from '@/lib/env'
import { joinUrl, normalizeStorageKey } from '@/lib/storage/utils'
import type {
  CreateUploadTargetInput,
  StorageAdapter,
} from '@/lib/storage/types'

export type LocalAdapterConfig = {
  storagePath: string
  publicUrlBase: string
  uploadUrlBase: string
  uploadUrlTtlSeconds: number
}

export function getLocalStorageConfig(): Omit<
  LocalAdapterConfig,
  'uploadUrlTtlSeconds'
> {
  const env = getServerEnv()
  return {
    storagePath: env.LOCAL_STORAGE_PATH ?? '.local-uploads',
    publicUrlBase:
      env.LOCAL_STORAGE_PUBLIC_URL_BASE ?? '/api/storage/local-file',
    uploadUrlBase:
      env.LOCAL_STORAGE_UPLOAD_URL_BASE ?? '/api/storage/local-upload',
  }
}

export function resolveLocalStoragePath(storagePath: string, key: string) {
  const normalizedKey = normalizeStorageKey(key)
  const root = path.resolve(process.cwd(), storagePath)
  const resolved = path.resolve(root, normalizedKey)
  if (!resolved.startsWith(`${root}${path.sep}`) && resolved !== root) {
    throw new Error('Storage key resolves outside local storage path')
  }
  return { root, resolved }
}

export async function deleteLocalObject(storagePath: string, key: string) {
  const { resolved } = resolveLocalStoragePath(storagePath, key)
  try {
    await fs.unlink(resolved)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
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

export function createLocalAdapter(config: LocalAdapterConfig): StorageAdapter {
  return {
    provider: 'local',
    async createUploadTarget(input) {
      const key = normalizeStorageKey(input.key)
      return {
        provider: 'local',
        kind: 'local',
        key,
        url: joinUrl(config.uploadUrlBase, key),
        headers: buildUploadHeaders(input),
        publicUrl: joinUrl(config.publicUrlBase, key),
        expiresAt: new Date(
          Date.now() + config.uploadUrlTtlSeconds * 1000,
        ).toISOString(),
      }
    },
    getPublicUrl(key) {
      return joinUrl(config.publicUrlBase, normalizeStorageKey(key))
    },
    async deleteObject(key) {
      await deleteLocalObject(config.storagePath, key)
    },
  }
}
