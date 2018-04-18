import test from 'ava';
import Config from '../lib/config';

const wait = dur => new Promise(r => setTimeout(r, dur));

let c = new Config('', {});
const DEFAULT_RC = c.rc;

test.beforeEach(() => {
    c = new Config('', {});
});

test('createRc returns DEFAULT_RC by default', t => {
    const newRc = c.createRc();
    t.deepEqual(newRc, DEFAULT_RC);
});

test('setFileSettings changes Config', t => {
    c.setFileSettings({ vertexCount: 123 });
    const newRc = c.createRc();
    t.deepEqual(newRc, { ...DEFAULT_RC, vertexCount: 123 });
});

test('setProjectSettings changes Config', t => {
    c.setProjectSettings({ vertexCount: 123 });
    const newRc = c.createRc();
    t.deepEqual(newRc, { ...DEFAULT_RC, vertexCount: 123 });
});

test('setGlobalSettings changes Config', t => {
    c.setGlobalSettings({ vertexCount: 123 });
    const newRc = c.createRc();
    t.deepEqual(newRc, { ...DEFAULT_RC, vertexCount: 123 });
});

test('setFileSettings > setProjectSettings > setGlobalSettings', t => {
    const c = new Config('', {});
    c.setFileSettings({ vertexCount: 123 });
    c.setProjectSettings({ vertexCount: 456, vertexMode: 'LINES' });
    c.setGlobalSettings({
        vertexCount: 456,
        vertexMode: 'POINTS',
        audio: true,
    });
    const newRc = c.createRc();
    t.deepEqual(newRc, {
        ...DEFAULT_RC,
        vertexCount: 123,
        vertexMode: 'LINES',
        audio: true,
    });
});

test('setFileSettings returns diffs and newConfig', async t => {
    const diff1 = c.setFileSettings({
        IMPORTED: { foo: { PATH: './foo.mp4' } },
        vertexCount: 123,
    });
    t.deepEqual(
        diff1.newConfig,
        {
            ...DEFAULT_RC,
            IMPORTED: { foo: { PATH: './foo.mp4' } },
            vertexCount: 123,
        },
        'newConfig contains whole config object',
    );
    t.deepEqual(
        diff1.added,
        {
            IMPORTED: { foo: { PATH: './foo.mp4' } },
            vertexCount: 123,
        },
        'added properties are correct',
    );
    t.deepEqual(diff1.removed, { IMPORTED: {} }, 'removed is empty');

    const diff2 = c.setFileSettings({
        IMPORTED: { foo: { PATH: './bar.mp4' } },
        vertexCount: 456,
    });
    t.deepEqual(
        diff2.newConfig,
        {
            ...DEFAULT_RC,
            IMPORTED: { foo: { PATH: './bar.mp4' } },
            vertexCount: 456,
        },
        'newConfig is updated',
    );
    t.deepEqual(
        diff2.added,
        {
            IMPORTED: { foo: { PATH: './bar.mp4' } },
            vertexCount: 456,
        },
        'changing PATH puts the imports into added.IMPORTED',
    );
    t.deepEqual(
        diff2.removed,
        {
            IMPORTED: { foo: { PATH: './foo.mp4' } },
        },
        'removed only cares IMPORTED, which contains unused file paths',
    );
});

test('rc and soundRc is isolated', async t => {
    const diff1 = c.setFileSettings({
        IMPORTED: { foo: { PATH: './foo.mp4' } },
        vertexCount: 123,
    });
    t.deepEqual(
        diff1.newConfig,
        {
            ...DEFAULT_RC,
            IMPORTED: { foo: { PATH: './foo.mp4' } },
            vertexCount: 123,
        },
        'newConfig contains whole config object',
    );
    t.deepEqual(c.rc, diff1.newConfig, 'setFileSettings updates rc');
    t.deepEqual(
        c.soundRc,
        DEFAULT_RC,
        "setFileSettings doesn't updates soundRc",
    );

    c = new Config('', {});
    const diff2 = c.setSoundSettings({
        IMPORTED: { foo: { PATH: './foo.mp4' } },
        vertexCount: 123,
    });
    t.deepEqual(
        diff2.newConfig,
        {
            ...DEFAULT_RC,
            IMPORTED: { foo: { PATH: './foo.mp4' } },
            vertexCount: 123,
        },
        'newConfig contains whole config object',
    );
    t.deepEqual(c.soundRc, diff2.newConfig, 'setSoundSettings updates soundRc');
    t.deepEqual(c.rc, DEFAULT_RC, "setSoundSettings doesn't updates rc");
});

test('setFileSettingsByString works the same as setFileSettings', async t => {
    const c1 = new Config('', {});
    c.setFileSettings({
        IMPORTED: { foo: { PATH: './foo.mp4' } },
        vertexCount: 123,
    });
    const c2 = new Config('', {});
    c.setFileSettingsByString(
        JSON.stringify({
            IMPORTED: { foo: { PATH: './foo.mp4' } },
            vertexCount: 123,
        }),
    );
    t.deepEqual(c1.rc, c2.rc);
});

test('setSoundSettingsByString works the same as setSoundSettings', async t => {
    const c1 = new Config('', {});
    c.setSoundSettings({
        soundLength: 1.23,
    });
    const c2 = new Config('', {});
    c.setSoundSettingsByString(
        JSON.stringify({
            soundLength: 1.23,
        }),
    );
    t.deepEqual(c1.rc, c2.rc);
});
