"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const child_process_1 = require("child_process");
const io = require("socket.io-client");
const lodash_1 = require("lodash");
const utils_1 = require("./utils");
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
            this.io.emit('stop');
        };
        this.port = port;
        this.state = state;
        this.server = child_process_1.spawn('node', [
            path.resolve(__dirname, 'server.js'),
            port.toString(),
            this.state.projectPath,
        ], {
            cwd: path.resolve(__dirname, '..'),
        });
        this.server.stdout.on('data', this.stdout);
        this.server.stderr.on('data', this.stderr);
        this.server.on('exit', this.exit);
        this.io = io(`http://localhost:${port}`);
        this.io.on('ready', () => {
            const newState = lodash_1.cloneDeep(this.state);
            newState.rc.IMPORTED = this.convertPaths(newState.rc.IMPORTED);
            this.io.emit('create', newState);
        });
    }
    destroy() {
        this.io.emit('destroy');
        try {
            this.server.kill();
        }
        catch (e) {
            console.error(e);
        }
    }
    onChange(_rcDiff) {
        const rcDiff = lodash_1.cloneDeep(_rcDiff);
        rcDiff.newConfig.IMPORTED = this.convertPaths(rcDiff.newConfig.IMPORTED);
        rcDiff.added.IMPORTED = this.convertPaths(rcDiff.added.IMPORTED);
        rcDiff.removed.IMPORTED = this.convertPaths(rcDiff.removed.IMPORTED);
        this.io.emit('onChange', rcDiff);
    }
    convertPaths(IMPORTED) {
        Object.keys(IMPORTED).forEach(key => {
            IMPORTED[key].PATH = utils_1.convertPathForServer(this.state.projectPath, this.port, IMPORTED[key].PATH);
        });
        return IMPORTED;
    }
    play() {
        this.io.emit('play');
    }
    stop() {
        this.io.emit('stop');
        try {
            this.server.kill();
        }
        catch (e) {
            console.error(e);
        }
        atom.notifications.addSuccess('[VEDA] Server stopped');
    }
    loadShader(shader) {
        this.io.emit('loadShader', shader);
        this.state.lastShader = shader;
    }
    loadSoundShader(shader) {
        this.io.emit('loadSoundShader', shader);
    }
    playSound() {
        this.io.emit('playSound');
    }
    stopSound() {
        this.io.emit('stopSound');
    }
    setOsc(name, data) {
        this.io.emit('setOsc', { name, data });
    }
    toggleFullscreen() {
        this.io.emit('toggleFullscreen');
    }
}
exports.default = PlayerServer;
//# sourceMappingURL=player-server.js.map