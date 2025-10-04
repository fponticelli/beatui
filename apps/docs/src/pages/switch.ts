import {
  ControlSize,
  Switch,
  TextInput,
  Label,
  Stack,
  ScrollablePanel,
  ThemeColorName,
} from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { DisabledSelector } from '../elements/disabled-selector'
import { ControlsHeader } from '../elements/controls-header'
import { ColorSelector } from '../elements/color-selector'

const allSizes: ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl']

export default function SwitchPage() {
  const label = prop('Switch me')
  const onLabel = prop('ON')
  const offLabel = prop('OFF')
  const disabled = prop(false)
  const value = prop(false)
  const color = prop<ThemeColorName>('primary')

  return ScrollablePanel({
    header: ControlsHeader(
      Switch({
        size: 'sm',
        label: 'On/Off',
        value,
        onChange: value.set,
        color,
      }),
      html.div(
        Label('Label'),
        TextInput({
          value: label,
          onInput: (value: string) => label.set(value),
        })
      ),
      Stack(
        Label('On Label'),
        TextInput({
          value: onLabel,
          onInput: (value: string) => onLabel.set(value),
        })
      ),
      Stack(
        Label('Off Label'),
        TextInput({
          value: offLabel,
          onInput: (value: string) => offLabel.set(value),
        })
      ),
      Stack(
        Label('Color'),
        ColorSelector({ color, onChange: color.set })
      ),
      Stack(DisabledSelector({ disabled }))
    ),
    body: Stack(
      attr.class('items-start gap-4 p-4'),
      html.table(
        html.thead(
          html.tr(
            html.th(
              attr.class('px-1 py-2 border-b border-gray-300'),
              'size / status'
            ),
            ...['on', 'off'].map(status =>
              html.th(attr.class('px-1 py-2 border-b border-gray-300'), status)
            )
          )
        ),
        html.tbody(
          ...allSizes.map(size => {
            return html.tr(
              html.th(attr.class('px-1 py-2 border-b border-gray-300'), size),
              ...[true, false].map(status => {
                const localValue = value.map(v => v === status).deriveProp()
                const onChange = () => localValue.update(v => !v)
                return html.td(
                  attr.class('px-1 py-2 border-b border-gray-300'),
                  Switch({
                    value: localValue,
                    onChange,
                    size,
                    disabled,
                    label,
                    onLabel,
                    offLabel,
                    color,
                  })
                )
              })
            )
          })
        )
      )
    ),
  })
}
