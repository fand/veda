import { test } from 'vitest';
import { convertPathForServer } from '../lib/utils';

const is = (t) => (a, b) => t.expect(a).toEqual(b);

test('convertPathForServer', (t) => {
    // Paths are converted to URLs
    is(t)(
        convertPathForServer('/foo/bar', 3000, '/foo/bar/baz'),
        'http://localhost:3000/link/baz',
    );
    is(t)(
        convertPathForServer('/foo/bar', 3000, 'baz'),
        'http://localhost:3000/link/baz',
    );
    is(t)(
        convertPathForServer('/foo/bar', 3000, 'baz/qux'),
        'http://localhost:3000/link/baz/qux',
    );
    is(t)(
        convertPathForServer('/foo/bar', 3000, 'baz/././qux/'),
        'http://localhost:3000/link/baz/qux',
    );
    is(t)(
        convertPathForServer('/foo/bar', 3000, 'baz/qux/../yo'),
        'http://localhost:3000/link/baz/yo',
    );
    is(t)(
        convertPathForServer('/foo/bar', 3000, './baz'),
        'http://localhost:3000/link/baz',
    );
    is(t)(
        convertPathForServer('/foo/bar', 3000, './baz/qux'),
        'http://localhost:3000/link/baz/qux',
    );
    is(t)(
        convertPathForServer('/foo/bar', 3000, './baz/././qux/'),
        'http://localhost:3000/link/baz/qux',
    );
    is(t)(
        convertPathForServer('/foo/bar', 3000, './baz/qux/../yo'),
        'http://localhost:3000/link/baz/yo',
    );

    // URLs are not converted
    is(t)(
        convertPathForServer('/foo/bar', 3000, 'http://example.com/foo.png'),
        'http://example.com/foo.png',
    );
    is(t)(
        convertPathForServer(
            '/foo/bar',
            3000,
            'http://example.com/foo/bar.png',
        ),
        'http://example.com/foo/bar.png',
    );
    is(t)(
        convertPathForServer('/foo/bar', 3000, 'https://example.com/foo.png'),
        'https://example.com/foo.png',
    );
    is(t)(
        convertPathForServer(
            '/foo/bar',
            3000,
            'https://example.com/foo/bar.png',
        ),
        'https://example.com/foo/bar.png',
    );
    is(t)(
        convertPathForServer('/foo/bar', 3000, '//example.com/foo.png'),
        '//example.com/foo.png',
    );
    is(t)(
        convertPathForServer('/foo/bar', 3000, '//example.com/foo/bar.png'),
        '//example.com/foo/bar.png',
    );
});
