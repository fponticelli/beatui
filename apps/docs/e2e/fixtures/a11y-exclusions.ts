/**
 * Accessibility rule exclusions for BeatUI e2e tests
 *
 * IMPORTANT: Each exclusion MUST be documented with:
 * 1. The specific rule being excluded
 * 2. The business/technical justification
 * 3. A plan for remediation (if applicable)
 */

export interface A11yExclusion {
  /** The axe-core rule ID to exclude */
  ruleId: string
  /** Where this exclusion applies (component name or 'global') */
  scope: string
  /** Why this rule is excluded */
  justification: string
  /** Planned remediation, or 'permanent' if by design */
  remediation: string
}

/**
 * Global exclusions that apply to all pages
 *
 * These should be minimized and regularly reviewed
 */
export const GLOBAL_EXCLUSIONS: A11yExclusion[] = [
  // Example: Uncomment and modify as needed
  // {
  //   ruleId: 'color-contrast',
  //   scope: 'global',
  //   justification: 'Design system uses intentional low-contrast for decorative elements',
  //   remediation: 'Review with design team in Q2 2026',
  // },
]

/**
 * Component-specific exclusions
 *
 * Key: component name (e.g., 'button', 'modal')
 * Value: array of exclusions specific to that component
 */
export const COMPONENT_EXCLUSIONS: Record<string, A11yExclusion[]> = {
  // Example: Uncomment and modify as needed
  // modal: [
  //   {
  //     ruleId: 'aria-hidden-focus',
  //     scope: 'modal',
  //     justification: 'Focus trap implementation manages focus programmatically',
  //     remediation: 'permanent',
  //   },
  // ],
}

/**
 * Get exclusion rule IDs for a specific component
 */
export function getExclusionsForComponent(component: string): string[] {
  const globalRules = GLOBAL_EXCLUSIONS.map((e) => e.ruleId)
  const componentRules = (COMPONENT_EXCLUSIONS[component] ?? []).map((e) => e.ruleId)
  return [...new Set([...globalRules, ...componentRules])]
}

/**
 * Get all documented exclusions for reporting
 */
export function getAllExclusions(): A11yExclusion[] {
  const componentExclusions = Object.values(COMPONENT_EXCLUSIONS).flat()
  return [...GLOBAL_EXCLUSIONS, ...componentExclusions]
}
