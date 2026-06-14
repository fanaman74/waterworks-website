# Supabase Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Express + db.json + Resend with Supabase (DB + Auth), making the React frontend talk directly to Supabase and Railway serve static files only.

**Architecture:** The Supabase JS client is initialised once in `src/supabase.js` and imported wherever DB or auth is needed. All `/api/...` fetch calls are replaced with Supabase client calls. Railway is reconfigured as a static site — no Node.js process.

**Tech Stack:** `@supabase/supabase-js`, Vite, React 18, Railway static hosting

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/supabase.js` | Supabase client singleton |
| Modify | `src/App.jsx` | Session via Supabase Auth |
| Modify | `src/components/VisitorAuthModal.jsx` | OTP via Supabase |
| Modify | `src/pages/AdminCRM.jsx` | All DB + auth via Supabase |
| Modify | `src/pages/InnerPages.jsx` | Lead insert via Supabase |
| Modify | `package.json` | Add/remove deps, update scripts |
| Delete | `server.js`, `db.js`, `db.json`, `db.test.js`, `server.test.js` | No longer needed |
| Delete | `public/mock-google-login.html` | Replaced by Supabase OTP |

---

## Task 1: Supabase Project + Database Setup

**Files:** None (Supabase dashboard + SQL editor)

- [ ] **Step 1: Create Supabase project**

  Go to https://supabase.com/dashboard → New project.
  Name: `waterworks`, region: closest to Railway deployment (EU West).
  Save the database password somewhere safe.

- [ ] **Step 2: Run SQL migration**

  In Supabase dashboard → SQL Editor → New query. Paste and run:

  ```sql
  -- Leads table
  create table leads (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz default now(),
    name text not null,
    email text not null,
    phone text,
    address text,
    message text,
    service_type text,
    status text default 'New',
    notes text default '',
    submitted_by uuid references auth.users(id)
  );

  -- Admins table
  create table admins (
    user_id uuid primary key references auth.users(id)
  );

  -- Enable RLS
  alter table leads enable row level security;
  alter table admins enable row level security;

  -- Anyone (logged in or not) can insert a lead
  create policy "Public insert"
    on leads for insert
    to anon, authenticated
    with check (true);

  -- Admins can read all leads
  create policy "Admins select"
    on leads for select
    to authenticated
    using (exists (select 1 from admins where user_id = auth.uid()));

  -- Admins can update leads
  create policy "Admins update"
    on leads for update
    to authenticated
    using (exists (select 1 from admins where user_id = auth.uid()));

  -- Admins can delete leads
  create policy "Admins delete"
    on leads for delete
    to authenticated
    using (exists (select 1 from admins where user_id = auth.uid()));

  -- Visitors can read their own leads
  create policy "Visitor own leads"
    on leads for select
    to authenticated
    using (submitted_by = auth.uid());

  -- Admins table: only own row
  create policy "Admins own row"
    on admins for all
    to authenticated
    using (user_id = auth.uid());
  ```

- [ ] **Step 3: Create admin user**

  Supabase dashboard → Authentication → Users → Add user.
  Email: `wayne@waterworksbe.net`, set a strong password.
  Copy the UUID shown for that user.

- [ ] **Step 4: Insert admin row**

  Back in SQL Editor, replace `<uuid>` with the UUID from Step 3:

  ```sql
  insert into admins (user_id) values ('<uuid>');
  ```

- [ ] **Step 5: Copy credentials**

  Supabase dashboard → Project Settings → API.
  Copy:
  - **Project URL** (e.g. `https://xxxx.supabase.co`)
  - **anon public** key

  Keep these — needed in Task 2.

- [ ] **Step 6: Configure Supabase email OTP**

  Supabase dashboard → Authentication → Email Templates.
  The default OTP template is fine. No changes needed.

  Supabase dashboard → Authentication → Providers → Email.
  Confirm "Enable Email Provider" is on and "Confirm email" is off (so visitors can sign in immediately without confirming).

---

## Task 2: Dependencies + Scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Supabase client**

  ```bash
  npm install @supabase/supabase-js
  ```

- [ ] **Step 2: Remove server dependencies**

  ```bash
  npm remove express cors dotenv resend concurrently
  ```

