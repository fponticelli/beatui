import { Switch, Group } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Switch',
  category: 'Selection',
  component: 'Switch',
  description: 'A toggle switch for boolean on/off states.',
  icon: 'lucide:toggle-left',
  order: 5,
}

export default function SwitchPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Switch', signals => {
      const checked = prop(false)
      return Switch({
        size: signals.size,
        color: signals.color,
        disabled: signals.disabled,
        offLabel: signals.offLabel,
        onLabel: signals.onLabel,
        matchInputHeight: signals.matchInputHeight,
        value: checked,
        onChange: (v: boolean) => checked.set(v),
      } as never)
    }),
    sections: [
      ...AutoSections('Switch', props =>
        Switch({ ...props, value: true } as never)
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
