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
