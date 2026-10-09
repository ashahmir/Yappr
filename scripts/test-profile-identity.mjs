import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileIdentity } from '../src/lib/profile-identity.ts';

test('Google identity wins while the Yappr username remains separate', () => {
  const user = { fullName: 'Other Name', username: 'yapper', imageUrl: 'clerk-avatar', externalAccounts: [
    { provider: 'github', firstName: 'Other', lastName: 'Person', imageUrl: 'other-avatar' },
    { provider: 'google', firstName: 'Jamie', lastName: 'Chen', imageUrl: 'google-avatar' },
  ] };
  assert.deepEqual(profileIdentity(user), { name: 'Jamie Chen', handle: '@yapper', imageUrl: 'google-avatar' });
  assert.equal(user.fullName, 'Other Name');
});
test('missing Google attributes fall back to Clerk without inventing a username', () => {
  assert.deepEqual(profileIdentity({ fullName: 'Jamie Chen', username: null, imageUrl: 'clerk-avatar', externalAccounts: [{ provider: 'oauth_google', firstName: '', lastName: '', imageUrl: '' }] }), { name: 'Jamie Chen', handle: '', imageUrl: 'clerk-avatar' });
});
test('incomplete identity remains renderable', () => {
  assert.deepEqual(profileIdentity({ fullName: null, username: null, imageUrl: '', externalAccounts: [] }), { name: 'Your profile', handle: '', imageUrl: '' });
});
