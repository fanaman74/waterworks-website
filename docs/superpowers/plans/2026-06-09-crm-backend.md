# Waterworks CRM Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a secure Node/Express server and JSON database for quote request leads, alongside a password-protected admin dashboard under `#admin` in the React frontend.

**Architecture:** The client-side Contact form sends quote submissions to the Express backend via REST API. Wayne logs in at `#admin` to get a session token, allowing him to access, filter, search, annotate, and manage leads stored in `db.json`.

**Tech Stack:** React 18, Vite 5, Node.js v26, Express, Concurrently.

---

### Task 1: Setup Dependencies & Dev Proxy

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`
- Test: Terminal commands for package installation

- [ ] **Step 1: Modify package.json**
  Update `package.json` to include dependencies (`express`, `cors`), devDependencies (`concurrently`), and updated run scripts.
  ```json
  {
    "name": "waterworks-website",
    "version": "1.0.0",
    "private": true,
    "type": "module",
    "scripts": {
      "dev": "concurrently \"vite\" \"node server.js\"",
      "build": "vite build",
      "preview": "vite preview",
      "server": "node server.js",
      "test": "node --test"
    },
    "dependencies": {
      "cors": "^2.8.5",
      "express": "^4.19.2",
      "react": "^18.3.1",
      "react-dom": "^18.3.1"
    },
    "devDependencies": {
      "@types/react": "^18.3.3",
      "@types/react-dom": "^18.3.0",
      "@vitejs/plugin-react": "^4.3.0",
      "concurrently": "^8.2.2",
      "vite": "^5.2.11"
    }
  }
  ```

- [ ] **Step 2: Modify vite.config.js**
  Add proxy setup to forward `/api` requests from Vite's server to the Express server running on port 3001.
  ```javascript
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'

  export default defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }
      }
    }
  })
  ```

- [ ] **Step 3: Run package installation**
  Run: `npm install`
  Expected: Packages installed successfully, `package-lock.json` updated.

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add package.json package-lock.json vite.config.js
  git commit -m "chore: configure dependencies and vite dev proxy for backend"
  ```

---

### Task 2: Implement Database Manager

**Files:**
- Create: `db.json`
- Create: `db.js`
- Create: `db.test.js`

- [ ] **Step 1: Create db.json with mock data**
  Create `db.json` initialized with sample leads.
  ```json
  {
    "leads": [
      {
        "id": "lead-1",
        "name": "Sarah Connor",
        "email": "sarah@connor.com",
        "phone": "+32 499 12 34 56",
        "address": "Rue de Namur 42, 1000 Bruxelles",
        "message": "Need an estimate for a rainwater recuperation system installation in my garden.",
        "serviceType": "Renovation",
        "date": "2026-06-08T10:00:00.000Z",
        "status": "New",
        "notes": "Spoke to her on phone. Garden access is good."
      },
      {
        "id": "lead-2",
        "name": "Jean Dupont",
        "email": "jean.dupont@skynet.be",
        "phone": "+32 2 555 12 34",
        "address": "Avenue Louise 250, 1050 Ixelles",
        "message": "Dripping tap in the main bathroom and low hot water pressure in the kitchen.",
        "serviceType": "Repairs",
        "date": "2026-06-07T14:30:00.000Z",
        "status": "Contacted",
        "notes": "Sent SMS to schedule a visit next Tuesday morning."
      }
    ]
  }
  ```

- [ ] **Step 2: Create db.js helper**
  Create `db.js` to manage reading and writing to the JSON file safely.
  ```javascript
  import fs from 'fs/promises';
  import path from 'path';

  const DB_PATH = path.resolve('db.json');

  export async function readDB() {
    try {
      const data = await fs.readFile(DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return { leads: [] };
    }
  }

  export async function writeDB(data) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  }

  export async function addLead(lead) {
    const db = await readDB();
    const newLead = {
      id: 'lead-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      status: 'New',
      notes: '',
      ...lead
    };
    db.leads.push(newLead);
    await writeDB(db);
    return newLead;
  }

  export async function updateLead(id, updates) {
    const db = await readDB();
    const index = db.leads.findIndex(l => l.id === id);
    if (index === -1) return null;
    db.leads[index] = { ...db.leads[index], ...updates };
    await writeDB(db);
    return db.leads[index];
  }

  export async function deleteLead(id) {
    const db = await readDB();
    const index = db.leads.findIndex(l => l.id === id);
    if (index === -1) return false;
    db.leads.splice(index, 1);
    await writeDB(db);
    return true;
  }
  ```

