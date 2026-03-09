import * as ts from 'typescript'
import * as path from 'path'
import * as fs from 'fs'

export interface PropMeta {
  name: string
  description: string
  type: 'union' | 'boolean' | 'string' | 'number' | 'bigint' | 'complex'
  defaultValue?: string
  unionValues?: string[]
  reactive: boolean
  optional: boolean
  numberStep?: number
  numberMin?: number
  numberMax?: number
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
  /^before$/, // TNode slot (InputOptions)
  /^after$/, // TNode slot (InputOptions)
]

/** Props that should NOT be skipped despite matching a skip pattern */
const KEEP_PROPS = new Set(['onLabel', 'offLabel'])

function shouldSkipProp(name: string): boolean {
  if (KEEP_PROPS.has(name)) return false
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
      m => m.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)
    )
    const signalMembers = members.filter(m => {
      const sym = m.getSymbol() || m.aliasSymbol
      return sym?.getName() === 'Signal'
    })
    const valueMembers = members.filter(m => {
      if (m.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)) return false
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

      // Mixed boolean + string literals (e.g. false | true | 'single' | 'multi')
      // Extract only the string literal values; boolean `false` makes it optional
      const stringLiterals = valueMembers.filter(m => m.isStringLiteral())
      const boolLiterals = valueMembers.filter(
        m => m.flags & ts.TypeFlags.BooleanLiteral
      )
      if (
        stringLiterals.length > 0 &&
        stringLiterals.length + boolLiterals.length === valueMembers.length
      ) {
        return {
          type: 'union',
          unionValues: stringLiterals.map(
            m => (m as ts.StringLiteralType).value
          ),
          reactive: isReactive,
        }
      }

      // Boolean + object types (e.g. false | true | SelectionOptions) → boolean
      const objectTypes = valueMembers.filter(
        m =>
          !m.isStringLiteral() &&
          !(m.flags & ts.TypeFlags.BooleanLiteral) &&
          m.getProperties().length > 0
      )
      if (boolLiterals.length > 0 && objectTypes.length > 0) {
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
      if (single.flags & ts.TypeFlags.BigInt) {
        return { type: 'bigint', reactive: isReactive }
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
  if (propType.flags & ts.TypeFlags.BigInt) {
    return { type: 'bigint', reactive: false }
  }

  return null // Complex type
}

/**
 * Extract a JSDoc tag value as a trimmed string.
 */
function extractJsDocTag(symbol: ts.Symbol, tagName: string): string | undefined {
  const jsDocs = symbol.getJsDocTags()
  const tag = jsDocs.find(t => t.name === tagName)
  if (tag && tag.text) {
    return tag.text
      .map(t => t.text)
      .join('')
      .trim()
  }
  return undefined
}

/**
 * Extract @default value from JSDoc tags.
 */
function extractDefault(symbol: ts.Symbol): string | undefined {
  const raw = extractJsDocTag(symbol, 'default')
  return raw?.replace(/^['"]|['"]$/g, '')
}

/**
 * Extract numeric JSDoc hints (@step, @min, @max).
 */
function extractNumberHints(symbol: ts.Symbol): {
  numberStep?: number
  numberMin?: number
  numberMax?: number
} {
  const result: { numberStep?: number; numberMin?: number; numberMax?: number } = {}
  const step = extractJsDocTag(symbol, 'step')
  const min = extractJsDocTag(symbol, 'min')
  const max = extractJsDocTag(symbol, 'max')
  if (step != null) { const n = Number(step); if (!isNaN(n)) result.numberStep = n }
  if (min != null) { const n = Number(min); if (!isNaN(n)) result.numberMin = n }
  if (max != null) { const n = Number(max); if (!isNaN(n)) result.numberMax = n }
  return result
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
 * Get the raw declared type text of a property symbol.
 */
function getDeclaredTypeText(propSymbol: ts.Symbol): string | undefined {
  const decl = propSymbol.getDeclarations()?.[0]
  if (!decl) return undefined
  const typeNode = (decl as ts.PropertySignature | ts.PropertyDeclaration).type
  return typeNode?.getText()
}

/**
 * Check if a property's declared type text contains TNode.
 * We use the declaration text rather than the resolved type because TNode
 * is a complex type alias that the compiler fully expands.
 */
function isDeclaredTNode(propSymbol: ts.Symbol): boolean {
  const text = getDeclaredTypeText(propSymbol)
  if (!text) return false
  return text === 'TNode' || text.includes('TNode')
}

/**
 * Complex types that should be exposed as string inputs in the playground.
 * These are types whose primary usage is a string value, but whose full
 * type definition includes non-primitive alternatives (arrays, functions, etc.)
 * that the type analyzer can't resolve to a simple primitive.
 */
const STRING_LIKE_DECLARED_TYPES = [/\bMask\b/, /\bDynamicMask\b/]

/**
 * Check if a property's declared type wraps a complex type that should
 * be treated as a string input in the playground.
 */
function isDeclaredStringLike(propSymbol: ts.Symbol): boolean {
  const text = getDeclaredTypeText(propSymbol)
  if (!text) return false
  return STRING_LIKE_DECLARED_TYPES.some(re => re.test(text))
}

/**
 * Check if a union type contains Renderable, HTMLElement, or other complex non-controllable types.
 * TNode is excluded from this check — it's handled as a string input.
 */
function containsComplexType(type: ts.Type): boolean {
  const checkSingle = (t: ts.Type): boolean => {
    const sym = t.getSymbol() || t.aliasSymbol
    const name = sym?.getName()
    if (
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
      const isOptionsDecl =
        (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
        node.name.text.endsWith('Options') &&
        node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)

      if (isOptionsDecl) {
        const optionsName = (node as ts.InterfaceDeclaration | ts.TypeAliasDeclaration).name.text
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

          // TNode and string-like complex props are treated as string inputs
          if (isDeclaredTNode(propSymbol) || isDeclaredStringLike(propSymbol)) {
            const description = extractDescription(propSymbol, checker)
            const defaultValue = extractDefault(propSymbol)
            const optional = !!(propSymbol.flags & ts.SymbolFlags.Optional)
            props.push({
              name: propName,
              description,
              type: 'string',
              defaultValue,
              reactive: true,
              optional,
            })
            continue
          }

          const propType = checker.getTypeOfSymbolAtLocation(propSymbol, node)

          // Skip types containing Renderable, HTMLElement, etc.
          if (containsComplexType(propType)) continue

          const analysis = analyzePropertyType(propType, checker)
          if (analysis === null) continue

          const description = extractDescription(propSymbol, checker)
          const defaultValue = extractDefault(propSymbol)
          const optional = !!(propSymbol.flags & ts.SymbolFlags.Optional)

          const numberHints = analysis.type === 'number' ? extractNumberHints(propSymbol) : {}

          props.push({
            name: propName,
            description,
            type: analysis.type,
            defaultValue,
            unionValues: analysis.unionValues,
            reactive: analysis.reactive,
            optional,
            ...numberHints,
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
