import * as path from 'path';
import { spawn } from 'child_process';
import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { OscData } from './constants';

export default class OscLoader extends EventEmitter {
    public port: number;
    private server: ChildProcess;
    private addresses: { [address: string]: boolean } = {};

    public constructor(port: number) {
        super();

        this.port = port;
        this.server = spawn(
            'node',
            [path.resolve(__dirname, 'osc-server.js'), this.port.toString()],
            {
                cwd: path.resolve(__dirname, '..'),
            },
        );
        if (this.server.stdout) {
            this.server.stdout.on('data', this.stdout);
        }
        if (this.server.stderr) {
            this.server.stderr.on('data', this.stderr);
        }
        this.server.on('exit', this.exit);
    }

    public destroy(): void {
        try {
            this.server.kill();
        } catch (e) {
            console.error(e);
        }
    }

    private stdout = (output: Buffer): void => {
        const s = output.toString().trim();
        s.split('\n').forEach((line): void => {
            let msg;
            try {
                msg = JSON.parse(line);
            } catch {
                console.error('Failed to parse stdout:', line);
                return;
            }

            const oscData: OscData = {
                name:
                    'osc_' + msg.address.replace(/^\//, '').replace(/\//g, '_'),
                data: msg.args,
            };

            this.emit('message', oscData);

            // If the address is never used before,
            // VEDA have to reload the last shader to use the texture
            if (!this.addresses[msg.address]) {
                this.addresses[msg.address] = true;
                this.emit('reload');
            }
        });
    };

    private stderr = (output: Buffer): void => {
        console.error(output.toString());
    };

    private exit = (code: number): void => {
        console.log('[VEDA] OSC server exited with code', code);
    };
}
