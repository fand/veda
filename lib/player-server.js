"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var child_process_1 = require("child_process");
var io = require("socket.io-client");
var lodash_1 = require("lodash");
var PlayerServer = (function () {
    function PlayerServer(port, state) {
        var _this = this;
        this.stdout = function (output) {
            atom.notifications.addSuccess(output.toString().trim());
        };
        this.stderr = function (output) {
            atom.notifications.addError(output.toString().trim());
        };
        this.exit = function (code) {
            console.log('[VEDA] Server exited with code', code);
            _this._io.emit('stop');
        };
        this._port = port;
        this._state = state;
        this._server = child_process_1.spawn('node', [path.resolve(__dirname, 'server.js'), port.toString(), this._state.projectPath], {
            cwd: path.resolve(__dirname, '..'),
        });
        this._server.stdout.on('data', this.stdout);
        this._server.stderr.on('data', this.stderr);
        this._server.on('exit', this.exit);
        this._io = io("http://localhost:" + port);
        this._io.on('ready', function () {
            var newState = lodash_1.cloneDeep(_this._state);
            newState.rc.IMPORTED = _this._convertPaths(newState.rc.IMPORTED);
            _this._io.emit('create', newState);
        });
    }
    PlayerServer.prototype.destroy = function () {
        this._io.emit('destroy');
        try {
            this._server.kill();
        }
        catch (e) {
            console.error(e);
        }
    };
    PlayerServer.prototype.onChange = function (_rcDiff) {
        var rcDiff = lodash_1.cloneDeep(_rcDiff);
        rcDiff.newConfig.IMPORTED = this._convertPaths(rcDiff.newConfig.IMPORTED);
        rcDiff.added.IMPORTED = this._convertPaths(rcDiff.added.IMPORTED);
        rcDiff.removed.IMPORTED = this._convertPaths(rcDiff.removed.IMPORTED);
        this._io.emit('onChange', rcDiff);
    };
    PlayerServer.prototype.onChangeSound = function (_rcDiff) {
        var rcDiff = lodash_1.cloneDeep(_rcDiff);
        rcDiff.newConfig.IMPORTED = this._convertPaths(rcDiff.newConfig.IMPORTED);
        rcDiff.added.IMPORTED = this._convertPaths(rcDiff.added.IMPORTED);
        rcDiff.removed.IMPORTED = this._convertPaths(rcDiff.removed.IMPORTED);
        this._io.emit('onChangeSound', rcDiff);
        return Promise.resolve();
    };
    PlayerServer.prototype._convertPaths = function (IMPORTED) {
        var _this = this;
        Object.keys(IMPORTED).forEach(function (key) {
            if (!IMPORTED[key].PATH.match(/^(?:https?:)?\/\//)) {
                var relativePath = path.relative(_this._state.projectPath, IMPORTED[key].PATH);
                IMPORTED[key].PATH = "http://localhost:" + _this._port + "/link/" + relativePath;
            }
        });
        return IMPORTED;
    };
    PlayerServer.prototype.play = function () {
        this._io.emit('play');
    };
    PlayerServer.prototype.stop = function () {
        this._io.emit('stop');
        try {
            this._server.kill();
        }
        catch (e) {
            console.error(e);
        }
        atom.notifications.addSuccess('[VEDA] Server stopped');
    };
    PlayerServer.prototype.loadShader = function (shader) {
        this._io.emit('loadShader', shader);
        this._state.lastShader = shader;
    };
    PlayerServer.prototype.loadSoundShader = function (shader) {
        this._io.emit('loadSoundShader', shader);
    };
    PlayerServer.prototype.playSound = function () {
        this._io.emit('playSound');
    };
    PlayerServer.prototype.stopSound = function () {
        this._io.emit('stopSound');
    };
    PlayerServer.prototype.setOsc = function (name, data) {
        this._io.emit('setOsc', { name: name, data: data });
    };
    return PlayerServer;
}());
exports.default = PlayerServer;
//# sourceMappingURL=player-server.js.map