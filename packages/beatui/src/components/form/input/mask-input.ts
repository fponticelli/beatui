import {
  attr,
  Empty,
  input,
  on,
  Value,
  WithElement,
  Fragment,
  computedOf,
  Renderable,
} from '@tempots/dom'
import { Merge } from '@tempots/std'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'

// Masking types (as requested)
export type MaskToken =
  | { type: 'literal'; char: string }
  | {
      type: 'pattern'
      name?: string
      pattern: RegExp
      optional?: boolean
      transform?: (char: string) => string
    }
  | { type: 'any'; optional?: boolean; transform?: (char: string) => string }

export type Mask = string | Array<string | RegExp | MaskToken> | null

export interface PipeMeta {
  raw: string
  previousConformed: string
  cursor: number
  completed: boolean
}

export type PipeResult = string | { value: string; cursor?: number } | false

export interface UnmaskOptions {
  strategy?: 'none' | 'strip' | 'custom'
  unmask?: (conformed: string) => string
}

export interface CompletionOptions {
  mode?: 'mask' | 'min' | 'custom'
  minChars?: number
  isComplete?: (conformed: string) => boolean
}

export interface CursorBehavior {
  policy?: 'smart' | 'sticky'
  backspaceRubberBand?: boolean
}

export interface PlaceholderOptions {
  guide?: boolean
  placeholderChar?: string
  keepCharPositions?: boolean
}

export interface MaskDictionary {
  [symbol: string]: {
    pattern: RegExp
    optional?: boolean
    transform?: (char: string) => string
  }
}

export type DynamicMask = (raw: string, meta: PipeMeta) => Mask

export interface MaskedInputOptions {
  value?: string
  defaultValue?: string
  mask: Value<Mask | DynamicMask>
  definitions?: Value<MaskDictionary>
  useDefaultDefinitions?: Value<boolean>
  placeholder?: Value<string>
  placeholderOptions?: Value<PlaceholderOptions>
  extraLiterals?: Value<string[]>
  prefix?: Value<string>
  suffix?: Value<string>
  autofix?: Value<'none' | 'pad' | 'truncate'>
  autoclear?: Value<boolean>
  cursor?: Value<CursorBehavior>
  pipe?: (conformed: string, meta: PipeMeta) => PipeResult
  completion?: Value<CompletionOptions>
  unmask?: Value<UnmaskOptions>
  allowMode?: Value<'all' | 'digits' | 'letters' | 'alphanumeric' | 'custom'>
  allow?: (char: string) => boolean
  maxLengthHard?: Value<number>
  debounceMs?: Value<number>
  compositionSafe?: Value<boolean>
  onAccept?: (next: {
    raw: string
    conformed: string
    completed: boolean
    cursor: number
    numericParsed?: number
  }) => void
  onComplete?: (finalValue: {
    raw: string
    conformed: string
    numericParsed?: number
  }) => void
}

export type MaskInputOptions = Merge<
  InputOptions<string>,
  Omit<
    MaskedInputOptions,
    // these are controlled by InputOptions lifecycle
    'value' | 'defaultValue' | 'onAccept' | 'onComplete'
  > & {
    // Surface accept/complete alongside existing onInput/onChange
    onAccept?: MaskedInputOptions['onAccept']
    onComplete?: MaskedInputOptions['onComplete']
  }
>

// Default symbol definitions
const DEFAULT_DEFS: MaskDictionary = {
  '9': { pattern: /^[0-9]$/ },
  A: { pattern: /^[A-Za-z]$/, transform: (c: string) => c.toUpperCase() },
  '*': { pattern: /^.$/ },
}

// Utilities
const isRegExp = (v: unknown): v is RegExp => v instanceof RegExp

