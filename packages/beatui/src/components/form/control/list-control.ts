import {
  TNode,
  ElementPosition,
  attr,
  When,
  html,
  Use,
  Value,
} from '@tempots/dom'
import { ArrayController } from '../controller/controller'
import { ControlInputWrapper } from './control-input-wrapper'
import { ControlWrapperOptions } from './control-options'
import {
  ListInput,
  ListInputPayload,
  MoveDirection,
  MovableDirection,
} from '../input/list-input'
import { Button } from '@/components/button'
import { Icon } from '@/components/data'
import { Group } from '@/components/layout/group'
import { Stack } from '@/components/layout/stack'
import { BeatUII18n } from '@/beatui-i18n'

export type ListControllerPayload<T> = ListInputPayload<T>
export type { MoveDirection, MovableDirection }

export type ListControlsLayout = 'below' | 'aside'

export type ListControlOptions<T> = ControlWrapperOptions<T[]> & {
  controller: ArrayController<T[]>
  element: (payload: ListInputPayload<T>) => TNode
  separator?: (pos: ElementPosition) => TNode
  showMove?: Value<boolean>
  showRemove?: Value<boolean>
  showAdd?: Value<boolean>
  createItem?: () => T
  addLabel?: TNode
  controlsLayout?: Value<ListControlsLayout>
}

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
        attr.class('bu-gap-1 bu-items-center'),
        attr.class(
          isAside.map((v): string => (v ? 'bu-flex-col' : 'bu-flex-row'))
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
            Group(
              attr.class('bu-gap-1'),
              Icon({ size: 'xs', icon: 'line-md:arrow-up' }),
              html.span(attr.class('sr-only'), t.$.incrementValue)
            )
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
            Group(
              attr.class('bu-gap-1'),
              Icon({ size: 'xs', icon: 'line-md:arrow-down' }),
              html.span(attr.class('sr-only'), t.$.decrementValue)
            )
          )
        )
      )
    )

    const removeButton = When(showRemove, () =>
      Button(
        {
          size: 'xs',
          roundedness: 'full',
          variant: 'text',
          color: 'error',
          onClick: payload.remove,
        },
        Use(BeatUII18n, t =>
          Group(
            attr.class('bu-gap-1'),
            Icon({ size: 'xs', icon: 'line-md:close' }),
            html.span(attr.class('sr-only'), t.$.removeItem)
          )
        )
      )
    )

    return (content: TNode) =>
      When(
        isAside,
        () =>
          Group(
            attr.class('bu-gap-2 bu-items-start'),
            Stack(attr.class('bu-flex-grow'), content),
            Stack(
              attr.class('bu-gap-2 bu-items-center'),
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

  const addToolbar =
    showAdd && createItem
      ? Group(
          attr.class('bu-gap-2 bu-items-center bu-justify-center'),
          Button(
            {
              size: 'sm',
              variant: 'filled',
              onClick: () =>
                (rest.controller as ArrayController<T[]>).push(createItem()),
              disabled: (rest.controller as ArrayController<T[]>).disabled,
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
      : null

  return ControlInputWrapper(
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
        addToolbar
      ),
    },
    ...children
  )
}
