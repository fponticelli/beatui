import { z } from 'zod'
import { html, prop } from '@tempots/dom'
import { defineComponent } from '../library/define-component'
import { Tabs } from '../../components/navigation/tabs/tabs'
import { Breadcrumbs } from '../../components/navigation/breadcrumbs'
import { Pagination } from '../../components/navigation/pagination'
import { Stepper } from '../../components/navigation/stepper'
import { TreeView } from '../../components/navigation/tree-view'
import { Sidebar } from '../../components/navigation/sidebar/sidebar'
import { SidebarGroup } from '../../components/navigation/sidebar/sidebar-group'
import { SidebarLink } from '../../components/navigation/sidebar/sidebar-link'

const sizeSchema = z.enum(['xs', 'sm', 'md', 'lg', 'xl'])
const colorSchema = z.enum([
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
  'base',
])

export const navigationComponents = [
  defineComponent({
    name: 'Tabs',
    props: z.object({
      items: z.array(
        z.object({
          key: z.string(),
          label: z.string(),
          content: z.string().optional(),
          disabled: z.boolean().optional(),
        })
      ),
      activeKey: z.string().optional(),
      size: sizeSchema.optional(),
      variant: z
        .enum(['default', 'filled', 'outline', 'underline', 'pill'])
        .optional(),
      color: colorSchema.optional(),
      orientation: z.enum(['horizontal', 'vertical']).optional(),
    }),
    description:
      'A tabbed navigation component with content panels for each tab.',
    renderer: props => {
      const activeKey = props.activeKey ?? props.items[0]?.key ?? ''
      const value = prop(activeKey)
      return Tabs<string>({
        items: props.items.map(item => ({
          key: item.key,
          label: item.label,
          content: () => html.div(item.content ?? ''),
          disabled: item.disabled,
        })),
        value,
        onChange: k => value.set(k),
        size: props.size as any,
        variant: props.variant,
        color: props.color as any,
        orientation: props.orientation,
      })
    },
  }),

  defineComponent({
    name: 'Breadcrumbs',
    props: z.object({
      items: z.array(
        z.object({
          label: z.string(),
          href: z.string().optional(),
          icon: z.string().optional(),
          current: z.boolean().optional(),
        })
      ),
      separator: z.string().optional(),
      maxItems: z.number().optional(),
      size: sizeSchema.optional(),
    }),
    description:
      'A breadcrumb navigation component showing the current page location within a hierarchy.',
    renderer: props =>
      Breadcrumbs({
        items: prop(props.items),
        separator: props.separator,
        maxItems: props.maxItems,
        size: props.size as any,
      }),
  }),

  defineComponent({
    name: 'Pagination',
    props: z.object({
      currentPage: z.number(),
      totalPages: z.number(),
      siblings: z.number().optional(),
      showPrevNext: z.boolean().optional(),
      showFirstLast: z.boolean().optional(),
      size: sizeSchema.optional(),
      variant: z.enum(['filled', 'outline', 'default']).optional(),
      color: colorSchema.optional(),
    }),
    description:
      'A pagination control for navigating between pages of content.',
    renderer: props => {
      const currentPage = prop(props.currentPage)
      return Pagination({
        currentPage,
        totalPages: props.totalPages,
        onChange: p => currentPage.set(p),
        siblings: props.siblings,
        showPrevNext: props.showPrevNext,
        showFirstLast: props.showFirstLast,
        size: props.size as any,
        variant: props.variant as any,
        color: props.color as any,
      })
    },
  }),

  defineComponent({
    name: 'Stepper',
    props: z.object({
      steps: z.array(
        z.object({
          label: z.string(),
          description: z.string().optional(),
          icon: z.string().optional(),
        })
      ),
      activeStep: z.number().optional(),
      orientation: z.enum(['horizontal', 'vertical']).optional(),
      variant: z.enum(['default', 'compact']).optional(),
      size: sizeSchema.optional(),
      color: colorSchema.optional(),
      showNavigation: z.boolean().optional(),
    }),
    description:
      'A step-by-step wizard component for multi-step forms or workflows.',
    renderer: props => {
      const value = prop(props.activeStep ?? 0)
      return Stepper({
        steps: props.steps.map(s => ({
          label: s.label,
          description: s.description,
          icon: s.icon,
        })),
        value,
        onChange: i => value.set(i),
        orientation: props.orientation,
        variant: props.variant,
        size: props.size as any,
        color: props.color as any,
        showNavigation: props.showNavigation,
      })
    },
  }),

  defineComponent({
    name: 'TreeView',
    props: z.object({
      items: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          icon: z.string().optional(),
          badge: z.string().optional(),
          children: z
            .array(
              z.object({
                id: z.string(),
                label: z.string(),
                icon: z.string().optional(),
              })
            )
            .optional(),
        })
      ),
      selectedId: z.string().optional(),
      size: sizeSchema.optional(),
    }),
    description:
      'A hierarchical tree view component for displaying nested data with expand/collapse.',
    renderer: props => {
      const selectedId = prop<string | undefined>(props.selectedId)
      return TreeView({
        items: prop(props.items),
        selectedId,
        onSelect: id => selectedId.set(id),
        size: props.size as any,
      })
    },
  }),

  defineComponent({
    name: 'Sidebar',
    props: z.object({
      backgroundMode: z.enum(['light', 'dark']).optional(),
      groups: z
        .array(
          z.object({
            label: z.string(),
            links: z.array(
              z.object({
                label: z.string(),
                href: z.string().optional(),
                icon: z.string().optional(),
                active: z.boolean().optional(),
              })
            ),
          })
        )
        .optional(),
    }),
    description:
      'A navigation sidebar component for application layouts, supporting grouped links.',
    renderer: props =>
      Sidebar(
        { backgroundMode: props.backgroundMode },
        ...(props.groups ?? []).map(group =>
          SidebarGroup(
            { header: group.label },
            ...group.links.map(link =>
              SidebarLink({
                content: link.label,
                href: link.href ?? '#',
                icon: link.icon,
              })
            )
          )
        )
      ),
  }),
]
