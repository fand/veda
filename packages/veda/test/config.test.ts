import { test } from 'vitest';
import Config from '../src/config';

const DEFAULT_RC = new Config('', {}).rc;

test('createRc returns DEFAULT_RC by default', (t) => {
    const c = new Config('', {});
    const newRc = c.createRc();
    t.expect(newRc).toStrictEqual(DEFAULT_RC);
});

test('setFileSettings changes Config', (t) => {
    const c = new Config('', {});
    c.setFileSettings('', { vertexCount: 123 });
    const newRc = c.createRc();
    t.expect(newRc).toStrictEqual({ ...DEFAULT_RC, vertexCount: 123 });
});

test('setProjectSettings changes Config', (t) => {
    const c = new Config('', {});
    c.setProjectSettings({ vertexCount: 123 });
    const newRc = c.createRc();
    t.expect(newRc).toStrictEqual({ ...DEFAULT_RC, vertexCount: 123 });
});

test('setGlobalSettings changes Config', (t) => {
    const c = new Config('', {});
    c.setGlobalSettings({ vertexCount: 123 });
    const newRc = c.createRc();
    t.expect(newRc).toStrictEqual({ ...DEFAULT_RC, vertexCount: 123 });
});

test('setFileSettings > setProjectSettings > setGlobalSettings', (t) => {
    const c = new Config('', {});
    c.setFileSettings('', { vertexCount: 123 });
    c.setProjectSettings({ vertexCount: 456, vertexMode: 'LINES' });
    c.setGlobalSettings({
        vertexCount: 456,
        vertexMode: 'POINTS',
        audio: true,
    });
    const newRc = c.createRc();
    t.expect(newRc).toStrictEqual({
        ...DEFAULT_RC,
        vertexCount: 123,
        vertexMode: 'LINES',
        audio: true,
    });
});

test('setFileSettings returns diffs and newConfig', async (t) => {
    const c = new Config('', {});
    const diff1 = c.setFileSettings('/', {
        IMPORTED: { foo: { PATH: './foo.mp4' } },
        vertexCount: 123,
    });

    // newConfig contains whole config object
    t.expect(diff1.newConfig).toStrictEqual({
        ...DEFAULT_RC,
        IMPORTED: { foo: { PATH: '/foo.mp4' } },
        vertexCount: 123,
    });
    // added properties are correct
    t.expect(diff1.added).toStrictEqual({
        IMPORTED: { foo: { PATH: '/foo.mp4' } },
        vertexCount: 123,
    });
    // removed is empty
    t.expect(diff1.removed).toStrictEqual({ IMPORTED: {} });

    const diff2 = c.setFileSettings('/', {
        IMPORTED: { foo: { PATH: './bar.mp4' } },
        vertexCount: 456,
    });
    // newConfig is updated
    t.expect(diff2.newConfig).toStrictEqual({
        ...DEFAULT_RC,
        IMPORTED: { foo: { PATH: '/bar.mp4' } },
        vertexCount: 456,
    });
    // changing PATH puts the imports into added.IMPORTED
    t.expect(diff2.added).toStrictEqual({
        IMPORTED: { foo: { PATH: '/bar.mp4' } },
        vertexCount: 456,
    });
    // removed only cares IMPORTED, which contains unused file paths
    t.expect(diff2.removed).toStrictEqual({
        IMPORTED: { foo: { PATH: '/foo.mp4' } },
    });
});

test('rc and soundRc is isolated', async (t) => {
    const c = new Config('', {});
    const diff1 = c.setFileSettings('/', {
        IMPORTED: { foo: { PATH: './foo.mp4' } },
        vertexCount: 123,
    });

    // newConfig contains whole config object
    t.expect(diff1.newConfig).toStrictEqual({
        ...DEFAULT_RC,
        IMPORTED: { foo: { PATH: '/foo.mp4' } },
        vertexCount: 123,
    });
    // setFileSettings updates rc
    t.expect(c.rc).toStrictEqual(diff1.newConfig);
    // setFileSettings doesn't updates soundRc
    t.expect(c.soundRc).toStrictEqual(DEFAULT_RC);

    const c1 = new Config('', {});
    const diff2 = c1.setSoundSettings('/', {
        IMPORTED: { foo: { PATH: './foo.mp4' } },
        vertexCount: 123,
    });
    // newConfig contains whole config object
    t.expect(diff2.newConfig).toStrictEqual({
        ...DEFAULT_RC,
        IMPORTED: { foo: { PATH: '/foo.mp4' } },
        vertexCount: 123,
    });
    t.expect(c1.soundRc).toStrictEqual(diff2.newConfig); // setSoundSettings updates soundRc
    t.expect(c1.rc).toStrictEqual(DEFAULT_RC); // setSoundSettings doesn't update rc
});

test('setFileSettingsByString works the same as setFileSettings', (t) => {
    const c1 = new Config('', {});
    c1.setFileSettings('/', {
        IMPORTED: { foo: { PATH: './foo.mp4' } },
        vertexCount: 123,
    });

    const c2 = new Config('', {});
    c2.setFileSettingsByString(
        '/',
        JSON.stringify({
            IMPORTED: { foo: { PATH: './foo.mp4' } },
            vertexCount: 123,
        }),
    );

    t.expect(c1.rc).toStrictEqual(c2.rc);
});

test('setSoundSettingsByString works the same as setSoundSettings', (t) => {
    const c1 = new Config('', {});
    c1.setSoundSettings('/', {
        soundLength: 1.23,
    });

    const c2 = new Config('', {});
    c2.setSoundSettingsByString(
        '/',
        JSON.stringify({
            soundLength: 1.23,
        }),
    );
    t.expect(c1.rc).toStrictEqual(c2.rc);
});
