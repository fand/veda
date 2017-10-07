#!/usr/bin/env node

// const path = require('path');
const http = require('http');
const express = require('express');
const app = express();

app.use(express.static('./client'));

const server = http.Server(app);
const io = require('socket.io')(server);

const PORT = process.argv[2] || 3000;

io.on('connection', socket => {
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
  console.log(`[glsl-livecoder] Server launched on http://localhost:${PORT}/`);
});
