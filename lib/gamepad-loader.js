/* @flow */
import * as THREE from 'three';

export default class GamepadLoader {
  texture: THREE.DataTexture;
  _array: Uint8Array;
  _isConnected: boolean = false;
  isEnabled: boolean = false;

  constructor() {
    this._array = new Uint8Array(128 * 2);
    this.texture = new THREE.DataTexture(
      this._array,
      128,
      2,
      THREE.LuminanceFormat,
      THREE.UnsignedByteType
    );

    window.addEventListener('gamepadconnected', () => {
      this._isConnected = true;
    });
  }

  update(): void {
    if (!this._isConnected) {
      return;
    }

    Array.from((navigator: any).getGamepads()).forEach((gamepad: any) => {
      if (!gamepad) {
        return;
      }
      gamepad.buttons.forEach((button: any, i: number) => {
        this._array[i] = button.pressed ? 255 : 0;
      });
      gamepad.axes.forEach((axis: any, i: number) => {
        this._array[i + 128] = axis * 128 + 128;
      });
    });

    this.texture.needsUpdate = true;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }
}
