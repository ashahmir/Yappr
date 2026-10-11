import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishLocal, publishingError } from '../src/lib/local-publishing.ts';

const now = new Date(2026, 9, 11, 12).getTime();
const media = { video: true, duration: 60, bytes: 10000000 };
const post = (id, ownerId = 'one', createdAt = now) => ({ id, ownerId, createdAt, caption: '' });
test('video and caption limits accept exact boundaries and reject excess', () => {
  assert.equal(publishingError(media, 'a'.repeat(150), [], 'one', now), null);
  assert.match(publishingError({ ...media, duration: 61 }, '', [], 'one', now), /60 seconds/);
  assert.match(publishingError({ ...media, bytes: 10000001 }, '', [], 'one', now), /10 MB/);
  assert.match(publishingError(media, 'a'.repeat(151), [], 'one', now), /150/);
});
test('five successful posts per author per local day; other authors and yesterday do not count', () => {
  const posts = Array.from({ length: 5 }, (_, i) => post(String(i)));
  assert.match(publishingError(media, '', posts, 'one', now), /five/);
  assert.equal(publishingError(media, '', posts, 'two', now), null);
  assert.equal(publishingError(media, '', posts, 'one', new Date(2026, 9, 12, 0).getTime()), null);
  assert.equal(publishLocal(posts.slice(0, 4), post('last'), media).length, 5);
  assert.throws(() => publishLocal(posts, post('sixth'), media), /five/);
});
test('retrying a completed transaction is idempotent; failed publishing leaves state unchanged', () => {
  const posts = [post('same')];
  assert.equal(publishLocal(posts, post('same'), media), posts);
  assert.throws(() => publishLocal(posts, post('new'), { ...media, duration: 100 }), /60 seconds/);
  assert.deepEqual(posts, [post('same')]);
});
