import { z } from 'zod'
import { prop } from '@tempots/dom'
import { defineComponent } from '../library/define-component'
import { Button } from '../../components/button/button'
import { ToggleButton } from '../../components/button/toggle-button'
import { CopyButton } from '../../components/button/copy-button'
import { CloseButton } from '../../components/button/close-button'
import { ToggleButtonGroup } from '../../components/button/toggle-button-group'

const buttonVariantSchema = z.enum([
  'filled',
  'light',
  'outline',
  'dashed',
  'default',
  'subtle',
  'text',
])

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

export const buttonComponents = [
  defineComponent({
    name: 'Button',
    props: z.object({
      label: z.string(),
      variant: buttonVariantSchema.optional(),
      size: sizeSchema.optional(),
      color: colorSchema.optional(),
      disabled: z.boolean().optional(),
      loading: z.boolean().optional(),
      fullWidth: z.boolean().optional(),
    }),
    description:
      'An interactive button component with theme-aware styling, loading state, and accessibility support.',
    renderer: props =>
      Button(
        {
          variant: props.variant,
          size: props.size,
          color: props.color,
          disabled: props.disabled,
          loading: props.loading,
          fullWidth: props.fullWidth,
        },
        props.label
      ),
  }),

  defineComponent({
    name: 'ToggleButton',
    props: z.object({
      label: z.string(),
      pressed: z.boolean(),
      variant: buttonVariantSchema.optional(),
      size: sizeSchema.optional(),
      color: colorSchema.optional(),
      disabled: z.boolean().optional(),
    }),
    description:
      'A toggle button that can be pressed/unpressed, styled as a button with visual feedback for the pressed state.',
    renderer: props => {
      const pressed = prop(props.pressed)
      return ToggleButton(
        {
          pressed,
          onChange: v => pressed.set(v),
          variant: props.variant,
          size: props.size,
          color: props.color,
          disabled: props.disabled,
        },
        props.label
      )
    },
  }),

  defineComponent({
    name: 'CopyButton',
    props: z.object({
      text: z.string(),
      variant: buttonVariantSchema.optional(),
      size: sizeSchema.optional(),
      color: colorSchema.optional(),
    }),
    description:
      'A button that copies text to the clipboard with visual feedback.',
    renderer: props =>
      CopyButton({
        text: props.text,
        variant: props.variant,
        size: props.size,
        color: props.color,
      }),
  }),

  defineComponent({
    name: 'CloseButton',
    props: z.object({
      size: sizeSchema.optional(),
      color: colorSchema.optional(),
      icon: z.string().optional(),
    }),
    description:
      'A small icon-only button for dismissing modals, drawers, notifications, and tags.',
    renderer: props =>
      CloseButton({
        size: props.size,
        color: props.color,
        icon: props.icon,
      }),
  }),

  defineComponent({
    name: 'ToggleButtonGroup',
    props: z.object({
      items: z.array(
        z.object({
          key: z.string(),
          label: z.string(),
          disabled: z.boolean().optional(),
        })
      ),
      selectedKeys: z.array(z.string()).optional(),
      multiple: z.boolean().optional(),
      variant: buttonVariantSchema.optional(),
      size: sizeSchema.optional(),
      color: colorSchema.optional(),
      orientation: z.enum(['horizontal', 'vertical']).optional(),
    }),
    description:
      'A group container for toggle buttons that manages single or multiple selection.',
    renderer: props => {
      const value = prop<string[]>(props.selectedKeys ?? [])
      return ToggleButtonGroup({
        items: props.items,
        value,
        onChange: v => value.set(v),
        multiple: props.multiple,
        variant: props.variant,
        size: props.size,
        color: props.color,
        orientation: props.orientation,
      })
    },
  }),
]
