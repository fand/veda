/* @flow */
import path from 'path';
import io from 'socket.io-client';
import { BufferedProcess } from 'atom';
import type { Pass } from './three-shader';
import type { Rc, RcDiff } from './config';
import type { Playable } from './playable';

export default class PlayerServer implements Playable {
  _io: any;
  _server: BufferedProcess;

  constructor(port: number, rc: Rc) {
    this._server = new BufferedProcess({
      command: path.resolve(__dirname, '../server.js'),
      args: [port.toString()],
      stdout: this.stdout,
      stderr: this.stderr,
      exit: this.exit,
      options: {
        cwd: path.resolve(__dirname, '..'),
      },
    });
    this._io = io(`http://localhost:${port}`);
    this._io.on('ready', () => {
      console.log('received ready');
      this._io.emit('create', rc);
    });
  }

  destroy() {
    this._io.emit('destroy');
    try {
      this._server.kill();
    } catch (e) {
      console.error(e);
    }
  }

  onChange(rcDiff: RcDiff) {
    this._io.emit('onChange', rcDiff);
  }

  play() {
    this._io.emit('play');
  }

  stop() {
    this._io.emit('stop');

    try {
      this._server.kill();
    } catch (e) {
      console.error(e);
    }
  }

  loadShader(passes: Pass[]) {
    this._io.emit('loadShader', passes);
  }

  stdout = (output: string) => {
    console.log(`[Live Server] ${output}`);
  }

  stderr = (output: string) => {
    console.error(`[Live Server] ${output}`);
  }

  exit = (code: number) => {
    console.info(`[Live Server] Exited with code ${code}`);
    this.stop();
  }
}
