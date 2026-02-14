import { prop } from '@tempots/dom'
import { html, attr } from '@tempots/dom'
import {
  Button,
  CloseButton,
  Icon,
  ControlSize,
  ButtonVariant,
  ThemeColorName,
  RadiusName,
} from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { ControlsHeader } from '../views/controls-header'
import { ControlSwitch, ControlSegmented } from '../views/control-helpers'
import { Section, SectionBlock } from '../views/section'

const allVariants: ButtonVariant[] = [
  'filled',
  'light',
  'outline',
  'default',
  'text',
  'dashed',
]
const allColors: ThemeColorName[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
]

export default function ButtonsPage() {
  const size = prop<ControlSize>('md')
  const roundedness = prop<RadiusName>('md')
  const disabled = prop(false)
  const loading = prop(false)

  return WidgetPage({
    id: 'buttons',
    title: 'Buttons',
    description: 'Button variants, sizes, colors, and states.',
    controls: ControlsHeader(
      ControlSegmented('Size', size, {
        xs: 'XS',
        sm: 'SM',
        md: 'MD',
        lg: 'LG',
        xl: 'XL',
      } as Record<ControlSize, string>),
      ControlSegmented('Radius', roundedness, {
        none: 'None',
        xs: 'XS',
        sm: 'SM',
        md: 'MD',
        lg: 'LG',
        xl: 'XL',
        full: 'Full',
      } as Record<RadiusName, string>),
      ControlSwitch('Disabled', disabled),
      ControlSwitch('Loading', loading)
    ),
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      Section(
        'Variants',
        ...allVariants.map(variant =>
          Button({ variant, size, roundedness, disabled, loading }, variant)
        )
      ),

      SectionBlock(
        'Colors × Variants',
        html.table(
          attr.class('w-full'),
          html.thead(
            html.tr(
              html.th(attr.class('px-2 py-1 text-left text-sm'), 'Color'),
              ...allVariants.map(v =>
                html.th(attr.class('px-2 py-1 text-sm'), v)
              )
            )
          ),
          html.tbody(
            ...allColors.map(color =>
              html.tr(
                html.td(attr.class('px-2 py-1 text-sm font-medium'), color),
                ...allVariants.map(variant =>
                  html.td(
                    attr.class('px-2 py-1'),
                    Button(
                      { variant, color, size, roundedness, disabled, loading },
                      color
                    )
                  )
                )
              )
            )
          )
        )
      ),

      Section(
        'With Icons',
        Button(
          { variant: 'filled', size, disabled, loading },
          Icon({ icon: 'lucide:plus', size: 'sm' }),
          'Create'
        ),
        Button(
          { variant: 'outline', size, disabled, loading },
          Icon({ icon: 'lucide:download', size: 'sm' }),
          'Download'
        ),
        Button(
          { variant: 'light', color: 'danger', size, disabled },
          Icon({ icon: 'lucide:trash-2', size: 'sm' }),
          'Delete'
        )
      ),

      Section(
        'Close Button',
        CloseButton({ size: 'sm' }),
        CloseButton({ size: 'md' }),
        CloseButton({ size: 'lg' })
      )
    ),
  })
}
