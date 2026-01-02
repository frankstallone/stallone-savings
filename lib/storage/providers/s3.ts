import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { joinUrl, normalizeStorageKey } from '@/lib/storage/utils'
import type {
  CreateUploadTargetInput,
  StorageAdapter,
} from '@/lib/storage/types'

export type S3AdapterConfig = {
  region: string
  bucket: string
  endpoint?: string
  accessKeyId?: string
  secretAccessKey?: string
  publicUrlBase?: string
  forcePathStyle?: boolean
  uploadUrlTtlSeconds: number
}

function buildPublicUrlBase(config: S3AdapterConfig) {
  if (config.publicUrlBase) {
    return config.publicUrlBase
  }

  if (config.endpoint) {
    return `${config.endpoint.replace(/\/+$/, '')}/${config.bucket}`
  }

  return `https://${config.bucket}.s3.${config.region}.amazonaws.com`
}

function createS3Client(config: S3AdapterConfig) {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials:
      config.accessKeyId && config.secretAccessKey
        ? {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          }
        : undefined,
  })
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

export function createS3Adapter(config: S3AdapterConfig): StorageAdapter {
  const client = createS3Client(config)
  const publicUrlBase = buildPublicUrlBase(config)

  return {
    provider: 's3',
    async createUploadTarget(input) {
      const key = normalizeStorageKey(input.key)
      const expiresAt = new Date(
        Date.now() + config.uploadUrlTtlSeconds * 1000,
      ).toISOString()
      const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        ContentType: input.contentType,
        CacheControl: input.cacheControl,
      })
      const url = await getSignedUrl(client, command, {
        expiresIn: config.uploadUrlTtlSeconds,
      })
      return {
        provider: 's3',
        kind: 'presigned-put',
        key,
        url,
        headers: buildUploadHeaders(input),
        publicUrl: joinUrl(publicUrlBase, key),
        expiresAt,
      }
    },
    getPublicUrl(key) {
      return joinUrl(publicUrlBase, normalizeStorageKey(key))
    },
    async deleteObject(key) {
      await client.send(
        new DeleteObjectCommand({
          Bucket: config.bucket,
          Key: normalizeStorageKey(key),
        }),
      )
    },
  }
}
