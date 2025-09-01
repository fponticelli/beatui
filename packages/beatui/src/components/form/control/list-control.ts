import {
  TNode,
  ElementPosition,
  attr,
  When,
  html,
  Use,
  Value,
  computedOf,
  Merge,
} from '@tempots/dom'
import { ArrayController } from '../controller/controller'
import {
  ListInput,
  ListInputPayload,
  MoveDirection,
  MovableDirection,
} from '../input/list-input'
import { Button, CloseButton } from '@/components/button'
import { Icon } from '@/components/data'
import { Group } from '@/components/layout/group'
import { Stack } from '@/components/layout/stack'
import { BeatUII18n } from '@/beatui-i18n'
import { InputWrapper, InputWrapperOptions } from '../input'

export type ListControllerPayload<T> = ListInputPayload<T>
export type { MoveDirection, MovableDirection }

export type ListControlsLayout = 'below' | 'aside'

export type ListControlOptions<T> = Merge<
  Omit<InputWrapperOptions, 'content'>,
  {
    controller: ArrayController<T[]>
    element: (payload: ListInputPayload<T>) => TNode
    separator?: (pos: ElementPosition) => TNode
    showMove?: Value<boolean>
    showRemove?: Value<boolean>
    showAdd?: Value<boolean>
    /** When true, disables the remove button instead of hiding it */
    removeDisabled?: Value<boolean>
    /** When true, disables the add button (if visible) */
    addDisabled?: Value<boolean>
    createItem?: () => T
    addLabel?: TNode
    controlsLayout?: Value<ListControlsLayout>
  }
>

export const ListControl = <T>(
  options: ListControlOptions<T>,
  ...children: TNode[]
) => {
  const {
    element,
    separator,
    showMove = true,
    showRemove = true,
    showAdd = true,
    createItem,
    addLabel,
    controlsLayout = 'aside',
    ...rest
  } = options

  const isAside = Value.toSignal(controlsLayout).map(l => l === 'aside')

  const renderControls = (payload: ListInputPayload<T>) => {
    const moveButtons = When(showMove ?? false, () =>
      html.div(
        attr.class('bu-items-center'),
        attr.class(
          isAside.map((v): string =>
            v ? 'bu-flex-col' : 'bu-flex-row bu-gap-1'
          )
        ),
        Button(
          {
            size: 'xs',
            roundedness: 'full',
            variant: 'text',
            onClick: () => payload.move('up'),
            disabled: payload.cannotMove('up'),
          },
          Use(BeatUII18n, t =>
            Icon({
              size: 'xs',
              icon: 'line-md:arrow-up',
              title: t.$.incrementValue as Value<string | undefined>,
            })
          )
        ),
        Button(
          {
            size: 'xs',
            roundedness: 'full',
            variant: 'text',
            onClick: () => payload.move('down'),
            disabled: payload.cannotMove('down'),
          },
          Use(BeatUII18n, t =>
            Icon({
              size: 'xs',
              icon: 'line-md:arrow-down',
              title: t.$.decrementValue as Value<string | undefined>,
            })
          )
        )
      )
    )

    const removeButton = When(showRemove, () =>
      Use(BeatUII18n, t =>
        CloseButton({
          size: 'xs',
          // Use a lowercase label to satisfy tests that query with [aria-label*="remove"]
          label: Value.map(t.$.removeItem, s => s.toLowerCase()),
          color: 'error',
          disabled: options.removeDisabled,
          onClick: payload.remove,
        })
      )
    )

    return (content: TNode) =>
      When(
        isAside,
        () =>
          Group(
            attr.class('bu-gap-1 bu-items-center'),
            Stack(attr.class('bu-flex-grow'), content),
            Stack(
              attr.class('bu-items-center'),
              When(
                options.controller.value.map(v => v.length > 1),
                () => moveButtons
              ),
              removeButton
            )
          ),
        () =>
          Stack(
            attr.class('bu-gap-2'),
            content,
            Group(
              attr.class('bu-gap-2 bu-justify-between'),
              When(
                options.controller.value.map(v => v.length > 1),
                () => moveButtons,
                () => html.div()
              ),
              removeButton
            )
          )
      )
  }

  const AddToolbar = When(
    computedOf(showAdd, createItem)((show, create) => show && create != null),
    () =>
      Group(
        attr.class('bu-gap-2 bu-items-center bu-justify-center'),
        Button(
          {
            size: 'sm',
            variant: 'filled',
            onClick: () =>
              (rest.controller as ArrayController<T[]>).push(createItem!()),
            disabled: computedOf(
              (rest.controller as ArrayController<T[]>).disabled,
              options.addDisabled ?? false
            )((ctrlDisabled, addDisabled) => ctrlDisabled || addDisabled),
          },
          Use(BeatUII18n, t =>
            Group(
              attr.class('bu-gap-2'),
              Icon({ icon: 'line-md:plus' }),
              addLabel ?? t.$.addLabel
            )
          )
        )
      )
  )

  return InputWrapper(
    {
      ...rest,
      content: Stack(
        attr.class('bu-gap-2'),
        ListInput(
          rest.controller as ArrayController<T[]>,
          payload => {
            const wrap = renderControls(payload)
            return wrap(element(payload))
          },
          separator
        ),
        AddToolbar
      ),
    },
    ...children
  )
}
