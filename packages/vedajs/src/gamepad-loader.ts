import * as THREE from 'three';

export default class GamepadLoader {
    texture: THREE.DataTexture;
    isEnabled = false;

    private array: Uint8Array;
    private isConnected = false;

    constructor() {
        this.array = new Uint8Array(128 * 2);
        this.texture = new THREE.DataTexture(
            this.array,
            128,
            2,
            THREE.LuminanceFormat,
            THREE.UnsignedByteType,
        );

        window.addEventListener('gamepadconnected', () => {
            this.isConnected = true;
        });
    }

    update(): void {
        if (!this.isConnected) {
            return;
        }

        Array.from(navigator.getGamepads()).forEach(
            (gamepad: Gamepad | null) => {
                if (!gamepad) {
                    return;
                }
                gamepad.buttons.forEach((button, i) => {
                    this.array[i] = button.pressed ? 255 : 0;
                });
                gamepad.axes.forEach((axis, i) => {
                    this.array[i + 128] = axis * 128 + 128;
                });
            },
        );

        this.texture.needsUpdate = true;
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
        this.texture.dispose();
    }
}
