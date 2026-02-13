import {
  Empty,
  Fragment,
  Provide,
  Task,
  TNode,
  WithProvider,
} from '@tempots/dom'
import { AppearancePreference, Theme, ThemeAppearance } from './theme'
import { Locale } from './i18n'
import { Location, NavigationService } from '@tempots/ui'
import { BeatUII18n } from '../beatui-i18n'
import { LocaleDirection } from './i18n/locale-direction'
import {
  NotificationProvider,
  NotificationViewport,
  NotificationViewportPosition,
} from './misc/notification-provider'

/** Configuration options for the {@link BeatUI} root provider. */
export type BeatUIOptions = {
  /** Whether to load and provide the authentication i18n translations. @default false */
  includeAuthI18n?: boolean
  /** Whether to enable light/dark appearance toggling. @default true */
  enableAppearance?: boolean
  /** The initial appearance preference when appearance is enabled. @default 'system' */
  defaultAppearance?: AppearancePreference
  /** localStorage key used to persist the appearance preference. @default 'bui-appearance' */
  appearancePreferenceKey?: string
  /** Whether to include the notification system provider and viewport. @default true */
  includeNotifications?: boolean
  /** Position of the notification viewport on screen. @default 'bottom-end' */
  notificationPosition?: NotificationViewportPosition
}

/**
 * Root provider component that initializes all BeatUI subsystems: routing,
 * locale, i18n, theming, and notifications. Wrap your application with this
 * component to enable all BeatUI features.
 *
 * @param options - Configuration for which subsystems to enable
 * @param children - The application content
 * @returns A provider tree wrapping the children
 *
 * @example
 * ```typescript
 * import { BeatUI } from '@tempots/beatui'
 *
 * BeatUI(
 *   { enableAppearance: true, includeNotifications: true },
 *   html.div('My Application')
 * )
 * ```
 *
 * @example
 * ```typescript
 * // With auth i18n support
 * BeatUI(
 *   { includeAuthI18n: true, defaultAppearance: 'dark' },
 *   AppLayout({ children: Router({ ... }) })
 * )
 * ```
 */
export function BeatUI(
  {
    includeAuthI18n = false,
    enableAppearance = true,
    defaultAppearance = 'system',
    appearancePreferenceKey = 'bui-appearance',
    includeNotifications = true,
    notificationPosition = 'bottom-end',
  }: BeatUIOptions,
  ...children: TNode[]
) {
  return WithProvider(({ set, use }) => {
    set(Location, {})
    set(Locale, {})
    set(BeatUII18n, {})
    set(Theme, {
      defaultAppearance: enableAppearance ? defaultAppearance : 'light',
      appearancePreferenceKey,
    })
    if (includeNotifications) {
      set(NotificationProvider, { position: notificationPosition })
    }
    NavigationService.attach(use(Location))
    const fragment = Fragment(
      enableAppearance ? ThemeAppearance() : Empty,
      LocaleDirection(),
      includeNotifications ? NotificationViewport() : Empty,
      ...children
    )
    if (includeAuthI18n) {
      return Task(
        () => import('../auth-i18n/translations'),
        ({ AuthI18n }) => {
          return Provide(AuthI18n, {}, () => fragment)
        }
      )
    } else {
      return fragment
    }
  })
}
