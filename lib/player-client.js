"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var io = require("socket.io-client");
var player_1 = require("./player");
var view_1 = require("./view");
var PlayerClient = (function () {
    function PlayerClient() {
        var _this = this;
        this._player = null;
        this._wrapper = document.body;
        this._timer = null;
        this.poll = function () {
            _this._socket.emit('ready');
            _this._timer = setTimeout(_this.poll, 1000);
        };
        this._socket = io({
            autoConnect: false,
        });
        this._socket.on('create', function (_a) {
            var rc = _a.rc, isPlaying = _a.isPlaying, lastShader = _a.lastShader;
            if (_this._timer) {
                clearTimeout(_this._timer);
            }
            if (!_this._player) {
                var view = new view_1.default(_this._wrapper);
                _this._player = new player_1.default(view, rc, isPlaying, lastShader);
            }
        });
        this._socket.on('destroy', function () {
            _this._player && _this._player.destroy();
        });
        this._socket.on('onChange', function (rcDiff) {
            _this._player && _this._player.onChange(rcDiff);
        });
        this._socket.on('onChangeSound', function (rcDiff) {
            _this._player && _this._player.onChangeSound(rcDiff);
        });
        this._socket.on('play', function () { return _this._player && _this._player.play(); });
        this._socket.on('stop', function () { return _this._player && _this._player.stop(); });
        this._socket.on('loadShader', function (shader) {
            console.log('[VEDA] Updated shader', shader);
            _this._player && _this._player.loadShader(shader);
        });
        this._socket.on('loadSoundShader', function (shader) {
            _this._player && _this._player.loadSoundShader(shader);
        });
        this._socket.on('playSound', function () { return _this._player && _this._player.playSound(); });
        this._socket.on('stopSound', function () { return _this._player && _this._player.stopSound(); });
        this._socket.on('setOsc', function (msg) {
            if (_this._player) {
                _this._player.setOsc(msg.name, msg.data);
            }
        });
        this._socket.on('connect', function () {
            console.log('[VEDA] Connected to the server');
            _this.poll();
        });
        this._socket.on('disconnect', function () {
            console.log('[VEDA] Disconnected');
        });
    }
    PlayerClient.prototype.connect = function () {
        this._socket.open();
    };
    return PlayerClient;
}());
exports.default = PlayerClient;
//# sourceMappingURL=player-client.js.map