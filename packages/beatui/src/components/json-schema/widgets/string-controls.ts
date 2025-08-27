import {
  Controller,
  InputWrapperOptions,
  transformNullToUndefined,
  Control,
  MappedControl,
} from '@/components/form'
import { SchemaContext } from '../context'
import { Async, TNode } from '@tempots/dom'
import { stringFormatDetection } from './string-detection'
import {
  Base64Input,
  NullableEmailInput,
  NullableDateInput,
  NullableDateTimeInput,
  NullablePasswordInput,
  NullableTextArea,
  NullableTextInput,
  NullableUUIDInput,
} from '@/components/form/input'

/*
TODO:
- [ ] color (infer from name, pattern or format)
*/

export function StringControl({
  ctx,
  options,
  controller,
}: {
  ctx: SchemaContext
  options: Partial<InputWrapperOptions>
  controller: Controller<string | undefined>
}): TNode {
  const format = stringFormatDetection(ctx)
  switch (format?.format) {
    case 'email':
      return Control(NullableEmailInput, {
        ...options,
        controller: transformNullToUndefined(controller),
      })
    case 'date':
      return MappedControl(NullableDateInput, {
        ...options,
        controller: transformNullToUndefined(controller),
        toInput: v => (v == null ? null : new Date(v)),
        fromInput: (v: Date | null) => v?.toISOString().split('T')[0] ?? null,
      })
    case 'date-time':
      return MappedControl(NullableDateTimeInput, {
        ...options,
        controller: transformNullToUndefined(controller),
        toInput: v => (v == null ? null : new Date(v)),
        fromInput: (v: Date | null) => v?.toISOString() ?? null,
      })
    case 'markdown': {
      return Async(import('@/components/milkdown/nullable-milkdown-input'), {
        then: ({ NullableMilkdownInput }) =>
          Control(NullableMilkdownInput, {
            ...options,
            controller: transformNullToUndefined(controller),
          }),
      })
    }
    case 'time':
      // TODO
      throw new Error('Not implemented: time')
    case 'password':
      return Control(NullablePasswordInput, {
        ...options,
        controller: transformNullToUndefined(controller),
      })
    case 'binary': {
      return Control(Base64Input, {
        mode: 'compact',
        accept: format.mediaType,
        ...options,
        controller,
      })
    }
    case 'uuid':
      return Control(NullableUUIDInput, {
        ...options,
        controller: transformNullToUndefined(controller),
      })
    case 'textarea':
      return Control(NullableTextArea, {
        ...options,
        controller: transformNullToUndefined(controller),
      })
    default:
      return Control(NullableTextInput, {
        ...options,
        controller: transformNullToUndefined(controller),
      })
  }
}
