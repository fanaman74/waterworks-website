# Sign-In Modal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand `VisitorAuthModal.jsx` to add a Google OAuth button, a "Create Account" tab (email + password), and keep the existing OTP "Sign In" tab — all in one modal.

**Architecture:** The entire change is confined to `src/components/VisitorAuthModal.jsx`. A `tab` state (`'signin'` | `'create'`) controls which form renders. A Google button sits above the tabs on step 1. The existing OTP 3-step flow is preserved inside the Sign In tab unchanged. The Create Account tab calls `supabase.auth.signUp` and shows a confirmation message on success.

**Tech Stack:** React 18, `@supabase/supabase-js`, existing CSS variables/classes from the project.

---

## File Map

| File | Change |
|------|--------|
| `src/components/VisitorAuthModal.jsx` | Full rewrite — adds tabs, Google button, Create Account form |

No other files need changes. `App.jsx` already handles `onAuthStateChange` for Google OAuth callbacks.

---

### Task 1: Rewrite VisitorAuthModal with tabs and Google button

**Files:**
- Modify: `src/components/VisitorAuthModal.jsx`

This is a full rewrite of the component. The existing OTP sign-in flow is preserved verbatim inside the Sign In tab. New additions: tab state, Google OAuth button, Create Account form.

- [ ] **Step 1: Read the current file**

Read `src/components/VisitorAuthModal.jsx` to confirm the current content before replacing it.

- [ ] **Step 2: Replace the file with the new implementation**

Replace `src/components/VisitorAuthModal.jsx` with the following complete file:

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { Eyebrow } from './Shared';
import { supabase } from '../supabase';

