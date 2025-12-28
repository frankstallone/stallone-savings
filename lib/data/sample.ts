import { groupTotalsByGoal } from '@/lib/ledger'
import type { Goal, GoalSummary, GoalTransaction } from '@/lib/types'

export const sampleGoals: Goal[] = [
  {
    id: 'goal-retirement',
    slug: 'retirement-fund',
    name: 'Retirement Fund',
    description: 'Long-range retirement runway for Owner One.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
    champions: ['Owner One'],
    targetAmountCents: 1_200_000_00,
  },
  {
    id: 'goal-property',
    slug: 'property-investment',
    name: 'Property Investment',
    description: 'Cash buffer for the next property opportunity.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1600&auto=format&fit=crop',
    champions: ['Owner Two'],
    targetAmountCents: 350_000_00,
  },
  {
    id: 'goal-education-fund',
    slug: 'education-fund',
    name: 'Education Fund',
    description: 'Tuition and living expenses for Student.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop',
    champions: ['Owner Two', 'Owner One'],
    targetAmountCents: 180_000_00,
  },
  {
    id: 'goal-mortgage',
    slug: 'mortgage-backup',
    name: 'Mortgage Backup',
    description: 'Emergency reserve for the mortgage and escrow.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1600&auto=format&fit=crop',
    champions: ['Owner Two'],
    targetAmountCents: 60_000_00,
  },
  {
    id: 'goal-vacation',
    slug: 'vacation-fund',
    name: 'Vacation Fund',
    description: 'Family travel, hotels, and long-haul flights.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
    champions: ['Owner One'],
    targetAmountCents: 25_000_00,
  },
  {
    id: 'goal-drive-free',
    slug: 'drive-free-fund',
    name: 'Drive Free Fund',
    description: 'Savings to reduce car payments and upgrades.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop',
    champions: ['Owner Two'],
    targetAmountCents: 40_000_00,
  },
  {
    id: 'goal-house-work',
    slug: 'house-work',
    name: 'House Work',
    description: 'Renovation projects, contractors, and upkeep.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1481277542470-605612bd2d61?q=80&w=1600&auto=format&fit=crop',
    champions: ['Owner Two', 'Owner One'],
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
    createdBy: 'Owner Two',
  },
  {
    id: 'txn-2',
    goalId: 'goal-retirement',
    description: 'Trip remainder contribution',
    amountCents: 500_00,
    transactedOn: '2025-08-14',
    createdBy: 'Owner One',
  },
  {
    id: 'txn-3',
    goalId: 'goal-retirement',
    description: 'Invested in long-term index',
    amountCents: -30_000_00,
    transactedOn: '2025-10-13',
    createdBy: 'Owner One',
  },
  {
    id: 'txn-4',
    goalId: 'goal-property',
    description: 'Monthly allocation',
    amountCents: 2_000_00,
    transactedOn: '2025-09-01',
    createdBy: 'Owner Two',
  },
  {
    id: 'txn-5',
    goalId: 'goal-education-fund',
    description: 'Semester savings',
    amountCents: 5_000_00,
    transactedOn: '2025-08-20',
    createdBy: 'Owner One',
  },
  {
    id: 'txn-6',
    goalId: 'goal-education-fund',
    description: 'Lab fees',
    amountCents: -850_00,
    transactedOn: '2025-10-01',
    createdBy: 'Owner Two',
  },
  {
    id: 'txn-7',
    goalId: 'goal-mortgage',
    description: 'Escrow buffer',
    amountCents: 1_250_00,
    transactedOn: '2025-09-15',
    createdBy: 'Owner Two',
  },
  {
    id: 'txn-8',
    goalId: 'goal-vacation',
    description: 'Flight savings',
    amountCents: 1_500_00,
    transactedOn: '2025-08-30',
    createdBy: 'Owner One',
  },
  {
    id: 'txn-9',
    goalId: 'goal-drive-free',
    description: 'Debt payoff',
    amountCents: 2_500_00,
    transactedOn: '2025-07-10',
    createdBy: 'Owner Two',
  },
  {
    id: 'txn-10',
    goalId: 'goal-house-work',
    description: 'Back deck materials',
    amountCents: -3_750_00,
    transactedOn: '2025-09-22',
    createdBy: 'Owner One',
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
