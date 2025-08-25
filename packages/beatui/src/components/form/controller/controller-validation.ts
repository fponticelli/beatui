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
    // Walk down to the error node for the given subpath
    let node = status.error as ControllerError | undefined
    for (const field of fields) {
      node = node?.dependencies?.[field]
      if (node == null) return Validation.valid
    }
    // At this point, `node` is the error object for the sub-controller
    return Validation.invalid(node as ControllerError)
  }
}
