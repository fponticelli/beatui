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
  Fragment,
} from '@tempots/dom'
import { ArrayController } from '../controller/controller'
import {
  ListInput,
  ListInputPayload,
  MoveDirection,
  MovableDirection,
} from '../input/list-input'
import { Button, CloseButton } from '../../button'
import { Icon } from '../../data'
import { Group } from '../../layout/group'
import { Stack } from '../../layout/stack'
import { BeatUII18n } from '../../../beatui-i18n'
import { InputWrapper, InputWrapperOptions } from '../input'

export type ListControllerPayload<T> = ListInputPayload<T>
export type { MoveDirection, MovableDirection }

export type ListControlsLayout = 'below' | 'aside'

export type BaseListControlOptions<T> = {
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

export type ListControlOptions<T> = Merge<
  Omit<InputWrapperOptions, 'content'>,
  BaseListControlOptions<T>
>

export const BaseListControl = <T>(options: BaseListControlOptions<T>) => {
  const {
    controller,
    element,
    separator,
    showMove = true,
    showRemove = true,
    showAdd = true,
    createItem,
    addLabel,
    controlsLayout = 'aside',
    removeDisabled,
    addDisabled,
  } = options

  const isAside = Value.toSignal(controlsLayout).map(l => l === 'aside')

  const renderControls = (payload: ListInputPayload<T>) => {
    const moveButtons = When(showMove ?? false, () =>
      html.div(
        attr.class('bc-group--align-center'),
        attr.class(
          isAside.map((v): string =>
            v
              ? 'bc-group--direction-column bc-group--gap-1'
              : 'bc-group--direction-row bc-group--gap-1'
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
          color: 'danger',
          disabled: removeDisabled,
          onClick: payload.remove,
        })
      )
    )

    return (content: TNode) =>
      When(
        isAside,
        () =>
          Group(
            attr.class('bc-group--gap-1 bc-group--align-center'),
            Stack(attr.class('bc-stack--grow'), content),
            Stack(
              attr.class('bc-stack--align-center'),
              When(
                controller.signal.map(v => v.length > 1),
                () => moveButtons
              ),
              removeButton
            )
          ),
        () =>
          Stack(
            attr.class('bc-stack--gap-2'),
            content,
            Group(
              attr.class('bc-group--gap-2 bc-group--justify-between'),
              When(
                controller.signal.map(v => v.length > 1),
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
        attr.class(
          'bc-group--gap-2 bc-group--align-center bc-group--justify-center'
        ),
        Button(
          {
            size: 'sm',
            variant: 'filled',
            onClick: () => controller.push(createItem!()),
            disabled: computedOf(
              controller.disabled,
              addDisabled ?? false
            )(
              (ctrlDisabled, addDisabledValue) =>
                ctrlDisabled || addDisabledValue
            ),
          },
          Use(BeatUII18n, t =>
            Group(
              attr.class('bc-group--gap-2'),
              Icon({ icon: 'line-md:plus' }),
              addLabel ?? t.$.addLabel
            )
          )
        )
      )
  )

  return Fragment(
    ListInput(
      controller,
      payload => {
        const wrap = renderControls(payload)
        return wrap(element(payload))
      },
      separator
    ),
    AddToolbar
  )
}

export const ListControl = <T>(
  options: ListControlOptions<T>,
  ...children: TNode[]
) => {
  const {
    controller,
    element,
    separator,
    showMove,
    showRemove,
    showAdd,
    createItem,
    addLabel,
    controlsLayout,
    removeDisabled,
    addDisabled,
    ...inputWrapperOptions
  } = options

  return InputWrapper(
    {
      ...inputWrapperOptions,
      content: BaseListControl({
        controller,
        element,
        separator,
        showMove,
        showRemove,
        showAdd,
        createItem,
        addLabel,
        controlsLayout,
        removeDisabled,
        addDisabled,
      }),
    },
    ...children
  )
}
