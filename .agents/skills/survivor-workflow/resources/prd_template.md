# Product Requirements Document (PRD): [Feature or Bug Fix Title]

**Version**: 1.0  
**Status**: In Progress  
**Location**: `[appropriate_folder]/[item_name]/prd.md`  
**Target Files**: `[comma-separated list of files, e.g. js/scoring-engine.js, draft.html]`  
**Git Branch**: `[feature or bugfix branch name]`  

---

## 1. Executive Summary & Problem Statement
- **Problem**: What issue is being resolved or what capability is missing?
- **Solution / Goal**: What is being introduced, and what is the expected outcome?

---

## 2. Safety & Data Isolation Directive

> [!IMPORTANT]
> **Live Production Data Protection**: All development, automated checks, and manual verification MUST run in an isolated test environment using the `dev_testing/` Firebase namespace under `localhost`. Live production Firebase nodes (`leagues/`, `seasons/`) must remain strictly untouched.

- **Dev/Test Environment Guard**: The application must automatically enforce the `dev_testing/` namespace prefix for all Firebase Realtime Database reads and writes (managed by `wrapDatabaseInstance` in `js/config.js`).
- **Production Guard Banner**: Verify `🧪 DEV MODE | Firebase Path: dev_testing/` is visible during local testing.
- **Data Segregation**: Test data is strictly kept within `dev_testing/` and never merged into live nodes.

---

## 3. Functional Requirements
- **Requirement 1**: [Description and expected behavior]
- **Requirement 2**: [Description and expected behavior]
- **Requirement 3**: [Description and expected behavior]

---

## 4. Test Data State Initialization Plan
- How should the testing site's data state be initialized to allow realistic testing?
- Seed data fixtures or initial state (contestants, scores, episodes, draft state) under `dev_testing/`:
  - `dev_testing/leagues/[league-id]/...`
  - `dev_testing/seasons/[season-id]/...`
- Commands or scripts to seed and clear test state.

---

## 5. Verification Plan & Acceptance Criteria
- [ ] Local dev environment runs on `localhost` under `dev_testing/` namespace.
- [ ] Zero live production data modified.
- [ ] Requirement 1 verified.
- [ ] Requirement 2 verified.
- [ ] Test data segregated and reset instructions documented.
