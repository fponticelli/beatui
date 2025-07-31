import { attr, Portal, Use } from '@tempots/dom'
import { Locale } from './locale'

/**
 * Combined theme and direction component that applies both appearance and direction classes to body
 */
export const LocaleDirection = () =>
  Use(Locale, ({ direction }) =>
    Portal('body', attr.class(direction.map(dir => `b-${dir}`)))
  )
