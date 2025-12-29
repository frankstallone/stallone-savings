'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { formatLongDate, formatSignedCurrencyFromCents } from '@/lib/format'
import type { GoalTransaction } from '@/lib/types'
import { cn } from '@/lib/utils'

const columns: ColumnDef<GoalTransaction>[] = [
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div className="font-medium text-slate-100">
        {row.getValue('description')}
      </div>
    ),
  },
  {
    accessorKey: 'transactedOn',
    header: 'Date',
    cell: ({ row }) => (
      <span className="text-sm text-slate-300">
        {formatLongDate(row.getValue('transactedOn'))}
      </span>
    ),
  },
  {
    accessorKey: 'amountCents',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = row.getValue<number>('amountCents')
      return (
        <span
          className={cn(
            'text-sm font-semibold',
            amount >= 0 ? 'text-emerald-300' : 'text-rose-300',
          )}
        >
          {formatSignedCurrencyFromCents(amount)}
        </span>
      )
    },
  },
  {
    accessorKey: 'createdBy',
    header: 'By',
    cell: ({ row }) => (
      <span className="text-sm text-slate-300">
        {row.getValue('createdBy') || '—'}
      </span>
    ),
  },
]

type GoalTransactionsTableProps = {
  goalSlug: string
  transactions: GoalTransaction[]
}

export function GoalTransactionsTable({
  goalSlug,
  transactions,
}: GoalTransactionsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'transactedOn', desc: true },
  ])
  const router = useRouter()

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: transactions,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Transactions
          </p>
          <h2 className="text-2xl font-semibold">Goal ledger</h2>
        </div>
        <div className="rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-widest text-slate-100">
          {transactions.length} entries
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
        <table className="w-full text-left text-sm text-slate-200">
          <thead className="border-b border-white/10 bg-slate-900/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className="flex items-center gap-2"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {isSorted ? (
                            isSorted === 'asc' ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-slate-500" />
                          )}
                        </button>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-white/10 transition hover:bg-white/5 focus-visible:bg-white/5 last:border-b-0"
                  tabIndex={0}
                  role="link"
                  onClick={() =>
                    router.push(
                      `/goals/${goalSlug}/transactions/${row.original.id}`,
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      router.push(
                        `/goals/${goalSlug}/transactions/${row.original.id}`,
                      )
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-3 ${
                        cell.column.id === 'amountCents' ? 'text-right' : ''
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-sm text-slate-400"
                >
                  No transactions yet. Add your first entry to start tracking.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
