import { z } from 'zod'
import { prop } from '@tempots/dom'
import { defineComponent } from '../library/define-component'
import { TextInput } from '../../components/form/input/text-input'
import { NumberInput } from '../../components/form/input/number-input'
import { PasswordInput } from '../../components/form/input/password-input'
import { EmailInput } from '../../components/form/input/email-input'
import { TextArea } from '../../components/form/input/text-area'
import { CheckboxInput } from '../../components/form/input/checkbox-input'
import { Switch } from '../../components/form/input/switch'
import { RadioGroup } from '../../components/form/input/radio-group'
import { NativeSelect } from '../../components/form/input/native-select'
import { RatingInput } from '../../components/form/input/rating-input'
import { SliderInput } from '../../components/form/input/slider-input'
import { ColorInput } from '../../components/form/input/color-input'
import { TagInput } from '../../components/form/input/tag-input'
import { OtpInput } from '../../components/form/input/otp-input'
import { SegmentedInput } from '../../components/form/input/segmented-input'

// NOTE: DropdownInput, ComboboxInput, DatePicker, TimePicker are omitted
// as they have complex generic typings or heavy dependencies that require
// more infrastructure to render meaningfully in isolation.

const sizeSchema = z.enum(['xs', 'sm', 'md', 'lg', 'xl'])

