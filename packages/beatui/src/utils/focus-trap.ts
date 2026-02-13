/**
 * Focus trap utilities for BeatUI.
 *
 * Provides a focus trap implementation that constrains keyboard focus within
 * a container element. Supports Tab/Shift+Tab cycling, Escape key handling,
 * click-outside detection, initial focus targeting, and focus restoration
 * on deactivation. Integrates with the `@tempots/dom` reactive rendering system.
 *
 * @module
 */

import { OnDispose, WithElement, Renderable } from '@tempots/dom'

/**
 * CSS selector string matching all natively focusable HTML elements,
 * including links, buttons, inputs, selects, textareas, elements with
 * tabindex, contenteditable elements, media controls, and details summaries.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'audio[controls]',
  'video[controls]',
  'details > summary:first-of-type',
  'details[open]',
].join(', ')

/**
 * Returns all visible, interactive, focusable elements within a container.
 * Filters out elements that are hidden (zero dimensions), have the `inert`
 * attribute, or have `visibility: hidden`.
 *
 * @param container - The DOM element to search within
 * @returns An array of focusable `HTMLElement` instances
 */
function getFocusableElements(container: Element): HTMLElement[] {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    element => {
      // Additional checks for visibility and interactivity
      const htmlElement = element as HTMLElement
      return (
        htmlElement.offsetWidth > 0 &&
        htmlElement.offsetHeight > 0 &&
        !htmlElement.hasAttribute('inert') &&
        window.getComputedStyle(htmlElement).visibility !== 'hidden'
      )
    }
  ) as HTMLElement[]
}

/**
 * Configuration options for the focus trap behavior.
 */
export interface FocusTrapOptions {
  /**
   * Whether the focus trap is active.
   * @default true
   */
  active?: boolean
  /**
   * Whether pressing Escape deactivates the focus trap.
   * @default true
   */
  escapeDeactivates?: boolean
  /** Callback invoked when the Escape key is pressed (if `escapeDeactivates` is true). */
  onEscape?: () => void
  /**
   * Element to receive initial focus when the trap activates.
   * Can be an `HTMLElement` or a function returning one.
   * If not provided, the first focusable element in the container is focused.
   */
  initialFocus?: HTMLElement | (() => HTMLElement | null)
  /**
   * Element to return focus to when the trap is deactivated.
   * Can be an `HTMLElement` or a function returning one.
   * If not provided, focus returns to the element that was focused before activation.
   */
  returnFocus?: HTMLElement | (() => HTMLElement | null)
  /**
   * Whether clicking outside the container triggers deactivation.
   * @default false
   */
  clickOutsideDeactivates?: boolean
  /** Callback invoked when a click occurs outside the container (if `clickOutsideDeactivates` is true). */
  onClickOutside?: () => void
}

/**
 * Creates a focus trap `Renderable` that constrains keyboard focus within
 * the parent container element. When added to a container, it intercepts
 * Tab/Shift+Tab navigation to cycle through focusable children, optionally
 * handles Escape key, and restores focus on disposal.
 *
 * @param options - Configuration for the focus trap behavior
 * @returns A `Renderable` that should be included as a child of the container element
 *
 * @example
 * ```ts
 * html.div(
 *   FocusTrap({
 *     escapeDeactivates: true,
 *     onEscape: () => closeDialog(),
 *   }),
 *   html.button('Close'),
 *   html.input({ type: 'text' }),
 * )
 * ```
 */
