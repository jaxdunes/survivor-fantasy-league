# Product Requirements Document (PRD)

## Bug Fix: Push Notification Checkbox Error on Add Points Screen

### 1. Problem Statement
When a league administrator attempts to add points using the **"➕ ADD POINTS"** modal in `index.html` and checks the box **"Mark Episode as Scored & Send Push Notification to League 🏆"**, submitting the form triggers a fatal uncaught JavaScript exception:
```text
Uncaught TypeError: firebase.auth is not a function
```
This error prevents points from being recorded, breaks the scoring submission flow, and halts push notification broadcasting to league members.

---

### 2. Root Cause Analysis
1. **Missing SDK Component**: `index.html` included `firebase-app-compat.js` and `firebase-database-compat.js` in the `<head>`, but omitted `firebase-auth-compat.js`.
2. **Unguarded Call to `firebase.auth()`**: Line 2084 in `index.html` directly invoked `firebase.auth().currentUser` without verifying whether `firebase.auth` was loaded or defined as a function.
3. **Execution Failure**: When `notifyScored` was `true`, calling `firebase.auth()` threw a `TypeError`, causing React's error boundary to trigger a fatal runtime error and aborting the database write operations.

---

### 3. User Experience Impact
- **Severity**: High (Admin scoring feature crash)
- **Impacted Persona**: League Administrators / Scorers
- **Symptom**: Checking the push notification checkbox causes form submission to silently fail or throw a fatal error dialog (`🚨 FATAL RUNTIME ERROR`), blocking episode scoring and notifications.

---

### 4. Objectives & Target Behavior
1. **Seamless Execution**: Scoring submissions with the push notification checkbox checked must complete smoothly without runtime exceptions.
2. **SDK Inclusion**: `index.html` must include the `firebase-auth-compat.js` script tag so Firebase Authentication helper functions are available.
3. **Defensive Guarding**: `index.html` must safely handle authentication status (checking `typeof firebase.auth === 'function'`) and fallback gracefully to `'Admin'` when no user is logged in or when running offline/locally.
4. **Data Integrity**: Writing episode scored status (`leagues/{leagueId}/seasons/{seasonId}/scoredEpisodes/{episode}`) must trigger the Firebase Cloud Function (`sendEpisodeScoredNotification`) without failing the frontend transaction.

---

### 5. Functional Requirements

| ID | Requirement | Success Criteria |
|---|---|---|
| **FR-1** | Include `firebase-auth-compat.js` in `index.html` | `<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>` is loaded in `<head>`. |
| **FR-2** | Defensively resolve `scoredBy` identity | Check `typeof firebase !== 'undefined' && typeof firebase.auth === 'function'`. Use `displayName || email || 'Admin'`. |
| **FR-3** | Support local/fallback execution | If Firebase is not initialized or auth is unavailable, fallback cleanly to `'Admin'` without throwing errors. |
| **FR-4** | End-to-End Scoring & Push Notification | Selecting players, category, checking the notification box, and clicking "Add Points" saves scores and marks episode as scored successfully. |

---

### 6. Non-Functional Requirements
- **Performance**: Zero overhead or latency increase during point submission.
- **Backwards Compatibility**: Compatible with existing Firebase Realtime Database structures and Cloud Function triggers.
