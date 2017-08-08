'use babel';
import * as THREE from 'three';

export default class VideoLoader {
  constructor() {
    this.cache = {};
  }

  load(name, url) {
    const cache = this.cache[url];
    if (cache) {
      return cache.texture;
    }

    const video = document.createElement('video');
    document.body.appendChild(video);

    video.src = url;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.style.top = 999999;

    const texture = new THREE.VideoTexture(video);
    texture.format = THREE.RGBFormat;

    this.cache[url] = { video, texture };

    return texture;
  }

  unload(url) {
    const cache = this.cache[url];
    if (cache) {
      document.body.removeChild(cache.video);
    }
    this.cache[url] = null;
  }
}
