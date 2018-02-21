"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const glslify_1 = require("glslify");
const view_1 = require("./view");
const validator_1 = require("./validator");
const player_1 = require("./player");
const player_server_1 = require("./player-server");
const constants_1 = require("./constants");
const osc_loader_1 = require("./osc-loader");
class GlslLivecoder {
    constructor(config) {
        this._lastShader = constants_1.INITIAL_SHADER;
        this._lastSoundShader = constants_1.INITIAL_SOUND_SHADER;
        this._osc = null;
        this._onAnyChanges = ({ added }) => {
            if (added.glslangValidatorPath) {
                this._glslangValidatorPath = added.glslangValidatorPath;
            }
            if (added.server !== undefined) {
                if (this._player) {
                    this._player.stop();
                }
                const rc = this._config.createRc();
                if (added.server) {
                    this._player = new player_server_1.default(added.server, {
                        rc,
                        isPlaying: this._state.isPlaying,
                        projectPath: this._config.projectPath,
                        lastShader: this._lastShader,
                    });
                }
                else {
                    const view = new view_1.default(atom.workspace.element);
                    this._player = new player_1.default(view, rc, this._state.isPlaying, this._lastShader);
                }
            }
            if (added.osc !== undefined) {
                const port = added.osc;
                const osc = this._osc;
                if (osc && (!port || (osc.port !== parseInt(port.toString(), 10)))) {
                    osc.destroy();
                    this._osc = null;
                }
                if (port && !this._osc) {
                    const oscLoader = new osc_loader_1.default(port);
                    this._osc = oscLoader;
                    oscLoader.on('message', this.onOsc);
                    oscLoader.on('reload', () => this._loadLastShader());
                }
            }
        };
        this._onChange = (rcDiff) => {
            this._onAnyChanges(rcDiff);
            this._player.onChange(rcDiff);
            this._loadLastShader();
        };
        this._onChangeSound = (rcDiff) => {
            this._onAnyChanges(rcDiff);
            this._player.onChangeSound(rcDiff).then(() => {
                this._loadLastSoundShader();
            });
        };
        this.onOsc = (msg) => {
            this._player.setOsc(msg.address, msg.args);
        };
        const rc = config.rc;
        const view = new view_1.default(atom.workspace.element);
        this._player = new player_1.default(view, rc, false, this._lastShader);
        this._config = config;
        this._config.on('change', this._onChange);
        this._config.on('changeSound', this._onChangeSound);
        this._glslangValidatorPath = rc.glslangValidatorPath;
        this._state = {
            isPlaying: false,
        };
    }
    destroy() {
        this._player.destroy();
        if (this._osc) {
            this._osc.destroy();
        }
    }
    toggle() {
        return (this._state.isPlaying ?
            this.stop() :
            this.play());
    }
    play() {
        this._state.isPlaying = true;
        this._player.play();
        this._config.play();
    }
    stop() {
        this._state.isPlaying = false;
        this._player.stop();
        this._config.stop();
        this.stopWatching();
    }
    watchActiveShader() {
        if (this._state.activeEditorDisposer) {
            return;
        }
        this.watchShader();
        this._state.activeEditorDisposer = atom.workspace.onDidChangeActiveTextEditor(() => {
            this.watchShader();
        });
    }
    watchShader() {
        if (this._state.editorDisposer) {
            this._state.editorDisposer.dispose();
            this._state.editorDisposer = null;
        }
        const editor = atom.workspace.getActiveTextEditor();
        this._state.editor = editor;
        this._loadShaderOfEditor(editor);
        if (editor !== undefined) {
            this._state.editorDisposer = editor.onDidStopChanging(() => {
                this._loadShaderOfEditor(editor);
            });
        }
    }
    loadShader() {
        const editor = atom.workspace.getActiveTextEditor();
        this._loadShaderOfEditor(editor);
    }
    loadSoundShader() {
        const editor = atom.workspace.getActiveTextEditor();
        return this._loadShaderOfEditor(editor, true);
    }
    playSound() {
        this.loadSoundShader()
            .then(() => this._player.playSound());
    }
    stopSound() {
        this._player.stopSound();
    }
    _loadLastShader() {
        if (!this._lastShader) {
            return;
        }
        this._player.loadShader(this._lastShader);
    }
    _loadLastSoundShader() {
        if (!this._lastSoundShader) {
            return;
        }
        this._player.loadSoundShader(this._lastSoundShader);
    }
    stopWatching() {
        this._state.editor = null;
        if (this._state.activeEditorDisposer) {
            this._state.activeEditorDisposer.dispose();
            this._state.activeEditorDisposer = null;
        }
        if (this._state.editorDisposer) {
            this._state.editorDisposer.dispose();
            this._state.editorDisposer = null;
        }
    }
    _createPasses(rcPasses, shader, postfix, dirname) {
        if (rcPasses.length === 0) {
            rcPasses.push({});
        }
        const lastPass = rcPasses.length - 1;
        return Promise.all(rcPasses.map((rcPass, i) => __awaiter(this, void 0, void 0, function* () {
            const pass = {
                TARGET: rcPass.TARGET,
                FLOAT: rcPass.FLOAT,
                WIDTH: rcPass.WIDTH,
                HEIGHT: rcPass.HEIGHT,
            };
            if (!rcPass.fs && !rcPass.vs) {
                if (postfix === '.vert' || postfix === '.vs') {
                    pass.vs = shader;
                }
                else {
                    pass.fs = shader;
                }
            }
            else {
                if (rcPass.vs) {
                    pass.vs = yield validator_1.loadFile(this._glslangValidatorPath, path.resolve(dirname, rcPass.vs));
                    if (i === lastPass && (postfix === '.frag' || postfix === '.fs')) {
                        pass.fs = shader;
                    }
                }
                if (rcPass.fs) {
                    pass.fs = yield validator_1.loadFile(this._glslangValidatorPath, path.resolve(dirname, rcPass.fs));
                    if (i === lastPass && (postfix === '.vert' || postfix === '.vs')) {
                        pass.vs = shader;
                    }
                }
            }
            return pass;
        })));
    }
    _loadShaderOfEditor(editor, isSound) {
        if (editor === undefined) {
            return Promise.resolve();
        }
        const filepath = editor.getPath();
        const dirname = path.dirname(filepath);
        const m = (filepath || '').match(/(\.(?:glsl|frag|vert|fs|vs))$/);
        if (!m) {
            console.error('The filename for current doesn\'t seems to be GLSL.');
            return Promise.resolve();
        }
        const postfix = m[1];
        let shader = editor.getText();
        let rc;
        return Promise.resolve()
            .then(() => {
            const headComment = (shader.match(/(?:\/\*)((?:.|\n|\r|\n\r)*?)(?:\*\/)/) || [])[1];
            if (isSound) {
                this._config.setSoundSettingsByString(filepath, headComment);
                rc = this._config.createSoundRc();
            }
            else {
                this._config.setFileSettingsByString(filepath, headComment);
                rc = this._config.createRc();
            }
            if (rc.glslify) {
                shader = glslify_1.default(shader, { basedir: path.dirname(filepath) });
            }
        })
            .then(() => {
            if (!isSound) {
                return validator_1.validator(this._glslangValidatorPath, shader, postfix);
            }
            return;
        })
            .then(() => this._createPasses(rc.PASSES, shader, postfix, dirname))
            .then(passes => {
            if (isSound) {
                this._player.loadSoundShader(shader);
                this._lastSoundShader = shader;
            }
            else {
                this._player.loadShader(passes);
                this._lastShader = passes;
            }
        })
            .catch(e => {
            console.error(e);
        });
    }
}
exports.default = GlslLivecoder;
//# sourceMappingURL=app.js.map