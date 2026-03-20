import {
  aria,
  attr,
  computedOf,
  Empty,
  html,
  on,
  OnDispose,
  Portal,
  prop,
  style,
  svg,
  svgAttr,
  TNode,
  Use,
  Value,
  When,
  WithElement,
} from '@tempots/dom'
import { Button } from '../button'
import { FocusTrap } from '../../utils/focus-trap'
import { sessionId } from '../../utils/session-id'
import { BeatUII18n } from '../../beatui-i18n'

/**
 * Placement of the tour tooltip relative to the target element.
 */
export type TourTooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto'

/**
 * Behavior when the backdrop area (outside the highlighted element) is clicked.
 */
export type TourBackdropAction = 'close' | 'advance' | 'ignore'

/**
 * Definition of a single step in the onboarding tour.
 */
export interface TourStep {
  /** CSS selector or direct reference to the target element to highlight. */
  target: string | HTMLElement
  /** Title text for the step tooltip. */
  title?: string
  /** Description text for the step tooltip. */
  description?: string
  /** Rich content to render inside the tooltip (replaces description if provided). */
  content?: TNode
  /** Preferred placement of the tooltip. @default 'auto' */
  placement?: TourTooltipPlacement
  /** Whether the user can interact with the highlighted element. @default false */
  allowInteraction?: boolean
  /** Async validation function. Return true to allow advancing, false to block. */
  beforeNext?: () => boolean | Promise<boolean>
}

/**
 * Configuration options for the {@link OnboardingTour} component.
 */
export interface OnboardingTourOptions {
  /** Array of tour steps to display. */
  steps: TourStep[]
  /** Behavior when backdrop is clicked. @default 'ignore' */
  backdropAction?: TourBackdropAction
  /** Padding around the highlighted element in pixels. @default 8 @min 0 @max 32 @step 2 */
  spotlightPadding?: number
  /** Border radius for the spotlight cutout in pixels. @default 8 @min 0 @max 24 @step 2 */
  spotlightRadius?: number
  /** Whether to show step indicators (e.g. "Step 2 of 5"). @default true */
  showStepIndicator?: boolean
  /** Whether to show the Skip button. @default true */
  showSkipButton?: boolean
  /** Callback when the tour starts. @default undefined */
  onStart?: () => void
  /** Callback when the current step changes. @default undefined */
  onStepChange?: (stepIndex: number) => void
  /** Callback when the tour is completed (user clicks Finish on last step). @default undefined */
  onComplete?: () => void
  /** Callback when the tour is skipped. @default undefined */
  onSkip?: () => void
  /**
   * Where to attach the overlay in the DOM.
   * - `'body'` - Renders via a portal to the document body.
   * - `'element'` - Renders as a child of the current element context.
   * @default 'body'
   */
  container?: 'body' | 'element'
}

/**
 * Controller returned by {@link OnboardingTour} for programmatic control.
 */
export interface OnboardingTourController {
  /** Start the tour from the first step. */
  startTour: () => void
  /** Jump to a specific step by index. */
  goToStep: (index: number) => void
  /** End the tour immediately. */
  endTour: () => void
  /** Whether the tour is currently active. */
  isActive: Value<boolean>
  /** The current step index (0-based). */
  currentStep: Value<number>
}

/** Resolve a step target to an HTMLElement. */
function resolveTarget(target: string | HTMLElement): HTMLElement | null {
  if (typeof target === 'string') {
    return document.querySelector<HTMLElement>(target)
  }
  return target
}

/** Get bounding rect with scroll offset. */
function getTargetRect(
  el: HTMLElement,
  padding: number
): { top: number; left: number; width: number; height: number } {
  const rect = el.getBoundingClientRect()
  return {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  }
}

