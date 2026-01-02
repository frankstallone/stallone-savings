import crypto from 'node:crypto'

import { NextResponse } from 'next/server'

import { getAuthorizedSession } from '@/lib/auth-session'
import {
  ALLOWED_IMAGE_CONTENT_TYPES,
  DEFAULT_CACHE_CONTROL,
  MAX_UPLOAD_BYTES,
} from '@/lib/storage/constants'
import { getStorageAdapter } from '@/lib/storage'

export const runtime = 'nodejs'

const contentTypeToExtension: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

export async function POST(request: Request) {
  const session = await getAuthorizedSession()
  if (!session) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    )
  }

  if (!payload || typeof payload !== 'object') {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    )
  }

  const { contentType, contentLength } = payload as {
    contentType?: string
    contentLength?: number
  }

  if (!contentType || typeof contentType !== 'string') {
    return NextResponse.json(
      { error: 'contentType is required.' },
      { status: 400 },
    )
  }

  const normalizedContentType = contentType.toLowerCase()
  if (
    !ALLOWED_IMAGE_CONTENT_TYPES.includes(
      normalizedContentType as (typeof ALLOWED_IMAGE_CONTENT_TYPES)[number],
    )
  ) {
    return NextResponse.json(
      { error: 'Unsupported image type.' },
      { status: 400 },
    )
  }

  if (
    typeof contentLength !== 'number' ||
    Number.isNaN(contentLength) ||
    contentLength <= 0
  ) {
    return NextResponse.json(
      { error: 'contentLength must be provided.' },
      { status: 400 },
    )
  }

  if (contentLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'Image is too large.' }, { status: 400 })
  }

  const extension = contentTypeToExtension[normalizedContentType]
  const key = `goals/covers/${crypto.randomUUID()}.${extension}`

  const adapter = getStorageAdapter()
  const target = await adapter.createUploadTarget({
    key,
    contentType: normalizedContentType,
    contentLength,
    cacheControl: DEFAULT_CACHE_CONTROL,
  })

  return NextResponse.json({ target })
}
