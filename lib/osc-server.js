#!/usr/bin/env node
"use strict";
{
    var PORT = process.argv[2] || 57121;
    var dgram = require('dgram');
    var osc_1 = require('osc-min');
    var sock = dgram.createSocket('udp4', function (buf) {
        try {
            var msg = osc_1.fromBuffer(buf);
            msg.args = msg.args.map(function (a) { return a.value; });
            console.log(JSON.stringify(msg));
        }
        catch (e) { }
    });
    sock.bind(PORT);
}
//# sourceMappingURL=osc-server.js.map