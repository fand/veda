import test from 'ava';
import Config from '../lib/config';

const wait = dur => new Promise(r => setTimeout(r, dur));

let c = new Config('', {});
const DEFAULT_RC = c.rc;

test.beforeEach(() => {
  c = new Config('', {});
});

test(t => {
  const newRc = c.createRc();
  t.deepEqual(newRc, DEFAULT_RC, 'createRc returns DEFAULT_RC by default');
});

test(t => {
  c.setComment({ vertexCount: 123 });
  const newRc = c.createRc();
  t.deepEqual(newRc, { ...DEFAULT_RC, vertexCount: 123 }, 'setComment changes Config');
});

test(t => {
  c.setProject({ vertexCount: 123 });
  const newRc = c.createRc();
  t.deepEqual(newRc, { ...DEFAULT_RC, vertexCount: 123 }, 'setProject changes Config');
});

test(t => {
  c.setGlobal({ vertexCount: 123 });
  const newRc = c.createRc();
  t.deepEqual(newRc, { ...DEFAULT_RC, vertexCount: 123 }, 'setGlobal changes Config');
});

test(t => {
  const c = new Config('', {});
  c.setComment({ vertexCount: 123 });
  c.setProject({ vertexCount: 456, vertexMode: 'LINES' });
  c.setGlobal({ vertexCount: 456, vertexMode: 'POINTS', audio: true });
  const newRc = c.createRc();
  t.deepEqual(newRc, {
    ...DEFAULT_RC,
    vertexCount: 123,
    vertexMode: 'LINES',
    audio: true,
  }, 'setComment > setProject > setGlobal');
});

test(async t => {
  let diff;
  c.on('change', _diff => {
    diff = _diff;
  });

  c.setComment({
    IMPORTED: { foo: { PATH: './foo.mp4' } },
    vertexCount: 123,
  });
  await wait(100);
  t.deepEqual(diff.newConfig, {
    ...DEFAULT_RC,
    IMPORTED: { foo: { PATH: './foo.mp4' } },
    vertexCount: 123,
  }, 'newConfig contains whole config object');
  t.deepEqual(diff.added, {
    IMPORTED: { foo: { PATH: './foo.mp4' } },
    vertexCount: 123,
  }, 'added properties are correct');
  t.deepEqual(diff.removed, { IMPORTED: {} }, 'removed is empty');

  c.setComment({
    IMPORTED: { foo: { PATH: './bar.mp4' } },
    vertexCount: 456,
  });
  await wait(100);
  t.deepEqual(diff.newConfig, {
    ...DEFAULT_RC,
    IMPORTED: { foo: { PATH: './bar.mp4' } },
    vertexCount: 456,
  }, 'newConfig is updated');
  t.deepEqual(diff.added, {
    IMPORTED: { foo: { PATH: './bar.mp4' } },
    vertexCount: 456,
  }, 'changing PATH puts the imports into added.IMPORTED');
  t.deepEqual(diff.removed, {
    IMPORTED: { foo: { PATH: './foo.mp4' } },
  }, 'removed only cares IMPORTED, which contains unused file paths');

  let called = 0;
  c.on('change', () => {
    called++;
  });
  c.setComment({});
  c.setComment({});
  t.is(called, 1, 'change event is throttled');
  await wait(100);
  t.is(called, 2, 'change event is throttled by 100ms');
});
