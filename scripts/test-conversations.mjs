import { test } from 'node:test';
import assert from 'node:assert/strict';
import { messageReducer } from '../src/lib/message-reducer.ts';
const person = { id: 'new-person', name: 'New Person', avatar: 1, preview: '', time: '' };
const message = { id: 'm1', text: 'Hello!', outgoing: true, date: 'Today', time: '10:00 AM' };
const initial = () => ({ conversations: [], requests: [], threads: {} });
test('introduction requires nonblank text, caps length and blocks duplicates and follow-up sends', () => {
  const state = initial();
  for (const text of ['  ', 'a'.repeat(501)]) assert.equal(messageReducer(state, { type: 'introduce', conversation: person, message: { ...message, text } }), state);
  const pending = messageReducer(state, { type: 'introduce', conversation: person, message });
  assert.equal(pending.conversations[0].pending, true);
  assert.equal(messageReducer(pending, { type: 'introduce', conversation: person, message }), pending);
  assert.equal(messageReducer(pending, { type: 'send', id: person.id, message }), pending);
});
test('accept preserves request text, allows sending, updates inbox and read state', () => {
  const state = { ...initial(), requests: [{ ...person, preview: 'Hello\nthere' }] };
  const accepted = messageReducer(state, { type: 'accept', id: person.id });
  assert.equal(accepted.requests.length, 0);
  assert.equal(accepted.threads[person.id][0].text, 'Hello there');
  const sent = messageReducer(accepted, { type: 'send', id: person.id, message });
  assert.equal(sent.threads[person.id].length, 2);
  assert.equal(sent.conversations[0].preview, 'Hello!');
  assert.equal(sent.conversations[0].unread, 0);
  const deleted = messageReducer(sent, { type: 'delete', id: person.id });
  assert.equal(deleted.conversations.length, 0);
  assert.equal(deleted.threads[person.id], undefined);
});
