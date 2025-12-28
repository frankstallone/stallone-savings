import { groupTotalsByGoal } from '@/lib/ledger'
import type {
  Champion,
  Goal,
  GoalSummary,
  GoalTransaction,
  UserSummary,
} from '@/lib/types'

export const sampleUsers: UserSummary[] = [
  {
    id: 'user-owner-one',
    name: 'Owner One',
    email: 'owner.one@example.com',
  },
  {
    id: 'user-owner-two',
    name: 'Owner Two',
    email: 'owner.two@example.com',
  },
]

const [ownerOne, ownerTwo] = sampleUsers
const championsMap: Record<'ownerOne' | 'ownerTwo', Champion> = {
  ownerOne,
  ownerTwo,
}

export const sampleGoals: Goal[] = [
  {
    id: 'goal-retirement',
    slug: 'retirement-fund',
    name: 'Retirement Fund',
    description: 'Long-range retirement runway.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
    coverImageSource: 'unsplash',
    coverImageAttributionName: 'Johannes Plenio',
    coverImageAttributionUrl:
      'https://unsplash.com/@jplenio?utm_source=f4_goal_tracker&utm_medium=referral',
    coverImageId: 'photo-1500530855697-b586d89ba3ee',
    champions: [championsMap.ownerOne],
    targetAmountCents: 1_200_000_00,
  },
  {
    id: 'goal-property',
    slug: 'property-investment',
    name: 'Property Investment',
    description: 'Cash buffer for the next property opportunity.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1600&auto=format&fit=crop',
    coverImageSource: 'unsplash',
    coverImageAttributionName: 'Sasha Matveeva',
    coverImageAttributionUrl:
      'https://unsplash.com/@sasmat?utm_source=f4_goal_tracker&utm_medium=referral',
    coverImageId: 'photo-1489515217757-5fd1be406fef',
    champions: [championsMap.ownerTwo],
    targetAmountCents: 350_000_00,
  },
  {
    id: 'goal-education-fund',
    slug: 'education-fund',
    name: 'Education Fund',
    description: 'Tuition and living expenses.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop',
    coverImageSource: 'unsplash',
    coverImageAttributionName: 'Brooke Cagle',
    coverImageAttributionUrl:
      'https://unsplash.com/@brookecagle?utm_source=f4_goal_tracker&utm_medium=referral',
    coverImageId: 'photo-1522202176988-66273c2fd55f',
    champions: [championsMap.ownerOne, championsMap.ownerTwo],
    targetAmountCents: 180_000_00,
  },
  {
    id: 'goal-mortgage',
    slug: 'housing-buffer',
    name: 'Housing Buffer',
    description: 'Emergency reserve for housing costs.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1600&auto=format&fit=crop',
    coverImageSource: 'unsplash',
    coverImageAttributionName: 'Francesca Tosolini',
    coverImageAttributionUrl:
      'https://unsplash.com/@francesca_tosolini?utm_source=f4_goal_tracker&utm_medium=referral',
    coverImageId: 'photo-1501183638710-841dd1904471',
    champions: [championsMap.ownerTwo],
    targetAmountCents: 60_000_00,
  },
  {
    id: 'goal-vacation',
    slug: 'vacation-fund',
    name: 'Vacation Fund',
    description: 'Family travel, hotels, and long-haul flights.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
    coverImageSource: 'unsplash',
    coverImageAttributionName: 'Johannes Plenio',
    coverImageAttributionUrl:
      'https://unsplash.com/@jplenio?utm_source=f4_goal_tracker&utm_medium=referral',
    coverImageId: 'photo-1500530855697-b586d89ba3ee',
    champions: [championsMap.ownerOne],
    targetAmountCents: 25_000_00,
  },
  {
    id: 'goal-drive-free',
    slug: 'drive-free-fund',
    name: 'Drive Free Fund',
    description: 'Savings to reduce car payments and upgrades.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop',
    coverImageSource: 'unsplash',
    coverImageAttributionName: 'Campbell Boulanger',
    coverImageAttributionUrl:
      'https://unsplash.com/@cboulanger?utm_source=f4_goal_tracker&utm_medium=referral',
    coverImageId: 'photo-1503376780353-7e6692767b70',
    champions: [championsMap.ownerTwo],
    targetAmountCents: 40_000_00,
  },
  {
    id: 'goal-house-work',
    slug: 'house-work',
    name: 'House Work',
    description: 'Renovation projects, contractors, and upkeep.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1481277542470-605612bd2d61?q=80&w=1600&auto=format&fit=crop',
    coverImageSource: 'unsplash',
    coverImageAttributionName: 'R architecture',
    coverImageAttributionUrl:
      'https://unsplash.com/@rarchitecture_melbourne?utm_source=f4_goal_tracker&utm_medium=referral',
    coverImageId: 'photo-1481277542470-605612bd2d61',
    champions: [championsMap.ownerOne, championsMap.ownerTwo],
    targetAmountCents: 75_000_00,
  },
]

