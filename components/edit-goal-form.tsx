'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import {
  updateGoalAction,
  type UpdateGoalState,
} from '@/app/goals/[goalSlug]/actions'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { Input } from '@/components/ui/input'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import { Textarea } from '@/components/ui/textarea'
import type { Goal, UserSummary } from '@/lib/types'
import { createDebouncer } from '@/lib/debounce'
import { MIN_UNSPLASH_QUERY_LENGTH, shouldSearchUnsplash } from '@/lib/unsplash'
import { getUserLabel } from '@/lib/user-label'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const initialState: UpdateGoalState = { status: 'idle' }

type EditGoalFormProps = {
  goal: Goal
  championOptions: UserSummary[]
  defaultChampionIds?: string[]
  successRedirect?: string
}

export function EditGoalForm({
  goal,
  championOptions,
  defaultChampionIds = [],
  successRedirect,
}: EditGoalFormProps) {
  const router = useRouter()
  const championAnchor = useComboboxAnchor()
  const [champions, setChampions] = React.useState<string[]>(defaultChampionIds)
  const [championQuery, setChampionQuery] = React.useState('')
  const [state, formAction, pending] = React.useActionState(
    updateGoalAction.bind(null, goal.slug),
    initialState,
  )

  const [coverImageUrl, setCoverImageUrl] = React.useState(
    goal.coverImageUrl ?? '',
  )
  const [coverImageSource, setCoverImageSource] = React.useState(
    goal.coverImageSource ?? (goal.coverImageUrl ? 'custom' : ''),
  )
  const [coverImageAttributionName, setCoverImageAttributionName] =
    React.useState(goal.coverImageAttributionName ?? '')
  const [coverImageAttributionUrl, setCoverImageAttributionUrl] =
    React.useState(goal.coverImageAttributionUrl ?? '')
  const [coverImageId, setCoverImageId] = React.useState(
    goal.coverImageId ?? '',
  )
  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<
    Array<{
      id: string
      alt: string
      urls: { small?: string; regular?: string }
      user: { name?: string; username?: string }
      links: { downloadLocation?: string }
    }>
  >([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [searchError, setSearchError] = React.useState<string | null>(null)
  const searchCacheRef = React.useRef<Map<string, typeof searchResults>>(
    new Map(),
  )
  const debouncerRef = React.useRef(createDebouncer(400))
  const abortRef = React.useRef<AbortController | null>(null)
  const championItems = React.useMemo(
    () => championOptions.map((option) => option.id),
    [championOptions],
  )
  const championLabels = React.useMemo(
    () =>
      new Map(
        championOptions.map((option) => [option.id, getUserLabel(option)]),
      ),
    [championOptions],
  )

  React.useEffect(() => {
    if (state.status === 'success') {
      toast.success(state.message ?? 'Goal updated.')
      if (successRedirect) {
        router.push(`${successRedirect}?toast=goal-updated`)
      } else {
        router.refresh()
      }
    }
    if (state.status === 'error' && state.message) {
      toast.error(state.message)
    }
  }, [router, state.message, state.status, successRedirect])

  const runSearch = React.useCallback(async (query: string) => {
    const normalized = query.trim()
    if (!shouldSearchUnsplash(normalized)) {
      return
    }

    const cached = searchCacheRef.current.get(normalized)
    if (cached) {
      setSearchResults(cached)
      setSearchError(null)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsSearching(true)
    setSearchError(null)
    try {
      const response = await fetch(
        `/api/unsplash/search?query=${encodeURIComponent(normalized)}`,
        { signal: controller.signal },
      )
      if (!response.ok) {
        throw new Error('Search failed')
      }
      const data = await response.json()
      const results = data.results ?? []
      searchCacheRef.current.set(normalized, results)
      setSearchResults(results)
    } catch (error) {
      if ((error as { name?: string }).name === 'AbortError') {
        return
      }
      setSearchError('Unable to load Unsplash results. Try again.')
    } finally {
      if (!controller.signal.aborted) {
        setIsSearching(false)
      }
    }
  }, [])

  React.useEffect(() => {
    const debouncer = debouncerRef.current
    debouncer.cancel()

    if (!searchQuery.trim()) {
      setSearchResults([])
      setSearchError(null)
      setIsSearching(false)
      return
    }

    if (!shouldSearchUnsplash(searchQuery)) {
      setSearchError(
        `Type at least ${MIN_UNSPLASH_QUERY_LENGTH} characters to search.`,
      )
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setSearchError(null)
    debouncer.schedule(() => {
      void runSearch(searchQuery)
    })

    return () => {
      debouncer.cancel()
    }
  }, [runSearch, searchQuery])

  const handleSearch = async () => {
    const query = searchQuery.trim()
    if (!shouldSearchUnsplash(query)) return
    await runSearch(query)
  }

  const handleSelectImage = async (photo: {
    id: string
    urls: { regular?: string }
    user: { name?: string; username?: string }
    links: { downloadLocation?: string }
  }) => {
    const utm = 'utm_source=f4_goal_tracker&utm_medium=referral'
    const username = photo.user.username ?? ''
    const attributionUrl = username
      ? `https://unsplash.com/@${username}?${utm}`
      : `https://unsplash.com/?${utm}`

    setCoverImageUrl(photo.urls.regular ?? '')
    setCoverImageSource('unsplash')
    setCoverImageAttributionName(photo.user.name ?? 'Unsplash')
    setCoverImageAttributionUrl(attributionUrl)
    setCoverImageId(photo.id)

    if (photo.links.downloadLocation) {
      void fetch('/api/unsplash/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          downloadLocation: photo.links.downloadLocation,
        }),
      })
    }
  }

  const handleCustomUrl = (value: string) => {
    setCoverImageUrl(value)
    if (!value) {
      setCoverImageSource('')
      setCoverImageAttributionName('')
      setCoverImageAttributionUrl('')
      setCoverImageId('')
      return
    }
    setCoverImageSource('custom')
    setCoverImageAttributionName('')
    setCoverImageAttributionUrl('')
    setCoverImageId('')
  }

  const handleChampionsChange = (nextValues: string[] | null) => {
    setChampions(nextValues ?? [])
    setChampionQuery('')
  }

  const targetAmountValue = goal.targetAmountCents
    ? (goal.targetAmountCents / 100).toFixed(2)
    : ''

  return (
    <Form action={formAction} className="space-y-6">
      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="name">Goal name</FieldLabel>
          <FieldContent>
            <Input
              id="name"
              name="name"
              placeholder="Education Fund"
              className={cn(
                'bg-white/5',
                state.fieldErrors?.name && 'border-rose-400',
              )}
              defaultValue={goal.name}
              required
            />
            <FieldError>{state.fieldErrors?.name}</FieldError>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="targetAmount">Target amount</FieldLabel>
          <FieldContent>
            <InputGroup
              className={cn(
                'bg-white/5',
                state.fieldErrors?.targetAmount && 'border-rose-400',
              )}
            >
              <InputGroupAddon align="inline-start">
                <InputGroupText>$</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="targetAmount"
                name="targetAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={targetAmountValue}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>USD</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <FieldError>{state.fieldErrors?.targetAmount}</FieldError>
          </FieldContent>
        </Field>
      </FieldGroup>

      <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <FieldContent>
          <Textarea
            id="description"
            name="description"
            placeholder="What is this goal for?"
            className={cn(
              'min-h-[120px] bg-white/5',
              state.fieldErrors?.description && 'border-rose-400',
            )}
            defaultValue={goal.description ?? ''}
          />
          <FieldError>{state.fieldErrors?.description}</FieldError>
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>Cover image</FieldLabel>
        <FieldContent>
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-300">
                  Search Unsplash for a cover image.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 bg-white/5 text-slate-100"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? 'Searching…' : 'Search'}
                </Button>
              </div>
              <Input
                id="coverImageSearch"
                placeholder="Search Unsplash"
                className="bg-white/5"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              {searchError ? (
                <p className="text-sm text-amber-300">{searchError}</p>
              ) : null}
            </div>

            {searchResults.length ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {searchResults.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => handleSelectImage(photo)}
                    className={cn(
                      'group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition hover:border-white/20',
                      coverImageId === photo.id && 'ring-2 ring-emerald-400/40',
                    )}
                  >
                    {photo.urls?.small ? (
                      <Image
                        src={photo.urls.small}
                        alt={photo.alt}
                        width={320}
                        height={200}
                        className="h-32 w-full object-cover"
                      />
                    ) : null}
                    <div className="p-3 text-xs text-slate-300">
                      {photo.user?.name ?? 'Unsplash'}
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            {coverImageUrl ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Selected cover image
                </p>
                <div className="mt-3 overflow-hidden rounded-xl">
                  <Image
                    src={coverImageUrl}
                    alt={goal.name}
                    width={700}
                    height={400}
                    className="h-48 w-full object-cover"
                  />
                </div>
                {coverImageSource === 'unsplash' ? (
                  <p className="mt-2 text-sm text-slate-200">
                    Photo by{' '}
                    <a
                      href={coverImageAttributionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4"
                    >
                      {coverImageAttributionName}
                    </a>{' '}
                    on{' '}
                    <a
                      href={`https://unsplash.com/?utm_source=f4_goal_tracker&utm_medium=referral`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4"
                    >
                      Unsplash
                    </a>
                    .
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-slate-200">
                    Custom image selected.
                  </p>
                )}
              </div>
            ) : null}

            <div className="space-y-2">
              <FieldLabel htmlFor="coverImageCustomUrl">
                Custom image URL (optional)
              </FieldLabel>
              <Input
                id="coverImageCustomUrl"
                placeholder="https://images.unsplash.com/..."
                className="bg-white/5"
                value={coverImageSource === 'custom' ? coverImageUrl : ''}
                onChange={(event) => handleCustomUrl(event.target.value)}
              />
            </div>
          </div>
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="champions">Champions</FieldLabel>
        <FieldContent>
          <Combobox
            multiple
            value={champions}
            onValueChange={handleChampionsChange}
            inputValue={championQuery}
            onInputValueChange={setChampionQuery}
            items={championItems}
          >
            <ComboboxChips ref={championAnchor} aria-label="Champions">
              {champions.map((championId) => (
                <ComboboxChip key={championId}>
                  {championLabels.get(championId) ?? 'Unknown'}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                id="champions"
                placeholder={
                  championOptions.length
                    ? 'Select champions...'
                    : 'No champions available'
                }
                disabled={!championOptions.length}
              />
            </ComboboxChips>
            <ComboboxContent anchor={championAnchor}>
              <ComboboxEmpty>No matches found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {championLabels.get(item) ?? 'Unknown'}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <input type="hidden" name="champions" value={champions.join(',')} />
        </FieldContent>
      </Field>

      <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
      <input type="hidden" name="coverImageSource" value={coverImageSource} />
      <input
        type="hidden"
        name="coverImageAttributionName"
        value={coverImageAttributionName}
      />
      <input
        type="hidden"
        name="coverImageAttributionUrl"
        value={coverImageAttributionUrl}
      />
      <input type="hidden" name="coverImageId" value={coverImageId} />

      {state.message ? (
        <p
          className={cn(
            'text-sm',
            state.status === 'success' ? 'text-emerald-300' : 'text-rose-300',
          )}
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </Form>
  )
}
