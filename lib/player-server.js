"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const child_process_1 = require("child_process");
const io = require("socket.io-client");
const lodash_1 = require("lodash");
class PlayerServer {
    constructor(port, state) {
        this.stdout = (output) => {
            atom.notifications.addSuccess(output.toString().trim());
        };
        this.stderr = (output) => {
            atom.notifications.addError(output.toString().trim());
        };
        this.exit = (code) => {
            console.log('[VEDA] Server exited with code', code);
            this._io.emit('stop');
        };
        this._port = port;
        this._state = state;
        this._server = child_process_1.spawn('node', [path.resolve(__dirname, 'server.js'), port.toString(), this._state.projectPath], {
            cwd: path.resolve(__dirname, '..'),
        });
        this._server.stdout.on('data', this.stdout);
        this._server.stderr.on('data', this.stderr);
        this._server.on('exit', this.exit);
        this._io = io(`http://localhost:${port}`);
        this._io.on('ready', () => {
            const newState = lodash_1.cloneDeep(this._state);
            newState.rc.IMPORTED = this._convertPaths(newState.rc.IMPORTED);
            this._io.emit('create', newState);
        });
    }
    destroy() {
        this._io.emit('destroy');
        try {
            this._server.kill();
        }
        catch (e) {
            console.error(e);
        }
    }
    onChange(_rcDiff) {
        const rcDiff = lodash_1.cloneDeep(_rcDiff);
        rcDiff.newConfig.IMPORTED = this._convertPaths(rcDiff.newConfig.IMPORTED);
        rcDiff.added.IMPORTED = this._convertPaths(rcDiff.added.IMPORTED);
        rcDiff.removed.IMPORTED = this._convertPaths(rcDiff.removed.IMPORTED);
        this._io.emit('onChange', rcDiff);
    }
    onChangeSound(_rcDiff) {
        const rcDiff = lodash_1.cloneDeep(_rcDiff);
        rcDiff.newConfig.IMPORTED = this._convertPaths(rcDiff.newConfig.IMPORTED);
        rcDiff.added.IMPORTED = this._convertPaths(rcDiff.added.IMPORTED);
        rcDiff.removed.IMPORTED = this._convertPaths(rcDiff.removed.IMPORTED);
        this._io.emit('onChangeSound', rcDiff);
        return Promise.resolve();
    }
    _convertPaths(IMPORTED) {
        Object.keys(IMPORTED).forEach(key => {
            if (!IMPORTED[key].PATH.match(/^(?:https?:)?\/\//)) {
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
        }
        catch (e) {
            console.error(e);
        }
        atom.notifications.addSuccess('[VEDA] Server stopped');
    }
    loadShader(shader) {
        this._io.emit('loadShader', shader);
        this._state.lastShader = shader;
    }
    loadSoundShader(shader) {
        this._io.emit('loadSoundShader', shader);
    }
    playSound() {
        this._io.emit('playSound');
    }
    stopSound() {
        this._io.emit('stopSound');
    }
    setOsc(name, data) {
        this._io.emit('setOsc', { name, data });
    }
}
exports.default = PlayerServer;
//# sourceMappingURL=player-server.js.map