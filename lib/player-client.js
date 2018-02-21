"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io-client");
const player_1 = require("./player");
const view_1 = require("./view");
class PlayerClient {
    constructor() {
        this._player = null;
        this._wrapper = document.body;
        this._timer = null;
        this.poll = () => {
            this._socket.emit('ready');
            this._timer = setTimeout(this.poll, 1000);
        };
        this._socket = io({
            autoConnect: false,
        });
        this._socket.on('create', ({ rc, isPlaying, lastShader }) => {
            if (this._timer) {
                clearTimeout(this._timer);
            }
            if (!this._player) {
                const view = new view_1.default(this._wrapper);
                this._player = new player_1.default(view, rc, isPlaying, lastShader);
            }
        });
        this._socket.on('destroy', () => {
            this._player && this._player.destroy();
        });
        this._socket.on('onChange', (rcDiff) => {
            this._player && this._player.onChange(rcDiff);
        });
        this._socket.on('onChangeSound', (rcDiff) => {
            this._player && this._player.onChangeSound(rcDiff);
        });
        this._socket.on('play', () => this._player && this._player.play());
        this._socket.on('stop', () => this._player && this._player.stop());
        this._socket.on('loadShader', (shader) => {
            console.log('[VEDA] Updated shader', shader);
            this._player && this._player.loadShader(shader);
        });
        this._socket.on('loadSoundShader', (shader) => {
            this._player && this._player.loadSoundShader(shader);
        });
        this._socket.on('playSound', () => this._player && this._player.playSound());
        this._socket.on('stopSound', () => this._player && this._player.stopSound());
        this._socket.on('setOsc', (msg) => {
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
}
exports.default = PlayerClient;
//# sourceMappingURL=player-client.js.map