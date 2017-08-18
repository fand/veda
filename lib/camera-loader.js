/* @flow */
import * as THREE from 'three';

export default class CameraLoader {
  _video: HTMLVideoElement;
  _stream: any;
  texture: THREE.VideoTexture;
  _willPlay: Promise<any>;

  constructor() {
    this._video = document.createElement('video');
    this._video.classList.add('glsl-livecoder-video');
    this._video.loop = true;
    this._video.muted = true;

    (document.body: any).appendChild(this._video);

    this.texture = new THREE.VideoTexture(this._video);
    this.texture.format = THREE.RGBFormat;
  }

  play() {
    this._willPlay = new Promise((resolve, reject) => {
      (navigator: any).webkitGetUserMedia({ video: true }, stream => {
        this._stream = stream;
        this._video.src = window.URL.createObjectURL(stream);
        this._video.play();
        resolve();
      }, err => {
        console.error(err);
        reject();
      });
    });
  }

  stop() {
    this._willPlay.then(() => {
      this._video.pause();
      this._stream.getTracks().forEach(t => t.stop());
    });
  }
}
