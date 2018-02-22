import * as path from 'path';
import { spawn } from 'child_process';
import * as io from 'socket.io-client';
import { cloneDeep } from 'lodash';
import { ChildProcess } from 'child_process';
import { IRc, IRcDiff, IImportedHash } from './config';
import { IPlayable } from './playable';
import { IShader } from './constants';

interface IPlayerState {
    rc: IRc;
    isPlaying: boolean;
    projectPath: string;
    lastShader: IShader;
}

export default class PlayerServer implements IPlayable {
    private port: number;
    private state: IPlayerState;
    private io: any;
    private server: ChildProcess;

    constructor(port: number, state: IPlayerState) {
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
        this.server.stdout.on('data', this.stdout);
        this.server.stderr.on('data', this.stderr);
        this.server.on('exit', this.exit);
        this.io = io(`http://localhost:${port}`);
        this.io.on('ready', () => {
            const newState = cloneDeep(this.state);
            newState.rc.IMPORTED = this.convertPaths(newState.rc.IMPORTED);
            this.io.emit('create', newState);
        });
    }

    destroy() {
        this.io.emit('destroy');
        try {
            this.server.kill();
        } catch (e) {
            console.error(e);
        }
    }

    onChange(_rcDiff: IRcDiff): void {
        const rcDiff = cloneDeep(_rcDiff);

        // Convert paths to URLs
        rcDiff.newConfig.IMPORTED = this.convertPaths(
            rcDiff.newConfig.IMPORTED,
        );
        rcDiff.added.IMPORTED = this.convertPaths(rcDiff.added.IMPORTED);
        rcDiff.removed.IMPORTED = this.convertPaths(rcDiff.removed.IMPORTED);

        this.io.emit('onChange', rcDiff);
    }

    onChangeSound(_rcDiff: IRcDiff): Promise<void> {
        const rcDiff = cloneDeep(_rcDiff);

        // Convert paths to URLs
        rcDiff.newConfig.IMPORTED = this.convertPaths(
            rcDiff.newConfig.IMPORTED,
        );
        rcDiff.added.IMPORTED = this.convertPaths(rcDiff.added.IMPORTED);
        rcDiff.removed.IMPORTED = this.convertPaths(rcDiff.removed.IMPORTED);

        this.io.emit('onChangeSound', rcDiff);

        return Promise.resolve();
    }

    private convertPaths(IMPORTED: IImportedHash) {
        Object.keys(IMPORTED).forEach(key => {
            if (!IMPORTED[key].PATH.match(/^(?:https?:)?\/\//)) {
                // Get relative path from projectPath
                const relativePath = path.relative(
                    this.state.projectPath,
                    IMPORTED[key].PATH,
                );
                IMPORTED[key].PATH = `http://localhost:${
                    this.port
                }/link/${relativePath}`;
            }
        });
        return IMPORTED;
    }

    play() {
        this.io.emit('play');
    }

    stop() {
        this.io.emit('stop');

        try {
            this.server.kill();
        } catch (e) {
            console.error(e);
        }

        atom.notifications.addSuccess('[VEDA] Server stopped');
    }

    loadShader(shader: IShader) {
        this.io.emit('loadShader', shader);
        this.state.lastShader = shader;
    }

    loadSoundShader(shader: string) {
        this.io.emit('loadSoundShader', shader);
    }

    playSound() {
        this.io.emit('playSound');
    }

    stopSound() {
        this.io.emit('stopSound');
    }

    setOsc(name: string, data: number[]) {
        this.io.emit('setOsc', { name, data });
    }

    stdout = (output: Buffer) => {
        atom.notifications.addSuccess(output.toString().trim());
    };

    stderr = (output: Buffer) => {
        atom.notifications.addError(output.toString().trim());
    };

    exit = (code: number) => {
        console.log('[VEDA] Server exited with code', code);
        this.io.emit('stop');
    };
}
