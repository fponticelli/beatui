// CSS Generation System
// This file generates CSS from TypeScript definitions

import {
  CSSVariableDefinition,
  generateAllVariables,
  colorScales,
  spacing,
  borderRadius,
  fontSize,
} from './css-variables'

export interface CSSRule {
  selector: string
  properties: Record<string, string>
}

export interface CSSOutput {
  variables: string
  rules: string
  complete: string
}

// Generate CSS variables section
export function generateCSSVariables(
  variables: CSSVariableDefinition[]
): string {
  const lightVars = variables.map(v => `  ${v.name}: ${v.value};`).join('\n')

  const darkVars = variables
    .filter(v => v.darkValue)
    .map(v => `  ${v.name}: ${v.darkValue};`)
    .join('\n')

  let css = `:root {\n${lightVars}\n}\n`

  if (darkVars) {
    css += `\n:root.dark {\n${darkVars}\n}\n`
  }

  return css
}

// Generate CSS rules from rule definitions
export function generateCSSRules(rules: CSSRule[]): string {
  return rules
    .map(rule => {
      const properties = Object.entries(rule.properties)
        .map(([prop, value]) => `  ${prop}: ${value};`)
        .join('\n')
      return `${rule.selector} {\n${properties}\n}`
    })
    .join('\n\n')
}

// Button component CSS rules
export function generateButtonCSS(): CSSRule[] {
  const rules: CSSRule[] = []

  // Base button styles
  rules.push({
    selector: '.tempo-button',
    properties: {
      display: 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
      border: '1px solid transparent',
      'font-weight': '600',
      'text-transform': 'uppercase',
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer',
      'text-shadow': '0 1px 2px rgba(0, 0, 0, 0.1)',
      outline: 'none',
    },
  })

  // Button sizes
  rules.push({
    selector: '.tempo-button--size-small',
    properties: {
      padding: `${spacing[1]} ${spacing[1]}`,
      'font-size': Array.isArray(fontSize.xs)
        ? (fontSize.xs[0] as string)
        : fontSize.xs,
      gap: spacing[0.5],
    },
  })

  rules.push({
    selector: '.tempo-button--size-medium',
    properties: {
      padding: `${spacing[1.5]} ${spacing[1.5]}`,
      'font-size': Array.isArray(fontSize.sm)
        ? (fontSize.sm[0] as string)
        : fontSize.sm,
      gap: spacing[1],
    },
  })

  rules.push({
    selector: '.tempo-button--size-large',
    properties: {
      padding: `${spacing[2]} ${spacing[2]}`,
      'font-size': Array.isArray(fontSize.base)
        ? (fontSize.base[0] as string)
        : fontSize.base,
      gap: spacing[1.5],
    },
  })

  // Button variants - using combined selectors to match BEM class structure
  Object.keys(colorScales).forEach(colorName => {
    // Filled variant
    rules.push({
      selector: `.tempo-button--variant-filled.tempo-button--color-${colorName}`,
      properties: {
        'background-color': `var(--color-${colorName}-600)`,
        color: 'white',
        'border-color': 'transparent',
      },
    })

    rules.push({
      selector: `.tempo-button--variant-filled.tempo-button--color-${colorName}:hover:not(:disabled)`,
      properties: {
        'background-color': `var(--color-${colorName}-700)`,
        transform: 'scale(1.05)',
      },
    })

    rules.push({
      selector: `.tempo-button--variant-filled.tempo-button--color-${colorName}:active:not(:disabled)`,
      properties: {
        transform: 'translateY(0.125rem)',
      },
    })

    // Light variant
    rules.push({
      selector: `.tempo-button--variant-light.tempo-button--color-${colorName}`,
      properties: {
        'background-color': `var(--color-${colorName}-100)`,
        color: `var(--color-${colorName}-900)`,
        'border-color': 'transparent',
      },
    })

    rules.push({
      selector: `.tempo-button--variant-light.tempo-button--color-${colorName}:hover:not(:disabled)`,
      properties: {
        'background-color': `var(--color-${colorName}-200)`,
      },
    })

    // Outline variant
    rules.push({
      selector: `.tempo-button--variant-outline.tempo-button--color-${colorName}`,
      properties: {
        'background-color': 'transparent',
        color: `var(--color-${colorName}-600)`,
        'border-color': `var(--color-${colorName}-300)`,
      },
    })

    rules.push({
      selector: `.tempo-button--variant-outline.tempo-button--color-${colorName}:hover:not(:disabled)`,
      properties: {
        'background-color': `var(--color-${colorName}-50)`,
        'border-color': `var(--color-${colorName}-400)`,
      },
    })

    // Text variant
    rules.push({
      selector: `.tempo-button--variant-text.tempo-button--color-${colorName}`,
      properties: {
        'background-color': 'transparent',
        color: `var(--color-${colorName}-700)`,
        'border-color': 'transparent',
      },
    })

    rules.push({
      selector: `.tempo-button--variant-text.tempo-button--color-${colorName}:hover:not(:disabled)`,
      properties: {
        'background-color': `var(--color-${colorName}-100)`,
      },
    })
  })

  // Button states
  rules.push({
    selector: '.tempo-button--disabled',
    properties: {
      opacity: '0.5',
      cursor: 'not-allowed',
      'pointer-events': 'none',
    },
  })

  // Button roundedness
  rules.push({
    selector: '.tempo-button--rounded-none',
    properties: {
      'border-radius': borderRadius.none,
    },
  })

  rules.push({
    selector: '.tempo-button--rounded-small',
    properties: {
      'border-radius': borderRadius.sm,
    },
  })

  rules.push({
    selector: '.tempo-button--rounded-medium',
    properties: {
      'border-radius': borderRadius.lg,
    },
  })

  rules.push({
    selector: '.tempo-button--rounded-large',
    properties: {
      'border-radius': borderRadius.xl,
    },
  })

  rules.push({
    selector: '.tempo-button--rounded-full',
    properties: {
      'border-radius': borderRadius.full,
    },
  })

  // Full width
  rules.push({
    selector: '.tempo-button--fill',
    properties: {
      width: '100%',
    },
  })

  // Focus styles
  rules.push({
    selector: '.tempo-button:focus-visible',
    properties: {
      outline: '2px solid var(--color-sky-400)',
      'outline-offset': '1px',
    },
  })

  return rules
}

