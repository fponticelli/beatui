import { InputOptions } from './input-options'
import { MaskInput } from './mask-input'

// UUID mask: 8-4-4-4-12 hex digits (case-insensitive input, normalized to lowercase)
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
