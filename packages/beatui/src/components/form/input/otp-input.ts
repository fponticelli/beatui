import {
  attr,
  computedOf,
  html,
  on,
  prop,
  Value,
  Empty,
  aria,
  WithElement,
} from '@tempots/dom'
import { ControlSize } from '../../theme'
import { sessionId } from '../../../utils/session-id'
import { ThemeColorName } from '../../../tokens'
import { backgroundValue, borderColorValue } from '../../theme/style-utils'

/**
 * Configuration options for the {@link OTPInput} component.
 */
export interface OTPInputOptions {
  /** Number of input digits/characters. @default 6 */
  length?: number
  /** The current OTP value as a string */
  value?: Value<string>
  /** Callback invoked on every input change */
  onChange?: (value: string) => void
  /** Callback invoked when all digits have been entered */
  onComplete?: (value: string) => void
  /** Whether the input is disabled. @default false */
  disabled?: Value<boolean>
  /**
   * Whether to mask the input characters (like a password).
   * @default false
   */
  mask?: boolean
  /**
   * Allowed input type.
   * - `'numeric'` allows only digits 0-9
   * - `'alphanumeric'` allows letters and digits
   * @default 'numeric'
   */
  type?: 'numeric' | 'alphanumeric'
  /** Visual size of the input cells. @default 'md' */
  size?: Value<ControlSize>
  /** Theme color for the focused input border. @default 'primary' */
  color?: Value<ThemeColorName>
  /** Placeholder character shown in empty cells. @default '' */
  placeholder?: string
  /** Whether to auto-focus the first cell on mount. @default false */
  autoFocus?: boolean
}

function generateOTPClasses(size: ControlSize, disabled: boolean): string {
  const classes = ['bc-otp-input', `bc-otp-input--size-${size}`]
  if (disabled) classes.push('bc-otp-input--disabled')
  return classes.join(' ')
}

function generateOTPStyles(color: ThemeColorName): string {
  const light = backgroundValue(color, 'solid', 'light')
  const dark = backgroundValue(color, 'solid', 'dark')
  const styles = new Map<string, string>()
  styles.set('--otp-focus-color', light.backgroundColor)
  styles.set('--otp-focus-color-dark', dark.backgroundColor)
  styles.set('--otp-focus-border', borderColorValue(color, 'light'))
  styles.set('--otp-focus-border-dark', borderColorValue(color, 'dark'))
  return Array.from(styles.entries())
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ')
}

function isValidChar(char: string, type: 'numeric' | 'alphanumeric'): boolean {
  if (type === 'numeric') return /^\d$/.test(char)
  return /^[a-zA-Z0-9]$/.test(char)
}

/**
 * A one-time password (OTP) / PIN input component.
 *
 * Renders a row of individual input cells for entering verification codes,
 * PINs, or any fixed-length token. Features automatic focus advancement
 * between cells, paste support, keyboard navigation (arrow keys, backspace),
 * and optional character masking.
 *
 * @param options - Configuration for the OTP input
 * @returns A row of input cells for OTP entry
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { OTPInput } from '@tempots/beatui'
 *
 * const code = prop('')
 * OTPInput({
 *   value: code,
 *   onChange: code.set,
 *   onComplete: (v) => console.log('Code entered:', v),
 *   length: 6,
 * })
 * ```
 *
 * @example
 * ```ts
 * // Masked 4-digit PIN
 * OTPInput({
 *   value: prop(''),
 *   onChange: (v) => console.log(v),
 *   length: 4,
 *   mask: true,
 *   type: 'numeric',
 *   size: 'lg',
 * })
 * ```
 */