function toTokens(
  mask: Mask,
  defs: MaskDictionary,
  useDefaults: boolean
): MaskToken[] {
  if (mask == null) return []
  const symbols = useDefaults
    ? { ...DEFAULT_DEFS, ...defs }
    : (defs ?? DEFAULT_DEFS)

  const pushChar = (arr: MaskToken[], ch: string) => {
    const def = symbols[ch]
    if (def) arr.push({ type: 'pattern', name: ch, ...def })
    else arr.push({ type: 'literal', char: ch })
  }

  const out: MaskToken[] = []
  if (typeof mask === 'string') {
    for (const ch of mask) pushChar(out, ch)
    return out
  }
  for (const m of mask) {
    if (typeof m === 'string') {
      if (m.length <= 1) pushChar(out, m)
      else for (const ch of m) pushChar(out, ch)
    } else if (isRegExp(m)) {
      out.push({ type: 'pattern', pattern: m })
    } else if (typeof m === 'object' && m) {
      out.push(m)
    }
  }
  return out
}

function filterChar(
  allowMode: MaskInputOptions['allowMode'],
  allow?: (c: string) => boolean
) {
  return (c: string) => {
    switch (allowMode) {
      case 'digits':
        return /[0-9]/.test(c)
      case 'letters':
        return /[A-Za-z]/.test(c)
      case 'alphanumeric':
        return /[A-Za-z0-9]/.test(c)
      case 'custom':
        return allow?.(c) ?? true
      default:
        return true
    }
  }
}

type ConformOptions = {
  definitions: MaskDictionary
  useDefaultDefinitions: boolean
  extraLiterals: string[]
  autofix: 'none' | 'pad' | 'truncate'
  completion: CompletionOptions
  pipe?: (conformed: string, meta: PipeMeta) => PipeResult
  unmask: UnmaskOptions
  allowMode: 'all' | 'digits' | 'letters' | 'alphanumeric' | 'custom'
  allow?: (char: string) => boolean
  prefix?: string
  suffix?: string
}

function conform(
  raw: string,
  prevConformed: string,
  mask: Mask | DynamicMask,
  options: ConformOptions,
  caretSourcePos?: number,
  cursorBehavior?: CursorBehavior
): { value: string; cursor: number; completed: boolean } {
  const metaBase = {
    raw,
    previousConformed: prevConformed,
    cursor: caretSourcePos ?? raw.length,
    completed: false,
  }
  const defs = options.definitions ?? {}
  const effectiveMask = typeof mask === 'function' ? mask(raw, metaBase) : mask
  const tokens = toTokens(
    effectiveMask,
    defs,
    options.useDefaultDefinitions ?? true
  )
  const allowChar = filterChar(options.allowMode, options.allow)

  // Remove mask literals, prefix, and suffix from the raw input before mapping to tokens
  const literalSet = new Set<string>()
  for (const t of tokens) if (t.type === 'literal') literalSet.add(t.char)
  if (options.prefix) for (const ch of options.prefix) literalSet.add(ch)
  if (options.suffix) for (const ch of options.suffix) literalSet.add(ch)

  const src = Array.from(raw).filter(c => allowChar(c) && !literalSet.has(c))
  // If there is no user input, keep the field visually empty (no leading literals/prefix/suffix)
  if (src.length === 0) return { value: '', cursor: 0, completed: false }
  const out: string[] = []
  const outputs: Array<{ kind: 'literal' | 'slot'; filled: boolean }> = []
  let si = 0
  let requiredCount = 0
  let filledCount = 0
  let lastSlotIndex = -1
  for (const t of tokens) {
    if (t.type === 'literal') {
      out.push(t.char)
      outputs.push({ kind: 'literal', filled: true })
      continue
    }
    requiredCount += t.optional ? 0 : 1
    const next = src[si]
    if (next == null) {
      // stop filling when there are no more typed chars
      break
    }
    if (t.type === 'any') {
      filledCount++
      out.push(t.transform ? t.transform(next) : next)
      outputs.push({ kind: 'slot', filled: true })
      lastSlotIndex = outputs.length - 1
      si++
      continue
    }
    if (t.type === 'pattern') {
      if (t.pattern.test(next)) {
        filledCount++
        const v = t.transform ? t.transform(next) : next
        out.push(v)
        outputs.push({ kind: 'slot', filled: true })
        lastSlotIndex = outputs.length - 1
        si++
      } else {
        // skip invalid char
        si++
        continue
      }
    }
  }

  // Assemble with optional prefix/suffix
  const v0 = out.join('')
  const v1 = (options.prefix ?? '') + v0 + (options.suffix ?? '')

  // Compute caret according to policy
  const prefixLen = (options.prefix ?? '').length
  let caretOut = prefixLen
  if (lastSlotIndex >= 0) {
    // baseline: caret right after the last filled slot
    let i = lastSlotIndex + 1
    // smart policy: skip any immediately following literals
    const policy = cursorBehavior?.policy ?? 'smart'
    if (policy !== 'sticky') {
      while (i < outputs.length && outputs[i].kind === 'literal') i++
    }
    caretOut += i // outputs are 1 char each, and include all literals/slots before i
  }
  const completed =
    options.completion?.mode === 'min'
      ? (options.completion.minChars ?? 0) <= filledCount
      : options.completion?.mode === 'custom'
        ? !!options.completion.isComplete?.(v1)
        : requiredCount > 0 && filledCount >= requiredCount

  const piped = options.pipe?.(v1, { ...metaBase, completed })
  let finalValue: string
  // Default caret uses our computed policy-based position
  let cursor = caretOut
  if (piped === false) {
    finalValue = prevConformed
    cursor = prevConformed.length
  } else if (typeof piped === 'string') {
    finalValue = piped
    cursor = piped.length
  } else if (typeof piped === 'object' && piped) {
    finalValue = piped.value
    cursor = piped.cursor ?? piped.value.length
  } else {
    finalValue = v1
  }

  return { value: finalValue, cursor, completed }
}

