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
    notes: '',
    ...lead,
    id: 'lead-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString(),
    status: 'New'
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
