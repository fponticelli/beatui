import { Switch, Group } from '@tempots/beatui'
import { html, attr, type Prop } from '@tempots/dom'
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
      const value = signals.value as Prop<boolean>
      return Switch({ ...signals, value, onChange: (v: boolean) => value.set(v) })
    }),
    sections: [
      ...AutoSections('Switch', props =>
        Switch({ ...props, value: true })
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
