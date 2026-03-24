import type { DefinedComponent, ComponentGroup, Library, PromptOptions } from './types'

export interface CreateLibraryConfig {
  components: DefinedComponent[]
  root?: string
  groups?: ComponentGroup[]
}

function buildMap(components: DefinedComponent[]): Map<string, DefinedComponent> {
  const map = new Map<string, DefinedComponent>()
  for (const comp of components) {
    map.set(comp.name, comp)
  }
  return map
}

export function createLibrary(config: CreateLibraryConfig): Library {
  const map = buildMap(config.components)
  const root = config.root
  const groups = config.groups

  const library: Library = {
    get components(): ReadonlyMap<string, DefinedComponent> {
      return map
    },

    get root(): string | undefined {
      return root
    },

    get(name: string): DefinedComponent | undefined {
      return map.get(name)
    },

    has(name: string): boolean {
      return map.has(name)
    },

    prompt(_options?: PromptOptions): string {
      return ''
    },

    toJSONSchema(): object {
      return {}
    },

    extend(extConfig: { components?: DefinedComponent[]; root?: string }): Library {
      const merged = new Map(map)
      if (extConfig.components) {
        for (const comp of extConfig.components) {
          merged.set(comp.name, comp)
        }
      }
      const newRoot = extConfig.root ?? root
      return createLibrary({
        components: [...merged.values()],
        root: newRoot,
        groups,
      })
    },
  }

  return library
}
