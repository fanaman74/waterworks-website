import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { Resend } from 'resend';
import { addLead, readDB, updateLead, deleteLead } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const PASSWORD = process.env.CRM_PASSWORD || 'admin123';

// In-memory sessions store
const sessions = new Set();
const visitorOtps = new Map(); // email -> { code, expiresAt }
const visitorSessions = new Map(); // token -> { email, name, provider }

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

// Visitor: Request Email Sign-In Code
app.post('/api/visitor/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  const emailLower = email.toLowerCase().trim();
  
  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  visitorOtps.set(emailLower, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
  });

  // Print code to console for easy testing/local fallback
  console.log(`\n==========================================`);
  console.log(`[VISITOR AUTH CODE FOR ${emailLower}]: ${code}`);
  console.log(`==========================================\n`);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // In development, if no key is provided, we succeed with console fallback
    return res.status(200).json({ success: true, message: 'Code printed to console (API Key unconfigured)' });
  }

  const resend = new Resend(apiKey);
  
  let from = process.env.RESEND_FROM_EMAIL;
  if (from) {
    from = from.trim();
    // Strip escaped or literal double/single quotes
    from = from.replace(/^["'\\]+|["'\\]+$/g, '').trim();
    from = from.replace(/\\"/g, '"').replace(/\\'/g, "'");
    if (from.startsWith('"') && from.endsWith('"')) {
      from = from.slice(1, -1).trim();
    }
  }

  // Fallback if empty, using placeholder domain, or otherwise invalid
  if (!from || from.includes('yourdomain.com') || from.includes('example.com')) {
    from = 'WaterWorks <noreply@cordis-explorer.eu>';
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to: emailLower,
      subject: 'Your WaterWorks Sign In Code',
      html: `<p>Hello!</p><p>Your verification code for WaterWorks is: <strong>${code}</strong></p><p>This code is valid for 10 minutes.</p>`
    });

    if (error) {
      console.error('Resend email delivery failed:', error);
      return res.status(500).json({ success: false, error: `Email delivery failed: ${error.message}` });
    }

    res.status(200).json({ success: true, message: 'Verification email sent successfully' });
  } catch (err) {
    console.error('Error contacting Resend API:', err);
    res.status(500).json({ success: false, error: `Email service error: ${err.message}` });
  }
});

// Visitor: Verify Email Sign-In Code
app.post('/api/visitor/verify-code', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }
  const emailLower = email.toLowerCase().trim();
  const inputCode = code.trim();

  console.log(`\n--- [VERIFY CODE REQUEST FOR ${emailLower}] ---`);
  console.log(`Received code: "${inputCode}"`);

  const record = visitorOtps.get(emailLower);
  if (!record) {
    console.log(`Result: FAILED - No active OTP record found in memory`);
    console.log(`-----------------------------------------------\n`);
    return res.status(400).json({ error: 'No verification code requested for this email' });
  }

  if (Date.now() > record.expiresAt) {
    visitorOtps.delete(emailLower);
    console.log(`Result: FAILED - Verification code has expired`);
    console.log(`-----------------------------------------------\n`);
    return res.status(400).json({ error: 'Verification code expired' });
  }

  if (record.code !== inputCode) {
    console.log(`Result: FAILED - Mismatch! Expected "${record.code}", but received "${inputCode}"`);
    console.log(`-----------------------------------------------\n`);
    return res.status(400).json({ error: 'Invalid verification code' });
  }

  // Valid code: generate session
  const token = 'visitor-token-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  const name = emailLower.split('@')[0];
  const user = { email: emailLower, name, provider: 'email' };
  
  visitorSessions.set(token, user);
  visitorOtps.delete(emailLower); // consume code

  console.log(`Result: SUCCESS - Match found. Session created.`);
  console.log(`-----------------------------------------------\n`);

  res.json({ success: true, token, user });
});

// Visitor: Get local developer git accounts to show in Google mock chooser
app.get('/api/visitor/local-accounts', (req, res) => {
  let name = 'Wayne Pettit';
  let email = 'wayne@waterworksbe.net';
  try {
    const gitName = execSync('git config user.name').toString().trim();
    const gitEmail = execSync('git config user.email').toString().trim();
    if (gitName) name = gitName;
    if (gitEmail) email = gitEmail;
  } catch (e) {
    // Fallback if git command is unavailable or errors out
  }
  res.json({ name, email });
});

// Visitor: Mock Google Login Endpoint
app.post('/api/visitor/google', (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }
  const emailLower = email.toLowerCase().trim();

  const token = 'visitor-token-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  const user = { email: emailLower, name, provider: 'google' };
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

// Serve static files from the React frontend app build directory
app.use(express.static(path.join(__dirname, 'dist')));

// The "catchall" handler: for any request that doesn't
// match one of the API routes above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`CRM Backend API running on port ${PORT}`);
});

export { server, sessions };
