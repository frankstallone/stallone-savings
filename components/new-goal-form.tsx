'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import { addGoalAction, type AddGoalState } from '@/app/actions'
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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const initialState: AddGoalState = { status: 'idle' }

export function NewGoalForm() {
  const router = useRouter()
  const [state, formAction, pending] = React.useActionState(
    addGoalAction,
    initialState,
  )

  React.useEffect(() => {
    if (state.status === 'success') {
      toast.success(state.message ?? 'Goal created.')
      router.push('/')
    }
    if (state.status === 'error' && state.message) {
      toast.error(state.message)
    }
  }, [router, state.message, state.status])

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
            state.status === 'success' ? 'text-emerald-300' : 'text-rose-300',
          )}
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : 'Save goal'}
        </Button>
      </div>
    </Form>
  )
}
