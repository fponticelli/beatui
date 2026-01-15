/**
 * E2E Testing Best Practices - Type Contracts
 *
 * Feature: 002-e2e-best-practices
 * Date: 2026-01-14
 *
 * These interfaces define the contracts for the e2e testing infrastructure.
 */

import type { Page, Locator } from '@playwright/test'

// =============================================================================
// Page Object Contracts
// =============================================================================

/**
 * Base interface for all page objects
 */
export interface IBasePage {
  /** Playwright Page instance */
  readonly page: Page

  /** Navigate to the page's URL path */
  navigateTo(): Promise<void>

  /** Get the main content locator */
  getMain(): Locator

  /** Run accessibility check and return violations */
  checkAccessibility(options?: AccessibilityCheckOptions): Promise<AccessibilityViolation[]>

  /** Capture screenshot for visual comparison */
  captureScreenshot(name: string, options?: ScreenshotOptions): Promise<void>
}

/**
 * Options for accessibility checks
 */
export interface AccessibilityCheckOptions {
  /** WCAG tags to check (default: ['wcag2a', 'wcag2aa']) */
  tags?: string[]
  /** Rule IDs to exclude */
  exclude?: string[]
  /** Specific element to check (default: entire page) */
  selector?: string
}

/**
 * Options for screenshot capture
 */
export interface ScreenshotOptions {
  /** Maximum allowed pixel difference */
  maxDiffPixels?: number
  /** Threshold for pixel color difference (0-1) */
  threshold?: number
  /** Locators to mask in screenshot */
  mask?: Locator[]
  /** Animations handling */
  animations?: 'disabled' | 'allow'
}

// =============================================================================
// Accessibility Contracts
// =============================================================================

/**
 * Accessibility violation from axe-core
 */
export interface AccessibilityViolation {
  /** Rule identifier (e.g., 'color-contrast') */
  id: string
  /** Severity level */
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  /** Human-readable description */
  description: string
  /** Remediation guidance */
  help: string
  /** Link to detailed documentation */
  helpUrl: string
  /** Affected DOM nodes */
  nodes: AccessibilityNode[]
}

/**
 * DOM node with accessibility violation
 */
export interface AccessibilityNode {
  /** CSS selector path to element */
  target: string[]
  /** Element's HTML snippet */
  html: string
  /** Failure summary */
  failureSummary: string
}

// =============================================================================
// Test Tag Contracts
// =============================================================================

/**
 * Available test tag scopes
 */
export type TagScope = 'suite' | 'category' | 'component'

/**
 * Predefined test tags
 */
export const TEST_TAGS = {
  // Suite-level tags
  SMOKE: '@smoke',
  REGRESSION: '@regression',

  // Category-level tags
  A11Y: '@a11y',
  VISUAL: '@visual',

  // Component tags are dynamic: @button, @modal, etc.
} as const

/**
 * Tag configuration for a test suite
 */
export interface TagConfig {
  /** Tag names (including @ prefix) */
  tags: string[]
}

// =============================================================================
// Browser Project Contracts
// =============================================================================

/**
 * Supported browser engines
 */
export type BrowserEngine = 'chromium' | 'firefox' | 'webkit'

/**
 * Viewport dimensions
 */
export interface Viewport {
  width: number
  height: number
}

/**
 * Browser project configuration
 */
export interface BrowserProject {
  /** Unique project name */
  name: string
  /** Browser engine */
  browser: BrowserEngine
  /** Viewport size */
  viewport: Viewport
  /** Whether mobile emulation is enabled */
  isMobile: boolean
  /** Device preset name (e.g., 'Pixel 5') */
  device?: string
}

/**
 * Predefined browser projects
 */
