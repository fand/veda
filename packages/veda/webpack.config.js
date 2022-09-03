const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, './src/client.ts'),
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './client/'),
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                loader: 'esbuild-loader',
                options: {
                    loader: 'tsx',
                    target: 'es2015',
                },
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: { path: require.resolve('path-browserify') },
    },
};
