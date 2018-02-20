"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const atom_1 = require("atom");
const fs = require("fs");
const which = require("which");
const atom_message_panel_1 = require("atom-message-panel");
class Wrapper {
    constructor(state) {
        this.messages = null;
        console.log(state);
        this.config = new config_1.default(this.getProjectPath(atom), {
            pixelRatio: atom.config.get('veda.pixelRatio'),
            frameskip: atom.config.get('veda.frameskip'),
            vertexMode: atom.config.get('veda.vertexMode'),
            vertexCount: atom.config.get('veda.vertexCount'),
            glslangValidatorPath: atom.config.get('veda.glslangValidatorPath'),
            fftSize: atom.config.get('veda.fftSize'),
            fftSmoothingTimeConstant: atom.config.get('veda.fftSmoothingTimeConstant'),
        });
        this.app = new app_1.default(this.config);
        atom.config.observe('veda.glslangValidatorPath', x => this.setGlslangValidatorPath(x));
        atom.config.observe('veda.pixelRatio', x => this.config.setGlobalSettings({ pixelRatio: x }));
        atom.config.observe('veda.frameskip', x => this.config.setGlobalSettings({ frameskip: x }));
        atom.config.observe('veda.vertexMode', x => this.config.setGlobalSettings({ vertexMode: x }));
        atom.config.observe('veda.vertexCount', x => this.config.setGlobalSettings({ vertexCount: x }));
        atom.config.observe('veda.fftSize', x => this.config.setGlobalSettings({ fftSize: x }));
        atom.config.observe('veda.fftSmoothingTimeConstant', x => this.config.setGlobalSettings({ fftSmoothingTimeConstant: x }));
        this.subscriptions = new atom_1.CompositeDisposable();
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'veda:toggle': () => this.app.toggle(),
            'veda:load-shader': () => this.app.loadShader(),
            'veda:watch-shader': () => this.app.watchShader(),
            'veda:watch-active-shader': () => this.app.watchActiveShader(),
            'veda:stop-watching': () => this.app.stopWatching(),
            'veda:load-sound-shader': () => this.app.playSound(),
            'veda:stop-sound-shader': () => this.app.stopSound(),
        }));
        this.app.play();
    }
    destroy() {
        this.subscriptions.dispose();
        this.app.destroy();
    }
    showError(message) {
        if (!this.messages) {
            this.messages = new atom_message_panel_1.MessagePanelView({
                title: 'veda',
            });
            this.messages.attach();
            this.messages.toggle();
        }
        this.messages.clear();
        this.messages.add(new atom_message_panel_1.PlainMessageView({
            message: message,
            className: 'text-error',
        }));
    }
    hideError() {
        if (this.messages) {
            this.messages.close();
            this.messages = null;
        }
    }
    checkExistence(path) {
        let result = null;
        if (fs.existsSync(path) && fs.statSync(path).isFile()) {
            try {
                fs.accessSync(path, fs.X_OK);
                result = path;
            }
            catch (error) {
                console.log(error);
            }
        }
        else {
            try {
                result = which.sync(path);
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
    setGlslangValidatorPath(glslangValidatorPath) {
        const result = this.checkExistence(glslangValidatorPath);
        if (result) {
            this.hideError();
            this.config.setGlobalSettings({ glslangValidatorPath: result });
        }
        else {
            this.showError(`Unable to locate glslangValidator at '${glslangValidatorPath}'`);
        }
    }
    getProjectPath(atom) {
        const projectPaths = atom.project.getPaths();
        if (projectPaths.length === 0) {
            atom.notifications.addError('[VEDA] No projects found in this window');
            throw new Error('[VEDA] No projects found in this window');
        }
        if (projectPaths.length > 1) {
            atom.notifications.addWarning('[VEDA] There are more than 1 project in this window. <br>veda only recognizes the 1st project.');
        }
        return projectPaths[0];
    }
}
let wrapper = null;
exports.default = {
    config: {
        glslangValidatorPath: {
            title: 'glslangValidator path',
            description: 'VEDA uses glslangValidator. Install it from https://github.com/KhronosGroup/glslang or homebrew.',
            type: 'string',
            default: 'glslangValidator',
            order: 1,
        },
        pixelRatio: {
            title: 'Pixel Ratio',
            description: 'The ratio of pixel per rendering call. Increasing pixel ratio will reduce CPU/GPU load.',
            type: 'number',
            default: 2,
            minimum: 0.5,
            maximum: 8,
            order: 2,
        },
        frameskip: {
            title: 'Frameskip',
            description: 'Increasing frameskip will reduce CPU/GPU load. Default is 2 (= 30 fps).',
            type: 'integer',
            default: 2,
            minimum: 1,
            maximum: 10,
            order: 3,
        },
        vertexCount: {
            title: 'Vertex Count',
            description: 'The number of vertices in vertex shaders.',
            type: 'integer',
            default: 3000,
            minimum: 10,
            maximum: 20000,
            order: 4,
        },
        vertexMode: {
            title: 'Vertex Mode',
            description: 'How to draw vertices.',
            type: 'string',
            default: 'LINE_STRIP',
            enum: [
                { value: 'POINTS', description: 'POINTS' },
                { value: 'LINE_STRIP', description: 'LINE_STRIP' },
                { value: 'LINE_LOOP', description: 'LINE_LOOP' },
                { value: 'LINES', description: 'LINES' },
                { value: 'TRI_STRIP', description: 'TRI_STRIP' },
                { value: 'TRI_FAN', description: 'TRI_FAN' },
                { value: 'TRIANGLES', description: 'TRIANGLES' },
            ],
            order: 5,
        },
        fftSize: {
            title: 'FFT size',
            description: 'Represents the size of the FFT to be used to determine the frequency domain.',
            type: 'integer',
            default: 2048,
            enum: [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768],
            order: 6,
        },
        fftSmoothingTimeConstant: {
            title: 'FFT smoothingTimeConstant',
            description: 'Represents the averaging constant with the last analysis frame.',
            type: 'number',
            default: 0.8,
            minimum: 0,
            maximum: 1,
            order: 7,
        },
    },
    activate(state) {
        require('atom-package-deps').install('veda')
            .then(() => this._activate(state));
    },
    _activate(state) {
        wrapper = new Wrapper(state);
    },
    deactivate() {
        wrapper && wrapper.destroy();
    },
};
//# sourceMappingURL=index.js.map