export const sampleTransactions: GoalTransaction[] = [
  {
    id: 'txn-1',
    goalId: 'goal-retirement',
    description: 'Family cash transfer',
    amountCents: 4_500_00,
    transactedOn: '2025-08-13',
    createdBy: ownerTwo.name ?? 'Owner Two',
  },
  {
    id: 'txn-2',
    goalId: 'goal-retirement',
    description: 'Trip remainder contribution',
    amountCents: 500_00,
    transactedOn: '2025-08-14',
    createdBy: ownerOne.name ?? 'Owner One',
  },
  {
    id: 'txn-3',
    goalId: 'goal-retirement',
    description: 'Invested in long-term index',
    amountCents: -30_000_00,
    transactedOn: '2025-10-13',
    createdBy: ownerOne.name ?? 'Owner One',
  },
  {
    id: 'txn-4',
    goalId: 'goal-property',
    description: 'Monthly allocation',
    amountCents: 2_000_00,
    transactedOn: '2025-09-01',
    createdBy: ownerTwo.name ?? 'Owner Two',
  },
  {
    id: 'txn-5',
    goalId: 'goal-education-fund',
    description: 'Semester savings',
    amountCents: 5_000_00,
    transactedOn: '2025-08-20',
    createdBy: ownerOne.name ?? 'Owner One',
  },
  {
    id: 'txn-6',
    goalId: 'goal-education-fund',
    description: 'Lab fees',
    amountCents: -850_00,
    transactedOn: '2025-10-01',
    createdBy: ownerTwo.name ?? 'Owner Two',
  },
  {
    id: 'txn-7',
    goalId: 'goal-mortgage',
    description: 'Escrow buffer',
    amountCents: 1_250_00,
    transactedOn: '2025-09-15',
    createdBy: ownerTwo.name ?? 'Owner Two',
  },
  {
    id: 'txn-8',
    goalId: 'goal-vacation',
    description: 'Flight savings',
    amountCents: 1_500_00,
    transactedOn: '2025-08-30',
    createdBy: ownerOne.name ?? 'Owner One',
  },
  {
    id: 'txn-9',
    goalId: 'goal-drive-free',
    description: 'Debt payoff',
    amountCents: 2_500_00,
    transactedOn: '2025-07-10',
    createdBy: ownerTwo.name ?? 'Owner Two',
  },
  {
    id: 'txn-10',
    goalId: 'goal-house-work',
    description: 'Back deck materials',
    amountCents: -3_750_00,
    transactedOn: '2025-09-22',
    createdBy: ownerOne.name ?? 'Owner One',
  },
]

const totalsByGoal = groupTotalsByGoal(
  sampleTransactions.map((transaction) => ({
    goalId: transaction.goalId,
    amountCents: transaction.amountCents,
  })),
)

export const sampleGoalSummaries: GoalSummary[] = sampleGoals.map((goal) => ({
  ...goal,
  balanceCents: totalsByGoal[goal.id] ?? 0,
}))
