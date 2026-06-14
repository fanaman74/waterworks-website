# Supabase Migration Design

**Date:** 2026-06-14  
**Project:** waterworks-website  
**Goal:** Replace Express server + db.json + Resend with Supabase (DB + Auth). Frontend talks directly to Supabase; Railway serves static files only.

---

## Architecture

The Express server (`server.js`), file-based database (`db.js`, `db.json`), and Resend email integration are removed. The React frontend communicates directly with Supabase via `@supabase/supabase-js`.

Railway switches from a Node.js service to a static site — it serves the Vite build output (`dist/`) with no server process.

Supabase replaces:
- **Database** — `leads` table replaces `db.json`
- **Auth** — Supabase Auth replaces the password session store and Resend OTP
- **Email** — Supabase sends OTP emails natively (no Resend needed)

The mock Google login is removed entirely.

---

## Database Schema

### `leads` table

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | primary key, default `gen_random_uuid()` |
| `created_at` | `timestamptz` | default `now()` |
| `name` | `text` | not null |
| `email` | `text` | not null |
| `phone` | `text` | nullable |
| `address` | `text` | nullable |
| `message` | `text` | nullable |
| `service_type` | `text` | nullable |
| `status` | `text` | default `'New'` |
| `notes` | `text` | default `''` |
| `submitted_by` | `uuid` | nullable, references `auth.users(id)` |

### `admins` table

| Column | Type | Constraints |
|--------|------|-------------|
| `user_id` | `uuid` | primary key, references `auth.users(id)` |

The admin account is created once manually in the Supabase dashboard, then their `auth.users` UUID is inserted into `admins`.

---

## Row Level Security

RLS enabled on `leads`.

| Role | Operation | Policy |
|------|-----------|--------|
| Anon / any | `INSERT` | Always allowed — public lead form requires no login |
| Admin | `SELECT`, `UPDATE`, `DELETE` | `EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())` |
| Authenticated visitor | `SELECT` | `submitted_by = auth.uid()` |

RLS enabled on `admins` — no public access.

---

## Auth Flows

### Admin
1. Navigates to `/admin`, sees email + password form
2. `supabase.auth.signInWithPassword({ email, password })`
3. Supabase returns JWT session — persisted automatically by the client
4. On app load, `supabase.auth.getSession()` restores session
5. All CRM queries authenticated via JWT in Supabase client headers

### Visitor
1. Opens sign-in modal, enters email
2. `supabase.auth.signInWithOtp({ email })` — Supabase sends 6-digit OTP email
3. Visitor enters code → `supabase.auth.verifyOtp({ email, token, type: 'email' })`
4. Supabase returns JWT session — stored in localStorage by the client
5. Modal step flow (1 → 2 → 3 success) unchanged visually

---

## Frontend Changes

### Files deleted
- `server.js`
- `db.js`
- `db.json`
- `db.test.js`
- `server.test.js`
- `public/mock-google-login.html` (if present)

### New file
- `src/supabase.js` — initialises and exports the Supabase client:
  ```js
  import { createClient } from '@supabase/supabase-js'
  export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )
  ```

### Modified files

**`src/components/VisitorAuthModal.jsx`**
- Remove Google sign-in button and `handleGoogleSignIn`
- Replace `POST /api/visitor/send-code` with `supabase.auth.signInWithOtp({ email })`
- Replace `POST /api/visitor/verify-code` with `supabase.auth.verifyOtp({ email, token, type: 'email' })`
- Step flow (1→2→3) unchanged visually

**`src/pages/AdminCRM.jsx`**
- Replace `POST /api/login` with `supabase.auth.signInWithPassword({ email, password })`
- Add email field to admin login form (currently password-only)
- Replace `GET /api/leads` with `supabase.from('leads').select('*').order('created_at', { ascending: false })`
- Replace `PATCH /api/leads/:id` with `supabase.from('leads').update({...}).eq('id', id)`
- Replace `DELETE /api/leads/:id` with `supabase.from('leads').delete().eq('id', id)`
- Replace `POST /api/leads` (create lead) with `supabase.from('leads').insert({...})`
- Remove `sessionStorage` token management — Supabase handles session persistence

**`src/App.jsx`**
- Replace `GET /api/visitor/me` with `supabase.auth.getSession()` + `supabase.auth.onAuthStateChange()`

### `package.json`
- Add `@supabase/supabase-js`
- Remove `resend`, `cors`, `express`, `dotenv`, `concurrently` from dependencies
- Change `"dev"` script from `concurrently "vite" "node server.js"` to just `"vite"`
- Change `"start"` script — no longer needed for Railway static hosting

---

## Environment Variables

### Remove from Railway
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

### Add to Railway (and `.env` locally)
- `VITE_SUPABASE_URL` — from Supabase project settings
- `VITE_SUPABASE_ANON_KEY` — from Supabase project settings

### Railway service configuration
- Build command: `npm run build`
- Publish directory: `dist`
- Service type: **Static Site** (not Node.js)

---

## Migration Steps (high level)

1. Create Supabase project
2. Run SQL migrations to create `leads` and `admins` tables with RLS
3. Create admin user in Supabase Auth dashboard, insert into `admins` table
4. Install `@supabase/supabase-js`, remove server dependencies
5. Add `src/supabase.js`
6. Update `VisitorAuthModal.jsx`, `AdminCRM.jsx`, `App.jsx`
7. Delete server files
8. Update `.env` and Railway variables
9. Reconfigure Railway as static site
10. Deploy and verify
