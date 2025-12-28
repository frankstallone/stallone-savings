'use client'

import * as React from 'react'
import { format } from 'date-fns'

import {
  addTransactionAction,
  type AddTransactionState,
} from '@/app/goals/[goalSlug]/actions'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const initialState: AddTransactionState = { status: 'idle' }

type AddTransactionDialogProps = {
  goalSlug: string
  goalName: string
}

export function AddTransactionDialog({
  goalSlug,
  goalName,
}: AddTransactionDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date(),
  )
  const [state, formAction, pending] = React.useActionState(
    addTransactionAction.bind(null, goalSlug),
    initialState,
  )
  const formRef = React.useRef<HTMLFormElement | null>(null)

  React.useEffect(() => {
    if (state.status === 'success') {
      toast.success(state.message ?? 'Transaction added.')
      formRef.current?.reset()
      setSelectedDate(new Date())
      setOpen(false)
    }
    if (state.status === 'error' && state.message) {
      toast.error(state.message)
    }
  }, [state.status, state.message])

  const formattedDate = selectedDate
    ? format(selectedDate, 'PPP')
    : 'Pick a date'
  const dateValue = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Add transaction</DialogTrigger>
      <DialogContent className="border-white/10 bg-slate-950 text-slate-100 sm:max-w-xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl">Add transaction</DialogTitle>
          <DialogDescription className="text-slate-400">
            Log a new deposit or withdrawal for {goalName}.
          </DialogDescription>
        </DialogHeader>

        <Form ref={formRef} action={formAction} className="space-y-6">
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
                  defaultValue="deposit"
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
              <Input
                id="createdBy"
                name="createdBy"
                placeholder="Frank or Owner One"
                className="bg-white/5"
              />
            </FieldContent>
          </Field>

          {state.message ? (
            <p
              className={cn(
                'text-sm',
                state.status === 'success'
                  ? 'text-emerald-300'
                  : 'text-rose-300',
              )}
            >
              {state.message}
            </p>
          ) : null}

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving...' : 'Save transaction'}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
