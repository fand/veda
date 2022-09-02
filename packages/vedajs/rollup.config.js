import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/veda.cjs.js',
            format: 'cjs',
            exports: 'named',
            sourcemap: true,
        },
        plugins: [esbuild(), nodeResolve(), commonjs()],
    },
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/veda.esm.js',
            format: 'esm',
            exports: 'named',
            sourcemap: true,
        },
        plugins: [esbuild(), nodeResolve(), commonjs()],
    },
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/veda.umd.js',
            format: 'umd',
            name: 'Veda',
            exports: 'default',
            sourcemap: true,
        },
        plugins: [esbuild(), nodeResolve(), commonjs()],
    },
    {
        input: 'src/index.ts',
        output: [{ file: 'dist/veda.d.ts', format: 'es' }],
        plugins: [dts()],
    },
];
