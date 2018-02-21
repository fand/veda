#!/usr/bin/env node
{
    const PORT = process.argv[2] || 57121;

    const dgram = require('dgram');
    const osc = require('osc-min');
    const sock = dgram.createSocket('udp4', (buf: any) => {
        try {
            const msg = osc.fromBuffer(buf);
            msg.args = msg.args.map((a: any) => a.value);
            console.log(JSON.stringify(msg));
        } catch (e) {}
    });
    sock.bind(PORT);
}
