import {
  Empty,
  Fragment,
  Provide,
  Task,
  TNode,
  WithProvider,
} from '@tempots/dom'
import { AppearancePreference, Theme, ThemeAppearance } from './theme'
import { Locale } from '@/components/i18n'
import { Location, NavigationService } from '@tempots/ui'
import { BeatUII18n } from '@/beatui-i18n'
import { LocaleDirection } from './i18n/locale-direction'
import {
  NotificationProvider,
  NotificationViewport,
  NotificationViewportPosition,
} from './misc/notification-provider'

export type BeatUIOptions = {
  includeAuthI18n?: boolean
  enableAppearance?: boolean
  defaultAppearance?: AppearancePreference
  appearancePreferenceKey?: string
  includeNotifications?: boolean
  notificationPosition?: NotificationViewportPosition
}

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
        () => import('@/auth-i18n/translations'),
        ({ AuthI18n }) => {
          return Provide(AuthI18n, {}, () => fragment)
        }
      )
    } else {
      return fragment
    }
  })
}
