import { z } from 'zod'
import { defineComponent } from '../library/define-component'
import {
  StatCard,
  StatCardValue,
  StatCardLabel,
  StatCardTrend,
  StatCardIcon,
} from '../../components/data/stat-card'
import { Badge } from '../../components/data/badge'
import { AutoColorBadge } from '../../components/data/auto-color-badge'
import { Avatar } from '../../components/data/avatar'
import { AvatarGroup, AvatarGroupOverflow } from '../../components/data/avatar-group'
import { ProgressBar } from '../../components/data/progress-bar'
import { Skeleton } from '../../components/data/skeleton'
import { Indicator } from '../../components/data/indicator'
import { HistoryTimeline } from '../../components/data/history-timeline'
import { Icon } from '../../components/data/icon'
import { prop } from '@tempots/dom'

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

export const dataComponents = [
  defineComponent({
    name: 'StatCard',
    props: z.object({
      value: z.string(),
      label: z.string(),
      trend: z.string().optional(),
      trendDirection: z.enum(['up', 'down', 'flat']).optional(),
      variant: z.enum(['default', 'elevated', 'outlined']).optional(),
      size: sizeSchema.optional(),
      color: colorSchema.optional(),
    }),
    description:
      'A dashboard metric card that displays a statistic with optional label and trend indicator.',
    renderer: props =>
      StatCard(
        {
          variant: props.variant as any,
          size: props.size as any,
          color: props.color as any,
        },
        StatCardValue({}, props.value),
        StatCardLabel({}, props.label),
        ...(props.trend != null && props.trendDirection != null
          ? [
              StatCardTrend({
                value: props.trend,
                direction: props.trendDirection,
              }),
            ]
          : [])
      ),
  }),

  defineComponent({
    name: 'Badge',
    props: z.object({
      label: z.string(),
      variant: z
        .enum(['filled', 'light', 'outline', 'dashed', 'default', 'subtle', 'text'])
        .optional(),
      size: sizeSchema.optional(),
      color: colorSchema.optional(),
      circle: z.boolean().optional(),
    }),
    description:
      'A small status indicator or label component with theme-aware colors.',
    renderer: props =>
      Badge(
        {
          variant: props.variant as any,
          size: props.size as any,
          color: props.color as any,
          circle: props.circle,
        },
        props.label
      ),
  }),

  defineComponent({
    name: 'AutoColorBadge',
    props: z.object({
      label: z.string(),
      size: sizeSchema.optional(),
    }),
    description:
      'A badge that automatically assigns a color based on the label text.',
    renderer: props =>
      AutoColorBadge(
        {
          size: props.size as any,
        },
        props.label
      ),
  }),

  defineComponent({
    name: 'Avatar',
    props: z.object({
      name: z.string().optional(),
      src: z.string().optional(),
      icon: z.string().optional(),
      size: z.enum(['xs', 'sm', 'md', 'lg', 'xl', '2xl']).optional(),
      variant: z.enum(['circle', 'square']).optional(),
      color: colorSchema.optional(),
      bordered: z.boolean().optional(),
    }),
    description:
      'Renders a user avatar with image, initials, or icon fallback.',
    renderer: props =>
      Avatar({
        name: props.name,
        src: props.src,
        icon: props.icon,
        size: props.size as any,
        variant: props.variant,
        color: props.color as any,
        bordered: props.bordered,
      }),
  }),

  defineComponent({
    name: 'AvatarGroup',
    props: z.object({
      names: z.array(z.string()),
      size: z.enum(['xs', 'sm', 'md', 'lg', 'xl', '2xl']).optional(),
      spacing: z.enum(['tight', 'normal']).optional(),
      overflow: z.number().optional(),
    }),
    description:
      'Renders a container for grouping multiple Avatar components with overlapping or spaced layout.',
    renderer: props =>
      AvatarGroup(
        { size: props.size as any, spacing: props.spacing },
        ...props.names.map(name => Avatar({ name, size: props.size as any })),
        ...(props.overflow != null
          ? [AvatarGroupOverflow({ count: props.overflow, size: props.size as any })]
          : [])
      ),
  }),

  defineComponent({
    name: 'ProgressBar',
    props: z.object({
      value: z.number().optional(),
      size: z.enum(['sm', 'md', 'lg']).optional(),
      color: colorSchema.optional(),
      max: z.number().optional(),
      showLabel: z.boolean().optional(),
    }),
    description:
      'Horizontal progress bar. ProgressBar(75, "md") shows 75% progress.',
    renderer: props =>
      ProgressBar({
        value: props.value,
        max: props.max,
        size: props.size,
        color: props.color as any,
        showLabel: props.showLabel ?? true,
      }),
  }),

  // DataTable is too complex to register meaningfully here - skip with TODO
  // TODO: DataTable requires column definitions and data models that can't be expressed as simple props

  defineComponent({
    name: 'Skeleton',
    props: z.object({
      variant: z.enum(['text', 'rect', 'circle']).optional(),
      width: z.string().optional(),
      height: z.string().optional(),
      lines: z.number().optional(),
      animate: z.boolean().optional(),
    }),
    description:
      'A loading placeholder component that shows a shimmer animation.',
    renderer: props =>
      Skeleton({
        variant: props.variant,
        width: props.width,
        height: props.height,
        lines: props.lines,
        animate: props.animate,
      }),
  }),

  defineComponent({
    name: 'Indicator',
    props: z.object({
      show: z.boolean().optional(),
      count: z.number().optional(),
      color: colorSchema.optional(),
      placement: z
        .enum(['top-right', 'top-left', 'bottom-right', 'bottom-left'])
        .optional(),
      size: sizeSchema.optional(),
      children: z.array(z.any()).optional(),
    }),
    description:
      'Overlays a small dot or count badge on any child content for notification counts or status.',
    renderer: props =>
      Indicator(
        {
          show: props.show,
          count: props.count,
          color: props.color as any,
          placement: props.placement,
          size: props.size as any,
        },
        ...(props.children ?? [])
      ),
  }),

  defineComponent({
    name: 'HistoryTimeline',
    props: z.object({
      entries: z.array(
        z.object({
          id: z.string(),
          action: z.string(),
          actionColor: z.string(),
          icon: z.string(),
          target: z.string(),
          targetIcon: z.string(),
          actor: z.object({ name: z.string(), initials: z.string() }),
          time: z.string(),
          detail: z.string(),
          restorable: z.boolean().optional(),
        })
      ),
    }),
    description:
      'A timeline component displaying a history of actions with filtering support.',
    renderer: props =>
      HistoryTimeline({
        entries: prop(props.entries),
      }),
  }),

  defineComponent({
    name: 'Icon',
    props: z.object({
      icon: z.string(),
      size: z.enum(['xs', 'sm', 'md', 'lg', 'xl', '2xl']).optional(),
      color: colorSchema.optional(),
      title: z.string().optional(),
    }),
    description:
      'Renders an SVG icon from the Iconify icon library with lazy-loading and caching.',
    renderer: props =>
      Icon({
        icon: props.icon,
        size: props.size as any,
        color: props.color as any,
        title: props.title,
      }),
  }),
]
