import { test } from 'vitest';
import Config from '../lib/config';

const deepEqual = (t) => (a, b, c) => t.expect(a).toStrictEqual(b, c);

const DEFAULT_RC = new Config('', {}).rc;

test('createRc returns DEFAULT_RC by default', (t) => {
    const c = new Config('', {});
    const newRc = c.createRc();
    deepEqual(t)(newRc, DEFAULT_RC);
});

test('setFileSettings changes Config', (t) => {
    const c = new Config('', {});
    c.setFileSettings({ vertexCount: 123 });
    const newRc = c.createRc();
    deepEqual(t)(newRc, { ...DEFAULT_RC, vertexCount: 123 });
});

test('setProjectSettings changes Config', (t) => {
    const c = new Config('', {});
    c.setProjectSettings({ vertexCount: 123 });
    const newRc = c.createRc();
    deepEqual(t)(newRc, { ...DEFAULT_RC, vertexCount: 123 });
});

test('setGlobalSettings changes Config', (t) => {
    const c = new Config('', {});
    c.setGlobalSettings({ vertexCount: 123 });
    const newRc = c.createRc();
    deepEqual(t)(newRc, { ...DEFAULT_RC, vertexCount: 123 });
});

test('setFileSettings > setProjectSettings > setGlobalSettings', (t) => {
    const c = new Config('', {});
    c.setFileSettings({ vertexCount: 123 });
    c.setProjectSettings({ vertexCount: 456, vertexMode: 'LINES' });
    c.setGlobalSettings({
        vertexCount: 456,
        vertexMode: 'POINTS',
        audio: true,
    });
    const newRc = c.createRc();
    deepEqual(t)(newRc, {
        ...DEFAULT_RC,
        vertexCount: 123,
        vertexMode: 'LINES',
        audio: true,
    });
});

test('setFileSettings returns diffs and newConfig', async (t) => {
    const c = new Config('', {});
    const diff1 = c.setFileSettings({
        IMPORTED: { foo: { PATH: './foo.mp4' } },
        vertexCount: 123,
    });

    deepEqual(t)(
        diff1.newConfig,
        {
            ...DEFAULT_RC,
            IMPORTED: { foo: { PATH: './foo.mp4' } },
            vertexCount: 123,
        },
        'newConfig contains whole config object',
    );
    deepEqual(t)(
        diff1.added,
        {
            IMPORTED: { foo: { PATH: './foo.mp4' } },
            vertexCount: 123,
        },
        'added properties are correct',
    );
    deepEqual(t)(diff1.removed, { IMPORTED: {} }, 'removed is empty');

    const diff2 = c.setFileSettings({
        IMPORTED: { foo: { PATH: './bar.mp4' } },
        vertexCount: 456,
    });
    deepEqual(t)(
        diff2.newConfig,
        {
            ...DEFAULT_RC,
            IMPORTED: { foo: { PATH: './bar.mp4' } },
            vertexCount: 456,
        },
        'newConfig is updated',
    );
    deepEqual(t)(
        diff2.added,
        {
            IMPORTED: { foo: { PATH: './bar.mp4' } },
            vertexCount: 456,
        },
        'changing PATH puts the imports into added.IMPORTED',
    );
    deepEqual(t)(
        diff2.removed,
        {
            IMPORTED: { foo: { PATH: './foo.mp4' } },
        },
        'removed only cares IMPORTED, which contains unused file paths',
    );
});

test('rc and soundRc is isolated', async (t) => {
    const c = new Config('', {});
    const diff1 = c.setFileSettings({
        IMPORTED: { foo: { PATH: './foo.mp4' } },
        vertexCount: 123,
    });
    deepEqual(t)(
        diff1.newConfig,
        {
            ...DEFAULT_RC,
            IMPORTED: { foo: { PATH: './foo.mp4' } },
            vertexCount: 123,
        },
        'newConfig contains whole config object',
    );
    deepEqual(t)(c.rc, diff1.newConfig, 'setFileSettings updates rc');
    deepEqual(t)(
        c.soundRc,
        DEFAULT_RC,
        "setFileSettings doesn't updates soundRc",
    );

    const c1 = new Config('', {});
    const diff2 = c1.setSoundSettings({
        IMPORTED: { foo: { PATH: './foo.mp4' } },
        vertexCount: 123,
    });
    deepEqual(t)(
        diff2.newConfig,
        {
            ...DEFAULT_RC,
            IMPORTED: { foo: { PATH: './foo.mp4' } },
            vertexCount: 123,
        },
        'newConfig contains whole config object',
    );
    deepEqual(t)(
        c1.soundRc,
        diff2.newConfig,
        'setSoundSettings updates soundRc',
    );
    deepEqual(t)(c1.rc, DEFAULT_RC, "setSoundSettings doesn't updates rc");
});

test('setFileSettingsByString works the same as setFileSettings', (t) => {
    const c1 = new Config('', {});
    c1.setFileSettings({
        IMPORTED: { foo: { PATH: './foo.mp4' } },
        vertexCount: 123,
    });

    const c2 = new Config('', {});
    c2.setFileSettingsByString(
        JSON.stringify({
            IMPORTED: { foo: { PATH: './foo.mp4' } },
            vertexCount: 123,
        }),
    );

    deepEqual(t)(c1.rc, c2.rc);
});

test('setSoundSettingsByString works the same as setSoundSettings', async (t) => {
    const c = new Config('', {});
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
    deepEqual(t)(c1.rc, c2.rc);
});
