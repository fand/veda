import * as THREE from 'three';

interface ICache {
    name: string;
    video: HTMLVideoElement;
    texture: THREE.VideoTexture;
}

export default class VideoLoader {
    private cache: { [url: string]: ICache | null } = {};

    load(name: string, url: string, speed: number): THREE.VideoTexture {
        const cache = this.cache[url];
        if (cache) {
            cache.video.playbackRate = speed;
            return cache.texture;
        }

        const video = document.createElement('video');
        document.body.appendChild(video);

        video.src = url;
        video.playbackRate = speed;

        video.autoplay = true;
        video.loop = true;
        video.muted = true;

        // XXX: Prevent video stutter caused by Chromium's performance optimization
        video.style.position = 'fixed';
        video.style.top = '0px';
        video.style.left = '0px';
        video.style.width = '10px';
        video.style.height = '10px';
        video.style.transform = 'scale(0.01, 0.01)';
        video.style.opacity = '0.01';

        // Play video manually because "autoplay" attribute is not working now.
        // ref. https://github.com/electron/electron/issues/13525
        video.play();

        const texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBAFormat;

        this.cache[url] = { name, video, texture };

        return texture;
    }

    unload(url: string): void {
        const cache = this.cache[url];
        if (cache) {
            document.body.removeChild(cache.video);
        }
        this.cache[url] = null;
    }
}
