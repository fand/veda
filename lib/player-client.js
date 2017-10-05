/* @flow */
import io from 'socket.io-client';
import Player from './player';
import View from './view';
import type { Pass } from './three-shader';
import type Config, { RcDiff } from './config';

export default class PlayerClient {
  _socket: any;
  _player: Player;
  _wrapper: any = document.body;
  _timer: ?number;

  constructor() {
    this._socket = io({
      autoConnect: false,
    });

    this._socket.on('create', (config: Config) => {
      console.log('received create');
      clearTimeout(this._timer);
      if (!this._player) {
        const view = new View(this._wrapper);
        this._player = new Player(view, config);
      }
    });
    this._socket.on('destroy', () => this._player.destroy());
    this._socket.on('onChange', (rcDiff: RcDiff) => {
      this._player.onChange(rcDiff);
    });
    this._socket.on('play', () => this._player.play());
    this._socket.on('stop', () => this._player.stop());
    this._socket.on('loadShader', (passes: Pass[]) => {
      this._player.loadShader(passes);
    });
    this._socket.on('connect', () => {
      console.log('>> connected', this._socket);
      this.poll();
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
