/* @flow */
import io from 'socket.io-client';
import Player from './player';
import View from './view';
import type { RcDiff } from './config';
import type { Shader } from './constants';

type OscChunk = {
  name: string;
  data: number[];
};

export default class PlayerClient {
  _socket: any;
  _player: Player;
  _wrapper: any = document.body;
  _timer: ?number;

  constructor() {
    this._socket = io({
      autoConnect: false,
    });

    this._socket.on('create', ({ rc, isPlaying, lastShader }) => {
      clearTimeout(this._timer);
      if (!this._player) {
        const view = new View(this._wrapper);
        this._player = new Player(view, rc, isPlaying, lastShader);
      }
    });
    this._socket.on('destroy', () => this._player.destroy());
    this._socket.on('onChange', (rcDiff: RcDiff) => {
      this._player.onChange(rcDiff);
    });
    this._socket.on('play', () => this._player.play());
    this._socket.on('stop', () => this._player.stop());
    this._socket.on('loadShader', (shader: Shader) => {
      console.log('[VEDA] Updated shader', shader);
      this._player.loadShader(shader);
    });
    this._socket.on('setOsc', (msg: OscChunk) => {
      this._player.setOsc(msg.name, msg.data);
    });
    this._socket.on('connect', () => {
      console.log('[VEDA] Connected to the server');
      this.poll();
    });
    this._socket.on('disconnect', () => {
      console.log('[VEDA] Disconnected');
    });
  }

  connect() {
    this._socket.open();
  }

  poll = () => {
    this._socket.emit('ready');
    this._timer = setTimeout(this.poll, 1000);
  }
}
