export type PathSegment = string | number
export type Path = PathSegment[]

export function parsePath(path: string): Path {
  const segments = path.split('.')
  return segments.map(segment => {
    const match = segment.match(/^\[(\d+)\]$/)
    if (match) {
      return Number(match[1])
    }
    return segment
  })
}

export function wrapSegment(v: number | string) {
  return typeof v === 'number' ? `[${v}]` : `.${v}`
}

export function pathToString(path: Path) {
  if (path.length === 0) return ''
  const [first, ...rest] = path
  const segments = [
    typeof first === 'number' ? `[${first}]` : first,
    ...rest.map(wrapSegment),
  ]
  return segments.join('')
}