export function OTPInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  disabled = false,
  mask = false,
  type = 'numeric',
  size = 'md',
  color = 'primary',
  placeholder = '',
  autoFocus = false,
}: OTPInputOptions = {}) {
  const otpId = sessionId('otp')

  // Internal state: array of individual cell values
  const cells = prop<string[]>(
    (() => {
      const initial = Value.get(value)
      const arr = new Array<string>(length).fill('')
      for (let i = 0; i < Math.min(initial.length, length); i++) {
        arr[i] = initial[i]!
      }
      return arr
    })()
  )

  const focusedIndex = prop<number | null>(null)

  // References to input elements
  const inputRefs: HTMLInputElement[] = []

  function focusCell(index: number) {
    const el = inputRefs[index]
    if (el != null) {
      el.focus()
      el.select()
    }
  }

  function emitValue() {
    const val = cells.value.join('')
    onChange?.(val)
    if (val.length === length && val.split('').every(c => c !== '')) {
      onComplete?.(val)
    }
  }

  function handleInput(index: number, inputValue: string) {
    if (Value.get(disabled)) return

    // Handle paste of multiple chars
    const chars = inputValue.split('').filter(c => isValidChar(c, type))

    if (chars.length > 1) {
      // Paste mode: fill from current index
      const newCells = [...cells.value]
      for (let i = 0; i < chars.length && index + i < length; i++) {
        newCells[index + i] = chars[i]!
      }
      cells.set(newCells)
      emitValue()
      const nextIndex = Math.min(index + chars.length, length - 1)
      focusCell(nextIndex)
      return
    }

    if (chars.length === 1) {
      const newCells = [...cells.value]
      newCells[index] = chars[0]!
      cells.set(newCells)
      emitValue()
      // Advance focus
      if (index < length - 1) {
        focusCell(index + 1)
      }
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent) {
    if (Value.get(disabled)) return

    switch (e.key) {
      case 'Backspace': {
        e.preventDefault()
        const newCells = [...cells.value]
        if (newCells[index] !== '') {
          newCells[index] = ''
          cells.set(newCells)
          emitValue()
        } else if (index > 0) {
          newCells[index - 1] = ''
          cells.set(newCells)
          emitValue()
          focusCell(index - 1)
        }
        break
      }
      case 'ArrowLeft':
        e.preventDefault()
        if (index > 0) focusCell(index - 1)
        break
      case 'ArrowRight':
        e.preventDefault()
        if (index < length - 1) focusCell(index + 1)
        break
      case 'Delete': {
        e.preventDefault()
        const newCells = [...cells.value]
        newCells[index] = ''
        cells.set(newCells)
        emitValue()
        break
      }
      case 'Home':
        e.preventDefault()
        focusCell(0)
        break
      case 'End':
        e.preventDefault()
        focusCell(length - 1)
        break
    }
  }

  function handlePaste(index: number, e: ClipboardEvent) {
    e.preventDefault()
    const pastedText = e.clipboardData?.getData('text') ?? ''
    handleInput(index, pastedText)
  }

  return html.div(
    attr.class(computedOf(size, disabled)(generateOTPClasses)),
    attr.style(Value.map(color, generateOTPStyles)),
    attr.role('group'),
    aria.label('One-time password input'),

    ...Array.from({ length }, (_, i) => {
      const cellId = `${otpId}-cell-${i}`

      return html.input(
        WithElement((el: HTMLElement) => {
          // Store ref to this input element
          inputRefs[i] = el as HTMLInputElement
          if (autoFocus && i === 0) {
            requestAnimationFrame(() => (el as HTMLInputElement).focus())
          }
          return Empty
        }),
        attr.id(cellId),
        attr.type(mask ? 'password' : 'text'),
        attr.inputmode(type === 'numeric' ? 'numeric' : 'text'),
        attr.maxlength(1),
        attr.autocomplete('one-time-code'),
        attr.class('bc-otp-input__cell'),
        attr.class(
          focusedIndex.map(fi =>
            fi === i ? 'bc-otp-input__cell--focused' : ''
          )
        ),
        attr.placeholder(placeholder),
        attr.disabled(disabled),
        aria.label(`Digit ${i + 1} of ${length}`),
        attr.value(cells.map(c => c[i] ?? '')),

        on.focus(() => {
          focusedIndex.set(i)
          const inputEl = inputRefs[i]
          if (inputEl != null) inputEl.select()
        }),

        on.blur(() => {
          focusedIndex.set(null)
        }),

        on.input((e: Event) => {
          const target = e.target as HTMLInputElement
          handleInput(i, target.value)
          // Reset the input value to single char
          target.value = cells.value[i] ?? ''
        }),

        on.keydown((e: KeyboardEvent) => handleKeyDown(i, e)),

        on.paste((e: ClipboardEvent) => handlePaste(i, e))
      )
    })
  )
}