// Icon component CSS rules
export function generateIconCSS(): CSSRule[] {
  const rules: CSSRule[] = []

  // Base icon container
  rules.push({
    selector: '.tempo-icon',
    properties: {
      display: 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
    },
  })

  // Icon sizes
  rules.push({
    selector: '.tempo-icon--size-small',
    properties: {
      width: spacing[4],
      height: spacing[4],
    },
  })

  rules.push({
    selector: '.tempo-icon--size-medium',
    properties: {
      width: spacing[5],
      height: spacing[5],
    },
  })

  rules.push({
    selector: '.tempo-icon--size-large',
    properties: {
      width: spacing[6],
      height: spacing[6],
    },
  })

  // Icon element
  rules.push({
    selector: '.tempo-icon__icon',
    properties: {
      width: '100%',
      height: '100%',
      display: 'block',
    },
  })

  // Iconify web component styling
  rules.push({
    selector: 'iconify-icon',
    properties: {
      display: 'inline-block',
      width: '1em',
      height: '1em',
      'vertical-align': '-0.125em',
    },
  })

  return rules
}

// Layout component CSS rules
export function generateLayoutCSS(): CSSRule[] {
  const rules: CSSRule[] = []

  // Stack component
  rules.push({
    selector: '.tempo-stack',
    properties: {
      display: 'flex',
      'flex-direction': 'column',
    },
  })

  // Group component
  rules.push({
    selector: '.tempo-group',
    properties: {
      display: 'flex',
      'flex-direction': 'row',
    },
  })

  return rules
}

// Generate overlay component CSS rules
export function generateOverlayCSS(): CSSRule[] {
  const rules: CSSRule[] = []

  // Base overlay styles
  rules.push({
    selector: '.tempo-overlay',
    properties: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'z-index': '50',
      width: '100%',
      height: '100%',
    },
  })

  // Overlay effects
  rules.push({
    selector: '.tempo-overlay--effect-transparent',
    properties: {
      'background-color': 'rgba(156, 163, 175, 0.1)',
    },
  })

  rules.push({
    selector: '.tempo-overlay--effect-blur',
    properties: {
      'backdrop-filter': 'blur(2px)',
      'background-color': 'rgba(0, 0, 0, 0.3)',
    },
  })

  // Overlay modes
  rules.push({
    selector: '.tempo-overlay--mode-capturing',
    properties: {
      'pointer-events': 'auto',
    },
  })

  rules.push({
    selector: '.tempo-overlay--mode-non-capturing',
    properties: {
      'pointer-events': 'none',
    },
  })

  return rules
}

// Generate fade component CSS rules
export function generateFadeCSS(): CSSRule[] {
  const rules: CSSRule[] = []

  // Base fade styles
  rules.push({
    selector: '.tempo-fade',
    properties: {
      transition: 'opacity 300ms ease-in-out',
    },
  })

  // Fade states
  rules.push({
    selector: '.tempo-fade--state-initial',
    properties: {
      opacity: '0',
    },
  })

  rules.push({
    selector: '.tempo-fade--state-entering',
    properties: {
      opacity: '1',
    },
  })

  rules.push({
    selector: '.tempo-fade--state-entered',
    properties: {
      opacity: '1',
    },
  })

  rules.push({
    selector: '.tempo-fade--state-exiting',
    properties: {
      opacity: '0',
    },
  })

  return rules
}

