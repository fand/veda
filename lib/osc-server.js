#!/usr/bin/env node
"use strict";
function printMessage(msg) {
    if (msg.oscType === 'bundle') {
        msg.elements.forEach(printMessage);
    }
    else {
        msg.args = msg.args.map((a) => a.value);
        console.log(JSON.stringify(msg));
    }
}
{
    const PORT = process.argv[2] || 57121;
    const dgram = require('dgram');
    const osc = require('osc-min');
    const sock = dgram.createSocket('udp4', (buf) => {
        try {
            printMessage(osc.fromBuffer(buf));
        }
        catch (e) { }
    });
    sock.bind(PORT);
}
//# sourceMappingURL=osc-server.js.map