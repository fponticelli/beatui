/**
 * Lexical module loaders.
 *
 * All imports are static to ensure a single module instance is shared
 * across all code paths (avoiding Lexical error #195 - dual module instances).
 *
 * The async function signatures are preserved for backward compatibility.
 */

import * as lexicalCore from 'lexical'
import * as lexicalRichText from '@lexical/rich-text'
import * as lexicalPlainText from '@lexical/plain-text'
import * as lexicalHistory from '@lexical/history'
import * as lexicalList from '@lexical/list'
import * as lexicalLink from '@lexical/link'
import * as lexicalClipboard from '@lexical/clipboard'
import * as lexicalMarkdown from '@lexical/markdown'
import * as lexicalHtml from '@lexical/html'
import * as lexicalTable from '@lexical/table'
import * as lexicalCode from '@lexical/code'
import * as lexicalHashtag from '@lexical/hashtag'
import * as lexicalMark from '@lexical/mark'
import * as lexicalOverflow from '@lexical/overflow'
import * as lexicalSelection from '@lexical/selection'
import * as lexicalText from '@lexical/text'
import * as lexicalUtils from '@lexical/utils'
import * as lexicalOffset from '@lexical/offset'
import * as lexicalDragon from '@lexical/dragon'
import * as lexicalFile from '@lexical/file'
import * as lexicalYjs from '@lexical/yjs'
import * as lexicalHeadless from '@lexical/headless'

/**
 * Get the Lexical core module.
 * Returns the statically imported module to ensure a single instance
 * is shared across all code paths (avoiding Lexical error #195).
 */
export async function loadLexicalCore(): Promise<typeof import('lexical')> {
  return lexicalCore
}

export async function loadRichText(): Promise<
  typeof import('@lexical/rich-text')
> {
  return lexicalRichText
}

export async function loadPlainText(): Promise<
  typeof import('@lexical/plain-text')
> {
  return lexicalPlainText
}

export async function loadHistory(): Promise<
  typeof import('@lexical/history')
> {
  return lexicalHistory
}

export async function loadList(): Promise<typeof import('@lexical/list')> {
  return lexicalList
}

export async function loadLink(): Promise<typeof import('@lexical/link')> {
  return lexicalLink
}

export async function loadClipboard(): Promise<
  typeof import('@lexical/clipboard')
> {
  return lexicalClipboard
}

export async function loadMarkdown(): Promise<
  typeof import('@lexical/markdown')
> {
  return lexicalMarkdown
}

export async function loadHtml(): Promise<typeof import('@lexical/html')> {
  return lexicalHtml
}

export async function loadTable(): Promise<typeof import('@lexical/table')> {
  return lexicalTable
}

export async function loadCode(): Promise<typeof import('@lexical/code')> {
  return lexicalCode
}

export async function loadHashtag(): Promise<
  typeof import('@lexical/hashtag')
> {
  return lexicalHashtag
}

export async function loadMark(): Promise<typeof import('@lexical/mark')> {
  return lexicalMark
}

export async function loadOverflow(): Promise<
  typeof import('@lexical/overflow')
> {
  return lexicalOverflow
}

export async function loadSelection(): Promise<
  typeof import('@lexical/selection')
> {
  return lexicalSelection
}

export async function loadText(): Promise<typeof import('@lexical/text')> {
  return lexicalText
}

export async function loadUtils(): Promise<typeof import('@lexical/utils')> {
  return lexicalUtils
}

export async function loadOffset(): Promise<typeof import('@lexical/offset')> {
  return lexicalOffset
}

export async function loadDragon(): Promise<typeof import('@lexical/dragon')> {
  return lexicalDragon
}

export async function loadFile(): Promise<typeof import('@lexical/file')> {
  return lexicalFile
}

export async function loadYjs(): Promise<typeof import('@lexical/yjs')> {
  return lexicalYjs
}

export async function loadHeadless(): Promise<
  typeof import('@lexical/headless')
> {
  return lexicalHeadless
}
