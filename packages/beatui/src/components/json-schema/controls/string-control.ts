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
import { resolveWidget } from '../widgets/utils'
import {
  definitionToInputWrapperOptions,
  makePlaceholder,
  shouldHideWriteOnly,
  shouldDisableControl,
  tryResolveCustomWidget,
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
  if (shouldHideWriteOnly(ctx)) {
    return Fragment()
  }

  const options = {
    ...definitionToInputWrapperOptions({ ctx }),
    placeholder: makePlaceholder(ctx.definition as JSONSchema, String),
    disabled: shouldDisableControl(ctx),
  }

  // For optional nullable primitives, use nullable controls instead of presence toggles
  if (ctx.isNullable && (ctx.isOptional || !ctx.shouldShowPresenceToggle)) {
    return StringControl({ ctx, options, controller })
  }

  // Use new widget resolver with precedence rules
  const resolved = resolveWidget(ctx.definition as JSONSchema, ctx.name)
  const widget = resolved?.widget

  // Try to resolve a custom widget first
  const customWidget = tryResolveCustomWidget({
    ctx,
    controller: controller as unknown as Controller<unknown>,
    resolved,
  })
  if (customWidget) {
    return customWidget
  }

  // For complex widgets that need specialized rendering, delegate to StringControl
  if (
    widget != null &&
    [
      'url',
      'uri',
      'uri-reference',
      'hostname',
      'ipv4',
      'ipv6',
      'regex',
      'duration',
      'binary',
      'markdown',
      'time',
      'color',
    ].includes(widget)
  ) {
    return StringControl({ ctx, options, controller })
  }

  // Otherwise, use regular text-based controls that map empty string to undefined
  switch (widget) {
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
