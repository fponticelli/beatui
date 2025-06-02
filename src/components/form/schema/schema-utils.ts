import { InvalidDependencies } from '../controller/validation-result'
import { StandardSchemaV1 } from './standard-schema-v1'

export function convertStandardSchemaPathToPath(
  path: ReadonlyArray<PropertyKey | StandardSchemaV1.PathSegment>
) {
  function normalize(v: PropertyKey) {
    return typeof v === 'number' ? v : v.toString()
  }
  return path.map(p =>
    typeof p === 'object' && p.key != null
      ? normalize(p.key)
      : normalize(p as PropertyKey)
  )
}

export function convertStandardSchemaIssues(
  issues: readonly StandardSchemaV1.Issue[]
): InvalidDependencies {
  const topIssues = issues
    .filter(i => i.path == null || i.path.length === 0)
    .map(i => i.message)
  const dependencies = issues
    .filter(i => i.path != null && i.path.length > 0)
    .reduce((acc, i) => {
      const path = convertStandardSchemaPathToPath(i.path!)
      const last = path.pop()!
      let current = acc
      for (const segment of path) {
        if (current.dependencies == null) {
          current.dependencies = {}
        }
        current = current.dependencies[segment] ?? {}
      }
      if (current.dependencies == null) {
        current.dependencies = {}
      }
      current.dependencies[last] = { error: i.message }
      return acc
    }, {} as InvalidDependencies)
  const error = topIssues.join('\n')
  return {
    ...dependencies,
    error: error != '' ? error : undefined,
  }
}