- [ ] **Step 3: Write db.test.js**
  Write tests for the database operations using Node's native runner.
  ```javascript
  import test from 'node:test';
  import assert from 'node:assert';
  import fs from 'fs/promises';
  import { readDB, writeDB, addLead, updateLead, deleteLead } from './db.js';

  test('Database Operations', async (t) => {
    // Back up current db.json if it exists
    let backup = null;
    try {
      backup = await fs.readFile('db.json', 'utf-8');
    } catch (e) {}

    // Set up clean test db
    await fs.writeFile('db.json', JSON.stringify({ leads: [] }));

    await t.test('should add a lead', async () => {
      const lead = await addLead({
        name: 'Test Plumber',
        email: 'test@plumber.com',
        phone: '12345',
        address: 'Brussels',
        message: 'Fix leaks',
        serviceType: 'Repairs'
      });
      assert.ok(lead.id);
      assert.strictEqual(lead.name, 'Test Plumber');
      assert.strictEqual(lead.status, 'New');
      assert.strictEqual(lead.notes, '');

      const db = await readDB();
      assert.strictEqual(db.leads.length, 1);
    });

    await t.test('should update a lead', async () => {
      const db = await readDB();
      const first = db.leads[0];
      const updated = await updateLead(first.id, { status: 'Completed', notes: 'Done!' });
      assert.strictEqual(updated.status, 'Completed');
      assert.strictEqual(updated.notes, 'Done!');
    });

    await t.test('should delete a lead', async () => {
      const db = await readDB();
      const first = db.leads[0];
      const success = await deleteLead(first.id);
      assert.strictEqual(success, true);

      const finalDB = await readDB();
      assert.strictEqual(finalDB.leads.length, 0);
    });

    // Restore backup
    if (backup) {
      await fs.writeFile('db.json', backup);
    } else {
      try {
        await fs.unlink('db.json');
      } catch (e) {}
    }
  });
  ```

