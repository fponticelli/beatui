import { html } from '@tempots/dom'
import { RootRouter } from '@tempots/ui'
import { BeatUI } from '@tempots/beatui'
import { HomePage } from './pages/home'
import { AppLayout } from './app-layout'
import { ButtonPage } from './pages/button'
import { ComboboxPage } from './pages/combobox'
import { SwitchPage } from './pages/switch'
import { IconPage } from './pages/icon'
import { LinkPage } from './pages/link'
import { SegmentedControlPage } from './pages/segmented-control'
import { TagsPage } from './pages/tags'
import { FormPage } from './pages/form'
import { EditableTextPage } from './pages/editable-text'
import { BreakpointPage } from './pages/breakpoint'
import { CollapsePage } from './pages/collapse'
import { SidebarPage } from './pages/sidebar'
import { ModalPage } from './pages/modal'
import { DrawerPage } from './pages/drawer'
import { TooltipPage } from './pages/tooltip'
import { FlyoutPage } from './pages/flyout'
import { MenuPage } from './pages/menu'
import { ScrollablePanelPage } from './pages/scrollable-panel'
import { RTLLTRPage } from './pages/rtl-ltr'
import { TabsPage } from './pages/tabs'
import { AuthenticationPage } from './pages/authentication'
import { AuthenticationComponentsPage } from './pages/authentication-components'
import { ColorPickerPage } from './pages/color-picker'
import { FileInputPage } from './pages/file-input'
import { NineSliceScrollViewPage } from './pages/nine-slice-scroll-view'
import { JSONSchemaFormPage } from './pages/json-schema-form'
import { MonacoEditorPage } from './pages/monaco-editor'
import { MilkdownEditorPage } from './pages/milkdown-editor'
import { TagsInputPage } from './pages/tags-input'

export const App = () => {
  return BeatUI(
    {
      includeAuthI18n: true,
    },
    AppLayout({
      children: RootRouter({
        '/': HomePage,
        '/authentication': AuthenticationPage,
        '/authentication/components': AuthenticationComponentsPage,
        '/button': ButtonPage,
        '/combobox': ComboboxPage,
        '/switch': SwitchPage,
        '/collapse': CollapsePage,
        '/icon': IconPage,
        '/link': LinkPage,
        '/modal': ModalPage,
        '/drawer': DrawerPage,
        '/tooltip': TooltipPage,
        '/flyout': FlyoutPage,
        '/menu': MenuPage,
        '/scrollable-panel': ScrollablePanelPage,
        '/rtl-ltr': RTLLTRPage,
        '/segmented-control': SegmentedControlPage,
        '/sidebar': SidebarPage,
        '/tabs': TabsPage,
        '/tags': TagsPage,
        '/tags-input': TagsInputPage,
        '/form': FormPage,
        '/file-input': FileInputPage,
        '/color-picker': ColorPickerPage,
        '/editable-text': EditableTextPage,
        '/breakpoint': BreakpointPage,
        '/nine-slice-scroll-view': NineSliceScrollViewPage,
        '/json-schema-form': JSONSchemaFormPage,
        '/monaco-editor': MonacoEditorPage,
        '/milkdown-editor': MilkdownEditorPage,
        '/*': () => html.div('Not Found'),
      }),
    })
  )
}
