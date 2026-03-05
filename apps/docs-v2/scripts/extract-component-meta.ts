import * as ts from 'typescript'
import * as path from 'path'
import * as fs from 'fs'

export interface PropMeta {
  name: string
  description: string
  type: 'union' | 'boolean' | 'string' | 'number' | 'complex'
  defaultValue?: string
  unionValues?: string[]
  reactive: boolean
  optional: boolean
}

export interface ComponentMeta {
  name: string
  optionsType: string
  sourceFile: string
  props: PropMeta[]
}

/** Property name patterns to skip (callbacks, event handlers, children/content slots) */
const SKIP_PROP_PATTERNS = [
  /^on[A-Z]/, // onClick, onChange, onInput, onBlur, etc.
  /^children$/,
  /^content$/,
  /^header$/,
  /^footer$/,
  /^body$/,
  /^items$/,
  /^render/,
  /^locales$/,
  /^options$/, // Dropdown options, etc.
  /^columns$/, // DataTable columns
  /^data$/, // DataTable data
  /^schema$/, // JSON schema
  /^ref$/, // Element refs
]

function shouldSkipProp(name: string): boolean {
  return SKIP_PROP_PATTERNS.some(p => p.test(name))
}

/**
 * Given a resolved property type (which may be a flattened union of
 * undefined | literal1 | literal2 | ... | Signal<T>), extract the
 * clean inner type and determine if it's reactive.
 *
 * Value<T> in @tempots/dom = T | Signal<T>
 * Optional props become: T | Signal<T> | undefined
 * When T is a union like 'a' | 'b', TS flattens to: 'a' | 'b' | Signal<'a' | 'b'> | undefined
 */
function analyzePropertyType(
  propType: ts.Type,
  checker: ts.TypeChecker
): {
  type: PropMeta['type']
  unionValues?: string[]
  reactive: boolean
} | null {
  // Step 1: If it's a union, separate out undefined and Signal members
  if (propType.isUnion()) {
    const members = propType.types
    const undefinedMembers = members.filter(
      m => m.flags & ts.TypeFlags.Undefined
    )
    const signalMembers = members.filter(m => {
      const sym = m.getSymbol() || m.aliasSymbol
      return sym?.getName() === 'Signal'
    })
    const valueMembers = members.filter(m => {
      if (m.flags & ts.TypeFlags.Undefined) return false
      const sym = m.getSymbol() || m.aliasSymbol
      if (sym?.getName() === 'Signal') return false
      return true
    })

    const isReactive = signalMembers.length > 0
    const isOptional = undefinedMembers.length > 0

    // Check if value members are all string literals
    if (valueMembers.length > 0) {
      const allStringLiterals = valueMembers.every(m => m.isStringLiteral())
      if (allStringLiterals) {
        return {
          type: 'union',
          unionValues: valueMembers.map(
            m => (m as ts.StringLiteralType).value
          ),
          reactive: isReactive,
        }
      }

      // Check if value members are all boolean literals
      const allBoolLiterals = valueMembers.every(
        m => m.flags & ts.TypeFlags.BooleanLiteral
      )
      if (allBoolLiterals) {
        return { type: 'boolean', reactive: isReactive }
      }

      // Check for function types (callbacks) — skip these
      const hasFunction = valueMembers.some(m => m.getCallSignatures().length > 0)
      if (hasFunction) return null
    }

    // Single non-undefined/non-Signal member
    if (valueMembers.length === 1) {
      const single = valueMembers[0]
      if (single.flags & ts.TypeFlags.String) {
        return { type: 'string', reactive: isReactive }
      }
      if (single.flags & ts.TypeFlags.Number) {
        return { type: 'number', reactive: isReactive }
      }
      if (
        single.flags & ts.TypeFlags.Boolean ||
        single.flags & ts.TypeFlags.BooleanLiteral
      ) {
        return { type: 'boolean', reactive: isReactive }
      }
    }

    // No value members but there's a signal — check signal type arg
    if (valueMembers.length === 0 && signalMembers.length > 0) {
      return null // Can't determine type
    }
  }

  // Non-union type
  if (propType.flags & ts.TypeFlags.Boolean) {
    return { type: 'boolean', reactive: false }
  }
  if (propType.flags & ts.TypeFlags.String) {
    return { type: 'string', reactive: false }
  }
  if (propType.flags & ts.TypeFlags.Number) {
    return { type: 'number', reactive: false }
  }

  return null // Complex type
}

/**
 * Extract @default value from JSDoc tags.
 */
