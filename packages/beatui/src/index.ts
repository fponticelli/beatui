/**
 * Main entry point for the `@tempots/beatui` component library.
 *
 * Exports all core UI components (buttons, forms, layout, overlays, navigation,
 * typography, data display), the theme system, design tokens, i18n utilities,
 * and helper functions. For optional modules (editors, auth, JSON schema), use
 * the dedicated subpath imports.
 *
 * ```ts
 * import { Button, TextInput, Modal, Theme } from '@tempots/beatui'
 * ```
 *
 * @module
 */

// Re-export commonly used functions from @tempots/dom
export { Use } from '@tempots/dom'

export * from './beatui-i18n'
export * from './components/beatui'
export * from './components/button'
export * from './components/content'
export * from './components/data'
export * from './components/form'
export * from './components/i18n'
export * from './components/layout'
export * from './components/misc'
export * from './components/navigation'
export * from './components/overlay'
export * from './components/theme'
export * from './components/typography'
export * from './components/media'
export * from './i18n'
export * from './tokens'
export * from './tailwind'
export * from './utils'
export * from './temporal'

// JSON Schema custom widget types and utilities
export {
  type CustomWidgets,
  type CustomWidgetRegistration,
  type WidgetFactory,
  forXUI,
  forFormat,
  forTypeAndFormat,
} from './components/json-schema/widgets/widget-customization'
