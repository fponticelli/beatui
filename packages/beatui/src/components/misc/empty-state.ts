import { TNode, Value, attr, html, computedOf, Ensure } from '@tempots/dom'
import { Icon } from '../data/icon'
import type { IconSize } from '../theme'

/**
 * Size options for the EmptyState component.
 */
export type EmptyStateSize = 'sm' | 'md' | 'lg'

/**
 * Configuration options for the {@link EmptyState} component.
 */
export interface EmptyStateOptions {
  /**
   * Icon identifier string (Iconify format) to display above the title.
   * When `undefined`, no icon is rendered.
   */
  icon?: Value<string | undefined>
  /**
   * Main heading text for the empty state.
   */
  title: Value<string>
  /**
   * Optional description text displayed below the title.
   */
  description?: Value<string | undefined>
  /**
   * Visual size of the empty state component.
   * @default 'md'
   */
  size?: Value<EmptyStateSize>
  /**
   * Optional action element (e.g., a button) displayed below the description.
   */
  action?: TNode
  /**
   * Additional CSS class name(s) to apply to the root element.
   */
  class?: Value<string>
}

function generateEmptyStateClasses(size: EmptyStateSize, extra?: string) {
  const classes = ['bc-empty-state', `bc-empty-state--size-${size}`]
  if (extra && extra.length > 0) classes.push(extra)
  return classes.join(' ')
}

/**
 * Renders an empty state UI component used to communicate when no content or
 * data is available. Typically includes an icon, title, description, and an
 * optional call-to-action button.
 *
 * Empty states improve UX by explaining why content is missing and suggesting
 * next steps, rather than showing a blank screen.
 *
 * @param options - Configuration options for the empty state
 * @returns A centered empty state element with icon, text, and optional action
 *
 * @example
 * ```typescript
 * import { EmptyState } from '@tempots/beatui'
 * import { Button } from '@tempots/beatui'
 *
 * EmptyState({
 *   icon: 'material-symbols:inbox-outline',
 *   title: 'No messages',
 *   description: 'You have no messages in your inbox.',
 *   size: 'md'
 * })
 * ```
 *
 * @example
 * ```typescript
 * // With action button
 * EmptyState({
 *   icon: 'material-symbols:add-circle-outline',
 *   title: 'No projects yet',
 *   description: 'Create your first project to get started.',
 *   size: 'lg',
 *   action: Button(
 *     { variant: 'filled', color: 'primary' },
 *     'Create Project'
 *   )
 * })
 * ```
 *
 * @example
 * ```typescript
 * // Minimal empty state without icon
 * EmptyState({
 *   title: 'Nothing to see here',
 *   description: 'Try adjusting your filters.',
 *   size: 'sm'
 * })
 * ```
 */
export function EmptyState({
  icon,
  title,
  description,
  size = 'md',
  action,
  class: cls,
}: EmptyStateOptions) {
  return html.div(
    attr.class(
      computedOf(
        size,
        cls
      )((sz, extra) => generateEmptyStateClasses(sz ?? 'md', extra))
    ),
    Ensure(icon, icn =>
      html.div(
        attr.class('bc-empty-state__icon'),
        Icon({
          icon: icn,
          size: Value.map(size, (sz): IconSize => {
            const s = sz ?? 'md'
            return s === 'sm' ? 'lg' : s === 'lg' ? 'xl' : 'xl'
          }),
          accessibility: 'decorative',
        })
      )
    ),
    html.h3(attr.class('bc-empty-state__title'), title),
    Ensure(description, desc =>
      html.p(attr.class('bc-empty-state__description'), desc)
    ),
    Ensure(action, act => html.div(attr.class('bc-empty-state__action'), act))
  )
}
