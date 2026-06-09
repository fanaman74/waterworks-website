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
