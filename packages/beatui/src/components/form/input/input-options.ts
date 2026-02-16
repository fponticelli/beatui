import { aria, attr, Fragment, TNode, Value } from '@tempots/dom'
import { ControlSize } from '../../theme'
import { Merge } from '@tempots/std'

/**
 * Fine-grained CSS class targets for the three DOM levels of an input container.
 *
 * Use this to apply CSS classes to specific parts of the input structure:
 * - `container` — the outer `div.bc-input-container` (border, background)
 * - `wrapper` — the inner `div.bc-input-container__input` (padding, text size)
 * - `input` — the native `<input>`, `<select>`, or `<textarea>` element
 */
export type InputClasses = {
  /** Classes applied to the outer container div */
  container?: Value<string>
  /** Classes applied to the inner wrapper div */
  wrapper?: Value<string>
  /** Classes applied to the native input/select/textarea element */
  input?: Value<string>
}

/**
 * Common options shared across all input components in BeatUI.
 *
 * This type defines the foundational properties that every input component
 * accepts, such as disabled state, size, placeholder text, and accessibility
 * attributes. It serves as the base for more specific input option types.
 *
 * All properties accept `Value<T>`, meaning they can be either static values
 * or reactive signals from Tempo's `prop()` function.
 */
export type CommonInputOptions = {
  /** HTML autocomplete attribute for browser autofill suggestions */
  autocomplete?: Value<string>
  /** Whether the input should automatically receive focus when mounted */
  autofocus?: Value<boolean>
  /** Additional CSS classes to apply to the input container root element */
  class?: Value<string>
  /**
   * Fine-grained CSS class targets for each DOM level of the input.
   * Use `classes.input` to style the native element, `classes.container`
   * for the outer border div, and `classes.wrapper` for the inner div.
   */
  classes?: InputClasses
  /** Whether the input is disabled and cannot be interacted with */
  disabled?: Value<boolean>
  /** Whether the input has a validation error (applies error styling) */
  hasError?: Value<boolean>
  /** HTML name attribute, used for form submission */
  name?: Value<string>
  /** Placeholder text displayed when the input is empty */
  placeholder?: Value<string>
  /** Unique HTML id attribute for the input element */
  id?: Value<string>
  /** Whether the input is required for form validation */
  required?: Value<boolean>
  /** Tab index for keyboard navigation order */
  tabIndex?: Value<number>
  /**
   * Visual size of the control, aligned with Button sizes.
   * Defaults to 'md' when omitted.
   */
  size?: Value<ControlSize>
}

/**
 * Generic input options that extend `CommonInputOptions` with value handling.
 *
 * This type is used by most form input components (TextInput, NumberInput, etc.)
 * to provide both common input properties and value-specific callbacks.
 *
 * @template V - The type of the input's value (e.g., string, number, Date)
 *
 * @example
 * ```ts
 * const options: InputOptions<string> = {
 *   value: prop('initial'),
 *   onChange: (val) => console.log('Changed:', val),
 *   placeholder: 'Enter text...',
 *   disabled: false,
 *   size: 'md'
 * }
 * ```
 */
export type InputOptions<V> = Merge<
  CommonInputOptions,
  {
    /** The current value of the input (can be static or reactive signal) */
    value: Value<V>
    /** Optional node to render before the input element (e.g., icon) */
    before?: TNode
    /** Optional node to render after the input element (e.g., button) */
    after?: TNode
    /** Callback invoked when the value changes (typically on blur or enter) */
    onChange?: (value: V) => void
    /** Callback invoked on every input event (real-time changes) */
    onInput?: (value: V) => void
    /** Callback invoked when the input loses focus */
    onBlur?: () => void
  }
>

/**
 * Helper function that applies common HTML attributes to an input element.
 *
 * This utility converts `CommonInputOptions` into Tempo DOM attribute nodes,
 * handling standard HTML attributes and ARIA attributes for accessibility.
 * It's used internally by all input components to ensure consistent attribute
 * application.
 *
 * Note: The `name` attribute falls back to `id` if not explicitly provided.
 *
 * @param options - Common input options to convert to attributes
 * @returns A Fragment containing all applicable attribute nodes
 *
 * @example
 * ```ts
 * html.input(
 *   CommonInputAttributes({
 *     id: 'email',
 *     placeholder: 'Enter email',
 *     required: true,
 *     hasError: prop(false)
 *   })
 * )
 * ```
 */
export const CommonInputAttributes = ({
  autocomplete,
  autofocus,
  classes,
  disabled,
  name,
  placeholder,
  id,
  required,
  tabIndex,
  hasError,
}: CommonInputOptions) => {
  return Fragment(
    attr.autocomplete(autocomplete),
    attr.autofocus(autofocus),
    attr.class(classes?.input),
    attr.disabled(disabled),
    attr.name(name ?? id),
    attr.placeholder(placeholder),
    attr.id(id),
    aria.required(required),
    attr.tabindex(tabIndex),
    hasError != null
      ? aria.invalid(
          (hasError ?? false) as Value<
            boolean | 'true' | 'false' | 'grammar' | 'spelling'
          >
        )
      : null
  )
}
