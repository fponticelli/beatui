import {
  attr,
  html,
  makeProviderMark,
  Provider,
  Provide,
  TNode,
  Value,
} from '@tempots/dom'

export type SidebarBackgroundMode = 'light' | 'dark'

export type SidebarOptions = {
  backgroundMode?: Value<SidebarBackgroundMode>
}

export type SidebarContextValue = {
  backgroundMode: SidebarBackgroundMode
}

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
