import * as THREE from 'three';

export default class KeyLoader {
    texture: THREE.DataTexture;
    private array: Uint8Array;

    constructor() {
        this.array = new Uint8Array(256);
        this.texture = new THREE.DataTexture(
            this.array,
            256,
            1,
            THREE.LuminanceFormat,
            THREE.UnsignedByteType,
        );
    }

    onKeyDown = (e: KeyboardEvent) => {
        if (e.keyCode === 27) {
            // ESC
            this.array.fill(0);
        } else {
            this.array[e.keyCode] = 255;
        }
        this.texture.needsUpdate = true;
    };

    onKeyUp = (e: KeyboardEvent) => {
        this.array[e.keyCode] = 0;
        this.texture.needsUpdate = true;
    };

    enable() {
        document.body.addEventListener('keydown', this.onKeyDown);
        document.body.addEventListener('keyup', this.onKeyUp);
    }

    disable() {
        this.texture.dispose();
        document.body.removeEventListener('keydown', this.onKeyDown);
        document.body.removeEventListener('keyup', this.onKeyUp);
    }
}
