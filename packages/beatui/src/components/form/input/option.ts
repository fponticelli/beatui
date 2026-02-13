import { TNode } from '@tempots/dom'

/**
 * Represents a single selectable option with a value and label.
 *
 * This is the primary option type used in dropdowns, select inputs, and comboboxes.
 * Each option has a unique value and a human-readable label, with optional decorations
 * (before/after nodes) and disabled state.
 *
 * @template T - The type of the option's value
 */
export type ValueOption<T> = {
  /** Discriminator for option type */
  type: 'value'
  /** The actual value of the option (returned on selection) */
  value: T
  /** Display label shown to the user */
  label: string
  /** Whether the option is disabled and cannot be selected */
  disabled?: boolean
  /** Optional node to render before the label (e.g., icon) */
  before?: TNode
  /** Optional node to render after the label (e.g., badge) */
  after?: TNode
}

/**
 * Represents a group of options with a header label.
 *
 * Used to organize options into logical sections in dropdowns and selects.
 * The group itself cannot be selected, but contains a list of selectable options.
 *
 * @template T - The type of the option values within the group
 */
export type GroupOption<T> = {
  /** Discriminator for option type */
  type: 'group'
  /** Header label for the group */
  group: string
  /** Array of options within this group */
  options: ValueOption<T>[]
  /** Whether all options in the group are disabled */
  disabled?: boolean
  /** Optional node to render before the group label */
  before?: TNode
  /** Optional node to render after the group label */
  after?: TNode
}

/**
 * Represents a visual separator (divider) in the option list.
 *
 * Used to add visual breaks between sections of options without creating a labeled group.
 */
export type BreakOption = { type: 'break' }

/**
 * Union type for all option types that can be used in select inputs.
 *
 * @template T - The type of the option values
 */
export type SelectOption<T> = ValueOption<T> | GroupOption<T> | BreakOption

/**
 * Union type for all option types that can be used in dropdown and combobox inputs.
 *
 * This is a discriminated union that allows type-safe handling of different option kinds:
 * - `ValueOption<T>` - A selectable option with value and label
 * - `GroupOption<T>` - A group header containing multiple options
 * - `BreakOption` - A visual separator
 *
 * @template T - The type of the option values
 *
 * @example
 * ```ts
 * const options: DropdownOption<string>[] = [
 *   Option.value('red', 'Red'),
 *   Option.value('blue', 'Blue'),
 *   Option.break,
 *   Option.group('Advanced', [
 *     Option.value('cyan', 'Cyan'),
 *     Option.value('magenta', 'Magenta')
 *   ])
 * ]
 * ```
 */
export type DropdownOption<T> = ValueOption<T> | GroupOption<T> | BreakOption

/**
 * Generic union of all option types for maximum flexibility.
 *
 * @template T - The type of the option values
 */
export type AnyOption<T> = SelectOption<T> | DropdownOption<T>

/**
 * Utility namespace for creating and manipulating option structures.
 *
 * Provides factory functions for creating options, groups, and breaks, as well as
 * helper methods for extracting values and checking option membership.
 */
export const Option = {
  /**
   * Creates a value option.
   *
   * @template T - The type of the option value
   * @param value - The option's value
   * @param label - Display label for the option
   * @param options - Additional configuration (disabled, before, after)
   * @returns A ValueOption object
   *
   * @example
   * ```ts
   * Option.value('red', 'Red', {
   *   before: Icon({ icon: 'circle', color: 'red' }),
   *   disabled: false
   * })
   * ```
   */
  value: <T>(
    value: T,
    label: string,
    {
      disabled,
      before,
      after,
    }: { disabled?: boolean; before?: TNode; after?: TNode } = {}
  ): ValueOption<T> =>
    ({
      type: 'value',
      value,
      label,
      disabled,
      before,
      after,
    }) as ValueOption<T>,

  /**
   * Creates a group option containing multiple value options.
   *
   * @template T - The type of the option values
   * @param group - Header label for the group
   * @param options - Array of value options or breaks within the group
   * @param config - Additional configuration (disabled, before, after)
   * @returns A GroupOption object
   *
   * @example
   * ```ts
   * Option.group('Colors', [
   *   Option.value('red', 'Red'),
   *   Option.value('blue', 'Blue'),
   *   Option.break,
   *   Option.value('green', 'Green')
   * ])
   * ```
   */
  group: <T>(
    group: string,
    options: (ValueOption<T> | BreakOption)[],
    {
      disabled,
      before,
      after,
    }: {
      disabled?: boolean
      before?: TNode
      after?: TNode
    } = {}
  ): GroupOption<T> =>
    ({
      type: 'group',
      group,
      options,
      disabled,
      before,
      after,
    }) as GroupOption<T>,

  /**
   * A visual separator for breaking up option lists.
   *
   * @example
   * ```ts
   * const options = [
   *   Option.value(1, 'One'),
   *   Option.value(2, 'Two'),
   *   Option.break,
   *   Option.value(3, 'Three')
   * ]
   * ```
   */
  break: { type: 'break' } as BreakOption,

  /**
   * Extracts all values from an array of options, flattening groups.
   *
   * This recursively walks through the option structure and returns only the
   * actual values (ignoring groups and breaks).
   *
   * @template T - The type of the option values
   * @param options - Array of options to extract values from
   * @returns Array of all values in the option structure
   *
   * @example
   * ```ts
   * const options = [
   *   Option.value(1, 'One'),
   *   Option.group('Group', [Option.value(2, 'Two')]),
   *   Option.break
   * ]
   * Option.getValues(options) // Returns [1, 2]
   * ```
   */
  getValues: <T>(options: AnyOption<T>[]): T[] => {
    return options.flatMap(o =>
      o.type === 'group'
        ? Option.getValues(o.options)
        : o.type === 'break'
          ? []
          : [o.value]
    )
  },

  /**
   * Checks if a value exists within an array of options.
   *
   * This is useful for validating whether a selected value is actually present
   * in the available options. Uses a custom equality function for complex types.
   *
   * @template T - The type of the option values
   * @param options - Array of options to search
   * @param value - Value to search for
   * @param equality - Optional custom equality function (defaults to strict equality)
   * @returns True if the value exists in the options, false otherwise
   *
   * @example
   * ```ts
   * const options = [Option.value(1, 'One'), Option.value(2, 'Two')]
   * Option.contains(options, 1) // Returns true
   * Option.contains(options, 3) // Returns false
   *
   * // Custom equality for objects
   * const objOptions = [Option.value({ id: 1 }, 'Item 1')]
   * Option.contains(objOptions, { id: 1 }, (a, b) => a.id === b.id) // Returns true
   * ```
   */
  contains: <T>(
    options: AnyOption<T>[],
    value: T,
    equality: (a: T, b: T) => boolean = (a, b) => a === b
  ) => {
    return Option.getValues(options).some(v => equality(v, value))
  },
}
