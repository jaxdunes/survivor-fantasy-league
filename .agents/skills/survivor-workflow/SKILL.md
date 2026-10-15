---
name: survivor-workflow
description: >-
  Standard workflow for building features, modifying functionality, or fixing bugs in the Survivor Fantasy League project.
  Use whenever the user requests a new feature, improvement, refactoring, or bug fix for this codebase.
  Enforces appropriate folder placement (e.g. features, bug_fixes), presenting the PRD and implementation plan first for
  interactive design turns, requiring explicit user continuation before carrying out implementation, strict Firebase live data
  isolation under dev_testing/, test data state initialization, and post-testing data segregation.
---

# Survivor Fantasy League Development Workflow

This skill standardizes the engineering workflow for all features, enhancements, and bug fixes in the Survivor Fantasy League project.

---

## Phase 1: Planning, Design & Interactive Review Gate

### Step 1: Identify Appropriate Folder & Create Dedicated Subfolder

1. Determine the category of the work and place documents in the **appropriate folder**:
   - `features/` for new features, major capability additions, or workflow expansions.
   - `bug_fixes/` for defect resolutions, regression patches, or styling/logic corrections.
   - (Or another appropriately named top-level folder if the task introduces a distinct new category).
2. Inside that folder, create a descriptive subfolder using snake_case:
   - Example: `features/tribe_swap_and_merge/` or `bug_fixes/safari_layout_shift/`.

---

### Step 2: Formulate `prd.md` and `implementationplan.md`

Before writing or modifying any application code, prepare two foundational documents in the subfolder:

1. **`prd.md`**:
   - Define the problem/opportunity, scope, functional requirements, data schema, and acceptance criteria.
   - You can reference or adapt [prd_template.md](./resources/prd_template.md).
2. **`implementationplan.md`**:
   - Specify target files to modify, architectural design, test state initialization strategy, phased execution steps, and verification approach.
   - You can reference or adapt [implementation_plan_template.md](./resources/implementation_plan_template.md).

---

### Step 3: Present to User & Pause for Design Turns (MANDATORY GATE)

> [!IMPORTANT]
> **Implementation must NEVER begin without explicit user sign-off.**

1. **Present the Plan First**: Present the PRD and Implementation Plan clearly to the user for review before making changes to application code.
2. **Iterative Design Turns**: Allow the user conversational turns to review, critique, adjust requirements, and edit the design. Update the plan and PRD based on user feedback.
3. **Explicit User Continuation Required**: The agent must **STOP** and wait for the user to explicitly tell it to continue (e.g., "continue", "proceed", "looks good", "go ahead"). Do NOT proceed to write or modify project application code until the user gives explicit confirmation.

---

## Phase 2: Execution & Implementation (Only After User Approves)

### Step 4: Live Data Protection & Local Environment Isolation

> [!CRITICAL]
> **Live Production Firebase data must NEVER be read, written, or mutated during local development and testing.**

1. Always execute dev testing on `localhost` or `127.0.0.1` (e.g., `http://localhost:8085` or `http://localhost:8000`).
2. Verify that the automatic environment guard in [`js/config.js`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/js/config.js) wraps `database.ref()` under the `dev_testing/` namespace.
3. Confirm the UI shows the indicator: `🧪 DEV MODE | Firebase Path: dev_testing/`.
4. Never issue direct Firebase calls to root production paths (`leagues/...`, `seasons/...`).

---

### Step 5: Test Data State Initialization

Always consider and define **how to initialize the testing site's data state** so the developer can immediately test the site without manual data entry:

1. Determine the exact state required to exercise the feature or fix (e.g., specific players drafted, scores recorded for Episode 3, custom tribe created).
2. Provide a reliable way to initialize that state inside the `dev_testing/` namespace:
   - A browser console seed snippet.
   - A test script or mock JSON fixture.
   - Programmatic seeding in `dev_testing/leagues/[league-id]/` or `dev_testing/seasons/[season-id]/`.
3. Provide the user with direct URLs with the relevant query parameters (e.g., `http://localhost:8085/index.html?league=jackson-ryan-league&season=season-51`).

---

### Step 6: Carry Out Implementation Plan

1. Follow the approved phased execution steps in `implementationplan.md`.
2. Keep code edits focused, maintain documentation integrity, and preserve existing features.

---

### Step 7: Test Data Segregation & Teardown

1. Ensure all test data remains strictly segregated within the `dev_testing/` node and never mingles with production data.
2. Document how test data is segregated and provide a cleanup/reset command or routine (e.g., deleting or resetting the `dev_testing/` node in Firebase) so test artifacts can be cleared after testing.

---

### Step 8: Verification & `walkthrough.md`

1. Validate the changes against the initialized test state in the browser.
2. Confirm that no errors occurred in the browser console.
3. Verify that production database nodes remained 100% untouched.
4. Create `walkthrough.md` inside the subfolder summarizing:
   - What changed.
   - How the feature/fix was verified.
   - Instructions for the user on how to test with the initialized state.
