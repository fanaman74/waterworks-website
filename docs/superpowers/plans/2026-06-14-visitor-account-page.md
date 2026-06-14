# Visitor Account Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `#account` page that opens after sign-in, showing the visitor's editable profile (name, phone, address) and their full service request history with status badges.

**Architecture:** A new `profiles` table in Supabase stores visitor contact details, auto-created by a trigger on new user signup. `VisitorAccount.jsx` is a new page component at `#account` that fetches profile + leads in parallel. `App.jsx` gets a new route and navigates to `#account` on sign-in success.

**Tech Stack:** React 18, Vite, `@supabase/supabase-js`, existing CSS variables/classes.

---

## File Map

| File | Change |
|------|--------|
| Supabase SQL (via CLI) | Create `profiles` table + RLS + trigger + verify leads RLS |
| `src/pages/VisitorAccount.jsx` | Create — visitor account page |
| `src/App.jsx` | Add `#account` route + navigate after sign-in |

---

### Task 1: Create `profiles` table, RLS, and trigger in Supabase

**Files:**
- Supabase SQL via `supabase db query --linked`

- [ ] **Step 1: Create the profiles table and RLS**

Run this SQL against the linked Supabase project:

```bash
supabase db query --linked <<'SQL'
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  address text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());
SQL
```

Expected: no error output.

- [ ] **Step 2: Create the auto-create trigger**

```bash
supabase db query --linked <<'SQL'
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
SQL
```

Expected: no error output.

- [ ] **Step 3: Ensure leads RLS allows visitors to SELECT their own leads**

```bash
supabase db query --linked <<'SQL'
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'leads'
    and policyname = 'Visitors can view own leads'
  ) then
    create policy "Visitors can view own leads"
      on public.leads for select
      using (submitted_by = auth.uid());
  end if;
end $$;
SQL
```

Expected: no error output.

- [ ] **Step 4: Verify tables exist**

```bash
supabase db query --linked --query "select id, name, phone, address from public.profiles limit 1;"
```

Expected: returns column headers (empty result is fine — no rows yet).

- [ ] **Step 5: Backfill profiles for existing users**

```bash
supabase db query --linked <<'SQL'
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
SQL
```

Expected: no error output.

- [ ] **Step 6: Commit a note**

```bash
git commit --allow-empty -m "chore: profiles table + RLS + trigger applied to Supabase"
```

---

### Task 2: Create `src/pages/VisitorAccount.jsx`

**Files:**
- Create: `src/pages/VisitorAccount.jsx`

- [ ] **Step 1: Create the file**

Create `src/pages/VisitorAccount.jsx` with the following complete content:

```jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Eyebrow } from '../components/Shared';

function StatusBadge({ status }) {
  const colors = {
    'New': { bg: '#e5e7eb', color: '#6b7280' },
    'In Progress': { bg: '#dbeafe', color: '#2563eb' },
    'Completed': { bg: '#dcfce7', color: '#16a34a' },
  };
  const style = colors[status] || colors['New'];
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
      background: style.bg,
      color: style.color
    }}>
      {status || 'New'}
    </span>
  );
}

export default function VisitorAccount({ go }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ name: '', phone: '', address: '' });
  const [leads, setLeads] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        go('home');
        return;
      }
      const u = session.user;
      setUser(u);
      Promise.all([
        supabase.from('profiles').select('*').eq('id', u.id).single(),
        supabase.from('leads').select('*').eq('submitted_by', u.id).order('created_at', { ascending: false })
      ]).then(([profileRes, leadsRes]) => {
        if (profileRes.data) {
          setProfile(profileRes.data);
          setEditForm({
            name: profileRes.data.name || '',
            phone: profileRes.data.phone || '',
            address: profileRes.data.address || ''
          });
        }
        if (leadsRes.data) setLeads(leadsRes.data);
        setLoading(false);
      });
    });
  }, [go]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    go('home');
  };

  const handleEdit = () => {
    setEditForm({ name: profile.name || '', phone: profile.phone || '', address: profile.address || '' });
    setEditing(true);
    setSaveError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: editForm.name,
      phone: editForm.phone,
      address: editForm.address,
      updated_at: new Date().toISOString()
    });
    setSaving(false);
    if (error) {
      setSaveError(error.message);
    } else {
      setProfile(prev => ({ ...prev, ...editForm }));
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setSaveError('');
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 680, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Loading your account...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '60px auto', padding: '0 24px' }}>

      {/* Profile section */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 28, marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <Eyebrow>My Account</Eyebrow>
            <h2 style={{ marginTop: 4, fontSize: 22 }}>{profile.name || user?.email?.split('@')[0] || 'Visitor'}</h2>
          </div>
          <button className="btn" style={{ fontSize: 13 }} onClick={handleSignOut}>Sign Out</button>
        </div>

        {!editing ? (
          <div>
            <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
              <ProfileRow label="Email" value={user?.email} />
              <ProfileRow label="Name" value={profile.name} />
              <ProfileRow label="Phone" value={profile.phone} />
              <ProfileRow label="Address" value={profile.address} />
            </div>
            <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={handleEdit}>Edit Profile</button>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Email</label>
                <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Phone</label>
                <input type="tel" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="Your phone number" />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Address</label>
                <input type="text" value={editForm.address} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} placeholder="Your address" />
              </div>
            </div>
            {saveError && <p style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 12 }}>{saveError}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={saving} style={{ fontSize: 13 }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="btn" type="button" onClick={handleCancel} style={{ fontSize: 13 }}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Request history section */}
      <div>
        <h3 style={{ fontSize: 18, marginBottom: 16 }}>Service Request History</h3>
        {leads.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>No service requests yet. <button className="btn btn-ghost" style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, fontSize: 14 }} onClick={() => go('contact')}>Submit a request</button></p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {leads.map(lead => (
              <div key={lead.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <StatusBadge status={lead.status} />
                </div>
                {lead.service_type && (
                  <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{lead.service_type}</p>
                )}
                {lead.message && (
                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                    {lead.message.length > 120 ? lead.message.slice(0, 120) + '…' : lead.message}
                  </p>
                )}
                {lead.notes && (
                  <p style={{ fontSize: 12, color: 'var(--primary)', marginTop: 8, marginBottom: 0, fontStyle: 'italic' }}>
                    Note from us: {lead.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{ fontSize: 13, color: 'var(--muted)', minWidth: 70 }}>{label}</span>
      <span style={{ fontSize: 13 }}>{value || <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Not set</span>}</span>
    </div>
  );
}
```

