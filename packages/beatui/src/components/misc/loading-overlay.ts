import { TNode, Value, attr, html, When, Fragment } from '@tempots/dom'
import { Icon } from '../data'
import { ControlSize } from '../theme'

/**
 * Options for the {@link LoadingOverlay} component.
 */
export interface LoadingOverlayOptions {
  /** Whether the overlay is visible. @default false */
  visible: Value<boolean>
  /** Optional message to display below the spinner. */
  message?: Value<string>
  /** Size of the spinner icon. @default 'lg' */
  size?: Value<ControlSize>
}

/**
 * A semi-transparent overlay with a centered loading spinner.
 *
 * Place inside a container with `position: relative` to cover its content.
 * When `visible` is false, the overlay is removed from the DOM entirely.
 *
 * @example
 * ```ts
 * html.div(
 *   attr.style('position: relative'),
 *   LoadingOverlay({ visible: loading, message: 'Loading data...' }),
 *   // ... content underneath
 * )
 * ```
 */
export function LoadingOverlay(options: LoadingOverlayOptions): TNode {
  const { visible, message, size = 'lg' } = options
  return When(visible, () =>
    html.div(
      attr.class('bc-loading-overlay'),
      html.div(
        attr.class('bc-loading-overlay__content'),
        Icon({ icon: 'line-md:loading-twotone-loop', size }),
        message != null
          ? html.span(attr.class('bc-loading-overlay__message'), message)
          : Fragment()
      )
    )
  )
}