- [ ] **Step 4: Run tests to verify**
  Run: `node --test db.test.js`
  Expected: Tests pass.

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add db.json db.js db.test.js
  git commit -m "feat: add JSON database manager and test suite"
  ```

---

### Task 3: Implement Express Server API

**Files:**
- Create: `server.js`
- Create: `server.test.js`

- [ ] **Step 1: Create server.js**
  Implement the full API server with routing, request validation, authentication token verification middleware, and CORS.
  ```javascript
  import express from 'express';
  import cors from 'cors';
  import { addLead, readDB, updateLead, deleteLead } from './db.js';

  const app = express();
  const PORT = process.env.PORT || 3001;
  const PASSWORD = process.env.CRM_PASSWORD || 'admin123';

  // In-memory sessions store
  const sessions = new Set();

  app.use(cors());
  app.use(express.json());

  // Public endpoint for submitting a lead
  app.post('/api/leads', async (req, res) => {
    const { name, email, phone, address, message, serviceType } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    try {
      const newLead = await addLead({ name, email, phone, address, message, serviceType });
      res.status(201).json({ success: true, lead: newLead });
    } catch (e) {
      res.status(500).json({ error: 'Failed to write lead' });
    }
  });

  // Public login endpoint
  app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === PASSWORD) {
      const token = 'session-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      sessions.add(token);
      return res.json({ token });
    }
    res.status(401).json({ error: 'Invalid password' });
  });

  // Admin middleware to verify bearer token
  function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.substring(7);
    if (!sessions.has(token)) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    req.token = token;
    next();
  }

  // Secured admin endpoints
  app.get('/api/leads', authenticate, async (req, res) => {
    try {
      const db = await readDB();
      // Sort: newest first
      const sortedLeads = [...db.leads].sort((a, b) => new Date(b.date) - new Date(a.date));
      res.json(sortedLeads);
    } catch (e) {
      res.status(500).json({ error: 'Failed to read database' });
    }
  });

  app.patch('/api/leads/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    try {
      const updated = await updateLead(id, { status, notes });
      if (!updated) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: 'Failed to update lead' });
    }
  });

  app.delete('/api/leads/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    try {
      const success = await deleteLead(id);
      if (!success) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete lead' });
    }
  });

  const server = app.listen(PORT, () => {
    console.log(`CRM Backend API running on port ${PORT}`);
  });

  export { server, sessions };
  ```

- [ ] **Step 2: Create server.test.js**
  Write tests for the server endpoints using Node's native runner.
  ```javascript
  import test from 'node:test';
  import assert from 'node:assert';
  import fs from 'fs/promises';
  import { server, sessions } from './server.js';

  test('Server Endpoint Routing', async (t) => {
    const origin = 'http://localhost:3001';
    let backup = null;
    try {
      backup = await fs.readFile('db.json', 'utf-8');
    } catch (e) {}
    await fs.writeFile('db.json', JSON.stringify({ leads: [] }));

    await t.test('POST /api/leads - should submit a lead', async () => {
      const response = await fetch(`${origin}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Wayne Plumber',
          email: 'wayne@test.com',
          phone: '+32 400 00',
          address: 'Brussels',
          message: 'Testing server.js endpoint',
          serviceType: 'Repairs'
        })
      });
      assert.strictEqual(response.status, 201);
      const resBody = await response.json();
      assert.strictEqual(resBody.success, true);
      assert.strictEqual(resBody.lead.name, 'Wayne Plumber');
    });

    await t.test('POST /api/login - should fail with wrong password', async () => {
      const response = await fetch(`${origin}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'wrong_password' })
      });
      assert.strictEqual(response.status, 401);
    });

    await t.test('POST /api/login - should succeed with right password', async () => {
      const response = await fetch(`${origin}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'admin123' })
      });
      assert.strictEqual(response.status, 200);
      const resBody = await response.json();
      assert.ok(resBody.token);
      
      // Save token for subsequent tests
      t.context = { token: resBody.token };
    });

    await t.test('GET /api/leads - should reject without auth', async () => {
      const response = await fetch(`${origin}/api/leads`);
      assert.strictEqual(response.status, 401);
    });

    await t.test('GET /api/leads - should return leads list with valid token', async () => {
      const response = await fetch(`${origin}/api/leads`, {
        headers: { 'Authorization': `Bearer ${t.context.token}` }
      });
      assert.strictEqual(response.status, 200);
      const leads = await response.json();
      assert.strictEqual(leads.length, 1);
      assert.strictEqual(leads[0].name, 'Wayne Plumber');
    });

    // Cleanup: Close Server & restore db backup
    server.close();
    if (backup) {
      await fs.writeFile('db.json', backup);
    } else {
      try {
        await fs.unlink('db.json');
      } catch (e) {}
    }
  });
  ```

- [ ] **Step 3: Run tests**
  Run: `node --test server.test.js`
  Expected: Tests pass.

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add server.js server.test.js
  git commit -m "feat: implement Express server endpoints and test suite"
  ```

---

### Task 4: Connect Contact Form to API

**Files:**
- Modify: `src/pages/InnerPages.jsx:250-372`
- Test: Manual lead submission check

- [ ] **Step 1: Modify Contact form submission in InnerPages.jsx**
  Update the `submit` handler in the `Contact` component to send a real request to `/api/leads`.
  Replace lines 260-267 in `src/pages/InnerPages.jsx` with the real submission logic:
  ```javascript
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

- [ ] **Step 2: Commit**
  Run:
  ```bash
  git add src/pages/InnerPages.jsx
  git commit -m "feat: connect client contact form to the Express API backend"
  ```

---

### Task 5: Create React CRM Page

**Files:**
- Create: `src/pages/AdminCRM.jsx`

- [ ] **Step 1: Create AdminCRM.jsx component**
  Write the React login form and CRM administrative workspace page.
  ```javascript
  import React, { useState, useEffect } from 'react';
  import { Icon } from '../components/Icons';
  import { Eyebrow } from '../components/Shared';

  const STATUSES = ['New', 'Contacted', 'Quote Sent', 'Scheduled', 'Completed'];

  export default function AdminCRM({ lang }) {
    const [token, setToken] = useState(sessionStorage.getItem('ww-crm-token') || '');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [leads, setLeads] = useState([]);
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [noteText, setNoteText] = useState('');
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
      if (token) {
        fetchLeads();
      }
    }, [token]);

    const fetchLeads = () => {
      fetch('/api/leads', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.status === 401) {
          handleLogout();
          throw new Error('Session expired');
        }
        return res.json();
      })
      .then(data => {
        setLeads(data);
        if (data.length > 0 && !selectedLeadId) {
          setSelectedLeadId(data[0].id);
          setNoteText(data[0].notes || '');
        }
      })
      .catch(err => console.error(err));
    };

    const handleLogin = (e) => {
      e.preventDefault();
      setLoginError('');
      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      .then(res => {
        if (!res.ok) throw new Error('Incorrect password');
        return res.json();
      })
      .then(data => {
        sessionStorage.setItem('ww-crm-token', data.token);
        setToken(data.token);
      })
      .catch(err => setLoginError(err.message));
    };

    const handleLogout = () => {
      sessionStorage.removeItem('ww-crm-token');
      setToken('');
      setLeads([]);
      setSelectedLeadId(null);
    };

    const handleUpdateStatus = (id, newStatus) => {
      fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      .then(res => {
        if (res.status === 401) return handleLogout();
        return res.json();
      })
      .then(updated => {
        setLeads(leads.map(l => l.id === id ? updated : l));
      })
      .catch(err => console.error(err));
    };

    const handleSaveNotes = (id) => {
      setSaveStatus('Saving...');
      fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes: noteText })
      })
      .then(res => {
        if (res.status === 401) return handleLogout();
        return res.json();
      })
      .then(updated => {
        setLeads(leads.map(l => l.id === id ? updated : l));
        setSaveStatus('Saved!');
        setTimeout(() => setSaveStatus(''), 2000);
      })
      .catch(err => {
        setSaveStatus('Error');
        console.error(err);
      });
    };

    const handleDeleteLead = (id) => {
      if (!confirm('Are you sure you want to permanently delete this lead?')) return;
      fetch(`/api/leads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.status === 401) return handleLogout();
        return res.json();
      })
      .then(() => {
        const remaining = leads.filter(l => l.id !== id);
        setLeads(remaining);
        if (remaining.length > 0) {
          setSelectedLeadId(remaining[0].id);
          setNoteText(remaining[0].notes || '');
        } else {
          setSelectedLeadId(null);
          setNoteText('');
        }
      })
      .catch(err => console.error(err));
    };

    const selectedLead = leads.find(l => l.id === selectedLeadId);

    // Filter and search
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

    if (!token) {
      return (
        <section className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="form-card" style={{ maxWidth: 400, width: '100%', padding: 40, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Eyebrow>Waterworks CRM</Eyebrow>
              <h2 style={{ marginTop: 8 }}>Admin Sign In</h2>
            </div>
            <form onSubmit={handleLogin}>
              <div className="field">
                <label>Enter CRM Password</label>
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
          {/* Header Dashboard Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
            <div>
              <Eyebrow>Control Room</Eyebrow>
              <h1 className="hl" style={{ fontSize: 'clamp(28px, 4vw, 42px)', margin: '8px 0 0' }}>Waterworks Leads CRM</h1>
            </div>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Logout <Icon name="arrow" size={16} style={{ marginLeft: 8 }} />
            </button>
          </div>

          {/* Search and Filters */}
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

          {/* CRM Layout Workspace */}
          {leads.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h3>No leads captured yet</h3>
              <p style={{ color: 'var(--muted)' }}>Leads submitted via the contact form will appear here.</p>
            </div>
          ) : (
            <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 1.8fr', gap: 24, alignItems: 'start' }}>
              
              {/* Left leads list */}
              <div style={{ maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredLeads.map(lead => {
                  const isActive = lead.id === selectedLeadId;
                  const dateStr = new Date(lead.date).toLocaleDateString(lang === 'fr' ? 'fr-BE' : lang === 'nl' ? 'nl-BE' : 'en-GB', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  });
                  return (
                    <div 
                      key={lead.id}
                      onClick={() => {
                        setSelectedLeadId(lead.id);
                        setNoteText(lead.notes || '');
                      }}
                      className="card"
                      style={{ 
                        cursor: 'pointer',
                        padding: 16,
                        margin: 0,
                        border: isActive ? '2px solid var(--primary)' : '1px solid var(--line)',
                        background: isActive ? 'color-mix(in srgb, var(--primary) 6%, var(--bg))' : 'var(--bg)',
                        transform: isActive ? 'translateY(-2px)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <h4 style={{ margin: 0, fontSize: 16.5 }}>{lead.name}</h4>
                        <span 
                          style={{ 
                            fontSize: 11, 
                            fontWeight: 'bold', 
                            textTransform: 'uppercase', 
                            padding: '3px 8px', 
                            borderRadius: 20,
                            letterSpacing: '.05em',
                            background: lead.status === 'New' ? 'rgba(235, 87, 87, 0.15)' :
                                        lead.status === 'Contacted' ? 'rgba(47, 128, 237, 0.15)' :
                                        lead.status === 'Quote Sent' ? 'rgba(155, 81, 224, 0.15)' :
                                        lead.status === 'Scheduled' ? 'rgba(242, 201, 76, 0.15)' : 'rgba(39, 174, 96, 0.15)',
                            color: lead.status === 'New' ? '#eb5757' :
                                   lead.status === 'Contacted' ? '#2f80ed' :
                                   lead.status === 'Quote Sent' ? '#9b51e0' :
                                   lead.status === 'Scheduled' ? '#e2a300' : '#27ae60'
                          }}
                        >
                          {lead.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--muted)' }}>
                        <span>{lead.serviceType || 'Plumbing'}</span>
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

              {/* Right detail panel */}
              <div>
                {selectedLead ? (
                  <div className="card" style={{ padding: 32, margin: 0, background: 'var(--bg)', border: '1px solid var(--line)' }}>
                    <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: 20, marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <Eyebrow>{selectedLead.serviceType || 'Request Details'}</Eyebrow>
                          <h2 style={{ marginTop: 6, fontSize: 28 }}>{selectedLead.name}</h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <label style={{ fontSize: 14, fontWeight: 'bold' }}>Status:</label>
                          <select 
                            value={selectedLead.status} 
                            onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)', fontSize: 14.5, fontWeight: 'bold', outline: 'none' }}
                          >
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
                          {selectedLead.phone ? (
                            <a href={`tel:${selectedLead.phone}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{selectedLead.phone}</a>
                          ) : 'Not provided'}
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

                    {/* Internal Notes Section */}
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
                      ></textarea>
                      <button 
                        className="btn btn-accent btn-sm" 
                        style={{ marginTop: 10 }}
                        onClick={() => handleSaveNotes(selectedLead.id)}
                      >
                        Save Notes
                      </button>
                    </div>

                    {/* Delete lead */}
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

- [ ] **Step 2: Commit**
  Run:
  ```bash
  git add src/pages/AdminCRM.jsx
  git commit -m "feat: build AdminCRM React login and dashboard workspace components"
  ```

---

### Task 6: Wire Admin Router

**Files:**
- Modify: `src/App.jsx`
- Test: Route rendering verification

- [ ] **Step 1: Wire route in App.jsx**
  Import `AdminCRM` and hook it into the custom routing system in `src/App.jsx`.
  Replace lines 70-76 in `src/App.jsx` with:
  ```javascript
    } else if (base === "contact") {
      page = <Contact lang={lang} go={go} />;
    } else if (base === "admin") {
      page = <AdminCRM lang={lang} go={go} />;
    } else {
      page = <Home lang={lang} go={go} hero={t_.hero} />;
    }
  ```
  Ensure to import `AdminCRM` at the top of `src/App.jsx`:
  ```javascript
  import { Services, Work, WorkDetail, Press, Training, Links, Contact } from './pages/InnerPages';
  import AdminCRM from './pages/AdminCRM';
  ```

- [ ] **Step 2: Commit**
  Run:
  ```bash
  git add src/App.jsx
  git commit -m "feat: hook up #admin routing path to the CRM component in App.jsx"
  ```
