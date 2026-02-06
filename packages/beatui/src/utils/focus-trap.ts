import { OnDispose, WithElement, Renderable } from '@tempots/dom'

/**
 * Selector for focusable elements
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
 * Get all focusable elements within a container
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
 * Focus trap options
 */
export interface FocusTrapOptions {
  /** Whether the focus trap is active */
  active?: boolean
  /** Whether to handle escape key */
  escapeDeactivates?: boolean
  /** Callback when escape key is pressed */
  onEscape?: () => void
  /** Element to focus initially (if not provided, focuses first focusable element) */
  initialFocus?: HTMLElement | (() => HTMLElement | null)
  /** Element to return focus to when trap is deactivated */
  returnFocus?: HTMLElement | (() => HTMLElement | null)
  /** Whether to prevent outside clicks */
  clickOutsideDeactivates?: boolean
  /** Callback when clicking outside */
  onClickOutside?: () => void
}

/**
 * Creates a focus trap within an element
 * Returns a TNode that should be added to the container element
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
 * Hook for managing focus trap state
 */
export function useFocusTrap(options: FocusTrapOptions = {}) {
  return {
    activate: () => FocusTrap({ ...options, active: true }),
    deactivate: () => FocusTrap({ ...options, active: false }),
  }
}
