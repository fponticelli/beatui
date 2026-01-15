/**
 * Accessibility testing configuration for BeatUI e2e tests
 *
 * Based on WCAG 2.1 AA guidelines
 */

// Default WCAG tags to check
export const DEFAULT_A11Y_TAGS = ['wcag2a', 'wcag2aa'] as const

// Impact levels that should cause test failures
export const FAILURE_IMPACT_LEVELS = ['serious', 'critical'] as const

// Impact levels that should be logged as warnings
export const WARNING_IMPACT_LEVELS = ['minor', 'moderate'] as const

/**
 * Format accessibility violations for readable test output
 */
export function formatViolations(
  violations: Array<{
    id: string
    impact: string
    description: string
    help: string
    helpUrl: string
    nodes: Array<{ target: string[]; html: string; failureSummary: string }>
  }>
): string {
  if (violations.length === 0) {
    return 'No accessibility violations found'
  }

  return violations
    .map((v, i) => {
      const elements = v.nodes
        .map((n) => `    - ${n.target.join(' > ')}\n      ${n.failureSummary}`)
        .join('\n')

      return `${i + 1}. [${v.impact?.toUpperCase()}] ${v.id}
   ${v.description}
   Help: ${v.help}
   URL: ${v.helpUrl}
   Affected elements:
${elements}`
    })
    .join('\n\n')
}

/**
 * Filter violations by impact level
 */
export function filterByImpact(
  violations: Array<{ impact: string }>,
  levels: readonly string[]
): typeof violations {
  return violations.filter((v) => levels.includes(v.impact))
}
