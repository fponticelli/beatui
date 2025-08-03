/**
 * @fileoverview BeatUI Internationalization (i18n) Module
 *
 * Provides reactive internationalization support with:
 * - Locale management with persistent storage
 * - Text direction (RTL/LTR) support with automatic detection
 * - Dynamic translation loading with type safety
 * - Reactive updates throughout the application
 *
 * @example
 * ```typescript
 * import { html, prop, Provide, Use } from '@tempots/dom'
 * import { Locale, makeMessages } from '@tempots/beatui'
 *
 * // Set up locale provider with direction support
 * const app = Provide(Locale, {}, () => Use(Locale, ({
 *   locale, setLocale, direction, setDirectionPreference
 * }) => {
 *   // Create translation system
 *   const { t } = makeMessages({
 *     locale,
 *     defaultMessages: {
 *       welcome: () => 'Welcome!',
 *       greeting: (name: string) => `Hello, ${name}!`
 *     },
 *     localeLoader: locale => import(`./locales/${locale}.js`)
 *   })
 *   return html.div(
 *     html.h1(t.welcome()),
 *     html.p(t.userGreeting(prop('User')))
 *   )
 * })
 * ```
 */

export * from './translate'
export * from './direction'
