/* @flow */
import * as THREE from 'three';

export default class CameraLoader {
  _video: HTMLVideoElement;
  texture: THREE.VideoTexture;

  constructor() {
    this._video = document.createElement('video');
    this._video.autoplay = true;
    this._video.loop = true;
    this._video.muted = true;

    (document.body: any).appendChild(this._video);

    this.texture = new THREE.VideoTexture(this._video);
    this.texture.format = THREE.RGBFormat;

    (navigator: any).webkitGetUserMedia({ video: true }, stream => {
      this._video.src = window.URL.createObjectURL(stream);
    }, err => {
      console.error(err);
    });
  }
}