- [ ] **Step 3: Update package.json scripts**

  Open `package.json`. Replace the `scripts` section with:

  ```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  ```

- [ ] **Step 4: Create local env file**

  Create `.env.local` in the project root (this file is already gitignored by Vite):

  ```
  VITE_SUPABASE_URL=https://xxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJ...
  ```

  Replace with the values copied in Task 1 Step 5.

- [ ] **Step 5: Commit**

  ```bash
  git add package.json package-lock.json
  git commit -m "chore: replace server deps with supabase-js"
  ```

---

## Task 3: Create Supabase Client

**Files:**
- Create: `src/supabase.js`

- [ ] **Step 1: Create the file**

  ```js
  import { createClient } from '@supabase/supabase-js'

  export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )
  ```

- [ ] **Step 2: Verify dev server starts**

  ```bash
  npm run dev
  ```

  Expected: Vite starts on `http://localhost:5173` with no errors. No Express server needed.

- [ ] **Step 3: Commit**

  ```bash
  git add src/supabase.js
  git commit -m "feat: add Supabase client singleton"
  ```

---

## Task 4: Update Contact Form (Public Lead Insert)

**Files:**
- Modify: `src/pages/InnerPages.jsx`

- [ ] **Step 1: Add import at top of InnerPages.jsx**

  Find the first import line. Add after it:

  ```js
  import { supabase } from '../supabase';
  ```

- [ ] **Step 2: Replace the submit function**

  Find this block in the `Contact` component (around line 260):

  ```js
  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = true;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = true;
    setErrors(errs);
    
    if (Object.keys(errs).length === 0) {
      const serviceType = C.types[type] ? L(C.types[type]) : 'General';
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, serviceType })
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to submit');
        return res.json();
      })
      .then(() => setSent(true))
      .catch(err => {
        console.error(err);
        alert('Could not send message. Please try again or call directly.');
      });
    }
  };
  ```

  Replace with:

  ```js
  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = true;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = true;
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      const service_type = C.types[type] ? L(C.types[type]) : 'General';
      const { error } = await supabase.from('leads').insert({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        message: form.message,
        service_type
      });
      if (error) {
        console.error(error);
        alert('Could not send message. Please try again or call directly.');
      } else {
        setSent(true);
      }
    }
  };
  ```

- [ ] **Step 3: Test in browser**

  Open `http://localhost:5173/#contact`. Fill in the contact form with a test name and email. Submit.
  Expected: Success state shown. Check Supabase dashboard → Table Editor → leads — the row should appear.

- [ ] **Step 4: Commit**

  ```bash
  git add src/pages/InnerPages.jsx
  git commit -m "feat: submit contact form leads to Supabase"
  ```

---

## Task 5: Update Visitor Auth Modal

**Files:**
- Modify: `src/components/VisitorAuthModal.jsx`

- [ ] **Step 1: Replace entire file content**

  ```jsx
  import React, { useState, useEffect, useRef } from 'react';
  import { Icon } from './Icons';
  import { Eyebrow } from './Shared';
  import { supabase } from '../supabase';

  export default function VisitorAuthModal({ isOpen, onClose, onAuthSuccess }) {
    const dialogRef = useRef(null);
    const [step, setStep] = useState(1);
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

    const handleBackdropClick = (e) => {
      if (e.target === dialogRef.current) onClose();
    };

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
        setMessage('Verification code sent! Please check your email.');
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

          {step === 1 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Eyebrow>Welcome to WaterWorks</Eyebrow>
                <h3 style={{ marginTop: 8, fontSize: 24 }}>Sign In / Sign Up</h3>
              </div>
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
              <p style={{ color: 'var(--muted)', marginTop: 8 }}>Welcome back to WaterWorks!</p>
            </div>
          )}
        </div>
      </dialog>
    );
  }
  ```

