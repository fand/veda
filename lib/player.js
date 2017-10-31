/* @flow */
import Veda from 'vedajs';
import type View from './view';
import type { Rc, RcDiff } from './config';
import type { Playable } from './playable';
import type { Shader } from './constants';

export default class Player implements Playable {
  _view: View;
  _veda: Veda;

  constructor(view: View, rc: Rc, isPlaying: boolean, shader: Shader) {
    this._view = view;
    this._veda = new Veda({ ...rc });
    this._veda.setCanvas(this._view.getCanvas());
    window.addEventListener('resize', this._resize);

    Object.keys(rc.IMPORTED || {}).forEach(key => {
      this._veda.loadTexture(key, rc.IMPORTED[key].PATH);
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
    window.addEventListener('resize', this._resize);
    this._view.destroy();
  }

  _resize = () => {
    this._veda.resize(window.innerWidth, window.innerHeight);
  }

  onChange = ({ newConfig, added, removed }: RcDiff) => {
    console.log('Update config', newConfig);
    // Get paths for videos still in use
    const importedPaths = {};
    Object.values(newConfig.IMPORTED).forEach(imported => {
      importedPaths[(imported: any).PATH] = true;
    });

    Object.keys(removed.IMPORTED).forEach(key => {
      const path = removed.IMPORTED[key].PATH;
      this._veda.unloadTexture(key, path, !importedPaths[path]);
    });
    Object.keys(added.IMPORTED || {}).forEach(key => {
      this._veda.loadTexture(key, added.IMPORTED[key].PATH);
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
}
