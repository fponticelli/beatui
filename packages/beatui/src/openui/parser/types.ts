export type ASTNode =
  | { type: 'component'; name: string; args: ASTNode[] }
  | { type: 'string'; value: string }
  | { type: 'number'; value: number }
  | { type: 'boolean'; value: boolean }
  | { type: 'null' }
  | { type: 'array'; items: ASTNode[] }
  | { type: 'object'; entries: Record<string, ASTNode> }
  | { type: 'reference'; name: string }

export interface Statement {
  value: ASTNode
}

export interface ParseResult {
  root: ASTNode | null
  statements: Map<string, Statement>
  meta: {
    incomplete: boolean
    unresolved: string[]
    statementCount: number
    errors: ParseError[]
  }
}

export interface ParseError {
  line: number
  message: string
  code: 'syntax' | 'unknown-component' | 'validation'
}

export interface ComponentNameChecker {
  has(name: string): boolean
}
