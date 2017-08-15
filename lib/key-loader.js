/* @flow */
import * as THREE from 'three';

export default class KeyLoader {
  texture: THREE.DataTexture;
  _array: Uint8Array;

  constructor() {
    this._array = new Uint8Array(256);
    this.texture = new THREE.DataTexture(
      this._array,
      256,
      1,
      THREE.LuminanceFormat,
      THREE.UnsignedByteType
    );
  }

  onKeyDown = (e: any) => {
    if (e.keyCode === 27) { // ESC
      this._array.fill(0);
    } else {
      this._array[e.keyCode] = 255;
    }
    this.texture.needsUpdate = true;
  }

  onKeyUp = (e: any) => {
    this._array[e.keyCode] = 0;
    this.texture.needsUpdate = true;
  }

  play() {
    (document.body: any).addEventListener('keydown', this.onKeyDown);
    (document.body: any).addEventListener('keyup', this.onKeyUp);
  }

  stop() {
    (document.body: any).removeEventListener('keydown', this.onKeyDown);
    (document.body: any).removeEventListener('keyup', this.onKeyUp);
  }
}
