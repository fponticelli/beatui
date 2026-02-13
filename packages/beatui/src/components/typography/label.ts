import { attr, html, TNode } from '@tempots/dom'

/**
 * The visual type of a label, controlling its color and emphasis.
 *
 * - `'default'` - Standard label with default text color
 * - `'emphasis'` - Emphasized label with stronger visual weight
 * - `'muted'` - De-emphasized label with subdued color
 * - `'danger'` - Label styled with the danger/error color
 */
type LabelType = 'default' | 'emphasis' | 'muted' | 'danger'

/**
 * Generates the CSS class string for a label element based on its type.
 *
 * @param type - The label type determining the visual style.
 * @returns A space-separated class string (e.g., `'bc-label bc-label--emphasis'`).
 */
function generateLabelClasses(type: LabelType): string {
  return `bc-label bc-label--${type}`
}

/**
 * Renders an emphasized inline label with stronger visual weight.
 * Useful for highlighting important terms or key values.
 *
 * @param children - Content nodes to render inside the label span.
 * @returns A `<span>` element with emphasis label styling.
 *
 * @example
 * ```typescript
 * html.p('Status: ', EmphasisLabel('Active'))
 * ```
 */
export const EmphasisLabel = (...children: TNode[]) =>
  html.span(attr.class(generateLabelClasses('emphasis')), ...children)

/**
 * Renders a standard inline label with default text styling.
 *
 * @param children - Content nodes to render inside the label span.
 * @returns A `<span>` element with default label styling.
 *
 * @example
 * ```typescript
 * html.p('Name: ', Label('John Doe'))
 * ```
 */
export const Label = (...children: TNode[]) =>
  html.span(attr.class(generateLabelClasses('default')), ...children)

/**
 * Renders a muted inline label with subdued color for secondary information.
 *
 * @param children - Content nodes to render inside the label span.
 * @returns A `<span>` element with muted label styling.
 *
 * @example
 * ```typescript
 * html.p(Label('Primary info'), ' ', MutedLabel('(optional)'))
 * ```
 */
export const MutedLabel = (...children: TNode[]) =>
  html.span(attr.class(generateLabelClasses('muted')), ...children)

/**
 * Renders a danger-styled inline label for error messages or destructive context.
 *
 * @param children - Content nodes to render inside the label span.
 * @returns A `<span>` element with danger label styling.
 *
 * @example
 * ```typescript
 * html.p('Validation: ', DangerLabel('Required field'))
 * ```
 */
export const DangerLabel = (...children: TNode[]) =>
  html.span(attr.class(generateLabelClasses('danger')), ...children)