- [ ] **Step 2: Test in browser**

  Open `http://localhost:5173`. Click the sign-in button. Enter a real email. Click "Send Magic Verification Code".
  Expected: Step 2 appears. Check your inbox for a 6-digit code from Supabase. Enter it. Step 3 success state appears.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/VisitorAuthModal.jsx
  git commit -m "feat: replace Resend OTP with Supabase Auth OTP in visitor modal"
  ```

---

## Task 6: Update App.jsx Session Management

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace entire App.jsx**

  ```jsx
  import React, { useState, useEffect } from 'react';
  import { Header, Footer, useReveal } from './components/Shared';
  import { applyTheme } from './theme';
  import Home from './pages/Home';
  import { Services, Work, WorkDetail, Press, Training, Links, Contact } from './pages/InnerPages';
  import AdminCRM from './pages/AdminCRM';
  import VisitorAuthModal from './components/VisitorAuthModal';
  import { supabase } from './supabase';

  const TWEAK_DEFAULTS = {
    theme: "tide",
    font: "modern",
    hero: "split"
  };

  function parseRoute() {
    const h = (window.location.hash || "#home").replace(/^#\/?/, "");
    return h || "home";
  }

  export default function App() {
    const t_ = TWEAK_DEFAULTS;
    const [route, setRoute] = useState(parseRoute());

    const lang0 = (typeof localStorage !== "undefined" && localStorage.getItem("ww-lang")) || "en";
    const [lang, setLangState] = useState(lang0);

    const [visitor, setVisitor] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const setLang = (lg) => {
      setLangState(lg);
      try { localStorage.setItem("ww-lang", lg); } catch (e) {}
    };

    useEffect(() => {
      applyTheme(t_.theme, t_.font);
    }, [t_.theme, t_.font]);

    useEffect(() => {
      const onHash = () => setRoute(parseRoute());
      window.addEventListener("hashchange", onHash);
      return () => window.removeEventListener("hashchange", onHash);
    }, []);

    // Restore visitor session from Supabase on load
    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u = session.user;
          setVisitor({ email: u.email, name: u.email.split('@')[0], provider: 'email' });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u = session.user;
          setVisitor({ email: u.email, name: u.email.split('@')[0], provider: 'email' });
        } else {
          setVisitor(null);
        }
      });

      return () => subscription.unsubscribe();
    }, []);

    const handleVisitorAuthSuccess = (user) => {
      setVisitor(user);
    };

    const handleVisitorLogout = async () => {
      await supabase.auth.signOut();
      setVisitor(null);
    };

    const go = (r) => {
      window.location.hash = "#" + r;
      setRoute(r);
      window.scrollTo({ top: 0, behavior: "auto" });
    };

    useReveal(route + ":" + t_.hero + ":" + lang);

    const base = route.split("/")[0];
    let page;

    if (base === "services") page = <Services lang={lang} go={go} />;
    else if (base === "work" && route.includes("/")) page = <WorkDetail lang={lang} go={go} id={route.split("/")[1]} />;
    else if (base === "work") page = <Work lang={lang} go={go} />;
    else if (base === "press") page = <Press lang={lang} go={go} />;
    else if (base === "training") page = <Training lang={lang} go={go} />;
    else if (base === "links") page = <Links lang={lang} go={go} />;
    else if (base === "contact") page = <Contact lang={lang} go={go} />;
    else if (base === "admin") page = <AdminCRM lang={lang} go={go} />;
    else page = <Home lang={lang} go={go} hero={t_.hero} />;

    return (
      <div className="app">
        <Header
          lang={lang}
          setLang={setLang}
          route={base}
          go={go}
          visitor={visitor}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleVisitorLogout}
        />
        <main style={{ flex: 1 }}>{page}</main>
        <Footer lang={lang} go={go} />
        <VisitorAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleVisitorAuthSuccess}
        />
        <div className="floating-lang">
          {["en", "fr", "nl"].map((lg) => (
            <button key={lg} className={lang === lg ? "on" : ""} onClick={() => setLang(lg)}>{lg.toUpperCase()}</button>
          ))}
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Test session persistence**

  Sign in via the visitor modal. Refresh the page.
  Expected: Still shown as signed in (Supabase persists the session in localStorage automatically).

- [ ] **Step 3: Commit**

  ```bash
  git add src/App.jsx
  git commit -m "feat: manage visitor session via Supabase Auth"
  ```

---

## Task 7: Update AdminCRM

**Files:**
- Modify: `src/pages/AdminCRM.jsx`

Note: Supabase uses `created_at` (not `date`) and `service_type` (not `serviceType`).

