import {
  ToggleButton,
  ControlSize,
  ButtonVariant,
  ScrollablePanel,
  SegmentedInput,
  Stack,
  InputWrapper,
  Switch,
  Group,
  Icon,
} from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'

const allColors = [
  'primary',
  'red',
  'green',
  'blue',
  'orange',
  'violet',
] as const

const allVariants: ButtonVariant[] = [
  'filled',
  'light',
  'outline',
  'dashed',
  'default',
  'text',
]

export default function ToggleButtonPage() {
  const size = prop<ControlSize>('md')
  const disabled = prop(false)
  const variant = prop<ButtonVariant>('outline')

  return ScrollablePanel({
    header: ControlsHeader(
      InputWrapper({
        label: 'Size',
        content: SegmentedInput({
          options: { xs: 'XS', sm: 'SM', md: 'MD', lg: 'LG', xl: 'XL' },
          value: size,
          onChange: size.set,
        }),
      }),
      InputWrapper({
        label: 'Variant (unpressed)',
        content: SegmentedInput({
          options: {
            outline: 'Outline',
            filled: 'Filled',
            light: 'Light',
            dashed: 'Dashed',
            default: 'Default',
            text: 'Text',
          },
          value: variant,
          onChange: variant.set,
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

      // Basic toggle
      html.h3(attr.class('text-lg font-semibold'), 'Basic Toggle Button'),
      html.p(
        attr.class('text-sm text-gray-600'),
        'Click to toggle between pressed and unpressed states.'
      ),
      Group(
        attr.class('gap-2 flex-wrap'),
        ...(() => {
          const boldPressed = prop(false)
          const italicPressed = prop(false)
          const underlinePressed = prop(false)

          return [
            ToggleButton(
              {
                pressed: boldPressed,
                onToggle: boldPressed.set,
                variant,
                size,
                disabled,
              },
              html.strong('B')
            ),
            ToggleButton(
              {
                pressed: italicPressed,
                onToggle: italicPressed.set,
                variant,
                size,
                disabled,
              },
              html.em('I')
            ),
            ToggleButton(
              {
                pressed: underlinePressed,
                onToggle: underlinePressed.set,
                variant,
                size,
                disabled,
              },
              html.span(attr.class('underline'), 'U')
            ),
          ]
        })()
      ),

      // With icons
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Icon Toggles'),
      Group(
        attr.class('gap-2 flex-wrap'),
        ...(() => {
          const star = prop(false)
          const heart = prop(false)
          const pin = prop(false)

          return [
            ToggleButton(
              {
                pressed: star,
                onToggle: star.set,
                variant,
                size,
                disabled,
                color: 'yellow',
              },
              Icon({ icon: 'lucide:star', size: size.value })
            ),
            ToggleButton(
              {
                pressed: heart,
                onToggle: heart.set,
                variant,
                size,
                disabled,
                color: 'red',
              },
              Icon({ icon: 'lucide:heart', size: size.value })
            ),
            ToggleButton(
              {
                pressed: pin,
                onToggle: pin.set,
                variant,
                size,
                disabled,
                color: 'blue',
              },
              Icon({ icon: 'lucide:pin', size: size.value })
            ),
          ]
        })()
      ),

      // Color x Variant table
      html.h3(
        attr.class('text-lg font-semibold mt-4'),
        'Color / Variant Matrix'
      ),
      html.div(
        attr.class('overflow-x-auto w-full'),
        html.table(
          attr.class('border-collapse'),
          html.thead(
            html.tr(
              html.th(attr.class('border p-2 text-left'), 'Color'),
              ...allVariants.map(v => html.th(attr.class('border p-2'), v))
            )
          ),
          html.tbody(
            ...allColors.map(color =>
              html.tr(
                html.th(attr.class('border p-2'), color),
                ...allVariants.map(v => {
                  const pressed = prop(false)
                  return html.td(
                    attr.class('border p-2'),
                    ToggleButton(
                      {
                        pressed,
                        onToggle: pressed.set,
                        variant: v,
                        color,
                        size,
                        disabled,
                      },
                      'Aa'
                    )
                  )
                })
              )
            )
          )
        )
      )
    ),
  })
}
