import { Validation } from '@tempots/std'
import { PathSegment } from './path'

export type ControllerError = {
  message?: string
  dependencies?: Record<PathSegment, ControllerError>
}

export type ControllerValidation = Validation<ControllerError>

export function makeMapValidation(fields: PathSegment[]) {
  return function mapValidation(
    status: ControllerValidation
  ): ControllerValidation {
    if (status.type === 'valid') return status
    let current = status.error.dependencies
    for (const field of fields.slice(0)) {
      current = current?.[field]?.dependencies
      if (current == null) return Validation.valid
    }
    if (current != null) {
      return Validation.invalid({ error: status.error, dependencies: current })
    } else {
      return Validation.valid
    }
  }
}
