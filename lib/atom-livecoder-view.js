'use babel';
import ThreeShader from './three-shader';

const fragment = `
precision mediump float;
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main() {
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	gl_FragColor = vec4(uv,0.5+0.5*sin(time),1.0);
}
`;

export default class AtomLivecoderView {

  constructor(serializedState) {
    this.element = document.createElement('div');
    this.element.classList.add('atom-livecoder');

    this.style = document.createElement('style');
    this.style.innerHTML = `
      body, atom-workspace, .header *, .footer *, atom-workspace-axis :not(.cursor), atom-workspace *:before {
        background: transparent !important;
        border: none !important;
      }
      .line > span {
        background: rgba(0,0,0,0.7) !important;
      }
    `;

    this.canvas = document.createElement('canvas');
    this.element.appendChild(this.canvas);

    this.isVisible = false;
  }

  initShader() {
    this.three = new ThreeShader(4, 3);
    this.three.setCanvas(this.canvas);
    // this.three.loadTexture(texture);
    this.three.loadShader(fragment);
  }

  serialize() {}

  destroy() {
    this.three.stop();
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  show() {
    if (!this.three) {
      this.initShader();
    }

    this.isVisible = true;
    this.element.style.display = 'block';
    this.three.play();
    this.element.appendChild(this.style);
  }

  hide() {
    this.isVisible = false;
    this.element.style.display = 'none';
    this.three.stop();
    this.element.removeChild(this.style);
  }

}
