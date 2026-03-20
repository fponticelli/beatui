import {
  ListInput,
  ArrayController,
  TextInput,
  Button,
  Icon,
  Divider,
} from '@tempots/beatui'
import type { ControllerValidation } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'ListInput',
  category: 'Files',
  component: 'ListInput',
  description:
    'A dynamic list component for managing ordered arrays. Each item receives actions for removal and reordering (up, down, first, last).',
  icon: 'lucide:list',
  order: 21,
}

function createListController(initial: string[]) {
  const value = prop(initial)
  const status = prop<ControllerValidation>({ type: 'valid' })
  return new ArrayController<string[]>(
    [],
    (v: string[]) => value.set(v),
    value,
    status,
    { disabled: prop(false) },
    (a, b) => a === b
  )
}

export default function ListInputPage() {
  return ComponentPage(meta, {
    playground: (() => {
      const controller = createListController(['Item 1', 'Item 2', 'Item 3'])
      return html.div(
        attr.class('flex flex-col gap-3 max-w-md'),
        ListInput(controller, ({ item, remove, move, cannotMove }) =>
          html.div(
            attr.class('flex items-center gap-2'),
            TextInput({
              value: item.signal,
              onInput: (v: string) => item.change(v),
            }),
            html.div(
              attr.class('flex gap-1'),
              Button(
                {
                  size: 'xs',
                  variant: 'subtle',
                  disabled: cannotMove('up'),
                  onClick: () => move('up'),
                },
                Icon({ icon: 'lucide:chevron-up', size: 'xs' })
              ),
              Button(
                {
                  size: 'xs',
                  variant: 'subtle',
                  disabled: cannotMove('down'),
                  onClick: () => move('down'),
                },
                Icon({ icon: 'lucide:chevron-down', size: 'xs' })
              ),
              Button(
                {
                  size: 'xs',
                  variant: 'subtle',
                  color: 'danger',
                  onClick: remove,
                },
                Icon({ icon: 'lucide:trash-2', size: 'xs' })
              )
            )
          )
        ),
        Button(
          {
            variant: 'outline',
            size: 'sm',
            onClick: () =>
              controller.push(`Item ${controller.length.value + 1}`),
          },
          Icon({ icon: 'lucide:plus', size: 'sm' }),
          'Add Item'
        )
      )
    })(),
    sections: [
      Section(
        'Add & Remove Items',
        () => {
          const controller = createListController(['Apple', 'Banana'])
          return html.div(
            attr.class('flex flex-col gap-3 max-w-md'),
            ListInput(controller, ({ item, remove }) =>
              html.div(
                attr.class('flex items-center gap-2'),
                TextInput({
                  value: item.signal,
                  onInput: (v: string) => item.change(v),
                }),
                Button(
                  { size: 'xs', variant: 'subtle', color: 'danger', onClick: remove },
                  Icon({ icon: 'lucide:x', size: 'xs' })
                )
              )
            ),
            Button(
              {
                variant: 'outline',
                size: 'sm',
                onClick: () => controller.push('New item'),
              },
              Icon({ icon: 'lucide:plus', size: 'sm' }),
              'Add'
            )
          )
        },
        'Each item receives a remove() callback. Use controller.push() to add new items.'
      ),
      Section(
        'With Separator',
        () => {
          const controller = createListController(['Step 1', 'Step 2', 'Step 3'])
          return html.div(
            attr.class('flex flex-col max-w-md'),
            ListInput(
              controller,
              ({ item, remove }) =>
                html.div(
                  attr.class('flex items-center gap-2 py-2'),
                  TextInput({
                    value: item.signal,
                    onInput: (v: string) => item.change(v),
                  }),
                  Button(
                    { size: 'xs', variant: 'subtle', color: 'danger', onClick: remove },
                    Icon({ icon: 'lucide:x', size: 'xs' })
                  )
                ),
              () => Divider({})
            )
          )
        },
        'Pass a separator function to render a divider or custom element between items.'
      ),
    ],
  })
}
