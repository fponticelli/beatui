/**
 * Lightweight interfaces matching the subset of TypeDoc JSON we consume.
 * These correspond to the TypeDoc v0.28+ JSON output format.
 */

/** TypeDoc reflection kind numeric constants */
export const ReflectionKind = {
  Project: 1,
  Module: 2,
  Namespace: 4,
  Enum: 8,
  EnumMember: 16,
  Variable: 32,
  Function: 64,
  Class: 128,
  Interface: 256,
  TypeAlias: 2097152,
  Accessor: 262144,
  Property: 1024,
  Method: 2048,
  CallSignature: 4096,
  Parameter: 32768,
  GetSignature: 524288,
  SetSignature: 1048576,
  Reference: 4194304,
} as const

export type ReflectionKindValue =
  (typeof ReflectionKind)[keyof typeof ReflectionKind]

export function kindLabel(kind: number): string {
  switch (kind) {
    case ReflectionKind.Module:
      return 'Module'
    case ReflectionKind.Namespace:
      return 'Namespace'
    case ReflectionKind.Enum:
      return 'Enum'
    case ReflectionKind.EnumMember:
      return 'Enum Member'
    case ReflectionKind.Variable:
      return 'Variable'
    case ReflectionKind.Function:
      return 'Function'
    case ReflectionKind.Class:
      return 'Class'
    case ReflectionKind.Interface:
      return 'Interface'
    case ReflectionKind.TypeAlias:
      return 'Type Alias'
    case ReflectionKind.Property:
      return 'Property'
    case ReflectionKind.Method:
      return 'Method'
    case ReflectionKind.Accessor:
      return 'Accessor'
    case ReflectionKind.Reference:
      return 'Reference'
    default:
      return 'Unknown'
  }
}

export interface ApiSource {
  fileName: string
  line: number
  character: number
  url?: string
}

export interface ApiCommentTag {
  tag: string
  content: ApiCommentPart[]
}

export interface ApiCommentPart {
  kind: 'text' | 'code' | 'inline-tag'
  text: string
  tag?: string
  target?: number | string
}

export interface ApiComment {
  summary?: ApiCommentPart[]
  blockTags?: ApiCommentTag[]
}

export interface ApiType {
  type: string
  // intrinsic
  name?: string
  // reference
  target?: number | string | { sourceFileName: string; qualifiedName: string }
  package?: string
  qualifiedName?: string
  typeArguments?: ApiType[]
  // union / intersection
  types?: ApiType[]
  // array
  elementType?: ApiType
  // literal
  value?: unknown
  // reflection (inline type literal)
  declaration?: ApiReflection
  // tuple
  elements?: ApiType[]
  // mapped
  parameter?: string
  parameterType?: ApiType
  templateType?: ApiType
  // typeOperator
  operator?: string
  // conditional
  checkType?: ApiType
  extendsType?: ApiType
  trueType?: ApiType
  falseType?: ApiType
  // indexedAccess
  objectType?: ApiType
  indexType?: ApiType
  // predicate
  asserts?: boolean
  targetType?: ApiType
  // query
  queryType?: ApiType
  // template literal
  head?: string
  tail?: [ApiType, string][]
  // rest
  // (uses elementType)
}

export interface ApiParameter {
  id: number
  name: string
  variant: string
  kind: number
  flags: Record<string, boolean>
  comment?: ApiComment
  type?: ApiType
  defaultValue?: string
}

export interface ApiSignature {
  id: number
  name: string
  variant: string
  kind: number
  flags: Record<string, boolean>
  comment?: ApiComment
  sources?: ApiSource[]
  typeParameter?: ApiTypeParameter[]
  parameters?: ApiParameter[]
  type?: ApiType
}

export interface ApiTypeParameter {
  id: number
  name: string
  variant: string
  kind: number
  flags: Record<string, boolean>
  type?: ApiType
  default?: ApiType
}

export interface ApiReflection {
  id: number
  name: string
  variant: string
  kind: number
  flags: Record<string, boolean>
  comment?: ApiComment
  children?: ApiReflection[]
  groups?: ApiGroup[]
  sources?: ApiSource[]
  signatures?: ApiSignature[]
  type?: ApiType
  typeParameter?: ApiTypeParameter[]
  defaultValue?: string
  target?: number
  /** Extended types for classes */
  extendedTypes?: ApiType[]
  /** Implemented types for classes */
  implementedTypes?: ApiType[]
}

export interface ApiGroup {
  title: string
  children: number[]
}

export interface ApiProject {
  schemaVersion: string
  id: number
  name: string
  variant: string
  kind: number
  flags: Record<string, boolean>
  children: ApiReflection[]
  groups?: ApiGroup[]
  packageName?: string
  symbolIdMap: Record<string, { sourceFileName: string; qualifiedName: string }>
}
