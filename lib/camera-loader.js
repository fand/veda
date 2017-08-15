/* @flow */
import * as THREE from 'three';

export default class CameraLoader {
  _video: HTMLVideoElement;
  _stream: any;
  texture: THREE.VideoTexture;

  constructor() {
    this._video = document.createElement('video');
    this._video.loop = true;
    this._video.muted = true;

    (document.body: any).appendChild(this._video);

    this.texture = new THREE.VideoTexture(this._video);
    this.texture.format = THREE.RGBFormat;
  }

  play() {
    (navigator: any).webkitGetUserMedia({ video: true }, stream => {
      this._stream = stream;
      this._video.src = window.URL.createObjectURL(stream);
      this._video.play();
    }, err => {
      console.error(err);
    });
  }

  stop() {
    this._video.pause();
    this._stream.getTracks().forEach(t => t.stop());
  }
}
