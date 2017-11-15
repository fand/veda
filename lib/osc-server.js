#!/usr/bin/env node
const PORT = process.argv[2] || 57121;

const osc = require('osc');
const port = new osc.UDPPort({
  localAddress: '0.0.0.0',
  localPort: PORT,
});

port.on('message', msg => {
  console.log(JSON.stringify(msg));
});
port.open();

const onExit = require('signal-exit');
onExit(() => port.close());