export default function VisitorAuthModal({ isOpen, onClose, onAuthSuccess }) {
  const dialogRef = useRef(null);

  // Tab: 'signin' | 'create'
  const [tab, setTab] = useState('signin');

  // Sign In tab state (OTP flow)
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  // Create Account tab state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [createMessage, setCreateMessage] = useState('');

  // Shared state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      resetAll();
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  function resetAll() {
    setTab('signin');
    setStep(1);
    setEmail('');
    setCode('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setCreateMessage('');
    setLoading(false);
  }

  function switchTab(t) {
    setTab(t);
    setStep(1);
    setCode('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setCreateMessage('');
  }

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) onClose();
  };

  // Google OAuth
  const handleGoogle = async () => {
    onClose();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  // Sign In tab — OTP flow
  const handleSendCode = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true }
    });
    setLoading(false);
    if (otpError) {
      setError(otpError.message);
    } else {
      setStep(2);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length < 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }
    setLoading(true);
    setError('');
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email'
    });
    setLoading(false);
    if (verifyError) {
      setError('Invalid or expired code. Please try again.');
    } else {
      const user = data.user;
      setStep(3);
      onAuthSuccess({ email: user.email, name: user.email.split('@')[0], provider: 'email' });
      setTimeout(() => onClose(), 1500);
    }
  };

  // Create Account tab
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Please enter a password');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setCreateMessage('Account created! Check your email to confirm before signing in.');
    }
  };

  const showTopControls = tab === 'signin' ? step === 1 : !createMessage;

  return (
    <dialog
      ref={dialogRef}
      className="auth-modal"
      onClick={handleBackdropClick}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
    >
      <div className="auth-modal-content">
        <button className="auth-modal-close" onClick={onClose} aria-label="Close dialog">
          <Icon name="close" size={16} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Eyebrow>Welcome to WaterWorks</Eyebrow>
          <h3 style={{ marginTop: 8, fontSize: 24 }}>
            {tab === 'signin' ? 'Sign In' : 'Create Account'}
          </h3>
        </div>

        {/* Google button + tabs — visible on step 1 / before success */}
        {showTopControls && (
          <>
            <button
              onClick={handleGoogle}
              className="btn"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginBottom: 20,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--fg)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <div style={{ display: 'flex', gap: 0, marginBottom: 20, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              {['signin', 'create'].map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    border: 'none',
                    borderRadius: 0,
                    background: tab === t ? 'var(--primary)' : 'transparent',
                    color: tab === t ? '#fff' : 'var(--muted)',
                    fontWeight: tab === t ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: 14,
                    transition: 'background 0.15s'
                  }}
                >
                  {t === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Sign In tab */}
        {tab === 'signin' && (
          <>
            {step === 1 && (
              <form onSubmit={handleSendCode}>
                <div className="field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </div>
                {error && <p style={{ color: 'var(--accent)', fontSize: 13, marginTop: -8, marginBottom: 12 }}>{error}</p>}
                <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Sending code...' : 'Send Magic Verification Code'}
                </button>
              </form>
            )}

            {step === 2 && (
              <div>
                <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16, textAlign: 'center' }}>
                  We sent a code to <strong>{email}</strong>
                </p>
                <form onSubmit={handleVerifyCode}>
                  <div className="field">
                    <label>6-Digit Verification Code</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      style={{ textAlign: 'center', fontSize: 22, letterSpacing: '0.2em' }}
                      required
                    />
                  </div>
                  {error && <p style={{ color: 'var(--accent)', fontSize: 13, marginTop: -8, marginBottom: 12 }}>{error}</p>}
                  <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                </form>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, fontSize: 13.5 }}>
                  <button
                    className="btn btn-ghost"
                    style={{ border: 'none', background: 'transparent', color: 'var(--primary)', padding: 0 }}
                    onClick={() => setStep(1)}
                  >
                    Change Email
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ border: 'none', background: 'transparent', color: 'var(--muted)', padding: 0 }}
                    onClick={() => handleSendCode(null)}
                    disabled={loading}
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="success" style={{ padding: '20px 0' }}>
                <div className="ok">
                  <Icon name="check" size={34} />
                </div>
                <h3 style={{ fontSize: 24 }}>Successfully Signed In</h3>
                <p style={{ color: 'var(--muted)', marginTop: 8 }}>Welcome to WaterWorks!</p>
              </div>
            )}
          </>
        )}

        {/* Create Account tab */}
        {tab === 'create' && (
          <>
            {!createMessage ? (
              <form onSubmit={handleCreateAccount}>
                <div className="field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a password"
                    required
                  />
                </div>
                <div className="field">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    required
                  />
                </div>
                {error && <p style={{ color: 'var(--accent)', fontSize: 13, marginTop: -8, marginBottom: 12 }}>{error}</p>}
                <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            ) : (
              <div className="success" style={{ padding: '20px 0' }}>
                <div className="ok">
                  <Icon name="check" size={34} />
                </div>
                <h3 style={{ fontSize: 22 }}>Check your email</h3>
                <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: 14 }}>{createMessage}</p>
              </div>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}
```

- [ ] **Step 3: Verify the dev server starts without errors**

```bash
npm run dev
```

Expected: Vite starts with no compile errors. Open `http://localhost:5173` in a browser.

- [ ] **Step 4: Manually test Sign In tab (OTP flow)**

1. Click the sign-in button in the header to open the modal.
2. Confirm you see: Google button, "or" divider, Sign In / Create Account tabs, Sign In tab selected.
3. Enter a valid email and click "Send Magic Verification Code".
4. Confirm step 2 (code entry) appears.
5. Click "Change Email" — confirm step 1 returns.

- [ ] **Step 5: Manually test Create Account tab**

1. Open the modal.
2. Click "Create Account" tab.
3. Enter an email, a password, a non-matching confirm password.
4. Click "Create Account" — confirm "Passwords do not match" error appears.
5. Fix confirm password to match, click "Create Account".
6. Confirm the success message ("Check your email to confirm...") appears.

- [ ] **Step 6: Manually test Google button**

1. Open the modal.
2. Click "Continue with Google".
3. Confirm the modal closes and the browser redirects to Google's OAuth consent screen.

> **Note:** Google OAuth will only complete successfully after Supabase Google provider is configured (see below). The redirect itself proves the button works.

- [ ] **Step 7: Manually test tab switching resets state**

1. Open modal, type an email in Sign In tab, click "Send Magic Verification Code" (step 2 appears).
2. Click "Create Account" tab — confirm step resets to 1, email field is preserved, code field is gone.
3. Type a password, switch back to Sign In tab — confirm password fields are gone.

- [ ] **Step 8: Commit**

```bash
git add src/components/VisitorAuthModal.jsx
git commit -m "feat: add Google OAuth, Create Account tab, and tab switcher to VisitorAuthModal"
```

---

### Task 2: Configure Supabase Google OAuth provider (manual setup)

This task has no code changes. It is a one-time configuration in external dashboards.

- [ ] **Step 1: Create Google OAuth credentials**

1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Create a new project (or use an existing one).
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**.
4. Application type: **Web application**.
5. Add authorized redirect URI:
   ```
   https://kliuhctutrepmntuwlvx.supabase.co/auth/v1/callback
   ```
6. Save. Copy the **Client ID** and **Client Secret**.

- [ ] **Step 2: Enable Google provider in Supabase**

1. Go to [https://supabase.com/dashboard/project/kliuhctutrepmntuwlvx/auth/providers](https://supabase.com/dashboard/project/kliuhctutrepmntuwlvx/auth/providers)
2. Find **Google** and toggle it on.
3. Paste the Client ID and Client Secret from Step 1.
4. Save.

- [ ] **Step 3: Verify Google sign-in end-to-end**

1. Run `npm run dev`, open the modal, click "Continue with Google".
2. Complete the Google consent screen.
3. Confirm the browser redirects back to `http://localhost:5173` and the visitor is now signed in (header shows visitor name/email).

- [ ] **Step 4: Test on live Railway site**

1. Push the code to Railway (or confirm it auto-deployed from the previous commit).
2. Open `https://waterworks-website-production.up.railway.app/`.
3. Open the modal, click "Continue with Google", complete consent.
4. Confirm sign-in works on the live site.

---

## Self-Review

**Spec coverage:**
- ✅ Google OAuth button — Task 1 Step 2 (`handleGoogle`, button JSX)
- ✅ Tab switcher (Sign In / Create Account) — Task 1 Step 2 (`switchTab`, tab JSX)
- ✅ OTP sign-in flow preserved — Task 1 Step 2 (step 1/2/3 JSX inside `tab === 'signin'`)
- ✅ Create Account form (email + password + confirm) — Task 1 Step 2 (`handleCreateAccount`, form JSX)
- ✅ Create Account success message (no auto-close) — Task 1 Step 2 (`createMessage` state, success JSX)
- ✅ Tab switch resets step/code/password/error, preserves email — Task 1 Step 2 (`switchTab`)
- ✅ Google button hidden mid-OTP-flow — Task 1 Step 2 (`showTopControls`)
- ✅ `redirectTo: window.location.origin` for Google OAuth — Task 1 Step 2
- ✅ Supabase Google provider setup — Task 2

**Placeholder scan:** None found.

**Type consistency:** `tab` is `'signin'` | `'create'` throughout. `step` is 1/2/3 throughout. `createMessage` is string throughout.
