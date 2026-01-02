import { promises as fs } from 'node:fs'
import path from 'node:path'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getAuthorizedSession } from '@/lib/auth-session'
import { getServerEnv } from '@/lib/env'
import {
  getLocalStorageConfig,
  resolveLocalStoragePath,
} from '@/lib/storage/providers/local'
import {
  ALLOWED_IMAGE_CONTENT_TYPES,
  MAX_UPLOAD_BYTES,
} from '@/lib/storage/constants'
import { joinUrl, normalizeStorageKey } from '@/lib/storage/utils'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ key: string[] }>
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await getAuthorizedSession()
  if (!session) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  }

  const env = getServerEnv()
  if (env.STORAGE_PROVIDER !== 'local') {
    return NextResponse.json(
      { error: 'Local storage provider is not enabled.' },
      { status: 400 },
    )
  }

  let key: string
  try {
    const params = await context.params
    key = normalizeStorageKey((params.key ?? []).join('/'))
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    )
  }
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? ''
  const isAllowedType = ALLOWED_IMAGE_CONTENT_TYPES.includes(
    contentType as (typeof ALLOWED_IMAGE_CONTENT_TYPES)[number],
  )
  if (!contentType || !isAllowedType) {
    return NextResponse.json(
      { error: 'Unsupported file type.' },
      { status: 400 },
    )
  }

  const localConfig = getLocalStorageConfig()
  const { resolved } = resolveLocalStoragePath(localConfig.storagePath, key)
  await fs.mkdir(path.dirname(resolved), { recursive: true })

  const body = await request.arrayBuffer()
  if (body.byteLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'Image is too large.' }, { status: 400 })
  }
  await fs.writeFile(resolved, new Uint8Array(body))

  return NextResponse.json({
    key,
    publicUrl: joinUrl(localConfig.publicUrlBase, key),
  })
}
