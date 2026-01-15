# Quickstart: E2E Testing Best Practices

**Feature**: 002-e2e-best-practices
**Date**: 2026-01-14

## Prerequisites

- Node.js 18+ and pnpm installed
- Repository cloned locally
- Dependencies installed (`pnpm install`)

## Installation

```bash
# Install new dependencies (from repo root)
pnpm --filter @beatui/docs add -D @axe-core/playwright

# Install Playwright browsers
pnpm exec playwright install --with-deps
```

## Running Tests

### Basic Commands

```bash
# Navigate to docs app
cd apps/docs

# Run all tests (Chromium only, fastest)
pnpm test:e2e

# Run with UI mode for debugging
pnpm test:e2e:ui

# Run headed (visible browser)
pnpm test:e2e:headed
```

### Filtered Execution

```bash
# Smoke tests only (~2 min)
pnpm test:e2e --grep @smoke

# Accessibility tests only
pnpm test:e2e --grep @a11y

# Visual regression tests
pnpm test:e2e --grep @visual

# Single component
pnpm test:e2e --grep @button
```

### Cross-Browser Testing

```bash
# All browsers (as run in PR CI)
pnpm test:e2e --project=chromium --project=firefox --project=webkit

# Mobile viewports
pnpm test:e2e --project=mobile-chrome --project=mobile-safari

# Specific browser
pnpm test:e2e --project=firefox
```

### Visual Baselines

```bash
# Update all baselines
pnpm test:e2e --update-snapshots

# Update baselines for specific component
pnpm test:e2e --grep @button --update-snapshots
```

## Writing Tests

### Basic Test with Page Object

```typescript
// e2e/components/button.spec.ts
import { test, expect } from '../fixtures'

test.describe('Button Component', () => {
  test.describe.configure({ tag: ['@smoke', '@button'] })

  test('should be accessible', async ({ buttonPage }) => {
    const violations = await buttonPage.checkAccessibility()
    expect(violations).toHaveLength(0)
  })

  test('should match visual baseline', async ({ buttonPage }) => {
    await buttonPage.captureScreenshot('button-default.png')
  })

  test('should render all variants', async ({ buttonPage }) => {
    const buttons = await buttonPage.getAllButtons()
    expect(buttons.length).toBeGreaterThan(5)
  })
})
```

### Creating a Page Object

```typescript
// e2e/page-objects/components/button.page.ts
import { BasePage } from '../base.page'
import type { Page, Locator } from '@playwright/test'

export class ButtonPage extends BasePage {
  readonly buttons: Locator
  readonly disabledButtons: Locator

  constructor(page: Page) {
    super(page, '/button')
    this.buttons = page.locator('table button, main button')
    this.disabledButtons = page.locator('button[disabled]')
  }

  async getAllButtons(): Promise<Locator[]> {
    const count = await this.buttons.count()
    return Array.from({ length: count }, (_, i) => this.buttons.nth(i))
  }

  async clickFirstButton(): Promise<void> {
    await this.buttons.first().click()
  }
}
```

### Registering a Fixture

```typescript
// e2e/fixtures/index.ts
import { test as base } from '@playwright/test'
import { ButtonPage } from '../page-objects/components/button.page'

export const test = base.extend<{
  buttonPage: ButtonPage
}>({
  buttonPage: async ({ page }, use) => {
    const buttonPage = new ButtonPage(page)
    await buttonPage.navigateTo()
    await use(buttonPage)
  },
})

export { expect } from '@playwright/test'
```

## Test Tags Reference

| Tag | Scope | When to Use |
|-----|-------|-------------|
| `@smoke` | Suite | Critical path tests, must always pass |
| `@regression` | Suite | Full test coverage |
| `@a11y` | Category | Tests focused on accessibility |
| `@visual` | Category | Visual regression tests |
| `@{component}` | Component | Tests for specific component (e.g., `@button`) |

Apply multiple tags:
```typescript
test.describe.configure({ tag: ['@smoke', '@a11y', '@button'] })
```

## CI/CD Integration

Tests run automatically:
- **On every push**: Chromium only (fast feedback)
- **On pull requests**: All browsers (comprehensive check)

### Viewing CI Results

1. Check the "E2E Tests" status on your PR
2. Click "Details" to view logs
3. If failed, download artifacts from the job summary

### Local CI Simulation

```bash
# Run exactly as CI does for PRs
pnpm test:e2e --project=chromium --project=firefox --project=webkit
```

## Debugging Failures

### View Test Report

```bash
# Open HTML report
pnpm exec playwright show-report
```

### View Trace

```bash
# After a failure, traces are in test-results/
pnpm exec playwright show-trace apps/docs/test-results/*/trace.zip
```

### Debug Mode

```bash
# Run with debugger
pnpm test:e2e --debug

# Run specific test in debug mode
pnpm test:e2e --grep "button should be accessible" --debug
```

## Directory Structure

```
apps/docs/e2e/
├── fixtures/              # Custom Playwright fixtures
│   └── index.ts
├── page-objects/          # Page Object Model classes
│   ├── base.page.ts       # Abstract base class
│   └── {category}/        # One per component category
│       └── {name}.page.ts
├── visual-baselines/      # Screenshot baselines
│   ├── chromium/
│   ├── firefox/
│   └── webkit/
└── {category}/            # Test files
    └── {name}.spec.ts
```

## Common Tasks

### Add Test for New Component

1. Create page object: `e2e/page-objects/{category}/{name}.page.ts`
2. Register fixture in `e2e/fixtures/index.ts`
3. Create test file: `e2e/{category}/{name}.spec.ts`
4. Run tests: `pnpm test:e2e --grep @{name}`
5. Capture baselines: `pnpm test:e2e --grep @{name} --update-snapshots`

### Update Visual Baselines

```bash
# Review changes first
pnpm test:e2e --grep @visual

# If changes are intentional, update
pnpm test:e2e --update-snapshots

# Commit new baselines
git add apps/docs/e2e/visual-baselines/
git commit -m "chore: update visual baselines"
```

### Exclude Accessibility Rule

```typescript
// In your page object or test
const violations = await buttonPage.checkAccessibility({
  exclude: ['color-contrast'], // Rule ID to skip
})
```

Document exclusions in test comments with business justification.
