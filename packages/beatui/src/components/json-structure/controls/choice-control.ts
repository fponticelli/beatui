/**
 * Choice Control for JSON Structure
 *
 * Handles choice type (tagged unions) with:
 * - Dropdown to select which variant to use
 * - Appropriate fields for selected variant
 * - Optional discriminator property support
 * - Tagged union serialization: { choiceName: variantValue }
 */

import {
  Renderable,
  Value,
  prop,
  MapSignal,
  computedOf,
  attr,
  html,
} from '@tempots/dom'
import type { StructureContext } from '../structure-context'
import { NativeSelect, InputWrapper, type Controller } from '../../form'
import { Controller as ControllerClass } from '../../form/controller/controller'
import { Stack } from '../../layout'
import type { ChoiceTypeDefinition, TypeDefinition } from '../structure-types'
import { StructureGenericControl } from './generic-control'
import { makeDefaultValue } from './control-utils'

/**
 * Selector UI for choosing between choice variants
 */
function ChoiceSelector({
  options,
  selected,
  onChange,
  disabled,
}: {
  options: ReadonlyArray<{ value: string; label: string }>
  selected: Value<string>
  onChange: (value: string) => void
  disabled?: boolean
}): Renderable {
  return NativeSelect({
    options: options.map(o => ({
      type: 'value' as const,
      value: o.value,
      label: o.label,
    })),
    value: selected,
    onChange,
    disabled,
  })
}

/**
 * Layout wrapper for choice control
 */
function ChoiceLayout({
  ctx,
  selector,
  inner,
}: {
  ctx: StructureContext
  selector: Renderable
  inner: Renderable
}): Renderable {
  const content = Stack(
    attr.class('bc-stack--gap-2 bc-stack--align-start'),
    selector,
    inner
  )

  if (ctx.isRoot) {
    return content
  }

  return InputWrapper({
    label: ctx.suppressLabel ? undefined : ctx.label,
    description: ctx.description,
    required: ctx.isRequired,
    content,
  })
}

/**
 * Detect which choice variant is currently active based on the value
 *
 * For tagged unions: { "email": "user@example.com" }
 * For discriminated unions: { "type": "email", "value": "user@example.com" }
 */
function detectActiveChoice(
  value: unknown,
  choices: Record<string, TypeDefinition>,
  selector?: string
): string | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const valueObj = value as Record<string, unknown>

  // Check for discriminator property
  if (selector && selector in valueObj) {
    const discriminatorValue = valueObj[selector]
    if (
      typeof discriminatorValue === 'string' &&
      discriminatorValue in choices
    ) {
      return discriminatorValue
    }
  }

  // Check for tagged union format (single key matching a choice name)
  const keys = Object.keys(valueObj)
  if (keys.length === 1) {
    const key = keys[0]!
    if (key in choices) {
      return key
    }
  }

  return null
}

/**
 * Extract the variant value from the current data
 */
function extractVariantValue(
  value: unknown,
  choiceName: string,
  selector?: string
): unknown {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const valueObj = value as Record<string, unknown>

  // If using discriminator, the variant value is the whole object (minus the discriminator)
  if (selector && selector in valueObj) {
    const { [selector]: _discriminator, ...rest } = valueObj
    return rest
  }

  // For tagged unions, the variant value is the value of the choice key
  if (choiceName in valueObj) {
    return valueObj[choiceName]
  }

  return undefined
}

/**
 * Serialize the variant value back into the choice format
 */
function serializeChoiceValue(
  variantValue: unknown,
  choiceName: string,
  selector?: string
): unknown {
  if (selector) {
    // Discriminated union format: { [selector]: choiceName, ...variantValue }
    if (variantValue && typeof variantValue === 'object') {
      return {
        [selector]: choiceName,
        ...(variantValue as Record<string, unknown>),
      }
    }
    return {
      [selector]: choiceName,
    }
  }

  // Tagged union format: { [choiceName]: variantValue }
  return {
    [choiceName]: variantValue,
  }
}

