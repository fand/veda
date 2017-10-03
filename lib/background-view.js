/* @flow */

export default class BackgroundView {
  _element: HTMLElement;
  _canvas: HTMLCanvasElement;

  constructor() {
    this._element = document.createElement('div');
    this._element.classList.add('glsl-livecoder');

    this._canvas = document.createElement('canvas');
    this._element.appendChild(this._canvas);
  }

  destroy(): void {
    this._element.remove();
  }

  getElement(): HTMLElement {
    return this._element;
  }

  getCanvas(): HTMLCanvasElement {
    return this._canvas;
  }

  show(): void {
    (document.body: any).classList.add('glsl-livecoder-enabled');
  }

  hide(): void {
    (document.body: any).classList.remove('glsl-livecoder-enabled');
  }
}
