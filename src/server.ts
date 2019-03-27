#!/usr/bin/env node
{
    const PORT = process.argv[2] || 3000;
    const DIR = process.argv[3];

    const http = require('http');
    const express = require('express');
    const app = express();

    app.use(express.static('./client'));
    app.use('/link', express.static(DIR));

    const server = http.createServer(app);
    const io = require('socket.io')(server);

    io.on('connection', (socket: any) => {
        socket.on('ready', () => {
            socket.broadcast.emit('ready');
        });
        socket.on('create', (config: any) => {
            socket.broadcast.emit('create', config);
        });
        socket.on('destroy', () => {
            socket.broadcast.emit('destroy');
        });
        socket.on('onChange', (rcDiff: any) => {
            socket.broadcast.emit('onChange', rcDiff);
        });
        socket.on('command', (msg: any) => {
            socket.broadcast.emit('command', msg);
        });
    });

    server.listen(PORT, () => {
        console.log(`[VEDA] Server launched on http://localhost:${PORT}/`);
    });
}
