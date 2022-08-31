import * as THREE from 'three';
import GIFPlayer from './gif-player';

interface ICache {
    name: string;
    texture: THREE.Texture;
    gif: GIFPlayer;
}

export default class GifLoader {
    private cache: { [url: string]: ICache | null } = {};

    update() {
        Object.keys(this.cache).forEach((k) => {
            const cache = this.cache[k];
            if (cache) {
                cache.gif.update();
                cache.texture.needsUpdate = true;
            }
        });
    }

    async load(name: string, url: string): Promise<THREE.Texture> {
        const cache = this.cache[url];
        if (cache) {
            return cache.texture;
        }

        const gif = await GIFPlayer.create(url, 1);
        const canvas = gif.getCanvas();

        const texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBAFormat;

        this.cache[url] = { name, texture, gif };

        return texture;
    }

    unload(url: string): void {
        this.cache[url] = null;
    }
}
