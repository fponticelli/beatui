import {
  ControlSize,
  Switch,
  TextInput,
  Label,
  Stack,
  ScrollablePanel,
} from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { DisabledSelector } from '../elements/disabled-selector'
import { ControlsHeader } from '../elements/controls-header'

const allSizes: ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl']

export default function SwitchPage() {
  const label = prop('Switch me')
  const onLabel = prop('ON')
  const offLabel = prop('OFF')
  const disabled = prop(false)
  const value = prop(false)

  return ScrollablePanel({
    header: ControlsHeader(
      Switch({
        size: 'sm',
        label: 'On/Off',
        value,
        onChange: value.set,
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
      Stack(DisabledSelector({ disabled }))
    ),
    body: Stack(
      attr.class('items-start gap-4 p-4'),
      html.table(
        html.thead(
          html.tr(
            html.th('size / status'),
            ...['on', 'off'].map(status => html.th(status))
          )
        ),
        html.tbody(
          ...allSizes.map(size => {
            return html.tr(
              html.th(size),
              ...[true, false].map(status => {
                const localValue = value.map(v => v === status).deriveProp()
                const onChange = () => localValue.update(v => !v)
                return html.td(
                  Switch({
                    value: localValue,
                    onChange,
                    size,
                    disabled,
                    label,
                    onLabel,
                    offLabel,
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
