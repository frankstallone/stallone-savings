import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { resolveLocalStoragePath } from '@/lib/storage/providers/local'
import { joinUrl, normalizeStorageKey } from '@/lib/storage/utils'

describe('normalizeStorageKey', () => {
  it('normalizes leading slashes and backslashes', () => {
    expect(normalizeStorageKey('/covers/hero.jpg')).toBe('covers/hero.jpg')
    expect(normalizeStorageKey('covers\\hero.jpg')).toBe('covers/hero.jpg')
  })

  it('rejects invalid path segments', () => {
    expect(() => normalizeStorageKey('../secret')).toThrow()
    expect(() => normalizeStorageKey('covers/../secret')).toThrow()
    expect(() => normalizeStorageKey('./secret')).toThrow()
  })
})

describe('joinUrl', () => {
  it('joins base urls and encodes segments', () => {
    expect(joinUrl('https://cdn.example.com', 'covers/my file.jpg')).toBe(
      'https://cdn.example.com/covers/my%20file.jpg',
    )
  })

  it('returns encoded key when base is empty', () => {
    expect(joinUrl('', 'covers/my file.jpg')).toBe('covers/my%20file.jpg')
  })
})

describe('resolveLocalStoragePath', () => {
  it('resolves to a path under the local storage root', () => {
    const storagePath = '.local-uploads'
    const key = 'covers/hero.jpg'
    const { root, resolved } = resolveLocalStoragePath(storagePath, key)

    expect(root).toBe(path.resolve(process.cwd(), storagePath))
    expect(resolved).toBe(path.resolve(root, key))
  })

  it('rejects traversal outside the storage root', () => {
    expect(() =>
      resolveLocalStoragePath('.local-uploads', '../secret.jpg'),
    ).toThrow()
  })
})
