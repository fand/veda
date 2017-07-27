'use babel';
import * as THREE from 'three';

export default class VideoLoader {
  load(url) {
    const video = document.createElement('video');
    video.src = url;
    video.autoplay = true;
    video.loop = true;
    video.style.top = 999999;
    document.body.appendChild(video);

    const texture = new THREE.VideoTexture(video);
    texture.format = THREE.RGBFormat;

    return texture;
  }
}
