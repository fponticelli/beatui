import {
  aria,
  attr,
  computedOf,
  html,
  prop,
  Renderable,
  TNode,
  Use,
  Value,
  OnDispose,
  When,
} from '@tempots/dom'
import { BeatUII18n } from '../../beatui-i18n'
import { ControlSize, ButtonVariant } from '../theme'
import { ThemeColorName } from '../../tokens'
import { RadiusName } from '../../tokens/radius'
import { Icon } from '../data/icon'
import { Button } from './button'

/** Configuration options for the {@link CopyButton} component. */
export interface CopyButtonOptions {
  /** The text to copy to clipboard when clicked. @default 'Hello World!'' */
  text: Value<string>
  /** Size of the button. @default 'sm' */
  size?: Value<ControlSize>
  /** Theme color. @default 'base' */
  color?: Value<ThemeColorName>
  /** Visual variant. @default 'subtle' */
  variant?: Value<ButtonVariant>
  /** Border radius. @default 'sm' */
  roundedness?: Value<RadiusName>
  /** Whether the button is disabled. @default false */
  disabled?: Value<boolean>
  /** Duration in ms to show the "copied" state before resetting. @default 2000 */
  timeout?: Value<number>
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers / insecure contexts
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch {
      return false
    }
  }
}

/**
 * A button that copies text to the clipboard with visual feedback.
 *
 * Shows a copy icon in its idle state. When clicked, copies the provided text
 * to the clipboard and briefly shows a checkmark icon before resetting.
 *
 * @param options - Configuration for the copy button
 * @param children - Optional additional children appended to the button
 * @returns A copy button element
 *
 * @example
 * ```ts
 * CopyButton({ text: 'Hello, world!' })
 * ```
 *
 * @example
 * ```ts
 * CopyButton({ text: apiKey, variant: 'outline', color: 'primary' }, 'Copy Key')
 * ```
 */
export function CopyButton(
  {
    text,
    size = 'sm',
    color = 'base',
    variant = 'subtle',
    roundedness = 'sm',
    disabled = false,
    timeout = 2000,
  }: CopyButtonOptions,
  ...children: TNode[]
): Renderable {
  const state = prop<'idle' | 'copied'>('idle')
  let timer: ReturnType<typeof setTimeout> | undefined

  return Use(BeatUII18n, t => {
    const isCopied = Value.map(state, s => s === 'copied')
    const label = computedOf(
      state,
      t.$.copyButton.$.copied,
      t.$.copyButton.$.copyToClipboard
    )((s, copiedText, copyText) => (s === 'copied' ? copiedText : copyText))

    const handleClick = async () => {
      if (Value.get(disabled)) return
      const success = await copyToClipboard(Value.get(text))
      if (success) {
        if (timer != null) clearTimeout(timer)
        state.set('copied')
        timer = setTimeout(() => state.set('idle'), Value.get(timeout))
      }
    }

    return html.span(
      attr.class(
        Value.map(state, (s): string =>
          s === 'copied'
            ? 'bc-copy-button bc-copy-button--copied'
            : 'bc-copy-button'
        )
      ),
      OnDispose(() => {
        if (timer != null) clearTimeout(timer)
      }),
      Button(
        {
          variant,
          size,
          roundedness,
          disabled,
          color,
          onClick: handleClick,
        },
        aria.label(label),
        attr.title(label),
        When(
          isCopied,
          () => Icon({ icon: 'lucide:check', size }),
          () => Icon({ icon: 'lucide:copy', size })
        ),
        ...children
      )
    )
  })
}
