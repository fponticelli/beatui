import { Renderable, Value, MapSignal } from '@tempots/dom'
import type { JSONSchema } from '../json-schema/schema-context'
export type { JSONSchema } from '../json-schema/schema-context'
import { SchemaContext } from '../json-schema/schema-context'
import { GenericDisplay } from './displays/generic-display'
import { detectMismatches, type Mismatch } from './mismatch'
import {
  DisplayWidgetRegistry,
  type CustomDisplayWidgets,
} from './display-widget-customization'

export interface JSONSchemaDisplayProps {
  /** The root JSON Schema describing the value */
  schema: JSONSchema
  /** The reactive value to display */
  value: Value<unknown>
  /** Whether to compute and show mismatches (default: true) */
  showMismatches?: boolean
  /** Custom display widget registrations */
  customWidgets?: CustomDisplayWidgets
  /** Use horizontal layout for field labels */
  horizontal?: boolean
}

/**
 * Top-level JSON Schema Display component.
 * Given a JSON Schema and a JSON value, renders the value using schema annotations,
 * highlights mismatches, and supports custom display widgets.
 *
 * This is the read-only counterpart to JSONSchemaForm.
 * No AJV dependency, no Controller, no form state.
 */
export function JSONSchemaDisplay({
  schema,
  value,
  showMismatches = true,
  customWidgets,
  horizontal = false,
}: JSONSchemaDisplayProps): Renderable {
  const ctx = new SchemaContext({
    schema,
    definition: schema,
    horizontal,
    isPropertyRequired: false,
    path: [],
  })

  // Build display widget registry if custom widgets provided
  let displayWidgetRegistry: DisplayWidgetRegistry | undefined
  if (customWidgets && customWidgets.length > 0) {
    displayWidgetRegistry = new DisplayWidgetRegistry()
    for (const registration of customWidgets) {
      displayWidgetRegistry.register(registration)
    }
  }

  // Wrap in MapSignal so mismatches are recomputed whenever the value changes
  const sig = Value.toSignal(value)
  return MapSignal(sig, v => {
    const mismatches: Mismatch[] | undefined = showMismatches
      ? detectMismatches(v, schema)
      : undefined

    return GenericDisplay({
      ctx,
      value: v,
      mismatches,
      displayWidgetRegistry,
    })
  })
}
