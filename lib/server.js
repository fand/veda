#!/usr/bin/env node
"use strict";
{
    var PORT_1 = process.argv[2] || 3000;
    var DIR = process.argv[3];
    var http = require('http');
    var express = require('express');
    var app = express();
    app.use(express.static('./client'));
    app.use('/link', express.static(DIR));
    var server = http.createServer(app);
    var io_1 = require('socket.io')(server);
    io_1.on('connection', function (socket) {
        socket.on('ready', function () {
            socket.broadcast.emit('ready');
        });
        socket.on('create', function (config) {
            socket.broadcast.emit('create', config);
        });
        socket.on('destroy', function () {
            socket.broadcast.emit('destroy');
        });
        socket.on('onChange', function (rcDiff) {
            socket.broadcast.emit('onChange', rcDiff);
        });
        socket.on('play', function () {
            socket.broadcast.emit('play');
        });
        socket.on('stop', function () {
            socket.broadcast.emit('stop');
        });
        socket.on('loadShader', function (passes) {
            socket.broadcast.emit('loadShader', passes);
        });
        socket.on('loadSoundShader', function (shader) {
            socket.broadcast.emit('loadSoundShader', shader);
        });
        socket.on('playSound', function () {
            socket.broadcast.emit('playSound');
        });
        socket.on('stopSound', function () {
            socket.broadcast.emit('stopSound');
        });
        socket.on('setOsc', function (msg) {
            socket.broadcast.emit('setOsc', msg);
        });
    });
    server.listen(PORT_1, function () {
        console.log("[VEDA] Server launched on http://localhost:" + PORT_1 + "/");
    });
}
//# sourceMappingURL=server.js.map