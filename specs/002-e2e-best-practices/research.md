# Research: E2E Testing Best Practices

**Feature**: 002-e2e-best-practices
**Date**: 2026-01-14

## 1. Accessibility Testing Integration

### Decision
Use `@axe-core/playwright` for accessibility testing integration.

### Rationale
- Official Playwright integration maintained by Deque (axe-core creators)
- Seamless integration with Playwright's test runner and assertions
- Supports WCAG 2.1 AA guidelines (spec requirement)
- Allows rule-level exclusions for documented exceptions
- Returns actionable violation details with element selectors and remediation guidance

### Alternatives Considered
- **pa11y**: Requires separate CLI execution, harder to integrate into existing tests
- **Lighthouse accessibility**: Heavier, includes performance/SEO audits not needed here
- **Manual ARIA checks**: Not comprehensive, misses many WCAG violations

### Implementation Pattern
```typescript
import AxeBuilder from '@axe-core/playwright'

test('page should be accessible', async ({ page }) => {
  await page.goto('/component')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
  expect(results.violations).toEqual([])
})
```

---

## 2. Visual Regression Testing

### Decision
Use Playwright's built-in `toHaveScreenshot()` matcher with baseline storage in repository.

### Rationale
- Native Playwright feature, no external dependencies
- Automatic baseline management with `--update-snapshots` flag
- Built-in pixel diffing with configurable threshold
- Supports masking dynamic elements
- Screenshots stored as portable PNG files in repository

### Alternatives Considered
- **Percy**: SaaS dependency, cost per screenshot, external service outages
- **Chromatic**: Designed for Storybook, not general Playwright tests
- **reg-suit**: Additional tooling complexity, S3 storage required
- **BackstopJS**: Separate tool, different configuration from Playwright

### Implementation Pattern
```typescript
test('button should match visual baseline', async ({ page }) => {
  await page.goto('/button')
  await expect(page.locator('main')).toHaveScreenshot('button.png', {
    maxDiffPixels: 100,
    mask: [page.locator('[data-testid="timestamp"]')],
  })
})
```

### Baseline Storage
- Location: `apps/docs/e2e/visual-baselines/{browser}/{test-name}.png`
- Updates via PR with `pnpm test:e2e --update-snapshots`
- Git LFS not required for typical component library size (<100MB total)

---

## 3. Cross-Browser Testing

### Decision
Configure Playwright projects for Chromium, Firefox, and WebKit with mobile viewports.

### Rationale
- Playwright natively supports all three engines
- GitHub-hosted runners include all browsers pre-installed
- Selective execution: Chromium on push, all browsers on PR (per clarification)
- Mobile viewports via device emulation (no real devices needed)

### Alternatives Considered
- **BrowserStack/Sauce Labs**: Cost, latency, external dependency
- **Selenium Grid**: Complex setup, slower execution
- **Cypress**: Limited browser support (no WebKit)

### Browser Projects
```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
]
```

### CI Strategy
- Branch push: `--project=chromium` only (~3 min)
- Pull request: All projects (~8-10 min with parallelization)

---

## 4. CI/CD Integration

### Decision
GitHub Actions workflow with matrix strategy for browser parallelization.

### Rationale
- Repository already on GitHub
- Native integration with PR status checks
- Built-in artifact upload for test reports
- Matrix strategy enables parallel browser execution
- Caching available for dependencies and Playwright browsers

### Alternatives Considered
- **CircleCI**: Additional service, similar capabilities
- **Jenkins**: Self-hosted complexity
- **GitLab CI**: Would require migration

### Workflow Structure
```yaml
name: E2E Tests
on:
  push:
    branches: ['**']
  pull_request:

jobs:
  e2e:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium]  # Expanded to [chromium, firefox, webkit] on PR
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps ${{ matrix.browser }}
      - run: pnpm --filter @beatui/docs test:e2e --project=${{ matrix.browser }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results-${{ matrix.browser }}
          path: apps/docs/test-results/
```

---

## 5. Page Object Model Pattern

### Decision
TypeScript classes encapsulating page selectors and interactions, one per component page.

### Rationale
- Industry standard for maintainable e2e tests
- Single point of change when UI updates
- Enables readable, business-focused test code
- TypeScript provides autocomplete and type safety

### Alternatives Considered
- **No abstraction**: Current state, high duplication, brittle tests
- **Screen pattern**: Similar to POM but less common in web testing
- **Component Object Model**: More granular than needed for docs site

### Base Page Object
```typescript
export class BasePage {
  constructor(protected page: Page) {}

  async navigateTo(path: string) {
    await this.page.goto(path)
    await this.page.waitForLoadState('networkidle')
  }

  async getMain() {
    return this.page.locator('main')
  }

  async checkAccessibility() {
    const results = await new AxeBuilder({ page: this.page }).analyze()
    return results.violations
  }
}
```

---

## 6. Test Tagging Strategy

### Decision
Use Playwright's built-in `test.describe.configure({ tag })` and grep filtering.

### Rationale
- Native Playwright feature (v1.42+)
- Filter via `--grep @tag` command line
- Tags visible in test reports
- No external tooling required

### Tag Taxonomy
- `@smoke`: Critical path tests, run first (~20 tests, <2 min)
- `@regression`: Full suite (all tests)
- `@a11y`: Accessibility-focused tests
- `@visual`: Visual regression tests
- `@{component}`: Component-specific (e.g., `@button`, `@modal`)

### Implementation
```typescript
test.describe('Button', () => {
  test.describe.configure({ tag: ['@smoke', '@button'] })

  test('renders correctly', async ({ page }) => { ... })
})
```

### Execution
```bash
pnpm test:e2e --grep @smoke        # Smoke tests only
pnpm test:e2e --grep @a11y         # Accessibility tests
pnpm test:e2e --grep @button       # Button component tests
```

---

## 7. Debugging Artifacts

### Decision
Configure trace, video, and screenshot capture on failure via Playwright config.

### Rationale
- All features built into Playwright
- Trace viewer provides step-by-step timeline
- Video shows exact user actions
- Screenshot captures failure state

### Configuration
```typescript
use: {
  trace: 'retain-on-failure',
  video: 'retain-on-failure',
  screenshot: 'only-on-failure',
}
```

### Artifact Retention
- Local: `apps/docs/test-results/` (gitignored)
- CI: Uploaded via `actions/upload-artifact` on failure
- Retention: 7 days (GitHub default)

---

## 8. Custom Fixtures

### Decision
Extend Playwright's test fixtures for common setup operations.

### Rationale
- Reduces boilerplate in test files
- Ensures consistent test environment
- Enables dependency injection of page objects
- Built-in cleanup via fixture teardown

### Fixture Examples
```typescript
// fixtures/index.ts
import { test as base } from '@playwright/test'
import { ButtonPage } from '../page-objects/components/button.page'

export const test = base.extend<{
  buttonPage: ButtonPage
}>({
  buttonPage: async ({ page }, use) => {
    const buttonPage = new ButtonPage(page)
    await buttonPage.navigateTo('/button')
    await use(buttonPage)
  },
})
```

### Usage in Tests
```typescript
import { test } from '../fixtures'

test('button accessibility', async ({ buttonPage }) => {
  const violations = await buttonPage.checkAccessibility()
  expect(violations).toHaveLength(0)
})
```

---

## Dependencies Summary

| Package | Version | Purpose |
|---------|---------|---------|
| @playwright/test | ^1.57.0 | Test runner (existing) |
| @axe-core/playwright | ^4.10.0 | Accessibility testing |

No additional runtime dependencies required. All other features are built into Playwright.
