import { TNode } from '@tempots/dom'

/**
 * Metadata for a single component property, extracted from TypeScript source.
 */
export interface PropMeta {
  /** Property name */
  name: string
  /** JSDoc description */
  description: string
  /** Simplified type category for control generation */
  type: 'union' | 'boolean' | 'string' | 'number' | 'complex'
  /** Default value from @default JSDoc tag */
  defaultValue?: string
  /** Available values for union types */
  unionValues?: string[]
  /** Whether the property is wrapped in Value<T> (reactive) */
  reactive: boolean
  /** Whether the property is optional */
  optional: boolean
}

/**
 * Metadata for a component, extracted from its Options interface.
 */
export interface ComponentMeta {
  /** Component name, e.g. "Button" */
  name: string
  /** Options interface name, e.g. "ButtonOptions" */
  optionsType: string
  /** Relative source file path for "View Source" links */
  sourceFile: string
  /** Extracted property metadata */
  props: PropMeta[]
}

/**
 * Page-level metadata exported by each component page file.
 */
export interface ComponentPageMeta {
  /** Display name */
  name: string
  /** Sidebar category */
  category: string
  /** Short description */
  description: string
  /** Key into componentMeta registry */
  component: string
  /** Sidebar icon (iconify format) */
  icon?: string
  /** Sort order within category (lower = first) */
  order?: number
  /** Tags for filtering/search */
  tags?: string[]
  /** API module slug (defaults to 'main') */
  apiModule?: string
}

/**
 * A section in a component documentation page.
 */
export interface DocSection {
  title: string
  description?: string
  content: () => TNode
}