export const formComponents = [
  defineComponent({
    name: 'TextInput',
    props: z.object({
      value: z.string().optional(),
      placeholder: z.string().optional(),
      disabled: z.boolean().optional(),
      size: sizeSchema.optional(),
    }),
    description: 'A single-line text input component.',
    renderer: props => {
      const value = prop(props.value ?? '')
      return TextInput({
        value,
        onChange: v => value.set(v),
        placeholder: props.placeholder,
        disabled: props.disabled,
        size: props.size as any,
      })
    },
  }),

  defineComponent({
    name: 'NumberInput',
    props: z.object({
      value: z.number().optional(),
      placeholder: z.string().optional(),
      disabled: z.boolean().optional(),
      size: sizeSchema.optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      step: z.number().optional(),
    }),
    description: 'A number input component for numeric values.',
    renderer: props => {
      const value = prop(props.value ?? 0)
      return NumberInput({
        value,
        onChange: v => value.set(v),
        placeholder: props.placeholder,
        disabled: props.disabled,
        size: props.size as any,
        min: props.min,
        max: props.max,
        step: props.step,
      })
    },
  }),

  defineComponent({
    name: 'PasswordInput',
    props: z.object({
      value: z.string().optional(),
      placeholder: z.string().optional(),
      disabled: z.boolean().optional(),
      size: sizeSchema.optional(),
    }),
    description: 'A password input with toggle to show/hide the value.',
    renderer: props => {
      const value = prop(props.value ?? '')
      return PasswordInput({
        value,
        onChange: v => value.set(v),
        placeholder: props.placeholder,
        disabled: props.disabled,
        size: props.size as any,
      })
    },
  }),

  defineComponent({
    name: 'EmailInput',
    props: z.object({
      value: z.string().optional(),
      placeholder: z.string().optional(),
      disabled: z.boolean().optional(),
      size: sizeSchema.optional(),
    }),
    description: 'An email address input component.',
    renderer: props => {
      const value = prop(props.value ?? '')
      return EmailInput({
        value,
        onChange: v => value.set(v),
        placeholder: props.placeholder,
        disabled: props.disabled,
        size: props.size as any,
      })
    },
  }),

  defineComponent({
    name: 'TextArea',
    props: z.object({
      value: z.string().optional(),
      placeholder: z.string().optional(),
      disabled: z.boolean().optional(),
      size: sizeSchema.optional(),
      rows: z.number().optional(),
    }),
    description: 'A multi-line text input component.',
    renderer: props => {
      const value = prop(props.value ?? '')
      return TextArea({
        value,
        onChange: v => value.set(v),
        placeholder: props.placeholder,
        disabled: props.disabled,
        size: props.size as any,
        rows: props.rows,
      })
    },
  }),

  defineComponent({
    name: 'CheckboxInput',
    props: z.object({
      checked: z.boolean().optional(),
      placeholder: z.string().optional(),
      disabled: z.boolean().optional(),
      size: sizeSchema.optional(),
    }),
    description:
      'A custom checkbox input component with icon-based checked/unchecked states.',
    renderer: props => {
      const value = prop(props.checked ?? false)
      return CheckboxInput({
        value,
        onChange: v => value.set(v),
        placeholder: props.placeholder,
        disabled: props.disabled,
        size: props.size as any,
      })
    },
  }),

  defineComponent({
    name: 'Switch',
    props: z.object({
      value: z.boolean().optional(),
      disabled: z.boolean().optional(),
      size: sizeSchema.optional(),
      color: z
        .enum([
          'primary',
          'secondary',
          'success',
          'warning',
          'danger',
          'info',
          'neutral',
          'base',
        ])
        .optional(),
    }),
    description:
      'A toggle switch component for boolean on/off states with animated thumb transition.',
    renderer: props => {
      const value = prop(props.value ?? false)
      return Switch({
        value,
        onChange: v => value.set(v),
        disabled: props.disabled,
        size: props.size as any,
        color: props.color as any,
      })
    },
  }),

  defineComponent({
    name: 'RadioGroup',
    props: z.object({
      options: z.array(
        z.object({
          value: z.string(),
          label: z.string(),
          description: z.string().optional(),
          disabled: z.boolean().optional(),
        })
      ),
      value: z.string().optional(),
      orientation: z.enum(['horizontal', 'vertical']).optional(),
      size: sizeSchema.optional(),
      disabled: z.boolean().optional(),
    }),
    description:
      'A group of radio buttons allowing the user to select one option from a mutually exclusive list.',
    renderer: props => {
      const value = prop(props.value ?? (props.options[0]?.value ?? ''))
      return RadioGroup({
        options: prop(props.options),
        value,
        onChange: v => value.set(v),
        orientation: props.orientation,
        size: props.size as any,
        disabled: props.disabled,
      })
    },
  }),

  defineComponent({
    name: 'NativeSelect',
    props: z.object({
      options: z.array(
        z.object({
          value: z.string(),
          label: z.string(),
        })
      ),
      value: z.string().optional(),
      placeholder: z.string().optional(),
      disabled: z.boolean().optional(),
      size: sizeSchema.optional(),
    }),
    description: 'A native HTML select dropdown input component.',
    renderer: props => {
      const value = prop(props.value ?? (props.options[0]?.value ?? ''))
      return NativeSelect<string>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options: prop(props.options.map((o: any) => ({ type: 'value' as const, value: o.value, label: o.label }))) as any,
        value,
        onChange: v => value.set(v),
        placeholder: props.placeholder,
        disabled: props.disabled,
        size: props.size as any,
      })
    },
  }),

  defineComponent({
    name: 'RatingInput',
    props: z.object({
      value: z.number().optional(),
      max: z.number().optional(),
      disabled: z.boolean().optional(),
      size: sizeSchema.optional(),
    }),
    description:
      'A star rating input component with fractional precision support.',
    renderer: props => {
      const value = prop(props.value ?? 0)
      return RatingInput({
        value,
        onChange: v => value.set(v),
        max: props.max,
        disabled: props.disabled,
        size: props.size as any,
      })
    },
  }),

  defineComponent({
    name: 'SliderInput',
    props: z.object({
      value: z.number().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      step: z.number().optional(),
      disabled: z.boolean().optional(),
      size: sizeSchema.optional(),
    }),
    description: 'A range slider input component.',
    renderer: props => {
      const value = prop(props.value ?? (props.min ?? 0))
      return SliderInput({
        value,
        onChange: v => value.set(v),
        min: props.min,
        max: props.max,
        step: props.step,
        disabled: props.disabled,
        size: props.size as any,
      })
    },
  }),

  defineComponent({
    name: 'ColorInput',
    props: z.object({
      value: z.string().optional(),
      disabled: z.boolean().optional(),
      size: sizeSchema.optional(),
    }),
    description: 'A color picker input component.',
    renderer: props => {
      const value = prop(props.value ?? '#000000')
      return ColorInput({
        value,
        onChange: v => value.set(v),
        disabled: props.disabled,
        size: props.size as any,
      })
    },
  }),

  defineComponent({
    name: 'TagInput',
    props: z.object({
      tags: z.array(z.string()).optional(),
      placeholder: z.string().optional(),
      disabled: z.boolean().optional(),
      size: sizeSchema.optional(),
    }),
    description: 'An input for entering and managing a list of tags.',
    renderer: props => {
      const values = prop<string[]>(props.tags ?? [])
      return TagInput({
        values,
        onChange: v => values.set(v),
        placeholder: props.placeholder,
        disabled: props.disabled,
        size: props.size as any,
      })
    },
  }),

  defineComponent({
    name: 'OTPInput',
    props: z.object({
      value: z.string().optional(),
      length: z.number().optional(),
      disabled: z.boolean().optional(),
      size: sizeSchema.optional(),
    }),
    description: 'A one-time password input with individual character fields.',
    renderer: props => {
      const value = prop(props.value ?? '')
      return OtpInput({
        value,
        onChange: v => value.set(v),
        length: props.length,
        disabled: props.disabled,
        size: props.size as any,
      })
    },
  }),

  defineComponent({
    name: 'SegmentedInput',
    props: z.object({
      options: z.record(z.string(), z.string()),
      value: z.string().optional(),
      size: sizeSchema.optional(),
      disabled: z.boolean().optional(),
      variant: z.enum(['pill', 'squared']).optional(),
    }),
    description:
      'A segmented control for selecting one option from a set, similar to a tab bar or radio group.',
    renderer: props => {
      const keys = Object.keys(props.options)
      const value = prop<string>(props.value ?? (keys[0] ?? ''))
      return SegmentedInput<Record<string, string>>({
        options: props.options,
        value: value as any,
        onChange: v => value.set(v as string),
        size: props.size as any,
        disabled: props.disabled,
        variant: props.variant,
      })
    },
  }),
]
