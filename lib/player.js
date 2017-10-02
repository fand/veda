/* @flow */
import GlslLivecoderView from './glsl-livecoder-view';
import Config from './config';
import ThreeShader from './three-shader';
import type { Pass } from './three-shader';
import type { RcDiff } from './config';

export default class Player {
  _view: GlslLivecoderView;
  _three: ThreeShader;

  constructor(view: GlslLivecoderView, config: Config) {
    this._view = view;
    const rc = config.createRc();
    this._three = new ThreeShader(rc);
    this._three.setCanvas(this._view.getCanvas());
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
