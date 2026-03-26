import {
  aria,
  attr,
  computedOf,
  html,
  on,
  OnDispose,
  prop,
  Signal,
  TNode,
  Use,
  Value,
  When,
} from '@tempots/dom'
import { ControlSize } from '../theme'
import { ThemeColorName } from '../../tokens'
import { Icon } from '../data/icon'
import { Button } from '../button/button'
import { BeatUII18n } from '../../beatui-i18n'

/** State of an individual step in a {@link Stepper}. */
export type StepState = 'completed' | 'active' | 'pending' | 'error'

/**
 * Definition of a single step in a {@link Stepper}.
 */
export interface StepDefinition {
  /** Display label for the step indicator. */
  label: TNode
  /** Optional description shown below the label. */
  description?: TNode
  /** Optional Iconify icon shown in the step circle. */
  icon?: string
  /** Content rendered when this step is active. */
  content?: (controller: StepperController) => TNode
  /**
   * Async validation before advancing past this step.
   * Return `true` to allow, `false` to block.
   */
  beforeNext?: () => boolean | Promise<boolean>
}

/** Configuration options for the {@link Stepper} component. */
export interface StepperOptions {
  /** Array of step definitions. */
  steps: StepDefinition[]
  /** The active step index (0-based). */
  value?: Value<number>
  /** Callback invoked when the active step changes. */
  onChange?: (index: number) => void
  /** Layout orientation. @default 'horizontal' */
  orientation?: Value<'horizontal' | 'vertical'>
  /** Visual variant. @default 'default' */
  variant?: Value<'default' | 'compact'>
  /** Size of the stepper. @default 'md' */
  size?: Value<ControlSize>
  /** Theme color for active/completed steps. @default 'primary' */
  color?: Value<ThemeColorName>
  /** Whether the stepper is disabled. @default false */
  disabled?: Value<boolean>
  /** Whether to show navigation buttons. @default false */
  showNavigation?: Value<boolean>
}

/** Programmatic controller for the stepper. */
export interface StepperController {
  /** Jump to a specific step. Forward jumps validate intermediate beforeNext guards. */
  goTo: (index: number) => Promise<boolean>
  /** Advance to the next step (respects beforeNext). Returns false if blocked. */
  next: () => Promise<boolean>
  /** Go back to the previous step. */
  prev: () => void
  /** Mark the stepper as complete (validates remaining beforeNext guards first). */
  complete: () => Promise<boolean>
  /** Reactive signal for the current step index. */
  currentStep: Signal<number>
  /** Set a step to error state. */
  setError: (index: number) => void
  /** Clear error state on a step. */
  clearError: (index: number) => void
}

function generateStepperClasses(
  orientation: string,
  variant: string,
  size: ControlSize,
  disabled: boolean
): string {
  const cls = [
    'bc-stepper',
    `bc-stepper--${orientation}`,
    `bc-stepper--size-${size}`,
  ]
  if (variant !== 'default') cls.push(`bc-stepper--${variant}`)
  if (disabled) cls.push('bc-stepper--disabled')
  return cls.join(' ')
}

/**
 * Creates a multi-step workflow indicator with content panels and
 * returns a `[TNode, StepperController]` tuple for programmatic control.
 *
 * @param options - Configuration for the stepper
 * @returns A tuple of `[renderable, controller]`
 *
 * @example
 * ```ts
 * const [stepper, ctrl] = createStepper({
 *   steps: [
 *     { label: 'Account', content: () => html.div('Step 1 content') },
 *     { label: 'Profile', content: () => html.div('Step 2 content') },
 *     { label: 'Confirm', content: () => html.div('Step 3 content') },
 *   ],
 *   onChange: idx => console.log('Step', idx),
 * })
 * ```
 */
