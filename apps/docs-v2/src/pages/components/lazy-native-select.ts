import { LazyNativeSelect, Option } from '@tempots/beatui'
import { html, attr, on, prop, MapSignal, type Prop } from '@tempots/dom'
import type { SelectOption } from '@tempots/beatui'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'LazyNativeSelect',
  category: 'Selection',
  component: 'LazyNativeSelect',
  description:
    'A native select input that loads its options asynchronously. Shows a loading spinner while fetching, then renders the populated select once options are ready.',
  icon: 'lucide:loader',
  order: 17,
}

type Country = { id: string; label: string }

const ALL_COUNTRIES: Country[] = [
  { id: 'us', label: 'United States' },
  { id: 'uk', label: 'United Kingdom' },
  { id: 'ca', label: 'Canada' },
  { id: 'au', label: 'Australia' },
  { id: 'de', label: 'Germany' },
  { id: 'fr', label: 'France' },
  { id: 'jp', label: 'Japan' },
  { id: 'br', label: 'Brazil' },
  { id: 'in', label: 'India' },
  { id: 'mx', label: 'Mexico' },
]

async function loadCountries({
  request,
  abortSignal,
}: {
  request: string
  abortSignal: AbortSignal
}): Promise<SelectOption<string>[]> {
  // Simulate network delay
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 600)
    abortSignal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })

  const filtered = ALL_COUNTRIES.filter(c =>
    c.label.toLowerCase().includes(request.toLowerCase())
  )
  return filtered.map(c => Option.value(c.id, c.label))
}

export default function LazyNativeSelectPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('LazyNativeSelect', signals => {
      const value = signals.value as Prop<string>
      const request = prop('')

      return html.div(
        attr.class('w-64 space-y-2'),
        LazyNativeSelect<string, string>({
          value,
          request,
          load: loadCountries,
          size: signals.size as never,
          disabled: signals.disabled as never,
          unselectedLabel: 'Select a country...',
          onChange: (v: string) => value.set(v),
        }),
        html.div(
          attr.class('text-xs text-gray-500 dark:text-gray-400 font-mono'),
          'Selected: ',
          value.map(v => v || '(none)')
        )
      )
    }),
    sections: [
      Section(
        'Basic Async Loading',
        () => {
          const value = prop<string>('')
          const request = prop('')

          return html.div(
            attr.class('w-64 space-y-2'),
            html.p(
              attr.class('text-xs text-gray-500 dark:text-gray-400'),
              'Options load after a 600ms simulated delay:'
            ),
            LazyNativeSelect<string, string>({
              value,
              request,
              load: loadCountries,
              unselectedLabel: 'Select a country...',
              onChange: (v: string) => value.set(v),
            }),
            MapSignal(value, v =>
              v
                ? html.p(
                    attr.class('text-sm text-gray-600 dark:text-gray-400'),
                    `Selected: ${v}`
                  )
                : html.div()
            )
          )
        },
        'LazyNativeSelect shows a loading spinner while options are being fetched, then reveals the populated select. The request signal triggers reloading when it changes.'
      ),
      Section(
        'Reactive Request Signal',
        () => {
          const value = prop<string>('')
          const search = prop('')

          return html.div(
            attr.class('w-64 space-y-2'),
            html.div(
              attr.class('flex items-center gap-2'),
              html.label(
                attr.class('text-sm text-gray-600 dark:text-gray-400 shrink-0'),
                'Filter:'
              ),
              html.input(
                attr.type('text'),
                attr.placeholder('e.g. United'),
                attr.class(
                  'flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                ),
                on.input((e: Event) => {
                  search.set((e.target as HTMLInputElement).value)
                  value.set('')
                })
              )
            ),
            LazyNativeSelect<string, string>({
              value,
              request: search,
              load: loadCountries,
              unselectedLabel: 'Choose...',
              onChange: (v: string) => value.set(v),
            }),
            html.p(
              attr.class('text-xs text-gray-400'),
              'Changing the search filter reloads options.'
            )
          )
        },
        'When the request signal changes, options are reloaded automatically. Previous requests are cancelled via AbortSignal to prevent stale results.'
      ),
      Section(
        'With Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => {
              const request = prop('')
              return html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 dark:text-gray-400 mb-1'),
                  size
                ),
                LazyNativeSelect<string, string>({
                  value: '',
                  request,
                  load: loadCountries,
                  size,
                  unselectedLabel: `Size ${size}`,
                  onChange: () => {},
                })
              )
            })
          ),
        'LazyNativeSelect supports all five sizes, matching the NativeSelect size scale.'
      ),
      Section(
        'Disabled State',
        () => {
          const request = prop('')
          return html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            LazyNativeSelect<string, string>({
              value: '',
              request,
              load: loadCountries,
              unselectedLabel: 'Enabled select',
              onChange: () => {},
            }),
            LazyNativeSelect<string, string>({
              value: '',
              request,
              load: loadCountries,
              disabled: true,
              unselectedLabel: 'Disabled select',
              onChange: () => {},
            })
          )
        },
        'Set disabled: true to prevent interaction. Options still load in the background but the select is non-interactive.'
      ),
      Section(
        'API Reference',
        () =>
          html.div(
            attr.class(
              'font-mono text-xs bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-2 text-gray-700 dark:text-gray-300'
            ),
            html.div('LazyNativeSelect({'),
            html.div(
              attr.class('pl-4'),
              '// Standard InputOptions (value, onChange, size, color, disabled, ...)'
            ),
            html.div(attr.class('pl-4'), 'value: Signal<T>,'),
            html.div(attr.class('pl-4'), 'onChange: (v: T) => void,'),
            html.div(),
            html.div(attr.class('pl-4'), '// Async loading'),
            html.div(attr.class('pl-4'), 'request: Signal<R>,'),
            html.div(
              attr.class('pl-4'),
              'load: ({ request, abortSignal }) => Promise<SelectOption<T>[]>,'
            ),
            html.div(),
            html.div(attr.class('pl-4'), '// Optional'),
            html.div(attr.class('pl-4'), "unselectedLabel: 'Choose...',"),
            html.div(attr.class('pl-4'), 'equality: (a, b) => a === b,'),
            html.div('})')
          ),
        'LazyNativeSelect extends InputOptions with request/load for async loading. The load function receives the request value and an AbortSignal for cancellation.'
      ),
    ],
  })
}
