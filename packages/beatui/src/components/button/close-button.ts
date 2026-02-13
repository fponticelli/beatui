import {
  aria,
  attr,
  coalesce,
  Renderable,
  TNode,
  Use,
  Value,
} from '@tempots/dom'
import { BeatUII18n } from '../../beatui-i18n'
import { ControlSize } from '../theme'
import { ThemeColorName } from '../../tokens'
import { RadiusName } from '../../tokens/radius'
import { Icon } from '../data/icon'
import { Button } from './button'

/** Configuration options for the {@link CloseButton} component. */
export type CloseButtonOptions = {
  /** Size of the close button icon and hit target. @default 'sm' */
  size?: Value<ControlSize>
  /** Icon name from Iconify. @default 'line-md:close' */
  icon?: Value<string>
  /** Whether the button is disabled. */
  disabled?: Value<boolean>
  /** Border radius of the button. @default 'full' */
  roundedness?: Value<RadiusName>
  /** Theme color for the icon. @default 'base' */
  color?: Value<ThemeColorName>
  /** Callback invoked when the button is clicked. */
  onClick?: () => void
  /** Localized label for screen readers. Defaults to the i18n `closeModal` translation. */
  label?: Value<string>
}

/**
 * A small icon-only button for dismissing modals, drawers, notifications, and tags.
 * Renders as a text-variant button with a close icon (X) and proper ARIA labeling
 * for screen reader accessibility.
 *
 * @param options - Configuration for size, icon, and behavior
 * @param children - Additional child nodes appended to the button
 * @returns A Renderable button element
 *
 * @example
 * ```typescript
 * CloseButton({ onClick: () => modal.close() })
 * ```
 *
 * @example
 * ```typescript
 * // Custom icon and label
 * CloseButton({
 *   icon: 'mdi:close-circle',
 *   label: 'Dismiss notification',
 *   onClick: handleDismiss
 * })
 * ```
 */
export function CloseButton(
  {
    size = 'sm',
    icon = 'line-md:close',
    disabled,
    roundedness = 'full',
    color = 'base',
    onClick,
    label,
  }: CloseButtonOptions,
  ...children: TNode[]
): Renderable {
  return Use(BeatUII18n, t => {
    const title = coalesce(label, t.$.closeModal)
    return Button(
      {
        variant: 'text',
        size,
        roundedness,
        disabled,
        color,
        onClick,
      },
      attr.title(title),
      aria.label(title),
      ...children,
      Icon({ icon, size: size ?? 'sm' })
    )
  })
}
