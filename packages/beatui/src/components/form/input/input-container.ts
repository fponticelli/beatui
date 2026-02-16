import {
  attr,
  html,
  OnDispose,
  WithElement,
  TNode,
  Value,
  computedOf,
} from '@tempots/dom'
import { ControlSize } from '../../theme'
import { Icon } from '../../data'
import { ThemeColorName } from '../../../tokens'
import { InputClasses } from './input-options'

/**
 * Generates CSS class names for the input container based on state.
 *
 * @param baseContainer - Whether to use base container styles (minimal styling)
 * @param disabled - Whether the input is disabled
 * @param hasError - Whether the input has a validation error
 * @returns Space-separated string of CSS class names
 */
function generateInputContainerClasses(
  baseContainer: boolean,
  disabled: boolean,
  hasError: boolean
): string {
  const classes = [
    baseContainer ? 'bc-base-input-container' : 'bc-input-container',
  ]

  if (disabled) {
    classes.push(
      baseContainer
        ? 'bc-base-input-container--disabled'
        : 'bc-input-container--disabled'
    )
  } else {
    classes.push(
      baseContainer
        ? 'bc-base-input-container--default'
        : 'bc-input-container--default'
    )
  }

  if (hasError) {
    classes.push('bc-input-container--error')
  }

  return classes.join(' ')
}

/**
 * Generates CSS class names for the input element wrapper based on size and container type.
 *
 * @param baseContainer - Whether to use base container styles (skips padding/text size)
 * @param size - The control size ('xs' | 'sm' | 'md' | 'lg' | 'xl')
 * @returns Space-separated string of CSS class names
 */
export function generateInputContainerInputClasses(
  baseContainer: boolean,
  size: ControlSize
): string {
  const classes = ['bc-input-container__input']
  if (!baseContainer) {
    classes.push(`bc-control--padding-${size}`)
    classes.push(`bc-control--text-size-${size}`)
  }
  return classes.join(' ')
}

/**
 * Wraps an input element with the standard BeatUI input container styling.
 *
 * This component provides:
 * - Consistent border, background, and focus styles via `bc-input-container`
 * - Error state styling when `hasError` is true
 * - Optional `before` and `after` slots for icons, buttons, or other decorations
 * - Click-to-focus behavior (clicking the container focuses the input)
 * - Responsive sizing based on the `size` prop
 *
 * Used by most form inputs (TextInput, NumberInput, DateInput, etc.) to ensure
 * visual consistency across the component library.
 *
 * @param options - Container configuration options
 * @param options.input - The actual input element (or custom control) to wrap
 * @param options.disabled - Whether the input is disabled
 * @param options.hasError - Whether to apply error styling
 * @param options.before - Node to render before the input (e.g., icon)
 * @param options.after - Node to render after the input (e.g., clear button)
 * @param options.baseContainer - Use minimal "base" container styles instead of full styling
 * @param options.focusableSelector - CSS selector to find the focusable element (default: 'input, select, textarea')
 * @param options.growInput - Whether the input should grow to fill available space (default: true)
 * @param options.size - Visual size of the control (default: 'md')
 * @param children - Additional child nodes to append to the container
 * @returns A div element with the input container structure
 *
 * @example
 * ```ts
 * InputContainer({
 *   input: html.input(attr.type('text')),
 *   before: InputIcon({ icon: 'search' }),
 *   after: html.button('Clear'),
 *   hasError: prop(false),
 *   size: 'md'
 * })
 * ```
 */
export const InputContainer = (
  {
    baseContainer,
    class: rootClass,
    classes,
    disabled,
    input,
    before,
    after,
    hasError,
    focusableSelector = 'input, select, textarea',
    growInput = true,
    size,
  }: {
    baseContainer?: Value<boolean>
    class?: Value<string>
    classes?: InputClasses
    disabled?: Value<boolean>
    input: TNode
    before?: TNode
    after?: TNode
    hasError?: Value<boolean>
    focusableSelector?: string
    growInput?: Value<boolean>
    size?: Value<ControlSize>
  },
  ...children: TNode[]
) => {
  const isDisabled = Value.map(disabled ?? false, d => d)

  return html.div(
    WithElement(el => {
      const handler = () => {
        const focusable = el.querySelector(focusableSelector) as
          | HTMLElement
          | undefined
        focusable?.focus()
      }
      el.addEventListener('click', handler)
      return OnDispose(() => el.removeEventListener('click', handler))
    }),
    attr.class(
      computedOf(
        baseContainer,
        isDisabled,
        hasError ?? false
        // size ?? 'md'
      )((baseContainer, disabled, hasError) =>
        generateInputContainerClasses(
          baseContainer ?? false,
          disabled ?? false,
          hasError ?? false
          // (size ?? 'md') as ControlSize
        )
      )
    ),
    attr.class(rootClass),
    attr.class(classes?.container),
    before != null
      ? html.span(attr.class('bc-input-container__before'), before)
      : null,
    html.div(
      attr.class(
        computedOf(
          baseContainer,
          size ?? 'md'
        )((baseContainer, size) =>
          generateInputContainerInputClasses(
            baseContainer ?? false,
            (size ?? 'md') as ControlSize
          )
        )
      ),
      // attr.class('bc-input-container__input'),
      attr.class(
        Value.map(growInput, (v): string =>
          v ? 'bc-input-container__input--grow' : ''
        )
      ),
      attr.class(classes?.wrapper),
      input
    ),
    after != null
      ? html.span(attr.class('bc-input-container__after'), after)
      : null,
    ...children
  )
}

/**
 * Renders an icon with proper styling for use within an input container.
 *
 * This is a convenience component that wraps the `Icon` component with
 * the `bc-input-container__icon` class, which provides appropriate spacing
 * and sizing when placed in the `before` or `after` slots of `InputContainer`.
 *
 * @param options - Icon configuration
 * @param options.icon - Icon name or reactive signal
 * @param options.size - Size of the icon, aligned with input size (default: 'md')
 * @param options.color - Theme color for the icon (default: 'neutral')
 * @returns A span element containing the styled icon
 *
 * @example
 * ```ts
 * InputContainer({
 *   input: html.input(),
 *   before: InputIcon({ icon: 'search', color: 'primary' })
 * })
 * ```
 */
export function InputIcon({
  icon,
  size = 'md',
  color = 'neutral',
}: {
  icon: Value<string>
  size?: Value<ControlSize>
  color?: Value<ThemeColorName>
}) {
  return html.span(
    attr.class('bc-input-container__icon'),
    Icon({ icon, size, color })
  )
}