export function createStepper(
  options: StepperOptions
): [TNode, StepperController] {
  const {
    steps,
    value = 0,
    onChange,
    orientation = 'horizontal',
    variant = 'default',
    size = 'md',
    color = 'primary',
    disabled = false,
    showNavigation = false,
  } = options

  const currentStep = prop(Value.get(value))
  // Sync external value changes — disposal is handled in the rendered tree below
  const disposeValueSync = Value.on(value, v => currentStep.set(v))
  const errorSteps = prop<Set<number>>(new Set())

  const moveTo = (index: number) => {
    currentStep.set(index)
    onChange?.(index)
  }

  /** Validate all `beforeNext` guards from `from` up to (not including) `to`. */
  const validateRange = async (from: number, to: number): Promise<boolean> => {
    for (let i = from; i < to; i++) {
      const guard = steps[i].beforeNext
      if (guard) {
        const allowed = await guard()
        if (!allowed) return false
      }
    }
    return true
  }

  const goTo = async (index: number): Promise<boolean> => {
    if (index < 0 || index >= steps.length) return false
    if (Value.get(disabled)) return false
    const current = currentStep.value
    if (index === current) return true
    // Backward jumps are always allowed
    if (index < current) {
      moveTo(index)
      return true
    }
    // Forward jumps validate intermediate steps
    if (!(await validateRange(current, index))) return false
    moveTo(index)
    return true
  }

  const next = async (): Promise<boolean> => {
    if (Value.get(disabled)) return false
    const idx = currentStep.value
    if (idx >= steps.length - 1) return false
    const step = steps[idx]
    if (step.beforeNext) {
      const allowed = await step.beforeNext()
      if (!allowed) return false
    }
    moveTo(idx + 1)
    return true
  }

  const prev = () => {
    const idx = currentStep.value
    if (idx > 0) moveTo(idx - 1)
  }

  const complete = async (): Promise<boolean> => {
    if (Value.get(disabled)) return false
    const idx = currentStep.value
    if (!(await validateRange(idx, steps.length))) return false
    moveTo(steps.length)
    return true
  }

  const setError = (index: number) => {
    const s = new Set(errorSteps.value)
    s.add(index)
    errorSteps.set(s)
  }

  const clearError = (index: number) => {
    const s = new Set(errorSteps.value)
    s.delete(index)
    errorSteps.set(s)
  }

  const controller: StepperController = {
    goTo,
    next,
    prev,
    complete,
    currentStep,
    setError,
    clearError,
  }

  const node = Use(BeatUII18n, t => {
    const getStepState = (
      index: number,
      current: number,
      errors: Set<number>
    ): StepState => {
      if (errors.has(index)) return 'error'
      if (index < current) return 'completed'
      if (index === current) return 'active'
      return 'pending'
    }

    return html.div(
      OnDispose(disposeValueSync),
      attr.class(
        computedOf(orientation, variant, size, disabled)(generateStepperClasses)
      ),
      attr.style(
        Value.map(
          color,
          c =>
            `--stepper-color: var(--color-${c}-500); --stepper-color-dark: var(--color-${c}-400)`
        )
      ),
      attr.role('group'),
      aria.label(
        computedOf(t.$.stepper.$.step)((s): string => `${s} progress`)
      ),
      // Step indicators
      html.div(
        attr.class('bc-stepper__indicators'),
        ...steps
          .map((step, index) => {
            const state = computedOf(
              currentStep,
              errorSteps
            )(
              (current, errors): StepState =>
                getStepState(index, current, errors)
            )

            const stepClass = Value.map(
              state,
              (s): string => `bc-stepper__step bc-stepper__step--${s}`
            )

            const circleContent = step.icon
              ? Icon({ icon: step.icon, size: 'xs' })
              : When(
                  Value.map(state, s => s === 'completed'),
                  () => Icon({ icon: 'lucide:check', size: 'xs' }),
                  () =>
                    When(
                      Value.map(state, s => s === 'error'),
                      () => Icon({ icon: 'lucide:alert-triangle', size: 'xs' }),
                      () => html.span(String(index + 1))
                    )
                )

            return [
              // Connector line (before each step except first)
              ...(index > 0
                ? [
                    html.div(
                      attr.class(
                        computedOf(
                          currentStep,
                          errorSteps
                        )((current, errors): string => {
                          const prevState = getStepState(
                            index - 1,
                            current,
                            errors
                          )
                          return prevState === 'completed'
                            ? 'bc-stepper__connector bc-stepper__connector--completed'
                            : 'bc-stepper__connector'
                        })
                      )
                    ),
                  ]
                : []),
              // Step indicator
              html.div(
                attr.class(stepClass),
                on.click(() => {
                  if (!Value.get(disabled)) void goTo(index)
                }),
                attr.role('button'),
                attr.tabindex(0),
                aria.label(
                  computedOf(t.$.stepper.$.stepOfTotal)(
                    (fn): string => fn(index + 1, steps.length)
                  )
                ),
                on.keydown(e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (!Value.get(disabled)) void goTo(index)
                  }
                }),
                html.div(attr.class('bc-stepper__circle'), circleContent),
                html.div(
                  attr.class('bc-stepper__label'),
                  html.span(attr.class('bc-stepper__label-text'), step.label),
                  step.description
                    ? html.span(
                        attr.class('bc-stepper__label-description'),
                        step.description
                      )
                    : null
                )
              ),
            ]
          })
          .flat()
      ),
      // Step content
      html.div(
        attr.class('bc-stepper__content'),
        ...steps.map((step, index) =>
          step.content
            ? When(
                Value.map(currentStep, c => c === index),
                () => step.content!(controller),
                () => null
              )
            : null
        )
      ),
      // Navigation buttons
      When(
        showNavigation,
        () =>
          html.div(
            attr.class('bc-stepper__navigation'),
            When(
              Value.map(currentStep, c => c > 0),
              () =>
                Button(
                  {
                    variant: 'outline',
                    size,
                    color,
                    disabled,
                    onClick: prev,
                  },
                  t.$.stepper.$.previous
                ),
              () => null
            ),
            html.span(attr.class('bc-stepper__spacer')),
            When(
              Value.map(currentStep, c => c < steps.length - 1),
              () =>
                Button(
                  {
                    variant: 'filled',
                    size,
                    color,
                    disabled,
                    onClick: () => {
                      void next()
                    },
                  },
                  t.$.stepper.$.next
                ),
              () =>
                Button(
                  {
                    variant: 'filled',
                    size,
                    color,
                    disabled,
                    onClick: () => {
                      void complete()
                    },
                  },
                  t.$.stepper.$.complete
                )
            )
          ),
        () => null
      )
    )
  })

  return [node, controller]
}

/**
 * A multi-step workflow indicator with content panels and navigation buttons.
 *
 * Convenience wrapper around {@link createStepper} that returns only the TNode.
 * Use `createStepper` when you need programmatic control via the controller.
 *
 * @param options - Configuration for the stepper
 * @returns A stepper element
 *
 * @example
 * ```ts
 * Stepper({
 *   steps: [
 *     { label: 'Account', content: () => html.div('Create your account') },
 *     { label: 'Profile', content: () => html.div('Set up your profile') },
 *     { label: 'Done', content: () => html.div('All set!') },
 *   ],
 * })
 * ```
 */
export function Stepper(options: StepperOptions): TNode {
  const [node] = createStepper(options)
  return node
}
