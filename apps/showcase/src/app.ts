import { html, Async } from '@tempots/dom'
import { RootRouter } from '@tempots/ui'
import { BeatUI } from '@tempots/beatui'
import { AppLayout } from './app-layout'

export const App = () => {
  return BeatUI(
    {},
    AppLayout({
      children: RootRouter({
        '/': () => Async(import('./pages/home'), ({ default: Page }) => Page()),
        '/buttons': () =>
          Async(import('./pages/buttons'), ({ default: Page }) => Page()),
        '/badges-tags': () =>
          Async(import('./pages/badges-tags'), ({ default: Page }) => Page()),
        '/inputs': () =>
          Async(import('./pages/inputs'), ({ default: Page }) => Page()),
        '/selects': () =>
          Async(import('./pages/selects'), ({ default: Page }) => Page()),
        '/checkboxes-toggles': () =>
          Async(import('./pages/checkboxes-toggles'), ({ default: Page }) =>
            Page()
          ),
        '/radio-groups': () =>
          Async(import('./pages/radio-groups'), ({ default: Page }) => Page()),
        '/progress-loading': () =>
          Async(import('./pages/progress-loading'), ({ default: Page }) =>
            Page()
          ),
        '/dividers': () =>
          Async(import('./pages/dividers'), ({ default: Page }) => Page()),
        '/breadcrumbs': () =>
          Async(import('./pages/breadcrumbs'), ({ default: Page }) => Page()),
        '/tooltips': () =>
          Async(import('./pages/tooltips'), ({ default: Page }) => Page()),
        '/avatar': () =>
          Async(import('./pages/avatar'), ({ default: Page }) => Page()),
        '/tabs': () =>
          Async(import('./pages/tabs'), ({ default: Page }) => Page()),
        '/keyboard-shortcuts': () =>
          Async(import('./pages/keyboard-shortcuts'), ({ default: Page }) =>
            Page()
          ),
        '/empty-states': () =>
          Async(import('./pages/empty-states'), ({ default: Page }) => Page()),
        '/pagination': () =>
          Async(import('./pages/pagination'), ({ default: Page }) => Page()),
        '/presence-overlay': () =>
          Async(import('./pages/presence-overlay'), ({ default: Page }) =>
            Page()
          ),
        '/floating-toolbar': () =>
          Async(import('./pages/floating-toolbar'), ({ default: Page }) =>
            Page()
          ),
        '/command-palette': () =>
          Async(import('./pages/command-palette'), ({ default: Page }) =>
            Page()
          ),
        '/block-command-palette': () =>
          Async(import('./pages/block-command-palette'), ({ default: Page }) =>
            Page()
          ),
        '/*': () => html.div('Not Found'),
      }),
    })
  )
}
