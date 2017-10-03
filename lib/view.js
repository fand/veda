/* @flow */

export default class View {
  _wrapper: HTMLElement;
  _element: HTMLElement;
  _canvas: HTMLCanvasElement;

  constructor(wrapper: HTMLElement) {
    this._wrapper = wrapper;

    this._element = document.createElement('div');
    this._element.classList.add('glsl-livecoder');

    this._canvas = document.createElement('canvas');

    this._element.appendChild(this._canvas);
    this._wrapper.appendChild(this._element);
  }

  destroy(): void {
    this._element.remove();
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
