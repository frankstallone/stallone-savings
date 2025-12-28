"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { formatLongDate, formatSignedCurrencyFromCents } from "@/lib/format"
import type { GoalTransaction } from "@/lib/types"
import { cn } from "@/lib/utils"

const columns: ColumnDef<GoalTransaction>[] = [
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="font-medium text-slate-900">
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "transactedOn",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm text-slate-700">
        {formatLongDate(row.getValue("transactedOn"))}
      </span>
    ),
  },
  {
    accessorKey: "amountCents",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue<number>("amountCents")
      return (
        <span
          className={cn(
            "text-sm font-semibold",
            amount >= 0 ? "text-emerald-700" : "text-rose-700"
          )}
        >
          {formatSignedCurrencyFromCents(amount)}
        </span>
      )
    },
  },
  {
    accessorKey: "createdBy",
    header: "By",
    cell: ({ row }) => (
      <span className="text-sm text-slate-700">
        {row.getValue("createdBy") || "—"}
      </span>
    ),
  },
]

type GoalTransactionsTableProps = {
  transactions: GoalTransaction[]
}

export function GoalTransactionsTable({ transactions }: GoalTransactionsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "transactedOn", desc: true },
  ])

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
    <div className="rounded-3xl border border-[#e7d8c4] bg-[#f6e9d7] p-6 text-slate-900 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.6)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Transactions
          </p>
          <h2 className="text-2xl font-semibold">Goal ledger</h2>
        </div>
        <div className="rounded-full bg-slate-900/90 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-100">
          {transactions.length} entries
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white/70">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/90">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-200">
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className="flex items-center gap-2"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {isSorted ? (
                            isSorted === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-slate-400" />
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
                  className="border-b border-slate-200/80 last:border-b-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  No transactions yet. Add your first entry to start tracking.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
