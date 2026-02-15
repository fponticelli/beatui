import {
  Icon,
  IconSize,
  Stack,
  Label,
  Group,
  ThemeColorName,
  ScrollablePanel,
} from '@tempots/beatui'
import { html, attr, prop, Value } from '@tempots/dom'
import { ColorSelector } from '../elements/color-selector'
import { ControlSizeSelector } from '../elements/control-size-selector'
import { ControlsHeader } from '../elements/controls-header'

function DisplayIcon({
  value,
  size,
  color,
}: {
  value: Value<string>
  size: Value<IconSize>
  color: Value<ThemeColorName>
}) {
  return html.div(
    attr.class(
      'flex flex-col items-center p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer'
    ),
    html.div(
      attr.class('mb-2'),
      Icon({
        icon: value,
        size,
        color,
        title: value as Value<string | undefined>,
      })
    ),
    html.div(
      attr.class(
        'text-xs text-gray-600 dark:text-gray-400 text-center break-all'
      ),
      value
    )
  )
}

const icons = [
  'line-md:home',
  'line-md:account',
  'line-md:cog',
  'line-md:heart',
  'line-md:alert',
  'line-md:close',
  'line-md:arrow-left',
  'line-md:arrow-right',
  'line-md:plus',
  'line-md:minus',
  'line-md:edit',
  'line-md:trash',
  'line-md:search',
  'line-md:menu',
  'line-md:star',
  'tabler:home',
  'tabler:user',
  'tabler:settings',
  'tabler:heart',
  'tabler:alert-circle',
  'tabler:x',
  'tabler:check',
  'tabler:arrow-left',
  'tabler:arrow-right',
  'tabler:plus',
  'tabler:minus',
  'tabler:edit',
  'tabler:trash',
  'tabler:search',
  'tabler:menu-2',
  'tabler:star',
]

export default function IconPage() {
  const size = prop<IconSize>('md')
  const color = prop<ThemeColorName>('base')

  return ScrollablePanel({
    header: ControlsHeader(
      Stack(Label('Size'), ControlSizeSelector({ size, onChange: size.set })),
      Stack(
        Label('Color'),
        ColorSelector({
          color,
          onChange: color.set,
        })
      )
    ),
    body: Stack(
      attr.class('space-y-lg p-4'),
      Group(
        attr.class('gap-4 flex-wrap flex justify-center'),
        ...icons.map(icon => DisplayIcon({ value: icon, size, color }))
      )
    ),
  })
}
