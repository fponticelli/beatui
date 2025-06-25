import {
  Button,
  ControlSize,
  ButtonVariant,
  RadiusName,
  ThemeColorName,
  SegmentedControl,
  TextInput,
  Stack,
  Label,
  ScrollablePanel,
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
]

const allColors: ThemeColorName[] = [
  'base',
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
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

export const ButtonPage = () => {
  const roundedness = prop<RadiusName>('md')
  const size = prop<ControlSize>('md')
  const text = prop('Click Me!')
  const disabled = prop(false)

  return ScrollablePanel({
    header: ControlsHeader(
      Stack(
        Label('Roundedness'),
        SegmentedControl({
          size: 'sm',
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
      attr.class('bu-items-start bu-gap-2 bu-p-2'),
      html.table(
        html.thead(
          html.tr(
            html.th('color / variant'),
            ...allVariants.map(variant => html.th(variant))
          )
        ),
        html.tbody(
          ...allColors.map(color =>
            html.tr(
              html.th(color),
              ...allVariants.map(variant =>
                html.td(
                  Button(
                    {
                      disabled,
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
