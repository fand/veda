'use babel';

export default class GlslLivecoderView {
  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('glsl-livecoder');

    this.canvas = document.createElement('canvas');
    this.element.appendChild(this.canvas);

    this.isVisible = false;
  }

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  getCanvas() {
    return this.canvas;
  }

  show() {
    this.isVisible = true;
    document.body.classList.add('glsl-livecoder-enabled');
  }

  hide() {
    this.isVisible = false;
    document.body.classList.remove('glsl-livecoder-enabled');
  }
}
