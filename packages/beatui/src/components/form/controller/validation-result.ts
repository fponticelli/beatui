export type Valid = {
  type: 'Valid'
}

export type InvalidDependencies = {
  error?: string
  dependencies?: Record<string | number, InvalidDependencies>
}

export type Invalid = {
  type: 'Invalid'
} & InvalidDependencies

export type ValidationResult = Valid | Invalid

export function makeMapValidationResult(field: string | number) {
  return function mapValidationResult(
    status: ValidationResult
  ): ValidationResult {
    if (status.type === 'Valid') return status
    const dependencies = status.dependencies?.[field]
    if (dependencies != null) {
      return { type: 'Invalid', ...dependencies }
    } else {
      return { type: 'Valid' }
    }
  }
}