function unmaskValue(conformed: string, opts?: UnmaskOptions): string {
  const strategy = opts?.strategy ?? 'none'
  if (strategy === 'custom' && opts?.unmask) return opts.unmask(conformed)
  if (strategy === 'strip') return conformed.replace(/[^A-Za-z0-9]/g, '')
  return conformed
}

// --- Numeric formatting helpers ---

export const MaskInput = (options: MaskInputOptions): Renderable => {
  const {
    value,
    onBlur,
    onChange,
    onInput: onInputCb,
    onAccept,
    onComplete,
    mask,
    definitions,
    useDefaultDefinitions,
    extraLiterals,
    prefix,
    suffix,
    autofix,
    pipe,
    completion,
    unmask,
    allowMode,
    allow,
    placeholder,
    placeholderOptions,
  } = options

  const conformExternal = computedOf(
    value,
    mask,
    definitions,
    useDefaultDefinitions,
    extraLiterals,
    prefix,
    suffix,
    autofix,
    completion,
    unmask,
    allowMode,
    placeholder,
    placeholderOptions
  )((
    v,
    m,
    defs,
    useDefs,
    extra,
    pre,
    suf,
    auto,
    comp,
    un,
    aMode,
    _ph,
    _phOpts
  ) => {
    if (!m) return v ?? ''
    return conform(v ?? '', '', m, {
      definitions: defs ?? {},
      useDefaultDefinitions: useDefs ?? true,
      extraLiterals: extra ?? [],
      autofix: (auto ?? 'none') as 'none' | 'pad' | 'truncate',
      completion: comp ?? { mode: 'mask' },
      pipe: pipe ?? ((x: string) => x),
      unmask: un ?? { strategy: 'none' },
      allowMode: (aMode ?? 'all') as ConformOptions['allowMode'],
      allow,
      prefix: pre,
      suffix: suf,
    }).value
  })

  const applyAndEmit = (
    target: HTMLInputElement,
    evType: 'input' | 'change'
  ) => {
    const current = target.value ?? ''
    const prev = Value.get(value) ?? ''

    const effMask = mask != null ? Value.get(mask) : null
    const effDefs = definitions != null ? Value.get(definitions) : undefined
    const effUseDefaults =
      useDefaultDefinitions != null
        ? Value.get(useDefaultDefinitions)
        : undefined
    const effExtra =
      extraLiterals != null ? Value.get(extraLiterals) : undefined
    const effAutofix = autofix != null ? Value.get(autofix) : undefined
    const effCompletion = completion != null ? Value.get(completion) : undefined
    const effUnmask = unmask != null ? Value.get(unmask) : undefined
    const effAllowMode = allowMode != null ? Value.get(allowMode) : undefined
    const effPrefix = prefix != null ? Value.get(prefix) : undefined
    const effSuffix = suffix != null ? Value.get(suffix) : undefined
    const {
      value: conformed,
      cursor: caret,
      completed,
    } = effMask
      ? conform(
          current,
          prev,
          effMask,
          {
            definitions: effDefs ?? {},
            useDefaultDefinitions: effUseDefaults ?? true,
            extraLiterals: effExtra ?? [],
            autofix: (effAutofix ?? 'none') as 'none' | 'pad' | 'truncate',
            completion: effCompletion ?? { mode: 'mask' },
            pipe: pipe ?? ((x: string) => x),
            unmask: effUnmask ?? { strategy: 'none' },
            allowMode: (effAllowMode ?? 'all') as ConformOptions['allowMode'],
            allow,
            prefix: effPrefix,
            suffix: effSuffix,
          },
          target.selectionStart ?? current.length,
          options.cursor
            ? (Value.get(options.cursor) as CursorBehavior)
            : undefined
        )
      : { value: current, cursor: current.length, completed: true }

    if (conformed !== current) {
      target.value = conformed
      try {
        target.setSelectionRange(caret, caret)
      } catch {}
    }

    const raw = unmaskValue(conformed, effUnmask)
    onAccept?.({
      raw,
      conformed,
      completed,
      cursor: caret,
    })

    if (evType === 'input') onInputCb?.(conformed)
    else {
      onChange?.(conformed)
      if (completed) onComplete?.({ raw, conformed })
    }
  }

  return InputContainer({
    ...options,
    input: input.text(
      CommonInputAttributes(options),
      attr.value(conformExternal),
      attr.class('bc-input'),
      onBlur != null ? on.blur(onBlur) : Empty,
      WithElement(el =>
        el instanceof HTMLInputElement
          ? Fragment(
              on.input(() => applyAndEmit(el, 'input')),
              on.change(() => applyAndEmit(el, 'change')),
              on.keydown(ev => {
                if (ev.key !== 'Backspace') return
                const rubber = options.cursor
                  ? (Value.get(options.cursor)?.backspaceRubberBand ?? true)
                  : true
                if (!rubber) return

                const start = el.selectionStart ?? 0
                const end = el.selectionEnd ?? start
                if (start !== end) return // let browser delete selection
                if (start <= 0) return

                const current = el.value ?? ''

                // Resolve effective mask and literals
                const effMask = mask != null ? Value.get(mask) : null
                if (!effMask) return // unmasked, default behavior
                const effDefs =
                  definitions != null ? Value.get(definitions) : undefined
                const effUseDefaults =
                  useDefaultDefinitions != null
                    ? Value.get(useDefaultDefinitions)
                    : true
                const effPrefix = prefix != null ? Value.get(prefix) : undefined
                const effSuffix = suffix != null ? Value.get(suffix) : undefined

                const tokens = toTokens(
                  typeof effMask === 'function'
                    ? effMask(current, {
                        raw: current,
                        previousConformed: current,
                        cursor: start,
                        completed: false,
                      })
                    : effMask,
                  effDefs ?? {},
                  effUseDefaults ?? true
                )
                const literalSet = new Set<string>()
                for (const t of tokens)
                  if (t.type === 'literal') literalSet.add(t.char)
                if (effPrefix) for (const ch of effPrefix) literalSet.add(ch)
                if (effSuffix) for (const ch of effSuffix) literalSet.add(ch)

                // If the char just before caret is a literal, delete previous non-literal
                if (literalSet.has(current[start - 1]!)) {
                  let i = start - 1
                  while (i >= 0 && literalSet.has(current[i]!)) i--
                  if (i >= 0) {
                    ev.preventDefault()
                    ev.stopPropagation()
                    el.value = current.slice(0, i) + current.slice(i + 1)
                    applyAndEmit(el, 'input')
                  }
                }
              })
            )
          : Empty
      )
    ),
  })
}
