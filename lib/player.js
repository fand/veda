"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vedajs_1 = require("vedajs");
const THREE = require("three");
class Player {
    constructor(view, rc, isPlaying, shader) {
        this.textures = {};
        this.resize = () => {
            this.veda.resize(window.innerWidth, window.innerHeight);
        };
        this.onChange = ({ newConfig, added, removed }) => {
            console.log('Update config', newConfig);
            const importedPaths = {};
            Object.values(newConfig.IMPORTED).forEach(imported => {
                importedPaths[imported.PATH] = true;
            });
            Object.keys(removed.IMPORTED).forEach(key => {
                const path = removed.IMPORTED[key].PATH;
                this.veda.unloadTexture(key, path, !importedPaths[path]);
            });
            Object.keys(added.IMPORTED || {}).forEach(key => {
                this.veda.loadTexture(key, added.IMPORTED[key].PATH, added.IMPORTED[key].SPEED);
            });
            if (added.vertexMode) {
                this.veda.setVertexMode(added.vertexMode);
            }
            if (added.vertexCount) {
                this.veda.setVertexCount(added.vertexCount);
            }
            if (added.pixelRatio) {
                this.veda.setPixelRatio(added.pixelRatio);
            }
            if (added.frameskip) {
                this.veda.setFrameskip(added.frameskip);
            }
            if (added.fftSize !== undefined) {
                this.veda.setFftSize(added.fftSize);
            }
            if (added.fftSmoothingTimeConstant !== undefined) {
                this.veda.setFftSmoothingTimeConstant(added.fftSmoothingTimeConstant);
            }
            if (added.audio !== undefined) {
                this.veda.toggleAudio(added.audio);
            }
            if (added.midi !== undefined) {
                this.veda.toggleMidi(added.midi);
            }
            if (added.keyboard !== undefined) {
                this.veda.toggleKeyboard(added.keyboard);
            }
            if (added.gamepad !== undefined) {
                this.veda.toggleGamepad(added.gamepad);
            }
            if (added.camera !== undefined) {
                this.veda.toggleCamera(added.camera);
            }
            if (added.soundLength !== undefined) {
                this.veda.setSoundLength(added.soundLength);
            }
        };
        this.view = view;
        this.veda = new vedajs_1.default(Object.assign({}, rc));
        this.veda.setCanvas(this.view.getCanvas());
        window.addEventListener('resize', this.resize);
        Object.keys(rc.IMPORTED || {}).forEach(key => {
            this.veda.loadTexture(key, rc.IMPORTED[key].PATH, rc.IMPORTED[key].SPEED);
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
        this.veda.stop();
        this.veda.stopSound();
        window.addEventListener('resize', this.resize);
        this.view.destroy();
    }
    play() {
        this.view.show();
        this.veda.play();
    }
    stop() {
        this.view.hide();
        this.veda.stop();
    }
    loadShader(shader) {
        this.veda.loadShader(shader);
    }
    loadSoundShader(fs) {
        this.veda.loadSoundShader(fs);
    }
    playSound() {
        this.veda.playSound();
    }
    stopSound() {
        this.veda.stopSound();
    }
    setOsc(name, data) {
        const texture = this.textures[name];
        if (!texture || texture.image.data.length !== data.length) {
            if (texture) {
                texture.dispose();
            }
            const array = new Float32Array(data);
            const newTexture = new THREE.DataTexture(array, data.length, 1, THREE.LuminanceFormat, THREE.FloatType);
            newTexture.needsUpdate = true;
            this.textures[name] = newTexture;
            this.veda.setUniform(name, 't', newTexture);
        }
        else {
            data.forEach((d, i) => {
                texture.image.data[i] = d;
            });
            texture.needsUpdate = true;
        }
    }
    toggleFullscreen() {
        this.view.toggleFullscreen();
    }
    startRecording() {
        this.veda.startRecording();
    }
    stopRecording() {
        this.veda.stopRecording();
    }
}
exports.default = Player;
//# sourceMappingURL=player.js.map