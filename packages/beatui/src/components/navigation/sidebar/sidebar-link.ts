import { Icon } from '../../data'
import {
  aria,
  attr,
  DOMContext,
  html,
  on,
  TNode,
  Use,
  Value,
  When,
} from '@tempots/dom'
import { Anchor, Location } from '@tempots/ui'
import type { LocationHandle, NavigationOptions } from '@tempots/ui'
import { buildNavigationOptions } from '../link/navigation-options'
import { createLocationMatcher } from '../link/navigation-link'

/**
 * URL-based navigation action for a {@link SidebarLink}.
 * Navigates to the specified URL using client-side routing.
 */
export type UrlAction = {
  /** The URL or path to navigate to. */
  href: Value<string>
  /**
   * Whether to use the View Transitions API for navigation animations.
   * @default true
   */
  viewTransition?: boolean
  /** Optional state object to pass to the navigation history entry. */
  state?: NavigationOptions['state']
  /** Scroll behavior after navigation. */
  scroll?: NavigationOptions['scroll']
  /** Whether to replace the current history entry instead of pushing a new one. */
  replace?: NavigationOptions['replace']
}

/**
 * Click-based action for a {@link SidebarLink}.
 * Renders the link as a button that invokes the provided callback on click.
 */
export type ClickAction = {
  /** Callback invoked when the sidebar link is clicked. */
  onClick: () => void
}

/**
 * Discriminated union of navigation actions for a {@link SidebarLink}.
 * Either a URL-based navigation or a click-based callback action.
 */
export type LinkAction = UrlAction | ClickAction

/**
 * Configuration options for the {@link SidebarLink} component.
 * Extends {@link LinkAction} to provide either URL-based navigation or click-based actions.
 */
export type SidebarLinkOptions = {
  /** Primary text or node content displayed as the link label. */
  content: TNode
  /** Optional icon identifier displayed at the start of the link. */
  icon?: Value<string>
  /** Optional content displayed at the right side of the link (e.g., badges, counts). */
  right?: TNode
  /**
   * Optional inline action button rendered at the end of the link.
   * Useful for quick actions like delete, settings, or expand/collapse toggles.
   */
  action?: {
    /** Icon identifier for the action button. */
    icon: Value<string>
    /** Accessible label for the action button. */
    label?: Value<string>
    /** Callback invoked when the action button is clicked. Receives the DOM context. */
    onClick?: (ctx: DOMContext) => void
  }
  /** ARIA expanded state, used when the link controls a collapsible section. */
  ariaExpanded?: Value<boolean>
  /** ID of the element this link controls (for ARIA `aria-controls`). */
  ariaControls?: Value<string>
  /** Accessible label for the link (for ARIA `aria-label`). */
  ariaLabel?: Value<string>
} & LinkAction

/**
 * Renders a sidebar link as an anchor element with client-side navigation support.
 *
 * @param options - URL navigation options (href, viewTransition, state, scroll, replace)
 * @param children - Child content for the anchor
 * @returns A renderable anchor node
 */
export function SidebarUrlLink(options: UrlAction, ...children: TNode[]) {
  const navigationOptions = buildNavigationOptions({
    viewTransition: options.viewTransition ?? true,
    state: options.state,
    scroll: options.scroll,
    replace: options.replace,
  })
  return Anchor({ href: options.href, ...navigationOptions }, ...children)
}

/**
 * Renders a sidebar link in its active (current page) state as a non-interactive `<span>`.
 *
 * Used internally by {@link SidebarLink} when the link's href matches the current URL.
 *
 * @param children - Child content for the active link display
 * @returns A renderable span node
 */
export function SidebarActiveLink(...children: TNode[]) {
  return html.span(...children)
}

/**
 * Renders a sidebar link as a `<button>` element for click-based actions.
 *
 * Supports ARIA attributes for accessibility when the button controls a collapsible
 * section or acts as a toggle.
 *
 * @param options - Click action and optional ARIA attributes
 * @param children - Child content for the button
 * @returns A renderable button node
 */
export function SidebarClickLink(
  options: ClickAction &
    Partial<
      Pick<SidebarLinkOptions, 'ariaExpanded' | 'ariaControls' | 'ariaLabel'>
    >,
  ...children: TNode[]
) {
  return html.button(
    attr.type('button'),
    on.click(options.onClick),
    options.ariaExpanded != null
      ? aria.expanded(
          Value.map(
            options.ariaExpanded,
            expanded => expanded as boolean | 'undefined'
          )
        )
      : null,
    options.ariaControls != null ? aria.controls(options.ariaControls) : null,
    options.ariaLabel != null ? aria.label(options.ariaLabel) : null,
    ...children
  )
}

/**
 * Sidebar navigation link component that supports both URL-based navigation and click-based actions.
 *
 * For URL-based links, automatically detects the active state by comparing the link's `href`
 * with the current URL via the `Location` provider. Active links render as non-interactive
 * `<span>` elements, while inactive links render as client-side navigating anchors.
 *
 * For click-based links (when `onClick` is provided), renders as a `<button>` element.
 *
 * @param options - Configuration options including content, icon, action, and link behavior
 * @returns A renderable node
 *
 * @example
 * ```typescript
 * // URL-based navigation link
 * SidebarLink({
 *   content: 'Dashboard',
 *   icon: 'home',
 *   href: '/dashboard',
 * })
 * ```
 *
 * @example
 * ```typescript
 * // Click-based action link with an inline action button
 * SidebarLink({
 *   content: 'Projects',
 *   icon: 'folder',
 *   onClick: () => toggleProjectsPanel(),
 *   ariaExpanded: isExpanded,
 *   action: {
 *     icon: 'plus',
 *     label: 'Create project',
 *     onClick: () => createProject(),
 *   },
 * })
 * ```
 */
export function SidebarLink(options: SidebarLinkOptions) {
  const children = [attr.class('bc-sidebar-link')] as TNode[]
  if (options.icon != null) {
    children.push(
      html.span(
        attr.class('bc-sidebar-link--icon'),
        Icon({ icon: options.icon })
      )
    )
  }
  children.push(
    html.span(attr.class('bc-sidebar-link__content'), options.content)
  )
  if (options.right != null) {
    children.push(
      html.span(attr.class('bc-sidebar-link__right'), options.right)
    )
  }
  if (options.action != null) {
    children.push(
      html.button(
        attr.type('button'),
        attr.class('bc-sidebar-link--action'),
        on.click((_, ctx) => {
          options.action?.onClick?.(ctx)
        }),
        Icon({ icon: options.action?.icon })
      )
    )
  }
  if ('onClick' in options) {
    return SidebarClickLink(options, ...children)
  }
  return Use(Location, (locationHandle: LocationHandle) => {
    const isActive = locationHandle.matchSignal(
      createLocationMatcher(options.href, 'exact'),
      {
        includeSearch: false,
        includeHash: false,
      }
    )

    return When(
      isActive,
      () => SidebarActiveLink(...children),
      () => SidebarUrlLink(options, ...children)
    )
  })
}
