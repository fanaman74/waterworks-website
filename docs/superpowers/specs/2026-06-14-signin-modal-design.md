# Sign-In Modal Redesign

**Date:** 2026-06-14
**Project:** waterworks-website
**Goal:** Expand the visitor auth modal to include Google OAuth and a dedicated Create Account form alongside the existing OTP sign-in flow.

---

## Architecture

`src/components/VisitorAuthModal.jsx` is expanded in place. No new files or routes are added. The modal gains a tab switcher and a Google button. Supabase handles the Google OAuth callback automatically via `onAuthStateChange` in `App.jsx`.

---

## Visual Layout

The modal has three zones, visible on step 1 only:

1. **Google button** — full-width, above the tabs. Always visible when on the first step of either tab.
2. **Tab switcher** — "Sign In" / "Create Account". Switching tabs resets all form state (fields, errors, OTP step).
3. **Tab content** — rendered below the tabs.

---

## Tab: Sign In

The existing 3-step OTP flow, unchanged:

- Step 1: Email input → `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })`
- Step 2: 6-digit code input → `supabase.auth.verifyOtp({ email, token, type: 'email' })`
- Step 3: Success message → modal auto-closes after 1500ms

The Google button and tab switcher are hidden on steps 2 and 3 (mid-flow).

---

## Tab: Create Account

Single-step form:

- Fields: email, password, confirm password
- Validation: passwords must match, both required
- Submit: `supabase.auth.signUp({ email, password })`
- Success: show inline message "Check your email to confirm your account." Modal stays open so user reads it.
- Error: show Supabase error message inline (e.g., "User already registered")

No auto-close on success — the user must close manually after reading the confirmation message.

---

## Google OAuth

```js
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: window.location.origin }
})
```

- Clicking the button triggers this call and the browser redirects to Google.
- After consent, Google redirects back to the site.
- `onAuthStateChange` in `App.jsx` fires, sets visitor state. No modal handling needed.
- The modal should call `onClose()` before triggering the OAuth redirect so it doesn't persist in background state.

---

## State Management

All state lives inside `VisitorAuthModal.jsx`:

| State | Purpose |
|-------|---------|
| `tab` | `'signin'` or `'create'` |
| `step` | OTP step 1/2/3 (Sign In tab only) |
| `email` | Shared input across both tabs |
| `code` | OTP code (Sign In tab only) |
| `password` | Password (Create Account tab only) |
| `confirmPassword` | Confirm password (Create Account tab only) |
| `loading` | Disable buttons during async calls |
| `error` | Per-tab error message |
| `message` | Success message (Create Account confirmation) |

Switching tabs resets: `step → 1`, `code`, `password`, `confirmPassword`, `error`, `message`. Email is preserved across tab switches (user may have already typed it).

---

## Error Handling

- Each tab shows its own error below the form fields.
- Supabase error messages are surfaced directly.
- Client-side: passwords not matching shows "Passwords do not match" before any API call.
- Google button failure: if `signInWithOAuth` returns an error (rare), show it as a top-level error above the tabs.

---

## Setup Required (Google OAuth)

Before Google sign-in works, the following one-time setup is needed:

1. Create a Google OAuth app in Google Cloud Console.
2. Add authorized redirect URI: `https://kliuhctutrepmntuwlvx.supabase.co/auth/v1/callback`
3. In Supabase Dashboard → Authentication → Providers → Google: enable and paste Client ID + Secret.

This is a manual user action, not part of the code implementation.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/VisitorAuthModal.jsx` | Rewrite to add tabs, Google button, Create Account form |

No other files need changes.
