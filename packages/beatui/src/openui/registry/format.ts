import { z } from 'zod'
import { defineComponent } from '../library/define-component'
import { FormatNumber } from '../../components/format/format-number'
import { FormatDate } from '../../components/format/format-date'
import { FormatTime } from '../../components/format/format-time'
import { FormatDateTime } from '../../components/format/format-date-time'
import { FormatRelativeTime } from '../../components/format/format-relative-time'
import { FormatFileSize } from '../../components/format/format-file-size'

export const formatComponents = [
  defineComponent({
    name: 'FormatNumber',
    props: z.object({
      value: z.number(),
      style: z.enum(['decimal', 'currency', 'percent', 'unit']).optional(),
      currency: z.string().optional(),
      notation: z
        .enum(['standard', 'scientific', 'engineering', 'compact'])
        .optional(),
      minimumFractionDigits: z.number().optional(),
      maximumFractionDigits: z.number().optional(),
      locale: z.string().optional(),
    }),
    description: 'Locale-aware number formatting component.',
    renderer: props =>
      FormatNumber({
        value: props.value,
        style: props.style,
        currency: props.currency,
        notation: props.notation,
        minimumFractionDigits: props.minimumFractionDigits,
        maximumFractionDigits: props.maximumFractionDigits,
        locale: props.locale,
      }),
  }),

  defineComponent({
    name: 'FormatDate',
    props: z.object({
      value: z.string(),
      dateStyle: z.enum(['full', 'long', 'medium', 'short']).optional(),
      locale: z.string().optional(),
      timeZone: z.string().optional(),
    }),
    description: 'Locale-aware date formatting component.',
    renderer: props =>
      FormatDate({
        value: props.value,
        dateStyle: props.dateStyle,
        locale: props.locale,
        timeZone: props.timeZone,
      }),
  }),

  defineComponent({
    name: 'FormatTime',
    props: z.object({
      value: z.string(),
      timeStyle: z.enum(['full', 'long', 'medium', 'short']).optional(),
      locale: z.string().optional(),
      timeZone: z.string().optional(),
      hour12: z.boolean().optional(),
    }),
    description: 'Locale-aware time formatting component.',
    renderer: props =>
      FormatTime({
        value: props.value,
        timeStyle: props.timeStyle,
        locale: props.locale,
        timeZone: props.timeZone,
        hour12: props.hour12,
      }),
  }),

  defineComponent({
    name: 'FormatDateTime',
    props: z.object({
      value: z.string(),
      dateStyle: z.enum(['full', 'long', 'medium', 'short']).optional(),
      timeStyle: z.enum(['full', 'long', 'medium', 'short']).optional(),
      locale: z.string().optional(),
      timeZone: z.string().optional(),
    }),
    description:
      'Locale-aware date and time formatting component combining date and time styles.',
    renderer: props =>
      FormatDateTime({
        value: props.value,
        dateStyle: props.dateStyle,
        timeStyle: props.timeStyle,
        locale: props.locale,
        timeZone: props.timeZone,
      }),
  }),

  defineComponent({
    name: 'FormatRelativeTime',
    props: z.object({
      value: z.number(),
      unit: z.enum([
        'year',
        'quarter',
        'month',
        'week',
        'day',
        'hour',
        'minute',
        'second',
      ]),
      numeric: z.enum(['always', 'auto']).optional(),
      style: z.enum(['long', 'short', 'narrow']).optional(),
      locale: z.string().optional(),
    }),
    description:
      'Locale-aware relative time formatting component (e.g., "2 days ago", "in 3 hours").',
    renderer: props =>
      FormatRelativeTime({
        value: props.value,
        unit: props.unit,
        numeric: props.numeric,
        style: props.style,
        locale: props.locale,
      }),
  }),

  defineComponent({
    name: 'FormatFileSize',
    props: z.object({
      value: z.number(),
      decimalPlaces: z.number().optional(),
      locale: z.string().optional(),
    }),
    description:
      'Locale-aware file size formatting component (e.g., "1.5 KB", "2.3 MB").',
    renderer: props =>
      FormatFileSize({
        value: props.value,
        decimalPlaces: props.decimalPlaces,
        locale: props.locale,
      }),
  }),
]
