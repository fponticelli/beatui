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
import { globalWidgetRegistry } from '../widgets/widget-customization'
import {
  definitionToInputWrapperOptions,
  makePlaceholder,
  shouldHideWriteOnly,
  shouldDisableControl,
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

  // Step 1: Check for explicit x:ui widget in custom registry
  if (widget != null && ctx.widgetRegistry) {
    const customWidgetReg = ctx.widgetRegistry.get(widget)
    if (customWidgetReg) {
      return customWidgetReg.factory({
        controller: controller as unknown as Controller<unknown>,
        ctx,
        options: resolved?.options,
      })
    }
  }

  // Step 2: Check for explicit x:ui widget in global registry
  if (widget != null) {
    const globalWidgetReg = globalWidgetRegistry.get(widget)
    if (globalWidgetReg) {
      return globalWidgetReg.factory({
        controller: controller as unknown as Controller<unknown>,
        ctx,
        options: resolved?.options,
      })
    }
  }

  // Step 3: Try matcher-based custom widgets (by priority)
  if (ctx.widgetRegistry) {
    const matchedWidget = ctx.widgetRegistry.findBestWidget(ctx)
    if (matchedWidget) {
      return matchedWidget.registration.factory({
        controller: controller as unknown as Controller<unknown>,
        ctx,
        options: resolved?.options,
      })
    }
  }

  // Step 4: Check global registry with matchers
  const globalMatched = globalWidgetRegistry.findBestWidget(ctx)
  if (globalMatched) {
    return globalMatched.registration.factory({
      controller: controller as unknown as Controller<unknown>,
      ctx,
      options: resolved?.options,
    })
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
