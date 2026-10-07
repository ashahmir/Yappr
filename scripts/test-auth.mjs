import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activateGoogleSession, canAccessAccount } from '../src/lib/auth-state.ts';

test('only an authenticated active session can access account', () => {
  assert.equal(canAccessAccount(true, 'active'), true);
  for (const status of [undefined, 'pending', 'ended', 'revoked', 'expired', 'abandoned']) {
    assert.equal(canAccessAccount(true, status), false, status);
  }
  assert.equal(canAccessAccount(false, 'active'), false);
  assert.equal(canAccessAccount(undefined, 'active'), false);
});

test('a successful flow waits for Clerk activation', async () => {
  let activated = false;
  const outcome = await activateGoogleSession({ createdSessionId: 'session-test', setActive: async ({ session }) => {
    assert.equal(session, 'session-test');
    await Promise.resolve();
    activated = true;
  } });
  assert.equal(activated, true);
  assert.equal(outcome, 'active');
});

test('cancellation and dismissal never activate a session', async () => {
  for (const type of ['cancel', 'dismiss']) {
    assert.equal(await activateGoogleSession({ createdSessionId: null, authSessionResult: { type }, setActive: async () => assert.fail('must not activate') }), 'cancelled');
  }
});

test('missing requirements and malformed results fail closed', async () => {
  assert.equal(await activateGoogleSession({ createdSessionId: null }), 'incomplete');
  assert.equal(await activateGoogleSession({ createdSessionId: 'session-test' }), 'incomplete');
});

test('activation errors propagate instead of reporting success', async () => {
  await assert.rejects(activateGoogleSession({ createdSessionId: 'session-test', setActive: async () => { throw new Error('offline'); } }), /offline/);
});
