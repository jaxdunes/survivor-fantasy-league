# Implementation Plan

## Bug Fix: Push Notification Checkbox Error on Add Points Screen

**Target Bug**: Fix `TypeError: firebase.auth is not a function` crash when checking the push notification checkbox on the "Add Points" modal (`index.html`).

---

### Proposed Changes

#### 1. Add `firebase-auth-compat.js` script tag in `index.html`
- Add Firebase Auth Compat SDK in `<head>` after `firebase-database-compat.js`:
  ```html
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
  ```

#### 2. Defensively inspect `firebase.auth` before accessing `currentUser`
- In `index.html` submit handler for the "Add Points" modal (around line 2084):
  - Replace direct call `firebase.auth().currentUser` with safe evaluation:
    ```javascript
    const authObj = (typeof firebase !== 'undefined' && typeof firebase.auth === 'function') ? firebase.auth() : null;
    const currentUser = authObj ? authObj.currentUser : null;
    const scoredBy = currentUser ? (currentUser.displayName || currentUser.email || 'Admin') : 'Admin';
    ```

---

### Verification Plan

#### Automated / Manual Browser Testing
1. Launch `index.html` in browser.
2. Click **"+ ADD POINTS"**.
3. Select a player and scoring category.
4. Check **"Mark Episode as Scored & Send Push Notification to League 🏆"**.
5. Click **"Add Points"** submit button.
6. Verify no console errors occur and points are saved successfully.
