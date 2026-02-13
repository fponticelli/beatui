import { InputOptions } from './input-options'
import { MaskInput } from './mask-input'

/**
 * A UUID input component with an 8-4-4-4-12 hex digit mask.
 *
 * Accepts case-insensitive hexadecimal input and normalizes to lowercase.
 * Automatically inserts hyphens at the correct positions. Built on top of
 * {@link MaskInput} with a pre-configured hex pattern mask.
 *
 * @param options - Standard input options for a string value. The `placeholder`
 *   defaults to `'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'` if not provided.
 * @returns A renderable UUID input component.
 *
 * @example
 * ```ts
 * UUIDInput({
 *   value: prop(''),
 *   onChange: uuid => console.log('UUID:', uuid),
 * })
 * ```
 */
export const UUIDInput = (options: InputOptions<string>) => {
  const hex = {
    type: 'pattern' as const,
    pattern: /[0-9A-Fa-f]/,
    transform: (c: string) => c.toLowerCase(),
  }

  const mask = [
    hex,
    hex,
    hex,
    hex,
    hex,
    hex,
    hex,
    hex,
    '-',
    hex,
    hex,
    hex,
    hex,
    '-',
    hex,
    hex,
    hex,
    hex,
    '-',
    hex,
    hex,
    hex,
    hex,
    '-',
    hex,
    hex,
    hex,
    hex,
    hex,
    hex,
    hex,
    hex,
    hex,
    hex,
    hex,
    hex,
  ]

  return MaskInput({
    ...options,
    mask,
    // Sensible default placeholder; can be overridden via options.placeholder
    placeholder: options.placeholder ?? 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  })
}
