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
const vedajs_1 = require("vedajs");
const THREE = require("three");
class Player {
    constructor(view, rc, isPlaying, shader) {
        this._textures = {};
        this._resize = () => {
            this._veda.resize(window.innerWidth, window.innerHeight);
        };
        this.onChange = ({ newConfig, added, removed }) => {
            console.log('Update config', newConfig);
            const importedPaths = {};
            Object.values(newConfig.IMPORTED).forEach(imported => {
                importedPaths[imported.PATH] = true;
            });
            Object.keys(removed.IMPORTED).forEach(key => {
                const path = removed.IMPORTED[key].PATH;
                this._veda.unloadTexture(key, path, !importedPaths[path]);
            });
            Object.keys(added.IMPORTED || {}).forEach(key => {
                this._veda.loadTexture(key, added.IMPORTED[key].PATH, added.IMPORTED[key].SPEED);
            });
            if (added.vertexMode) {
                this._veda.setVertexMode(added.vertexMode);
            }
            if (added.vertexCount) {
                this._veda.setVertexCount(added.vertexCount);
            }
            if (added.pixelRatio) {
                this._veda.setPixelRatio(added.pixelRatio);
            }
            if (added.frameskip) {
                this._veda.setFrameskip(added.frameskip);
            }
            if (added.fftSize !== undefined) {
                this._veda.setFftSize(added.fftSize);
            }
            if (added.fftSmoothingTimeConstant !== undefined) {
                this._veda.setFftSmoothingTimeConstant(added.fftSmoothingTimeConstant);
            }
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
        };
        this.onChangeSound = ({ newConfig, added, removed }) => __awaiter(this, void 0, void 0, function* () {
            console.log('Update config', newConfig);
            const importedPaths = {};
            Object.values(newConfig.IMPORTED).forEach(imported => {
                importedPaths[imported.PATH] = true;
            });
            Object.keys(removed.IMPORTED).forEach(key => {
                const path = removed.IMPORTED[key].PATH;
                this._veda.unloadTexture(key, path, !importedPaths[path]);
            });
            yield Promise.all(Object.keys(added.IMPORTED || {}).map(key => {
                return this._veda.loadTexture(key, added.IMPORTED[key].PATH, added.IMPORTED[key].SPEED);
            }));
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
        });
        this._view = view;
        this._veda = new vedajs_1.default(Object.assign({}, rc));
        this._veda.setCanvas(this._view.getCanvas());
        window.addEventListener('resize', this._resize);
        Object.keys(rc.IMPORTED || {}).forEach(key => {
            this._veda.loadTexture(key, rc.IMPORTED[key].PATH, rc.IMPORTED[key].SPEED);
        });
        this.onChange({
            newConfig: rc,
            added: Object.assign({}, rc),
            removed: { IMPORTED: {} },
        });
        this.loadShader(shader);
        if (isPlaying) {
            this.play();
        }
    }
    destroy() {
        this._veda.stop();
        this._veda.stopSound();
        window.addEventListener('resize', this._resize);
        this._view.destroy();
    }
    play() {
        this._view.show();
        this._veda.play();
    }
    stop() {
        this._view.hide();
        this._veda.stop();
    }
    loadShader(shader) {
        this._veda.loadShader(shader);
    }
    loadSoundShader(fs) {
        this._veda.loadSoundShader(fs);
    }
    playSound() {
        this._veda.playSound();
    }
    stopSound() {
        this._veda.stopSound();
    }
    setOsc(name, data) {
        const texture = this._textures[name];
        if (!texture || texture.image.data.length !== data.length) {
            if (texture) {
                texture.dispose();
            }
            const array = new Float32Array(data);
            const newTexture = new THREE.DataTexture(array, data.length, 1, THREE.LuminanceFormat, THREE.FloatType);
            newTexture.needsUpdate = true;
            this._textures[name] = newTexture;
            this._veda.setUniform(name, 't', newTexture);
        }
        else {
            data.forEach((d, i) => {
                texture.image.data[i] = d;
            });
            texture.needsUpdate = true;
        }
    }
    Shader(shader) {
        this._veda.loadShader(shader);
    }
}
exports.default = Player;
//# sourceMappingURL=player.js.map