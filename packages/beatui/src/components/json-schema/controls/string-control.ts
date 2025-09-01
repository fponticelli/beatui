import { Fragment, Renderable } from '@tempots/dom'
import {
  Control,
  TextInput,
  EmailInput,
  PasswordInput,
  UUIDInput,
  TextArea,
  transformEmptyStringToUndefined,
  type Controller,
} from '../../form'
import type { SchemaContext, JSONSchema } from '../schema-context'
import { StringControl } from '../widgets/string-controls'
import { stringFormatDetection } from '../widgets/string-detection'
import {
  definitionToInputWrapperOptions,
  makePlaceholder,
} from './shared-utils'

/**
 * Control for string schemas
 */
export function JSONSchemaString({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<string | undefined>
}): Renderable {
  // Handle writeOnly fields - hide them unless explicitly shown
  if (ctx.isWriteOnly && !ctx.shouldShowWriteOnly) {
    return Fragment()
  }

  const options = {
    ...definitionToInputWrapperOptions({ ctx }),
    placeholder: makePlaceholder(ctx.definition as JSONSchema, String),
    // Disable input if readOnly (unless overridden) or deprecated
    disabled: (ctx.isReadOnly && !ctx.shouldIgnoreReadOnly) || ctx.isDeprecated,
  }

  // For optional nullable primitives, use nullable controls instead of presence toggles
  if (ctx.isNullable && (ctx.isOptional || !ctx.shouldShowPresenceToggle)) {
    return StringControl({ ctx, options, controller })
  }

  // For non-nullable strings, use regular text input that maps empty to undefined
  const format = stringFormatDetection(ctx)
  switch (format?.format) {
    case 'email':
      return Control(EmailInput, {
        ...options,
        controller: transformEmptyStringToUndefined(controller),
      })
    case 'password':
      return Control(PasswordInput, {
        ...options,
        controller: transformEmptyStringToUndefined(controller),
      })
    case 'uuid':
      return Control(UUIDInput, {
        ...options,
        controller: transformEmptyStringToUndefined(controller),
      })
    case 'textarea':
      return Control(TextArea, {
        ...options,
        controller: transformEmptyStringToUndefined(controller),
      })
    default:
      return Control(TextInput, {
        ...options,
        controller: transformEmptyStringToUndefined(controller),
      })
  }
}
