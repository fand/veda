#!/usr/bin/env node
import http = require('http');
import express = require('express');
import createSocket = require('socket.io');

{
    const PORT = process.argv[2] || 3000;
    const DIR = process.argv[3];

    const app = express();

    app.use(express.static('./client'));
    app.use('/link', express.static(DIR));

    const server = http.createServer(app);
    const io = createSocket(server);

    io.on('connection', (socket): void => {
        socket.on('ready', (): void => {
            socket.broadcast.emit('ready');
        });
        socket.on('create', (config): void => {
            socket.broadcast.emit('create', config);
        });
        socket.on('destroy', (): void => {
            socket.broadcast.emit('destroy');
        });
        socket.on('onChange', (rcDiff): void => {
            socket.broadcast.emit('onChange', rcDiff);
        });
        socket.on('command', (msg): void => {
            socket.broadcast.emit('command', msg);
        });
        socket.on('query', (msg, callback): void => {
            const socketIds = Object.keys(io.sockets.sockets).filter(
                (socketId): boolean => socketId !== socket.id,
            );

            if (socketIds.length !== 1) {
                return callback('[VEDA] A unique browser should be open.');
            }

            io.sockets.sockets[socketIds[0]].emit('query', msg, callback);
        });
    });

    server.listen(PORT, (): void => {
        console.log(`[VEDA] Server launched on http://localhost:${PORT}/`);
    });
}
