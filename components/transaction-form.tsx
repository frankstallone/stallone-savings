'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

import type { TransactionFormState } from '@/app/goals/[goalSlug]/transactions/actions'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { UserSummary } from '@/lib/types'
import { getUserLabel } from '@/lib/user-label'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type TransactionFormValues = {
  description: string
  amount: string
  direction: 'deposit' | 'withdrawal'
  transactedOn: string
  createdBy: string
}

type TransactionFormProps = {
  action: (
    prevState: TransactionFormState,
    formData: FormData,
  ) => Promise<TransactionFormState>
  successRedirect: string
  successToastKey: string
  cancelHref: string
  initialValues?: TransactionFormValues
  userOptions?: UserSummary[]
  submitLabel?: string
  pendingLabel?: string
}

const initialState: TransactionFormState = { status: 'idle' }

const toDate = (value?: string) =>
  value ? new Date(`${value}T00:00:00`) : new Date()

export function TransactionForm({
  action,
  successRedirect,
  successToastKey,
  cancelHref,
  initialValues,
  userOptions = [],
  submitLabel = 'Save transaction',
  pendingLabel = 'Saving...',
}: TransactionFormProps) {
  const router = useRouter()
  const [state, formAction, pending] = React.useActionState(
    action,
    initialState,
  )
  const [formValues, setFormValues] = React.useState(() => ({
    description: initialValues?.description ?? '',
    amount: initialValues?.amount ?? '',
    direction: initialValues?.direction ?? 'deposit',
    createdBy: initialValues?.createdBy ?? '',
  }))
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(() =>
    toDate(initialValues?.transactedOn),
  )

  React.useEffect(() => {
    setFormValues({
      description: initialValues?.description ?? '',
      amount: initialValues?.amount ?? '',
      direction: initialValues?.direction ?? 'deposit',
      createdBy: initialValues?.createdBy ?? '',
    })
  }, [
    initialValues?.amount,
    initialValues?.createdBy,
    initialValues?.description,
    initialValues?.direction,
  ])

  React.useEffect(() => {
    setSelectedDate(toDate(initialValues?.transactedOn))
  }, [initialValues?.transactedOn])

  React.useEffect(() => {
    if (state.status === 'success') {
      router.push(`${successRedirect}?toast=${successToastKey}`)
    }
    if (state.status === 'error' && state.message) {
      toast.error(state.message)
    }
  }, [router, state.message, state.status, successRedirect, successToastKey])

  const formattedDate = selectedDate
    ? format(selectedDate, 'PPP')
    : 'Pick a date'
  const dateValue = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  const createdByItems = React.useMemo(() => {
    const items = userOptions
      .map((option) => getUserLabel(option))
      .filter((label) => label && label !== 'Unknown')
    return Array.from(new Set(items))
  }, [userOptions])

  return (
    <Form action={formAction} className="space-y-6">
      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <FieldContent>
            <Textarea
              id="description"
              name="description"
              placeholder="e.g. September transfer"
              className={cn(
                'min-h-[88px] bg-white/5',
                state.fieldErrors?.description && 'border-rose-400',
              )}
              value={formValues.description}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              required
            />
            <FieldError>{state.fieldErrors?.description}</FieldError>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="amount">Amount</FieldLabel>
          <FieldContent>
            <InputGroup
              className={cn(
                'bg-white/5',
                state.fieldErrors?.amount && 'border-rose-400',
              )}
            >
              <InputGroupAddon align="inline-start">
                <InputGroupText>$</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formValues.amount}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    amount: event.target.value,
                  }))
                }
                required
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>USD</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <FieldError>{state.fieldErrors?.amount}</FieldError>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="direction">Direction</FieldLabel>
          <FieldContent>
            <Select
              name="direction"
              value={formValues.direction}
              onValueChange={(value) =>
                setFormValues((prev) => ({
                  ...prev,
                  direction: value as 'deposit' | 'withdrawal',
                }))
              }
              itemToStringLabel={(value) =>
                value === 'withdrawal' ? 'Withdrawal' : 'Deposit'
              }
            >
              <SelectTrigger
                id="direction"
                className={cn(
                  'w-full justify-between bg-white/5 text-slate-100',
                  state.fieldErrors?.direction && 'border-rose-400',
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
              </SelectContent>
            </Select>
            <FieldError>{state.fieldErrors?.direction}</FieldError>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="transactedOn">Date</FieldLabel>
          <FieldContent>
            <input type="hidden" name="transactedOn" value={dateValue} />
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-between bg-white/5 text-left font-normal text-slate-100',
                      !selectedDate && 'text-slate-500',
                      state.fieldErrors?.transactedOn && 'border-rose-400',
                    )}
                  />
                }
              >
                {formattedDate}
              </PopoverTrigger>
              <PopoverContent className="w-auto border-white/10 bg-slate-950 p-2 text-slate-100">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FieldError>{state.fieldErrors?.transactedOn}</FieldError>
          </FieldContent>
        </Field>
      </FieldGroup>

      <Field>
        <FieldLabel htmlFor="createdBy">By (optional)</FieldLabel>
        <FieldContent>
          <Combobox
            value={formValues.createdBy}
            onValueChange={(value) =>
              setFormValues((prev) => ({
                ...prev,
                createdBy: value ?? '',
              }))
            }
            inputValue={formValues.createdBy}
            onInputValueChange={(value) =>
              setFormValues((prev) => ({
                ...prev,
                createdBy: value ?? '',
              }))
            }
            items={createdByItems}
          >
            <ComboboxInput
              id="createdBy"
              name="createdBy"
              placeholder={
                createdByItems.length ? 'Select a person...' : 'Enter a name...'
              }
              showClear
            />
            <ComboboxContent>
              <ComboboxEmpty>No matches found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </FieldContent>
      </Field>

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
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(cancelHref)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </Form>
  )
}
