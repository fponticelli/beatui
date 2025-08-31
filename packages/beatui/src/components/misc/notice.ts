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
} from '@tempots/dom'
import { Icon } from '../data'
import type { ThemeColorName } from '@/tokens'
import { BeatUII18n } from '@/beatui-i18n'

import { CloseButton } from '../button'

export type NoticeVariant = 'info' | 'success' | 'warning' | 'error'
export type NoticeTone = 'subtle' | 'prominent'
export type NoticeRole = 'status' | 'alert'

export type NoticeOptions = {
  variant?: Value<NoticeVariant>
  tone?: Value<NoticeTone>
  role?: Value<NoticeRole | undefined>
  title?: Value<string | undefined>
  icon?: Value<string | false | undefined>
  closable?: Value<boolean>
  onDismiss?: () => void
  class?: Value<string>
}

function variantToIcon(variant: NoticeVariant): string {
  switch (variant) {
    case 'success':
      return 'material-symbols:check-circle-outline'
    case 'warning':
      return 'material-symbols:warning-outline'
    case 'error':
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
    case 'error':
      return 'error'
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
): TNode {
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
  )((r, v) => (r ?? (v === 'error' ? 'alert' : 'status')) as 'status' | 'alert')

  // Manage local visibility when closable without external state
  const visible = prop(true)

  const body = Use(BeatUII18n, t =>
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
              )((ic, v) => (ic === undefined ? variantToIcon(v) : String(ic))),
              size: 'md',
              color: Value.map(currentVariant, variantToColor),
            })
          )
      ),
      html.div(
        attr.class('bc-notice__body'),
        Ensure(title, title => html.div(attr.class('bc-notice__title'), title)),
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

  return When(visible, () => body)
}
