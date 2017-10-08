const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './client/index.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './client/'),
  },
  module: {
    loaders: [{
      test: /\.js?$/,
      loader: 'babel-loader',
      options: {
        presets: ['flow'],
      },
    }],
  },
};
