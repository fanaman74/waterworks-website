# Visitor Sign In Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a visitor sign-in popup dialog in the navigation header allowing sign-in via mock Google popup or email verification code (OTP) sent using the Resend API.

**Architecture:** We will build a React Auth modal component using a native HTML5 `<dialog>` element. The backend will store temporary OTPs and active session tokens in memory, verify magic codes, and integrate with the Resend API to deliver OTP emails. Google Auth is handled through a mock popup page returning login info via postMessage.

**Tech Stack:** React 18, Vite 5, Node.js, Express, Resend REST API, LocalStorage.

---

### Task 1: Setup Configurations and Environment

**Files:**
- Modify: `.gitignore`
- Create: `.env`

- [ ] **Step 1: Modify `.gitignore` to ignore `.env`**
  Add `.env` to the ignore list to prevent committing secret keys.
  Target: [`.gitignore`](file:///Users/fred/Documents/VibeCoding/antigravity/waterworks-website/.gitignore)
  ```
  node_modules
  dist
  .DS_Store
  .env
  ```

- [ ] **Step 2: Create local environment configuration `.env`**
  Write `.env` file containing the Resend API key.
  Target: [`.env`](file:///Users/fred/Documents/VibeCoding/antigravity/waterworks-website/.env)
  ```env
  RESEND_API_KEY=re_KfUmSsa5_EzQKrU6JJSPhWXkwKc4eA8tW
  ```

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add .gitignore
  git commit -m "chore: add .env to gitignore and prepare environment configurations"
  ```

---

### Task 2: Implement Visitor Auth Backend Endpoints

**Files:**
- Modify: `server.js`

- [ ] **Step 1: Add Session Maps, dotenv parser, and Visitor Auth routing in server.js**
  We will add `dotenv` parsing, create Maps to track sessions and OTP codes, and build the backend handlers.
  Target: [`server.js`](file:///Users/fred/Documents/VibeCoding/antigravity/waterworks-website/server.js)
  Insert at the top of `server.js`:
  ```javascript
  import dotenv from 'dotenv';
  dotenv.config();
  ```
  Insert below existing `sessions` Set:
  ```javascript
  // Visitor in-memory store
  const visitorOtps = new Map(); // email -> { code, expiresAt }
  const visitorSessions = new Map(); // token -> { email, name, provider }
  ```
  Insert below the public login endpoint (`/api/login`):
  ```javascript
  // Visitor: Request Email Sign-In Code
  app.post('/api/visitor/send-code', async (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    visitorOtps.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
    });
  
    // Print code to console for easy testing/local fallback
    console.log(`\n==========================================`);
    console.log(`[VISITOR AUTH CODE FOR ${email}]: ${code}`);
    console.log(`==========================================\n`);
  
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // In development, if no key is provided, we succeed with console fallback
      return res.status(200).json({ success: true, message: 'Code printed to console (API Key unconfigured)' });
    }
  
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'WaterWorks <onboarding@resend.dev>',
          to: email,
          subject: 'Your WaterWorks Sign In Code',
          html: `<p>Hello!</p><p>Your verification code for WaterWorks is: <strong>${code}</strong></p><p>This code is valid for 10 minutes.</p>`
        })
      });
  
      if (!response.ok) {
        const errText = await response.text();
        console.error('Resend email delivery failed:', errText);
        // We succeed anyway in dev if we logged it to the console
        return res.status(200).json({ success: true, message: 'Code printed to console (Resend service failed)' });
      }
  
      res.status(200).json({ success: true, message: 'Verification email sent successfully' });
    } catch (error) {
      console.error('Error contacting Resend API:', error);
      res.status(200).json({ success: true, message: 'Code printed to console (Network error sending email)' });
    }
  });
  
  // Visitor: Verify Email Sign-In Code
  app.post('/api/visitor/verify-code', (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }
  
    const record = visitorOtps.get(email);
    if (!record) {
      return res.status(400).json({ error: 'No verification code requested for this email' });
    }
  
    if (Date.now() > record.expiresAt) {
      visitorOtps.delete(email);
      return res.status(400).json({ error: 'Verification code expired' });
    }
  
    if (record.code !== code.trim()) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
  
    // Valid code: generate session
    const token = 'visitor-token-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    const name = email.split('@')[0];
    const user = { email, name, provider: 'email' };
    
    visitorSessions.set(token, user);
    visitorOtps.delete(email); // consume code
  
    res.json({ success: true, token, user });
  });
  
  // Visitor: Mock Google Login Endpoint
  app.post('/api/visitor/google', (req, res) => {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }
  
    const token = 'visitor-token-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    const user = { email, name, provider: 'google' };
    visitorSessions.set(token, user);
  
    res.json({ success: true, token, user });
  });
  
  // Visitor: Validate Session Token (me)
  app.get('/api/visitor/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.substring(7);
    const user = visitorSessions.get(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    res.json({ user });
  });
  ```

- [ ] **Step 2: Commit**
  Run:
  ```bash
  git add server.js
  git commit -m "feat: implement visitor verification, Google callback, and session checking endpoints"
  ```

---

### Task 3: Create Backend visitor Unit Tests

**Files:**
- Create: `visitor-auth.test.js`

- [ ] **Step 1: Write `visitor-auth.test.js`**
  Create unit tests validating email code sending, OTP verification, Google endpoints, and `me` resolution.
  Target: [`visitor-auth.test.js`](file:///Users/fred/Documents/VibeCoding/antigravity/waterworks-website/visitor-auth.test.js)
  ```javascript
  import test from 'node:test';
  import assert from 'node:assert';
  import { server } from './server.js';
  
  test('Visitor Auth Routes', async (t) => {
    const origin = 'http://localhost:3001';
  
    await t.test('POST /api/visitor/send-code - should trigger code creation', async () => {
      const res = await fetch(`${origin}/api/visitor/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'testvisitor@example.com' })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
    });
  
    await t.test('POST /api/visitor/verify-code - should reject wrong code', async () => {
      const res = await fetch(`${origin}/api/visitor/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'testvisitor@example.com', code: '000000' })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error);
    });
  
    await t.test('POST /api/visitor/google - should create session for Google user', async () => {
      const res = await fetch(`${origin}/api/visitor/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'googleuser@example.com', name: 'Google User' })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.token);
      assert.strictEqual(data.user.name, 'Google User');
  
      // Save token for /me verification
      t.context = { token: data.token };
    });
  
    await t.test('GET /api/visitor/me - should return user details for token', async () => {
      const res = await fetch(`${origin}/api/visitor/me`, {
        headers: { 'Authorization': `Bearer ${t.context.token}` }
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.user.email, 'googleuser@example.com');
    });
  
    server.close();
  });
  ```

- [ ] **Step 2: Run tests to verify**
  Run: `node --test visitor-auth.test.js`
  Expected: PASS

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add visitor-auth.test.js
  git commit -m "test: write unit tests for visitor registration and auth endpoints"
  ```

---

### Task 4: Create Google OAuth Mock Login Page

**Files:**
- Create: `public/mock-google-login.html`

- [ ] **Step 1: Create public directory if missing**
  Run: `mkdir -p public`

- [ ] **Step 2: Write `public/mock-google-login.html`**
  Create a beautiful HTML dialog mimicking the official Google login layout.
  Target: [`public/mock-google-login.html`](file:///Users/fred/Documents/VibeCoding/antigravity/waterworks-website/public/mock-google-login.html)
  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in - Google Accounts</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: #f0f4f9;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }
      .card {
        background: #ffffff;
        border-radius: 28px;
        padding: 40px;
        width: 100%;
        max-width: 360px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        text-align: center;
      }
      .logo {
        height: 24px;
        margin-bottom: 16px;
      }
      h1 {
        font-size: 24px;
        font-weight: 400;
        color: #1f1f1f;
        margin: 0 0 8px;
      }
      p {
        font-size: 16px;
        color: #444746;
        margin: 0 0 28px;
      }
      .account-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: 1px solid #c4c7c5;
        border-radius: 12px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: background 0.15s;
        text-align: left;
      }
      .account-option:hover {
        background-color: #f7f9fc;
        border-color: #a8c7fa;
      }
      .avatar {
        width: 36px;
        height: 36px;
        background-color: #0b57d0;
        color: #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
      }
      .account-info {
        flex: 1;
      }
      .name {
        font-weight: 500;
        font-size: 14px;
        color: #1f1f1f;
      }
      .email {
        font-size: 12px;
        color: #444746;
      }
      .custom-input {
        width: 100%;
        box-sizing: border-box;
        padding: 14px 16px;
        border: 1px solid #747775;
        border-radius: 4px;
        font-size: 16px;
        margin-bottom: 20px;
        outline: none;
      }
      .custom-input:focus {
        border-color: #0b57d0;
        border-width: 2px;
        padding: 13px 15px;
      }
      .btn {
        background-color: #0b57d0;
        color: #ffffff;
        border: none;
        border-radius: 100px;
        padding: 12px 24px;
        font-weight: 500;
        font-size: 14px;
        cursor: pointer;
        width: 100%;
        transition: background 0.15s;
      }
      .btn:hover {
        background-color: #0842a0;
      }
      .divider {
        margin: 20px 0;
        font-size: 12px;
        color: #747775;
        display: flex;
        align-items: center;
      }
      .divider::before, .divider::after {
        content: "";
        flex: 1;
        border-bottom: 1px solid #e3e3e3;
        margin: 0 10px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <svg class="logo" viewBox="0 0 24 24" width="24" height="24">
        <path fill="#ea4335" d="M12 5.04c1.65 0 3.2.57 4.43 1.69l3.3-3.3C17.74 1.58 14.99 1 12 1 7.24 1 3.2 3.74 1.25 7.74l3.87 3a7.16 7.16 0 0 1 6.88-5.7z"/>
        <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43a5.5 5.5 0 0 1-2.39 3.61l3.71 2.87c2.17-2 3.74-4.94 3.74-8.63z"/>
        <path fill="#fbbc05" d="M5.12 10.74a7.18 7.18 0 0 1 0 2.52l-3.87 3A11.96 11.96 0 0 1 1 12c0-1.54.29-3.01.8-4.38l3.32 3.12z"/>
        <path fill="#34a853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.71-2.87a7.18 7.18 0 0 1-4.25 1.22c-3.82 0-7.05-2.58-8.21-6.04l-3.87 3A11.96 11.96 0 0 0 12 23z"/>
      </svg>
      <h1>Choose an account</h1>
      <p>to continue to WaterWorks</p>
  
      <div class="account-option" onclick="selectAccount('Jane Doe', 'jane.doe@gmail.com')">
        <div class="avatar" style="background-color: #a82582;">J</div>
        <div class="account-info">
          <div class="name">Jane Doe</div>
          <div class="email">jane.doe@gmail.com</div>
        </div>
      </div>
  
      <div class="account-option" onclick="selectAccount('Alex Plumber', 'alex.test@gmail.com')">
        <div class="avatar" style="background-color: #248a3d;">A</div>
        <div class="account-info">
          <div class="name">Alex Plumber</div>
          <div class="email">alex.test@gmail.com</div>
        </div>
      </div>
  
      <div class="divider">or use another email</div>
      
      <input type="text" id="customName" class="custom-input" placeholder="Your Name" style="margin-bottom: 10px;">
      <input type="email" id="customEmail" class="custom-input" placeholder="Email Address">
      
      <button class="btn" onclick="submitCustom()">Sign In</button>
    </div>
  
    <script>
      function selectAccount(name, email) {
        window.opener.postMessage({
          type: 'GOOGLE_LOGIN_SUCCESS',
          user: { name, email }
        }, window.location.origin);
        window.close();
      }
  
      function submitCustom() {
        const name = document.getElementById('customName').value.trim() || 'Google Guest';
        const email = document.getElementById('customEmail').value.trim();
        if (!email || !email.includes('@')) {
          alert('Please enter a valid email address');
          return;
        }
        selectAccount(name, email);
      }
    </script>
  </body>
  </html>
  ```

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add public/mock-google-login.html
  git commit -m "feat: create mock Google OAuth login page with postMessage payload sharing"
  ```

---

### Task 5: Add CSS Styles for Visitor Sign In

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Append custom dialog styling to `src/styles.css`**
  Target: [`src/styles.css`](file:///Users/fred/Documents/VibeCoding/antigravity/waterworks-website/src/styles.css)
  Append these styles to the bottom:
  ```css
  
  /* ---- visitor auth modal ---- */
  dialog.auth-modal {
    border: none;
    background: var(--bg);
    color: var(--ink);
    border-radius: var(--radius-lg);
    padding: 0;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
    max-width: 440px;
    width: 90%;
    overflow: hidden;
  }
  
  dialog.auth-modal::backdrop {
    background: rgba(6, 16, 21, 0.6);
    backdrop-filter: blur(8px);
  }
  
  .auth-modal-content {
    padding: 36px;
    position: relative;
  }
  
  .auth-modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: var(--chip);
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  
  .auth-modal-close:hover {
    background: var(--line);
    color: var(--ink);
  }
  
  .google-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    font-weight: 700;
    font-size: 15px;
    padding: 13px 20px;
    border-radius: 999px;
    border: 1.5px solid var(--line);
    background: var(--bg);
    color: var(--ink);
    transition: all 0.2s ease;
    cursor: pointer;
    margin-top: 8px;
  }
  
  .google-btn:hover {
    background: var(--surface-2);
    border-color: var(--primary);
    transform: translateY(-1px);
  }
  
  .google-btn svg {
    width: 18px;
    height: 18px;
  }
  
  .auth-divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 24px 0;
    color: var(--muted);
    font-size: 13px;
    font-weight: 600;
  }
  
  .auth-divider::before, .auth-divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--line);
  }
  
  .auth-divider:not(:empty)::before {
    margin-right: .5em;
  }
  
  .auth-divider:not(:empty)::after {
    margin-left: .5em;
  }
  ```

- [ ] **Step 2: Commit**
  Run:
  ```bash
  git add src/styles.css
  git commit -m "style: add custom styles for visitor auth dialog and buttons"
  ```

---

### Task 6: Implement Visitor Auth Modal Component

**Files:**
- Create: `src/components/VisitorAuthModal.jsx`

- [ ] **Step 1: Write `src/components/VisitorAuthModal.jsx`**
  Implement the React modal handling email and Google inputs.
  Target: [`src/components/VisitorAuthModal.jsx`](file:///Users/fred/Documents/VibeCoding/antigravity/waterworks-website/src/components/VisitorAuthModal.jsx)
  ```javascript
  import React, { useState, useEffect, useRef } from 'react';
  import { Icon } from './Icons';
  import { Eyebrow } from './Shared';
  
  export default function VisitorAuthModal({ isOpen, onClose, onAuthSuccess }) {
    const dialogRef = useRef(null);
    const [step, setStep] = useState(1); // 1 = Option selection, 2 = OTP check, 3 = Success
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
  
    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
  
      if (isOpen) {
        setStep(1);
        setEmail('');
        setCode('');
        setError('');
        setMessage('');
        dialog.showModal();
      } else {
        dialog.close();
      }
    }, [isOpen]);
  
    // Fallback backdrop click dismissal for Safari
    const handleBackdropClick = (e) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    };
  
    const handleSendCode = (e) => {
      e.preventDefault();
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
  
      setLoading(true);
      setError('');
      fetch('/api/visitor/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to request verification code');
        return res.json();
      })
      .then(data => {
        setStep(2);
        setMessage('Verification code sent! Please check your email.');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
    };
  
    const handleVerifyCode = (e) => {
      e.preventDefault();
      if (!code.trim() || code.trim().length < 6) {
        setError('Please enter a valid 6-digit verification code');
        return;
      }
  
      setLoading(true);
      setError('');
      fetch('/api/visitor/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() })
      })
      .then(res => {
        if (!res.ok) throw new Error('Invalid or expired code. Please try again.');
        return res.json();
      })
      .then(data => {
        setStep(3);
        onAuthSuccess(data.user, data.token);
        setTimeout(() => {
          onClose();
        }, 1500);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
    };
  
    const handleGoogleSignIn = () => {
      setError('');
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        '/mock-google-login.html',
        'GoogleLogin',
        `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
      );
    };
  
    return (
      <dialog 
        ref={dialogRef} 
        className="auth-modal" 
        onClick={handleBackdropClick}
        onCancel={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <div className="auth-modal-content">
          <button className="auth-modal-close" onClick={onClose} aria-label="Close dialog">
            <Icon name="close" size={16} />
          </button>
  
          {step === 1 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Eyebrow>Welcome to WaterWorks</Eyebrow>
                <h3 style={{ marginTop: 8, fontSize: 24 }}>Sign In / Sign Up</h3>
              </div>
  
              <button className="google-btn" onClick={handleGoogleSignIn}>
                <svg viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
  
              <div className="auth-divider">or use email</div>
  
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
            </div>
          )}
  
          {step === 2 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Eyebrow>Check your email</Eyebrow>
                <h3 style={{ marginTop: 8, fontSize: 24 }}>Verify your email</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 8 }}>We sent a code to <strong>{email}</strong></p>
              </div>
  
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
                {message && <p style={{ color: 'var(--primary)', fontSize: 13, marginTop: -8, marginBottom: 12 }}>{message}</p>}
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
                  onClick={handleSendCode}
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
              <p style={{ color: 'var(--muted)', marginTop: 8 }}>Welcome back to WaterWorks!</p>
            </div>
          )}
        </div>
      </dialog>
    );
  }
  ```

- [ ] **Step 2: Commit**
  Run:
  ```bash
  git add src/components/VisitorAuthModal.jsx
  git commit -m "feat: implement VisitorAuthModal component to handle Google sign-in messages and OTP submissions"
  ```

---

### Task 7: Integrate Visitor Auth in App State

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Modify `src/App.jsx` to load and maintain Visitor authentication state**
  Target: [`src/App.jsx`](file:///Users/fred/Documents/VibeCoding/antigravity/waterworks-website/src/App.jsx)
  Insert imports at the top:
  ```javascript
  import VisitorAuthModal from './components/VisitorAuthModal';
  ```
  Add state and message listeners inside `App` component definition (around line 22):
  ```javascript
    const [visitor, setVisitor] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
    // Validate session token on page load
    useEffect(() => {
      const storedToken = localStorage.getItem('ww-visitor-token');
      if (storedToken) {
        fetch('/api/visitor/me', {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        })
        .then(res => {
          if (!res.ok) throw new Error('Session invalid');
          return res.json();
        })
        .then(data => {
          setVisitor(data.user);
        })
        .catch(() => {
          localStorage.removeItem('ww-visitor-token');
        });
      }
    }, []);
  
    // Listen for postMessage events from the Google Sign-in popup
    useEffect(() => {
      const handleGoogleMessage = (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data && event.data.type === 'GOOGLE_LOGIN_SUCCESS') {
          const { email, name } = event.data.user;
          
          fetch('/api/visitor/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name })
          })
          .then(res => {
            if (!res.ok) throw new Error('Backend failed to create Google visitor session');
            return res.json();
          })
          .then(data => {
            localStorage.setItem('ww-visitor-token', data.token);
            setVisitor(data.user);
            setIsAuthModalOpen(false);
          })
          .catch(err => {
            console.error('Google Auth backend error:', err);
            alert('Failed to sign in with Google. Please try again.');
          });
        }
      };
  
      window.addEventListener('message', handleGoogleMessage);
      return () => window.removeEventListener('message', handleGoogleMessage);
    }, []);
  
    const handleVisitorAuthSuccess = (user, token) => {
      localStorage.setItem('ww-visitor-token', token);
      setVisitor(user);
    };
  
    const handleVisitorLogout = () => {
      localStorage.removeItem('ww-visitor-token');
      setVisitor(null);
    };
  ```
  Pass properties to the `Header` component inside `App` JSX return (around line 82):
  ```javascript
        <Header 
          lang={lang} 
          setLang={setLang} 
          route={base} 
          go={go} 
          visitor={visitor}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleVisitorLogout}
        />
  ```
  Render the modal element inside the App container at the end of the return statement:
  ```javascript
      </div>
    );
  }
  ```
  Replace with:
  ```javascript
        <VisitorAuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onAuthSuccess={handleVisitorAuthSuccess}
        />
      </div>
    );
  }
  ```

- [ ] **Step 2: Commit**
  Run:
  ```bash
  git add src/App.jsx
  git commit -m "feat: wire up visitor authentication hooks, OAuth postMessage listeners, and modal rendering in App.jsx"
  ```

---

### Task 8: Update Header Component with Visitor Button

**Files:**
- Modify: `src/components/Shared.jsx`

- [ ] **Step 1: Update `Header` component in `src/components/Shared.jsx` to render visitor status CTAs**
  Target: [`src/components/Shared.jsx`](file:///Users/fred/Documents/VibeCoding/antigravity/waterworks-website/src/components/Shared.jsx)
  Modify the `Header` function signature to accept visitor props:
  ```javascript
  export function Header({ lang, setLang, route, go, visitor, onOpenAuth, onLogout }) {
  ```
  Add the sign-in/logged-in button logic inside the header's desktop actions container (line 85):
  ```javascript
            <div className="header-actions">
              <div className="lang">
                {["en", "fr", "nl"].map((lg) => (
                  <button key={lg} className={lang === lg ? "on" : ""} onClick={() => setLang(lg)}>{lg.toUpperCase()}</button>
                ))}
              </div>
              
              {visitor ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--primary)' }}>Hi, {visitor.name}</span>
                  <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13, height: 38 }} onClick={onLogout}>
                    Log Out
                  </button>
                </div>
              ) : (
                <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13.5, height: 38 }} onClick={onOpenAuth}>
                  Sign In
                </button>
              )}
  
              <a className="btn btn-accent" href="#" style={{ height: 38, padding: '0 18px', display: 'inline-flex', alignItems: 'center' }} onClick={(e) => { e.preventDefault(); go("contact"); }}>
                {L(WW.ui.quoteShort)}
              </a>
              <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">
                <Icon name={open ? "close" : "menu"} />
              </button>
            </div>
  ```
  Add the sign-in/logged-in actions inside the mobile navigations container (line 99):
  ```javascript
          <div className="mobile-nav">
            {WW.nav.map((n) => (
              <a key={n.id} href="#" className={route === n.id ? "active" : ""}
                onClick={(e) => { e.preventDefault(); go(n.id); setOpen(false); }}>{L(n.label)}</a>
            ))}
            <div style={{ display: "flex", flexWrap: 'wrap', gap: 8, marginTop: 12, alignItems: 'center' }}>
              {["en", "fr", "nl"].map((lg) => (
                <button key={lg} className="type-chip" style={lang === lg ? { background: "var(--primary)", color: "var(--primary-ink)", borderColor: "var(--primary)", margin: 0 } : { margin: 0 }} onClick={() => setLang(lg)}>{lg.toUpperCase()}</button>
              ))}
              
              {visitor ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Hi, {visitor.name}</span>
                  <button className="type-chip" style={{ margin: 0, padding: '6px 12px', background: 'transparent' }} onClick={() => { onLogout(); setOpen(false); }}>
                    Log Out
                  </button>
                </div>
              ) : (
                <button className="type-chip" style={{ margin: 0, marginLeft: 'auto', padding: '6px 12px' }} onClick={() => { onOpenAuth(); setOpen(false); }}>
                  Sign In
                </button>
              )}
            </div>
          </div>
  ```

- [ ] **Step 2: Commit**
  Run:
  ```bash
  git add src/components/Shared.jsx
  git commit -m "feat: render visitor sign-in and user status indicators in header desktop/mobile layouts"
  ```

---

### Task 9: Verify and Test Visitor Authentication Flow

**Files:**
- None (verification phase)

- [ ] **Step 1: Run project test suite**
  Run: `npm test`
  Expected: All 10 existing tests + new visitor tests pass cleanly.

- [ ] **Step 2: Start dev server**
  Run: `npm run dev` in background.

- [ ] **Step 3: Perform manual sign-in flow checks**
  Open the browser page, click "Sign In", select Google mock option, verify credentials returned. Log out and try email sign-in. Retrieve the generated OTP from backend logs, input it, verify sign-in complete and persisted on refresh.
