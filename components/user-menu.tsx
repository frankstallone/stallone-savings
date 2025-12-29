'use client'

import * as React from 'react'

import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type UserMenuUser = {
  name?: string | null
  email?: string | null
  image?: string | null
}

type UserMenuProps = {
  user: UserMenuUser
  className?: string
}

const getInitials = (user: UserMenuUser) => {
  if (user.name) {
    const parts = user.name.trim().split(/\s+/)
    const first = parts[0]?.[0] ?? ''
    const second = parts[1]?.[0] ?? ''
    return `${first}${second}`.toUpperCase() || 'U'
  }
  if (user.email) {
    return user.email.slice(0, 2).toUpperCase()
  }
  return 'U'
}

export function UserMenu({ user, className }: UserMenuProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await authClient.signOut()
      window.location.assign('/sign-in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
              className,
            )}
            aria-label="Open user menu"
          />
        }
      >
        <Avatar className="h-9 w-9">
          {user.image ? (
            <AvatarImage src={user.image} alt={user.name ?? 'User avatar'} />
          ) : null}
          <AvatarFallback>{getInitials(user)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 border-white/10 bg-slate-950 text-slate-100"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled
            className="flex flex-col items-start gap-0.5 text-left"
          >
            <span className="text-sm font-semibold text-slate-100">
              {user.name ?? 'Account'}
            </span>
            <span className="text-xs text-slate-400">{user.email ?? ''}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleSignOut}
          disabled={isLoading}
        >
          {isLoading ? 'Signing out…' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
