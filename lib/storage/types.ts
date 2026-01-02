export type StorageProvider = 's3' | 'vercel' | 'local'

export type CreateUploadTargetInput = {
  key: string
  contentType: string
  contentLength?: number
  cacheControl?: string
}

export type StorageUploadTarget =
  | {
      provider: 's3'
      kind: 'presigned-put'
      key: string
      url: string
      headers: Record<string, string>
      publicUrl: string
      expiresAt: string
    }
  | {
      provider: 'vercel'
      kind: 'proxy-put'
      key: string
      url: string
      headers: Record<string, string>
      publicUrl: string
      expiresAt: string
    }
  | {
      provider: 'local'
      kind: 'local'
      key: string
      url: string
      headers: Record<string, string>
      publicUrl: string
      expiresAt: string
    }

export type StorageAdapter = {
  provider: StorageProvider
  createUploadTarget(
    input: CreateUploadTargetInput,
  ): Promise<StorageUploadTarget>
  getPublicUrl(key: string): string
  deleteObject(key: string): Promise<void>
}
