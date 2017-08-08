'use babel';
import * as THREE from 'three';

export default class VideoLoader {
  constructor() {
    this.cache = {};
  }

  load(name, url) {
    const cache = this.cache[name];
    if (cache) {
      if (cache.url !== url) {
        cache.video.url = url;
        cache.video.src = url;
      }
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

    this.cache[name] = { url, video, texture };

    return texture;
  }

  // unload(name) {
  //   const cache = this.cache[name];
  //   if (cache) {
  //     cache.texture.dispose();
  //   }
  // }
}