export const BROWSER_PROJECTS: BrowserProject[] = [
  { name: 'chromium', browser: 'chromium', viewport: { width: 1280, height: 720 }, isMobile: false },
  { name: 'firefox', browser: 'firefox', viewport: { width: 1280, height: 720 }, isMobile: false },
  { name: 'webkit', browser: 'webkit', viewport: { width: 1280, height: 720 }, isMobile: false },
  { name: 'mobile-chrome', browser: 'chromium', viewport: { width: 375, height: 667 }, isMobile: true, device: 'Pixel 5' },
  { name: 'mobile-safari', browser: 'webkit', viewport: { width: 390, height: 844 }, isMobile: true, device: 'iPhone 12' },
]

// =============================================================================
// Test Artifact Contracts
// =============================================================================

/**
 * Types of test artifacts
 */
export type ArtifactType = 'screenshot' | 'video' | 'trace'

/**
 * Retention policy for artifacts
 */
export type RetainPolicy = 'always' | 'on-failure' | 'never'

/**
 * Test artifact metadata
 */
export interface TestArtifact {
  /** Artifact type */
  type: ArtifactType
  /** Associated test identifier */
  testId: string
  /** Creation timestamp */
  timestamp: Date
  /** File path */
  path: string
  /** When to retain */
  retainPolicy: RetainPolicy
}

// =============================================================================
// Visual Baseline Contracts
// =============================================================================

/**
 * Visual baseline screenshot metadata
 */
export interface VisualBaseline {
  /** Screenshot filename */
  name: string
  /** Browser used for capture */
  browser: BrowserEngine
  /** Viewport dimensions */
  viewport: Viewport
  /** Relative path in repository */
  path: string
}

/**
 * Visual comparison result
 */
export interface VisualComparisonResult {
  /** Whether images match within threshold */
  matches: boolean
  /** Number of different pixels */
  diffPixels: number
  /** Percentage difference */
  diffPercentage: number
  /** Path to diff image (if generated) */
  diffPath?: string
}

// =============================================================================
// Fixture Contracts
// =============================================================================

/**
 * Custom fixture definition
 */
export interface FixtureDefinition<T> {
  /** Fixture name */
  name: string
  /** Setup function that provides the fixture value */
  setup: (context: { page: Page }) => Promise<T>
  /** Optional teardown function */
  teardown?: (value: T) => Promise<void>
}

/**
 * Available custom fixtures
 */
export interface CustomFixtures {
  /** Pre-configured page with navigation complete */
  componentPage: IBasePage
}

// =============================================================================
// CI/CD Contracts
// =============================================================================

/**
 * CI workflow trigger event
 */
export type CITrigger = 'push' | 'pull_request' | 'workflow_dispatch'

/**
 * CI workflow configuration
 */
export interface CIWorkflowConfig {
  /** Trigger events */
  triggers: CITrigger[]
  /** Browsers to test per trigger */
  browserMatrix: {
    push: BrowserEngine[]
    pull_request: BrowserEngine[]
  }
  /** Artifact retention days */
  artifactRetentionDays: number
  /** Whether to upload artifacts on failure */
  uploadArtifactsOnFailure: boolean
}

/**
 * Default CI configuration matching spec requirements
 */
export const DEFAULT_CI_CONFIG: CIWorkflowConfig = {
  triggers: ['push', 'pull_request'],
  browserMatrix: {
    push: ['chromium'],
    pull_request: ['chromium', 'firefox', 'webkit'],
  },
  artifactRetentionDays: 7,
  uploadArtifactsOnFailure: true,
}

// =============================================================================
// Component Categories
// =============================================================================

/**
 * E2E test category directories
 */
export const COMPONENT_CATEGORIES = [
  'components',
  'forms',
  'navigation',
  'overlay',
  'data',
  'editors',
  'json-schema',
  'layout',
] as const

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number]

/**
 * Component count per category
 */
export const CATEGORY_COMPONENT_COUNTS: Record<ComponentCategory, number> = {
  components: 11,
  forms: 12,
  navigation: 7,
  overlay: 6,
  data: 5,
  editors: 6,
  'json-schema': 4,
  layout: 5,
}
