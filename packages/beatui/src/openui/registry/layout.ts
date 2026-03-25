import { z } from 'zod'
import { html, attr } from '@tempots/dom'
import type { TNode } from '@tempots/dom'
import type { CenterGap } from '../../components/theme'
import { defineComponent } from '../library/define-component'
import { Stack } from '../../components/layout/stack'
import { Group } from '../../components/layout/group'
import { Card } from '../../components/layout/card'
import { Divider } from '../../components/layout/divider'
import { Accordion } from '../../components/layout/accordion'
import { Center } from '../../components/layout/center'
import { Collapse } from '../../components/layout/collapse'
import { Gap } from '../../components/layout'

export const layoutComponents = [
  defineComponent({
    name: 'Stack',
    props: z.object({
      children: z.array(z.any()).optional(),
    }),
    description:
      'Vertical stack layout that arranges children in a column with consistent spacing.',
    renderer: props => Stack(Gap('md'), ...(props.children ?? [])),
  }),

  defineComponent({
    name: 'Group',
    props: z.object({
      children: z.array(z.any()).optional(),
    }),
    description:
      'Horizontal group layout that arranges children in a row with consistent spacing.',
    renderer: props => Group(Gap('md'), ...(props.children ?? [])),
  }),

  defineComponent({
    name: 'Card',
    props: z.object({
      title: z.string().optional(),
      content: z.string().optional(),
      variant: z.enum(['default', 'elevated', 'outlined', 'flat']).optional(),
      children: z.array(z.any()).optional(),
    }),
    description:
      'A container with optional title and content text. Card("My Title", "Description text")',
    renderer: props => {
      const inner: TNode[] = []
      if (props.title)
        inner.push(html.h3(attr.class('font-semibold text-lg'), props.title))
      if (props.content)
        inner.push(
          html.p(attr.class('text-gray-600 dark:text-gray-400'), props.content)
        )
      if (props.children) inner.push(...(props.children as TNode[]))
      return Card({ variant: props.variant }, ...inner)
    },
  }),

  defineComponent({
    name: 'Divider',
    props: z.object({
      orientation: z.enum(['horizontal', 'vertical']).optional(),
      variant: z.enum(['solid', 'dashed', 'dotted']).optional(),
      tone: z.enum(['subtle', 'default', 'strong']).optional(),
      label: z.string().optional(),
      labelAlign: z.enum(['left', 'center', 'right']).optional(),
    }),
    description: 'A visual separator for dividing content sections.',
    renderer: props =>
      Divider({
        orientation: props.orientation,
        variant: props.variant,
        tone: props.tone,
        label: props.label,
        labelAlign: props.labelAlign,
      }),
  }),

  defineComponent({
    name: 'Accordion',
    props: z.object({
      items: z.array(
        z.object({
          key: z.string(),
          header: z.string(),
          body: z.string(),
          defaultOpen: z.boolean().optional(),
          disabled: z.boolean().optional(),
        })
      ),
      multiple: z.boolean().optional(),
      size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).optional(),
      variant: z.enum(['default', 'separated']).optional(),
    }),
    description:
      'An accordion component with collapsible sections. Each item has a clickable header that toggles content.',
    renderer: props =>
      Accordion({
        items: props.items.map(item => ({
          key: item.key,
          header: item.header,
          body: html.p(item.body),
          defaultOpen: item.defaultOpen,
          disabled: item.disabled,
        })),
        multiple: props.multiple,
        size: props.size,
        variant: props.variant,
      }),
  }),

  defineComponent({
    name: 'Center',
    props: z.object({
      gap: z.enum(['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']).optional(),
      children: z.array(z.any()).optional(),
    }),
    description:
      'Centers its children both horizontally and vertically within a container.',
    renderer: props =>
      Center({ gap: props.gap as CenterGap }, ...(props.children ?? [])),
  }),

  defineComponent({
    name: 'Collapse',
    props: z.object({
      open: z.boolean(),
      children: z.array(z.any()).optional(),
    }),
    description:
      'Animated collapsible container that smoothly expands and contracts its content.',
    renderer: props =>
      Collapse({ open: props.open }, ...(props.children ?? [])),
  }),
]
