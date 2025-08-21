import { TNode, Value, WithElement, OnDispose, html, attr } from '@tempots/dom'
import type { InputOptions } from '../form/input/input-options'
import { Merge } from '@tempots/std'
import './milkdown.css'
import { Crepe } from '@milkdown/crepe'
import { replaceAll } from '@milkdown/kit/utils'

// Minimal listener and editor shape we rely on
export type ListenerManager = {
  markdownUpdated: (
    fn: (ctx: unknown, markdown: string, prevMarkdown: string) => unknown
  ) => unknown
  focus: (fn: () => unknown) => unknown
  blur: (fn: () => unknown) => unknown
}

export type MilkdownInputOptions = Merge<
  InputOptions<string>,
  {
    readOnly?: Value<boolean>
    featureConfigs?: Record<string, unknown> | undefined
    features?: Record<string, boolean> | undefined
  }
>

export const MilkdownInput = (options: MilkdownInputOptions): TNode => {
  const {
    value,
    onChange,
    onBlur,
    class: cls,
    id,
    name,
    hasError,
    disabled,
    autofocus = false, // not supported by Crepe API directly
    readOnly = false,
    placeholder,
  } = options

  const ro = Value.toSignal(readOnly)
  const dis = Value.toSignal(disabled ?? false)

  return html.div(
    attr.class('bc-milkdown-editor-container'),
    attr.class(cls),
    attr.class(
      Value.map(hasError ?? false, (e): string =>
        e ? 'bc-input-container--error' : ''
      )
    ),
    attr.id(id),
    attr.name(name),
    WithElement(container => {
      const disposers: Array<() => void> = []

      const mount = async () => {
        try {
          const cfg: Record<string, unknown> = {
            root: container as unknown as HTMLElement,
            defaultValue: Value.get(value) ?? '',
            features: {
              [Crepe.Feature.CodeMirror]: false,
              [Crepe.Feature.Latex]: false,
              [Crepe.Feature.BlockEdit]: true,
              [Crepe.Feature.Cursor]: true,
              [Crepe.Feature.ImageBlock]: true,
              [Crepe.Feature.LinkTooltip]: true,
              [Crepe.Feature.ListItem]: true,
              [Crepe.Feature.Placeholder]: true,
              [Crepe.Feature.Table]: true,
              [Crepe.Feature.Toolbar]: true,
            },
            featuresConfig: {
              [Crepe.Feature.Toolbar]: {},
              [Crepe.Feature.Placeholder]: {
                placeholder: Value.get(placeholder ?? '...'),
              },
            },
          }

          const crepe = new Crepe(cfg)
          disposers.push(() => crepe.destroy())
          const editor = await crepe.create()

          // listen to updates
          crepe.on(listener => {
            // forward markdown to onChange
            if (onChange != null) {
              listener.blur(() => onChange(crepe.getMarkdown()))
            }
            if (onBlur != null) {
              listener.blur(onBlur)
            }
          })

          // reflect readonly & disabled
          const applyRo = (v: boolean | undefined | null) =>
            crepe?.setReadonly(!!v)

          disposers.push(
            Value.on(ro, v => applyRo(v)),
            Value.on(dis, v => applyRo(v))
          )

          disposers.push(
            Value.on(value, v => editor.action(replaceAll(v, true)))
          )

          // autofocus: try to focus root
          if (Value.get(autofocus)) {
            ;(container as HTMLElement)
              .querySelector<HTMLElement>('[contenteditable="true"]')
              ?.focus()
          }
        } catch (err) {
          console.warn('[BeatUI] Milkdown Crepe not available:', err)
          try {
            const el = container as HTMLElement
            el.textContent = 'Milkdown Crepe not available.'
          } catch {}
        }
      }

      mount().catch(() => {})

      return OnDispose(() => {
        disposers.forEach(d => {
          try {
            d()
          } catch {}
        })
      })
    })
  )
}
