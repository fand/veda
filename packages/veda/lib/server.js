#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const express = require("express");
const socket_io_1 = require("socket.io");
{
    const PORT = process.argv[2] || 3000;
    const DIR = process.argv[3];
    const app = express();
    app.use(express.static('./client'));
    app.use('/link', express.static(DIR));
    const server = http.createServer(app);
    const io = new socket_io_1.Server(server);
    io.on('connection', (socket) => {
        socket.on('ready', () => {
            socket.broadcast.emit('ready');
        });
        socket.on('create', (config) => {
            socket.broadcast.emit('create', config);
        });
        socket.on('destroy', () => {
            socket.broadcast.emit('destroy');
        });
        socket.on('onChange', (rcDiff) => {
            socket.broadcast.emit('onChange', rcDiff);
        });
        socket.on('command', (msg) => {
            socket.broadcast.emit('command', msg);
        });
        socket.on('query', (msg, callback) => {
            var _a;
            const socketIds = Object.keys(io.sockets.sockets).filter((socketId) => socketId !== socket.id);
            if (socketIds.length !== 1) {
                return callback('[VEDA] A unique browser should be open.');
            }
            (_a = io.sockets.sockets.get(socketIds[0])) === null || _a === void 0 ? void 0 : _a.emit('query', msg, callback);
        });
    });
    server.listen(PORT, () => {
        console.log(`[VEDA] Server launched on http://localhost:${PORT}/`);
    });
}
//# sourceMappingURL=server.js.map