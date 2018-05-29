import Veda from 'vedajs';
import View from './view';
import { IRc, IRcDiff } from './config';
import { IPlayable } from './playable';
import { IShader } from './constants';
import * as THREE from 'three';

export default class Player implements IPlayable {
    private view: View;
    private veda: Veda;
    private textures: { [name: string]: THREE.DataTexture } = {};

    constructor(view: View, rc: IRc, isPlaying: boolean, shader: IShader) {
        this.view = view;
        this.veda = new Veda({ ...rc } as any);
        this.veda.setCanvas(this.view.getCanvas());
        window.addEventListener('resize', this.resize);

        Object.keys(rc.IMPORTED || {}).forEach(key => {
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

    destroy(): void {
        this.veda.stop();
        this.veda.stopSound();
        window.addEventListener('resize', this.resize);
        this.view.destroy();
    }

    private resize = () => {
        this.veda.resize(window.innerWidth, window.innerHeight);
    };

    onChange = ({ newConfig, added, removed }: IRcDiff) => {
        console.log('Update config', newConfig);
        // Get paths for videos still in use
        const importedPaths: { [path: string]: boolean } = {};
        Object.values(newConfig.IMPORTED).forEach(imported => {
            importedPaths[imported.PATH] = true;
        });

        Object.keys(removed.IMPORTED).forEach(key => {
            const path = removed.IMPORTED[key].PATH;
            this.veda.unloadTexture(key, path, !importedPaths[path]);
        });
        Object.keys(added.IMPORTED || {}).forEach(key => {
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

    play(): void {
        this.view.show();
        this.veda.play();
    }

    stop(): void {
        this.view.hide();
        this.veda.stop();
    }

    loadShader(shader: IShader): void {
        this.veda.loadShader(shader);
    }

    loadSoundShader(fs: string): void {
        this.veda.loadSoundShader(fs);
    }

    playSound(): void {
        this.veda.playSound();
    }

    stopSound(): void {
        this.veda.stopSound();
    }

    setOsc(name: string, data: number[]): void {
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
            data.forEach((d, i) => {
                texture.image.data[i] = d;
            });
            texture.needsUpdate = true;
        }
    }

    toggleFullscreen(): void {
        this.view.toggleFullscreen();
    }

    private capture = (): void => {

    }

    startCapture(): void {
        this.veda.on('afterRender', this.capture);
    }

    stopCapture(): void {
        this.veda.off('afterRender', this.capture);
    }
}
