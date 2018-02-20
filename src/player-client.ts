import * as io from 'socket.io-client';
import Player from './player';
import View from './view';
import { Rc, RcDiff } from './config';
import { Shader } from './constants';

type OscChunk = {
  name: string;
  data: number[];
};

interface ICreateOpts {
  rc: Rc;
  isPlaying: boolean;
  lastShader: Shader;
}

export default class PlayerClient {
  _socket: any;
  _player: Player | null = null;
  _wrapper: any = document.body;
  _timer: NodeJS.Timer | null = null;

  constructor() {
    this._socket = io({
      autoConnect: false,
    });

    this._socket.on('create', ({ rc, isPlaying, lastShader }: ICreateOpts) => {
      if (this._timer) {
        clearTimeout(this._timer);
      }
      if (!this._player) {
        const view = new View(this._wrapper);
        this._player = new Player(view, rc, isPlaying, lastShader);
      }
    });
    this._socket.on('destroy', () => {
      this._player && this._player.destroy();
    });
    this._socket.on('onChange', (rcDiff: RcDiff) => {
      this._player && this._player.onChange(rcDiff);
    });
    this._socket.on('onChangeSound', (rcDiff: RcDiff) => {
      this._player && this._player.onChangeSound(rcDiff);
    });
    this._socket.on('play', () => this._player && this._player.play());
    this._socket.on('stop', () => this._player && this._player.stop());
    this._socket.on('loadShader', (shader: Shader) => {
      console.log('[VEDA] Updated shader', shader);
      this._player && this._player.loadShader(shader);
    });
    this._socket.on('loadSoundShader', (shader: string) => {
      this._player && this._player.loadSoundShader(shader);
    });
    this._socket.on('playSound', () => this._player && this._player.playSound());
    this._socket.on('stopSound', () => this._player && this._player.stopSound());
    this._socket.on('setOsc', (msg: OscChunk) => {
      if (this._player) {
        this._player.setOsc(msg.name, msg.data);
      }
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
