'use client'

import * as React from 'react'

import { addGoalAction, type AddGoalState } from '@/app/actions'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const initialState: AddGoalState = { status: 'idle' }

type AddGoalDialogProps = {
  trigger?: React.ReactElement
  triggerContent?: React.ReactNode
}

export function AddGoalDialog({ trigger, triggerContent }: AddGoalDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [state, formAction, pending] = React.useActionState(
    addGoalAction,
    initialState,
  )
  const formRef = React.useRef<HTMLFormElement | null>(null)

  React.useEffect(() => {
    if (state.status === 'success') {
      toast.success(state.message ?? 'Goal created.')
      formRef.current?.reset()
      setOpen(false)
    }
    if (state.status === 'error' && state.message) {
      toast.error(state.message)
    }
  }, [state.status, state.message])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? <Button />}>
        {triggerContent ?? 'New goal'}
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-slate-950 text-slate-100 sm:max-w-xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl">Add goal</DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a new savings bucket with optional targets and champions.
          </DialogDescription>
        </DialogHeader>

        <Form ref={formRef} action={formAction} className="space-y-6">
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
                placeholder="Tuition and living expenses for Student."
                className="min-h-[88px] bg-white/5"
              />
            </FieldContent>
          </Field>

          <FieldGroup className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="coverImageUrl">Cover image URL</FieldLabel>
              <FieldContent>
                <Input
                  id="coverImageUrl"
                  name="coverImageUrl"
                  placeholder="https://images.unsplash.com/..."
                  className="bg-white/5"
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="champions">Champions</FieldLabel>
              <FieldContent>
                <Input
                  id="champions"
                  name="champions"
                  placeholder="Frank, Owner One"
                  className="bg-white/5"
                />
              </FieldContent>
            </Field>
          </FieldGroup>

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
              {pending ? 'Saving...' : 'Save goal'}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
