import { MinimalMonaco } from './types'

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

const isFunction = (v: unknown): v is (...args: unknown[]) => unknown =>
  typeof v === 'function'

export function isMinimalMonaco(v: unknown): v is MinimalMonaco {
  if (!isObject(v)) return false
  const editor = v.editor
  if (!isObject(editor)) return false
  return isFunction(editor.create) && isFunction(editor.setModelLanguage)
}
