"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var vedajs_1 = require("vedajs");
var THREE = require("three");
var Player = (function () {
    function Player(view, rc, isPlaying, shader) {
        var _this = this;
        this._textures = {};
        this._resize = function () {
            _this._veda.resize(window.innerWidth, window.innerHeight);
        };
        this.onChange = function (_a) {
            var newConfig = _a.newConfig, added = _a.added, removed = _a.removed;
            console.log('Update config', newConfig);
            var importedPaths = {};
            Object.values(newConfig.IMPORTED).forEach(function (imported) {
                importedPaths[imported.PATH] = true;
            });
            Object.keys(removed.IMPORTED).forEach(function (key) {
                var path = removed.IMPORTED[key].PATH;
                _this._veda.unloadTexture(key, path, !importedPaths[path]);
            });
            Object.keys(added.IMPORTED || {}).forEach(function (key) {
                _this._veda.loadTexture(key, added.IMPORTED[key].PATH, added.IMPORTED[key].SPEED);
            });
            if (added.vertexMode) {
                _this._veda.setVertexMode(added.vertexMode);
            }
            if (added.vertexCount) {
                _this._veda.setVertexCount(added.vertexCount);
            }
            if (added.pixelRatio) {
                _this._veda.setPixelRatio(added.pixelRatio);
            }
            if (added.frameskip) {
                _this._veda.setFrameskip(added.frameskip);
            }
            if (added.fftSize !== undefined) {
                _this._veda.setFftSize(added.fftSize);
            }
            if (added.fftSmoothingTimeConstant !== undefined) {
                _this._veda.setFftSmoothingTimeConstant(added.fftSmoothingTimeConstant);
            }
            if (added.audio !== undefined) {
                _this._veda.toggleAudio(added.audio);
            }
            if (added.midi !== undefined) {
                _this._veda.toggleMidi(added.midi);
            }
            if (added.keyboard !== undefined) {
                _this._veda.toggleKeyboard(added.keyboard);
            }
            if (added.gamepad !== undefined) {
                _this._veda.toggleGamepad(added.gamepad);
            }
            if (added.camera !== undefined) {
                _this._veda.toggleCamera(added.camera);
            }
        };
        this.onChangeSound = function (_a) {
            var newConfig = _a.newConfig, added = _a.added, removed = _a.removed;
            return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                var importedPaths;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            console.log('Update config', newConfig);
                            importedPaths = {};
                            Object.values(newConfig.IMPORTED).forEach(function (imported) {
                                importedPaths[imported.PATH] = true;
                            });
                            Object.keys(removed.IMPORTED).forEach(function (key) {
                                var path = removed.IMPORTED[key].PATH;
                                _this._veda.unloadTexture(key, path, !importedPaths[path]);
                            });
                            return [4, Promise.all(Object.keys(added.IMPORTED || {}).map(function (key) {
                                    return _this._veda.loadTexture(key, added.IMPORTED[key].PATH, added.IMPORTED[key].SPEED);
                                }))];
                        case 1:
                            _b.sent();
                            if (added.audio !== undefined) {
                                this._veda.toggleAudio(added.audio);
                            }
                            if (added.midi !== undefined) {
                                this._veda.toggleMidi(added.midi);
                            }
                            if (added.keyboard !== undefined) {
                                this._veda.toggleKeyboard(added.keyboard);
                            }
                            if (added.gamepad !== undefined) {
                                this._veda.toggleGamepad(added.gamepad);
                            }
                            if (added.camera !== undefined) {
                                this._veda.toggleCamera(added.camera);
                            }
                            if (added.soundLength !== undefined) {
                                this._veda.setSoundLength(added.soundLength);
                            }
                            return [2];
                    }
                });
            });
        };
        this._view = view;
        this._veda = new vedajs_1.default(__assign({}, rc));
        this._veda.setCanvas(this._view.getCanvas());
        window.addEventListener('resize', this._resize);
        Object.keys(rc.IMPORTED || {}).forEach(function (key) {
            _this._veda.loadTexture(key, rc.IMPORTED[key].PATH, rc.IMPORTED[key].SPEED);
        });
        this.onChange({
            newConfig: rc,
            added: __assign({}, rc),
            removed: { IMPORTED: {} },
        });
        this.loadShader(shader);
        if (isPlaying) {
            this.play();
        }
    }
    Player.prototype.destroy = function () {
        this._veda.stop();
        this._veda.stopSound();
        window.addEventListener('resize', this._resize);
        this._view.destroy();
    };
    Player.prototype.play = function () {
        this._view.show();
        this._veda.play();
    };
    Player.prototype.stop = function () {
        this._view.hide();
        this._veda.stop();
    };
    Player.prototype.loadShader = function (shader) {
        this._veda.loadShader(shader);
    };
    Player.prototype.loadSoundShader = function (fs) {
        this._veda.loadSoundShader(fs);
    };
    Player.prototype.playSound = function () {
        this._veda.playSound();
    };
    Player.prototype.stopSound = function () {
        this._veda.stopSound();
    };
    Player.prototype.setOsc = function (name, data) {
        var texture = this._textures[name];
        if (!texture || texture.image.data.length !== data.length) {
            if (texture) {
                texture.dispose();
            }
            var array = new Float32Array(data);
            var newTexture = new THREE.DataTexture(array, data.length, 1, THREE.LuminanceFormat, THREE.FloatType);
            newTexture.needsUpdate = true;
            this._textures[name] = newTexture;
            this._veda.setUniform(name, 't', newTexture);
        }
        else {
            data.forEach(function (d, i) {
                texture.image.data[i] = d;
            });
            texture.needsUpdate = true;
        }
    };
    Player.prototype.Shader = function (shader) {
        this._veda.loadShader(shader);
    };
    return Player;
}());
exports.default = Player;
//# sourceMappingURL=player.js.map