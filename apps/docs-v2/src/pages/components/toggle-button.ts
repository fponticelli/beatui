import { ToggleButton } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'ToggleButton',
  category: 'Buttons',
  component: 'ToggleButton',
  description: 'A button that toggles between pressed and unpressed states with full variant and color support.',
  icon: 'lucide:toggle-left',
  order: 7,
}

export default function ToggleButtonPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('ToggleButton', signals => {
      const pressed = prop(false)
      return ToggleButton(
        {
          size: signals.size,
          color: signals.color,
          variant: signals.variant,
          disabled: signals.disabled,
          roundedness: signals.roundedness,
          fullWidth: signals.fullWidth,
          pressed,
          onToggle: v => pressed.set(v),
        } as never,
        'Toggle Me'
      )
    }),
    sections: [
      ...AutoSections('ToggleButton', props =>
        ToggleButton({ ...props, pressed: false } as never, 'Toggle')
      ),
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ...(['primary', 'secondary', 'success', 'danger', 'warning', 'info'] as const).map(color => {
              const pressed = prop(false)
              return ToggleButton(
                { pressed, onToggle: v => pressed.set(v), color },
                color
              )
            })
          ),
        'ToggleButton uses a theme color for the pressed state.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap items-center gap-3'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => {
              const pressed = prop(false)
              return ToggleButton(
                { pressed, onToggle: v => pressed.set(v), size },
                size
              )
            })
          ),
        'ToggleButton is available in five sizes.'
      ),
      Section(
        'Variants',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ...(['filled', 'outline', 'light', 'default', 'text', 'dashed'] as const).map(variant => {
              const pressed = prop(false)
              return ToggleButton(
                { pressed, onToggle: v => pressed.set(v), variant },
                variant
              )
            })
          ),
        'ToggleButton supports all standard button variants.'
      ),
      Section(
        'Disabled',
        () =>
          html.div(
            attr.class('flex gap-3'),
            ToggleButton({ pressed: false, disabled: true }, 'Off disabled'),
            ToggleButton({ pressed: true, disabled: true }, 'On disabled')
          ),
        'Disabled toggle buttons are non-interactive.'
      ),
    ],
  })
}
