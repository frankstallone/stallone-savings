import { describe, expect, it } from 'vitest'

import { normalizeGoalPayload, slugifyGoalName } from '@/lib/goals'

describe('normalizeGoalPayload', () => {
  it('returns errors when name is missing', () => {
    const result = normalizeGoalPayload({ name: ' ' })

    expect(result.errors).toMatchObject({
      name: 'Enter a goal name.',
    })
  })

  it('normalizes goal payloads', () => {
    const result = normalizeGoalPayload({
      name: 'Education Fund',
      description: ' Tuition ',
      targetAmount: '1000',
      coverImageUrl: 'https://example.com/cover.jpg',
      coverImageSource: 'unsplash',
      coverImageAttributionName: 'Sample Photographer',
      coverImageAttributionUrl:
        'https://unsplash.com/@ava?utm_source=f4_goal_tracker&utm_medium=referral',
      coverImageId: 'photo-ava',
      champions: 'Owner One, Owner Two',
    })

    expect(result.data).toEqual({
      name: 'Education Fund',
      description: 'Tuition',
      targetAmountCents: 100000,
      coverImageUrl: 'https://example.com/cover.jpg',
      coverImageSource: 'unsplash',
      coverImageAttributionName: 'Sample Photographer',
      coverImageAttributionUrl:
        'https://unsplash.com/@ava?utm_source=f4_goal_tracker&utm_medium=referral',
      coverImageId: 'photo-ava',
      champions: ['Owner One', 'Owner Two'],
    })
  })

  it('validates target amount', () => {
    const result = normalizeGoalPayload({
      name: 'House',
      targetAmount: '-20',
    })

    expect(result.errors).toMatchObject({
      targetAmount: 'Enter a positive target amount.',
    })
  })

  it('normalizes empty optional fields', () => {
    const result = normalizeGoalPayload({
      name: 'Vacation',
      description: '',
      targetAmount: '',
      coverImageUrl: '',
      coverImageSource: '',
      coverImageAttributionName: '',
      coverImageAttributionUrl: '',
      coverImageId: '',
      champions: '',
    })

    expect(result.data).toEqual({
      name: 'Vacation',
      description: null,
      targetAmountCents: null,
      coverImageUrl: null,
      coverImageSource: null,
      coverImageAttributionName: null,
      coverImageAttributionUrl: null,
      coverImageId: null,
      champions: [],
    })
  })
})

describe('slugifyGoalName', () => {
  it('creates URL-safe slugs', () => {
    expect(slugifyGoalName('Education Fund!')).toBe('education-fund')
  })

  it('falls back when slug is empty', () => {
    expect(slugifyGoalName('!!!')).toBe('goal')
  })
})
