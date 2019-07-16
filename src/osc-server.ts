#!/usr/bin/env node
import dgram = require('dgram');
import osc = require('osc-min');

// Parse message recursively and print messages
function printMessage(msg: osc.OscMessage): void {
    if (msg.oscType === 'bundle') {
        msg.elements.forEach(printMessage);
    } else {
        const msgToShow = {
            ...msg,
            args: msg.args.map((a): osc.OscValue => a.value),
        };
        console.log(JSON.stringify(msgToShow));
    }
}

{
    const PORT = parseInt(process.argv[2]) || 57121;
    const sock = dgram.createSocket('udp4', (buf: Buffer): void => {
        try {
            printMessage(osc.fromBuffer(buf));
        } catch (e) {
            console.error(e);
        }
    });
    sock.bind(PORT);
}
