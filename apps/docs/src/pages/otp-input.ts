import {
  OTPInput,
  ControlSize,
  ScrollablePanel,
  SegmentedInput,
  Stack,
  InputWrapper,
  Switch,
} from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'

export default function OTPInputPage() {
  const size = prop<ControlSize>('md')
  const disabled = prop(false)

  const otpValue = prop('')
  const pinValue = prop('')

  return ScrollablePanel({
    header: ControlsHeader(
      InputWrapper({
        label: 'Size',
        content: SegmentedInput({
          size: 'sm',
          options: { xs: 'XS', sm: 'SM', md: 'MD', lg: 'LG', xl: 'XL' },
          value: size,
          onChange: size.set,
        }),
      }),
      InputWrapper({
        label: 'Disabled',
        content: Switch({
          value: disabled,
          onChange: disabled.set,
        }),
      })
    ),
    body: Stack(
      attr.class('items-start gap-6 p-4'),

      // Basic 6-digit OTP
      html.h3(attr.class('text-lg font-semibold'), '6-Digit OTP Input'),
      html.p(
        attr.class('text-sm text-gray-600'),
        'Value: ',
        otpValue.map((v: string) => v || '(empty)')
      ),
      OTPInput({
        value: otpValue,
        onChange: otpValue.set,
        onComplete: (v: string) => console.log('OTP complete:', v),
        length: 6,
        size,
        disabled,
        autoFocus: true,
      }),

      // 4-digit masked PIN
      html.h3(attr.class('text-lg font-semibold mt-4'), '4-Digit PIN (Masked)'),
      html.p(
        attr.class('text-sm text-gray-600'),
        'Value: ',
        pinValue.map((v: string) => v || '(empty)')
      ),
      OTPInput({
        value: pinValue,
        onChange: pinValue.set,
        onComplete: (v: string) => console.log('PIN complete:', v),
        length: 4,
        mask: true,
        size,
        disabled,
      }),

      // Alphanumeric
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Alphanumeric Code'),
      OTPInput({
        value: prop(''),
        onChange: (v: string) => console.log('Code:', v),
        length: 5,
        type: 'alphanumeric',
        placeholder: '-',
        size,
        disabled,
        color: 'green',
      }),

      // Size comparison
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Size Comparison'),
      ...(['xs', 'sm', 'md', 'lg', 'xl'] as ControlSize[]).map(s =>
        html.div(
          attr.class('mb-3'),
          html.p(attr.class('text-sm text-gray-500 mb-1'), `Size: ${s}`),
          OTPInput({
            value: prop(''),
            onChange: () => {},
            length: 4,
            size: s,
            disabled,
          })
        )
      ),

      // Color variants
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Color Variants'),
      ...(['primary', 'red', 'green', 'blue', 'orange', 'violet'] as const).map(
        color =>
          html.div(
            attr.class('mb-3'),
            html.p(attr.class('text-sm text-gray-500 mb-1'), color),
            OTPInput({
              value: prop(''),
              onChange: () => {},
              length: 4,
              size,
              disabled,
              color,
            })
          )
      )
    ),
  })
}