/** Calculate tooltip position relative to the target. */
function calculateTooltipPosition(
  targetRect: ReturnType<typeof getTargetRect>,
  placement: TourTooltipPlacement,
  tooltipWidth: number,
  tooltipHeight: number
): { top: string; left: string; actualPlacement: TourTooltipPlacement } {
  const gap = 12
  const vw = window.innerWidth
  const vh = window.innerHeight

  // Auto placement: pick the side with the most space
  let resolved = placement
  if (resolved === 'auto') {
    const spaceTop = targetRect.top
    const spaceBottom = vh - (targetRect.top + targetRect.height)
    const spaceLeft = targetRect.left
    const spaceRight = vw - (targetRect.left + targetRect.width)
    const max = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight)
    if (max === spaceBottom) resolved = 'bottom'
    else if (max === spaceTop) resolved = 'top'
    else if (max === spaceRight) resolved = 'right'
    else resolved = 'left'
  }

  let top: number
  let left: number

  switch (resolved) {
    case 'bottom':
      top = targetRect.top + targetRect.height + gap
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
      break
    case 'top':
      top = targetRect.top - tooltipHeight - gap
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
      break
    case 'right':
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
      left = targetRect.left + targetRect.width + gap
      break
    case 'left':
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
      left = targetRect.left - tooltipWidth - gap
      break
  }

  // Clamp to viewport
  left = Math.max(8, Math.min(left, vw - tooltipWidth - 8))
  top = Math.max(8, Math.min(top, vh - tooltipHeight - 8))

  return {
    top: `${top}px`,
    left: `${left}px`,
    actualPlacement: resolved,
  }
}

/**
 * A step-by-step guided tour overlay that highlights UI elements with a spotlight
 * effect and shows tooltips with navigation controls.
 *
 * Returns a tuple of `[TNode, OnboardingTourController]`.
 *
 * @param options - Configuration for steps, behavior, and callbacks
 * @returns A tuple of the tour overlay node and its controller
 *
 * @example
 * ```typescript
 * const [tour, ctrl] = OnboardingTour({
 *   steps: [
 *     { target: '#welcome-btn', title: 'Welcome', description: 'Click here to get started.' },
 *     { target: '.sidebar', title: 'Navigation', description: 'Browse sections here.' },
 *   ],
 *   onComplete: () => console.log('Tour finished!'),
 * })
 * html.div(tour)
 * ctrl.startTour()
 * ```
 */