export function FocusTrap(options: FocusTrapOptions = {}): Renderable {
  const {
    active = true,
    escapeDeactivates = true,
    onEscape,
    initialFocus,
    returnFocus,
    clickOutsideDeactivates = false,
    onClickOutside,
  } = options

  return WithElement(container => {
    let isActive = active
    let previouslyFocusedElement: HTMLElement | null = null
    let focusableElements: HTMLElement[] = []
    let activationTimeoutId: ReturnType<typeof setTimeout> | null = null
    let focusTimeoutId: ReturnType<typeof setTimeout> | null = null
    let restoreFocusTimeoutId: ReturnType<typeof setTimeout> | null = null

    // Store the previously focused element
    if (typeof document !== 'undefined') {
      previouslyFocusedElement = document.activeElement as HTMLElement
    }

    const updateFocusableElements = () => {
      focusableElements = getFocusableElements(container)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isActive) return

      // Handle escape key
      if (escapeDeactivates && event.key === 'Escape') {
        event.preventDefault()
        onEscape?.()
        return
      }

      // Handle tab key
      if (event.key === 'Tab') {
        updateFocusableElements()

        if (focusableElements.length === 0) {
          event.preventDefault()
          return
        }

        const currentFocusIndex = focusableElements.indexOf(
          document.activeElement as HTMLElement
        )

        if (event.shiftKey) {
          // Shift + Tab (backward)
          if (currentFocusIndex <= 0) {
            event.preventDefault()
            focusableElements[focusableElements.length - 1]?.focus()
          }
        } else {
          // Tab (forward)
          if (currentFocusIndex >= focusableElements.length - 1) {
            event.preventDefault()
            focusableElements[0]?.focus()
          }
        }
      }
    }

    const handleClick = (event: MouseEvent) => {
      if (!isActive || !clickOutsideDeactivates) return

      const target = event.target as Element
      if (!container.contains(target)) {
        onClickOutside?.()
      }
    }

    const activate = () => {
      if (!isActive) return

      // Set initial focus
      updateFocusableElements()

      let elementToFocus: HTMLElement | null = null

      if (typeof initialFocus === 'function') {
        elementToFocus = initialFocus()
      } else if (initialFocus) {
        elementToFocus = initialFocus
      } else if (focusableElements.length > 0) {
        elementToFocus = focusableElements[0]
      }

      if (elementToFocus) {
        // Use setTimeout to ensure the element is rendered and focusable
        focusTimeoutId = setTimeout(() => {
          focusTimeoutId = null
          elementToFocus?.focus()
        }, 50)
      }

      // Add event listeners
      document.addEventListener('keydown', handleKeyDown, true)
      if (clickOutsideDeactivates) {
        document.addEventListener('click', handleClick, true)
      }
    }

    const deactivate = () => {
      isActive = false

      // Remove event listeners
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('click', handleClick, true)

      // Restore focus
      let elementToFocus: HTMLElement | null = null

      if (typeof returnFocus === 'function') {
        elementToFocus = returnFocus()
      } else if (returnFocus) {
        elementToFocus = returnFocus
      } else if (previouslyFocusedElement) {
        elementToFocus = previouslyFocusedElement
      }

      if (elementToFocus && document.body.contains(elementToFocus)) {
        restoreFocusTimeoutId = setTimeout(() => {
          restoreFocusTimeoutId = null
          elementToFocus?.focus()
        }, 0)
      }
    }

    // Activate the focus trap with a small delay to ensure DOM is ready
    activationTimeoutId = setTimeout(() => {
      activationTimeoutId = null
      activate()
    }, 0)

    // Return cleanup function
    return OnDispose(() => {
      // Clear any pending timeouts
      if (activationTimeoutId != null) clearTimeout(activationTimeoutId)
      if (focusTimeoutId != null) clearTimeout(focusTimeoutId)
      if (restoreFocusTimeoutId != null) clearTimeout(restoreFocusTimeoutId)
      deactivate()
    })
  })
}

/**
 * Creates a focus trap controller with `activate` and `deactivate` methods.
 * Each call to `activate()` or `deactivate()` returns a new `Renderable`
 * configured with the provided options.
 *
 * @param options - Configuration for the focus trap behavior
 * @returns An object with `activate` and `deactivate` methods that return `Renderable` instances
 *
 * @example
 * ```ts
 * const trap = useFocusTrap({ onEscape: () => console.log('escaped') })
 * // trap.activate() returns a Renderable with active=true
 * // trap.deactivate() returns a Renderable with active=false
 * ```
 */
export function useFocusTrap(options: FocusTrapOptions = {}) {
  return {
    activate: () => FocusTrap({ ...options, active: true }),
    deactivate: () => FocusTrap({ ...options, active: false }),
  }
}
