import { z } from 'zod'
import { html, prop } from '@tempots/dom'
import { defineComponent } from '../library/define-component'
import { Modal } from '../../components/overlay/modal'
import { Drawer } from '../../components/overlay/drawer'
import { Tooltip } from '../../components/overlay/tooltip'
import { Popover } from '../../components/overlay/popover'
import { Button } from '../../components/button/button'

export const overlayComponents = [
  defineComponent({
    name: 'Modal',
    props: z.object({
      triggerLabel: z.string(),
      title: z.string().optional(),
      body: z.string(),
      footerLabel: z.string().optional(),
      size: z.enum(['sm', 'md', 'lg', 'xl']).optional(),
      dismissable: z.boolean().optional(),
      position: z
        .enum([
          'center',
          'top',
          'bottom',
          'left',
          'right',
          'top-start',
          'top-end',
          'bottom-start',
          'bottom-end',
        ])
        .optional(),
    }),
    description:
      'A modal dialog component with structured header, body, and footer sections. Renders a trigger button that opens the modal.',
    renderer: props =>
      Modal(
        {
          size: props.size,
          dismissable: props.dismissable,
          position: props.position,
        },
        (open, close) =>
          Button(
            {
              onClick: () =>
                open({
                  header: props.title ? html.h2(props.title) : undefined,
                  body: html.p(props.body),
                  footer: props.footerLabel
                    ? Button(
                        { variant: 'filled', onClick: close },
                        props.footerLabel
                      )
                    : undefined,
                }),
            },
            props.triggerLabel
          )
      ),
  }),

  defineComponent({
    name: 'Drawer',
    props: z.object({
      triggerLabel: z.string(),
      title: z.string().optional(),
      body: z.string(),
      side: z
        .enum(['top', 'right', 'bottom', 'left', 'inline-start', 'inline-end'])
        .optional(),
      size: z.enum(['sm', 'md', 'lg', 'xl']).optional(),
    }),
    description:
      'A slide-out panel component that anchors to any side of the viewport. Renders a trigger button.',
    renderer: props =>
      Drawer((open, close) =>
        Button(
          {
            onClick: () =>
              open({
                side: props.side,
                size: props.size,
                header: props.title ? html.h3(props.title) : undefined,
                body: html.p(props.body),
              }),
          },
          props.triggerLabel
        )
      ),
  }),

  defineComponent({
    name: 'Tooltip',
    props: z.object({
      content: z.string(),
      triggerLabel: z.string(),
      placement: z
        .enum([
          'top',
          'bottom',
          'left',
          'right',
          'top-start',
          'top-end',
          'bottom-start',
          'bottom-end',
        ])
        .optional(),
    }),
    description:
      'A tooltip that provides contextual information when hovering or focusing on an element. Must be a child of the trigger element.',
    renderer: props =>
      Button(
        {},
        props.triggerLabel,
        Tooltip({
          content: props.content,
          placement: props.placement as any,
        })
      ),
  }),

  defineComponent({
    name: 'Popover',
    props: z.object({
      content: z.string(),
      triggerLabel: z.string(),
      placement: z
        .enum([
          'top',
          'bottom',
          'left',
          'right',
          'top-start',
          'top-end',
          'bottom-start',
          'bottom-end',
        ])
        .optional(),
    }),
    description:
      'A popover that displays arbitrary content in a positioned overlay panel triggered by clicking. Must be a child of the trigger element.',
    renderer: props =>
      Button(
        { stopPropagation: false },
        props.triggerLabel,
        Popover({
          content: html.div(html.p(props.content)),
          placement: props.placement as any,
        })
      ),
  }),
]
