

# Fix: Install Prompt Dismissal, Password Toggle, and System-Wide Bug Audit

## Issues Identified

### 1. Install Prompt Cannot Be Dismissed (Critical)
The "Install OrangeFlow SL" banner's X button and "Got it" button don't work on mobile. The root cause is that the `motion.div` with `AnimatePresence` captures touch events, and the dismiss button lacks `type="button"`. Additionally, on iOS Safari, touch events on small tap targets inside animated containers can be unreliable. The component also uses `sessionStorage` which resets every session -- users see the banner again and again.

**Fixes:**
- Add `type="button"` to the X close button
- Increase the tap target size of the X button (min 44x44px for mobile)
- Use `localStorage` instead of `sessionStorage` so dismissal persists across sessions
- Add `touch-action: manipulation` to prevent double-tap zoom delays on mobile
- Add `pointer-events: auto` explicitly on interactive elements

### 2. Password Visibility Toggle Not Working
From the screenshot, the password field on the admin Create User form doesn't show/hide text. The Login page toggle looks correct in code but may have the same z-index/pointer-events issue on mobile. The admin form's eye button uses a `Button` component with `variant="ghost"` inside a `relative` div -- the button's hover styles may interfere.

**Fixes:**
- Ensure the eye toggle button on all password fields uses `type="button"` explicitly
- Use a plain `button` element (not the Button component) for the toggle to avoid style interference
- Verify the `z-index` of the toggle is above the input

### 3. Edge Function Error on User Creation (Screenshot)
The screenshot shows "Edge Function returned a non-2xx status code" when creating a user with password "6 dots" (likely < 8 chars). The error message is not user-friendly.

**Fixes:**
- Add client-side password validation before calling the edge function (min 8 chars, uppercase, lowercase, number)
- Show inline validation errors instead of generic toast
- Improve the error extraction in `callManageUsers` to properly display Zod validation messages from the edge function

### 4. System-Wide Audit Findings
- Login page password toggle: looks correct but needs `type="button"` for safety
- All pages reviewed: Landing, Login, NotFound, PlanningDashboard, ProcurementDashboard, AdminDashboard -- no other critical bugs found
- The `useOnlineSync` hook and offline queue are not causing issues

## Changes

### File: `src/components/InstallPrompt.tsx`
- Replace `sessionStorage` with `localStorage` for persistent dismissal
- Add `type="button"` to the X button
- Increase X button tap target to 44x44px with padding
- Add `touch-action: manipulation` on interactive elements
- Stop event propagation on dismiss to prevent motion container interference

### File: `src/pages/AdminDashboard.tsx`
- Add client-side password validation before calling edge function
- Replace `Button` component for eye toggles with plain `button` elements for reliability
- Add inline validation feedback for password requirements (real-time check as user types)
- Improve `callManageUsers` error handling to parse JSON error body properly

### File: `src/pages/Login.tsx`
- Add `type="button"` to the password toggle button (defensive fix)

## Technical Details

**InstallPrompt fixes:**
- `localStorage.getItem('pwa-install-dismissed')` instead of `sessionStorage`
- X button: `<button type="button" onClick={handleDismiss} className="... min-w-[44px] min-h-[44px] flex items-center justify-center">`
- Add `onTouchEnd` handler as fallback for iOS Safari

**Password validation (AdminDashboard):**
- Validate password client-side before API call using the same rules as the Zod schema
- Show color-coded requirement checklist (green check / red x for each rule)
- Prevent form submission if validation fails

**Error handling improvement:**
- In `callManageUsers`, check `res.data?.error` first (edge function returns JSON with error field)
- If `res.error` exists, try `await res.error.context?.json()` to get detailed message
- Display the specific validation error (e.g., "Password must contain an uppercase letter") instead of generic "Edge Function returned a non-2xx status code"

