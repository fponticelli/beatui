# Data Model: E2E Testing Best Practices

**Feature**: 002-e2e-best-practices
**Date**: 2026-01-14

## Overview

This feature primarily involves test infrastructure, not domain data. The "entities" are test artifacts and configuration structures rather than traditional database entities.

## Entities

### 1. PageObject

Encapsulates selectors and interactions for a component page.

| Field | Type | Description |
|-------|------|-------------|
| page | Page | Playwright Page instance |
| path | string | URL path for the component (e.g., '/button') |
| mainLocator | Locator | Primary content area selector |

**Relationships**:
- Inherits from BasePage
- Used by test fixtures
- One PageObject per component page (56 total)

**Validation Rules**:
- Path must start with '/'
- Page must be navigable before interactions

---

### 2. TestFixture

Reusable setup/teardown configuration for tests.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Fixture identifier |
| pageObject | PageObject | Associated page object instance |
| setupFn | Function | Initialization logic |
| teardownFn | Function | Cleanup logic (optional) |

**Relationships**:
- Provides PageObjects to tests
- Managed by Playwright's fixture system

**Lifecycle**:
```
Created → Setup → Used in Test → Teardown → Disposed
```

---

### 3. TestTag

Metadata label for categorizing tests.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Tag identifier (e.g., 'smoke', 'a11y') |
| prefix | string | Always '@' |
| scope | enum | 'suite' | 'category' | 'component' |

**Predefined Tags**:
| Tag | Scope | Purpose |
|-----|-------|---------|
| @smoke | suite | Critical path tests |
| @regression | suite | Full test suite |
| @a11y | category | Accessibility tests |
| @visual | category | Visual regression tests |
| @{component} | component | Component-specific (e.g., @button) |

---

### 4. VisualBaseline

Reference screenshot for visual comparison.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Screenshot filename |
| browser | string | Browser used (chromium/firefox/webkit) |
| viewport | object | { width, height } |
| path | string | File path in repository |
| hash | string | Content hash for change detection |

**Storage Location**:
```
apps/docs/e2e/visual-baselines/{browser}/{test-name}.png
```

**State Transitions**:
```
Not Exists → Created (first run)
Exists → Updated (--update-snapshots)
Exists → Compared (normal run)
Compared → Pass | Fail (diff threshold)
```

---

### 5. TestArtifact

Output files generated during test execution.

| Field | Type | Description |
|-------|------|-------------|
| type | enum | 'screenshot' | 'video' | 'trace' |
| testId | string | Associated test identifier |
| timestamp | Date | Creation time |
| path | string | File location |
| retainPolicy | enum | 'always' | 'on-failure' |

**Artifact Types**:
| Type | Format | Size (typical) | Purpose |
|------|--------|----------------|---------|
| screenshot | PNG | 50-200 KB | Failure state capture |
| video | WebM | 1-5 MB | Full test recording |
| trace | ZIP | 2-10 MB | Step-by-step timeline |

---

### 6. AccessibilityViolation

WCAG violation detected by axe-core.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Rule identifier (e.g., 'color-contrast') |
| impact | enum | 'minor' | 'moderate' | 'serious' | 'critical' |
| description | string | Human-readable violation description |
| help | string | Remediation guidance |
| helpUrl | string | Link to detailed documentation |
| nodes | array | Affected DOM elements |

**Validation Rules**:
- Tests fail if any violations with impact >= 'serious'
- 'minor' and 'moderate' logged as warnings
- Specific rules can be excluded via configuration

---

### 7. BrowserProject

Playwright project configuration for a browser.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Project identifier |
| browser | enum | 'chromium' | 'firefox' | 'webkit' |
| viewport | object | { width, height } |
| isMobile | boolean | Mobile emulation flag |
| device | string | Device preset name (optional) |

**Configured Projects**:
| Name | Browser | Viewport | Mobile |
|------|---------|----------|--------|
| chromium | chromium | 1280x720 | false |
| firefox | firefox | 1280x720 | false |
| webkit | webkit | 1280x720 | false |
| mobile-chrome | chromium | 375x667 | true |
| mobile-safari | webkit | 390x844 | true |

---

## Configuration Files

### playwright.config.ts Structure

```typescript
{
  testDir: './e2e',
  projects: BrowserProject[],
  use: {
    baseURL: string,
    trace: RetainPolicy,
    video: RetainPolicy,
    screenshot: RetainPolicy,
  },
  webServer: {
    command: string,
    url: string,
    timeout: number,
  },
  reporter: ReporterConfig[],
  retries: number,
}
```

### CI Workflow Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| browser | string | 'chromium' | Browser to test |
| is_pr | boolean | false | Whether triggered by PR |
| update_snapshots | boolean | false | Update visual baselines |

---

## Directory Structure Model

```
e2e/
├── fixtures/
│   └── index.ts              # Custom fixture definitions
├── page-objects/
│   ├── base.page.ts          # Abstract base class
│   ├── components/           # 11 page objects
│   ├── forms/                # 12 page objects
│   ├── navigation/           # 7 page objects
│   ├── overlay/              # 6 page objects
│   ├── data/                 # 5 page objects
│   ├── editors/              # 6 page objects
│   ├── json-schema/          # 4 page objects
│   └── layout/               # 5 page objects
├── visual-baselines/
│   ├── chromium/             # Chromium baselines
│   ├── firefox/              # Firefox baselines
│   └── webkit/               # WebKit baselines
└── {category}/
    └── {component}.spec.ts   # Test files (existing 56)
```

Total Page Objects: 56 (one per component page)
