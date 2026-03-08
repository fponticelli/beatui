import { ApiProject, ApiReflection, ReflectionKind } from './typedoc-types'

/** Module slug → display name + TypeDoc module name mapping */
export interface ModuleInfo {
  slug: string
  displayName: string
  typedocName: string
}

export const MODULES: ModuleInfo[] = [
  { slug: 'main', displayName: 'Main', typedocName: 'index' },
  { slug: 'auth', displayName: 'Auth', typedocName: 'auth' },
  {
    slug: 'better-auth',
    displayName: 'Better Auth',
    typedocName: 'better-auth',
  },
  {
    slug: 'json-schema',
    displayName: 'JSON Schema',
    typedocName: 'json-schema',
  },
  {
    slug: 'json-schema-display',
    displayName: 'JSON Schema Display',
    typedocName: 'json-schema-display',
  },
  {
    slug: 'json-structure',
    displayName: 'JSON Structure',
    typedocName: 'json-structure',
  },
  { slug: 'monaco', displayName: 'Monaco', typedocName: 'monaco' },
  { slug: 'markdown', displayName: 'Markdown', typedocName: 'markdown' },
  {
    slug: 'prosemirror',
    displayName: 'ProseMirror',
    typedocName: 'prosemirror',
  },
  { slug: 'lexical', displayName: 'Lexical', typedocName: 'lexical' },
  { slug: 'tailwind', displayName: 'Tailwind', typedocName: 'tailwind' },
]

let cachedProject: ApiProject | null = null

/** Fetch and cache the api.json data */
export async function loadApiData(): Promise<ApiProject> {
  if (cachedProject) return cachedProject
  const resp = await fetch('/api.json')
  if (!resp.ok) throw new Error(`Failed to load API data: ${resp.status}`)
  cachedProject = (await resp.json()) as ApiProject
  return cachedProject
}

/** Find the module reflection for a given slug */
export function getModuleReflections(
  project: ApiProject,
  slug: string
): ApiReflection | undefined {
  const info = MODULES.find(m => m.slug === slug)
  if (!info) return undefined
  return project.children.find(c => c.name === info.typedocName)
}

/** Find a specific symbol within a module */
export function getSymbol(
  project: ApiProject,
  slug: string,
  name: string
): ApiReflection | undefined {
  const mod = getModuleReflections(project, slug)
  if (!mod?.children) return undefined
  return mod.children.find(c => c.name === name)
}

export interface CategorizedReflections {
  functions: ApiReflection[]
  interfaces: ApiReflection[]
  classes: ApiReflection[]
  typeAliases: ApiReflection[]
  variables: ApiReflection[]
  enums: ApiReflection[]
}

/** Group an array of reflections by kind */
export function categorizeByKind(
  reflections: ApiReflection[]
): CategorizedReflections {
  const result: CategorizedReflections = {
    functions: [],
    interfaces: [],
    classes: [],
    typeAliases: [],
    variables: [],
    enums: [],
  }
  for (const r of reflections) {
    // Skip re-exports (Reference kind)
    if (r.kind === ReflectionKind.Reference) continue
    switch (r.kind) {
      case ReflectionKind.Function:
        result.functions.push(r)
        break
      case ReflectionKind.Interface:
        result.interfaces.push(r)
        break
      case ReflectionKind.Class:
        result.classes.push(r)
        break
      case ReflectionKind.TypeAlias:
        result.typeAliases.push(r)
        break
      case ReflectionKind.Variable:
        result.variables.push(r)
        break
      case ReflectionKind.Enum:
        result.enums.push(r)
        break
      case ReflectionKind.Namespace:
        // Treat namespace as interface for display purposes
        result.interfaces.push(r)
        break
    }
  }
  // Sort each category alphabetically
  for (const arr of Object.values(result) as ApiReflection[][]) {
    arr.sort((a: ApiReflection, b: ApiReflection) =>
      a.name.localeCompare(b.name)
    )
  }
  return result
}

/** Get the ModuleInfo by slug */
export function getModuleInfo(slug: string): ModuleInfo | undefined {
  return MODULES.find(m => m.slug === slug)
}
