#!/usr/bin/env node

// const path = require('path');
const http = require('http');
const express = require('express');
// const webpack = require('webpack');
// const webpackDevMiddleware = require('webpack-dev-middleware')
// const webpackConfig = require('./webpack.config');

// const compiler = webpack(webpackConfig);

// Create the app, setup the webpack middleware
const app = express();
// app.use(webpackDevMiddleware(compiler, {
//   publicPath: webpackConfig.output.path,
// }));

app.use(express.static('./client'));

const server = http.Server(app);
const io = require('socket.io')(server);

const PORT = process.argv[2] || 3000;

console.log(PORT);
// console.log(webpackConfig.output.path);

// server.listen(PORT);

io.on('connection', socket => {
  console.log('a user connected');

  socket.on('ready', () => {
    socket.broadcast.emit('ready');
  });
  socket.on('create', config => {
    socket.broadcast.emit('create', config);
  });
  socket.on('destroy', () => {
    socket.broadcast.emit('destroy');
  });
  socket.on('onChange', rcDiff => {
    socket.broadcast.emit('onChange', rcDiff);
  });
  socket.on('play', () => {
    socket.broadcast.emit('play');
  });
  socket.on('play', () => {
    socket.broadcast.emit('play');
  });
  socket.on('loadShader', passes => {
    socket.broadcast.emit('loadShader', passes);
  });
});

server.listen(PORT, () => {
  console.log('listening on *:', PORT);
});
