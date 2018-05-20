#!/usr/bin/env node

interface IOscArgs {
  value: string;
}

interface IOsc {
    oscType: 'bundle' | 'message';
    elements: IOsc[];
    args: IOscArgs[];
}

// Parse message recursively and print messages
function printMessage (msg: IOsc) {
    if (msg.oscType === 'bundle') {
        msg.elements.forEach(printMessage);
    }
    else {
        msg.args = msg.args.map((a: any) => a.value);
        console.log(JSON.stringify(msg));
    }
}

{
    const PORT = process.argv[2] || 57121;

    const dgram = require('dgram');
    const osc = require('osc-min');
    const sock = dgram.createSocket('udp4', (buf: any) => {
        try {
            printMessage(osc.fromBuffer(buf));
        } catch (e) {}
    });
    sock.bind(PORT);
}
