export function normalizeStorageKey(input: string) {
  const trimmed = input.trim().replace(/^\/+/, '').replace(/\\/g, '/')
  if (!trimmed) {
    throw new Error('Storage key is required')
  }

  const segments = trimmed.split('/')
  if (segments.some((segment) => segment === '.' || segment === '..')) {
    throw new Error('Storage key contains invalid path segments')
  }

  return trimmed
}

export function encodeStorageKey(key: string) {
  return key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

export function joinUrl(base: string, key: string) {
  if (!base) {
    return encodeStorageKey(key)
  }
  const trimmedBase = base.replace(/\/+$/, '')
  return `${trimmedBase}/${encodeStorageKey(key)}`
}
