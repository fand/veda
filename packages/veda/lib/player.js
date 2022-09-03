"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vedajs_1 = __importDefault(require("vedajs"));
const THREE = __importStar(require("three"));
function assertNever(x) {
    throw new Error('Unexpected object: ' + x);
}
class Player {
    constructor(view, rc, isPlaying, shader) {
        this.textures = {};
        this.resize = () => {
            this.veda.resize(window.innerWidth, window.innerHeight);
        };
        this.onChange = ({ newConfig, added, removed }) => {
            console.log('Update config', newConfig);
            const importedPaths = {};
            Object.values(newConfig.IMPORTED).forEach((imported) => {
                importedPaths[imported.PATH] = true;
            });
            Object.keys(removed.IMPORTED).forEach((key) => {
                const path = removed.IMPORTED[key].PATH;
                if (added.IMPORTED[key] === undefined) {
                    const pathToRemove = !importedPaths[path] ? path : undefined;
                    this.veda.unloadTexture(key, pathToRemove);
                }
            });
            Object.keys(added.IMPORTED || {}).forEach((key) => {
                this.veda
                    .loadTexture(key, added.IMPORTED[key].PATH, added.IMPORTED[key].SPEED)
                    .catch((e) => {
                    console.error(`[VEDA] failed to load texture ${key}`, e);
                });
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
        Object.keys(rc.IMPORTED || {}).forEach((key) => {
            this.veda
                .loadTexture(key, rc.IMPORTED[key].PATH, rc.IMPORTED[key].SPEED)
                .catch((e) => {
                console.error(`[VEDA] failed to load texture ${key}`, e);
            });
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
    command(command) {
        switch (command.type) {
            case 'LOAD_SHADER':
                return this.loadShader(command.shader);
            case 'LOAD_SOUND_SHADER':
                return this.loadSoundShader(command.shader);
            case 'PLAY':
                return this.play();
            case 'PLAY_SOUND':
                return this.playSound();
            case 'SET_OSC':
                return this.setOsc(command.data);
            case 'START_RECORDING':
                return this.startRecording();
            case 'STOP':
                return this.stop();
            case 'STOP_RECORDING':
                return this.stopRecording();
            case 'STOP_SOUND':
                return this.stopSound();
            case 'TOGGLE_FULLSCREEN':
                return this.toggleFullscreen();
            default:
                assertNever(command);
        }
    }
    query(query) {
        switch (query.type) {
            case 'AUDIO_INPUTS':
                return navigator.mediaDevices
                    .enumerateDevices()
                    .then((devices) => devices.filter((device) => device.kind === 'audioinput'));
            case 'TIME':
                return Promise.resolve(this.veda.getTime());
            case 'VIDEO_INPUTS':
                return navigator.mediaDevices
                    .enumerateDevices()
                    .then((devices) => devices.filter((device) => device.kind === 'videoinput'));
            default:
                assertNever(query);
                return Promise.reject();
        }
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
        console.log('[VEDA] Updated shader', shader);
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
    setOsc(oscData) {
        const { name, data } = oscData;
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
    startRecording() {
        this.veda.startRecording();
    }
    stopRecording() {
        this.veda.stopRecording();
    }
    toggleFullscreen() {
        this.view.toggleFullscreen();
    }
}
exports.default = Player;
//# sourceMappingURL=player.js.map