function extractDefault(symbol: ts.Symbol): string | undefined {
  const jsDocs = symbol.getJsDocTags()
  const defaultTag = jsDocs.find(t => t.name === 'default')
  if (defaultTag && defaultTag.text) {
    return defaultTag.text
      .map(t => t.text)
      .join('')
      .trim()
      .replace(/^['"]|['"]$/g, '')
  }
  return undefined
}

/**
 * Extract JSDoc description from a symbol.
 */
function extractDescription(
  symbol: ts.Symbol,
  checker: ts.TypeChecker
): string {
  const doc = symbol.getDocumentationComment(checker)
  return doc.map(d => d.text).join('\n')
}

/**
 * Check if a union type contains TNode, Renderable, or other complex non-controllable types.
 */
function containsComplexType(type: ts.Type): boolean {
  const checkSingle = (t: ts.Type): boolean => {
    const sym = t.getSymbol() || t.aliasSymbol
    const name = sym?.getName()
    if (
      name === 'TNode' ||
      name === 'Renderable' ||
      name === 'HTMLElement' ||
      name === 'Element' ||
      name === 'AccordionItem'
    ) {
      return true
    }
    // Check type arguments
    const args = (t as ts.TypeReference).typeArguments
    if (args) {
      return args.some(a => checkSingle(a))
    }
    return false
  }

  if (type.isUnion()) {
    return type.types.some(t => checkSingle(t))
  }
  return checkSingle(type)
}

/**
 * Extract component metadata from all *Options interfaces in the beatui source.
 */
export function extractAllComponentMeta(
  beatuiSrcDir: string
): Record<string, ComponentMeta> {
  const beatuiRoot = path.resolve(beatuiSrcDir, '..')
  const configPath = path.join(beatuiRoot, 'tsconfig.json')

  let program: ts.Program

  if (fs.existsSync(configPath)) {
    const configFile = ts.readConfigFile(configPath, p =>
      fs.readFileSync(p, 'utf-8')
    )
    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(configPath)
    )
    program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options)
  } else {
    const files = ts.sys.readDirectory!(
      beatuiSrcDir,
      ['.ts'],
      ['node_modules', 'dist'],
      []
    )
    program = ts.createProgram(files, {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      skipLibCheck: true,
    })
  }

  const checker = program.getTypeChecker()
  const result: Record<string, ComponentMeta> = {}

  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile) continue
    if (sourceFile.fileName.indexOf(beatuiSrcDir) === -1) continue

    ts.forEachChild(sourceFile, node => {
      if (
        ts.isInterfaceDeclaration(node) &&
        node.name.text.endsWith('Options') &&
        node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
      ) {
        const optionsName = node.name.text
        const componentName = optionsName.replace(/Options$/, '')

        // Skip internal/utility options
        if (
          componentName.includes('Plugin') ||
          componentName.includes('Bridge') ||
          componentName.includes('Preset') ||
          componentName.includes('FocusTrap') ||
          componentName.includes('AnimatedToggle') ||
          componentName.includes('TimedToggle') ||
          componentName.includes('Tailwind') ||
          componentName.includes('SemanticToken')
        ) {
          return
        }

        const type = checker.getTypeAtLocation(node)
        const props: PropMeta[] = []

        for (const propSymbol of type.getProperties()) {
          const propName = propSymbol.getName()
          if (shouldSkipProp(propName)) continue

          const propType = checker.getTypeOfSymbolAtLocation(propSymbol, node)

          // Skip types containing TNode, Renderable, etc.
          if (containsComplexType(propType)) continue

          const analysis = analyzePropertyType(propType, checker)
          if (analysis === null) continue

          const description = extractDescription(propSymbol, checker)
          const defaultValue = extractDefault(propSymbol)
          const optional = !!(propSymbol.flags & ts.SymbolFlags.Optional)

          props.push({
            name: propName,
            description,
            type: analysis.type,
            defaultValue,
            unionValues: analysis.unionValues,
            reactive: analysis.reactive,
            optional,
          })
        }

        if (props.length === 0) return

        const relativeFile = path.relative(beatuiSrcDir, sourceFile.fileName)

        result[componentName] = {
          name: componentName,
          optionsType: optionsName,
          sourceFile: relativeFile,
          props,
        }
      }
    })
  }

  return result
}

/**
 * Generate TypeScript source code for the component metadata registry.
 */
export function generateMetaSource(
  meta: Record<string, ComponentMeta>
): string {
  const lines: string[] = [
    '// Auto-generated by extract-component-meta.ts — DO NOT EDIT',
    "import type { ComponentMeta } from '../framework/types'",
    '',
    'export const componentMeta: Record<string, ComponentMeta> = ',
    JSON.stringify(meta, null, 2),
    '',
  ]
  return lines.join('\n')
}
