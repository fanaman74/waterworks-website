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
