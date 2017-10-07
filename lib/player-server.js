/* @flow */
import path from 'path';
import crypto from 'crypto';
import io from 'socket.io-client';
import { BufferedProcess } from 'atom';
import type { Pass } from './three-shader';
import type { Rc, RcDiff, ImportedHash } from './config';
import type { Playable } from './playable';

const shasum = crypto.createHash('sha1');

export default class PlayerServer implements Playable {
  _port: number;
  _projectPath: string;
  _io: any;
  _server: BufferedProcess;

  constructor(port: number, rc: Rc, isPlaying: boolean, projectPath: string) {
    this._port = port;
    this._projectPath = projectPath;
    this._server = new BufferedProcess({
      command: path.resolve(__dirname, '../server.js'),
      args: [port.toString(), projectPath],
      stdout: this.stdout,
      stderr: this.stderr,
      exit: this.exit,
      options: {
        cwd: path.resolve(__dirname, '..'),
      },
    });
    this._io = io(`http://localhost:${port}`);
    this._io.on('ready', () => {
      this._io.emit('create', { rc, isPlaying });
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
        const relativePath = path.relative(this._projectPath, IMPORTED[key].PATH);
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

    window.atom.notifications.addSuccess('[glsl-livecoder] Server stopped');
  }

  loadShader(passes: Pass[]) {
    this._io.emit('loadShader', passes);
  }

  stdout = (output: string) => {
    window.atom.notifications.addSuccess(output.trim());
  }

  stderr = (output: string) => {
    window.atom.notifications.addError(output.trim());
  }

  exit = (code: number) => {
    console.log('[glsl-livecoder] Server exited with code', code);
    this._io.emit('stop');
  }
}
