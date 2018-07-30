import test from 'ava';
import { convertPathForServer } from '../lib/utils';

test('convertPathForServer', t => {
    // Paths are converted to URLs
    t.is(convertPathForServer('/foo/bar', 3000, '/foo/bar/baz'), 'http://localhost:3000/baz');
    t.is(convertPathForServer('/foo/bar', 3000, 'baz'), 'http://localhost:3000/baz');
    t.is(convertPathForServer('/foo/bar', 3000, 'baz/qux'), 'http://localhost:3000/baz/qux');
    t.is(convertPathForServer('/foo/bar', 3000, 'baz/././qux/'), 'http://localhost:3000/baz/qux');
    t.is(convertPathForServer('/foo/bar', 3000, 'baz/qux/../yo'), 'http://localhost:3000/baz/yo');
    t.is(convertPathForServer('/foo/bar', 3000, './baz'), 'http://localhost:3000/baz');
    t.is(convertPathForServer('/foo/bar', 3000, './baz/qux'), 'http://localhost:3000/baz/qux');
    t.is(convertPathForServer('/foo/bar', 3000, './baz/././qux/'), 'http://localhost:3000/baz/qux');
    t.is(convertPathForServer('/foo/bar', 3000, './baz/qux/../yo'), 'http://localhost:3000/baz/yo');

    // URLs are not converted
    t.is(convertPathForServer('/foo/bar', 3000, 'http://example.com/foo.png'), 'http://example.com/foo.png');
    t.is(convertPathForServer('/foo/bar', 3000, 'http://example.com/foo/bar.png'), 'http://example.com/foo/bar.png');
    t.is(convertPathForServer('/foo/bar', 3000, 'https://example.com/foo.png'), 'https://example.com/foo.png');
    t.is(convertPathForServer('/foo/bar', 3000, 'https://example.com/foo/bar.png'), 'https://example.com/foo/bar.png');
    t.is(convertPathForServer('/foo/bar', 3000, '//example.com/foo.png'), '//example.com/foo.png');
    t.is(convertPathForServer('/foo/bar', 3000, '//example.com/foo/bar.png'), '//example.com/foo/bar.png');
});
