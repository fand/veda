import * as path from 'path';
import { spawn } from 'child_process';
import { io, Socket } from 'socket.io-client';
import { cloneDeep } from 'lodash';
import { ChildProcess } from 'child_process';
import { Playable } from './playable';
import { convertPathForServer } from './utils';
import type { Rc, RcDiff, ImportedHash } from './types';
import type { Shader, Command, Query, QueryResult } from './constants';

interface PlayerState {
    rc: Rc;
    isPlaying: boolean;
    projectPath: string;
    lastShader: Shader;
}

export default class PlayerServer implements Playable {
    private port: number;
    private state: PlayerState;
    private io: Socket;
    private server: ChildProcess;

    public constructor(port: number, state: PlayerState) {
        this.port = port;
        this.state = state;
        this.server = spawn(
            'node',
            [
                path.resolve(__dirname, 'server.js'),
                port.toString(),
                this.state.projectPath,
            ],
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
        this.io = io(`http://localhost:${port}`);
        this.io.on('ready', (): void => {
            const newState = cloneDeep(this.state);
            newState.rc.IMPORTED = this.convertPaths(newState.rc.IMPORTED);
            this.io.emit('create', newState);
        });
    }

    public destroy(): void {
        this.io.emit('destroy');
        try {
            this.server.kill();
        } catch (e) {
            console.error(e);
        }
    }

    public onChange(_rcDiff: RcDiff): void {
        const rcDiff = cloneDeep(_rcDiff);

        // Convert paths to URLs
        rcDiff.newConfig.IMPORTED = this.convertPaths(
            rcDiff.newConfig.IMPORTED,
        );
        rcDiff.added.IMPORTED = this.convertPaths(rcDiff.added.IMPORTED);
        rcDiff.removed.IMPORTED = this.convertPaths(rcDiff.removed.IMPORTED);

        this.io.emit('onChange', rcDiff);
    }

    public command(command: Command): void {
        this.io.emit('command', command);

        // Do server specific stuffs
        switch (command.type) {
            case 'LOAD_SHADER':
                return this.loadShader(command.shader);
            case 'STOP':
                return this.stop();
        }
    }

    // eslint-disable-next-line
    public query(query: Query): Promise<any> {
        return new Promise<QueryResult>((resolve, reject): void => {
            this.io.emit(
                'query',
                query,
                (err: Error, value: QueryResult): void => {
                    if (err) {
                        return reject(err);
                    } else {
                        return resolve(value);
                    }
                },
            );
        });
    }

    private convertPaths(IMPORTED: ImportedHash): ImportedHash {
        Object.keys(IMPORTED).forEach((key): void => {
            IMPORTED[key].PATH = convertPathForServer(
                this.state.projectPath,
                this.port,
                IMPORTED[key].PATH,
            );
        });
        return IMPORTED;
    }

    private stop(): void {
        try {
            this.server.kill();
        } catch (e) {
            console.error(e);
        }

        atom.notifications.addSuccess('[VEDA] Server stopped');
    }

    private loadShader(shader: Shader): void {
        this.state.lastShader = shader;
    }

    private stdout = (output: Buffer): void => {
        atom.notifications.addSuccess(output.toString().trim());
    };

    private stderr = (output: Buffer): void => {
        atom.notifications.addError(output.toString().trim());
    };

    private exit = (code: number): void => {
        console.log('[VEDA] Server exited with code', code);
        this.io.emit('stop');
    };
}
