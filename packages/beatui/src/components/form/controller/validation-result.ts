import { PathSegment } from './path'

export type Valid = {
  type: 'Valid'
}

export type InvalidDependencies = {
  error?: string
  dependencies?: Record<PathSegment, InvalidDependencies>
}

export type Invalid = {
  type: 'Invalid'
} & InvalidDependencies

export type ValidationResult = Valid | Invalid

export function makeMapValidationResult(fields: PathSegment[]) {
  return function mapValidationResult(
    status: ValidationResult
  ): ValidationResult {
    if (status.type === 'Valid') return status
    let current = status.dependencies
    for (const field of fields.slice(0)) {
      current = current?.[field]?.dependencies
      if (current == null) return { type: 'Valid' }
    }
    if (current != null) {
      return { type: 'Invalid', ...current }
    } else {
      return { type: 'Valid' }
    }
  }
}
