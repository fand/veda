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
    c.setFileSettings({ vertexCount: 123 });
    const newRc = c.createRc();
    t.deepEqual(
        newRc,
        { ...DEFAULT_RC, vertexCount: 123 },
        'setFileSettings changes Config',
    );
});

test(t => {
    c.setProjectSettings({ vertexCount: 123 });
    const newRc = c.createRc();
    t.deepEqual(
        newRc,
        { ...DEFAULT_RC, vertexCount: 123 },
        'setProjectSettings changes Config',
    );
});

test(t => {
    c.setGlobalSettings({ vertexCount: 123 });
    const newRc = c.createRc();
    t.deepEqual(
        newRc,
        { ...DEFAULT_RC, vertexCount: 123 },
        'setGlobalSettings changes Config',
    );
});

test(t => {
    const c = new Config('', {});
    c.setFileSettings({ vertexCount: 123 });
    c.setProjectSettings({ vertexCount: 456, vertexMode: 'LINES' });
    c.setGlobalSettings({
        vertexCount: 456,
        vertexMode: 'POINTS',
        audio: true,
    });
    const newRc = c.createRc();
    t.deepEqual(
        newRc,
        {
            ...DEFAULT_RC,
            vertexCount: 123,
            vertexMode: 'LINES',
            audio: true,
        },
        'setFileSettings > setProjectSettings > setGlobalSettings',
    );
});

test(async t => {
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