- [ ] **Step 1: Replace entire AdminCRM.jsx**

  ```jsx
  import React, { useState, useEffect } from 'react';
  import { Icon } from '../components/Icons';
  import { Eyebrow } from '../components/Shared';
  import { supabase } from '../supabase';

  const STATUSES = ['New', 'Contacted', 'Quote Sent', 'Scheduled', 'Completed'];

  export default function AdminCRM({ lang }) {
    const [session, setSession] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [leads, setLeads] = useState([]);
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [noteText, setNoteText] = useState('');
    const [saveStatus, setSaveStatus] = useState('');

    const [isCreatingLead, setIsCreatingLead] = useState(false);
    const [newLeadForm, setNewLeadForm] = useState({
      name: '', email: '', phone: '', address: '',
      message: '', service_type: 'Repairs', status: 'New', notes: ''
    });
    const [newLeadErrors, setNewLeadErrors] = useState({});

    // Restore admin session on load
    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        setSession(s);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
        setSession(s);
      });
      return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
      if (session) fetchLeads();
    }, [session]);

    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error(error);
        return;
      }
      setLeads(data);
      if (data.length > 0 && !selectedLeadId) {
        setSelectedLeadId(data[0].id);
        setNoteText(data[0].notes || '');
      }
    };

    const handleLogin = async (e) => {
      e.preventDefault();
      setLoginError('');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setLoginError(error.message);
    };

    const handleLogout = async () => {
      await supabase.auth.signOut();
      setSession(null);
      setLeads([]);
      setSelectedLeadId(null);
    };

    const handleUpdateStatus = async (id, newStatus) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();
      if (!error) setLeads(leads.map(l => l.id === id ? data : l));
    };

    const handleSaveNotes = async (id) => {
      setSaveStatus('Saving...');
      const { data, error } = await supabase
        .from('leads')
        .update({ notes: noteText })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        setSaveStatus('Error');
        console.error(error);
      } else {
        setLeads(leads.map(l => l.id === id ? data : l));
        setSaveStatus('Saved!');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    };

    const handleDeleteLead = async (id) => {
      if (!confirm('Are you sure you want to permanently delete this lead?')) return;
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (!error) {
        const remaining = leads.filter(l => l.id !== id);
        setLeads(remaining);
        if (remaining.length > 0) {
          setSelectedLeadId(remaining[0].id);
          setNoteText(remaining[0].notes || '');
        } else {
          setSelectedLeadId(null);
          setNoteText('');
        }
      }
    };

    const handleCreateLeadSubmit = async (e) => {
      e.preventDefault();
      const errs = {};
      if (!newLeadForm.name.trim()) errs.name = true;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newLeadForm.email)) errs.email = true;
      setNewLeadErrors(errs);
      if (Object.keys(errs).length > 0) return;

      const { data, error } = await supabase
        .from('leads')
        .insert(newLeadForm)
        .select()
        .single();
      if (error) {
        console.error(error);
        alert('Failed to save the new lead. Please try again.');
      } else {
        await fetchLeads();
        setIsCreatingLead(false);
        setSelectedLeadId(data.id);
        setNoteText(data.notes || '');
        setNewLeadForm({ name: '', email: '', phone: '', address: '', message: '', service_type: 'Repairs', status: 'New', notes: '' });
      }
    };

    const selectedLead = leads.find(l => l.id === selectedLeadId);

    const filteredLeads = leads.filter(lead => {
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      const term = searchQuery.toLowerCase();
      const matchesSearch =
        lead.name.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term) ||
        (lead.phone && lead.phone.toLowerCase().includes(term)) ||
        (lead.address && lead.address.toLowerCase().includes(term)) ||
        (lead.message && lead.message.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });

    if (!session) {
      return (
        <section className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="form-card" style={{ maxWidth: 400, width: '100%', padding: 40, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Eyebrow>Waterworks CRM</Eyebrow>
              <h2 style={{ marginTop: 8 }}>Admin Sign In</h2>
            </div>
            <form onSubmit={handleLogin}>
              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  style={loginError ? { borderColor: 'var(--accent)' } : {}}
                  required
                />
                {loginError && <p style={{ color: 'var(--accent)', fontSize: 13, marginTop: 6 }}>{loginError}</p>}
              </div>
              <button className="btn btn-accent btn-lg" type="submit" style={{ width: '100%', marginTop: 16 }}>
                Log In <Icon name="arrow" size={18} />
              </button>
            </form>
          </div>
        </section>
      );
    }

    return (
      <section className="section" style={{ background: 'var(--surface-2)', minHeight: '90vh' }}>
        <div className="wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
            <div>
              <Eyebrow>Control Room</Eyebrow>
              <h1 className="hl" style={{ fontSize: 'clamp(28px, 4vw, 42px)', margin: '8px 0 0' }}>Waterworks Leads CRM</h1>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn-accent"
                onClick={() => { setIsCreatingLead(true); setSelectedLeadId(null); }}
                style={{ padding: '10px 20px', fontSize: 14.5 }}
              >
                + Add Lead
              </button>
              <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '10px 20px', fontSize: 14.5 }}>
                Logout <Icon name="arrow" size={16} style={{ marginLeft: 8 }} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center', background: 'var(--bg)', padding: 16, borderRadius: 12, border: '1px solid var(--line)' }}>
            <div style={{ flex: 1, minWidth: 260, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)' }}>
              <Icon name="search" size={18} style={{ color: 'var(--muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, phone, details..."
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 15 }}
              />
            </div>
            <div className="type-chips" style={{ margin: 0 }}>
              {['All', ...STATUSES].map(status => {
                const count = status === 'All' ? leads.length : leads.filter(l => l.status === status).length;
                return (
                  <button
                    key={status}
                    type="button"
                    className={'type-chip' + (statusFilter === status ? ' on' : '')}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {leads.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h3>No leads captured yet</h3>
              <p style={{ color: 'var(--muted)' }}>Leads submitted via the contact form will appear here.</p>
            </div>
          ) : (
            <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 1.8fr', gap: 24, alignItems: 'start' }}>
              <div style={{ maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 6px' }}>
                {filteredLeads.map(lead => {
                  const isActive = lead.id === selectedLeadId;
                  const dateStr = new Date(lead.created_at).toLocaleDateString(
                    lang === 'fr' ? 'fr-BE' : lang === 'nl' ? 'nl-BE' : 'en-GB',
                    { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
                  );
                  return (
                    <div
                      key={lead.id}
                      onClick={() => { setIsCreatingLead(false); setSelectedLeadId(lead.id); setNoteText(lead.notes || ''); }}
                      className="card"
                      style={{
                        cursor: 'pointer', padding: 16, margin: 0,
                        border: isActive ? '2px solid var(--primary)' : '1px solid var(--line)',
                        background: isActive ? 'color-mix(in srgb, var(--primary) 6%, var(--bg))' : 'var(--bg)',
                        transform: isActive ? 'translateY(-2px)' : undefined,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <h4 style={{ margin: 0, fontSize: 16.5 }}>{lead.name}</h4>
                        <span style={{
                          fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase',
                          padding: '3px 8px', borderRadius: 20, letterSpacing: '.05em',
                          background: lead.status === 'New' ? 'rgba(235, 87, 87, 0.15)' :
                                      lead.status === 'Contacted' ? 'rgba(47, 128, 237, 0.15)' :
                                      lead.status === 'Quote Sent' ? 'rgba(155, 81, 224, 0.15)' :
                                      lead.status === 'Scheduled' ? 'rgba(242, 201, 76, 0.15)' : 'rgba(39, 174, 96, 0.15)',
                          color: lead.status === 'New' ? '#eb5757' :
                                 lead.status === 'Contacted' ? '#2f80ed' :
                                 lead.status === 'Quote Sent' ? '#9b51e0' :
                                 lead.status === 'Scheduled' ? '#e2a300' : '#27ae60'
                        }}>
                          {lead.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--muted)' }}>
                        <span>{lead.service_type || 'Plumbing'}</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  );
                })}
                {filteredLeads.length === 0 && (
                  <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                    <p style={{ color: 'var(--muted)', margin: 0 }}>No matching leads found</p>
                  </div>
                )}
              </div>

              <div>
                {isCreatingLead ? (
                  <div className="card" style={{ padding: 32, margin: 0, background: 'var(--bg)', border: '1px solid var(--line)' }}>
                    <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: 16, marginBottom: 20 }}>
                      <Eyebrow>New Lead Registration</Eyebrow>
                      <h2 style={{ marginTop: 6, fontSize: 28 }}>Add New Client</h2>
                    </div>
                    <form onSubmit={handleCreateLeadSubmit}>
                      <div className="field-row">
                        <div className="field">
                          <label>Client Name *</label>
                          <input type="text" value={newLeadForm.name}
                            onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                            style={newLeadErrors.name ? { borderColor: 'var(--accent)' } : {}}
                            placeholder="Wayne Pettit" required />
                        </div>
                        <div className="field">
                          <label>Email Address *</label>
                          <input type="email" value={newLeadForm.email}
                            onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                            style={newLeadErrors.email ? { borderColor: 'var(--accent)' } : {}}
                            placeholder="client@example.com" required />
                        </div>
                      </div>
                      <div className="field-row">
                        <div className="field">
                          <label>Phone Number</label>
                          <input type="text" value={newLeadForm.phone}
                            onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                            placeholder="+32 ..." />
                        </div>
                        <div className="field">
                          <label>Property Address</label>
                          <input type="text" value={newLeadForm.address}
                            onChange={(e) => setNewLeadForm({ ...newLeadForm, address: e.target.value })}
                            placeholder="1050 Ixelles" />
                        </div>
                      </div>
                      <div className="field-row">
                        <div className="field">
                          <label>Service / Job Type</label>
                          <select value={newLeadForm.service_type}
                            onChange={(e) => setNewLeadForm({ ...newLeadForm, service_type: e.target.value })}
                            style={{ background: 'var(--surface-2)', border: '1.5px solid var(--line)' }}>
                            <option value="Renovation">Renovation</option>
                            <option value="Repairs">Repairs</option>
                            <option value="Boiler">Boiler</option>
                            <option value="Eco">Eco / Sustainability</option>
                            <option value="General">General Plumbing</option>
                          </select>
                        </div>
                        <div className="field">
                          <label>Initial Status</label>
                          <select value={newLeadForm.status}
                            onChange={(e) => setNewLeadForm({ ...newLeadForm, status: e.target.value })}
                            style={{ background: 'var(--surface-2)', border: '1.5px solid var(--line)' }}>
                            {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="field">
                        <label>Job Description / Message</label>
                        <textarea value={newLeadForm.message}
                          onChange={(e) => setNewLeadForm({ ...newLeadForm, message: e.target.value })}
                          placeholder="Details of the quote request or plumbing issues..."
                          style={{ minHeight: 90 }} />
                      </div>
                      <div className="field" style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
                        <label>Internal Plumber Notes</label>
                        <textarea value={newLeadForm.notes}
                          onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                          placeholder="Measurements, price estimates, scheduling preferences..."
                          style={{ minHeight: 90 }} />
                      </div>
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                        <button type="button" className="btn btn-ghost"
                          onClick={() => { setIsCreatingLead(false); if (leads.length > 0) { setSelectedLeadId(leads[0].id); setNoteText(leads[0].notes || ''); } }}>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-accent">Save Lead Request</button>
                      </div>
                    </form>
                  </div>
                ) : selectedLead ? (
                  <div className="card" style={{ padding: 32, margin: 0, background: 'var(--bg)', border: '1px solid var(--line)' }}>
                    <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: 20, marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <Eyebrow>{selectedLead.service_type || 'Request Details'}</Eyebrow>
                          <h2 style={{ marginTop: 6, fontSize: 28 }}>{selectedLead.name}</h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <label style={{ fontSize: 14, fontWeight: 'bold' }}>Status:</label>
                          <select value={selectedLead.status}
                            onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)', fontSize: 14.5, fontWeight: 'bold', outline: 'none' }}>
                            {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
                      <div>
                        <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)' }}>Email Address</span>
                        <p style={{ margin: '4px 0 0', fontWeight: 500 }}>
                          <a href={`mailto:${selectedLead.email}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{selectedLead.email}</a>
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)' }}>Phone Number</span>
                        <p style={{ margin: '4px 0 0', fontWeight: 500 }}>
                          {selectedLead.phone
                            ? <a href={`tel:${selectedLead.phone}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{selectedLead.phone}</a>
                            : 'Not provided'}
                        </p>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)' }}>Property Address</span>
                        <p style={{ margin: '4px 0 0', fontWeight: 500 }}>{selectedLead.address || 'Not provided'}</p>
                      </div>
                    </div>

                    <div style={{ marginBottom: 28 }}>
                      <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)' }}>Client Message</span>
                      <div style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 8, border: '1px solid var(--line)', marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                        {selectedLead.message || 'No description provided.'}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20, marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <label style={{ fontSize: 14.5, fontWeight: 'bold' }}>Internal Plumber Notes</label>
                        {saveStatus && <span style={{ fontSize: 13, color: saveStatus === 'Error' ? 'var(--accent)' : 'var(--muted)' }}>{saveStatus}</span>}
                      </div>
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Write down measurements, estimated pricing, or notes from phone conversations here..."
                        style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontSize: 14.5, lineHeight: 1.4 }}
                      />
                      <button className="btn btn-accent btn-sm" style={{ marginTop: 10 }}
                        onClick={() => handleSaveNotes(selectedLead.id)}>
                        Save Notes
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: 20 }}>
                      <button
                        className="btn"
                        style={{ background: 'rgba(235, 87, 87, 0.1)', color: '#eb5757', border: '1px solid rgba(235, 87, 87, 0.2)' }}
                        onClick={() => handleDeleteLead(selectedLead.id)}
                      >
                        Delete Lead Request
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                    <p style={{ color: 'var(--muted)' }}>Select a lead from the list to view full details.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }
  ```

- [ ] **Step 2: Test admin login in browser**

  Open `http://localhost:5173/#admin`. Enter the admin email and password created in Task 1 Step 3.
  Expected: CRM loads and shows the leads list (empty or with test data from Task 4).

- [ ] **Step 3: Test admin operations**

  - Change a lead's status → confirm it updates in Supabase Table Editor
  - Edit notes and click Save Notes → confirm persisted
  - Add a new lead via "+ Add Lead" → confirm it appears in the list
  - Delete a lead → confirm removed

- [ ] **Step 4: Commit**

  ```bash
  git add src/pages/AdminCRM.jsx
  git commit -m "feat: replace Express API calls with Supabase client in AdminCRM"
  ```

---

## Task 8: Delete Server Files

**Files:** server.js, db.js, db.json, db.test.js, server.test.js, public/mock-google-login.html

- [ ] **Step 1: Delete files**

  ```bash
  git rm server.js db.js db.json db.test.js server.test.js
  git rm public/mock-google-login.html 2>/dev/null || true
  ```

- [ ] **Step 2: Verify build still works**

  ```bash
  npm run build
  ```

  Expected: Build completes with no errors. Output in `dist/`.

- [ ] **Step 3: Commit**

  ```bash
  git commit -m "chore: remove Express server, db.json, and mock Google login"
  ```

---

## Task 9: Configure Railway + Deploy

**Files:** Railway dashboard (no code changes)

- [ ] **Step 1: Add Supabase env vars to Railway**

  Railway dashboard → waterworks-website service → Variables.
  Add:
  - `VITE_SUPABASE_URL` = your Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

  Remove (if present):
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`

- [ ] **Step 2: Reconfigure Railway service as static site**

  Railway dashboard → waterworks-website service → Settings.
  - Build command: `npm run build`
  - Start command: *(leave empty — static sites don't need one)*
  - Output/publish directory: `dist`

  If Railway doesn't have a "static site" option, set start command to:
  ```
  npx serve dist -s -l $PORT
  ```
  And add `serve` as a dep: `npm install --save-dev serve` then commit.

- [ ] **Step 3: Push and deploy**

  ```bash
  git push
  ```

  Watch Railway deploy logs — expect `npm run build` to run successfully.

- [ ] **Step 4: Verify live site**

  Open the Railway URL.
  - Submit the contact form → check Supabase Table Editor for the new lead row
  - Click Sign In → enter email → receive Supabase OTP email → verify code → signed in
  - Navigate to `/#admin` → log in with admin email+password → leads CRM loads
  - Update a lead status, save notes → confirm changes persist after page refresh
