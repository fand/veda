/* @flow */
import path from 'path';
import { spawn } from 'child_process';
import io from 'socket.io-client';
import { cloneDeep } from 'lodash';
import type { ChildProcess } from 'child_process';
import type { Rc, RcDiff, ImportedHash } from './config';
import type { Playable } from './playable';
import type { Shader } from './constants';

type PlayerState = {
  rc: Rc;
  isPlaying: boolean;
  projectPath: string;
  lastShader: Shader;
}

export default class PlayerServer implements Playable {
  _port: number;
  _state: PlayerState;
  _io: any;
  _server: ChildProcess;

  constructor(port: number, state: PlayerState) {
    this._port = port;
    this._state = state;
    this._server = spawn('node', [path.resolve(__dirname, 'server.js'), port.toString(), this._state.projectPath], {
      cwd: path.resolve(__dirname, '..'),
    });
    this._server.stdout.on('data', this.stdout);
    this._server.stderr.on('data', this.stderr);
    this._server.on('exit', this.exit);
    this._io = io(`http://localhost:${port}`);
    this._io.on('ready', () => {
      const newState = cloneDeep(this._state);
      newState.rc.IMPORTED = this._convertPaths(newState.rc.IMPORTED);
      this._io.emit('create', newState);
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

  onChange(_rcDiff: RcDiff) {
    const rcDiff = cloneDeep(_rcDiff);

    // Convert paths to URLs
    rcDiff.newConfig.IMPORTED = this._convertPaths(rcDiff.newConfig.IMPORTED);
    rcDiff.added.IMPORTED = this._convertPaths(rcDiff.added.IMPORTED);
    rcDiff.removed.IMPORTED = this._convertPaths(rcDiff.removed.IMPORTED);

    this._io.emit('onChange', rcDiff);
  }

  _convertPaths(IMPORTED: ImportedHash) {
    Object.keys(IMPORTED).forEach(key => {
      if (!IMPORTED[key].PATH.match(/^(?:https?:)?\/\//)) {
        // Get relative path from projectPath
        const relativePath = path.relative(this._state.projectPath, IMPORTED[key].PATH);
        IMPORTED[key].PATH = `http://localhost:${this._port}/link/${relativePath}`;
      }
    });
    return IMPORTED;
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

    window.atom.notifications.addSuccess('[VEDA] Server stopped');
  }

  loadShader(shader: Shader) {
    this._io.emit('loadShader', shader);
    this._state.lastShader = shader;
  }

  setOsc(name: string, data: number[]) {
    this._io.emit('setOsc', { name, data });
  }

  stdout = (output: Buffer) => {
    window.atom.notifications.addSuccess(output.toString().trim());
  }

  stderr = (output: Buffer) => {
    window.atom.notifications.addError(output.toString().trim());
  }

  exit = (code: number) => {
    console.log('[VEDA] Server exited with code', code);
    this._io.emit('stop');
  }
}
