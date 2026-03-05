import { Switch, Group } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, AutoSections, Section } from '../../framework'
import { autoPlayground } from '../../framework/auto-playground'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Switch',
  category: 'Form Inputs',
  component: 'Switch',
  description: 'A toggle switch for boolean on/off states.',
  icon: 'lucide:toggle-left',
  order: 5,
}

export default function SwitchPage() {
  return ComponentPage(meta, {
    playground: (() => {
      const checked = prop(false)
      return html.div(
        attr.class(
          'flex flex-col items-center gap-4 p-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
        ),
        Switch({
          value: checked,
          onChange: v => checked.set(v),
        }),
        html.span(
          attr.class('text-sm text-gray-500'),
          'Click the switch to toggle'
        )
      )
    })(),
    sections: [
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap items-center gap-6'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                attr.class('flex flex-col items-center gap-1'),
                Switch({
                  value: true,
                  onChange: () => {},
                  size,
                }),
                html.span(
                  attr.class('text-xs text-gray-500 font-mono'),
                  size
                )
              )
            )
          ),
        'Available size options.'
      ),
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-wrap items-center gap-6'),
            ...(
              [
                'primary',
                'secondary',
                'success',
                'warning',
                'danger',
                'info',
              ] as const
            ).map(color =>
              html.div(
                attr.class('flex flex-col items-center gap-1'),
                Switch({
                  value: true,
                  onChange: () => {},
                  color,
                }),
                html.span(
                  attr.class('text-xs text-gray-500 font-mono'),
                  color
                )
              )
            )
          ),
        'Color options for the switch.'
      ),
      Section(
        'With Labels',
        () =>
          html.div(
            attr.class('flex flex-col gap-4'),
            Switch({
              value: true,
              onChange: () => {},
              onLabel: 'ON',
              offLabel: 'OFF',
            }),
            Switch({
              value: false,
              onChange: () => {},
              onLabel: 'ON',
              offLabel: 'OFF',
            })
          ),
        'Switches can display on/off labels inside the track.'
      ),
      Section(
        'Disabled',
        () =>
          Group(
            attr.class('gap-4'),
            Switch({ value: true, onChange: () => {}, disabled: true }),
            Switch({ value: false, onChange: () => {}, disabled: true })
          ),
        'Disabled switches are non-interactive.'
      ),
    ],
  })
}
