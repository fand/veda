/* @flow */
import * as THREE from 'three';

interface ICache {
  video: HTMLVideoElement;
  texture: THREE.VideoTexture;
}

export default class VideoLoader {
  _cache: { [url: string]: ?ICache };

  constructor() {
    this._cache = {};
  }

  load(name: string, url: string): THREE.VideoTexture {
    const cache = this._cache[url];
    if (cache) {
      return cache.texture;
    }

    const video = document.createElement('video');
    (document.body: any).appendChild(video);

    video.classList.add('glsl-livecoder-video');
    video.src = url;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;

    const texture = new THREE.VideoTexture(video);
    texture.format = THREE.RGBFormat;

    this._cache[url] = { video, texture };

    return texture;
  }

  unload(url: string): void {
    const cache = this._cache[url];
    if (cache) {
      (document.body: any).removeChild(cache.video);
    }
    this._cache[url] = null;
  }
}
