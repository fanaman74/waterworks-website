# Visitor Account Page Design

**Date:** 2026-06-14
**Project:** waterworks-website
**Goal:** After sign-in, visitors land on a `#account` page showing their profile (editable name/phone/address) and their full service request history with status badges.

---

## Architecture

A new `profiles` table in Supabase stores visitor contact details (one row per authenticated user). A new `src/pages/VisitorAccount.jsx` renders at route `#account`. After a successful sign-in, `App.jsx` navigates to `#account` automatically. The page guards itself — unauthenticated visitors navigating to `#account` are redirected to `#home`.

---

## Database

### `profiles` table

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | primary key, references `auth.users(id)` on delete cascade |
| `name` | `text` | nullable |
| `phone` | `text` | nullable |
| `address` | `text` | nullable |
| `updated_at` | `timestamptz` | default `now()` |

### RLS on `profiles`

| Operation | Policy |
|-----------|--------|
| `SELECT` | `id = auth.uid()` |
| `INSERT` | `id = auth.uid()` |
| `UPDATE` | `id = auth.uid()` |

### Auto-create profile trigger

A Supabase database function + trigger creates a blank profile row when a new user is inserted into `auth.users`:

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## Auth Flow Change

After `onAuthSuccess` is called in `VisitorAuthModal`, `App.jsx` navigates to `#account`:

```js
const handleVisitorAuthSuccess = (user) => {
  setVisitor(user);
  go('account');
};
```

---

## VisitorAccount Page

### Layout

Two sections:

1. **Profile** — email (read-only), name, phone, address (editable). "Edit" button toggles edit mode. "Save" calls `supabase.from('profiles').upsert({ id: user.id, name, phone, address, updated_at: new Date().toISOString() })`. "Sign Out" calls `supabase.auth.signOut()` then navigates to `#home`.

2. **Request History** — all `leads` rows where `submitted_by = auth.uid()`, ordered by `created_at desc`. Each entry shows:
   - Date (formatted)
   - Service type
   - Status badge (color-coded)
   - Message preview (first 100 chars)

### Status badge colors

| Status | Color |
|--------|-------|
| `New` | grey (`var(--muted)`) |
| `In Progress` | blue (`#3b82f6`) |
| `Completed` | green (`#22c55e`) |
| anything else | grey |

### Auth guard

On mount, `VisitorAccount` checks `supabase.auth.getSession()`. If no session, calls `go('home')` immediately.

### Data fetching

On mount (after auth check):
1. `supabase.from('profiles').select('*').eq('id', user.id).single()` — load profile
2. `supabase.from('leads').select('*').eq('submitted_by', user.id).order('created_at', { ascending: false })` — load history

Both fetched in parallel.

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/VisitorAccount.jsx` | Create — visitor account page |
| `src/App.jsx` | Add `#account` route, navigate after sign-in |
| Supabase SQL | Create `profiles` table + RLS + trigger |

---

## RLS on `leads` (existing table — verify)

Visitors already have `SELECT` on their own leads (`submitted_by = auth.uid()`). No change needed — confirm this policy exists.
