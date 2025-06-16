import { attr, html, TNode } from '@tempots/dom'

type LabelType = 'default' | 'emphasis' | 'muted' | 'error'

function generateLabelClasses(type: LabelType): string {
  return `bc-label bc-label--${type}`
}

export const EmphasisLabel = (...children: TNode[]) =>
  html.span(attr.class(generateLabelClasses('emphasis')), ...children)

export const Label = (...children: TNode[]) =>
  html.span(attr.class(generateLabelClasses('default')), ...children)

export const MutedLabel = (...children: TNode[]) =>
  html.span(attr.class(generateLabelClasses('muted')), ...children)

export const ErrorLabel = (...children: TNode[]) =>
  html.span(attr.class(generateLabelClasses('error')), ...children)
