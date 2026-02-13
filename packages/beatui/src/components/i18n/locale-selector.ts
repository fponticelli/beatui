import { Locale } from './'
import { InputWrapper, NativeSelect } from '../form'
import { attr, Use, Value } from '@tempots/dom'
import { BeatUII18n } from '../../beatui-i18n'
import { Group } from '../layout'
import { Icon } from '../data'
import { Option, SelectOption } from '../form/input/option'

/**
 * Represents a single locale entry for display in the locale selector.
 */
export type LocaleItem = {
  /** The locale code (e.g., `'en'`, `'es'`, `'fr'`) */
  code: string
  /** The display name of the locale in the application's current language (e.g., `'Spanish'`) */
  name: string
  /** The native name of the locale in its own language (e.g., `'Espanol'`). Shown in parentheses after the name if different. */
  nativeName?: string
}

/**
 * Configuration options for the {@link LocaleSelector} component.
 */
export type LocaleSelectorOptions = {
  /** Reactive list of available locales to display in the dropdown */
  locales: Value<LocaleItem[]>
  /** Optional callback invoked when the user selects a different locale */
  onChange?: (locale: string) => void
  /**
   * Whether to automatically update the `Locale` provider when the selection changes.
   * @default true
   */
  updateLocale?: boolean
}

/**
 * A dropdown component for selecting the application locale.
 *
 * Renders a native `<select>` element wrapped in an `InputWrapper` with a language icon.
 * The component reads the current locale from the `Locale` provider and optionally updates it
 * when the user makes a selection.
 *
 * @param options - Configuration options for the locale selector
 * @param options.locales - Reactive list of available locales
 * @param options.onChange - Optional callback invoked on locale change
 * @param options.updateLocale - Whether to update the Locale provider automatically
 *
 * @returns A renderable TNode representing the locale selector component
 *
 * @example
 * ```typescript
 * import { LocaleSelector, LocaleItem } from '@tempots/beatui'
 *
 * const locales: LocaleItem[] = [
 *   { code: 'en', name: 'English' },
 *   { code: 'es', name: 'Spanish', nativeName: 'Espanol' },
 *   { code: 'fr', name: 'French', nativeName: 'Francais' },
 * ]
 *
 * LocaleSelector({
 *   locales,
 *   onChange: (locale) => console.log('Selected:', locale),
 * })
 * ```
 */
export function LocaleSelector({
  locales,
  onChange,
  updateLocale = true,
}: LocaleSelectorOptions) {
  return Use(BeatUII18n, t =>
    Use(Locale, ({ locale, setLocale }) => {
      return InputWrapper({
        layout: 'horizontal',
        content: Group(
          attr.class('bc-group--align-center bc-group--gap-2'),
          Icon({
            icon: 'ic:twotone-language',
            size: 'lg',
            color: 'neutral',
            title: t.$.locale as Value<string | undefined>,
          }),
          NativeSelect({
            options: Value.map(locales, locales =>
              locales.map(l => {
                let name = l.name
                if (l.nativeName != null && l.nativeName !== l.name) {
                  name += ` (${l.nativeName})`
                }
                return Option.value(l.code, name) as SelectOption<string>
              })
            ),
            value: locale,
            onChange: value => {
              if (updateLocale) {
                setLocale(value)
              }
              onChange?.(value)
            },
          })
        ),
      })
    })
  )
}
