import Veda from 'vedajs';
import View from './view';
import { Rc, RcDiff } from './config';
import { Playable } from './playable';
import { Shader } from './constants';
import * as THREE from 'three';

export default class Player implements Playable {
  _view: View;
  _veda: Veda;
  _textures: { [name: string]: THREE.DataTexture } = {};

  constructor(view: View, rc: Rc, isPlaying: boolean, shader: Shader) {
    this._view = view;
    this._veda = new Veda({ ...rc } as any);
    this._veda.setCanvas(this._view.getCanvas());
    window.addEventListener('resize', this._resize);

    Object.keys(rc.IMPORTED || {}).forEach(key => {
      this._veda.loadTexture(key, rc.IMPORTED[key].PATH, rc.IMPORTED[key].SPEED);
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
    this._veda.stop();
    this._veda.stopSound();
    window.addEventListener('resize', this._resize);
    this._view.destroy();
  }

  _resize = () => {
    this._veda.resize(window.innerWidth, window.innerHeight);
  }

  onChange = ({ newConfig, added, removed }: RcDiff) => {
    console.log('Update config', newConfig);
    // Get paths for videos still in use
    const importedPaths: { [path: string]: boolean } = {};
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
  }

  onChangeSound = async ({ newConfig, added, removed }: RcDiff) => {
    console.log('Update config', newConfig);
    // Get paths for videos still in use
    const importedPaths: { [path: string]: boolean } = {};
    Object.values(newConfig.IMPORTED).forEach(imported => {
      importedPaths[imported.PATH] = true;
    });

    Object.keys(removed.IMPORTED).forEach(key => {
      const path = removed.IMPORTED[key].PATH;
      this._veda.unloadTexture(key, path, !importedPaths[path]);
    });
    await Promise.all(Object.keys(added.IMPORTED || {}).map(key => {
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
  }

  play(): void {
    this._view.show();
    this._veda.play();
  }

  stop(): void {
    this._view.hide();
    this._veda.stop();
  }

  loadShader(shader: Shader): void {
    this._veda.loadShader(shader);
  }

  loadSoundShader(fs: string): void {
    this._veda.loadSoundShader(fs);
  }

  playSound(): void {
    this._veda.playSound();
  }

  stopSound(): void {
    this._veda.stopSound();
  }

  setOsc(name: string, data: number[]): void {
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
    } else {
      data.forEach((d, i) => {
        texture.image.data[i] = d;
      });
      texture.needsUpdate = true;
    }
  }

  Shader(shader: Shader): void {
    this._veda.loadShader(shader);
  }
}