/**
 * Control for choice type (tagged unions)
 */
export function StructureChoiceControl({
  ctx,
  controller,
}: {
  ctx: StructureContext
  controller: Controller<unknown>
}): Renderable {
  const definition = ctx.definition as ChoiceTypeDefinition

  if (!definition.choices || typeof definition.choices !== 'object') {
    console.warn('StructureChoiceControl requires choices property')
    return html.div(
      attr.class('bc-json-structure-error'),
      'Invalid choice definition: missing choices'
    )
  }

  const choices = definition.choices
  const selector = definition.selector
  const choiceNames = Object.keys(choices)

  if (choiceNames.length === 0) {
    return html.div(
      attr.class('bc-json-structure-error'),
      'Choice type has no variants defined'
    )
  }

  // Generate labels for each choice
  const choiceOptions = choiceNames.map(name => {
    const choiceDef = choices[name]!
    const label = choiceDef.name || name
    return { value: name, label }
  })

  // Auto-detect the active choice based on current value
  const autoDetectedChoice = computedOf(controller.signal)(value => {
    return detectActiveChoice(value, choices, selector)
  })

  // Initialize selection with auto-detected choice or first choice
  const initialChoice = Value.get(autoDetectedChoice) || choiceNames[0]!
  const selectedChoice = prop<string>(initialChoice)
  controller.onDispose(selectedChoice.dispose)

  // Track if user has manually changed the selection
  let userHasManuallySelected = false

  // Update selection when auto-detection changes (but only if user hasn't manually selected)
  const autoUpdateCancel = autoDetectedChoice.on(detected => {
    if (!userHasManuallySelected && detected !== null) {
      selectedChoice.set(detected)
    }
  })
  controller.onDispose(autoUpdateCancel)

  const handleChange = (choiceName: string) => {
    userHasManuallySelected = true
    selectedChoice.set(choiceName)

    // When switching choices, initialize with default value for new variant
    const choiceDef = choices[choiceName]
    if (choiceDef) {
      const defaultValue = makeDefaultValue(choiceDef)
      const newValue = serializeChoiceValue(defaultValue, choiceName, selector)
      controller.change(newValue)
    }
  }

  // Selector dropdown
  const selectorUI = ChoiceSelector({
    options: choiceOptions,
    selected: selectedChoice,
    onChange: handleChange,
    disabled: ctx.readOnly || ctx.isDeprecated,
  })

  // Render the selected variant's control
  const inner = MapSignal(selectedChoice, choiceName => {
    const choiceDef = choices[Value.get(choiceName)]
    if (!choiceDef) {
      return html.div(
        attr.class('bc-json-structure-error'),
        `Choice variant not found: ${Value.get(choiceName)}`
      )
    }

    // Create a wrapped signal that extracts the variant value
    const variantSignal = computedOf(controller.signal)(value =>
      extractVariantValue(value, Value.get(choiceName), selector)
    )

    // Create a wrapped change handler that serializes the variant value
    const variantChange = (variantValue: unknown) => {
      const newValue = serializeChoiceValue(
        variantValue,
        Value.get(choiceName),
        selector
      )
      controller.change(newValue)
    }

    // Create a new Controller instance for the variant
    // We need to wrap the parent controller to handle choice-specific transformations
    const variantController = new ControllerClass(
      [...controller.path, Value.get(choiceName)],
      variantChange,
      variantSignal,
      controller.status,
      {
        disabled: controller.disabled,
      },
      undefined // Use default equality
    )

    // Clean up the variant controller when the parent is disposed
    controller.onDispose(() => variantController.dispose())

    return StructureGenericControl({
      ctx: ctx
        .with({
          definition: choiceDef,
          suppressLabel: true, // Choice selector acts as the label
        })
        .append(Value.get(choiceName)),
      controller: variantController,
    })
  })

  return ChoiceLayout({
    ctx,
    selector: selectorUI,
    inner,
  })
}
