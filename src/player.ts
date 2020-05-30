import Veda from 'vedajs';
import View from './view';
import { Rc, RcDiff } from './config';
import { Playable } from './playable';
import { Shader, OscData, Command, Query } from './constants';
import * as THREE from 'three';

function assertNever(x: never): never {
    throw new Error('Unexpected object: ' + x);
}

export default class Player implements Playable {
    private view: View;
    private veda: Veda;
    private textures: { [name: string]: THREE.DataTexture } = {};

    public constructor(view: View, rc: Rc, isPlaying: boolean, shader: Shader) {
        this.view = view;
        this.veda = new Veda({ ...rc } as any); // eslint-disable-line
        this.veda.setCanvas(this.view.getCanvas());
        window.addEventListener('resize', this.resize);

        Object.keys(rc.IMPORTED || {}).forEach((key): void => {
            this.veda.loadTexture(
                key,
                rc.IMPORTED[key].PATH,
                rc.IMPORTED[key].SPEED,
            );
        });

        this.onChange({
            newConfig: rc,
            added: { ...rc },
            removed: { IMPORTED: {} },
        });

        this.loadShader(shader);

        if (isPlaying) {
            this.play();
        }
    }

    public destroy(): void {
        this.veda.stop();
        this.veda.stopSound();
        window.addEventListener('resize', this.resize);
        this.view.destroy();
    }

    private resize = (): void => {
        this.veda.resize(window.innerWidth, window.innerHeight);
    };

    public onChange = ({ newConfig, added, removed }: RcDiff): void => {
        console.log('Update config', newConfig);
        // Get paths for videos still in use
        const importedPaths: { [path: string]: boolean } = {};
        Object.values(newConfig.IMPORTED).forEach((imported): void => {
            importedPaths[imported.PATH] = true;
        });

        Object.keys(removed.IMPORTED).forEach((key): void => {
            const path = removed.IMPORTED[key].PATH;

            // Unload and remove texture if it's not replaced
            if (added.IMPORTED[key] === undefined) {
                const pathToRemove = !importedPaths[path] ? path : undefined;
                this.veda.unloadTexture(key, pathToRemove);
            }
        });
        Object.keys(added.IMPORTED || {}).forEach((key): void => {
            this.veda.loadTexture(
                key,
                added.IMPORTED[key].PATH,
                added.IMPORTED[key].SPEED,
            );
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
            this.veda.setFftSmoothingTimeConstant(
                added.fftSmoothingTimeConstant,
            );
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

    public command(command: Command): void {
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

    // eslint-disable-next-line
    public query(query: Query): Promise<any> {
        switch (query.type) {
            case 'AUDIO_INPUTS':
                return navigator.mediaDevices
                    .enumerateDevices()
                    .then((devices): MediaDeviceInfo[] =>
                        devices.filter(
                            (device): boolean => device.kind === 'audioinput',
                        ),
                    );
            case 'TIME':
                return Promise.resolve(this.veda.getTime());
            case 'VIDEO_INPUTS':
                return navigator.mediaDevices
                    .enumerateDevices()
                    .then((devices): MediaDeviceInfo[] =>
                        devices.filter(
                            (device): boolean => device.kind === 'videoinput',
                        ),
                    );
            default:
                assertNever(query);
                return Promise.reject();
        }
    }

    private play(): void {
        this.view.show();
        this.veda.play();
    }

    private stop(): void {
        this.view.hide();
        this.veda.stop();
    }

    private loadShader(shader: Shader): void {
        console.log('[VEDA] Updated shader', shader);
        this.veda.loadShader(shader);
    }

    private loadSoundShader(fs: string): void {
        this.veda.loadSoundShader(fs);
    }

    private playSound(): void {
        this.veda.playSound();
    }

    private stopSound(): void {
        this.veda.stopSound();
    }

    private setOsc(oscData: OscData): void {
        const { name, data } = oscData;

        const texture = this.textures[name];
        if (!texture || texture.image.data.length !== data.length) {
            if (texture) {
                texture.dispose();
            }
            const array = new Float32Array(data);
            const newTexture = new THREE.DataTexture(
                array,
                data.length,
                1,
                THREE.LuminanceFormat,
                THREE.FloatType,
            );
            newTexture.needsUpdate = true;
            this.textures[name] = newTexture;
            this.veda.setUniform(name, 't', newTexture);
        } else {
            data.forEach((d, i): void => {
                texture.image.data[i] = d;
            });
            texture.needsUpdate = true;
        }
    }

    private startRecording(): void {
        this.veda.startRecording();
    }

    private stopRecording(): void {
        this.veda.stopRecording();
    }

    private toggleFullscreen(): void {
        this.view.toggleFullscreen();
    }
}
