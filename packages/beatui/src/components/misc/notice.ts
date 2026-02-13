import {
  TNode,
  Value,
  attr,
  html,
  computedOf,
  When,
  prop,
  Use,
  Unless,
  Ensure,
  Renderable,
} from '@tempots/dom'
import { Icon } from '../data'
import type { ThemeColorName } from '../../tokens'
import { BeatUII18n } from '../../beatui-i18n'

import { CloseButton } from '../button'

/**
 * Visual variant for the Notice component, determining its color scheme
 * and semantic meaning.
 *
 * - `'info'` - Informational notice (blue tones)
 * - `'success'` - Success confirmation (green tones)
 * - `'warning'` - Warning or caution (yellow/amber tones)
 * - `'danger'` - Error or critical alert (red tones)
 */
export type NoticeVariant = 'info' | 'success' | 'warning' | 'danger'

/**
 * Visual tone for the Notice component, controlling its visual prominence.
 *
 * - `'subtle'` - Lighter background with softer colors
 * - `'prominent'` - Stronger background with higher contrast
 */
export type NoticeTone = 'subtle' | 'prominent'

/**
 * ARIA role for the Notice component, determining how assistive technologies
 * announce the notice.
 *
 * - `'status'` - Non-urgent information updates (used for info, success, warning)
 * - `'alert'` - Urgent, time-sensitive information (used for danger by default)
 */
export type NoticeRole = 'status' | 'alert'

/**
 * Configuration options for the {@link Notice} component.
 */
export type NoticeOptions = {
  /**
   * The semantic variant controlling color scheme and default icon.
   * @default 'info'
   */
  variant?: Value<NoticeVariant>
  /**
   * The visual tone controlling background intensity.
   * @default 'subtle'
   */
  tone?: Value<NoticeTone>
  /**
   * ARIA role override. When not specified, defaults to `'alert'` for the
   * `'danger'` variant and `'status'` for all others.
   */
  role?: Value<NoticeRole | undefined>
  /**
   * Optional title text displayed prominently above the notice body content.
   */
  title?: Value<string | undefined>
  /**
   * Icon identifier string (Iconify format), or `false` to suppress the icon entirely.
   * When `undefined`, a default icon is chosen based on the variant.
   */
  icon?: Value<string | false | undefined>
  /**
   * Whether the notice can be dismissed by the user via a close button.
   * @default false
   */
  closable?: Value<boolean>
  /**
   * Callback invoked when the notice is dismissed. If provided, the close
   * button is shown regardless of the `closable` setting.
   */
  onDismiss?: () => void
  /**
   * Additional CSS class name(s) to apply to the notice root element.
   */
  class?: Value<string>
}

function variantToIcon(variant: NoticeVariant): string {
  switch (variant) {
    case 'success':
      return 'material-symbols:check-circle-outline'
    case 'warning':
      return 'material-symbols:warning-outline'
    case 'danger':
      return 'material-symbols:error-outline'
    case 'info':
    default:
      return 'material-symbols:info-outline'
  }
}

function variantToColor(variant: NoticeVariant): ThemeColorName {
  switch (variant) {
    case 'success':
      return 'success'
    case 'warning':
      return 'warning'
    case 'danger':
      return 'danger'
    case 'info':
    default:
      return 'info'
  }
}

function generateNoticeClasses(
  variant: NoticeVariant,
  tone: NoticeTone,
  dismissible: boolean,
  extra?: string
) {
  const classes = [
    'bc-notice',
    `bc-notice--${variant}`,
    `bc-notice--tone-${tone}`,
  ]
  if (dismissible) classes.push('bc-notice--dismissible')
  if (extra && extra.length > 0) classes.push(extra)
  return classes.join(' ')
}

/**
 * Renders a dismissible notice/alert banner with variant-driven styling,
 * an optional icon, title, and close button. Supports accessible ARIA roles
 * that automatically adapt based on the variant.
 *
 * When dismissed, the notice is hidden from the DOM and the optional
 * `onDismiss` callback is invoked.
 *
 * @param options - Configuration options for the notice.
 * @param children - Content nodes rendered inside the notice body.
 * @returns A renderable notice element.
 *
 * @example
 * ```typescript
 * // Simple informational notice
 * Notice(
 *   { variant: 'info', title: 'Tip' },
 *   'You can customize your dashboard in Settings.'
 * )
 *
 * // Closable danger notice with callback
 * Notice(
 *   {
 *     variant: 'danger',
 *     title: 'Error',
 *     closable: true,
 *     onDismiss: () => console.log('dismissed'),
 *   },
 *   'Something went wrong. Please try again.'
 * )
 *
 * // Notice without icon
 * Notice(
 *   { variant: 'warning', icon: false, tone: 'prominent' },
 *   'This action cannot be undone.'
 * )
 * ```
 */
export function Notice(
  {
    variant = 'info',
    tone = 'subtle',
    role,
    title,
    icon,
    closable = false,
    onDismiss,
    class: cls,
  }: NoticeOptions,
  ...children: TNode[]
): Renderable {
  // Manage local visibility when closable without external state
  const visible = prop(true)

  return When(visible, () => {
    const isDismissible = Value.map(
      closable,
      v => Boolean(v) || onDismiss != null
    )
    const currentVariant = Value.map(variant, v => v ?? 'info')
    const currentTone = Value.map(tone, v => v ?? 'subtle')
    // Default role: alert for error, status otherwise, unless overridden
    const ariaRole = computedOf(
      role,
      currentVariant
    )(
      (r, v) =>
        (r ?? (v === 'danger' ? 'alert' : 'status')) as 'status' | 'alert'
    )
    return Use(BeatUII18n, t =>
      html.div(
        attr.class(
          computedOf(
            currentVariant,
            currentTone,
            isDismissible,
            cls
          )((v, tn, dism, extra) => generateNoticeClasses(v, tn, dism, extra))
        ),
        // Accessibility role mapping (always defined)
        attr.role(Value.map(ariaRole, r => r as string)),
        Unless(
          Value.map(icon, ic => ic === false),
          () =>
            html.div(
              attr.class('bc-notice__icon'),
              Icon({
                icon: computedOf(
                  icon,
                  currentVariant
                )((ic, v) =>
                  ic === undefined ? variantToIcon(v) : String(ic)
                ),
                size: 'md',
                color: Value.map(currentVariant, variantToColor),
              })
            )
        ),
        html.div(
          attr.class('bc-notice__body'),
          Ensure(title, title =>
            html.div(attr.class('bc-notice__title'), title)
          ),
          html.div(attr.class('bc-notice__content'), ...children)
        ),
        When(isDismissible, () =>
          CloseButton({
            size: 'xs',
            label: t.$.closeModal,
            onClick: () => {
              visible.set(false)
              onDismiss?.()
            },
          })
        )
      )
    )
  })
}
