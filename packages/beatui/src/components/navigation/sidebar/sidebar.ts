import {
  attr,
  html,
  makeProviderMark,
  Provider,
  Provide,
  TNode,
  Value,
} from '@tempots/dom'

/**
 * Background mode for the {@link Sidebar} component, controlling its visual appearance
 * in relation to the surrounding page content.
 */
export type SidebarBackgroundMode = 'light' | 'dark'

/**
 * Configuration options for the {@link Sidebar} component.
 */
export type SidebarOptions = {
  /**
   * Background mode controlling the sidebar's visual appearance.
   * When set to `'dark'`, the sidebar applies a dark background CSS modifier class.
   * @default 'light'
   */
  backgroundMode?: Value<SidebarBackgroundMode>
}

/**
 * Context value provided by the {@link Sidebar} component to its descendants.
 * Child components (e.g., {@link SidebarLink}, {@link SidebarGroup}) can consume
 * this context to adapt their appearance to the sidebar's background mode.
 */
export type SidebarContextValue = {
  /** The current background mode of the enclosing sidebar. */
  backgroundMode: SidebarBackgroundMode
}

/**
 * Provider for the sidebar context, allowing child components to access the sidebar's
 * background mode. Uses the Tempo provider pattern with a `mark` and `create` function.
 *
 * @example
 * ```typescript
 * Use(SidebarContext, (ctx) => {
 *   // ctx.backgroundMode is 'light' or 'dark'
 *   return html.span(`Background: ${ctx.backgroundMode}`)
 * })
 * ```
 */
export const SidebarContext: Provider<SidebarContextValue, object> = {
  mark: makeProviderMark<SidebarContextValue>('SidebarContext'),

  create: (_options?: object) => {
    // Default context value - will be overridden by actual Sidebar component
    const value: SidebarContextValue = {
      backgroundMode: 'light',
    }

    return {
      value,
      dispose: () => {
        // No cleanup needed for default context
      },
    }
  },
}

/**
 * Sidebar navigation container that provides a vertical navigation panel with context
 * for child components.
 *
 * The sidebar provides a {@link SidebarContext} to its descendants, allowing child
 * components like {@link SidebarLink} and {@link SidebarGroup} to adapt their styling
 * based on the sidebar's background mode.
 *
 * @param options - Configuration options controlling the sidebar's background appearance
 * @param children - Child content, typically {@link SidebarGroup}, {@link SidebarLink},
 *   and {@link SidebarSeparator} components
 * @returns A renderable node
 *
 * @example
 * ```typescript
 * Sidebar(
 *   { backgroundMode: 'dark' },
 *   SidebarGroup(
 *     { header: html.span('Navigation') },
 *     SidebarLink({ content: 'Dashboard', icon: 'home', href: '/' }),
 *     SidebarLink({ content: 'Settings', icon: 'cog', href: '/settings' }),
 *   ),
 *   SidebarSeparator(),
 *   SidebarLink({ content: 'Logout', icon: 'logout', onClick: handleLogout }),
 * )
 * ```
 */
export function Sidebar(
  { backgroundMode = 'light' }: SidebarOptions,
  ...children: TNode[]
) {
  return Provide(
    SidebarContext,
    Value.map(
      backgroundMode,
      (mode): SidebarContextValue => ({
        backgroundMode: mode,
      })
    ),
    () =>
      html.div(
        attr.class('bc-sidebar'),
        attr.class(
          Value.map(backgroundMode, (mode): string =>
            mode === 'dark' ? 'bc-sidebar--dark-bg' : ''
          )
        ),
        ...children
      )
  )
}
