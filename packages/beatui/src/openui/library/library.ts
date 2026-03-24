import { AnyComponentDefinition } from './define-component'

/**
 * A group of related components within a library.
 */
export interface ComponentGroup {
  /** Display name of the group */
  name: string
  /** Human-readable description of the group */
  description: string
  /** Component names belonging to this group */
  components: string[]
}

/**
 * Options for creating a component library.
 */
export interface LibraryOptions {
  /** All component definitions */
  components: AnyComponentDefinition[]
  /** The default root/wrapper component name */
  root: string
  /** Logical groupings of components */
  groups: ComponentGroup[]
}

/**
 * A fully assembled component library for use with OpenUI Lang.
 */
export interface ComponentLibrary {
  /** Map of component name to definition */
  components: Map<string, AnyComponentDefinition>
  /** The default root component name */
  root: string
  /** Logical groups of components */
  groups: ComponentGroup[]
}

/**
 * Assemble a component library from component definitions and group metadata.
 *
 * @param options - Library configuration
 * @returns A fully assembled ComponentLibrary
 */
export function createLibrary(options: LibraryOptions): ComponentLibrary {
  const componentMap = new Map<string, AnyComponentDefinition>()
  for (const component of options.components) {
    componentMap.set(component.name, component)
  }

  return {
    components: componentMap,
    root: options.root,
    groups: options.groups,
  }
}