// Generate panel component CSS rules
export function generatePanelCSS(): CSSRule[] {
  const rules: CSSRule[] = []

  // Base panel styles
  rules.push({
    selector: '.tempo-panel',
    properties: {
      display: 'block',
    },
  })

  // Panel colors
  rules.push({
    selector: '.tempo-panel--color-transparent',
    properties: {
      'background-color': 'transparent',
      'border-color': 'transparent',
    },
  })

  rules.push({
    selector: '.tempo-panel--color-white',
    properties: {
      'background-color': 'white',
      'border-color': 'var(--color-neutral-200)',
    },
  })

  rules.push({
    selector: '.tempo-panel--color-black',
    properties: {
      'background-color': 'black',
      'border-color': 'var(--color-neutral-700)',
    },
  })

  // Generate panel colors for all theme colors
  Object.keys(colorScales).forEach(colorName => {
    rules.push({
      selector: `.tempo-panel--color-${colorName}`,
      properties: {
        'background-color': `var(--color-${colorName}-50)`,
        'border-color': `var(--color-${colorName}-200)`,
      },
    })
  })

  // Panel sides
  rules.push({
    selector: '.tempo-panel--side-all',
    properties: {
      border: '1px solid',
    },
  })

  rules.push({
    selector: '.tempo-panel--side-left',
    properties: {
      'border-left': '1px solid',
    },
  })

  rules.push({
    selector: '.tempo-panel--side-right',
    properties: {
      'border-right': '1px solid',
    },
  })

  rules.push({
    selector: '.tempo-panel--side-top',
    properties: {
      'border-top': '1px solid',
    },
  })

  rules.push({
    selector: '.tempo-panel--side-bottom',
    properties: {
      'border-bottom': '1px solid',
    },
  })

  // Panel shadows
  rules.push({
    selector: '.tempo-panel--shadow-none',
    properties: {
      'box-shadow': 'none',
    },
  })

  rules.push({
    selector: '.tempo-panel--shadow-small',
    properties: {
      'box-shadow': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
  })

  rules.push({
    selector: '.tempo-panel--shadow-medium',
    properties: {
      'box-shadow':
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
  })

  rules.push({
    selector: '.tempo-panel--shadow-large',
    properties: {
      'box-shadow':
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
  })

  return rules
}

// Generate label component CSS rules
export function generateLabelCSS(): CSSRule[] {
  const rules: CSSRule[] = []

  // Base label styles
  rules.push({
    selector: '.tempo-label',
    properties: {
      'font-size': 'var(--font-size-sm)',
    },
  })

  // Label types
  rules.push({
    selector: '.tempo-label--type-default',
    properties: {
      color: 'var(--color-neutral-950)',
    },
  })

  rules.push({
    selector: '.tempo-label--type-muted',
    properties: {
      color: 'var(--color-neutral-800)',
    },
  })

  rules.push({
    selector: '.tempo-label--type-error',
    properties: {
      color: 'var(--color-red-800)',
    },
  })

  rules.push({
    selector: '.tempo-label--type-emphasis',
    properties: {
      color: 'var(--color-sky-800)',
    },
  })

  return rules
}

// Generate additional utility classes for BEM components
export function generateUtilityCSS(): CSSRule[] {
  const rules: CSSRule[] = []

  // Dark mode support for panels
  rules.push({
    selector: ':root.dark .tempo-panel--color-white',
    properties: {
      'background-color': 'var(--color-gray-900) !important',
      color: 'var(--color-gray-100)',
    },
  })

  rules.push({
    selector: ':root.dark .tempo-panel--color-black',
    properties: {
      'background-color': 'var(--color-gray-100) !important',
      color: 'var(--color-gray-900)',
    },
  })

  // Dark mode support for text colors
  rules.push({
    selector: ':root.dark .tempo-label--type-default',
    properties: {
      color: 'var(--color-gray-100)',
    },
  })

  rules.push({
    selector: ':root.dark .tempo-label--type-muted',
    properties: {
      color: 'var(--color-gray-400)',
    },
  })

  return rules
}

// Generate all component CSS
export function generateAllComponentCSS(): CSSRule[] {
  return [
    ...generateButtonCSS(),
    ...generateIconCSS(),
    ...generateLayoutCSS(),
    ...generateOverlayCSS(),
    ...generateFadeCSS(),
    ...generatePanelCSS(),
    ...generateLabelCSS(),
    ...generateUtilityCSS(),
  ]
}

// Generate complete CSS output
export function generateCompleteCSS(): CSSOutput {
  const variables = generateAllVariables()
  const rules = generateAllComponentCSS()

  const variablesCSS = generateCSSVariables(variables)
  const rulesCSS = generateCSSRules(rules)

  const complete = `${variablesCSS}\n\n${rulesCSS}`

  return {
    variables: variablesCSS,
    rules: rulesCSS,
    complete,
  }
}
