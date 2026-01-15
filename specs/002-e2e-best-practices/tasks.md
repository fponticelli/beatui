# Tasks: E2E Testing Best Practices

**Input**: Design documents from `/specs/002-e2e-best-practices/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested - focusing on infrastructure implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo**: `apps/docs/e2e/` for test infrastructure
- **CI**: `.github/workflows/` for GitHub Actions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure

- [ ] T001 Install @axe-core/playwright dependency in apps/docs/package.json
- [ ] T002 [P] Create e2e/fixtures/ directory structure at apps/docs/e2e/fixtures/
- [ ] T003 [P] Create e2e/page-objects/ directory structure with category subdirectories at apps/docs/e2e/page-objects/
- [ ] T004 [P] Create e2e/visual-baselines/ directory with browser subdirectories at apps/docs/e2e/visual-baselines/
- [ ] T005 [P] Add visual-baselines and test-results to apps/docs/.gitignore (baselines tracked, results ignored)
- [ ] T006 Create .github/workflows/ directory at repository root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Create BasePage class with core methods in apps/docs/e2e/page-objects/base.page.ts
- [ ] T008 Create custom test fixture extending Playwright base in apps/docs/e2e/fixtures/index.ts
- [ ] T009 Update playwright.config.ts with enhanced configuration (video, trace, screenshot on failure, retries) in apps/docs/playwright.config.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Automated Accessibility Validation (Priority: P1) 🎯 MVP

**Goal**: Integrate axe-core accessibility testing into e2e tests so violations are caught automatically

**Independent Test**: Run `pnpm test:e2e --grep @a11y` and verify a11y violations are reported with actionable guidance

### Implementation for User Story 1

- [ ] T010 [US1] Add checkAccessibility() method to BasePage using AxeBuilder in apps/docs/e2e/page-objects/base.page.ts
- [ ] T011 [US1] Create accessibility configuration with WCAG 2.1 AA tags in apps/docs/e2e/fixtures/a11y-config.ts
- [ ] T012 [P] [US1] Create ButtonPage with a11y check in apps/docs/e2e/page-objects/components/button.page.ts
- [ ] T013 [P] [US1] Create ModalPage with a11y check in apps/docs/e2e/page-objects/overlay/modal.page.ts
- [ ] T014 [P] [US1] Create FormPage with a11y check in apps/docs/e2e/page-objects/forms/form.page.ts
- [ ] T015 [US1] Update button.spec.ts to use ButtonPage and add @a11y tag in apps/docs/e2e/components/button.spec.ts
- [ ] T016 [US1] Update modal.spec.ts to use ModalPage and add @a11y tag in apps/docs/e2e/overlay/modal.spec.ts
- [ ] T017 [US1] Add a11y rule exclusion configuration file in apps/docs/e2e/fixtures/a11y-exclusions.ts

**Checkpoint**: Accessibility testing works on 3 sample components - can verify a11y violations are reported

---

## Phase 4: User Story 2 - CI/CD Quality Gate (Priority: P1)

**Goal**: Automate e2e tests on every branch push and PR with status reporting

**Independent Test**: Open a PR and verify the workflow runs, reports status, and uploads artifacts on failure

### Implementation for User Story 2

- [ ] T018 [US2] Create GitHub Actions workflow for e2e tests in .github/workflows/e2e.yml
- [ ] T019 [US2] Configure workflow to run on push (Chromium only) in .github/workflows/e2e.yml
- [ ] T020 [US2] Configure workflow to run on PR (all browsers) with matrix strategy in .github/workflows/e2e.yml
- [ ] T021 [US2] Add artifact upload step for test-results on failure in .github/workflows/e2e.yml
- [ ] T022 [US2] Add pnpm and Node.js caching to workflow in .github/workflows/e2e.yml
- [ ] T023 [US2] Add Playwright browser caching to workflow in .github/workflows/e2e.yml
- [ ] T024 [US2] Add HTML report generation and upload in .github/workflows/e2e.yml

**Checkpoint**: CI runs automatically on push/PR, artifacts uploaded on failure

---

## Phase 5: User Story 3 - Cross-Browser Compatibility (Priority: P2)

**Goal**: Enable tests to run across Chromium, Firefox, WebKit and mobile viewports

**Independent Test**: Run `pnpm test:e2e --project=firefox` and verify tests execute in Firefox

### Implementation for User Story 3

- [ ] T025 [US3] Add Firefox project configuration in apps/docs/playwright.config.ts
- [ ] T026 [US3] Add WebKit project configuration in apps/docs/playwright.config.ts
- [ ] T027 [US3] Add mobile-chrome (Pixel 5) project configuration in apps/docs/playwright.config.ts
- [ ] T028 [US3] Add mobile-safari (iPhone 12) project configuration in apps/docs/playwright.config.ts
- [ ] T029 [US3] Add npm scripts for browser-specific execution in apps/docs/package.json

**Checkpoint**: Tests can run on all 3 desktop browsers and 2 mobile viewports

---

## Phase 6: User Story 4 - Visual Regression Detection (Priority: P2)

**Goal**: Detect unintended visual changes via screenshot comparison

**Independent Test**: Modify a component's CSS, run visual tests, verify diff is reported

### Implementation for User Story 4

- [ ] T030 [US4] Add captureScreenshot() method to BasePage in apps/docs/e2e/page-objects/base.page.ts
- [ ] T031 [US4] Configure snapshot paths in playwright.config.ts to use visual-baselines directory in apps/docs/playwright.config.ts
- [ ] T032 [P] [US4] Add visual regression test to button.spec.ts with @visual tag in apps/docs/e2e/components/button.spec.ts
- [ ] T033 [P] [US4] Add visual regression test to modal.spec.ts with @visual tag in apps/docs/e2e/overlay/modal.spec.ts
- [ ] T034 [US4] Generate initial visual baselines for button and modal in apps/docs/e2e/visual-baselines/chromium/
- [ ] T035 [US4] Add npm script for updating snapshots in apps/docs/package.json
- [ ] T036 [US4] Document dynamic element masking pattern in specs/002-e2e-best-practices/quickstart.md

**Checkpoint**: Visual regression detects CSS changes, baselines can be updated

---

## Phase 7: User Story 5 - Maintainable Test Architecture (Priority: P2)

**Goal**: Implement Page Object Model for all 56 component pages

**Independent Test**: Change a selector in a page object, verify all tests using it pass

### Implementation for User Story 5

- [ ] T037 [P] [US5] Create BadgePage in apps/docs/e2e/page-objects/components/badge.page.ts
- [ ] T038 [P] [US5] Create CollapsePage in apps/docs/e2e/page-objects/components/collapse.page.ts
- [ ] T039 [P] [US5] Create SwitchPage in apps/docs/e2e/page-objects/components/switch.page.ts
- [ ] T040 [P] [US5] Create IconPage in apps/docs/e2e/page-objects/components/icon.page.ts
- [ ] T041 [P] [US5] Create LinkPage in apps/docs/e2e/page-objects/components/link.page.ts
- [ ] T042 [P] [US5] Create ActionCardPage in apps/docs/e2e/page-objects/components/action-card.page.ts
- [ ] T043 [P] [US5] Create NoticePage in apps/docs/e2e/page-objects/components/notice.page.ts
- [ ] T044 [P] [US5] Create NotificationPage in apps/docs/e2e/page-objects/components/notification.page.ts
- [ ] T045 [P] [US5] Create RibbonPage in apps/docs/e2e/page-objects/components/ribbon.page.ts
- [ ] T046 [P] [US5] Create AnnouncementBarPage in apps/docs/e2e/page-objects/components/announcement-bar.page.ts
- [ ] T047 [P] [US5] Create InputsPage in apps/docs/e2e/page-objects/forms/inputs.page.ts
- [ ] T048 [P] [US5] Create ControlPage in apps/docs/e2e/page-objects/forms/control.page.ts
- [ ] T049 [P] [US5] Create FileInputPage in apps/docs/e2e/page-objects/forms/file-input.page.ts
- [ ] T050 [P] [US5] Create MaskInputPage in apps/docs/e2e/page-objects/forms/mask-input.page.ts
- [ ] T051 [P] [US5] Create ColorInputPage in apps/docs/e2e/page-objects/forms/color-input.page.ts
- [ ] T052 [P] [US5] Create ColorSwatchPage in apps/docs/e2e/page-objects/forms/color-swatch.page.ts
- [ ] T053 [P] [US5] Create TagsInputPage in apps/docs/e2e/page-objects/forms/tags-input.page.ts
- [ ] T054 [P] [US5] Create EditableTextPage in apps/docs/e2e/page-objects/forms/editable-text.page.ts
- [ ] T055 [P] [US5] Create SegmentedControlPage in apps/docs/e2e/page-objects/forms/segmented-control.page.ts
- [ ] T056 [P] [US5] Create ComboboxPage in apps/docs/e2e/page-objects/forms/combobox.page.ts
- [ ] T057 [P] [US5] Create TemporalPage in apps/docs/e2e/page-objects/forms/temporal.page.ts
- [ ] T058 [P] [US5] Create MenuPage in apps/docs/e2e/page-objects/navigation/menu.page.ts
- [ ] T059 [P] [US5] Create SidebarPage in apps/docs/e2e/page-objects/navigation/sidebar.page.ts
- [ ] T060 [P] [US5] Create TabsPage in apps/docs/e2e/page-objects/navigation/tabs.page.ts
- [ ] T061 [P] [US5] Create ToolbarPage in apps/docs/e2e/page-objects/navigation/toolbar.page.ts
- [ ] T062 [P] [US5] Create DropdownPage in apps/docs/e2e/page-objects/navigation/dropdown.page.ts
- [ ] T063 [P] [US5] Create FlyoutPage in apps/docs/e2e/page-objects/navigation/flyout.page.ts
- [ ] T064 [P] [US5] Create BreakpointPage in apps/docs/e2e/page-objects/navigation/breakpoint.page.ts
- [ ] T065 [P] [US5] Create DrawerPage in apps/docs/e2e/page-objects/overlay/drawer.page.ts
- [ ] T066 [P] [US5] Create TooltipPage in apps/docs/e2e/page-objects/overlay/tooltip.page.ts
- [ ] T067 [P] [US5] Create LightboxPage in apps/docs/e2e/page-objects/overlay/lightbox.page.ts
- [ ] T068 [P] [US5] Create NotificationServicePage in apps/docs/e2e/page-objects/overlay/notification-service.page.ts
- [ ] T069 [P] [US5] Create PageDropZonePage in apps/docs/e2e/page-objects/overlay/page-drop-zone.page.ts
- [ ] T070 [P] [US5] Create TablePage in apps/docs/e2e/page-objects/data/table.page.ts
- [ ] T071 [P] [US5] Create TagsPage in apps/docs/e2e/page-objects/data/tags.page.ts
- [ ] T072 [P] [US5] Create ScrollablePanelPage in apps/docs/e2e/page-objects/data/scrollable-panel.page.ts
- [ ] T073 [P] [US5] Create NineSliceScrollViewPage in apps/docs/e2e/page-objects/data/nine-slice-scroll-view.page.ts
- [ ] T074 [P] [US5] Create RtlLtrPage in apps/docs/e2e/page-objects/data/rtl-ltr.page.ts
- [ ] T075 [P] [US5] Create MonacoEditorPage in apps/docs/e2e/page-objects/editors/monaco-editor.page.ts
- [ ] T076 [P] [US5] Create ProsemirrorEditorPage in apps/docs/e2e/page-objects/editors/prosemirror-editor.page.ts
- [ ] T077 [P] [US5] Create MarkdownPage in apps/docs/e2e/page-objects/editors/markdown.page.ts
- [ ] T078 [P] [US5] Create PdfPageViewerPage in apps/docs/e2e/page-objects/editors/pdf-page-viewer.page.ts
- [ ] T079 [P] [US5] Create PdfPreviewPage in apps/docs/e2e/page-objects/editors/pdf-preview.page.ts
- [ ] T080 [P] [US5] Create VideoPlayerPage in apps/docs/e2e/page-objects/editors/video-player.page.ts
- [ ] T081 [P] [US5] Create JsonSchemaFormPage in apps/docs/e2e/page-objects/json-schema/json-schema-form.page.ts
- [ ] T082 [P] [US5] Create JsonSchemaCustomWidgetsPage in apps/docs/e2e/page-objects/json-schema/json-schema-custom-widgets.page.ts
- [ ] T083 [P] [US5] Create JsonStructureFormPage in apps/docs/e2e/page-objects/json-schema/json-structure-form.page.ts
- [ ] T084 [P] [US5] Create JsonStructureCustomWidgetsPage in apps/docs/e2e/page-objects/json-schema/json-structure-custom-widgets.page.ts
- [ ] T085 [P] [US5] Create HomePage in apps/docs/e2e/page-objects/layout/home.page.ts
- [ ] T086 [P] [US5] Create AboutPage in apps/docs/e2e/page-objects/layout/about.page.ts
- [ ] T087 [P] [US5] Create AuthenticationPage in apps/docs/e2e/page-objects/layout/authentication.page.ts
- [ ] T088 [P] [US5] Create AuthenticationComponentsPage in apps/docs/e2e/page-objects/layout/authentication-components.page.ts
- [ ] T089 [P] [US5] Create XUiUsagePage in apps/docs/e2e/page-objects/layout/x-ui-usage.page.ts
- [ ] T090 [US5] Register all page objects as fixtures in apps/docs/e2e/fixtures/index.ts
- [ ] T091 [US5] Refactor all 56 test files to use page objects (batch task)

**Checkpoint**: All 56 components have page objects, tests use fixtures instead of raw selectors

---

## Phase 8: User Story 6 - Selective Test Execution (Priority: P3)

**Goal**: Enable filtering tests by tags (@smoke, @regression, @a11y, @visual, @component)

**Independent Test**: Run `pnpm test:e2e --grep @smoke` and verify only smoke-tagged tests execute

### Implementation for User Story 6

- [ ] T092 [US6] Add @smoke tag to critical path tests (button, modal, form) in apps/docs/e2e/
- [ ] T093 [US6] Add @regression tag to all test files in apps/docs/e2e/
- [ ] T094 [US6] Add component-specific tags (@button, @modal, etc.) to all test files in apps/docs/e2e/
- [ ] T095 [US6] Add npm scripts for tag-based execution (test:e2e:smoke, test:e2e:a11y) in apps/docs/package.json
- [ ] T096 [US6] Document tag taxonomy in specs/002-e2e-best-practices/quickstart.md

**Checkpoint**: Tests can be filtered by @smoke, @a11y, @visual, and component tags

---

## Phase 9: User Story 7 - Failure Debugging (Priority: P3)

**Goal**: Capture video, trace, and screenshot on test failure for debugging

**Independent Test**: Intentionally fail a test, verify artifacts are generated

### Implementation for User Story 7

- [ ] T097 [US7] Configure video capture on failure in apps/docs/playwright.config.ts
- [ ] T098 [US7] Configure trace capture on failure in apps/docs/playwright.config.ts
- [ ] T099 [US7] Verify screenshot capture on failure in apps/docs/playwright.config.ts
- [ ] T100 [US7] Add test-results/ to .gitignore in apps/docs/.gitignore
- [ ] T101 [US7] Document artifact viewing workflow in specs/002-e2e-best-practices/quickstart.md

**Checkpoint**: Failed tests produce video, trace, and screenshot artifacts

---

## Phase 10: User Story 8 - Reusable Test Setup (Priority: P3)

**Goal**: Provide shared fixtures for common test setup operations

**Independent Test**: Write a test using a fixture, verify setup/teardown works correctly

### Implementation for User Story 8

- [ ] T102 [US8] Create navigateAndWait fixture in apps/docs/e2e/fixtures/index.ts
- [ ] T103 [US8] Create accessibilityFixture for common a11y setup in apps/docs/e2e/fixtures/index.ts
- [ ] T104 [US8] Create visualRegressionFixture for screenshot setup in apps/docs/e2e/fixtures/index.ts
- [ ] T105 [US8] Document fixture usage patterns in specs/002-e2e-best-practices/quickstart.md

**Checkpoint**: Fixtures reduce boilerplate, tests are consistent

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T106 [P] Generate visual baselines for all 56 components in apps/docs/e2e/visual-baselines/
- [ ] T107 [P] Add a11y checks to all 56 test files in apps/docs/e2e/
- [ ] T108 Verify CI workflow runs successfully on a test PR
- [ ] T109 Update CLAUDE.md with e2e testing commands at repository root
- [ ] T110 Run full test suite and verify <10 minute execution time
- [ ] T111 Run smoke tests and verify <2 minute execution time
- [ ] T112 Verify all success criteria from spec.md are met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority - can run in parallel or sequentially
  - US3, US4, US5 are P2 priority - can run after P1 stories
  - US6, US7, US8 are P3 priority - can run after P2 stories
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - Provides a11y infrastructure
- **User Story 2 (P1)**: Can start after Foundational - Independent CI workflow
- **User Story 3 (P2)**: Can start after Foundational - Browser config only
- **User Story 4 (P2)**: Depends on US5 (page objects for screenshot methods)
- **User Story 5 (P2)**: Can start after Foundational - Core POM implementation
- **User Story 6 (P3)**: Depends on US5 (tags added to refactored tests)
- **User Story 7 (P3)**: Can start after Foundational - Config only
- **User Story 8 (P3)**: Depends on US5 (fixtures use page objects)

### Parallel Opportunities

- **Phase 1**: T002, T003, T004, T005 can run in parallel
- **Phase 3 (US1)**: T012, T013, T014 page objects can be created in parallel
- **Phase 6 (US4)**: T032, T033 visual tests can be added in parallel
- **Phase 7 (US5)**: All 53 page object creation tasks (T037-T089) can run in parallel

---

## Parallel Example: User Story 5 (Page Objects)

```bash
# Launch all components page objects together:
Task: "Create BadgePage in apps/docs/e2e/page-objects/components/badge.page.ts"
Task: "Create CollapsePage in apps/docs/e2e/page-objects/components/collapse.page.ts"
Task: "Create SwitchPage in apps/docs/e2e/page-objects/components/switch.page.ts"
# ... (all 53 page objects can be created in parallel)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Accessibility)
4. Complete Phase 4: User Story 2 (CI/CD)
5. **STOP and VALIDATE**: Test a11y and CI independently
6. Deploy/demo if ready - CI will run on every push

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Accessibility) → Test a11y independently → CI ready for a11y
3. Add US2 (CI/CD) → Automated testing on every push
4. Add US3 (Cross-Browser) → Firefox/WebKit coverage
5. Add US5 (Page Objects) → Maintainable test architecture
6. Add US4 (Visual Regression) → Screenshot comparison
7. Add US6-8 (Tags, Debug, Fixtures) → Developer experience improvements
8. Polish → Full suite validated

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Accessibility) + User Story 7 (Debug artifacts)
   - Developer B: User Story 2 (CI/CD) + User Story 3 (Cross-Browser)
   - Developer C: User Story 5 (Page Objects - large task)
3. After US5 complete:
   - Developer A: User Story 4 (Visual Regression)
   - Developer B: User Story 6 (Tags)
   - Developer C: User Story 8 (Fixtures)
4. All: Polish phase together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- User Story 5 is the largest (53 page objects) - consider batching
- Visual baselines should be generated AFTER page objects are complete
