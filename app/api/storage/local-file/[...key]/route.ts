import { promises as fs } from 'node:fs'
import path from 'node:path'

import type { NextRequest } from 'next/server'

import { getServerEnv } from '@/lib/env'
import { DEFAULT_CACHE_CONTROL } from '@/lib/storage/constants'
import {
  getLocalStorageConfig,
  resolveLocalStoragePath,
} from '@/lib/storage/providers/local'
import { normalizeStorageKey } from '@/lib/storage/utils'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ key: string[] }>
}

const contentTypes: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

function getContentType(key: string) {
  const ext = path.extname(key).toLowerCase()
  return contentTypes[ext] ?? 'application/octet-stream'
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const env = getServerEnv()
  if (env.STORAGE_PROVIDER !== 'local') {
    return new Response('Local storage provider is not enabled.', {
      status: 400,
    })
  }

  let key: string
  try {
    const params = await context.params
    key = normalizeStorageKey((params.key ?? []).join('/'))
  } catch (error) {
    return new Response((error as Error).message, { status: 400 })
  }
  const localConfig = getLocalStorageConfig()
  const { resolved } = resolveLocalStoragePath(localConfig.storagePath, key)

  try {
    const file = await fs.readFile(resolved)
    return new Response(file, {
      headers: {
        'Content-Type': getContentType(key),
        'Cache-Control': DEFAULT_CACHE_CONTROL,
      },
    })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return new Response('Not found', { status: 404 })
    }
    throw error
  }
}
