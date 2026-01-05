import { html } from '@tempots/dom'
import { RootRouter } from '@tempots/ui'
import { BeatUI } from '@tempots/beatui'
import { AppLayout } from './app-layout'
import { Async } from '@tempots/dom'

export const App = () => {
  return BeatUI(
    {
      includeAuthI18n: true,
    },
    AppLayout({
      children: RootRouter({
        '/': () => Async(import('./pages/home'), ({ default: Page }) => Page()),
        '/about': () =>
          Async(import('./pages/about'), ({ default: Page }) => Page()),
        '/action-card': () =>
          Async(import('./pages/action-card'), ({ default: Page }) => Page()),
        '/authentication': () =>
          Async(import('./pages/authentication'), ({ default: Page }) =>
            Page()
          ),
        '/badge': () =>
          Async(import('./pages/badge'), ({ default: Page }) => Page()),
        '/authentication/components': () =>
          Async(
            import('./pages/authentication-components'),
            ({ default: Page }) => Page()
          ),
        '/button': () =>
          Async(import('./pages/button'), ({ default: Page }) => Page()),
        '/dropdown': () =>
          Async(import('./pages/dropdown'), ({ default: Page }) => Page()),
        '/combobox': () =>
          Async(import('./pages/combobox'), ({ default: Page }) => Page()),
        '/switch': () =>
          Async(import('./pages/switch'), ({ default: Page }) => Page()),
        '/collapse': () =>
          Async(import('./pages/collapse'), ({ default: Page }) => Page()),
        '/icon': () =>
          Async(import('./pages/icon'), ({ default: Page }) => Page()),
        '/link': () =>
          Async(import('./pages/link'), ({ default: Page }) => Page()),
        '/modal': () =>
          Async(import('./pages/modal'), ({ default: Page }) => Page()),
        '/lightbox': () =>
          Async(import('./pages/lightbox'), ({ default: Page }) => Page()),
        '/announcement-bar': () =>
          Async(import('./pages/announcement-bar'), ({ default: Page }) =>
            Page()
          ),
        '/video-player': () =>
          Async(import('./pages/video-player'), ({ default: Page }) => Page()),
        '/pdf-preview': () =>
          Async(import('./pages/pdf-preview'), ({ default: Page }) => Page()),
        '/pdf-page-viewer': () =>
          Async(import('./pages/pdf-page-viewer'), ({ default: Page }) =>
            Page()
          ),

        '/drawer': () =>
          Async(import('./pages/drawer'), ({ default: Page }) => Page()),
        '/tooltip': () =>
          Async(import('./pages/tooltip'), ({ default: Page }) => Page()),
        '/flyout': () =>
          Async(import('./pages/flyout'), ({ default: Page }) => Page()),
        '/menu': () =>
          Async(import('./pages/menu'), ({ default: Page }) => Page()),
        '/scrollable-panel': () =>
          Async(import('./pages/scrollable-panel'), ({ default: Page }) =>
            Page()
          ),
        '/rtl-ltr': () =>
          Async(import('./pages/rtl-ltr'), ({ default: Page }) => Page()),
        '/segmented-control': () =>
          Async(import('./pages/segmented-control'), ({ default: Page }) =>
            Page()
          ),
        '/sidebar': () =>
          Async(import('./pages/sidebar'), ({ default: Page }) => Page()),
        '/tabs': () =>
          Async(import('./pages/tabs'), ({ default: Page }) => Page()),
        '/table': () =>
          Async(import('./pages/table'), ({ default: Page }) => Page()),
        '/tags': () =>
          Async(import('./pages/tags'), ({ default: Page }) => Page()),
        '/tags-input': () =>
          Async(import('./pages/tags-input'), ({ default: Page }) => Page()),
        '/form': () =>
          Async(import('./pages/form'), ({ default: Page }) => Page()),
        '/file-input': () =>
          Async(import('./pages/file-input'), ({ default: Page }) => Page()),
        '/page-drop-zone': () =>
          Async(import('./pages/page-drop-zone'), ({ default: Page }) =>
            Page()
          ),
        '/color-input': () =>
          Async(import('./pages/color-input'), ({ default: Page }) => Page()),
        '/color-swatch': () =>
          Async(import('./pages/color-swatch'), ({ default: Page }) => Page()),
        '/editable-text': () =>
          Async(import('./pages/editable-text'), ({ default: Page }) => Page()),
        '/breakpoint': () =>
          Async(import('./pages/breakpoint'), ({ default: Page }) => Page()),
        '/nine-slice-scroll-view': () =>
          Async(import('./pages/nine-slice-scroll-view'), ({ default: Page }) =>
            Page()
          ),
        '/json-schema-form': () =>
          Async(import('./pages/json-schema-form'), ({ default: Page }) =>
            Page()
          ),
        '/json-schema-custom-widgets': () =>
          Async(
            import('./pages/json-schema-custom-widgets'),
            ({ default: Page }) => Page()
          ),
        '/monaco-editor': () =>
          Async(import('./pages/monaco-editor'), ({ default: Page }) => Page()),
        '/prosemirror-editor': () =>
          Async(import('./pages/prosemirror-editor'), ({ default: Page }) =>
            Page()
          ),
        '/mask-input': () =>
          Async(import('./pages/mask-input'), ({ default: Page }) => Page()),
        '/toolbar': () =>
          Async(import('./pages/toolbar'), ({ default: Page }) => Page()),
        '/temporal': () =>
          Async(import('./pages/temporal'), ({ default: Page }) => Page()),
        '/inputs': () =>
          Async(import('./pages/inputs'), ({ default: Page }) => Page()),
        '/control': () =>
          Async(import('./pages/control'), ({ default: Page }) => Page()),
        '/markdown': () =>
          Async(import('./pages/markdown'), ({ default: Page }) => Page()),
        '/notification': () =>
          Async(import('./pages/notification'), ({ default: Page }) => Page()),
        '/notification-service': () =>
          Async(import('./pages/notification-service'), ({ default: Page }) =>
            Page()
          ),
        '/x-ui-usage': () =>
          Async(import('./pages/x-ui-usage'), ({ default: Page }) => Page()),
        '/notice': () =>
          Async(import('./pages/notice'), ({ default: Page }) => Page()),
        '/ribbon': () =>
          Async(import('./pages/ribbon'), ({ default: Page }) => Page()),
        '/*': () => html.div('Not Found'),
      }),
    })
  )
}