export function OnboardingTour(
  options: OnboardingTourOptions
): [TNode, OnboardingTourController] {
  const {
    steps,
    backdropAction = 'ignore',
    spotlightPadding = 8,
    spotlightRadius = 8,
    showStepIndicator = true,
    showSkipButton = true,
    onStart,
    onStepChange,
    onComplete,
    onSkip,
    container = 'body',
  } = options

  const isActive = prop(false)
  const isMounted = prop(false)
  const opacity = prop(0)
  const currentStep = prop(0)

  // Spotlight position signals
  const spotTop = prop('0px')
  const spotLeft = prop('0px')
  const spotWidth = prop('0px')
  const spotHeight = prop('0px')

  // Tooltip position signals
  const tooltipTop = prop('0px')
  const tooltipLeft = prop('0px')
  const tooltipPlacement = prop<TourTooltipPlacement>('bottom')

  const id = sessionId('onboarding-tour')

  let resizeHandler: (() => void) | null = null

  /** Set spotlight and tooltip positions synchronously from the current step. */
  function applyPositions() {
    const stepIdx = currentStep.value
    if (stepIdx < 0 || stepIdx >= steps.length) return
    const step = steps[stepIdx]
    const target = resolveTarget(step.target)
    if (!target) return

    const rect = getTargetRect(target, spotlightPadding)
    spotTop.set(`${rect.top}px`)
    spotLeft.set(`${rect.left}px`)
    spotWidth.set(`${rect.width}px`)
    spotHeight.set(`${rect.height}px`)

    const tooltipW = 320
    const tooltipH = 200
    const pos = calculateTooltipPosition(
      rect,
      step.placement ?? 'auto',
      tooltipW,
      tooltipH
    )
    tooltipTop.set(pos.top)
    tooltipLeft.set(pos.left)
    tooltipPlacement.set(pos.actualPlacement)
  }

  function updatePositions() {
    const stepIdx = currentStep.value
    if (stepIdx < 0 || stepIdx >= steps.length) return
    const step = steps[stepIdx]
    const target = resolveTarget(step.target)
    if (!target) return

    // Scroll target into view if needed
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

    // Wait a frame for scroll to settle, then reapply
    requestAnimationFrame(applyPositions)
  }

  function startTour() {
    if (steps.length === 0) return
    currentStep.set(0)
    // Set positions synchronously before mounting so the spotlight
    // is already at the target when the DOM appears
    applyPositions()
    isActive.set(true)
    isMounted.set(true)
    onStart?.()
    onStepChange?.(0)
    // Fade in on the next frame
    requestAnimationFrame(() => opacity.set(1))
  }

  async function nextStep() {
    const idx = currentStep.value
    const step = steps[idx]

    // Async validation
    if (step.beforeNext) {
      const canProceed = await step.beforeNext()
      if (!canProceed) return
    }

    if (idx >= steps.length - 1) {
      // Last step - complete
      endTour()
      onComplete?.()
    } else {
      const next = idx + 1
      currentStep.set(next)
      onStepChange?.(next)
      updatePositions()
    }
  }

  function prevStep() {
    const idx = currentStep.value
    if (idx > 0) {
      const prev = idx - 1
      currentStep.set(prev)
      onStepChange?.(prev)
      updatePositions()
    }
  }

  function skipTour() {
    endTour()
    onSkip?.()
  }

  const FADE_DURATION = 200

  function endTour() {
    isActive.set(false)
    opacity.set(0)
    setTimeout(() => {
      isMounted.set(false)
      currentStep.set(0)
    }, FADE_DURATION)
  }

  function goToStep(index: number) {
    if (index < 0 || index >= steps.length) return
    currentStep.set(index)
    onStepChange?.(index)
    if (isActive.value) {
      updatePositions()
    }
  }

  const controller: OnboardingTourController = {
    startTour,
    goToStep,
    endTour,
    isActive,
    currentStep,
  }

  // Step title/description as signals
  const stepTitle = Value.map(currentStep, idx =>
    idx < steps.length ? (steps[idx].title ?? '') : ''
  )
  const stepDescription = Value.map(currentStep, idx =>
    idx < steps.length ? (steps[idx].description ?? '') : ''
  )
  const hasCustomContent = currentStep.map(idx =>
    idx < steps.length ? steps[idx].content != null : false
  )
  // stepIndicatorText is now computed inside Use(BeatUII18n)
  const isFirstStep = Value.map(currentStep, idx => idx === 0)
  const isLastStep = Value.map(currentStep, idx => idx >= steps.length - 1)
  const allowsInteraction = Value.map(currentStep, idx =>
    idx < steps.length ? (steps[idx].allowInteraction ?? false) : false
  )

  // SVG mask path for spotlight
  const spotlightMask = computedOf(
    spotTop,
    spotLeft,
    spotWidth,
    spotHeight
  )((t, l, w, h) => {
    const top = parseFloat(t)
    const left = parseFloat(l)
    const width = parseFloat(w)
    const height = parseFloat(h)
    const r = spotlightRadius
    // Full viewport rect with a rounded-rect cutout
    return `M0,0 H${window.innerWidth} V${window.innerHeight} H0 Z M${left + r},${top} H${left + width - r} Q${left + width},${top} ${left + width},${top + r} V${top + height - r} Q${left + width},${top + height} ${left + width - r},${top + height} H${left + r} Q${left},${top + height} ${left},${top + height - r} V${top + r} Q${left},${top} ${left + r},${top} Z`
  })

  const tourContent = () =>
    Use(BeatUII18n, t => {
      const stepIndicatorText = computedOf(
        currentStep,
        t.$.onboardingTour.$.stepIndicator
      )((idx, fn) => fn(idx + 1, steps.length))

      return html.div(
        attr.class('bc-onboarding-tour'),
        attr.id(id),
        attr.role('dialog'),
        aria.modal(true),
        aria.label(t.$.onboardingTour.$.label),
        style.opacity(opacity.map(String)),

        // SVG backdrop with spotlight cutout
        svg.svg(
          attr.class(
            computedOf(allowsInteraction)(
              i =>
                `bc-onboarding-tour__backdrop${i ? ' bc-onboarding-tour__backdrop--interactive' : ''}`
            )
          ),
          svgAttr.width('100%'),
          svgAttr.height('100%'),
          on.click(() => {
            if (backdropAction === 'close') skipTour()
            else if (backdropAction === 'advance') nextStep()
          }),
          svg.path(
            svgAttr.d(spotlightMask),
            svgAttr['fill-rule']('evenodd'),
            attr.class('bc-onboarding-tour__mask')
          )
        ),

        // Tooltip
        html.div(
          attr.class(
            Value.map(
              tooltipPlacement,
              p =>
                `bc-onboarding-tour__tooltip bc-onboarding-tour__tooltip--${p}`
            )
          ),
          style.top(tooltipTop),
          style.left(tooltipLeft),

          // Arrow
          html.div(attr.class('bc-onboarding-tour__arrow')),

          // Content
          html.div(
            attr.class('bc-onboarding-tour__content'),

            // Step indicator
            showStepIndicator
              ? html.div(
                  attr.class('bc-onboarding-tour__step-indicator'),
                  stepIndicatorText
                )
              : Empty,

            // Title
            When(
              Value.map(stepTitle, tt => tt.length > 0),
              () =>
                html.h3(
                  attr.class('bc-onboarding-tour__title'),
                  attr.id(`${id}-title`),
                  stepTitle
                ),
              () => undefined
            ),

            // Description or custom content
            When(
              hasCustomContent,
              () => {
                const idx = currentStep.value
                return html.div(
                  attr.class('bc-onboarding-tour__body'),
                  idx < steps.length ? steps[idx].content : undefined
                )
              },
              () =>
                When(
                  Value.map(stepDescription, d => d.length > 0),
                  () =>
                    html.p(
                      attr.class('bc-onboarding-tour__description'),
                      stepDescription
                    ),
                  () => undefined
                )
            ),

            // Navigation buttons
            html.div(
              attr.class('bc-onboarding-tour__nav'),
              html.div(
                attr.class('bc-onboarding-tour__nav-left'),
                showSkipButton
                  ? Button(
                      {
                        variant: 'default',
                        size: 'sm',
                        onClick: skipTour,
                      },
                      t.$.onboardingTour.$.skip
                    )
                  : Empty
              ),
              html.div(
                attr.class('bc-onboarding-tour__nav-right'),
                When(
                  isFirstStep,
                  () => Empty,
                  () =>
                    Button(
                      {
                        variant: 'outline',
                        size: 'sm',
                        onClick: prevStep,
                      },
                      t.$.onboardingTour.$.previous
                    )
                ),
                When(
                  isLastStep,
                  () =>
                    Button(
                      {
                        variant: 'filled',
                        color: 'primary',
                        size: 'sm',
                        onClick: () => nextStep(),
                      },
                      t.$.onboardingTour.$.finish
                    ),
                  () =>
                    Button(
                      {
                        variant: 'filled',
                        color: 'primary',
                        size: 'sm',
                        onClick: () => nextStep(),
                      },
                      t.$.onboardingTour.$.next
                    )
                )
              )
            )
          ),

          // Focus trap and keyboard handling
          FocusTrap({
            escapeDeactivates: true,
            onEscape: skipTour,
          })
        ),

        // Keyboard navigation and resize handling
        WithElement(() => {
          const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault()
              nextStep()
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault()
              prevStep()
            }
          }

          resizeHandler = () => updatePositions()

          document.addEventListener('keydown', handleKeydown)
          window.addEventListener('resize', resizeHandler)

          return OnDispose(() => {
            document.removeEventListener('keydown', handleKeydown)
            if (resizeHandler) {
              window.removeEventListener('resize', resizeHandler)
              resizeHandler = null
            }
          })
        })
      )
    })

  const node: TNode = When(isMounted, () =>
    container === 'body' ? Portal('body', tourContent()) : tourContent()
  )

  return [node, controller]
}
