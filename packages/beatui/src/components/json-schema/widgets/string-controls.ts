import {
  Controller,
  InputWrapperOptions,
  Base64Control,
  NullableStringDateControl,
  NullableStringDateTimeControl,
  NullableTextControl,
  NullableTextAreaControl,
  NullablePasswordControl,
  transformNullToUndefined,
} from '@/components/form'
import { SchemaContext } from '../context'
import { TNode } from '@tempots/dom'
import { JSONSchema7 } from 'json-schema'
import { stringFormatDetection } from './string-detection'
import { NullableEmailControl } from '@/components/form/control/nullable-email-control'

export function StringControl({
  ctx,
  options,
  controller,
}: {
  ctx: SchemaContext
  options: Partial<InputWrapperOptions>
  controller: Controller<string | undefined>
}): TNode {
  const format = stringFormatDetection(ctx.definition as JSONSchema7)
  switch (format?.format) {
    case 'email':
      return NullableEmailControl({
        ...options,
        controller: transformNullToUndefined(controller),
      })
    case 'date':
      return NullableStringDateControl({
        ...options,
        controller: transformNullToUndefined(controller),
      })
    case 'date-time':
      return NullableStringDateTimeControl({
        ...options,
        controller: transformNullToUndefined(controller),
      })
    case 'time':
      // TODO
      throw new Error('Not implemented: binary')
    case 'password':
      return NullablePasswordControl({
        ...options,
        controller: transformNullToUndefined(controller),
      })
    case 'binary': {
      return Base64Control({
        mode: 'compact',
        accept: format.mediaType,
        ...options,
        controller,
      })
    }
    case 'uuid':
      // TODO
      console.warn('UUID format not implemented')
      return NullableTextControl({
        ...options,
        controller: transformNullToUndefined(controller),
      })
    case 'textarea':
      return NullableTextAreaControl({
        ...options,
        controller: transformNullToUndefined(controller),
      })
    default:
      return NullableTextControl({
        ...options,
        controller: transformNullToUndefined(controller),
      })
  }
}
