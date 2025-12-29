'use client'

import * as React from 'react'
import Image from 'next/image'

import { cn } from '@/lib/utils'

const Avatar = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="avatar"
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className,
      )}
      {...props}
    />
  ),
)
Avatar.displayName = 'Avatar'

type AvatarImageProps = Omit<React.ComponentProps<typeof Image>, 'fill'>

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, width = 40, height = 40, alt = '', ...props }, ref) => (
    <Image
      ref={ref as unknown as React.Ref<HTMLImageElement>}
      data-slot="avatar-image"
      width={width}
      height={height}
      alt={alt}
      className={cn('h-full w-full object-cover', className)}
      {...props}
    />
  ),
)
AvatarImage.displayName = 'AvatarImage'

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="avatar-fallback"
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-slate-200',
      className,
    )}
    {...props}
  />
))
AvatarFallback.displayName = 'AvatarFallback'

export { Avatar, AvatarImage, AvatarFallback }
