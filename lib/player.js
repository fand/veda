/* @flow */
import ThreeShader from './three-shader';
import { INITIAL_FRAGMENT_SHADER } from './constants';
import type View from './view';
import type { Pass } from './three-shader';
import type { Rc, RcDiff } from './config';
import type { Playable } from './playable';

export default class Player implements Playable {
  _view: View;
  _three: ThreeShader;

  constructor(view: View, rc: Rc, isPlaying: boolean) {
    this._view = view;
    this._three = new ThreeShader(rc);
    this._three.setCanvas(this._view.getCanvas());

    Object.keys(rc.IMPORTED || {}).forEach(key => {
      this._three.loadTexture(key, rc.IMPORTED[key].PATH);
    });

    this.loadShader([{
      fs: INITIAL_FRAGMENT_SHADER,
    }]);

    if (isPlaying) {
      this.play();
    }
  }

  destroy(): void {
    this._three.stop();
    this._view.destroy();
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
      this._three.unloadTexture(key, path, !importedPaths[path]);
    });
    Object.keys(added.IMPORTED || {}).forEach(key => {
      this._three.loadTexture(key, added.IMPORTED[key].PATH);
    });
    if (added.vertexMode) {
      this._three.setVertexMode(added.vertexMode);
    }
    if (added.vertexCount) {
      this._three.setVertexCount(added.vertexCount);
    }
    if (added.pixelRatio) {
      this._three.setPixelRatio(added.pixelRatio);
    }
    if (added.frameskip) {
      this._three.setFrameskip(added.frameskip);
    }
    if (added.audio !== undefined) {
      this._three.toggleAudio(added.audio);
    }
    if (added.midi !== undefined) {
      this._three.toggleMidi(added.midi);
    }
    if (added.keyboard !== undefined) {
      this._three.toggleKeyboard(added.keyboard);
    }
    if (added.gamepad !== undefined) {
      this._three.toggleGamepad(added.gamepad);
    }
    if (added.camera !== undefined) {
      this._three.toggleCamera(added.camera);
    }
  }

  play(): void {
    this._view.show();
    this._three.play();
  }

  stop(): void {
    this._view.hide();
    this._three.stop();
  }

  loadShader(passes: Pass[]): void {
    this._three.loadShader(passes);
  }
}