- [ ] **Step 2: Verify the file was created**

```bash
ls src/pages/VisitorAccount.jsx
```

Expected: file exists.

- [ ] **Step 3: Run build to check for compile errors**

```bash
npm run build 2>&1 | tail -6
```

Expected: `✓ built in` with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/VisitorAccount.jsx
git commit -m "feat: add VisitorAccount page with profile and request history"
```

---

### Task 3: Wire `#account` route in `App.jsx` and navigate after sign-in

**Files:**
- Modify: `src/App.jsx`

The current `App.jsx` is at `/Users/fred/Documents/VibeCoding/antigravity/waterworks-website/src/App.jsx`. Read it before editing.

- [ ] **Step 1: Add the import for VisitorAccount**

Find this line near the top of `src/App.jsx`:
```js
import AdminCRM from './pages/AdminCRM';
```

Add after it:
```js
import VisitorAccount from './pages/VisitorAccount';
```

- [ ] **Step 2: Add the `#account` route**

Find this block in the page routing section:
```js
  else if (base === "admin") page = <AdminCRM lang={lang} go={go} />;
  else page = <Home lang={lang} go={go} hero={t_.hero} />;
```

Replace with:
```js
  else if (base === "admin") page = <AdminCRM lang={lang} go={go} />;
  else if (base === "account") page = <VisitorAccount go={go} />;
  else page = <Home lang={lang} go={go} hero={t_.hero} />;
```

- [ ] **Step 3: Navigate to `#account` after sign-in**

Find:
```js
  const handleVisitorAuthSuccess = (user) => {
    setVisitor(user);
  };
```

Replace with:
```js
  const handleVisitorAuthSuccess = (user) => {
    setVisitor(user);
    go('account');
  };
```

- [ ] **Step 4: Run build to verify no errors**

```bash
npm run build 2>&1 | tail -6
```

Expected: `✓ built in` with no errors.

- [ ] **Step 5: Manually verify the flow**

```bash
npm run dev
```

1. Open `http://localhost:5173`
2. Click Sign In, enter credentials, sign in
3. Confirm browser navigates to `#account`
4. Confirm profile section shows email
5. Click "Edit Profile", update name, save — confirm name updates
6. Confirm "Service Request History" section shows (empty or with leads)
7. Navigate away (e.g., `#home`), then manually go to `#account` while signed in — confirm page loads
8. Sign out — confirm redirects to `#home`
9. Manually navigate to `http://localhost:5173/#account` while signed out — confirm redirects to `#home`

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire #account route and navigate to account page after sign-in"
```

- [ ] **Step 7: Push**

```bash
git push origin main
```

---

## Self-Review

**Spec coverage:**
- ✅ `profiles` table with `id`, `name`, `phone`, `address`, `updated_at` — Task 1 Step 1
- ✅ RLS: SELECT/INSERT/UPDATE own row — Task 1 Step 1
- ✅ Auto-create trigger on `auth.users` insert — Task 1 Step 2
- ✅ Backfill existing users — Task 1 Step 5
- ✅ Leads RLS for visitors — Task 1 Step 3
- ✅ `VisitorAccount.jsx` — Task 2
- ✅ Profile section: email (read-only), name/phone/address (editable) — Task 2 Step 1
- ✅ Upsert on save — Task 2 Step 1 (`handleSave`)
- ✅ Request history: date, service type, status badge, message preview, notes — Task 2 Step 1
- ✅ Status badge colors (New=grey, In Progress=blue, Completed=green) — Task 2 Step 1 (`StatusBadge`)
- ✅ Auth guard: redirect to `#home` if no session — Task 2 Step 1 (`useEffect`)
- ✅ Sign Out button — Task 2 Step 1 (`handleSignOut`)
- ✅ `#account` route in `App.jsx` — Task 3 Step 2
- ✅ Navigate to `#account` after sign-in — Task 3 Step 3

**Placeholder scan:** None found.

**Type consistency:** `profile` object keys (`name`, `phone`, `address`) match `editForm` keys and the Supabase upsert payload throughout.
