import en from './locales/en'

/**
 * The default messages for BeatUI components, sourced from the English locale.
 *
 * This object serves as the fallback translation and as the type reference
 * for all locale-specific message bundles.
 *
 * @example
 * ```typescript
 * import { defaultMessages } from '@tempots/beatui'
 *
 * console.log(defaultMessages.confirm) // 'Confirm'
 * console.log(defaultMessages.cancel)  // 'Cancel'
 * ```
 */
export const defaultMessages = en

/**
 * The default locale code used by BeatUI when no locale is explicitly set.
 *
 * @default 'en'
 */
export const defaultLocale = 'en'

/**
 * The type representing the complete set of BeatUI UI messages.
 *
 * Derived from the structure of the default (English) messages object.
 * All locale translation files must conform to this type.
 *
 * @example
 * ```typescript
 * import type { BeatUIMessages } from '@tempots/beatui'
 *
 * const myMessages: BeatUIMessages = {
 *   loadingExtended: 'Cargando, por favor espere',
 *   loadingShort: 'Cargando...',
 *   // ... all other required keys
 * }
 * ```
 */
export type BeatUIMessages = typeof defaultMessages
