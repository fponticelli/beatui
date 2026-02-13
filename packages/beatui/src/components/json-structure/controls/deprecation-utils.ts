/**
 * Deprecation utilities for JSON Structure controls
 *
 * Helper functions for displaying deprecation indicators on deprecated fields
 */

import { html, attr } from '@tempots/dom'

/**
 * Create a deprecation indicator badge
 */
export function DeprecationBadge() {
  return html.span(
    attr.class('bc-json-structure-deprecated-badge'),
    attr.style(
      'font-size: var(--font-size-xs); ' +
        'color: var(--color-warning-500, #d97706); ' +
        'background: var(--color-warning-100, #fef3c7); ' +
        'padding: 0.125em 0.5em; ' +
        'border-radius: var(--radius-sm); ' +
        'margin-inline-start: 0.5em; ' +
        'font-weight: normal;'
    ),
    '(deprecated)'
  )
}

/**
 * Wrap label with deprecation indicator if field is deprecated
 */
export function withDeprecationBadge(
  label: string | undefined,
  isDeprecated: boolean
) {
  if (!label || !isDeprecated) {
    return label ?? ''
  }

  return html.span(label, DeprecationBadge())
}
