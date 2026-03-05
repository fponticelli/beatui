import { Switch, Group } from '@tempots/beatui'
import { html, attr, prop, Value, Signal } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
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
    playground: manualPlayground('Switch', signals => {
      const checked = prop(false)
      return Switch({
        value: checked,
        onChange: v => checked.set(v),
        size: signals.size as Value<'xs' | 'sm' | 'md' | 'lg' | 'xl'>,
        color: signals.color as Value<string>,
        disabled: signals.disabled as Value<boolean>,
        matchInputHeight: signals.matchInputHeight as Value<boolean>,
      })
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
