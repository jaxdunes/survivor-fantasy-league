# Survivor Fantasy League - Agent Guidelines & Rules

These guidelines are strictly enforced for all tasks, feature developments, and bug fixes within the Survivor Fantasy League project.

---

## 1. Documentation & Folder Structure

- **Appropriate Folder Placement**: All task-specific documentation, requirements, and implementation plans must be placed in the appropriate folder for the work being done.
  - Examples:
    - `features/` for new features, major enhancements, and workflow additions.
    - `bug_fixes/` for bug fixes, edge-case patches, and UI/logic corrections.
  - If a task fits another distinct category, place it in an appropriately named directory.
- **Dedicated Subfolder**: Always create a descriptive, snake_case subfolder under the appropriate folder (e.g., `features/tribe_swap_and_merge` or `bug_fixes/mobile_photo_flashing`).
- **Required Documentation**: Every feature or bug fix must include:
  1. `prd.md`: Problem statement, scope, requirements, data schema, and acceptance criteria.
  2. `implementationplan.md`: Proposed code modifications, affected files, phased execution plan, and verification strategy.
  3. `walkthrough.md`: Summary of changes, testing steps, and evidence that live data was unaffected.

---

## 2. Production Data Safety & Isolation

> [!CRITICAL]
> **Live Production Firebase data must NEVER be read, written, or modified during local testing.**

- **Automatic Environment Guard**: The application uses an environment guard in [`js/config.js`](file:///Users/ryantaylor/Desktop/survivor-fantasy-league/js/config.js). When running on `localhost` or `127.0.0.1`, all Firebase Realtime Database reads and writes are automatically prefixed with the `dev_testing/` namespace.
- **Zero Live Mutations**: Never bypass the `dev_testing/` wrapper. Live production nodes (e.g., `leagues/jackson-ryan-league`, `seasons/season-51`) must remain completely untouched.
- **Test Server Verification**: Always confirm that local tests are executed on `localhost` (e.g., `http://localhost:8085` or `http://localhost:8000`) and that the `🧪 DEV MODE | Firebase Path: dev_testing/` banner is active.

---

## 3. Test Data State Initialization & Segregation

- **Initialize Test State**: When developing or testing, actively consider how to initialize the test site's data state so the developer can immediately test the site without tedious manual setup.
  - Provide seed data, mock fixtures, or console setup scripts that write exclusively into `dev_testing/` (or `localStorage`).
  - Ensure test states include realistic scenarios (e.g., drafted players, active episodes, scoring events) relevant to the feature being tested.
- **Segregate Test Data**: All test data must remain strictly isolated inside the `dev_testing/` namespace and/or local test fixtures. It must never leak into production datasets.
- **Cleanup & Reset**: Always document how the test state was initialized and provide clear instructions or commands to reset/clear the `dev_testing/` node if needed.
