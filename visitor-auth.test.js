import test from 'node:test';
import assert from 'node:assert';
import { server } from './server.js';

test('Visitor Auth Routes', async (t) => {
  const origin = 'http://localhost:3001';

  await t.test('POST /api/visitor/send-code - should trigger code creation', async () => {
    const res = await fetch(`${origin}/api/visitor/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testvisitor@example.com' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  await t.test('POST /api/visitor/verify-code - should reject wrong code', async () => {
    const res = await fetch(`${origin}/api/visitor/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testvisitor@example.com', code: '000000' })
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.error);
  });

  await t.test('POST /api/visitor/google - should create session for Google user', async () => {
    const res = await fetch(`${origin}/api/visitor/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'googleuser@example.com', name: 'Google User' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    assert.strictEqual(data.user.name, 'Google User');

    // Save token for /me verification
    t.context = { token: data.token };
  });

  await t.test('GET /api/visitor/me - should return user details for token', async () => {
    const res = await fetch(`${origin}/api/visitor/me`, {
      headers: { 'Authorization': `Bearer ${t.context.token}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.email, 'googleuser@example.com');
  });

  server.close();
});
