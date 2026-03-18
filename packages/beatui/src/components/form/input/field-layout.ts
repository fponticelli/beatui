import {
  makeProviderMark,
  Provider,
  ProviderNotFoundError,
  Value,
} from '@tempots/dom'
import type { ControlSize } from '../../theme'
import type { FieldLabelLayout } from './field'

/**
 * Layout configuration values cascaded by the {@link FieldLayout} provider.
 *
 * When a `Fieldset` provides this context, descendant `Field` components
 * automatically inherit these defaults. Local options on individual Fields
 * take precedence over provider values.
 */
export interface FieldLayoutValue {
  /** Label position relative to input. @default 'vertical' */
  layout: Value<FieldLabelLayout>
  /** Label column width for horizontal layouts. @default '7.5rem' */
  labelWidth: Value<string>
  /** Control size cascaded to children. @default 'md' */
  size: Value<ControlSize>
  /** Gap between fields in a Fieldset. @default 'md' */
  gap: Value<ControlSize>
  /** Number of grid columns. @default 1 */
  columns: Value<number>
  /** Minimum field width before columns auto-collapse. @default '15rem' */
  minFieldWidth: Value<string>
  /** Reduced spacing mode for data-dense interfaces. @default false */
  compact: Value<boolean>
}

/** Default values for the FieldLayout provider. */
export const FIELD_LAYOUT_DEFAULTS: FieldLayoutValue = {
  layout: 'vertical',
  labelWidth: '7.5rem',
  size: 'md',
  gap: 'md',
  columns: 1,
  minFieldWidth: '15rem',
  compact: false,
}

/**
 * Options accepted by the {@link FieldLayout} provider.
 *
 * All properties are optional — unspecified properties fall back to
 * {@link FIELD_LAYOUT_DEFAULTS}.
 */
export interface FieldLayoutOptions {
  /** Label position relative to input. @default 'vertical' */
  layout?: Value<FieldLabelLayout>
  /** Label column width for horizontal layouts. @default '7.5rem' */
  labelWidth?: Value<string>
  /** Control size cascaded to children. @default 'md' */
  size?: Value<ControlSize>
  /** Gap between fields in a Fieldset. @default 'md' */
  gap?: Value<ControlSize>
  /** Number of grid columns. @default 1 */
  columns?: Value<number>
  /** Minimum field width before columns auto-collapse. @default '15rem' */
  minFieldWidth?: Value<string>
  /** Reduced spacing mode. @default false */
  compact?: Value<boolean>
}

/**
 * Provider that cascades form layout configuration to descendant `Field` components.
 *
 * Typically provided by a `Fieldset`, but can also be used directly via `Provide`:
 *
 * @example
 * ```typescript
 * Provide(FieldLayout, { layout: 'horizontal-fixed', labelWidth: '160px' },
 *   Field({ label: 'Name', content: TextInput({ ... }) }),
 *   Field({ label: 'Email', content: TextInput({ ... }) }),
 * )
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FieldLayout: Provider<FieldLayoutValue, any> = {
  mark: makeProviderMark<FieldLayoutValue>('FieldLayout'),

  create: (options: FieldLayoutOptions = {}, ctx) => {
    // Try to read a parent FieldLayout for cascade inheritance.
    // If none exists, fall back to FIELD_LAYOUT_DEFAULTS.
    let parent: FieldLayoutValue = FIELD_LAYOUT_DEFAULTS
    try {
      parent = ctx.getProvider(FieldLayout.mark).value
    } catch (e) {
      if (!(e instanceof ProviderNotFoundError)) {
        throw e
      }
      // No parent provider — use defaults
    }

    const value: FieldLayoutValue = {
      layout: options.layout ?? parent.layout,
      labelWidth: options.labelWidth ?? parent.labelWidth,
      size: options.size ?? parent.size,
      gap: options.gap ?? parent.gap,
      columns: options.columns ?? parent.columns,
      minFieldWidth: options.minFieldWidth ?? parent.minFieldWidth,
      compact: options.compact ?? parent.compact,
    }

    return { value, dispose: () => {} }
  },
}
