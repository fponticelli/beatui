import { z } from 'zod'
import { defineComponent } from '../library/define-component'
import { Kbd } from '../../components/typography/kbd'
import {
  Label,
  EmphasisLabel,
  MutedLabel,
  DangerLabel,
} from '../../components/typography/label'

export const typographyComponents = [
  defineComponent({
    name: 'Kbd',
    props: z.object({
      key: z.string(),
      size: z.enum(['xs', 'sm', 'md']).optional(),
    }),
    description:
      'A styled keyboard key indicator component for displaying keyboard shortcuts.',
    renderer: props => Kbd({ size: props.size }, props.key),
  }),

  defineComponent({
    name: 'Label',
    props: z.object({
      text: z.string(),
      type: z.enum(['default', 'emphasis', 'muted', 'danger']).optional(),
    }),
    description:
      'An inline label component for text with semantic styling variants.',
    renderer: props => {
      const type = props.type ?? 'default'
      if (type === 'emphasis') return EmphasisLabel(props.text)
      if (type === 'muted') return MutedLabel(props.text)
      if (type === 'danger') return DangerLabel(props.text)
      return Label(props.text)
    },
  }),
]
