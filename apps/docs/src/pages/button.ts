import {
  Button,
  ControlSize,
  ButtonVariant,
  RadiusName,
  ThemeColorName,
  SegmentedInput,
  TextInput,
  Stack,
  Label,
  ScrollablePanel,
  Switch,
  InputWrapper,
} from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ControlSizeSelector } from '../elements/control-size-selector'
import { DisabledSelector } from '../elements/disabled-selector'
import { ControlsHeader } from '../elements/controls-header'

const allVariants: ButtonVariant[] = [
  'filled',
  'light',
  'outline',
  'default',
  'text',
  'dashed',
]

const allColors: ThemeColorName[] = [
  'base',
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'cyan',
  'teal',
  'green',
  'emerald',
]

export default function ButtonPage() {
  const roundedness = prop<RadiusName>('md')
  const size = prop<ControlSize>('md')
  const text = prop('Click Me!')
  const disabled = prop(false)
  const loading = prop(false)

  return ScrollablePanel({
    header: ControlsHeader(
      Stack(
        Label('Roundedness'),
        SegmentedInput({
          options: {
            none: 'NONE',
            xs: 'XS',
            sm: 'SM',
            md: 'MD',
            lg: 'LG',
            xl: 'XL',
            full: 'FULL',
          },
          value: roundedness,
          onChange: roundedness.set,
        })
      ),
      Stack(Label('Size'), ControlSizeSelector({ size, onChange: size.set })),
      Stack(DisabledSelector({ disabled })),
      InputWrapper({
        label: 'Loading',
        content: Switch({
          value: loading,
          onChange: loading.set,
        }),
      }),
      Stack(
        Label('Text'),
        html.div(
          TextInput({
            value: text,
            onInput: (value: string) => text.set(value),
          })
        )
      )
    ),
    body: Stack(
      attr.class('items-start gap-4 p-4'),
      html.table(
        html.thead(
          html.tr(
            html.th(
              attr.class(
                'px-1 py-2 border-b border-gray-300 dark:border-gray-600'
              ),
              'color / variant'
            ),
            ...allVariants.map(variant =>
              html.th(
                attr.class(
                  'px-1 py-2 border-b border-gray-300 dark:border-gray-600'
                ),
                variant
              )
            )
          )
        ),
        html.tbody(
          ...allColors.map(color =>
            html.tr(
              html.th(
                attr.class(
                  'px-1 py-2 border-b border-gray-300 dark:border-gray-600'
                ),
                color
              ),
              ...allVariants.map(variant =>
                html.td(
                  attr.class(
                    'px-1 py-2 border-b border-gray-300 dark:border-gray-600'
                  ),
                  Button(
                    {
                      disabled,
                      loading,
                      size,
                      roundedness,
                      variant,
                      color,
                    },
                    text
                  )
                )
              )
            )
          )
        )
      )
    ),
  })
}
