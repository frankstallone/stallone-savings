export const ALLOWED_IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export const DEFAULT_CACHE_CONTROL = 'public, max-age=31536000, immutable'
