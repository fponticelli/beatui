import { TriStateCheckboxInput, Group } from '@tempots/beatui'
import type { CheckboxState } from '@tempots/beatui'
import { html, attr, type Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'TriStateCheckboxInput',
  category: 'Selection',
  component: 'TriStateCheckboxInput',
  description: 'A checkbox with three states: checked, unchecked, and indeterminate. Cycles through states on click with full ARIA semantics.',
  icon: 'lucide:check-square-2',
  order: 13,
}

export default function TriStateCheckboxPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('TriStateCheckboxInput', signals => {
      const value = signals.value as Prop<CheckboxState>
      return TriStateCheckboxInput({
        ...signals,
        value,
        onChange: (v: CheckboxState) => value.set(v),
      })
    }),
    sections: [
      ...AutoSections('TriStateCheckboxInput', props =>
        TriStateCheckboxInput({ ...props, value: 'unchecked' as CheckboxState })
      ),
      Section(
        'All Three States',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            ...(['unchecked', 'checked', 'indeterminate'] as const).map(state =>
              html.div(
                attr.class('flex items-center gap-3'),
                html.div(attr.class('text-xs font-mono text-gray-500 w-24'), state),
                TriStateCheckboxInput({
                  value: state,
                  onChange: () => {},
                  placeholder: `State: ${state}`,
                })
              )
            )
          ),
        'The three states are unchecked, checked, and indeterminate. Clicking cycles through them in order.'
      ),
      Section(
        'With Labels',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            TriStateCheckboxInput({
              value: 'indeterminate' as CheckboxState,
              onChange: () => {},
              placeholder: 'Select all (some selected)',
            }),
            TriStateCheckboxInput({
              value: 'checked' as CheckboxState,
              onChange: () => {},
              placeholder: 'All notifications enabled',
            }),
            TriStateCheckboxInput({
              value: 'unchecked' as CheckboxState,
              onChange: () => {},
              placeholder: 'No notifications',
            })
          ),
        'The placeholder prop renders a clickable label next to the checkbox.'
      ),
      Section(
        'Custom Icons',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            TriStateCheckboxInput({
              value: 'checked' as CheckboxState,
              onChange: () => {},
              activeIcon: 'mdi:checkbox-marked-circle',
              inactiveIcon: 'mdi:checkbox-blank-circle-outline',
              indeterminateIcon: 'mdi:minus-circle-outline',
              placeholder: 'Custom circle icons',
            }),
            TriStateCheckboxInput({
              value: 'indeterminate' as CheckboxState,
              onChange: () => {},
              activeIcon: 'mdi:toggle-switch',
              inactiveIcon: 'mdi:toggle-switch-off-outline',
              indeterminateIcon: 'mdi:toggle-switch-outline',
              placeholder: 'Indeterminate with custom icons',
            })
          ),
        'Override the icons for each state using activeIcon, inactiveIcon, and indeterminateIcon.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                TriStateCheckboxInput({
                  value: 'indeterminate' as CheckboxState,
                  onChange: () => {},
                  placeholder: `Size ${size}`,
                  size,
                })
              )
            )
          ),
        'TriStateCheckboxInput is available in five sizes.'
      ),
      Section(
        'Disabled',
        () =>
          Group(
            attr.class('gap-4'),
            TriStateCheckboxInput({
              value: 'checked' as CheckboxState,
              onChange: () => {},
              disabled: true,
              placeholder: 'Checked disabled',
            }),
            TriStateCheckboxInput({
              value: 'indeterminate' as CheckboxState,
              onChange: () => {},
              disabled: true,
              placeholder: 'Indeterminate disabled',
            }),
            TriStateCheckboxInput({
              value: 'unchecked' as CheckboxState,
              onChange: () => {},
              disabled: true,
              placeholder: 'Unchecked disabled',
            })
          ),
        'Disabled tri-state checkboxes are non-interactive and visually muted.'
      ),
    ],
  })
}
