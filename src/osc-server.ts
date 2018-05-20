#!/usr/bin/env node

interface IMessage {
    oscType: 'bundle' | 'message';
    elements: IMessage[];
    args: { value: string }[];
}

// Parse message recursively and print messages
function printMessage (msg: IMessage) {
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
