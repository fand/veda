"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var glslify_1 = require("glslify");
var view_1 = require("./view");
var validator_1 = require("./validator");
var player_1 = require("./player");
var player_server_1 = require("./player-server");
var constants_1 = require("./constants");
var osc_loader_1 = require("./osc-loader");
var GlslLivecoder = (function () {
    function GlslLivecoder(config) {
        var _this = this;
        this._lastShader = constants_1.INITIAL_SHADER;
        this._lastSoundShader = constants_1.INITIAL_SOUND_SHADER;
        this._osc = null;
        this._onAnyChanges = function (_a) {
            var added = _a.added;
            if (added.glslangValidatorPath) {
                _this._glslangValidatorPath = added.glslangValidatorPath;
            }
            if (added.server !== undefined) {
                if (_this._player) {
                    _this._player.stop();
                }
                var rc = _this._config.createRc();
                if (added.server) {
                    _this._player = new player_server_1.default(added.server, {
                        rc: rc,
                        isPlaying: _this._state.isPlaying,
                        projectPath: _this._config.projectPath,
                        lastShader: _this._lastShader,
                    });
                }
                else {
                    var view = new view_1.default(atom.workspace.element);
                    _this._player = new player_1.default(view, rc, _this._state.isPlaying, _this._lastShader);
                }
            }
            if (added.osc !== undefined) {
                var port = added.osc;
                var osc = _this._osc;
                if (osc && (!port || (osc.port !== parseInt(port.toString(), 10)))) {
                    osc.destroy();
                    _this._osc = null;
                }
                if (port && !_this._osc) {
                    var oscLoader = new osc_loader_1.default(port);
                    _this._osc = oscLoader;
                    oscLoader.on('message', _this.onOsc);
                    oscLoader.on('reload', function () { return _this._loadLastShader(); });
                }
            }
        };
        this._onChange = function (rcDiff) {
            _this._onAnyChanges(rcDiff);
            _this._player.onChange(rcDiff);
            _this._loadLastShader();
        };
        this._onChangeSound = function (rcDiff) {
            _this._onAnyChanges(rcDiff);
            _this._player.onChangeSound(rcDiff).then(function () {
                _this._loadLastSoundShader();
            });
        };
        this.onOsc = function (msg) {
            _this._player.setOsc(msg.address, msg.args);
        };
        var rc = config.rc;
        var view = new view_1.default(atom.workspace.element);
        this._player = new player_1.default(view, rc, false, this._lastShader);
        this._config = config;
        this._config.on('change', this._onChange);
        this._config.on('changeSound', this._onChangeSound);
        this._glslangValidatorPath = rc.glslangValidatorPath;
        this._state = {
            isPlaying: false,
        };
    }
    GlslLivecoder.prototype.destroy = function () {
        this._player.destroy();
        if (this._osc) {
            this._osc.destroy();
        }
    };
    GlslLivecoder.prototype.toggle = function () {
        return (this._state.isPlaying ?
            this.stop() :
            this.play());
    };
    GlslLivecoder.prototype.play = function () {
        this._state.isPlaying = true;
        this._player.play();
        this._config.play();
    };
    GlslLivecoder.prototype.stop = function () {
        this._state.isPlaying = false;
        this._player.stop();
        this._config.stop();
        this.stopWatching();
    };
    GlslLivecoder.prototype.watchActiveShader = function () {
        var _this = this;
        if (this._state.activeEditorDisposer) {
            return;
        }
        this.watchShader();
        this._state.activeEditorDisposer = atom.workspace.onDidChangeActiveTextEditor(function () {
            _this.watchShader();
        });
    };
    GlslLivecoder.prototype.watchShader = function () {
        var _this = this;
        if (this._state.editorDisposer) {
            this._state.editorDisposer.dispose();
            this._state.editorDisposer = null;
        }
        var editor = atom.workspace.getActiveTextEditor();
        this._state.editor = editor;
        this._loadShaderOfEditor(editor);
        if (editor !== undefined) {
            this._state.editorDisposer = editor.onDidStopChanging(function () {
                _this._loadShaderOfEditor(editor);
            });
        }
    };
    GlslLivecoder.prototype.loadShader = function () {
        var editor = atom.workspace.getActiveTextEditor();
        this._loadShaderOfEditor(editor);
    };
    GlslLivecoder.prototype.loadSoundShader = function () {
        var editor = atom.workspace.getActiveTextEditor();
        return this._loadShaderOfEditor(editor, true);
    };
    GlslLivecoder.prototype.playSound = function () {
        var _this = this;
        this.loadSoundShader()
            .then(function () { return _this._player.playSound(); });
    };
    GlslLivecoder.prototype.stopSound = function () {
        this._player.stopSound();
    };
    GlslLivecoder.prototype._loadLastShader = function () {
        if (!this._lastShader) {
            return;
        }
        this._player.loadShader(this._lastShader);
    };
    GlslLivecoder.prototype._loadLastSoundShader = function () {
        if (!this._lastSoundShader) {
            return;
        }
        this._player.loadSoundShader(this._lastSoundShader);
    };
    GlslLivecoder.prototype.stopWatching = function () {
        this._state.editor = null;
        if (this._state.activeEditorDisposer) {
            this._state.activeEditorDisposer.dispose();
            this._state.activeEditorDisposer = null;
        }
        if (this._state.editorDisposer) {
            this._state.editorDisposer.dispose();
            this._state.editorDisposer = null;
        }
    };
    GlslLivecoder.prototype._createPasses = function (rcPasses, shader, postfix, dirname) {
        var _this = this;
        if (rcPasses.length === 0) {
            rcPasses.push({});
        }
        var lastPass = rcPasses.length - 1;
        return Promise.all(rcPasses.map(function (rcPass, i) { return __awaiter(_this, void 0, void 0, function () {
            var pass, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        pass = {
                            TARGET: rcPass.TARGET,
                            FLOAT: rcPass.FLOAT,
                            WIDTH: rcPass.WIDTH,
                            HEIGHT: rcPass.HEIGHT,
                        };
                        if (!(!rcPass.fs && !rcPass.vs)) return [3, 1];
                        if (postfix === '.vert' || postfix === '.vs') {
                            pass.vs = shader;
                        }
                        else {
                            pass.fs = shader;
                        }
                        return [3, 5];
                    case 1:
                        if (!rcPass.vs) return [3, 3];
                        _a = pass;
                        return [4, validator_1.loadFile(this._glslangValidatorPath, path.resolve(dirname, rcPass.vs))];
                    case 2:
                        _a.vs = _c.sent();
                        if (i === lastPass && (postfix === '.frag' || postfix === '.fs')) {
                            pass.fs = shader;
                        }
                        _c.label = 3;
                    case 3:
                        if (!rcPass.fs) return [3, 5];
                        _b = pass;
                        return [4, validator_1.loadFile(this._glslangValidatorPath, path.resolve(dirname, rcPass.fs))];
                    case 4:
                        _b.fs = _c.sent();
                        if (i === lastPass && (postfix === '.vert' || postfix === '.vs')) {
                            pass.vs = shader;
                        }
                        _c.label = 5;
                    case 5: return [2, pass];
                }
            });
        }); }));
    };
    GlslLivecoder.prototype._loadShaderOfEditor = function (editor, isSound) {
        var _this = this;
        if (editor === undefined) {
            return Promise.resolve();
        }
        var filepath = editor.getPath();
        var dirname = path.dirname(filepath);
        var m = (filepath || '').match(/(\.(?:glsl|frag|vert|fs|vs))$/);
        if (!m) {
            console.error('The filename for current doesn\'t seems to be GLSL.');
            return Promise.resolve();
        }
        var postfix = m[1];
        var shader = editor.getText();
        var rc;
        return Promise.resolve()
            .then(function () {
            var headComment = (shader.match(/(?:\/\*)((?:.|\n|\r|\n\r)*?)(?:\*\/)/) || [])[1];
            if (isSound) {
                _this._config.setSoundSettingsByString(filepath, headComment);
                rc = _this._config.createSoundRc();
            }
            else {
                _this._config.setFileSettingsByString(filepath, headComment);
                rc = _this._config.createRc();
            }
            if (rc.glslify) {
                shader = glslify_1.default(shader, { basedir: path.dirname(filepath) });
            }
        })
            .then(function () {
            if (!isSound) {
                return validator_1.validator(_this._glslangValidatorPath, shader, postfix);
            }
            return;
        })
            .then(function () { return _this._createPasses(rc.PASSES, shader, postfix, dirname); })
            .then(function (passes) {
            if (isSound) {
                _this._player.loadSoundShader(shader);
                _this._lastSoundShader = shader;
            }
            else {
                _this._player.loadShader(passes);
                _this._lastShader = passes;
            }
        })
            .catch(function (e) {
            console.error(e);
        });
    };
    return GlslLivecoder;
}());
exports.default = GlslLivecoder;
//# sourceMappingURL=app.js.map